'use client';

import algosdk from 'algosdk';
import { PeraWalletConnect } from '@perawallet/connect';

export interface TransactionPrepareParams {
  issuerWallet: string;
  learnerWallet: string;
  ipfsHash: string;
  assetName: string;
  unitName: string;
}

export interface SignedTransactionResult {
  signedTxn: string; // Base64 encoded signed transaction
  txId: string;
}

// Initialize Algorand client
const getAlgodClient = () => {
  const algodToken = '';
  const algodServer = process.env.NEXT_PUBLIC_ALGORAND_NODE_URL || 'https://testnet-api.algonode.cloud';
  const algodPort = '';
  
  return new algosdk.Algodv2(algodToken, algodServer, algodPort);
};

/**
 * Prepares an asset creation transaction
 */
export const prepareAssetCreationTransaction = async (params: TransactionPrepareParams) => {
  const { issuerWallet, ipfsHash, assetName, unitName } = params;
  
  try {
    const algodClient = getAlgodClient();
    
    // Get suggested parameters
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    // Create asset creation transaction
    const assetCreateTxn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      suggestedParams: suggestedParams,
      sender: issuerWallet,
      total: 1, // NFT should have total supply of 1
      decimals: 0, // NFTs should have 0 decimals
      assetName: assetName,
      unitName: unitName,
      assetURL: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
      assetMetadataHash: undefined,
      defaultFrozen: false,
      freeze: undefined,
      manager: issuerWallet,
      reserve: issuerWallet,
      clawback: undefined,
    });

    return assetCreateTxn;
  } catch (error) {
    console.error('Error preparing transaction:', error);
    throw new Error('Failed to prepare transaction for signing');
  }
};

/**
 * Prepares an asset opt-in transaction for the learner
 */
export const prepareAssetOptInTransaction = async (
  learnerWallet: string,
  assetId: number
) => {
  try {
    const algodClient = getAlgodClient();
    
    // Get suggested parameters
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    // Create asset opt-in transaction (transfer 0 amount to self)
    const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      suggestedParams: suggestedParams,
      sender: learnerWallet,
      receiver: learnerWallet,
      amount: 0,
      assetIndex: assetId,
    });

    return optInTxn;
  } catch (error) {
    console.error('Error preparing asset opt-in transaction:', error);
    throw new Error('Failed to prepare asset opt-in transaction');
  }
};

/**
 * Complete workflow: prepare and sign asset opt-in transaction
 */
export const prepareAndSignOptInTransaction = async (
  peraWallet: PeraWalletConnect,
  learnerWallet: string,
  assetId: number
): Promise<SignedTransactionResult> => {
  try {
    console.log('Starting asset opt-in transaction preparation...');
    console.log('Learner wallet:', learnerWallet);
    console.log('Asset ID:', assetId);
    
    // Validate wallet address
    if (!algosdk.isValidAddress(learnerWallet)) {
      throw new Error('Invalid learner wallet address');
    }
    
    // Check if peraWallet is properly initialized
    if (!peraWallet) {
      throw new Error('PeraWallet is not available');
    }
    
    console.log('Preparing asset opt-in transaction...');
    // Prepare the opt-in transaction
    const transaction = await prepareAssetOptInTransaction(
      learnerWallet,
      assetId
    );
    
    console.log('Transaction prepared, signing with wallet...');
    // Sign the transaction
    const signedResult = await signTransactionWithWallet(
      peraWallet,
      transaction,
      learnerWallet
    );
    
    console.log('Opt-in transaction signed successfully. TxID:', signedResult.txId);
    return signedResult;
  } catch (error) {
    console.error('Error in asset opt-in transaction workflow:', error);
    throw error;
  }
};

/**
 * Prepares an asset transfer transaction to send NFT to learner
 */
export const prepareAssetTransferTransaction = async (
  issuerWallet: string,
  learnerWallet: string,
  assetId: number
) => {
  try {
    const algodClient = getAlgodClient();
    
    // Get suggested parameters
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    // Create asset transfer transaction
    const assetTransferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      suggestedParams: suggestedParams,
      sender: issuerWallet,
      receiver: learnerWallet,
      amount: 1,
      assetIndex: assetId,
    });

    return assetTransferTxn;
  } catch (error) {
    console.error('Error preparing asset transfer transaction:', error);
    throw new Error('Failed to prepare asset transfer transaction');
  }
};

/**
 * Signs a transaction using Pera Wallet
 */
export const signTransactionWithWallet = async (
  peraWallet: PeraWalletConnect,
  transaction: algosdk.Transaction,
  signerAddress: string
): Promise<SignedTransactionResult> => {
  try {
    // Get transaction ID before signing
    const txId = transaction.txID();
    
    // Convert transaction to the format expected by Pera Wallet
    const txnToSign = {
      txn: transaction,
      signers: [signerAddress],
    };
    
    // Sign the transaction using Pera Wallet
    const signedTxns = await peraWallet.signTransaction([[txnToSign]]);
    
    if (!signedTxns || signedTxns.length === 0) {
      throw new Error('No signed transactions returned from wallet');
    }
    
    const signedTxn = signedTxns[0];
    if (!signedTxn) {
      throw new Error('Failed to sign transaction');
    }
    
    // Convert to base64 for transmission
    const signedTxnBase64 = Buffer.from(signedTxn).toString('base64');
    
    return {
      signedTxn: signedTxnBase64,
      txId: txId,
    };
  } catch (error) {
    console.error('Error signing transaction:', error);
    throw new Error('Failed to sign transaction with wallet');
  }
};

/**
 * Complete workflow: prepare and sign asset transfer transaction
 */
