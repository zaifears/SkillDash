import { NextRequest, NextResponse } from 'next/server';

interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { token, action } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'reCAPTCHA token is required' },
        { status: 400 }
      );
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      console.error('CRITICAL: reCAPTCHA secret key not configured!')
      // In production, this should fail - bots could exploit this
      // Only allow bypass in development environment
      if (process.env.NODE_ENV === 'development') {
        console.warn('Development mode: Bypassing reCAPTCHA verification')
        return NextResponse.json({ success: true, score: 1.0, skipped: true });
      }
      return NextResponse.json(
        { success: false, error: 'Security configuration error. Please try again later.' },
        { status: 500 }
      );
    }

    // Verify with Google reCAPTCHA
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify`;
    
    const response = await fetch(verificationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const data: RecaptchaResponse = await response.json();

    if (!data.success) {
      console.error('reCAPTCHA verification failed:', data['error-codes']);
      return NextResponse.json(
        { success: false, error: 'reCAPTCHA verification failed', errorCodes: data['error-codes'] },
        { status: 400 }
      );
    }

    // For reCAPTCHA v3, check the score (0.0 - 1.0)
    // Score threshold: 0.5 is recommended (higher = more likely human)
    const score = data.score ?? 1.0;
    const threshold = 0.5;

    if (score < threshold) {
      console.warn(`reCAPTCHA score too low: ${score} (threshold: ${threshold})`);
      return NextResponse.json(
        { success: false, error: 'Suspicious activity detected. Please try again.', score },
        { status: 400 }
      );
    }

    // Verify action matches (optional but recommended)
    if (action && data.action && data.action !== action) {
      console.warn(`reCAPTCHA action mismatch: expected ${action}, got ${data.action}`);
      return NextResponse.json(
        { success: false, error: 'Invalid reCAPTCHA action' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      score: data.score,
      action: data.action,
      hostname: data.hostname,
    });

  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify reCAPTCHA' },
      { status: 500 }
    );
  }
}
