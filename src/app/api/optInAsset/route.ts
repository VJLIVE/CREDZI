import { NextRequest, NextResponse } from 'next/server';
import algosdk from 'algosdk';

// Initialize Algorand client
const getAlgodClient = () => {
  const algodToken = '';
  const algodServer = process.env.NEXT_PUBLIC_ALGORAND_NODE_URL || 'https://testnet-api.algonode.cloud';
  const algodPort = '';
  
  return new algosdk.Algodv2(algodToken, algodServer, algodPort);
};

/**
 * Submits signed asset opt-in transaction to the Algorand network
 */
const submitSignedTransaction = async (signedTxnBase64: string) => {
  try {
    const algodClient = getAlgodClient();
    
    // Decode the signed transaction
    const signedTxn = new Uint8Array(Buffer.from(signedTxnBase64, 'base64'));
    
    console.log('Submitting opt-in transaction to blockchain...');
    
    // Submit the transaction
    const txnResult = await algodClient.sendRawTransaction(signedTxn).do();
    
    console.log('Opt-in transaction submitted, waiting for confirmation. TxID:', txnResult.txid);
    
    // Wait for confirmation
    const confirmedTxn = await algosdk.waitForConfirmation(
      algodClient,
      txnResult.txid,
      4
    );
    
    console.log('Opt-in transaction confirmed in round:', confirmedTxn.confirmedRound);
    
    return {
      txId: txnResult.txid,
      confirmedRound: confirmedTxn.confirmedRound,
    };
  } catch (error) {
    console.error('Detailed error submitting opt-in transaction:', error);
    
    // Provide more specific error information
    if (error instanceof Error) {
      if (error.message.includes('overspend')) {
        throw new Error('Insufficient funds in learner wallet for opt-in transaction');
      } else if (error.message.includes('asset not found')) {
        throw new Error('Asset does not exist or invalid asset ID');
      } else if (error.message.includes('already opted in')) {
        throw new Error('Learner wallet has already opted into this asset');
      }
    }
    
    throw new Error(`Failed to submit opt-in transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export async function POST(req: NextRequest) {
  try {
    const {
      assetId,
      signedTransaction,
      learnerWallet,
    } = await req.json();

    // Validate required fields
    if (!assetId || !signedTransaction || !learnerWallet) {
      return NextResponse.json(
        { error: 'Missing required fields: assetId, signedTransaction, learnerWallet' },
        { status: 400 }
      );
    }

    // Submit the signed opt-in transaction to Algorand
    const transactionResult = await submitSignedTransaction(signedTransaction);

    return NextResponse.json({
      success: true,
      transactionId: transactionResult.txId,
      confirmedRound: transactionResult.confirmedRound,
      message: 'Asset opt-in successful',
    });

  } catch (error) {
    console.error('Error in optInAsset:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: 'Failed to opt into asset'
      },
      { status: 500 }
    );
  }
}