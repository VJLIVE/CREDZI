import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  learnerName: {
    type: String,
    required: [true, 'Learner name is required'],
    trim: true,
  },
  learnerWallet: {
    type: String,
    required: [true, 'Learner wallet address is required'],
    trim: true,
    index: true,
  },
  courseName: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
  },
  issuerWallet: {
    type: String,
    required: [true, 'Issuer wallet address is required'],
    trim: true,
  },
  organizationName: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
  },
  assetId: {
    type: Number,
    required: [true, 'Algorand ASA ID is required'],
    unique: true,
    index: true,
  },
  ipfsHash: {
    type: String,
    required: [true, 'IPFS hash is required'],
    trim: true,
  },
  metadata: {
    standard: {
      type: String,
      default: 'arc69',
    },
    description: String,
    external_url: String,
    image: String,
    image_integrity: String,
    image_mimetype: String,
    properties: {
      certificate_type: String,
      issue_date: {
        type: Date,
        default: Date.now,
      },
      valid_from: Date,
      valid_until: Date,
      skills: [String],
      grade: String,
      score: Number,
      verification_url: String,
    },
  },
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    trim: true,
    index: true,
  },
  transferTxId: {
    type: String,
    trim: true,
    index: true,
  },
  transferredToLearner: {
    type: Boolean,
    default: false,
  },
  transferredAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'issued', 'transferred', 'revoked'],
    default: 'issued',
  },
  issuedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

certificateSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient queries
certificateSchema.index({ learnerWallet: 1, courseName: 1 });
certificateSchema.index({ organizationName: 1, issuedAt: -1 });

const Certificate = mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema);

export default Certificate;