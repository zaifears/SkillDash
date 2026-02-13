import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// Force Node.js runtime for file handling
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Configuration
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const TARGET_FOLDER_ID = '14qqySIpPOnzdEE1tJIuke-w7VH4BJ6MW';

// Rate limiting (simple in-memory store)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // Max 10 uploads per minute per IP

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetTime - now) / 1000) };
  }

  entry.count++;
  return { allowed: true };
}

// Initialize Google Drive API with service account
function getGoogleDriveClient() {
  const credentials = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_CERT_URL,
  };

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  return google.drive({ version: 'v3', auth });
}

// Sanitize filename
function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts and dangerous characters
  const sanitized = filename
    .replace(/[/\\:*?"<>|]/g, '_')
    .replace(/\.\./g, '_')
    .trim();
  
  // Add timestamp prefix to ensure uniqueness
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const extension = sanitized.split('.').pop() || 'pdf';
  const baseName = sanitized.replace(/\.[^/.]+$/, '');
  
  return `${timestamp}_${baseName.substring(0, 50)}.${extension}`;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    
    const rateLimitResult = checkRateLimit(ip);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: `Too many uploads. Please try again in ${rateLimitResult.retryAfter} seconds.` },
        { status: 429 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension !== 'pdf') {
        return NextResponse.json(
          { error: 'Only PDF files are allowed' },
          { status: 400 }
        );
      }
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return NextResponse.json(
        { error: `File is too large (${sizeMB}MB). Maximum allowed size is 2MB.` },
        { status: 400 }
      );
    }

    // Check required environment variables
    if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
      console.error('Missing Google service account credentials');
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get sanitized filename
    const safeFilename = sanitizeFilename(file.name);

    // Upload to Google Drive
    const drive = getGoogleDriveClient();

    // Create a readable stream from the buffer
    const { Readable } = require('stream');
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);

    const response = await drive.files.create({
      requestBody: {
        name: safeFilename,
        parents: [TARGET_FOLDER_ID],
      },
      media: {
        mimeType: 'application/pdf',
        body: readable,
      },
      fields: 'id, name, webViewLink',
    });

    console.log(`✅ File uploaded successfully: ${response.data.name} (ID: ${response.data.id})`);

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully! Thank you for your submission.',
      fileId: response.data.id,
      fileName: response.data.name,
    });

  } catch (error: any) {
    console.error('❌ Upload error:', error);

    // Handle specific Google API errors
    if (error.code === 403) {
      return NextResponse.json(
        { error: 'Permission denied. The service account may not have access to the target folder.' },
        { status: 403 }
      );
    }

    if (error.code === 404) {
      return NextResponse.json(
        { error: 'Target folder not found. Please contact support.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upload file. Please try again later.' },
      { status: 500 }
    );
  }
}

// Handle other methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to upload files.' },
    { status: 405 }
  );
}
