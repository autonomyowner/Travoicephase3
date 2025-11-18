"use client"

import Link from 'next/link'
import { useCallback, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()

  const handleNewMap = useCallback(() => {
    router.push('/')
  }, [router])

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="w-full rounded-none md:rounded-lg border-b md:border md:border-white/15 bg-white/5 backdrop-blur">
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Hamburger Menu Button (Mobile Only) */}
        <button
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="md:hidden flex flex-col gap-1 p-2 rounded hover:bg-white/10"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className="w-5 h-0.5 bg-white transition-transform" />
          <span className="w-5 h-0.5 bg-white transition-transform" />
          <span className="w-5 h-0.5 bg-white transition-transform" />
        </button>

        {/* Left: Logo */}
        <Link
          href="/"
          className="shrink-0 text-base md:text-lg font-semibold select-none bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-red-900 to-slate-900"
          aria-label="TRAVoices Home"
        >
          TRAVoices
        </Link>

        {/* Center: Nav + Search (Desktop) */}
        <div className="hidden md:flex items-center gap-2 ml-2">
          <Link href={pathname?.startsWith('/ar') ? '/ar' : '/'} className="px-2 py-1 text-sm rounded hover:bg-white/10 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
            {pathname?.startsWith('/ar') ? 'الرئيسية' : 'Home'}
          </Link>
          <Link href={pathname?.startsWith('/ar') ? '/ar/vision' : '/vision'} className="px-2 py-1 text-sm rounded hover:bg-white/10 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
            {pathname?.startsWith('/ar') ? 'الرؤية' : 'Vision'}
          </Link>
          <Link href={pathname?.startsWith('/ar') ? '/ar/rooms' : '/rooms'} className="px-2 py-1 text-sm rounded hover:bg-white/10 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
            {pathname?.startsWith('/ar') ? 'الغرف' : 'Rooms'}
          </Link>
          <Link href={pathname?.startsWith('/ar') ? '/ar/investors' : '/investors'} className="px-2 py-1 text-sm rounded hover:bg-white/10 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
            {pathname?.startsWith('/ar') ? 'المستثمرون' : 'Investors'}
          </Link>

        </div>
        <div className="ml-2 flex-1 hidden md:flex">
          <label className="relative w-full" aria-label="Search">
            <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-white/60">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </span>
            <input
              className="w-full rounded-md border border-white/15 bg-white/5 pl-8 pr-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-white/25 placeholder:text-white/60"
              placeholder={pathname?.startsWith('/ar') ? 'بحث في المكالمات...' : 'Search calls…'}
              aria-label={pathname?.startsWith('/ar') ? 'بحث في المكالمات' : 'Search calls'}
            />
          </label>
        </div>

        {/* Right: Actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Language Switcher */}
          <Link
            href={pathname?.startsWith('/ar') ? pathname.replace('/ar', '') || '/' : `/ar${pathname === '/' ? '' : pathname}`}
            className="inline-flex items-center gap-1 rounded-md px-2 md:px-3 py-1.5 text-xs md:text-sm font-medium border border-white/15 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-red-900 to-slate-900"
            aria-label="Switch language"
            title={pathname?.startsWith('/ar') ? 'Switch to English' : 'Switch to Arabic'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
            </svg>
            <span className="hidden md:inline">{pathname?.startsWith('/ar') ? 'EN' : 'ع'}</span>
          </Link>
          
          <button
            onClick={handleNewMap}
            className="inline-flex items-center gap-1 md:gap-2 rounded-md px-2 md:px-3 py-1.5 text-xs md:text-sm font-medium text-slate-900 bg-gradient-to-r from-yellow-400 to-amber-500 shadow hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6z"/>
            </svg>
            <span className="hidden sm:inline">{pathname?.startsWith('/ar') ? 'بدء مكالمة' : 'Start Call'}</span>
            <span className="sm:hidden">{pathname?.startsWith('/ar') ? 'مكالمة' : 'Call'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/15 bg-white/5 backdrop-blur">
          <nav className="flex flex-col px-3 py-2 space-y-1" role="navigation" aria-label="Mobile navigation">
            <Link 
              href={pathname?.startsWith('/ar') ? '/ar' : '/'} 
              className="px-3 py-2 text-sm rounded hover:bg-white/10 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-red-900 to-slate-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              {pathname?.startsWith('/ar') ? 'الرئيسية' : 'Home'}
            </Link>
            <Link 
              href={pathname?.startsWith('/ar') ? '/ar/vision' : '/vision'} 
              className="px-3 py-2 text-sm rounded hover:bg-white/10 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-red-900 to-slate-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              {pathname?.startsWith('/ar') ? 'الرؤية' : 'Vision'}
            </Link>
            <Link
              href={pathname?.startsWith('/ar') ? '/ar/rooms' : '/rooms'}
              className="px-3 py-2 text-sm rounded hover:bg-white/10 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-red-900 to-slate-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              {pathname?.startsWith('/ar') ? 'الغرف' : 'Rooms'}
            </Link>
            <Link
              href={pathname?.startsWith('/ar') ? '/ar/investors' : '/investors'}
              className="px-3 py-2 text-sm rounded hover:bg-white/10 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-red-900 to-slate-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              {pathname?.startsWith('/ar') ? 'المستثمرون' : 'Investors'}
            </Link>


            {/* Search in Mobile */}
            <div className="pt-2">
              <label className="relative w-full" aria-label={pathname?.startsWith('/ar') ? 'بحث' : 'Search'}>
                <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-white/60">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                </span>
                <input
                  className="w-full rounded-md border border-white/15 bg-white/5 pl-8 pr-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-white/25 placeholder:text-white/60"
                  placeholder={pathname?.startsWith('/ar') ? 'بحث في المكالمات...' : 'Search calls…'}
                  aria-label={pathname?.startsWith('/ar') ? 'بحث في المكالمات' : 'Search calls'}
                />
              </label>
            </div>

            {/* Language Switcher in Mobile */}
            <div className="border-t border-white/10 pt-2 mt-2">
              <Link
                href={pathname?.startsWith('/ar') ? pathname.replace('/ar', '') || '/' : `/ar${pathname === '/' ? '' : pathname}`}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 text-sm rounded border border-white/15 hover:bg-white/10 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-red-900 to-slate-900"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Switch language"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
                </svg>
                {pathname?.startsWith('/ar') ? 'Switch to English' : 'التبديل إلى العربية'}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}
