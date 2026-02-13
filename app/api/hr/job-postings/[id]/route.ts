// app/api/hr/job-postings/[id]/route.ts
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

// GET /api/hr/job-postings/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getHRFirestore();
    const { id } = await params;
    const doc = await db.collection('job_postings').doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Job posting not found' },
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
    console.error('Error fetching job posting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch job posting' },
      { status: 500 }
    );
  }
}

// PATCH /api/hr/job-postings/[id]
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
    const { status, featured, title, description, requirements } = body;

    const updates: any = {
      updatedAt: new Date()
    };

    if (status) {
      const validStatuses = ['active', 'closed', 'draft'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status' },
          { status: 400 }
        );
      }
      updates.status = status;
    }

    if (featured !== undefined) updates.featured = featured;
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (requirements) updates.requirements = requirements;

    await db.collection('job_postings').doc(id).update(updates);

    return NextResponse.json({
      success: true,
      message: 'Job posting updated successfully'
    });
  } catch (error) {
    console.error('Error updating job posting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update job posting' },
      { status: 500 }
    );
  }
}

// DELETE /api/hr/job-postings/[id]
export async function DELETE(
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

    await db.collection('job_postings').doc(id).delete();

    return NextResponse.json({
      success: true,
      message: 'Job posting deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job posting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete job posting' },
      { status: 500 }
    );
  }
}
