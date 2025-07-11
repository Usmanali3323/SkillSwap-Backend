// models/Notification.model.js
import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const notificationSchema = new Schema({
  // Who the notification is for
  user: {
    type: Types.ObjectId,
    ref: "User",
    required: true
  },

  // A short type code so you can switch on it in your front-end
  type: {
    type: String,
    enum: [
      "SKILL_REQUEST",
      "SKILL_APPROVED",
      "SKILL_REJECTED",
      "CONNECTION_REQUEST",
      "CONNECTION_ACCEPTED",
      "CONNECTION_REJECTED",
      "NEW_MESSAGE",
      // add your own types here...
    ],
    required: true
  },

  // A human-readable message
  message: {
    type: String,
    required: true
  },

  // Whether the user has read/dismissed it
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // adds createdAt & updatedAt
});

export const Notification =  model("Notification", notificationSchema);
