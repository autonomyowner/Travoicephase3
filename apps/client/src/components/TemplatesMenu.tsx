"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { builtInTemplates } from '../data/templates'
import { getTemplate, listTemplates, type GenerateResponse } from '../lib/api'

type Graph = GenerateResponse['map']

export default function TemplatesMenu() {
  const [open, setOpen] = useState(false)
  const [colorsOpen, setColorsOpen] = useState(false)
  const [serverTemplates, setServerTemplates] = useState<Array<{ id: string; title: string }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    const run = async () => {
      setError('')
      try {
        const tpls = await listTemplates().catch(() => [])
        if (!mounted) return
        setServerTemplates(tpls.map((t) => ({ id: t.id, title: t.title })))
      } catch (e: unknown) {
        if (!mounted) return
        setError(e instanceof Error ? e.message : 'Failed to load templates')
      }
    }
    run()
    return () => { mounted = false }
  }, [])

  const builtins = useMemo(() => builtInTemplates.map((t) => ({ id: t.id, title: t.title + ' (built-in)' })), [])
  const hasServer = serverTemplates.length > 0

  const applyTemplate = useCallback(async (id: string, isBuiltIn: boolean) => {
    setLoading(true)
    setError('')
    try {
      let graph: Graph | null = null
      if (isBuiltIn) {
        const tpl = builtInTemplates.find((t) => t.id === id)
        graph = tpl?.graph ?? null
      } else {
        const tpl = await getTemplate(id)
        graph = tpl.graph
      }
      if (graph) {
        window.dispatchEvent(new CustomEvent('nc-apply-template-structure', { detail: graph }))
        setOpen(false)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to apply template')
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="fixed bottom-4 left-4 z-40 pointer-events-auto flex items-center gap-2">
      <div>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="rounded-full border border-white/25 bg-black/50 px-3 py-1.5 text-xs text-white hover:bg-white/10 shadow-xl"
        >
          Templates
        </button>

        {open && (
          <div
            role="dialog"
            aria-label="Templates menu"
            className="mt-2 w-72 rounded-lg border border-white/20 bg-black/70 backdrop-blur p-2 shadow-2xl"
          >
            {error ? <p className="text-xs text-red-300" role="alert">{error}</p> : null}
            <div className="max-h-64 overflow-auto space-y-2">
              {hasServer && (
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-white/70 px-1 mb-1">Your templates</div>
                  <ul className="space-y-1">
                    {serverTemplates.map((t) => (
                      <li key={t.id}>
                        <button
                          onClick={() => applyTemplate(t.id, false)}
                          disabled={loading}
                          className="w-full text-left rounded-md border border-white/15 px-2 py-1 text-sm hover:bg-white/10 disabled:opacity-50"
                        >{t.title}</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <div className="text-[11px] uppercase tracking-wide text-white/70 px-1 mb-1">Built-in</div>
                <ul className="space-y-1">
                  {builtins.map((t) => (
                    <li key={t.id}>
                      <button
                        onClick={() => applyTemplate(t.id, true)}
                        disabled={loading}
                        className="w-full text-left rounded-md border border-white/15 px-2 py-1 text-sm hover:bg-white/10 disabled:opacity-50"
                      >{t.title}</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Colors menu */}
      <div>
        <button
          onClick={() => setColorsOpen((v) => !v)}
          aria-expanded={colorsOpen}
          className="rounded-full border border-white/25 bg-black/50 px-3 py-1.5 text-xs text-white hover:bg-white/10 shadow-xl"
        >
          Colors
        </button>
        {colorsOpen && (
          <div
            role="dialog"
            aria-label="Colors menu"
            className="mt-2 w-72 rounded-lg border border-white/20 bg-black/70 backdrop-blur p-2 shadow-2xl"
          >
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                ['emerald','Professional','bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900'],
                ['sapphire','Premium','bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'],
                ['goldenMajesty','Luxury','bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900'],
                ['silver','Elegant','bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900'],
                ['royalPurple','Royal','bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'],
                ['crimson','Bold','bg-gradient-to-br from-slate-900 via-red-900 to-slate-900'],
                ['teal','Calming','bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900'],
                ['indigo','Intellectual','bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900'],
                ['rose','Romantic','bg-gradient-to-br from-slate-900 via-rose-900 to-slate-900'],
                ['vibrantGold','Vibrant Gold','bg-gradient-to-br from-slate-900 via-amber-400 to-slate-900'],
                ['richGold','Rich Gold','bg-gradient-to-br from-slate-900 via-amber-600 to-slate-900'],
                ['brightGold','Bright Gold','bg-gradient-to-br from-slate-900 via-yellow-500 to-slate-900'],
                ['warmOrange','Warm Orange','bg-gradient-to-br from-slate-900 via-orange-500 to-slate-900']
              ].map(([value, label, cls]) => (
                <button
                  key={value}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('nc-set-theme', { detail: value }))
                    setColorsOpen(false)
                  }}
                  className="flex items-center gap-2 rounded-md border border-white/15 p-2 hover:bg-white/10"
                >
                  <span className={`inline-block h-6 w-6 rounded ${cls}`} aria-hidden />
                  <span className="text-white">{label}</span>
                </button>
              ))}
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('nc-set-theme', { detail: '' }))
                  setColorsOpen(false)
                }}
                className="col-span-2 rounded-md border border-white/15 p-2 hover:bg-white/10 text-white"
              >Default</button>
            </div>
          </div>
        )}
      </div>

      {/* Add Handle mode */}
      <div>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('nc-start-add-handle', { detail: 'source' }))}
          className="rounded-full border border-white/25 bg-black/50 px-3 py-1.5 text-xs text-white hover:bg-white/10 shadow-xl"
        >Add Point</button>
      </div>
    </div>
  )
}


