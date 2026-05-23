'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import { Play, RotateCcw, Copy, ChevronDown, Terminal } from 'lucide-react'

const languages = ['JavaScript', 'Python', 'Java', 'C++', 'Go', 'Rust', 'SQL', 'Bash']

const starterCode: Record<string, string> = {
  JavaScript: `// Write your JavaScript code here
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

// Test
console.log(twoSum([2, 7, 11, 15], 9));  // [0, 1]
console.log(twoSum([3, 2, 4], 6));        // [1, 2]`,
  Python: `# Write your Python code here
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Test
print(two_sum([2, 7, 11, 15], 9))  # [0, 1]
print(two_sum([3, 2, 4], 6))       # [1, 2]`,
  Java: `// Write your Java code here
import java.util.*;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
  'C++': `#include <bits/stdc++.h>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> map;
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (map.count(complement))
            return {map[complement], i};
        map[nums[i]] = i;
    }
    return {};
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    auto result = twoSum(nums, 9);
    cout << result[0] << " " << result[1] << endl;
    return 0;
}`,
  Go: `package main

import "fmt"

func twoSum(nums []int, target int) []int {
    seen := make(map[int]int)
    for i, num := range nums {
        complement := target - num
        if j, ok := seen[complement]; ok {
            return []int{j, i}
        }
        seen[num] = i
    }
    return nil
}

func main() {
    result := twoSum([]int{2, 7, 11, 15}, 9)
    fmt.Println(result) // [0 1]
}`,
  SQL: `-- Write your SQL here
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (id, name, email) VALUES
  (1, 'Alice', 'alice@example.com'),
  (2, 'Bob', 'bob@example.com'),
  (3, 'Charlie', 'charlie@example.com');

SELECT id, name, email FROM users ORDER BY name;`,
  Rust: `fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
    use std::collections::HashMap;
    let mut map: HashMap<i32, usize> = HashMap::new();
    for (i, &num) in nums.iter().enumerate() {
        let complement = target - num;
        if let Some(&j) = map.get(&complement) {
            return vec![j as i32, i as i32];
        }
        map.insert(num, i);
    }
    vec![]
}

fn main() {
    let result = two_sum(vec![2, 7, 11, 15], 9);
    println!("{:?}", result); // [0, 1]
}`,
  Bash: `#!/bin/bash
# Simple bash example
echo "Hello from EngineerTutorial Playground!"

# Array example
fruits=("apple" "banana" "cherry")
for fruit in "\${fruits[@]}"; do
    echo "Fruit: $fruit"
done

