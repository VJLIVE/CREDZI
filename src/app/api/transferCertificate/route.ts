import { NextRequest, NextResponse } from 'next/server';
import algosdk from 'algosdk';
import connectToDatabase from '@/lib/mongodb';
import Certificate from '@/models/Certificate';

// Initialize Algorand client
const getAlgodClient = () => {
  const algodToken = '';
  const algodServer = process.env.NEXT_PUBLIC_ALGORAND_NODE_URL || 'https://testnet-api.algonode.cloud';
  const algodPort = '';
  
  return new algosdk.Algodv2(algodToken, algodServer, algodPort);
};

/**
 * Submits signed asset transfer transaction to the Algorand network
 */
const submitSignedTransaction = async (signedTxnBase64: string) => {
  try {
    const algodClient = getAlgodClient();
    
    // Decode the signed transaction
    const signedTxn = new Uint8Array(Buffer.from(signedTxnBase64, 'base64'));
    
    console.log('Submitting transfer transaction to blockchain...');
    
    // Submit the transaction
    const txnResult = await algodClient.sendRawTransaction(signedTxn).do();
    
    console.log('Transaction submitted, waiting for confirmation. TxID:', txnResult.txid);
    
    // Wait for confirmation
    const confirmedTxn = await algosdk.waitForConfirmation(
      algodClient,
      txnResult.txid,
      4
    );
    
    console.log('Transaction confirmed in round:', confirmedTxn.confirmedRound);
    
    return {
      txId: txnResult.txid,
      confirmedRound: Number(confirmedTxn.confirmedRound),
    };
  } catch (error) {
    console.error('Detailed error submitting transaction:', error);
    
    // Provide more specific error information
    if (error instanceof Error) {
      if (error.message.includes('overspend')) {
        throw new Error('Insufficient funds in organization wallet');
      } else if (error.message.includes('asset not found')) {
        throw new Error('Asset does not exist or invalid asset ID');
      } else if (error.message.includes('not opted in')) {
        throw new Error('Learner wallet has not opted into this asset');
      } else if (error.message.includes('insufficient balance')) {
        throw new Error('Organization does not have the asset to transfer');
      }
    }
    
    throw new Error(`Failed to submit transaction to blockchain: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export async function POST(req: NextRequest) {
  try {
    const {
      certificateId,
      signedTransaction,
      learnerWallet,
    } = await req.json();

    // Validate required fields
    if (!certificateId || !signedTransaction || !learnerWallet) {
      return NextResponse.json(
        { error: 'Missing required fields: certificateId, signedTransaction, learnerWallet' },
        { status: 400 }
      );
    }

    // Submit the signed transaction to Algorand
    const transactionResult = await submitSignedTransaction(signedTransaction);

    // Connect to database
    await connectToDatabase();

    console.log(`Attempting to update certificate ${certificateId} with transfer info...`);

    // Update the certificate record with transfer information
    const updatedCertificate = await Certificate.findByIdAndUpdate(
      certificateId,
      {
        transferTxId: transactionResult.txId,
        transferredToLearner: true,
        transferredAt: new Date(),
        learnerWallet: learnerWallet,
      },
      { new: true }
    );

    console.log('Certificate update result:', {
      found: !!updatedCertificate,
      id: certificateId,
      transferredToLearner: updatedCertificate?.transferredToLearner,
      transferTxId: updatedCertificate?.transferTxId
    });

    if (!updatedCertificate) {
      console.error(`Certificate with ID ${certificateId} not found in database`);
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      certificate: updatedCertificate,
      transactionId: transactionResult.txId,
      confirmedRound: Number(transactionResult.confirmedRound),
      message: 'Certificate successfully transferred to learner',
    });

  } catch (error) {
    console.error('Error in transferCertificate:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: 'Failed to transfer certificate to learner'
      },
      { status: 500 }
    );
  }
}