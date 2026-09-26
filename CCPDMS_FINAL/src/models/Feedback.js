const mongoose = require('mongoose');
const roundExpSchema = new mongoose.Schema({
  roundName:   String,
  description: String,
  challenges:  String,
}, { _id: false });
const feedbackSchema = new mongoose.Schema(
  {
    driveRef: {
      driveId:   { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
      driveType: { type: String, enum: ['on-campus', 'off-campus', 'general', 'internship', 'referral'], default: 'general' },
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      select: false,   // NEVER returned via API
    },
    companyName:  { type: String, required: true, trim: true },
    role:         { type: String, trim: true },
    passedOutYear:{ type: Number },
    rounds:       [roundExpSchema],
    outcome: {
      type: String,
      enum: ['selected', 'rejected', 'in_progress'],
      default: 'selected',
    },
  },
  { timestamps: true }
);
feedbackSchema.index({ student: 1, 'driveRef.driveId': 1 }, { unique: true });
feedbackSchema.index({ 'driveRef.driveId': 1 });
feedbackSchema.index({ companyName: 1 });
module.exports = mongoose.model('Feedback', feedbackSchema);