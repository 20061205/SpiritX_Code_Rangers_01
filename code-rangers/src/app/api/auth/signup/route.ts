import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectMongo from '@/lib/dbconfig';
import User from '@/models/user';

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, username, password } = await req.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !username || !password) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectMongo();

    // Check if email already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return NextResponse.json(
        { message: 'Username already taken' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      username,
      password: hashedPassword,
     
    });

    // Remove password from response
    const userResponse = {
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      username: newUser.username,
      
    };

    return NextResponse.json(
      { message: 'User created successfully', user: userResponse },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating user:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        { message: 'Validation error', errors: validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}