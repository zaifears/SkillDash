// app/api/admin/recharge/route.ts
// Server-side admin recharge approval/rejection with atomic Firestore operations

import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { verifyAdminAccess } from '@/lib/utils/adminVerification';

// Ensure Firebase Admin is initialized with full credentials
// coinManagerServer initializes the app on import
import '@/lib/coinManagerServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 🔒 Verify admin access via Firebase custom claims
    const adminCheck = await verifyAdminAccess(req);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, requestId, userId, coins, userName, rejectionReason } = body;

    if (!action || !requestId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: action, requestId' },
        { status: 400 }
      );
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const db = getFirestore();
    const requestRef = db.collection('recharge_requests').doc(requestId);

    // ─────────────────────────────────────────────
    // REJECT
    // ─────────────────────────────────────────────
    if (action === 'reject') {
      // Verify request exists and is still pending
      const requestDoc = await requestRef.get();
      if (!requestDoc.exists) {
        return NextResponse.json(
          { success: false, error: 'Recharge request not found' },
          { status: 404 }
        );
      }

      const requestData = requestDoc.data();
      if (requestData?.status !== 'pending') {
        return NextResponse.json(
          { success: false, error: `Request is already ${requestData?.status}` },
          { status: 409 }
        );
      }

      await requestRef.update({
        status: 'rejected',
        processedAt: FieldValue.serverTimestamp(),
        processedBy: adminCheck.uid,
        rejectionReason: rejectionReason || 'No reason provided',
      });

      return NextResponse.json({
        success: true,
        message: `Request from ${userName || 'user'} rejected`,
      });
    }

    // ─────────────────────────────────────────────
    // APPROVE — Atomic transaction
    // ─────────────────────────────────────────────
    if (!userId || !coins || typeof coins !== 'number' || coins <= 0) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid fields: userId, coins' },
        { status: 400 }
      );
    }

    // Cap maximum coins per request (safety valve)
    const MAX_COINS_PER_REQUEST = 5_000_000; // 5M coins = 5,000 BDT
    if (coins > MAX_COINS_PER_REQUEST) {
      return NextResponse.json(
        { success: false, error: `Coins exceed maximum per request (${MAX_COINS_PER_REQUEST.toLocaleString()})` },
        { status: 400 }
      );
    }

    const appId = process.env.NEXT_PUBLIC_SIMULATOR_APP_ID || 'skilldash-dse-v1';
    const simulatorStateRef = db.doc(`artifacts/${appId}/users/${userId}/simulator/state`);

    // Run as a Firestore transaction — either both writes succeed or neither does
    await db.runTransaction(async (transaction) => {
      // 1. Read the request doc inside the transaction (ensures consistency)
      const requestDoc = await transaction.get(requestRef);
      if (!requestDoc.exists) {
        throw new Error('Recharge request not found');
      }

      const requestData = requestDoc.data();
      if (requestData?.status !== 'pending') {
        throw new Error(`Request is already ${requestData?.status}. Cannot approve.`);
      }

      // 2. Read the simulator state (may not exist yet for new users)
      const stateDoc = await transaction.get(simulatorStateRef);

      // 3. Credit coins to simulator balance
      if (stateDoc.exists) {
        transaction.update(simulatorStateRef, {
          balance: FieldValue.increment(coins),
        });
      } else {
        // User has no simulator state yet — create with recharge amount as initial balance
        transaction.set(simulatorStateRef, {
          balance: coins,
          createdAt: FieldValue.serverTimestamp(),
          createdBy: 'admin-recharge',
        });
      }

      // 4. Mark request as approved
      transaction.update(requestRef, {
        status: 'approved',
        processedAt: FieldValue.serverTimestamp(),
        processedBy: adminCheck.uid,
      });
    });

    console.log(
      `✅ Admin ${adminCheck.uid} approved recharge: ${coins.toLocaleString()} coins → user ${userId} (request ${requestId})`
    );

    return NextResponse.json({
      success: true,
      message: `Approved! ${coins.toLocaleString()} coins credited to ${userName || userId}`,
    });
  } catch (error: any) {
    console.error('❌ Admin recharge error:', error);

    // Return specific error for known transaction failures
    if (error.message?.includes('already')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process recharge request' },
      { status: 500 }
    );
  }
}
