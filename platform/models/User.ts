import mongoose, { Schema, model, models } from 'mongoose'

const bookmarkSchema = new Schema({
  type: { type: String, enum: ['topic', 'blog'], required: true },
  refId: { type: Schema.Types.ObjectId, required: true },
}, { _id: false })

const streakSchema = new Schema({
  current: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: null },
}, { _id: false })

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String },
  role: { type: String, enum: ['free_user', 'premium_user', 'author', 'admin'], default: 'free_user' },
  subscriptionStatus: { type: String, enum: ['free', 'pro'], default: 'free' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  otpCode: { type: String },
  otpExpiry: { type: Date },
  avatar: { type: String },
  streak: { type: streakSchema, default: () => ({}) },
  bookmarks: { type: [bookmarkSchema], default: [] },
  provider: { type: String, enum: ['credentials', 'google', 'github'], default: 'credentials' },
}, { timestamps: true })

userSchema.index({ email: 1 })

export default models.User || model('User', userSchema)
