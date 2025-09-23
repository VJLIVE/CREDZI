# Certificate Issuance API

## Overview

The `/api/issueCertificate` endpoint allows organizations to issue blockchain-based certificates as NFTs on the Algorand network using the ARC69 standard.

## API Endpoint

**POST** `/api/issueCertificate`

### Request Body

```json
{
  "learnerName": "John Doe",
  "learnerWallet": "ALGORAND_WALLET_ADDRESS_HERE",
  "courseName": "Blockchain Development Fundamentals",
  "organizationName": "Tech University", // Optional
  "description": "Certificate of completion for blockchain development course", // Optional
  "skills": ["Blockchain", "Smart Contracts", "Algorand"], // Optional
  "grade": "A", // Optional
  "score": 95, // Optional
  "validUntil": "2025-12-31T23:59:59.000Z" // Optional ISO date string
}
```

### Required Fields

- `learnerName`: Full name of the certificate recipient
- `learnerWallet`: Valid Algorand wallet address of the recipient
- `courseName`: Name of the course or program being certified

### Optional Fields

- `organizationName`: Name of the issuing organization
- `description`: Custom description for the certificate
- `skills`: Array of skills/competencies covered
- `grade`: Letter grade or assessment result
- `score`: Numerical score (0-100)
- `validUntil`: Expiration date for the certificate

### Response

#### Success Response (201)

```json
{
  "message": "Certificate issued successfully",
  "certificate": {
    "id": "mongodb_object_id",
    "learnerName": "John Doe",
    "learnerWallet": "ALGORAND_WALLET_ADDRESS",
    "courseName": "Blockchain Development Fundamentals",
    "organizationName": "Tech University",
    "assetId": 123456789,
    "ipfsHash": "QmHash...",
    "transactionId": "ALGORAND_TRANSACTION_ID",
    "issuedAt": "2024-09-23T10:30:00.000Z",
    "verificationUrl": "http://localhost:3000/verify/123456789"
  }
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "error": "Learner name, learner wallet, and course name are required"
}
```

**409 Conflict**
```json
{
  "error": "Certificate already exists for this learner and course"
}
```

**500 Internal Server Error**
```json
{
  "error": "Failed to upload metadata to IPFS",
  "details": "Specific error message"
}
```

## Implementation Details

### 1. ARC69 Metadata Standard

The API creates ARC69-compliant metadata containing:
- Certificate details (learner, course, organization)
- Issue and validity dates
- Skills and assessment information
- Verification URL

### 2. IPFS Storage

Metadata is uploaded to IPFS via Pinata Cloud:
- Permanent storage of certificate data
- Decentralized access to metadata
- Content-addressed storage

### 3. Algorand NFT Minting

Creates a unique NFT on Algorand blockchain:
- Total supply: 1 (unique certificate)
- Decimals: 0 (non-fungible)
- Metadata URL points to IPFS
- Immutable record of issuance

### 4. Database Storage

Certificate records stored in MongoDB:
- Searchable by learner wallet, course, organization
- Transaction and asset ID tracking
- Status management (issued, pending, revoked)

## Setup Requirements

### Environment Variables

Configure the following in `.env.local`:

```env
# MongoDB
MONGODB_URI=mongodb://connection_string

# Pinata IPFS
PINATA_API_KEY=your_api_key
PINATA_SECRET_API_KEY=your_secret_key

# Algorand
ALGORAND_API_URL=https://testnet-api.algonode.cloud
ISSUER_MNEMONIC=25_word_mnemonic_phrase

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Prerequisites

1. **Pinata Account**: Sign up at https://pinata.cloud for IPFS services
2. **Algorand Wallet**: Create a wallet with sufficient ALGO for transaction fees
3. **MongoDB Database**: Set up MongoDB instance for certificate storage

### Dependencies

All required dependencies are already included in `package.json`:
- `algosdk`: Algorand blockchain interaction
- `mongoose`: MongoDB ODM
- `ipfs-http-client`: IPFS client (not directly used, but available)

## Usage Example

```javascript
const response = await fetch('/api/issueCertificate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    learnerName: 'Alice Johnson',
    learnerWallet: 'ABCD1234EFGH5678IJKL9012MNOP3456QRST7890UVWX1234YZZZ',
    courseName: 'Advanced React Development',
    skills: ['React', 'TypeScript', 'Next.js'],
    grade: 'A+',
    score: 98
  })
});

const result = await response.json();

if (response.ok) {
  console.log('Certificate issued:', result.certificate);
  console.log('Asset ID:', result.certificate.assetId);
  console.log('Verification URL:', result.certificate.verificationUrl);
} else {
  console.error('Error:', result.error);
}
```

## Security Considerations

1. **Wallet Validation**: All wallet addresses are validated using Algorand SDK
2. **Duplicate Prevention**: Prevents issuing multiple certificates for same learner/course combination
3. **Environment Protection**: Sensitive keys stored in environment variables
4. **Error Handling**: Comprehensive error handling for all external services

## Integration with Organization Dashboard

The new API can be integrated with the organization dashboard by:

1. Adding a certificate issuance form
2. Connecting to the "Issue New Credential" button
3. Displaying issued certificates in the dashboard
4. Tracking analytics (certificates issued, learners, etc.)