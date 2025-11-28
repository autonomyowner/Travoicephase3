'use client';

import Link from 'next/link';
import { useLanguage } from '../components/LanguageProvider';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--cream-50)' }}
    >
      <h1
        className="text-6xl mb-4"
        style={{
          fontFamily: 'var(--font-dm-serif), Georgia, serif',
          color: 'var(--matcha-600)',
        }}
      >
        404
      </h1>
      <h2
        className="text-2xl mb-2"
        style={{
          fontFamily: 'var(--font-dm-serif), Georgia, serif',
          color: 'var(--text-primary)',
        }}
      >
        {t.notFound.title}
      </h2>
      <p className="mb-6 text-center" style={{ color: 'var(--text-secondary)' }}>
        {t.notFound.description}
      </p>
      <Link
        href="/"
        className="matcha-btn matcha-btn-primary"
      >
        {t.notFound.backHome}
      </Link>
    </div>
  );
}
