import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectMongo from '@/lib/dbconfig';
import User from '@/models/user';

export const POST = async (req: NextRequest) => {
  try {
    const { email, firstName, lastName, password, role, passcode, profilePicture, contact } = await req.json();

    await connectMongo();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return new NextResponse(JSON.stringify({ error: 'User already exists' }), { status: 400 });
    }

    if ((role === "Instructor" || role === "Admin") && passcode !== "your_admin_passcode") {
      return new NextResponse(JSON.stringify({ error: 'Invalid passcode' }), { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: { firstName, lastName },
      email,
      password: hashedPassword,
      role,
      profilePicture,
      contact,
    });

    await newUser.save();

    return new NextResponse(JSON.stringify({ message: 'User created successfully' }), { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};