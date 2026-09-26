const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      default: 'Placement Cell (CCPDMS)',
    },
    category: {
      type: String,
      enum: [
        'announcement',
        'shortlist',
        'schedule',
        'offer',
        'reminder',
        'general',
        'drive_invitation',
        'round_shortlist',
        'policy_update',
        'status_update',
      ],
      default: 'general',
    },
    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OnCampusDrive',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ student: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
