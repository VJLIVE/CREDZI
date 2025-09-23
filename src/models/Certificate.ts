import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  learnerWalletId: {
    type: String,
    required: [true, 'Learner wallet ID is required'],
    trim: true,
    index: true,
  },
  courseName: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
  },
  issuerWalletId: {
    type: String,
    required: [true, 'Issuer wallet ID is required'],
    trim: true,
    index: true,
  },
  issuerOrganization: {
    type: String,
    required: [true, 'Issuer organization is required'],
    trim: true,
  },
  certificateHash: {
    type: String,
    unique: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['issued', 'revoked', 'suspended'],
    default: 'issued',
  },
  metadata: {
    description: {
      type: String,
      trim: true,
    },
    skills: [{
      type: String,
      trim: true,
    }],
    duration: {
      type: String,
      trim: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      trim: true,
    },
  },
  issuedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: false,
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

// Pre-save middleware to update the updatedAt field
certificateSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Generate a unique certificate hash before saving
certificateSchema.pre('save', function(next) {
  if (!this.certificateHash) {
    const crypto = require('crypto');
    const hashString = `${this.learnerWalletId}-${this.courseName}-${this.issuerWalletId}-${Date.now()}`;
    this.certificateHash = crypto.createHash('sha256').update(hashString).digest('hex');
  }
  next();
});

// Index for efficient queries
certificateSchema.index({ learnerWalletId: 1, courseName: 1 });
certificateSchema.index({ issuerWalletId: 1, issuedAt: -1 });

const Certificate = mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema);

export default Certificate;