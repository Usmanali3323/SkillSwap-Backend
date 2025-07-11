import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Skill title is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Skill description is required"],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:'Category'
    },
    tags: {
      type: [String],
      default: [],
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Expert"],
      default: "Beginner",
    },
    availability: {
      type: String,
      default: "Flexible",
    },
    location: {
      type: String,
      default: "Online",
    },
    mode: {
      type: String,
      enum: ["Online", "Offline", "Hybrid"],
      default: "Online",
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imagesUrl: {
      type: [String], // URLs (Cloudinary or local)
      default: [],
    },
    review: [{
      type: mongoose.Schema.Types.ObjectId,
      ref:"Review"
  }],
    isActive:{
     type: Boolean,
     default: true
    },
    isVerify:{
      type:Boolean,
      default:false
    },
    reports:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Report"
    }]

  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

export const Skill = mongoose.model("Skill", skillSchema);
