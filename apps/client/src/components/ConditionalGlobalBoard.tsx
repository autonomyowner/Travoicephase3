"use client"

import { usePathname } from "next/navigation"
import GlobalBoard from "./GlobalBoard"

export default function ConditionalGlobalBoard() {
  const pathname = usePathname()
  if (pathname === "/") {
    return null
  }
  return <GlobalBoard />
}