# String manipulation
greeting="Hello, World!"
echo "Length: \${#greeting}"
echo "Uppercase: \${greeting^^}"`,
}


export default function PlaygroundPage() {
  const [lang, setLang] = useState('Python')
  const [code, setCode] = useState(starterCode['Python'])
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [stdin, setStdin] = useState('')
  const [showStdin, setShowStdin] = useState(false)

  async function runCode() {
    setRunning(true)
    setOutput('> Executing...')
    try {
      const res = await fetch('/api/code/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang, code, stdin }),
      })
      const data = await res.json()

      if (!res.ok) {
        setOutput(`Error: ${data.error}`)
        return
      }

      const run = data.run ?? {}
      const compile = data.compile ?? {}
      const lines: string[] = []

      if (compile.stderr) lines.push(`Compile Error:\n${compile.stderr}`)
      if (compile.output && !compile.stderr) lines.push(`Compiled OK`)

      const stdout = run.stdout?.trimEnd()
      const stderr = run.stderr?.trimEnd()

      if (stdout) lines.push(stdout)
      if (stderr) lines.push(`\nStderr:\n${stderr}`)
      if (!stdout && !stderr) lines.push('(no output)')

      const time = run.cpu_time != null ? `${(run.cpu_time * 1000).toFixed(1)}ms` : ''
      const mem = run.memory != null ? `${(run.memory / 1024).toFixed(1)} MB` : ''
      const exitCode = run.code ?? 0
      const status = exitCode === 0 ? '✓' : `✗ Exit code ${exitCode}`
      lines.push(`\n${status}${time ? ` | ${time}` : ''}${mem ? ` | ${mem}` : ''}`)

      setOutput(lines.join('\n'))
    } catch {
      setOutput('Error: Could not reach execution service.')
    } finally {
      setRunning(false)
    }
  }

  function selectLang(l: string) {
    setLang(l)
    setCode(starterCode[l])
    setOutput('')
    setLangOpen(false)
  }

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-slate-900 px-4 py-2 flex items-center gap-3 border-b border-slate-800">
          <div className="relative">
            <button onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-slate-200 text-sm rounded-lg hover:bg-slate-700 border border-slate-700 font-mono">
              {lang} <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {langOpen && (
              <div className="absolute top-full left-0 mt-1 w-36 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-10 overflow-hidden">
                {languages.map(l => (
                  <button key={l} onClick={() => selectLang(l)}
                    className={`block w-full text-left px-3 py-2 text-sm font-mono hover:bg-slate-700 ${l === lang ? 'text-accent' : 'text-slate-300'}`}>
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={runCode} disabled={running}
            className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-60">
            {running
              ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Running...</>
              : <><Play className="w-3.5 h-3.5" /> Run</>
            }
          </button>

          <button onClick={() => setCode(starterCode[lang])}
            className="flex items-center gap-1 px-3 py-1.5 text-slate-400 hover:text-white text-sm rounded-lg hover:bg-slate-800">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>

          <button onClick={() => navigator.clipboard.writeText(code)}
            className="flex items-center gap-1 px-3 py-1.5 text-slate-400 hover:text-white text-sm rounded-lg hover:bg-slate-800">
            <Copy className="w-3.5 h-3.5" /> Copy
          </button>

          <button onClick={() => setShowStdin(!showStdin)}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg hover:bg-slate-800 ${showStdin ? 'text-yellow-400' : 'text-slate-400 hover:text-white'}`}>
            <Terminal className="w-3.5 h-3.5" /> Stdin
          </button>

          <div className="ml-auto text-xs text-slate-500 hidden sm:block">
            Press <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-300 font-mono">Ctrl+Enter</kbd> to run
          </div>
        </div>

        {/* Editor + Output */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-950">
          {/* Code editor (textarea-based for simplicity) */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-800">
            <div className="flex items-center px-4 py-2 bg-slate-900 border-b border-slate-800">
              <span className="text-xs text-slate-500 font-mono">main.{lang === 'Python' ? 'py' : lang === 'JavaScript' ? 'js' : lang === 'Java' ? 'java' : lang === 'C++' ? 'cpp' : lang === 'Go' ? 'go' : lang === 'Rust' ? 'rs' : lang === 'SQL' ? 'sql' : 'sh'}</span>
            </div>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) runCode() }}
              className="flex-1 bg-slate-950 text-slate-100 font-mono text-sm p-4 resize-none focus:outline-none leading-relaxed"
              spellCheck={false}
              style={{ tabSize: 4 }}
            />
            {showStdin && (
              <div className="border-t border-slate-800">
                <div className="px-4 py-1.5 bg-slate-900 text-xs text-yellow-400 font-semibold">Stdin (input)</div>
                <textarea
                  value={stdin}
                  onChange={e => setStdin(e.target.value)}
                  placeholder="Provide stdin input for your program..."
                  className="w-full h-24 bg-slate-900 text-slate-300 font-mono text-sm p-3 resize-none focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Output panel */}
          <div className="h-64 md:h-auto md:w-80 lg:w-96 flex flex-col bg-slate-950 border-t md:border-t-0 border-slate-800">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Output</span>
              {output && (
                <span className={`text-xs font-medium ${output.includes('✓') ? 'text-green-400' : output.includes('Error') ? 'text-red-400' : 'text-slate-400'}`}>
                  {output.includes('✓') ? '● Success' : output.includes('Error') ? '● Error' : '● ...'}
                </span>
              )}
            </div>
            <pre className="flex-1 p-4 text-sm font-mono text-slate-300 overflow-auto leading-relaxed whitespace-pre-wrap">
              {output || <span className="text-slate-600">Click "Run" to execute your code...</span>}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
