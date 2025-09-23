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

    // Count certificates where learnerWallet matches and transferredToLearner is true
    const count = await Certificate.countDocuments({
      learnerWallet: walletId,
      transferredToLearner: true
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching certificates count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificates count' },
      { status: 500 }
    );
  }
}