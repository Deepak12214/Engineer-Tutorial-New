export const dynamic = 'force-dynamic'

﻿import { NextRequest, NextResponse } from 'next/server'

const PISTON_URL = 'https://emkc.org/api/v2/piston/execute'

const languageMap: Record<string, string> = {
  JavaScript: 'javascript',
  Python: 'python',
  Java: 'java',
  'C++': 'cpp',
  Go: 'go',
  Rust: 'rust',
  SQL: 'sqlite3',
  Bash: 'bash',
  TypeScript: 'typescript',
  Ruby: 'ruby',
}

const rateLimitMap = new Map<string, { count: number; reset: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + 60000 })
    return true
  }
  if (entry.count >= 10) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again in a minute.' }, { status: 429 })
  }

  const { language, code, stdin = '' } = await req.json()
  const pistonLang = languageMap[language] ?? language.toLowerCase()

  try {
    const res = await fetch(PISTON_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: pistonLang,
        version: '*',
        files: [{ name: 'main', content: code }],
        stdin,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `Execution failed: ${err}` }, { status: 500 })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Code execution service unavailable' }, { status: 503 })
  }
}
