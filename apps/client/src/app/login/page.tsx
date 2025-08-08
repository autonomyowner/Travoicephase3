"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase, supabaseConfigured } from "../../lib/supabase"

function LoginBody() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const init = async () => {
      const res = await supabase?.auth.getSession()
      const data = res?.data
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
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
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
    return (
      <div className="p-6 text-sm text-red-600">Supabase is not configured. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.</div>
    )
  }

  if (loading) return <div className="p-6 text-sm opacity-70">Checking session…</div>

  return (
    <main className="relative">
      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{
          backgroundColor: '#fff8dc',
          backgroundImage: 'radial-gradient(rgba(201,162,39,0.6) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          backgroundPosition: '0 0',
        }}
      />
      <section className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2 text-slate-900">
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
          <p className="text-slate-700 text-sm">Log in with a magic link or continue with your favorite provider.</p>
        </div>

        <div className="rounded-xl border border-black/10 bg-white/70 backdrop-blur p-6 text-slate-900">
          <form onSubmit={handleEmailLogin} className="space-y-3">
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-md border border-black/20 bg-white/70 p-2 outline-none focus:ring-2 focus:ring-amber-400/50"
              required
            />
            <button
              aria-label="Send magic link to email"
              className="w-full inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 font-semibold text-slate-900 bg-gradient-to-r from-yellow-400 to-amber-500 shadow hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              Send magic link
            </button>
          </form>

          <div className="my-4 flex items-center gap-3 text-slate-600">
            <div className="h-px flex-1 bg-black/10" />
            <span className="text-xs">or</span>
            <div className="h-px flex-1 bg-black/10" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleOAuth("google")}
              aria-label="Continue with Google"
              className="rounded-md border border-black/15 bg-white/60 px-3 py-2 text-sm hover:bg-white/80"
            >
              Google
            </button>
            <button
              onClick={() => handleOAuth("github")}
              aria-label="Continue with GitHub"
              className="rounded-md border border-black/15 bg-white/60 px-3 py-2 text-sm hover:bg-white/80"
            >
              GitHub
            </button>
          </div>

          {status && <p className="mt-3 text-sm text-slate-700" role="status">{status}</p>}
        </div>

        <p className="text-center text-sm text-slate-800">
          New here? <a href="/signup" className="underline underline-offset-4">Create an account</a>
        </p>
      </section>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm opacity-70">Loading…</div>}>
      <LoginBody />
    </Suspense>
  )
}


