"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabase"

export default function LogoutPage() {
  const router = useRouter()
  useEffect(() => {
    let active = true
    const run = async () => {
      await supabase?.auth.signOut()
      if (active) router.replace("/")
    }
    run()
    return () => { active = false }
  }, [router])
  return <div className="p-6 text-sm opacity-70">Signing out…</div>
}


