import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Certificate from '@/models/Certificate';

export async function POST(req: NextRequest) {
  try {
    const { certificateId, transferredToLearner } = await req.json();

    if (!certificateId) {
      return NextResponse.json(
        { error: 'Certificate ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    console.log(`Manually updating certificate ${certificateId} status to: ${transferredToLearner}`);

    const updatedCertificate = await Certificate.findByIdAndUpdate(
      certificateId,
      {
        transferredToLearner: transferredToLearner,
        transferredAt: transferredToLearner ? new Date() : null,
      },
      { new: true }
    );

    if (!updatedCertificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    console.log('Certificate updated successfully:', {
      id: updatedCertificate._id,
      transferredToLearner: updatedCertificate.transferredToLearner,
      transferredAt: updatedCertificate.transferredAt
    });

    return NextResponse.json({
      success: true,
      certificate: updatedCertificate,
      message: 'Certificate status updated successfully'
    });

  } catch (error) {
    console.error('Error updating certificate status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}