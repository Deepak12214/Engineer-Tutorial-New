'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import BlockEditor from '@/components/BlockEditor'
import ContentRenderer from '@/components/ContentRenderer'
import { Save, Globe, Eye, EyeOff, Zap, Lock, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Block { id: string; type: string; content: any }

export default function EditContentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [contentType, setContentType] = useState<'topic' | 'blog'>('topic')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [blocks, setBlocks] = useState<Block[]>([])
  const [isPremium, setIsPremium] = useState(false)
  const [previewBlockCount, setPreviewBlockCount] = useState(3)
  const [isPublished, setIsPublished] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [courseId, setCourseId] = useState('')
  const [sectionId, setSectionId] = useState('')

  useEffect(() => {
    // Try topic first, then blog
    const tryLoad = async () => {
      let res = await fetch(`/api/admin/topics/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setContentType('topic')
        setTitle(data.title); setSlug(data.slug); setBlocks(data.blocks ?? [])
        setIsPremium(data.isPremium); setPreviewBlockCount(data.previewBlockCount ?? 3)
        setIsPublished(data.isPublished); setCourseId(data.courseId); setSectionId(data.sectionId)
        setLoading(false); return
      }
      res = await fetch(`/api/admin/blogs/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setContentType('blog')
        setTitle(data.title); setSlug(data.slug); setBlocks(data.blocks ?? [])
        setIsPublished(data.isPublished); setLoading(false); return
      }
      toast.error('Content not found'); router.push('/admin/content')
    }
    tryLoad()
  }, [params.id, router])

  async function save(publish?: boolean) {
    if (!title.trim()) return toast.error('Title is required')
    setSaving(true)
    try {
      const endpoint = contentType === 'topic' ? `/api/admin/topics/${params.id}` : `/api/admin/blogs/${params.id}`
      const payload: any = { title, slug, blocks, isPublished: publish ?? isPublished }
      if (contentType === 'topic') { payload.isPremium = isPremium; payload.previewBlockCount = previewBlockCount }

      const res = await fetch(endpoint, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Saved!')
      if (publish !== undefined) setIsPublished(publish)
    } catch (err: any) {
      toast.error(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function deleteContent() {
    if (!confirm('Delete this content? This cannot be undone.')) return
    const endpoint = contentType === 'topic' ? `/api/admin/topics/${params.id}` : `/api/admin/blogs/${params.id}`
    await fetch(endpoint, { method: 'DELETE' })
    toast.success('Deleted')
    router.push('/admin/content')
  }

  if (loading) return (
    <AdminLayout title="Edit Content">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout title="Edit Content">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="text-sm font-medium text-slate-500">{contentType === 'topic' ? '📄 Topic' : '📝 Blog'}</span>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:border-accent">
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button onClick={() => save()} disabled={saving}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:border-accent disabled:opacity-50">
              <Save className="w-4 h-4" /> Save
            </button>
            <button onClick={() => save(!isPublished)} disabled={saving}
              className={`flex items-center gap-2 px-4 py-1.5 text-sm rounded-xl font-semibold disabled:opacity-50 ${isPublished ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' : 'bg-accent text-white hover:bg-blue-700'}`}>
              <Globe className="w-4 h-4" /> {isPublished ? 'Unpublish' : 'Publish'}
            </button>
            <button onClick={deleteContent} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Content title..."
              className="w-full text-2xl font-bold bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-300 mb-2"
            />
            <input value={slug} onChange={e => setSlug(e.target.value)}
              className="w-full text-sm text-slate-400 bg-transparent border-none outline-none mb-6 font-mono"
            />
            {showPreview
              ? <ContentRenderer blocks={blocks} />
              : <BlockEditor blocks={blocks} onChange={setBlocks} />
            }
          </div>

          <div className="space-y-4">
            {contentType === 'topic' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">Access</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => setIsPremium(!isPremium)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${isPremium ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isPremium ? 'translate-x-5' : ''}`} />
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    {isPremium ? <><Zap className="w-3.5 h-3.5 text-amber-500" /> Pro</> : <><Lock className="w-3.5 h-3.5 text-slate-400" /> Free</>}
                  </span>
                </label>
                {isPremium && (
                  <div className="mt-3">
                    <label className="text-xs text-slate-500 block mb-1">Preview blocks</label>
                    <input type="number" min={1} max={10} value={previewBlockCount}
                      onChange={e => setPreviewBlockCount(parseInt(e.target.value) || 3)}
                      className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                )}
              </div>
            )}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-xs text-slate-500 space-y-1">
              <p>📦 {blocks.length} blocks</p>
              <p>Status: {isPublished ? '🟢 Published' : '⚪ Draft'}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
