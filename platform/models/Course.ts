import { Schema, model, models } from 'mongoose'

const seoSchema = new Schema({
  metaTitle: String,
  metaDescription: String,
  ogImage: String,
}, { _id: false })

const courseSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String },
  icon: { type: String, default: '📚' },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  category: { type: String, required: true },
  estimatedHours: { type: Number, default: 0 },
  totalTopics: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
  seo: { type: seoSchema, default: () => ({}) },
}, { timestamps: true })

courseSchema.index({ slug: 1 })
courseSchema.index({ category: 1 })
courseSchema.index({ title: 'text', description: 'text' })

export default models.Course || model('Course', courseSchema)
