"use client"

import { usePathname } from "next/navigation"
import GlobalBoard from "./GlobalBoard"

export default function ConditionalGlobalBoard() {
  const pathname = usePathname()
  // Hide the global board on non-editor pages
  if (pathname === "/") return null
  if (pathname?.startsWith("/pricing")) return null
  if (pathname?.startsWith("/login")) return null
  if (pathname?.startsWith("/signup")) return null
  if (pathname?.startsWith("/logout")) return null
  return <GlobalBoard />
}


