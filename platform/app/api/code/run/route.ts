export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

const WANDBOX_API = 'https://wandbox.org/api'

// Maps our UI language names to Wandbox's "language" field in /api/list.json
const LANG_MAP: Record<string, string> = {
  'C++': 'C++',
  Python: 'Python',
  JavaScript: 'JavaScript',
  Java: 'Java',
  Go: 'Go',
  Rust: 'Rust',
  Ruby: 'Ruby',
  Bash: 'Bash script',
  TypeScript: 'TypeScript',
}

let compilerMapCache: Record<string, string> | null = null

async function getCompilerMap(): Promise<Record<string, string>> {
  if (compilerMapCache) return compilerMapCache

  try {
    const res = await fetch(`${WANDBOX_API}/list.json`, { cache: 'no-store' })
    if (!res.ok) throw new Error('list fetch failed')
    const list: Array<{ name: string; language: string }> = await res.json()

    const groups: Record<string, string[]> = {}
    for (const item of list) {
      if (!groups[item.language]) groups[item.language] = []
      groups[item.language].push(item.name)
    }

    const map: Record<string, string> = {}
    for (const [lang, compilers] of Object.entries(groups)) {
      // Prefer the first non-head stable release; fall back to head if nothing else
      const stable = compilers.find(c => !c.includes('head'))
      map[lang] = stable ?? compilers[0]
    }

    compilerMapCache = map
    return map
  } catch {
    // Hardcoded fallback using confirmed real Wandbox compiler names
    compilerMapCache = {
      'C++': 'gcc-13.2.0',
      Python: 'cpython-3.14.0',
      JavaScript: 'nodejs-20.17.0',
      Java: 'openjdk-jdk-22+36',
      Go: 'go-1.23.2',
      Rust: 'rust-1.82.0',
      Ruby: 'ruby-4.0.2',
      'Bash script': 'bash',
      TypeScript: 'typescript-5.6.2',
    }
    return compilerMapCache
  }
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

  if (language === 'SQL') {
    return NextResponse.json({
      run: { stdout: 'SQL execution coming soon.', stderr: '', code: 0 },
    })
  }

  const wandboxLang = LANG_MAP[language]
  if (!wandboxLang) {
    return NextResponse.json({ error: `Language "${language}" is not supported.` }, { status: 400 })
  }

  const compilerMap = await getCompilerMap()
  const compiler = compilerMap[wandboxLang]
  if (!compiler) {
    return NextResponse.json({ error: `No compiler found for "${language}".` }, { status: 400 })
  }

  try {
    const res = await fetch(`${WANDBOX_API}/compile.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ compiler, code, stdin, save: false }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `Execution failed: ${err}` }, { status: 500 })
    }

    const data = await res.json()

    return NextResponse.json({
      compile: data.compiler_error ? { stderr: data.compiler_error } : undefined,
      run: {
        stdout: data.program_output ?? '',
        stderr: data.program_error ?? '',
        code: parseInt(data.status ?? '0', 10),
        output: data.program_output || data.program_error || '',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Code execution service unavailable' }, { status: 503 })
  }
}
