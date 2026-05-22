'use client'

import { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Plus, Trash2, GripVertical, Eye, Save, Globe, FileText, Code, List, Table, Image, Lightbulb, Video, HelpCircle, ChevronDown, AlignLeft, Heading1, Heading2 } from 'lucide-react'

type BlockType = 'heading' | 'smallHeading' | 'text' | 'list' | 'code' | 'table' | 'image' | 'callout' | 'video' | 'quiz'

interface Block {
  id: string
  type: BlockType
  content: string
}

const blockTypes: { type: BlockType; icon: any; label: string; desc: string }[] = [
  { type: 'heading', icon: Heading1, label: 'Heading', desc: 'Large section title' },
  { type: 'smallHeading', icon: Heading2, label: 'Subheading', desc: 'H2 subheading' },
  { type: 'text', icon: AlignLeft, label: 'Text', desc: 'Paragraph text' },
  { type: 'list', icon: List, label: 'List', desc: 'Bullet points' },
  { type: 'code', icon: Code, label: 'Code', desc: 'Code snippet' },
  { type: 'table', icon: Table, label: 'Table', desc: 'Data table' },
  { type: 'image', icon: Image, label: 'Image', desc: 'Image block' },
  { type: 'callout', icon: Lightbulb, label: 'Callout', desc: 'Tip / warning box' },
  { type: 'video', icon: Video, label: 'Video', desc: 'YouTube or hosted video' },
  { type: 'quiz', icon: HelpCircle, label: 'Quiz', desc: 'Multiple choice question' },
]

