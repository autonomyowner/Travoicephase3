"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Header() {
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

  return (
    <div className="flex items-center justify-between py-2">
      <Link href="/" className="text-lg font-semibold">NeuroCanvas</Link>
      <nav className="flex items-center gap-3 text-sm">
        <Link href="/maps" className="underline underline-offset-4">My Maps</Link>
        {authed ? (
          <>
            <button onClick={() => supabase?.auth.signOut()} className="rounded-md border px-3 py-1 border-black/10 dark:border-white/15">Logout</button>
          </>
        ) : (
          <>
            <Link href="/login" className="rounded-md border px-3 py-1 border-black/10 dark:border-white/15">Login</Link>
            <Link href="/signup" className="rounded-md border px-3 py-1 border-black/10 dark:border-white/15">Sign up</Link>
          </>
        )}
      </nav>
    </div>
  )
}


