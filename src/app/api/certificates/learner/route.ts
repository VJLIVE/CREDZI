import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Certificate from '@/models/Certificate';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletId = searchParams.get('walletId');

    if (!walletId) {
      return NextResponse.json(
        { error: 'Wallet ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Fetch all certificates where learnerWallet matches and transferredToLearner is true
    const certificates = await Certificate.find({
      learnerWallet: walletId,
      transferredToLearner: true
    }).sort({ transferredAt: -1 }); // Sort by most recent first

    return NextResponse.json({ certificates });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificates' },
      { status: 500 }
    );
  }
}