export const prepareAndSignTransferTransaction = async (
  peraWallet: PeraWalletConnect,
  issuerWallet: string,
  learnerWallet: string,
  assetId: number
): Promise<SignedTransactionResult> => {
  try {
    console.log('Starting asset transfer transaction preparation...');
    console.log('Issuer wallet:', issuerWallet);
    console.log('Learner wallet:', learnerWallet);
    console.log('Asset ID:', assetId);
    
    // Validate wallet addresses
    if (!algosdk.isValidAddress(issuerWallet)) {
      throw new Error('Invalid issuer wallet address');
    }
    
    if (!algosdk.isValidAddress(learnerWallet)) {
      throw new Error('Invalid learner wallet address');
    }
    
    // Check if peraWallet is properly initialized
    if (!peraWallet) {
      throw new Error('PeraWallet is not available');
    }
    
    console.log('Preparing asset transfer transaction...');
    // Prepare the transfer transaction
    const transaction = await prepareAssetTransferTransaction(
      issuerWallet,
      learnerWallet,
      assetId
    );
    
    console.log('Transaction prepared, signing with wallet...');
    // Sign the transaction
    const signedResult = await signTransactionWithWallet(
      peraWallet,
      transaction,
      issuerWallet
    );
    
    console.log('Transfer transaction signed successfully. TxID:', signedResult.txId);
    return signedResult;
  } catch (error) {
    console.error('Error in asset transfer transaction workflow:', error);
    throw error;
  }
};

/**
 * Complete workflow: prepare and sign transaction for certificate issuance
 */
export const prepareAndSignCertificateTransaction = async (
  peraWallet: PeraWalletConnect,
  issuerWallet: string,
  learnerWallet: string,
  ipfsHash: string,
  courseName: string
): Promise<SignedTransactionResult> => {
  try {
    console.log('Starting certificate transaction preparation...');
    console.log('Issuer wallet:', issuerWallet);
    console.log('Learner wallet:', learnerWallet);
    console.log('IPFS hash:', ipfsHash);
    console.log('Course name:', courseName);
    
    // Validate wallet addresses
    if (!algosdk.isValidAddress(issuerWallet)) {
      throw new Error('Invalid issuer wallet address');
    }
    
    if (!algosdk.isValidAddress(learnerWallet)) {
      throw new Error('Invalid learner wallet address');
    }
    
    // Check if peraWallet is properly initialized
    if (!peraWallet) {
      throw new Error('PeraWallet is not available');
    }
    
    // Prepare transaction parameters
    const transactionParams: TransactionPrepareParams = {
      issuerWallet,
      learnerWallet,
      ipfsHash,
      assetName: `${courseName} Certificate`,
      unitName: 'CERT',
    };
    
    console.log('Preparing asset creation transaction...');
    // Prepare the transaction
    const transaction = await prepareAssetCreationTransaction(transactionParams);
    
    console.log('Transaction prepared, signing with wallet...');
    // Sign the transaction
    const signedResult = await signTransactionWithWallet(
      peraWallet,
      transaction,
      issuerWallet
    );
    
    console.log('Transactions signed successfully. TxID:', signedResult.txId);
    return signedResult;
  } catch (error) {
    console.error('Error in certificate transaction workflow:', error);
    throw error;
  }
};

/**
 * Checks if a wallet has opted into a specific asset
 */
export const checkAssetOptInStatus = async (
  walletAddress: string,
  assetId: number
): Promise<boolean> => {
  try {
    console.log(`Checking opt-in status for wallet: ${walletAddress}, Asset ID: ${assetId}`);
    
    // Validate wallet address
    if (!algosdk.isValidAddress(walletAddress)) {
      console.error('Invalid wallet address:', walletAddress);
      throw new Error('Invalid wallet address');
    }
    
    const algodClient = getAlgodClient();
    
    // Get account information
    console.log('Fetching account information...');
    const accountInfo = await algodClient.accountInformation(walletAddress).do();
    console.log('Account info received, checking assets...');
    
    // Log all assets for debugging
    type GenericAssetHolding = { [key: string]: unknown } & { amount?: number };
    if (Array.isArray(accountInfo.assets)) {
      const assetsArray = accountInfo.assets as unknown as GenericAssetHolding[];
      console.log('Assets in wallet:', assetsArray.map((asset) => ({
        'asset-id': (asset as Record<string, unknown>)['asset-id'],
        amount: asset.amount
      })));
    } else {
      console.log('No assets found in wallet');
    }
    
    // Check if the asset exists in the account's assets
    const assetHolding = Array.isArray(accountInfo.assets)
      ? (accountInfo.assets as unknown as GenericAssetHolding[]).find((asset) => (asset as Record<string, unknown>)['asset-id'] === assetId)
      : undefined;
    
    const isOptedIn = !!assetHolding;
    console.log(`Asset ${assetId} opt-in status: ${isOptedIn}`);
    
    if (assetHolding) {
      const assetIdValue = (assetHolding as Record<string, unknown>)['asset-id'];
      const amountValue = (assetHolding as { amount?: number }).amount ?? 0;
      const frozenValue = (assetHolding as Record<string, unknown>)['is-frozen'] ?? false;
      console.log('Asset holding details:', {
        'asset-id': assetIdValue,
        amount: amountValue,
        'is-frozen': frozenValue,
      });
    }
    
    return isOptedIn;
  } catch (error) {
    console.error('Error checking asset opt-in status:', error);
    // Don't return false on error, re-throw to let caller handle
    throw error;
  }
};

/**
 * Utility function to validate Algorand address
 */
export const isValidAlgorandAddress = (address: string): boolean => {
  try {
    return algosdk.isValidAddress(address);
  } catch {
    return false;
  }
};

/**
 * Utility function to format wallet address for display
 */
export const formatWalletAddress = (address: string): string => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};