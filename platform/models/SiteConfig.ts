import { Schema, model, models } from 'mongoose'

// Key-value store for all site-wide config managed by admin
// Keys: header_nav, footer_nav, announcement_bar, global_seo
const siteConfigSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
}, { timestamps: true })

export default models.SiteConfig || model('SiteConfig', siteConfigSchema)
