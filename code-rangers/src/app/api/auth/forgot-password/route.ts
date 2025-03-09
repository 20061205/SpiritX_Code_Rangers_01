import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/dbconfig';
import User from '@/models/user';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Store OTPs temporarily (in production, use Redis or similar)
const otpStore = new Map<string, { otp: string; timestamp: number }>();

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Request OTP
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    await connectMongo();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { message: 'No account found with this email' },
        { status: 404 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with timestamp (expires in 10 minutes)
    otpStore.set(email, {
      otp,
      timestamp: Date.now() + 10 * 60 * 1000, // 10 minutes expiry
    });

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <h1>Password Reset Request</h1>
        <p>Your OTP for password reset is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    return NextResponse.json(
      { message: 'OTP sent successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in forgot password:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Verify OTP and Reset Password
export async function PUT(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Verify OTP
    const storedOTPData = otpStore.get(email);
    if (!storedOTPData || storedOTPData.otp !== otp) {
      return NextResponse.json(
        { message: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (Date.now() > storedOTPData.timestamp) {
      otpStore.delete(email);
      return NextResponse.json(
        { message: 'OTP has expired' },
        { status: 400 }
      );
    }

    await connectMongo();

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password in database
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Clear OTP
    otpStore.delete(email);

    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in reset password:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 