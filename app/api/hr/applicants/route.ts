// app/api/hr/applicants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getFirestore, Query, CollectionReference, Firestore } from 'firebase-admin/firestore';

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

// GET /api/hr/applicants
export async function GET(request: NextRequest) {
  try {
    const db = getHRFirestore();
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const collectionRef = db.collection('job_applicants');
    let query: Query | CollectionReference = collectionRef;

    // Filter by job if provided
    if (jobId) {
      query = query.where('jobId', '==', jobId);
    }

    // Filter by status if provided
    if (status) {
      query = query.where('status', '==', status);
    }

    // Order by most recent
    query = query.orderBy('appliedDate', 'desc');

    const snapshot = await query.limit(limit).offset(offset).get();
    const applicants = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      data: applicants,
      pagination: {
        total: snapshot.size,
        limit,
        offset
      }
    });
  } catch (error) {
    console.error('Error fetching applicants:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applicants' },
      { status: 500 }
    );
  }
}

// POST /api/hr/applicants - Submit application
export async function POST(request: NextRequest) {
  try {
    const db = getHRFirestore();
    const body = await request.json();
    const {
      jobId,
      candidateName,
      email,
      phone,
      resume,
      coverLetter,
      linkedinUrl,
      portfolioUrl,
      userId
    } = body;

    if (!jobId || !candidateName || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if candidate already applied
    const existingApp = await db.collection('job_applicants')
      .where('jobId', '==', jobId)
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!existingApp.empty) {
      return NextResponse.json(
        { success: false, error: 'You have already applied for this job' },
        { status: 409 }
      );
    }

    const application = {
      jobId,
      candidateName,
      email,
      phone: phone || '',
      resume: resume || '',
      coverLetter: coverLetter || '',
      linkedinUrl: linkedinUrl || '',
      portfolioUrl: portfolioUrl || '',
      userId: userId || null,
      status: 'applied',
      rating: null,
      notes: '',
      appliedDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection('job_applicants').add(application);

    // Update job applicant count
    const jobRef = db.collection('job_postings').doc(jobId);
    await jobRef.update({
      applicants: (await jobRef.get()).data()?.applicants + 1 || 1
    });

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...application
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}
