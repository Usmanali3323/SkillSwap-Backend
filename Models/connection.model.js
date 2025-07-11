import mongoose from 'mongoose';
const { Schema } = mongoose;

const ConnectionSchema = new Schema({
  requesterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  skillId: {
    type: Schema.Types.ObjectId,
    ref: 'Skill',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed'],
    default: 'pending',
  },
  message:{
    type:String,
  },
 providerId:{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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

ConnectionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

ConnectionSchema.virtual('id').get(function () {
  return this._id.toString();
});

ConnectionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

ConnectionSchema.index({ requesterId: 1, skillId: 1 }, { unique: true });

export const Connection = mongoose.model('Connection', ConnectionSchema);
