'use client'

import { useState, useCallback, useRef } from 'react'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  useSortable, arrayMove
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical, Plus, Trash2, Type, AlignLeft, List, ListOrdered,
  Code2, Table, Image, AlertCircle, Video, HelpCircle, ChevronDown, Upload, Link
} from 'lucide-react'
import { BlockRenderer } from './ContentRenderer'

interface Block { id: string; type: string; content: any; level?: number }

const BLOCK_TYPES = [
  { type: 'heading', label: 'Heading', icon: Type },
  { type: 'text', label: 'Text', icon: AlignLeft },
  { type: 'list', label: 'Bullet List', icon: List },
  { type: 'orderedList', label: 'Numbered List', icon: ListOrdered },
  { type: 'code', label: 'Code Block', icon: Code2 },
  { type: 'table', label: 'Table', icon: Table },
  { type: 'image', label: 'Image', icon: Image },
  { type: 'callout', label: 'Callout', icon: AlertCircle },
  { type: 'video', label: 'YouTube Video', icon: Video },
  { type: 'quiz', label: 'Quiz', icon: HelpCircle },
]

function defaultContent(type: string): any {
  switch (type) {
    case 'heading': return 'New Heading'
    case 'smallHeading': return 'New Subheading'
    case 'mediumHeading': return 'New Section'
    case 'text': return 'Write your text here...'
    case 'list': return ['Item 1', 'Item 2', 'Item 3']
    case 'orderedList': return ['Step 1', 'Step 2', 'Step 3']
    case 'code': return { language: 'python', code: '# Your code here\nprint("Hello, World!")' }
    case 'table': return { headers: ['Column 1', 'Column 2', 'Column 3'], rows: [['Row 1', 'Data', 'Data'], ['Row 2', 'Data', 'Data']] }
    case 'image': return { url: '', alt: '', caption: '' }
    case 'callout': return { type: 'info', text: 'Add your callout text here.' }
    case 'video': return { url: '', title: '' }
    case 'quiz': return { question: 'Your question here?', options: ['Option A', 'Option B', 'Option C', 'Option D'], correct: 0, explanation: 'Explanation here.' }
    default: return ''
  }
}

