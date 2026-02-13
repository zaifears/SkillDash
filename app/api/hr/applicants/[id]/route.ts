// app/api/hr/applicants/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let hrDb: Firestore | null = null;

const getHRFirestore = () => {
  if (hrDb) return hrDb;
  
  // Check if env vars are available
  if (!process.env.HR_FIREBASE_PROJECT_ID || !process.env.HR_FIREBASE_CLIENT_EMAIL || !process.env.HR_FIREBASE_PRIVATE_KEY) {
    throw new Error('HR Firebase environment variables not configured');
  }
  
  const apps = getApps();
  const hrAppExists = apps.some(app => app.name === 'hr-admin');
  
  if (hrAppExists) {
    hrDb = getFirestore(getApp('hr-admin'));
    return hrDb;
  }

  const hrServiceAccount = {
    projectId: process.env.HR_FIREBASE_PROJECT_ID,
    clientEmail: process.env.HR_FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.HR_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  const hrAdminApp = initializeApp(
    { credential: cert(hrServiceAccount) },
    'hr-admin'
  );

  hrDb = getFirestore(hrAdminApp);
  return hrDb;
};

// PATCH /api/hr/applicants/[id] - Update applicant status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getHRFirestore();
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status, rating, notes } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['applied', 'reviewed', 'shortlisted', 'rejected', 'hired'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    const updates: any = {
      status,
      updatedAt: new Date()
    };

    if (rating !== undefined) updates.rating = rating;
    if (notes !== undefined) updates.notes = notes;

    await db.collection('job_applicants').doc(id).update(updates);

    return NextResponse.json({
      success: true,
      message: 'Applicant updated successfully'
    });
  } catch (error) {
    console.error('Error updating applicant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update applicant' },
      { status: 500 }
    );
  }
}

// GET /api/hr/applicants/[id] - Get applicant details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getHRFirestore();
    const { id } = await params;
    const doc = await db.collection('job_applicants').doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Applicant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data()
      }
    });
  } catch (error) {
    console.error('Error fetching applicant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applicant' },
      { status: 500 }
    );
  }
}
