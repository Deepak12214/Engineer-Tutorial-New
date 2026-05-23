'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, Minimize2, Maximize2, Sparkles, Trash2 } from 'lucide-react'

interface Message { role: 'user' | 'assistant'; content: string }

const suggestedPrompts = [
  'Explain this topic in simple terms',
  'What are common interview questions here?',
  'Give me a real-world example',
  'What are the trade-offs?',
]

export default function AIChatWindow({ contextTopic, prefillCode }: { contextTopic?: string; prefillCode?: string }) {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hi! I'm your AI learning assistant${contextTopic ? ` for **${contextTopic}**` : ''}. Ask me anything about this topic — I can explain concepts, give examples, or help you prepare for interviews!` },
  ])
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // If prefillCode is set, open and pre-fill the input
  useEffect(() => {
    if (prefillCode) {
      setOpen(true)
      setInput(`Explain this code:\n\`\`\`\n${prefillCode}\n\`\`\``)
    }
  }, [prefillCode])

  async function send(text: string) {
    if (!text.trim() || streaming) return
    const userMsg: Message = { role: 'user', content: text }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setStreaming(true)

    // Add empty assistant message to stream into
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      abortRef.current = new AbortController()
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          topicContext: contextTopic,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok || !res.body) throw new Error('AI unavailable')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        full += chunk
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: full }
          return updated
        })
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: 'Sorry, AI is unavailable right now. Please check your GROQ_API_KEY in .env.local.' }
          return updated
        })
      }
    } finally {
      setStreaming(false)
    }
  }

  function clearChat() {
    if (abortRef.current) abortRef.current.abort()
    setMessages([{ role: 'assistant', content: `Hi! Ask me anything about ${contextTopic ?? 'this topic'}.` }])
    setStreaming(false)
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-accent rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-110"
        title="Ask AI Assistant"
      >
        <Bot className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
      </button>
    )
  }

  return (
    <div className={`fixed right-4 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl flex flex-col transition-all
      ${minimized ? 'bottom-4 w-72 h-14' : 'bottom-4 w-80 sm:w-96 h-[550px]'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-accent rounded-t-2xl">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-white" />
          <div>
            <p className="text-sm font-semibold text-white">AI Assistant</p>
            {!minimized && contextTopic && <p className="text-[10px] text-blue-200 truncate max-w-[160px]">{contextTopic}</p>}
          </div>
          <span className="w-2 h-2 bg-green-400 rounded-full ml-1 animate-pulse" />
        </div>
        <div className="flex items-center gap-1">
          <button onClick={clearChat} title="Clear chat" className="p-1.5 text-blue-200 hover:text-white rounded-md">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setMinimized(!minimized)} className="p-1.5 text-blue-200 hover:text-white rounded-md">
            {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => setOpen(false)} className="p-1.5 text-blue-200 hover:text-white rounded-md">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                  </div>
                )}
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap
                  ${m.role === 'user'
                    ? 'bg-accent text-white rounded-br-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm'
                  }`}
                >
                  {m.content || (i === messages.length - 1 && streaming ? (
                    <div className="flex gap-1 py-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : '…')}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Suggested prompts */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {suggestedPrompts.map(p => (
                <button key={p} onClick={() => send(p)}
                  className="text-xs px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full hover:bg-accent/10 hover:text-accent transition-colors border border-slate-200 dark:border-slate-700"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-700 flex gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
              placeholder="Ask anything... (Enter to send)"
              rows={1}
              className="flex-1 resize-none text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent placeholder-slate-400 max-h-24"
            />
            <button onClick={() => send(input)} disabled={!input.trim() || streaming}
              className="p-2.5 bg-accent text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 flex-shrink-0 self-end">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
