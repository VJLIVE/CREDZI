import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { firstName, lastName, email, role, walletId } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }

    // Validate wallet ID is provided
    if (!walletId) {
      return NextResponse.json(
        { error: 'Wallet connection is required' },
        { status: 400 }
      );
    }

    // Check if user already exists by email or wallet
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { walletId: walletId }
      ]
    });
    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        );
      } else {
        return NextResponse.json(
          { error: 'This wallet is already connected to another account' },
          { status: 409 }
        );
      }
    }

    const newUser = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      role: role || 'learner',
      walletId,
    });

    const savedUser = await newUser.save();

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: savedUser._id,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          email: savedUser.email,
          role: savedUser.role,
          walletId: savedUser.walletId,
          createdAt: savedUser.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Signup error:', error);
    const err = error as Error & { code?: number; name?: string; errors?: Record<string, { message: string }> };

    if (err.code === 11000) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors || {}).map(
        (validationErr) => validationErr.message
      );
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}