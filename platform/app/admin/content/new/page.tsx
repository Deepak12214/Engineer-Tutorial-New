'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import BlockEditor from '@/components/BlockEditor'
import ContentRenderer from '@/components/ContentRenderer'
import { Save, Globe, Eye, EyeOff, Zap, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

interface Block { id: string; type: string; content: any; level?: number }

export default function NewContentPage() {
  const router = useRouter()
  const [contentType, setContentType] = useState<'topic' | 'blog'>('topic')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [blocks, setBlocks] = useState<Block[]>([])
  const [isPremium, setIsPremium] = useState(false)
  const [previewBlockCount, setPreviewBlockCount] = useState(3)
  const [isPublished, setIsPublished] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [courses, setCourses] = useState<any[]>([])
  const [sections, setSections] = useState<any[]>([])
  const [courseId, setCourseId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const autoSaveRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    fetch('/api/admin/courses').then(r => r.json()).then(setCourses).catch(() => {})
  }, [])

  useEffect(() => {
    if (courseId) {
      fetch(`/api/admin/sections?courseId=${courseId}`).then(r => r.json()).then(setSections).catch(() => {})
    }
  }, [courseId])

  // Auto-generate slug from title
  useEffect(() => {
    setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
  }, [title])

  // Auto-save draft every 30s
  useEffect(() => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    if (title || blocks.length > 0) {
      autoSaveRef.current = setTimeout(() => {
        localStorage.setItem('et_draft_new', JSON.stringify({ contentType, title, slug, blocks, isPremium, courseId, sectionId }))
        toast.success('Draft auto-saved', { duration: 1500, id: 'autosave' })
      }, 30000)
    }
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current) }
  }, [title, blocks, contentType, isPremium, courseId, sectionId, slug])

  async function save(publish = false) {
    if (!title.trim()) return toast.error('Title is required')
    if (contentType === 'topic' && !sectionId) return toast.error('Select a section')
    setSaving(true)
    try {
      const endpoint = contentType === 'topic' ? '/api/admin/topics' : '/api/admin/blogs'
      const payload = contentType === 'topic'
        ? { title, slug, blocks, isPremium, previewBlockCount, isPublished: publish, courseId, sectionId, estimatedReadTime: Math.max(1, Math.ceil(blocks.length * 1.5)) }
        : { title, slug, blocks, isPublished: publish, category: 'general' }

      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      localStorage.removeItem('et_draft_new')
      toast.success(publish ? 'Published!' : 'Saved as draft')
      router.push('/admin/content')
    } catch (err: any) {
      toast.error(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout title="New Content">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Content type toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
            {(['topic', 'blog'] as const).map(t => (
              <button key={t} onClick={() => setContentType(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${contentType === t ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                {t === 'topic' ? '📄 Topic' : '📝 Blog'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:border-accent">
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button onClick={() => save(false)} disabled={saving}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:border-accent disabled:opacity-50">
              <Save className="w-4 h-4" /> Save Draft
            </button>
            <button onClick={() => save(true)} disabled={saving}
              className="flex items-center gap-2 px-4 py-1.5 text-sm bg-accent text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-semibold">
              <Globe className="w-4 h-4" /> {saving ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main editor */}
          <div className="lg:col-span-2">
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Content title..."
              className="w-full text-2xl font-bold bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-300 mb-2"
            />
            <input value={slug} onChange={e => setSlug(e.target.value)}
              placeholder="slug-auto-generated"
              className="w-full text-sm text-slate-400 bg-transparent border-none outline-none mb-6 font-mono"
            />

            {showPreview
              ? <ContentRenderer blocks={blocks} />
              : <BlockEditor blocks={blocks} onChange={setBlocks} />
            }
          </div>

          {/* Settings panel */}
          <div className="space-y-4">
            {contentType === 'topic' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">Course & Section</h3>
                <select value={courseId} onChange={e => { setCourseId(e.target.value); setSectionId('') }}
                  className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 mb-2 focus:outline-none focus:ring-2 focus:ring-accent">
                  <option value="">Select course...</option>
                  {courses.map((c: any) => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
                <select value={sectionId} onChange={e => setSectionId(e.target.value)} disabled={!courseId}
                  className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50">
                  <option value="">Select section...</option>
                  {sections.map((s: any) => <option key={s._id} value={s._id}>{s.title}</option>)}
                </select>
              </div>
            )}

            {contentType === 'topic' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">Access</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => setIsPremium(!isPremium)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${isPremium ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isPremium ? 'translate-x-5' : ''}`} />
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    {isPremium ? <><Zap className="w-3.5 h-3.5 text-amber-500" /> Pro Content</> : <><Lock className="w-3.5 h-3.5 text-slate-400" /> Free Content</>}
                  </span>
                </label>
                {isPremium && (
                  <div className="mt-3">
                    <label className="text-xs text-slate-500 block mb-1">Preview blocks (for free users)</label>
                    <input type="number" min={1} max={10} value={previewBlockCount}
                      onChange={e => setPreviewBlockCount(parseInt(e.target.value) || 3)}
                      className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">Image Upload</h3>
              <ImageUploader onInsert={(url) => {
                const imgBlock: Block = { id: `block-${Date.now()}`, type: 'image', content: { url, alt: '', caption: '' } }
                setBlocks(prev => [...prev, imgBlock])
                toast.success('Image added to blocks')
              }} />
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-xs text-slate-500 space-y-1">
              <p>📦 {blocks.length} blocks</p>
              <p>⏱ ~{Math.max(1, Math.ceil(blocks.length * 1.5))} min read</p>
              <p>💾 Auto-saves every 30s</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

function ImageUploader({ onInsert }: { onInsert: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [destination, setDestination] = useState<'local' | 'cloudinary'>('local')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('destination', destination)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onInsert(data.url)
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2 text-xs">
        {(['local', 'cloudinary'] as const).map(d => (
          <button key={d} onClick={() => setDestination(d)}
            className={`px-2 py-1 rounded-lg border transition-colors ${destination === d ? 'border-accent bg-accent/10 text-accent' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>
            {d === 'local' ? '📁 Local' : '☁️ Cloudinary'}
          </button>
        ))}
      </div>
      <label className={`flex items-center justify-center gap-2 w-full py-2 border-2 border-dashed rounded-lg text-xs cursor-pointer transition-colors ${uploading ? 'border-accent text-accent' : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:border-accent hover:text-accent'}`}>
        <input type="file" accept="image/*" onChange={handleFile} className="hidden" disabled={uploading} />
        {uploading ? 'Uploading...' : '+ Upload image'}
      </label>
    </div>
  )
}
