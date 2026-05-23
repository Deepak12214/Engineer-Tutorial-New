import { MetadataRoute } from 'next'
import { connectDB } from '@/lib/db'
import CourseModel from '@/models/Course'
import TopicModel from '@/models/Topic'
import BlogModel from '@/models/Blog'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://engineertutorial.com'

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/learn`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/blogs`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]

  try {
    await connectDB()

    const [courses, topics, blogs] = await Promise.all([
      CourseModel.find({ isPublished: true }).select('slug updatedAt').lean(),
      TopicModel.find({ isPublished: true }).select('slug courseId sectionId updatedAt').lean(),
      BlogModel.find({ isPublished: true }).select('slug updatedAt').lean(),
    ])

    const courseRoutes: MetadataRoute.Sitemap = (courses as any[]).map(c => ({
      url: `${baseUrl}/learn/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    const blogRoutes: MetadataRoute.Sitemap = (blogs as any[]).map(b => ({
      url: `${baseUrl}/blogs/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
    }))

    return [...staticRoutes, ...courseRoutes, ...blogRoutes]
  } catch {
    return staticRoutes
  }
}
