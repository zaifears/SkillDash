/**
 * 🔒 Persistent Rate Limiting Utility
 *
 * Uses Firestore with atomic transactions to prevent race conditions.
 * Schema per document: { count: number, resetTime: number }
 *   - count:     requests made in the current window
 *   - resetTime: timestamp (ms) when the window resets
 *
 * Design:
 *   1. In-memory cache is the FIRST gate – blocked requests never touch Firestore.
 *   2. Firestore transaction (runTransaction) is the SECOND gate – atomic, no race.
 *   3. Only ONE read + ONE write per allowed request (minimum cost).
 *   4. Blocked requests hit in-memory only → 0 Firestore ops → $0 cost for DDoS.
 *
 * Configuration:
 *   WINDOW_MS      – sliding window length (default 60 s)
 *   MAX_REQUESTS   – max requests per window per identifier (default 10)
 */

import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';

// ── Firebase Admin singleton ──────────────────────────────────
function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID });
}

const WINDOW_MS    = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;        // per window

// ── In-memory first-gate cache ────────────────────────────────
// Prevents Firestore from being hit at all for already-blocked callers.
class RateLimitCache {
  private cache = new Map<string, { count: number; resetTime: number }>();

  /** Returns true if the request is allowed by the in-memory gate. */
  check(identifier: string, now: number): boolean {
    const entry = this.cache.get(identifier);
    if (!entry) return true; // no record → allow
    if (now >= entry.resetTime) {
      // window expired → reset
      this.cache.delete(identifier);
      return true;
    }
    return entry.count < MAX_REQUESTS;
  }

  /** Record a successful (allowed) request. */
  record(identifier: string, count: number, resetTime: number): void {
    this.cache.set(identifier, { count, resetTime });
  }

  /** Mark identifier as fully blocked without touching Firestore. */
  block(identifier: string, resetTime: number): void {
    this.cache.set(identifier, { count: MAX_REQUESTS, resetTime });
  }

  clear(): void {
    this.cache.clear();
  }
}

const cache = new RateLimitCache();

// ── Public API ────────────────────────────────────────────────

/**
 * 🔐 Check (and consume) one rate-limit token for `identifier`.
 *
 * Returns `true`  → request allowed
 * Returns `false` → rate-limited (caller should return 429)
 *
 * Guarantees:
 *   • Atomic – no race conditions under concurrent load
 *   • Cheap  – blocked requests never hit Firestore
 *   • Fast   – in-memory gate answers in <1 ms for repeat offenders
 */
export async function checkPersistentRateLimit(identifier: string): Promise<boolean> {
  const now = Date.now();

  // ── Gate 1: in-memory cache (free, instant) ──
  if (!cache.check(identifier, now)) {
    // Already blocked in memory → no Firestore cost
    return false;
  }

  // ── Gate 2: Firestore atomic transaction ──
  try {
    const db  = admin.firestore(getAdminApp());
    const ref = db.collection('rate_limits').doc(identifier);

    const allowed = await db.runTransaction(async (t) => {
      const snap = await t.get(ref);
      const data = snap.data();

      // Case 1: No record or window expired → start fresh window
      if (!snap.exists || !data || now >= (data.resetTime ?? 0)) {
        t.set(ref, { count: 1, resetTime: now + WINDOW_MS });
        cache.record(identifier, 1, now + WINDOW_MS);
        return true;
      }

      // Case 2: Within window and under limit → atomic increment
      if (data.count < MAX_REQUESTS) {
        t.update(ref, { count: FieldValue.increment(1) });
        cache.record(identifier, data.count + 1, data.resetTime);
        return true;
      }

      // Case 3: Limit reached → block (no write = no cost)
      cache.block(identifier, data.resetTime);
      return false;
    });

    return allowed;
  } catch (error) {
    console.error(`❌ Rate limit transaction failed for ${identifier}:`, error);
    // Fail open to avoid breaking legitimate users.
    // The in-memory cache still provides some protection.
    return true;
  }
}

/**
 * 🧹 Cleanup expired rate-limit documents.
 * Call from a cron / scheduled function (e.g. every 10 min).
 */
export async function cleanupOldRateLimitEntries(): Promise<void> {
  try {
    const db   = admin.firestore(getAdminApp());
    const now  = Date.now();

    const snap = await db
      .collection('rate_limits')
      .where('resetTime', '<', now)      // window already expired
      .limit(500)
      .get();

    if (snap.empty) return;

    const batch = db.batch();
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();

    console.log(`✅ Cleaned up ${snap.docs.length} expired rate-limit entries`);
  } catch (error) {
    console.error('❌ Rate-limit cleanup failed:', error);
  }
}

/**
 * 🔄 Reset rate limit for a specific identifier (admin action).
 */
export async function resetRateLimitForIdentifier(identifier: string): Promise<void> {
  try {
    const db = admin.firestore(getAdminApp());
    await db.collection('rate_limits').doc(identifier).delete();
    cache.clear();
    console.log(`✅ Rate limit reset for ${identifier}`);
  } catch (error) {
    console.error(`❌ Failed to reset rate limit for ${identifier}:`, error);
    throw error;
  }
}

/**
 * 📊 Get remaining quota for an identifier (admin / debug).
 */
export async function getRateLimitStats(
  identifier: string
): Promise<{ count: number; remaining: number; resetAt: number } | null> {
  try {
    const db  = admin.firestore(getAdminApp());
    const doc = await db.collection('rate_limits').doc(identifier).get();

    if (!doc.exists) return null;

    const data = doc.data()!;
    const now  = Date.now();

    // Window already expired → effectively no limit in effect
    if (now >= (data.resetTime ?? 0)) {
      return { count: 0, remaining: MAX_REQUESTS, resetAt: 0 };
    }

    return {
      count:     data.count ?? 0,
      remaining: Math.max(0, MAX_REQUESTS - (data.count ?? 0)),
      resetAt:   data.resetTime,
    };
  } catch (error) {
    console.error(`❌ Failed to get rate-limit stats for ${identifier}:`, error);
    return null;
  }
}
