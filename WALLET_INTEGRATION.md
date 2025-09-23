# Wallet-Based Certificate Issuance Implementation

## Overview

The certificate issuance system has been updated to use the connected Pera Wallet for transaction signing instead of server-side mnemonics. This provides better security, user control, and eliminates the need for storing sensitive wallet credentials on the server.

## 🔄 **Implementation Changes**

### **1. Security Improvements**
- ✅ **No server-side private keys**: Eliminates security risk of storing mnemonics
- ✅ **User-controlled signing**: Users sign transactions with their own wallet
- ✅ **Transparent process**: Users can review transactions before signing
- ✅ **Zero trust model**: Server never has access to private keys

### **2. Architecture Changes**

#### **Old Flow (Server-Side Signing)**
```
Frontend Form → API → Create Transaction → Sign with Server Mnemonic → Submit
```

#### **New Flow (Client-Side Signing)**
```
Frontend Form → Upload Metadata → Prepare Transaction → Sign with User Wallet → Submit Signed Transaction
```

### **3. Process Breakdown**

#### **Step 1: Metadata Upload**
- Frontend uploads certificate metadata to IPFS via `/api/uploadMetadata`
- Returns IPFS hash for asset URL

#### **Step 2: Transaction Preparation**
- Client-side utility prepares Algorand asset creation transaction
- Sets IPFS URL as asset metadata URL

#### **Step 3: Wallet Signing**
- Pera Wallet prompts user to review and sign transaction
- User approves transaction with their wallet

#### **Step 4: Transaction Submission**
- Signed transaction sent to `/api/issueCertificate`
- API submits to Algorand blockchain
- Certificate record saved to MongoDB

## 📁 **New Files Created**

### **1. `/src/lib/algorandUtils.ts`**
Client-side utilities for Algorand integration:
- `prepareAssetCreationTransaction()`: Creates unsigned transaction
- `signTransactionWithWallet()`: Signs transaction with Pera Wallet
- `prepareAndSignCertificateTransaction()`: Complete workflow
- Utility functions for address validation and formatting

### **2. `/src/app/api/uploadMetadata/route.ts`**
Metadata upload API endpoint:
- Accepts certificate metadata
- Creates ARC69-compliant metadata
- Uploads to IPFS via Pinata
- Returns IPFS hash

## 🔧 **Updated Components**

### **1. IssueCertificateForm.tsx**
- Added `connectedWallet` prop
- Updated form data interface to include `issuerWallet`
- Enhanced error handling for wallet interactions

### **2. Organization Dashboard**
- Added Pera Wallet initialization
- Updated certificate issuance flow
- Enhanced error handling for wallet-specific errors
- Better user feedback for transaction states

### **3. API Routes**

#### **Updated `/api/issueCertificate`**
- Removed mnemonic dependency
- Accepts signed transactions
- Validates wallet addresses
- Simplified to focus on transaction submission

#### **New `/api/uploadMetadata`**
- Handles metadata creation and IPFS upload
- Returns IPFS hash for transaction preparation

## 🚀 **User Experience Improvements**

### **Transaction Flow**
1. **Form Submission**: User fills certificate form
2. **Metadata Upload**: Background upload to IPFS
3. **Wallet Prompt**: Pera Wallet opens for transaction review
4. **Transaction Review**: User sees:
   - Transaction type (Asset Creation)
   - Asset details (name, URL, etc.)
   - Transaction fees
5. **User Approval**: User approves or rejects
6. **Completion**: Certificate issued and displayed

### **Error Handling**
- **Wallet not connected**: Clear error message
- **User rejection**: "Transaction cancelled by user"
- **Insufficient funds**: "Add ALGO for transaction fees"
- **Network errors**: Detailed error messages
- **Timeout handling**: Transaction confirmation timeouts

## 🔒 **Security Benefits**

### **1. Private Key Security**
- Private keys never leave user's device
- No server-side credential storage
- Reduced attack surface

### **2. User Control**
- Users see exactly what they're signing
- Transaction details visible before approval
- User can reject suspicious transactions

### **3. Audit Trail**
- All transactions signed by actual issuer
- Wallet addresses verified on-chain
- Transparent issuance process

## ⚙️ **Environment Variables**

### **Required Variables**
```env
# MongoDB
MONGODB_URI=mongodb://connection_string

# Pinata IPFS
PINATA_API_KEY=your_api_key
PINATA_SECRET_API_KEY=your_secret_key

# Algorand
ALGORAND_API_URL=https://testnet-api.algonode.cloud
NEXT_PUBLIC_ALGORAND_NODE_URL=https://testnet-api.algonode.cloud

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### **Removed Variables**
- ❌ `ISSUER_MNEMONIC` - No longer needed
- ❌ `CREATOR_MNEMONIC` - Removed for security

## 🧪 **Testing the New Implementation**

### **Prerequisites**
1. **Pera Wallet**: Install Pera Wallet mobile app or browser extension
2. **ALGO Balance**: Ensure connected wallet has ALGO for transaction fees
3. **Environment Setup**: Configure Pinata and MongoDB credentials

### **Test Flow**
1. Connect wallet in the application
2. Navigate to Organization Dashboard
3. Click "Issue New Credential"
4. Fill in certificate details
5. Submit form
6. Review transaction in Pera Wallet
7. Approve transaction
8. Verify certificate appears in dashboard

### **Expected Results**
- ✅ Metadata uploaded to IPFS
- ✅ Transaction signed by user wallet
- ✅ NFT created on Algorand
- ✅ Certificate record in MongoDB
- ✅ Verification URL functional

## 🎯 **Benefits of Wallet-Based Approach**

### **For Organizations**
- **No wallet management**: Don't need to handle private keys
- **Compliance friendly**: Meets security best practices
- **Audit ready**: Clear transaction trail
- **Scalable**: No bottleneck from shared credentials

### **For Certificate Recipients**
- **Verifiable issuer**: Can verify who issued certificate
- **Blockchain proof**: Immutable record on Algorand
- **Ownership proof**: NFT in recipient's wallet
- **Portable credentials**: Not tied to platform

### **For the Platform**
- **Reduced liability**: No private key storage
- **Better security posture**: Distributed key management
- **User empowerment**: Users control their credentials
- **Regulatory compliance**: Meets data protection standards

## 🔄 **Migration Guide**

### **For Existing Deployments**
1. Update environment variables (remove mnemonic)
2. Deploy new API endpoints
3. Update frontend components
4. Test with Pera Wallet integration
5. Verify IPFS metadata upload

### **For New Deployments**
1. Set up Pinata account for IPFS
2. Configure environment variables
3. Deploy application
4. Test end-to-end flow

## 🛠 **Troubleshooting**

### **Common Issues**

#### **"Wallet not connected"**
- Ensure Pera Wallet is installed
- Check wallet connection status
- Reconnect if necessary

#### **"Insufficient ALGO balance"**
- Add ALGO to connected wallet
- Minimum ~0.1 ALGO needed for transactions

#### **"Transaction failed"**
- Check network connectivity
- Verify Algorand network status
- Try again after network recovery

#### **"Pinata upload failed"**
- Verify Pinata API credentials
- Check Pinata account limits
- Ensure stable internet connection

The wallet-based implementation provides a more secure, user-friendly, and scalable approach to certificate issuance while maintaining all the blockchain benefits of the original system.