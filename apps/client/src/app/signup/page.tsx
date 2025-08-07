"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase, supabaseConfigured } from "../../lib/supabase"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    supabase?.auth.getSession().then(({ data }) => {
      if (!mounted) return
      if (data.session) router.replace("/")
      else setLoading(false)
    })
    return () => { mounted = false }
  }, [router])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setStatus("Creating account…")
    const { error } = await supabase.auth.signUp({ email, password })
    setStatus(error ? `Error: ${error.message}` : "Check your email to confirm your account.")
  }

  if (!supabaseConfigured) {
    return <div className="p-6 text-sm text-red-600">Supabase is not configured. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.</div>
  }
  if (loading) return <div className="p-6 text-sm opacity-70">Checking session…</div>

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Create account</h1>
      </div>
      <form onSubmit={handleSignup} className="space-y-3">
        <label className="block text-sm font-medium" htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent p-2" required />
        <label className="block text-sm font-medium" htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent p-2" required />
        <button className="rounded-md bg-black text-white px-4 py-2 text-sm dark:bg-white dark:text-black">Sign up</button>
      </form>
      {status && <p className="text-sm opacity-70">{status}</p>}
    </div>
  )
}


