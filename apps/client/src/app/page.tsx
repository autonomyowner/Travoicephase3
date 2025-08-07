"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { generateMap, getHealth, API_BASE_URL } from "../lib/api"
import { saveMap } from "../lib/api"
import { listMaps } from "../lib/api"
import dynamic from "next/dynamic"
import { supabase } from "../lib/supabase"
const MapCanvas = dynamic(() => import("../components/MapCanvas"), { ssr: false })
const AuthGate = dynamic(() => import("../components/AuthGate"), { ssr: false })

export default function Home() {
  const router = useRouter()
  const [health, setHealth] = useState<string>("")
  const [input, setInput] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [result, setResult] = useState<{ summary: string; nodes: number; edges: number; map?: { nodes: Array<{ id: string; label: string; position?: { x: number; y: number } }>; edges: Array<{ id: string; source: string; target: string; label?: string }> } } | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>("")
  const [myMaps, setMyMaps] = useState<Array<{ id: string; title: string; created_at: string }>>([])

  useEffect(() => {
    let cancelled = false
    const handleFetchHealth = async () => {
      try {
        const h = await getHealth()
        if (cancelled) return
        setHealth(`${h.status} (uptime: ${Math.floor(h.uptime)}s) — ${API_BASE_URL}`)
      } catch {
        if (cancelled) return
        setHealth(`unreachable — ${API_BASE_URL}`)
      }
    }
    handleFetchHealth()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let active = true
    const checkOnboarding = async () => {
      const session = (await supabase?.auth.getSession())?.data.session
      if (!active || !session) return
      const { data: profile } = await supabase!
        .from("users")
        .select("onboarded")
        .eq("id", session.user.id)
        .maybeSingle()
      if (!active) return
      if (profile && profile.onboarded === false) {
        router.replace("/onboarding")
      }
    }
    checkOnboarding()
    return () => { active = false }
  }, [router])

  const handleLoadMaps = async () => {
    try {
      const maps = await listMaps()
      setMyMaps(maps)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load maps')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    if (!input.trim()) {
      setError("Please enter some text to generate a map.")
      return
    }
    setIsSubmitting(true)
    try {
      const data = await generateMap(input)
      setResult({ summary: data.summary, nodes: data.map.nodes.length, edges: data.map.edges.length, map: data.map })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate map")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="font-sans min-h-screen p-8 sm:p-12 bg-background text-foreground">
      <main className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">NeuroCanvas</h1>
          <p className="text-sm text-black/60 dark:text-white/60">Server health: {health || "checking..."}</p>
        </header>

        <AuthGate>
        <section aria-labelledby="generate-heading" className="space-y-4">
          <h2 id="generate-heading" className="text-lg font-medium">Generate a mind map</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <label htmlFor="thoughts" className="block text-sm font-medium">Your thoughts</label>
            <textarea
              id="thoughts"
              name="thoughts"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={5}
              className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent p-3 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/25"
              placeholder="Write anything..."
              aria-describedby="help-text"
            />
            <p id="help-text" className="text-xs text-black/60 dark:text-white/60">We will parse this into a simple map (mocked for now).</p>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center rounded-md bg-black text-white px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black"
              >
                {isSubmitting ? "Generating..." : "Generate"}
              </button>
              {error ? <span role="alert" className="text-sm text-red-600">{error}</span> : null}
            </div>
          </form>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">My maps</h2>
            <button onClick={handleLoadMaps} className="rounded-md border px-3 py-1.5 text-sm border-black/10 dark:border-white/15">Refresh</button>
          </div>
          <ul className="space-y-2">
            {myMaps.map((m) => (
              <li key={m.id} className="text-sm opacity-80">{m.title} — <span className="opacity-60">{new Date(m.created_at).toLocaleString()}</span></li>
            ))}
            {myMaps.length === 0 && <li className="text-sm opacity-60">No maps yet.</li>}
          </ul>
        </section>

        {result ? (
          <section aria-live="polite" className="space-y-2 border-t pt-6 border-black/10 dark:border-white/10">
            <h3 className="text-base font-semibold">Result</h3>
            <p className="text-sm">{result.summary}</p>
            <p className="text-sm text-black/60 dark:text-white/60">Nodes: {result.nodes} · Edges: {result.edges}</p>
            {result.map ? (
              <div className="pt-2">
                <MapCanvas
                  nodes={result.map.nodes}
                  edges={result.map.edges}
                  readOnly={false}
                  enableToolbar
                  onChange={(next) => setResult((r) => (r ? { ...r, map: next } : r))}
                />
              </div>
            ) : null}
            <div className="pt-2">
              <button
                className="rounded-md bg-black text-white px-3 py-1.5 text-sm dark:bg-white dark:text-black disabled:opacity-50"
                disabled={saving || !result.map}
                onClick={async () => {
                  if (!result?.map) return
                  setSaving(true)
                  setError('')
                  try {
                    await saveMap({ title: 'Generated Map', graph: result.map })
                  } catch (e: unknown) {
                    setError(e instanceof Error ? e.message : 'Failed to save map')
                  } finally {
                    setSaving(false)
                  }
                }}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </section>
        ) : null}
        </AuthGate>
      </main>
    </div>
  )
}
