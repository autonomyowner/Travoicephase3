'use client';

import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--cream-50)' }}>
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-0 w-[400px] h-[400px] opacity-20"
          style={{
            background:
              'radial-gradient(circle, var(--matcha-200) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(-20%, -30%)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[300px] h-[300px] opacity-15"
          style={{
            background:
              'radial-gradient(circle, var(--terra-300) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(20%, 30%)',
          }}
        />
      </div>

      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link
              href="/"
              className="inline-block text-2xl font-semibold mb-6"
              style={{
                fontFamily: 'var(--font-dm-serif), Georgia, serif',
                color: 'var(--matcha-600)',
              }}
            >
              TRAVoices
            </Link>
            <h1
              className="text-3xl mb-2"
              style={{
                fontFamily: 'var(--font-dm-serif), Georgia, serif',
                color: 'var(--text-primary)',
              }}
            >
              Create Your Account
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Join TRAVoices and start translating
            </p>
          </div>

          {/* Clerk SignUp Component */}
          <div className="flex justify-center">
            <SignUp
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'rounded-3xl shadow-lg border border-[var(--border-soft)]',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtonsBlockButton: 'rounded-xl',
                  formButtonPrimary: 'bg-[var(--matcha-500)] hover:bg-[var(--matcha-600)] rounded-xl',
                  footerActionLink: 'text-[var(--matcha-600)] hover:text-[var(--matcha-700)]',
                },
              }}
              routing="hash"
              fallbackRedirectUrl="/dashboard"
              signInUrl="/login"
            />
          </div>

          {/* Terms */}
          <p
            className="mt-6 text-center text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
