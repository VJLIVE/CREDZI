import mongoose from 'mongoose';
import './Certificate'; // Ensure Certificate model is registered before User

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  role: {
    type: String,
    enum: ['learner', 'organization', 'admin'],
    default: 'learner',
  },
  walletId: {
    type: String,
    required: false,
    trim: true,
  },
  // Common profile fields
  phone: {
    type: String,
    trim: true,
  },
  bio: {
    type: String,
    trim: true,
  },
  // Learner-specific fields
  skills: [{
    type: String,
    trim: true,
  }],
  experience: {
    type: String,
    trim: true,
  },
  education: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  githubProfile: {
    type: String,
    trim: true,
  },
  linkedinProfile: {
    type: String,
    trim: true,
  },
  // Organization-specific fields
  organizationName: {
    type: String,
    trim: true,
  },
  organizationType: {
    type: String,
    enum: ['university', 'college', 'training-institute', 'certification-body', 'company', 'non-profit', 'government', 'other'],
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  industry: {
    type: String,
    trim: true,
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  establishedYear: {
    type: String,
    trim: true,
  },
  certificationAuthority: {
    type: Boolean,
    default: false,
  },
  // Array to store certificate references
  certificates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Initialize certificates array if it doesn't exist
  if (!this.certificates) {
    this.certificates = [];
  }
  
  next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;