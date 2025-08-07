"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import AuthGate from '../../components/AuthGate'
import { listMaps } from '../../lib/api'

export default function MapsPage() {
  const [maps, setMaps] = useState<Array<{ id: string; title: string; created_at: string }>>([])
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let mounted = true
    const run = async () => {
      try {
        const data = await listMaps()
        if (!mounted) return
        setMaps(data)
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Failed to load maps'
        if (!mounted) return
        setErr(message)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => { mounted = false }
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">My Maps</h1>
      <AuthGate>
        {loading ? <p className="text-sm opacity-70">Loading…</p> : null}
        {err ? <p className="text-sm text-red-600">{err}</p> : null}
        <ul className="space-y-2">
          {maps.map((m) => (
            <li key={m.id} className="text-sm opacity-80">
              <Link className="underline underline-offset-4" href={`/maps/${m.id}`}>{m.title}</Link>
              <span className="opacity-60"> — {new Date(m.created_at).toLocaleString()}</span>
            </li>
          ))}
          {maps.length === 0 && !loading && <li className="text-sm opacity-60">No maps yet.</li>}
        </ul>
      </AuthGate>
    </div>
  )
}


