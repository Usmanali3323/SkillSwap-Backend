import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  skillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // The reporting user
    required: true,
  },
  reason: {
    type: String,
    enum: [
      'Inappropriate Content',
      'Spam or Scam',
      'False Information',
      'Other',
    ],
    required: true,
  },
  description: {
    type: String,
    maxlength: 1000,
  },
  isRead:{
    type: Boolean,
    default : false
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

export const Report = mongoose.model('Report', reportSchema);
