export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

const PISTON_API = 'https://emkc.org/api/v2/piston/execute'

const languageMap: Record<string, { language: string; version: string }> = {
  JavaScript: { language: 'javascript', version: '18.15.0' },
  Python:     { language: 'python',     version: '3.10.0' },
  Java:       { language: 'java',       version: '15.0.2' },
  'C++':      { language: 'c++',        version: '10.2.0' },
  Go:         { language: 'go',         version: '1.16.2' },
  Rust:       { language: 'rust',       version: '1.50.0' },
  Bash:       { language: 'bash',       version: '5.1.0' },
}

// Simple in-memory rate limit: 10 runs/min per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= 10) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded. Max 10 runs/minute.' }, { status: 429 })
  }

  const { language, code, stdin } = await req.json()

  if (language === 'SQL') {
    return NextResponse.json({
      error: 'SQL execution runs in-browser via WebAssembly. No server needed.',
    }, { status: 400 })
  }

  const lang = languageMap[language]
  if (!lang) {
    return NextResponse.json({ error: `Unsupported language: ${language}` }, { status: 400 })
  }

  try {
    const res = await fetch(PISTON_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: lang.language,
        version: lang.version,
        files: [{ content: code }],
        stdin: stdin ?? '',
        run_timeout: 5000,
        compile_timeout: 10000,
        run_memory_limit: 262144,
      }),
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Execution service unavailable. Try again.' }, { status: 502 })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to reach execution service.' }, { status: 502 })
  }
}