export default function NewContentPage() {
  const [title, setTitle] = useState('')
  const [blocks, setBlocks] = useState<Block[]>([
    { id: '1', type: 'heading', content: 'Introduction' },
    { id: '2', type: 'text', content: 'Write your content here. This is the first paragraph of your topic.' },
    { id: '3', type: 'code', content: '# Sample code\nprint("Hello, World!")' },
  ])
  const [preview, setPreview] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [status, setStatus] = useState('draft')
  const [course, setCourse] = useState('')
  const [saved, setSaved] = useState(false)

  function addBlock(type: BlockType) {
    const defaults: Record<BlockType, string> = {
      heading: 'New Section',
      smallHeading: 'Subsection',
      text: 'Write your paragraph here...',
      list: 'Item 1\nItem 2\nItem 3',
      code: '// Your code here\nconsole.log("Hello")',
      table: 'Column 1 | Column 2 | Column 3\n--- | --- | ---\nValue 1 | Value 2 | Value 3',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
      callout: 'tip: This is a helpful tip for your readers.',
      video: 'https://youtube.com/embed/your-video-id',
      quiz: 'Question: What is a load balancer?\nA) A type of database\nB) Distributes traffic across servers\nC) A caching mechanism\nAnswer: B',
    }
    setBlocks(prev => [...prev, { id: Date.now().toString(), type, content: defaults[type] }])
  }

  function updateBlock(id: string, content: string) {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b))
  }

  function deleteBlock(id: string) {
    setBlocks(prev => prev.filter(b => b.id !== id))
  }

  function moveBlock(id: string, dir: 'up' | 'down') {
    const idx = blocks.findIndex(b => b.id === id)
    if (dir === 'up' && idx === 0) return
    if (dir === 'down' && idx === blocks.length - 1) return
    const newBlocks = [...blocks]
    const newIdx = dir === 'up' ? idx - 1 : idx + 1;
    [newBlocks[idx], newBlocks[newIdx]] = [newBlocks[newIdx], newBlocks[idx]]
    setBlocks(newBlocks)
  }

  async function handleSave(publishNow: boolean) {
    setSaved(false)
    await new Promise(r => setTimeout(r, 500))
    if (publishNow) setStatus('published')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const blockIcon: Record<BlockType, string> = {
    heading: '# ', smallHeading: '## ', text: '¶ ', list: '• ', code: '</>', table: '⊞ ', image: '🖼 ', callout: '💡 ', video: '▶ ', quiz: '❓ ',
  }

  return (
    <AdminLayout title="Block Editor — New Content">
      <div className="flex gap-6 h-[calc(100vh-130px)]">
        {/* Left: Block palette */}
        <div className="w-52 flex-shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 overflow-y-auto">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Add Block</p>
          <div className="space-y-1">
            {blockTypes.map(({ type, icon: Icon, label, desc }) => (
              <button key={type} onClick={() => addBlock(type)}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-left group">
                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-accent/10">
                  <Icon className="w-4 h-4 text-slate-500 group-hover:text-accent" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-accent">{label}</p>
                  <p className="text-[10px] text-slate-400">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center: Editor / Preview */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
            <button onClick={() => setPreview(!preview)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${preview ? 'bg-accent/10 text-accent' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              <Eye className="w-3.5 h-3.5" /> {preview ? 'Edit' : 'Preview'}
            </button>
            <span className="text-slate-200 dark:text-slate-700">|</span>
            <span className="text-xs text-slate-400">{blocks.length} blocks</span>
            {saved && <span className="text-xs text-green-600 dark:text-green-400 font-medium">✓ Saved!</span>}
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* Title */}
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Topic title..."
              className="w-full text-2xl font-bold text-slate-900 dark:text-white bg-transparent border-0 border-b-2 border-slate-200 dark:border-slate-700 focus:border-accent focus:outline-none pb-3 mb-6 placeholder-slate-300"
            />

            {!preview ? (
              <div className="space-y-2">
                {blocks.map((block) => (
                  <div key={block.id}
                    className="group relative border border-slate-200 dark:border-slate-700 rounded-xl hover:border-accent/50 transition-colors">
                    {/* Block header */}
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-t-xl">
                      <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                      <span className="text-xs font-mono text-slate-500">{blockIcon[block.type]}{block.type}</span>
                      <div className="ml-auto flex gap-1">
                        <button onClick={() => moveBlock(block.id, 'up')} className="p-1 text-slate-400 hover:text-slate-700 text-xs">↑</button>
                        <button onClick={() => moveBlock(block.id, 'down')} className="p-1 text-slate-400 hover:text-slate-700 text-xs">↓</button>
                        <button onClick={() => deleteBlock(block.id)} className="p-1 text-slate-400 hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {/* Block editor */}
                    <div className="p-3">
                      {block.type === 'code' ? (
                        <textarea value={block.content} onChange={e => updateBlock(block.id, e.target.value)}
                          className="w-full font-mono text-sm bg-slate-900 text-green-300 rounded-lg p-3 border-0 focus:outline-none resize-none min-h-[80px]"
                          rows={Math.max(3, block.content.split('\n').length + 1)}
                        />
                      ) : block.type === 'heading' ? (
                        <input value={block.content} onChange={e => updateBlock(block.id, e.target.value)}
                          className="w-full text-xl font-bold bg-transparent focus:outline-none text-slate-900 dark:text-white"
                        />
                      ) : block.type === 'smallHeading' ? (
                        <input value={block.content} onChange={e => updateBlock(block.id, e.target.value)}
                          className="w-full text-lg font-semibold bg-transparent focus:outline-none text-slate-900 dark:text-white"
                        />
                      ) : (
                        <textarea value={block.content} onChange={e => updateBlock(block.id, e.target.value)}
                          className="w-full text-sm bg-transparent focus:outline-none resize-none text-slate-700 dark:text-slate-300 min-h-[40px]"
                          rows={Math.max(2, block.content.split('\n').length + 1)}
                        />
                      )}
                    </div>
                  </div>
                ))}

                <button onClick={() => addBlock('text')}
                  className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-400 hover:border-accent hover:text-accent flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add Block
                </button>
              </div>
            ) : (
              <div className="prose-content">
                {blocks.map((block, i) => {
                  switch(block.type) {
                    case 'heading': return <h1 key={i} className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{block.content}</h1>
                    case 'smallHeading': return <h2 key={i} className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-5">{block.content}</h2>
                    case 'text': return <p key={i} className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">{block.content}</p>
                    case 'code': return <pre key={i} className="bg-slate-900 text-green-300 rounded-xl p-4 font-mono text-sm mb-4 overflow-x-auto">{block.content}</pre>
                    case 'list': return <ul key={i} className="list-disc pl-5 mb-4 space-y-1">{block.content.split('\n').map((l, j) => <li key={j} className="text-slate-700 dark:text-slate-300 text-sm">{l}</li>)}</ul>
                    case 'callout': return <div key={i} className="callout-info mb-4"><p className="text-sm">💡 {block.content.replace(/^tip:\s*/i, '')}</p></div>
                    default: return <p key={i} className="text-slate-500 text-sm mb-4 italic">[{block.type} block]</p>
                  }
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Metadata */}
        <div className="w-64 flex-shrink-0 space-y-4 overflow-y-auto">
          {/* Publish card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Publish</h3>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500">Status</span>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="text-xs py-1 px-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-slate-500">Premium</span>
              <button onClick={() => setIsPremium(!isPremium)}
                className={`relative inline-flex w-10 h-5 rounded-full transition-colors ${isPremium ? 'bg-accent' : 'bg-slate-200 dark:bg-slate-700'}`}>
                <span className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-all ${isPremium ? 'left-5.5 translate-x-0.5' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="space-y-2">
              <button onClick={() => handleSave(false)}
                className="w-full py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2">
                <Save className="w-3.5 h-3.5" /> Save Draft
              </button>
              <button onClick={() => handleSave(true)}
                className="w-full py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-2">
                <Globe className="w-3.5 h-3.5" /> Publish
              </button>
            </div>
          </div>

          {/* Assignment */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Assignment</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Course</label>
                <select value={course} onChange={e => setCourse(e.target.value)}
                  className="w-full text-sm py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent">
                  <option value="">Select course...</option>
                  <option>System Design</option>
                  <option>Apache Kafka</option>
                  <option>Low Level Design</option>
                  <option>AWS</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Section</label>
                <select className="w-full text-sm py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent">
                  <option>Fundamentals</option>
                  <option>Advanced Patterns</option>
                  <option>Case Studies</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Tags</label>
                <input placeholder="e.g. caching, redis, scaling" className="w-full text-sm py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent placeholder-slate-400" />
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">SEO</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Meta Title</label>
                <input placeholder="SEO title..." className="w-full text-sm py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent placeholder-slate-400" />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Meta Description</label>
                <textarea rows={3} placeholder="SEO description..." className="w-full text-sm py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent resize-none placeholder-slate-400" />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">OG Image URL</label>
                <input placeholder="https://..." className="w-full text-sm py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent placeholder-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
