import { Schema, model, models } from 'mongoose'

const blockSchema = new Schema({
  type: { type: String, required: true },
  content: { type: Schema.Types.Mixed, required: true },
  level: { type: Number },
}, { _id: false })

const seoSchema = new Schema({
  metaTitle: String,
  metaDescription: String,
  ogImage: String,
}, { _id: false })

const topicSchema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, lowercase: true },
  blocks: { type: [blockSchema], default: [] },
  isPremium: { type: Boolean, default: false },
  previewBlockCount: { type: Number, default: 3 },
  estimatedReadTime: { type: Number, default: 5 },
  isPublished: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  seo: { type: seoSchema, default: () => ({}) },
}, { timestamps: true })

topicSchema.index({ sectionId: 1, order: 1 })
topicSchema.index({ courseId: 1 })
topicSchema.index({ slug: 1 })
topicSchema.index({ title: 'text' })

export default models.Topic || model('Topic', topicSchema)
