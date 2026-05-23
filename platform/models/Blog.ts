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

const blogSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User' },
  blocks: { type: [blockSchema], default: [] },
  category: { type: String },
  tags: { type: [String], default: [] },
  readTime: { type: Number, default: 5 },
  isPublished: { type: Boolean, default: false },
  featuredImage: { type: String },
  seo: { type: seoSchema, default: () => ({}) },
}, { timestamps: true })

blogSchema.index({ slug: 1 })
blogSchema.index({ category: 1 })
blogSchema.index({ title: 'text', tags: 'text' })

export default models.Blog || model('Blog', blogSchema)
