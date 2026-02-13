/**
 * 🔒 Centralized Admin Verification Utility
 * 
 * Ensures all admin endpoints use consistent security checks
 * Uses Firebase custom claims (set via Firebase Admin SDK)
 */

import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps } from 'firebase-admin/app';
import { NextRequest, NextResponse } from 'next/server';

function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }
  return initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

/**
 * Verify that the request is from an authenticated admin user
 * 
 * Returns { isAdmin: true, uid: string } or { isAdmin: false, error: string }
 */
export async function verifyAdminAccess(req: NextRequest): Promise<
  { isAdmin: true; uid: string } | { isAdmin: false; error: string }
> {
  try {
    // Extract bearer token from Authorization header
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return {
        isAdmin: false,
        error: 'Missing or invalid Authorization header. Expected: Bearer <token>',
      };
    }

    const token = authHeader.substring(7).trim();

    // Initialize admin app and verify token
    const adminApp = getAdminApp();
    const adminAuth = getAuth(adminApp);

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error: any) {
      return {
        isAdmin: false,
        error: `Invalid token: ${error.message}`,
      };
    }

    // Check for admin custom claim.
    // Custom claims are cryptographically signed by Google – if the token
    // passes verifyIdToken and contains `admin: true`, it is trustworthy.
    // No secondary Firestore lookup needed (saves ~100-200 ms per request).
    if (decodedToken.admin !== true) {
      console.warn(`⚠️ User ${decodedToken.uid} attempted admin access without admin claim`);
      return {
        isAdmin: false,
        error: 'User does not have admin privileges',
      };
    }

    return {
      isAdmin: true,
      uid: decodedToken.uid,
    };
  } catch (error: any) {
    console.error('❌ Admin verification error:', error);
    return {
      isAdmin: false,
      error: 'Internal server error during authentication',
    };
  }
}

/**
 * Middleware wrapper for admin-only endpoints
 * 
 * Usage:
 * export async function POST(req: NextRequest) {
 *   const adminCheck = await verifyAdminAccess(req);
 *   if (!adminCheck.isAdmin) {
 *     return NextResponse.json({ error: adminCheck.error }, { status: 401 });
 *   }
 *   // Admin code here...
 * }
 */
export const adminAuthMiddleware = async (req: NextRequest) => {
  const result = await verifyAdminAccess(req);
  
  if (!result.isAdmin) {
    return NextResponse.json(
      { 
        success: false, 
        error: result.error,
        timestamp: new Date().toISOString()
      },
      { status: 401 }
    );
  }
  
  return null; // Proceed with request
};

/**
 * 🆕 Helper to set admin custom claim for a user
 * Run this once when promoting a user to admin
 * 
 * Usage (in a secure admin panel):
 * await setAdminClaim('user_uid', true);
 */
export async function setAdminClaim(uid: string, isAdmin: boolean): Promise<void> {
  const adminApp = getAdminApp();
  const adminAuth = getAuth(adminApp);

  await adminAuth.setCustomUserClaims(uid, { admin: isAdmin });
  console.log(`✅ Admin claim ${isAdmin ? 'granted' : 'revoked'} for user ${uid}`);
}

/**
 * Get admin status of a user
 */
export async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    const adminApp = getAdminApp();
    const adminAuth = getAuth(adminApp);
    
    const user = await adminAuth.getUser(uid);
    return user.customClaims?.admin === true;
  } catch (error) {
    console.error(`Failed to check admin status for ${uid}:`, error);
    return false;
  }
}
