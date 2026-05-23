'use client'

import { useState } from 'react'
import { Copy, Check, MessageCircle } from 'lucide-react'

interface Block {
  type: string
  content: any
  level?: number
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([^&\s?]+)/)
  return match?.[1] ?? null
}

function CodeBlock({ content, onAskAI }: { content: { language: string; code: string }; onAskAI?: (code: string) => void }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(content.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="mb-4 rounded-xl overflow-hidden border border-slate-700">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 text-slate-400 text-xs">
        <span className="font-mono font-medium text-slate-300">{content.language}</span>
        <div className="flex items-center gap-3">
          {onAskAI && (
            <button onClick={() => onAskAI(content.code)} className="flex items-center gap-1 hover:text-purple-400 transition-colors">
              <MessageCircle className="w-3.5 h-3.5" /> Ask AI
            </button>
          )}
          <button onClick={copy} className="flex items-center gap-1 hover:text-white transition-colors">
            {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
          </button>
        </div>
      </div>
      <pre className="bg-slate-900 p-4 overflow-x-auto text-sm text-green-300 font-mono leading-relaxed whitespace-pre">{content.code}</pre>
    </div>
  )
}

function QuizBlock({ content }: { content: { question: string; options: string[]; correct: number; explanation: string } }) {
  const [selected, setSelected] = useState<number | null>(null)
  const answered = selected !== null
  return (
    <div className="mb-4 border border-slate-200 dark:border-slate-700 rounded-xl p-5 bg-slate-50 dark:bg-slate-900">
      <p className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">🧠 {content.question}</p>
      <div className="space-y-2">
        {content.options.map((opt, i) => {
          let cls = 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-accent'
          if (answered) {
            if (i === content.correct) cls = 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
            else if (i === selected) cls = 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            else cls = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 opacity-60'
          }
          return (
            <button key={i} onClick={() => !answered && setSelected(i)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm border transition-all ${cls}`}>
              <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span> {opt}
            </button>
          )
        })}
      </div>
      {answered && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300"><span className="font-semibold">Explanation:</span> {content.explanation}</p>
        </div>
      )}
    </div>
  )
}

export function BlockRenderer({ block, onAskAI }: { block: Block; onAskAI?: (code: string) => void }) {
  switch (block.type) {
    case 'heading':
    case 'smallHeading':
    case 'mediumHeading': {
      const level = block.level ?? (block.type === 'heading' ? 1 : block.type === 'smallHeading' ? 2 : 3)
      const cls: Record<number, string> = {
        1: 'text-2xl font-extrabold text-slate-900 dark:text-white mb-4 mt-2',
        2: 'text-xl font-bold text-slate-900 dark:text-white mb-3 mt-6 pb-2 border-b border-slate-100 dark:border-slate-800',
        3: 'text-lg font-semibold text-slate-900 dark:text-white mb-2 mt-4',
        4: 'text-base font-semibold text-slate-800 dark:text-slate-200 mb-2 mt-3',
        5: 'text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 mt-2',
        6: 'text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 mt-2 uppercase tracking-wide',
      }
      const Tag = `h${level}` as any
      return <Tag className={cls[level] ?? cls[3]}>{block.content}</Tag>
    }
    case 'text':
      return <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{block.content}</p>
    case 'list':
      return (
        <ul className="list-disc pl-5 mb-4 space-y-1.5">
          {(block.content as string[]).map((item, i) => (
            <li key={i} className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{item}</li>
          ))}
        </ul>
      )
    case 'orderedList':
      return (
        <ol className="list-decimal pl-5 mb-4 space-y-1.5">
          {(block.content as string[]).map((item, i) => (
            <li key={i} className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{item}</li>
          ))}
        </ol>
      )
    case 'code':
      return <CodeBlock content={block.content} onAskAI={onAskAI} />
    case 'table':
      return (
        <div className="overflow-x-auto mb-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800">
                {block.content.headers.map((h: string, i: number) => (
                  <th key={i} className="px-4 py-2.5 text-left font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.content.rows.map((row: string[], i: number) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/50'}>
                  {row.map((cell: string, j: number) => (
                    <td key={j} className="px-4 py-2.5 text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'image':
      return (
        <figure className="mb-4">
          <img src={block.content.url} alt={block.content.alt} className="rounded-xl w-full object-cover" />
          {block.content.caption && (
            <figcaption className="text-center text-xs text-slate-400 mt-2">{block.content.caption}</figcaption>
          )}
        </figure>
      )
    case 'callout': {
      const colorMap: Record<string, string> = {
        tip: 'bg-green-50 dark:bg-green-900/20 border-l-green-500 text-green-800 dark:text-green-300',
        info: 'bg-blue-50 dark:bg-blue-900/20 border-l-blue-500 text-blue-800 dark:text-blue-300',
        warning: 'bg-amber-50 dark:bg-amber-900/20 border-l-amber-500 text-amber-800 dark:text-amber-300',
        danger: 'bg-red-50 dark:bg-red-900/20 border-l-red-500 text-red-800 dark:text-red-300',
      }
      const emoji: Record<string, string> = { tip: '💡', info: 'ℹ️', warning: '⚠️', danger: '🚨' }
      const type = block.content.type || 'info'
      return (
        <div className={`border-l-4 px-4 py-3 rounded-r-xl mb-4 ${colorMap[type] ?? colorMap.info}`}>
          <p className="text-sm leading-relaxed">{emoji[type]} {block.content.text}</p>
        </div>
      )
    }
    case 'video': {
      const ytId = getYouTubeId(block.content.url)
      if (ytId) {
        return (
          <div className="mb-4">
            {block.content.title && <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{block.content.title}</p>}
            <div className="relative pb-[56.25%] h-0 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <iframe
                src={`https://www.youtube.com/embed/${ytId}`}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )
      }
      return (
        <div className="mb-4">
          <video src={block.content.url} controls className="w-full rounded-xl border border-slate-200 dark:border-slate-700" />
        </div>
      )
    }
    case 'quiz':
      return <QuizBlock content={block.content} />
    default:
      return null
  }
}

export default function ContentRenderer({ blocks, onAskAI }: { blocks: Block[]; onAskAI?: (code: string) => void }) {
  return (
    <article>
      {blocks.map((block, i) => <BlockRenderer key={i} block={block} onAskAI={onAskAI} />)}
    </article>
  )
}
