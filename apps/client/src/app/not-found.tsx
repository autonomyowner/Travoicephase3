import Link from 'next/link';

export default function NotFound() {
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
        Page introuvable
      </h2>
      <p className="mb-6 text-center" style={{ color: 'var(--text-secondary)' }}>
        Désolé, la page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="matcha-btn matcha-btn-primary"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
