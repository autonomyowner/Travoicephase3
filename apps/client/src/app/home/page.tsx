"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import AuthGate from "@/components/AuthGate"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function HomePage() {
  const router = useRouter()

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Mindmap Home</h1>
        <Link href="/maps" className="text-sm underline underline-offset-4">My Maps</Link>
      </div>
      <AuthGate>
        <p className="text-white/80">Welcome back. Use the header toolbar to create a new map or open one of your existing maps.</p>
      </AuthGate>
    </div>
  )
}


