"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase, supabaseConfigured } from "../../lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const init = async () => {
      const { data } = await supabase?.auth.getSession()
      if (!mounted) return
      if (data?.session) {
        const redirect = params.get("redirect") || "/"
        router.replace(redirect)
        return
      }
      setLoading(false)
    }
    init()
    return () => { mounted = false }
  }, [params, router])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setStatus("Sending magic link…")
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    })
    setStatus(error ? `Error: ${error.message}` : "Check your email for a magic link.")
  }

  const handleOAuth = async (provider: "google" | "github") => {
    if (!supabase) return
    setStatus(`Redirecting to ${provider}…`)
    const { error } = await supabase.auth.signInWithOAuth({ provider })
    if (error) setStatus(`Error: ${error.message}`)
  }

  if (!supabaseConfigured) {
    return <div className="p-6 text-sm text-red-600">Supabase is not configured. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.</div>
  }

  if (loading) return <div className="p-6 text-sm opacity-70">Checking session…</div>

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Log in</h1>
        <p className="text-sm opacity-70">Use a magic link or OAuth provider.</p>
      </div>
      <form onSubmit={handleEmailLogin} className="space-y-3">
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent p-2"
          required
        />
        <button className="rounded-md bg-black text-white px-4 py-2 text-sm dark:bg-white dark:text-black">Send magic link</button>
      </form>
      <div className="flex items-center gap-2">
        <button onClick={() => handleOAuth("google")} className="rounded-md border px-3 py-1.5 text-sm border-black/10 dark:border-white/15">Continue with Google</button>
        <button onClick={() => handleOAuth("github")} className="rounded-md border px-3 py-1.5 text-sm border-black/10 dark:border-white/15">GitHub</button>
      </div>
      {status && <p className="text-sm opacity-70">{status}</p>}
    </div>
  )
}


