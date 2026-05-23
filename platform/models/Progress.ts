import { Schema, model, models } from 'mongoose'

const progressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  completedTopics: { type: [Schema.Types.ObjectId], default: [] },
  lastVisitedTopicId: { type: Schema.Types.ObjectId, ref: 'Topic' },
  completionPercentage: { type: Number, default: 0 },
}, { timestamps: true })

progressSchema.index({ userId: 1, courseId: 1 }, { unique: true })

export default models.Progress || model('Progress', progressSchema)