function SortableBlock({ block, onUpdate, onDelete, showPreview }: {
  block: Block; onUpdate: (id: string, data: Partial<Block>) => void; onDelete: (id: string) => void; showPreview: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-3">
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <button {...attributes} {...listeners} className="mt-1 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing flex-shrink-0">
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0">
          {showPreview
            ? <BlockRenderer block={block} />
            : <BlockForm block={block} onUpdate={onUpdate} />
          }
        </div>

        <button onClick={() => onDelete(block.id)} className="mt-1 text-slate-300 hover:text-red-500 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function BlockForm({ block, onUpdate }: { block: Block; onUpdate: (id: string, data: Partial<Block>) => void }) {
  const up = (content: any) => onUpdate(block.id, { content })

  switch (block.type) {
    case 'heading':
    case 'smallHeading':
    case 'mediumHeading':
    case 'text':
      return (
        <textarea value={block.content} onChange={e => up(e.target.value)} rows={block.type === 'text' ? 3 : 1}
          placeholder={block.type === 'text' ? 'Write paragraph...' : 'Heading text...'}
          className="w-full resize-none bg-transparent border-none outline-none text-slate-900 dark:text-white text-sm placeholder-slate-400 font-medium leading-relaxed"
        />
      )
    case 'list':
    case 'orderedList':
      return (
        <div className="space-y-1">
          {(block.content as string[]).map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-slate-400 text-xs w-4">{block.type === 'orderedList' ? `${i + 1}.` : '•'}</span>
              <input value={item} onChange={e => {
                const arr = [...block.content]; arr[i] = e.target.value; up(arr)
              }} className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white" />
              <button onClick={() => { const arr = (block.content as string[]).filter((_, j) => j !== i); up(arr) }} className="text-slate-300 hover:text-red-500">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button onClick={() => up([...block.content, 'New item'])}
            className="text-xs text-accent flex items-center gap-1 mt-1 hover:underline">
            <Plus className="w-3 h-3" /> Add item
          </button>
        </div>
      )
    case 'code':
      return (
        <div className="space-y-2">
          <select value={block.content.language}
            onChange={e => up({ ...block.content, language: e.target.value })}
            className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300">
            {['javascript', 'python', 'java', 'cpp', 'go', 'rust', 'bash', 'sql', 'typescript', 'json'].map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <textarea value={block.content.code} onChange={e => up({ ...block.content, code: e.target.value })} rows={8}
            className="w-full font-mono text-xs bg-slate-900 text-green-300 p-3 rounded-lg border border-slate-700 resize-y outline-none"
            placeholder="// Your code here..."
          />
        </div>
      )
    case 'image':
      return (
        <div className="space-y-2">
          <input value={block.content.url} onChange={e => up({ ...block.content, url: e.target.value })}
            placeholder="Image URL (paste Cloudinary or /uploads/... path)" className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-accent" />
          <input value={block.content.alt} onChange={e => up({ ...block.content, alt: e.target.value })}
            placeholder="Alt text (for accessibility)" className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-accent" />
          <input value={block.content.caption} onChange={e => up({ ...block.content, caption: e.target.value })}
            placeholder="Caption (optional)" className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-accent" />
          {block.content.url && <img src={block.content.url} alt={block.content.alt} className="max-h-40 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />}
        </div>
      )
    case 'callout':
      return (
        <div className="space-y-2">
          <select value={block.content.type} onChange={e => up({ ...block.content, type: e.target.value })}
            className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300">
            {['info', 'tip', 'warning', 'danger'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <textarea value={block.content.text} onChange={e => up({ ...block.content, text: e.target.value })} rows={2}
            className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-accent resize-none" />
        </div>
      )
    case 'video':
      return (
        <div className="space-y-2">
          <input value={block.content.url} onChange={e => up({ ...block.content, url: e.target.value })}
            placeholder="YouTube URL (e.g. https://youtube.com/watch?v=...)" className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-accent" />
          <input value={block.content.title} onChange={e => up({ ...block.content, title: e.target.value })}
            placeholder="Title (optional)" className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-accent" />
          {block.content.url?.includes('youtube') && (
            <div className="relative pb-[40%] h-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
              <iframe src={`https://www.youtube.com/embed/${block.content.url.match(/(?:v=|youtu\.be\/)([^&\s?]+)/)?.[1]}`}
                className="absolute inset-0 w-full h-full" allowFullScreen />
            </div>
          )}
        </div>
      )
    case 'quiz':
      return (
        <div className="space-y-2">
          <input value={block.content.question} onChange={e => up({ ...block.content, question: e.target.value })}
            placeholder="Question?" className="w-full text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-accent" />
          {block.content.options.map((opt: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <input type="radio" name={`correct-${block.id}`} checked={block.content.correct === i}
                onChange={() => up({ ...block.content, correct: i })} className="accent-accent" />
              <input value={opt} onChange={e => {
                const opts = [...block.content.options]; opts[i] = e.target.value; up({ ...block.content, options: opts })
              }} className="flex-1 text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-800 outline-none" placeholder={`Option ${String.fromCharCode(65 + i)}`} />
            </div>
          ))}
          <p className="text-xs text-slate-400">Select the radio button next to the correct answer</p>
          <textarea value={block.content.explanation} onChange={e => up({ ...block.content, explanation: e.target.value })} rows={2}
            placeholder="Explanation for the correct answer..."
            className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-accent resize-none" />
        </div>
      )
    case 'table':
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                {block.content.headers.map((h: string, i: number) => (
                  <th key={i} className="border border-slate-200 dark:border-slate-700 p-1">
                    <input value={h} onChange={e => {
                      const headers = [...block.content.headers]; headers[i] = e.target.value; up({ ...block.content, headers })
                    }} className="w-full bg-transparent font-semibold text-slate-900 dark:text-white text-center outline-none" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.content.rows.map((row: string[], ri: number) => (
                <tr key={ri}>
                  {row.map((cell: string, ci: number) => (
                    <td key={ci} className="border border-slate-200 dark:border-slate-700 p-1">
                      <input value={cell} onChange={e => {
                        const rows = block.content.rows.map((r: string[], i: number) =>
                          i === ri ? r.map((c: string, j: number) => j === ci ? e.target.value : c) : r
                        ); up({ ...block.content, rows })
                      }} className="w-full bg-transparent text-slate-700 dark:text-slate-300 outline-none" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex gap-2 mt-2">
            <button onClick={() => up({ ...block.content, rows: [...block.content.rows, block.content.headers.map(() => '')] })}
              className="text-xs text-accent hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add row</button>
            <button onClick={() => {
              const h = [...block.content.headers, `Col ${block.content.headers.length + 1}`]
              const r = block.content.rows.map((row: string[]) => [...row, ''])
              up({ headers: h, rows: r })
            }} className="text-xs text-accent hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add column</button>
          </div>
        </div>
      )
    default:
      return <p className="text-xs text-slate-400">Unknown block type: {block.type}</p>
  }
}

interface BlockEditorProps {
  blocks: Block[]
  onChange: (blocks: Block[]) => void
}

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [showAddMenu, setShowAddMenu] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function addBlock(type: string) {
    const newBlock: Block = {
      id: `block-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      content: defaultContent(type),
    }
    onChange([...blocks, newBlock])
    setShowAddMenu(false)
  }

  function updateBlock(id: string, data: Partial<Block>) {
    onChange(blocks.map(b => b.id === id ? { ...b, ...data } : b))
  }

  function deleteBlock(id: string) {
    onChange(blocks.filter(b => b.id !== id))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id)
      const newIndex = blocks.findIndex(b => b.id === over.id)
      onChange(arrayMove(blocks, oldIndex, newIndex))
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setShowPreview(!showPreview)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${showPreview ? 'bg-accent text-white border-accent' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-accent'}`}>
          {showPreview ? 'Edit Mode' : 'Preview'}
        </button>
        <span className="text-xs text-slate-400">{blocks.length} blocks</span>
      </div>

      {/* Blocks */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map(block => (
            <SortableBlock key={block.id} block={block} onUpdate={updateBlock} onDelete={deleteBlock} showPreview={showPreview} />
          ))}
        </SortableContext>
      </DndContext>

      {/* Add block button */}
      <div className="relative">
        <button onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full py-2.5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-400 hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Add Block
        </button>

        {showAddMenu && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 p-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
                <button key={type} onClick={() => addBlock(type)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-left">
                  <Icon className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
