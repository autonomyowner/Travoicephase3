"use client"

import { useEffect, useState } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabase'

type Props = { children: React.ReactNode }

export default function AuthGate({ children }: Props) {
  const [loading, setLoading] = useState(true)
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    let mounted = true
    const init = async () => {
      if (!supabase) {
        setIsAuthed(false)
        setLoading(false)
        return
      }
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setIsAuthed(!!data.session)
      setLoading(false)
    }
    init()
    return () => { mounted = false }
  }, [])

  if (loading) return <div className="text-sm opacity-70">Checking session…</div>
  if (!isAuthed) return <LoginForm />
  return <>{children}</>
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<string>('')
  if (!supabaseConfigured) {
    return <p className="text-sm text-red-600">Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.</p>
  }
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setStatus('Sending magic link…')
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } })
    setStatus(error ? `Error: ${error.message}` : 'Check your email for a magic link.')
  }
  return (
    <form onSubmit={handleLogin} className="space-y-3">
      <h3 className="text-base font-semibold">Log in</h3>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent p-2"
        required
      />
      <button className="rounded-md bg-black text-white px-4 py-2 text-sm dark:bg-white dark:text-black">Send magic link</button>
      {status && <p className="text-sm opacity-70">{status}</p>}
    </form>
  )
}


