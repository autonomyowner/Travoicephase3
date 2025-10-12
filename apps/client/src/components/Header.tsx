"use client"

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { deleteMap, listMaps } from '../lib/api'

export default function Header() {
  const router = useRouter()
  const [authed, setAuthed] = useState(false)
  useEffect(() => {
    const mounted = true
    supabase?.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setAuthed(Boolean(data.session))
    })
    const { data: sub } = supabase?.auth.onAuthStateChange((_e, session) => setAuthed(Boolean(session))) ?? { data: { subscription: { unsubscribe() {} } } }
    return () => { sub?.subscription?.unsubscribe?.() }
  }, [])

  const handleNewMap = useCallback(() => {
    router.push('/')
  }, [router])

  const [menuOpen, setMenuOpen] = useState(false)
  const [maps, setMaps] = useState<Array<{ id: string; title: string; created_at: string }>>([])

  useEffect(() => {
    if (!authed) return
    let mounted = true
    listMaps().then((m) => { if (mounted) setMaps(m) }).catch(() => {})
    return () => { mounted = false }
  }, [authed])

  const handleClearAll = useCallback(async () => {
    if (!maps.length) return
    const ok = window.confirm('Clear all maps? This cannot be undone.')
    if (!ok) return
    try {
      await Promise.allSettled(maps.map((m) => deleteMap(m.id)))
      setMaps([])
    } catch {}
  }, [maps])

  return (
    <div className="w-full rounded-none md:rounded-lg border-b md:border md:border-white/15 bg-white/5 backdrop-blur">
      <div className="flex items-center gap-3 px-3 py-2">
        {/* Left: Logo */}
          <Link
            href="/"
            className="shrink-0 text-lg font-semibold select-none bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-red-900 to-slate-900"
            aria-label="TRAVoices Home"
          >
          TRAVoices
        </Link>

        {/* Center: Nav + Search */}
        <div className="hidden md:flex items-center gap-2 ml-2">
          <Link href="/" className="px-2 py-1 text-sm rounded hover:bg-white/10 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">Home</Link>
          <Link href="/pricing" className="px-2 py-1 text-sm rounded hover:bg-white/10 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">Pricing</Link>
          <Link href="/vision" className="px-2 py-1 text-sm rounded hover:bg-white/10 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">Vision</Link>
          <Link href="/rooms" className="px-2 py-1 text-sm rounded hover:bg-white/10 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">Rooms</Link>
          <div className="relative">
            <button onClick={() => setMenuOpen((v) => !v)} className="px-2 py-1 text-sm rounded hover:bg-white/10 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">Calls</button>
            {menuOpen ? (
              <div className="absolute left-0 mt-2 w-64 rounded-md border border-white/15 bg-black/70 backdrop-blur shadow-xl p-2 z-50">
                <div className="text-xs uppercase tracking-wide text-white/70 px-1 pb-1">Your calls</div>
                <ul className="max-h-60 overflow-auto space-y-1">
                  {maps.map((m) => (
                    <li key={m.id} className="flex items-center justify-between gap-2 rounded px-2 py-1 hover:bg-white/10">
                      <Link href={`/maps/${m.id}`} className="truncate text-sm">{m.title}</Link>
                      <button
                        onClick={async (e) => { e.preventDefault(); e.stopPropagation(); try { await deleteMap(m.id); setMaps((prev) => prev.filter((x) => x.id !== m.id)) } catch {} }}
                        className="text-xs rounded border border-white/20 px-2 py-0.5 hover:bg-white/10"
                        title="Delete call"
                      >Clear</button>
                    </li>
                  ))}
                  {maps.length === 0 && <li className="px-2 py-1 text-sm text-white/60">No calls</li>}
                </ul>
                <div className="mt-2 flex justify-end">
                  <button onClick={handleClearAll} disabled={!maps.length} className="text-xs rounded border border-white/20 px-2 py-1 hover:bg-white/10 disabled:opacity-50">Clear all</button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="ml-2 flex-1 hidden md:flex">
          <label className="relative w-full" aria-label="Search">
            <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-white/60">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </span>
            <input
              className="w-full rounded-md border border-white/15 bg-white/5 pl-8 pr-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-white/25 placeholder:text-white/60"
              placeholder="Search calls…"
              aria-label="Search calls"
            />
          </label>
        </div>

        {/* Right: Actions */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleNewMap}
            className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-slate-900 bg-gradient-to-r from-yellow-400 to-amber-500 shadow hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6z"/>
            </svg>
            Start Call
          </button>
          {authed ? (
            <button onClick={() => supabase?.auth.signOut()} className="rounded-md border px-3 py-1.5 text-sm border-white/15 hover:bg-white/10">Logout</button>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="rounded-md border px-3 py-1.5 text-sm border-white/15 hover:bg-white/10 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">Login</Link>
              <Link href="/signup" className="rounded-md border px-3 py-1.5 text-sm border-white/15 hover:bg-white/10 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


