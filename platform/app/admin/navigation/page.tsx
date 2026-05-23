'use client'

import { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Plus, Trash2, Save, GripVertical, ChevronDown, Eye, EyeOff, Megaphone } from 'lucide-react'

export default function AdminNavigationPage() {
  const [announcement, setAnnouncement] = useState({
    enabled: true,
    text: '🚀 New Course: AWS for Engineers — now live! Use code LAUNCH50 for 50% off',
    link: '/learn/aws/fundamentals/intro',
    bgColor: '#2563eb',
  })

  const [headerLinks, setHeaderLinks] = useState([
    { id: '1', label: 'Learn', type: 'dropdown', href: '/learn', visible: true },
    { id: '2', label: 'Blogs', type: 'link', href: '/blogs', visible: true },
    { id: '3', label: 'Playground', type: 'link', href: '/playground', visible: true },
    { id: '4', label: 'Pricing', type: 'link', href: '/pricing', visible: true },
    { id: '5', label: 'Roadmaps', type: 'link', href: '/roadmaps', visible: false },
  ])

  const [cta, setCta] = useState({ label: 'Get Started', href: '/register' })
  const [footerBrand, setFooterBrand] = useState('Learn system design, Kafka, LLD, and more — built by engineers from top companies.')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  function updateLink(id: string, field: string, val: any) {
    setHeaderLinks(prev => prev.map(l => l.id === id ? { ...l, [field]: val } : l))
  }

  function removeLink(id: string) {
    setHeaderLinks(prev => prev.filter(l => l.id !== id))
  }

  function addLink() {
    setHeaderLinks(prev => [...prev, { id: Date.now().toString(), label: 'New Link', type: 'link', href: '/', visible: true }])
  }

  async function save() {
    setSaving(true)
    try {
      await Promise.all([
        fetch('/api/admin/site-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'announcement_bar', value: announcement }),
        }),
        fetch('/api/admin/site-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'header_nav', value: { links: headerLinks, cta, footerBrand } }),
        }),
      ])
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    setSaving(false)
  }

  return (
    <AdminLayout title="Navigation Builder">
      <div className="max-w-4xl space-y-6">

        {/* Preview */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Live Preview</span>
            <span className="text-xs text-slate-400">Changes reflected below</span>
          </div>
          {announcement.enabled && (
            <div className="px-4 py-1.5 text-center text-white text-xs font-medium" style={{ background: announcement.bgColor }}>
              {announcement.text}
            </div>
          )}
          <div className="px-4 py-3 flex items-center gap-6 border-b border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-900 dark:text-white text-sm">Engineer<span className="text-accent">Tutorial</span></span>
            <div className="flex gap-4">
              {headerLinks.filter(l => l.visible).map(l => (
                <span key={l.id} className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-0.5">
                  {l.label}
                  {l.type === 'dropdown' && <ChevronDown className="w-3 h-3" />}
                </span>
              ))}
            </div>
            <div className="ml-auto">
              <span className="px-3 py-1 bg-accent text-white text-xs font-bold rounded-lg">{cta.label}</span>
            </div>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-slate-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Announcement Bar</h3>
            </div>
            <button onClick={() => setAnnouncement(a => ({ ...a, enabled: !a.enabled }))}
              className={`relative inline-flex w-10 h-5 rounded-full transition-colors ${announcement.enabled ? 'bg-accent' : 'bg-slate-200 dark:bg-slate-700'}`}>
              <span className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-all ${announcement.enabled ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
          {announcement.enabled && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1.5">Message</label>
                <input value={announcement.text} onChange={e => setAnnouncement(a => ({ ...a, text: e.target.value }))}
                  className="w-full text-sm py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-slate-800" />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1.5">Link URL</label>
                <input value={announcement.link} onChange={e => setAnnouncement(a => ({ ...a, link: e.target.value }))}
                  className="w-full text-sm py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-slate-800" />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1.5">Background Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={announcement.bgColor} onChange={e => setAnnouncement(a => ({ ...a, bgColor: e.target.value }))}
                    className="w-10 h-9 rounded border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5" />
                  <input value={announcement.bgColor} onChange={e => setAnnouncement(a => ({ ...a, bgColor: e.target.value }))}
                    className="flex-1 text-sm py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-slate-800 font-mono" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Header Links */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Header Navigation Links</h3>
            <button onClick={addLink} className="flex items-center gap-1.5 text-xs text-accent font-medium hover:underline">
              <Plus className="w-3.5 h-3.5" /> Add Link
            </button>
          </div>

          <div className="space-y-2">
            {headerLinks.map(link => (
              <div key={link.id} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-accent/40 transition-colors">
                <GripVertical className="w-4 h-4 text-slate-400 cursor-grab flex-shrink-0" />

                <input value={link.label} onChange={e => updateLink(link.id, 'label', e.target.value)}
                  className="w-28 text-sm py-1.5 px-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent font-medium" />

                <input value={link.href} onChange={e => updateLink(link.id, 'href', e.target.value)}
                  className="flex-1 text-sm py-1.5 px-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent font-mono text-slate-500" />

                <select value={link.type} onChange={e => updateLink(link.id, 'type', e.target.value)}
                  className="text-xs py-1.5 px-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none">
                  <option value="link">Link</option>
                  <option value="dropdown">Dropdown</option>
                </select>

                <button onClick={() => updateLink(link.id, 'visible', !link.visible)}
                  className={`p-1.5 rounded-lg ${link.visible ? 'text-accent bg-accent/10' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  {link.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <button onClick={() => removeLink(link.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-4">CTA Button</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 block mb-1.5">Button Label</label>
              <input value={cta.label} onChange={e => setCta(c => ({ ...c, label: e.target.value }))}
                className="w-full text-sm py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-slate-800" />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1.5">Button URL</label>
              <input value={cta.href} onChange={e => setCta(c => ({ ...c, href: e.target.value }))}
                className="w-full text-sm py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-slate-800" />
            </div>
          </div>
        </div>

        {/* Footer brand */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-4">Footer Description</h3>
          <textarea value={footerBrand} onChange={e => setFooterBrand(e.target.value)} rows={3}
            className="w-full text-sm py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-slate-800 resize-none" />
        </div>

        {/* Save */}
        <div className="flex items-center justify-end gap-3">
          {saved && <span className="text-sm text-green-600 dark:text-green-400 font-medium">✓ Changes saved!</span>}
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-accent text-white font-semibold rounded-xl hover:bg-blue-700 text-sm disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Navigation'}
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
