// app/api/hr/job-postings/route.ts
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

// GET /api/hr/job-postings
export async function GET(request: NextRequest) {
  try {
    const db = getHRFirestore();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const collectionRef = db.collection('job_postings');
    let query: Query | CollectionReference = collectionRef;

    // Filter by status if provided
    if (status) {
      query = query.where('status', '==', status);
    }

    // Order by most recent
    query = query.orderBy('postedDate', 'desc');

    // Pagination
    const snapshot = await query.limit(limit).offset(offset).get();
    const jobs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get total count
    const countSnapshot = await query.get();
    const total = countSnapshot.size;

    return NextResponse.json({
      success: true,
      data: jobs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching job postings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch job postings' },
      { status: 500 }
    );
  }
}

// POST /api/hr/job-postings
export async function POST(request: NextRequest) {
  try {
    const db = getHRFirestore();
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      company,
      description,
      location,
      type,
      requirements,
      budget,
      salaryRange,
      postedBy,
      applicants = 0
    } = body;

    // Validate required fields
    if (!title || !company || !location || !type || !postedBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const jobPosting = {
      title,
      company,
      description: description || '',
      location,
      type,
      requirements: requirements || [],
      budget: budget || null,
      salaryRange: salaryRange || null,
      status: 'active',
      postedBy,
      postedDate: new Date(),
      applicants,
      views: 0,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection('job_postings').add(jobPosting);

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...jobPosting
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating job posting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create job posting' },
      { status: 500 }
    );
  }
}
