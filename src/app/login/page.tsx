'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Lock, User } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/crm';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        router.push(redirect);
      } else {
        setError('Invalid username or password.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const destination = redirect === '/admin' ? 'Admin' : 'CRM';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1a12] via-[#1b2b23] to-[#0d1410] flex items-center justify-center px-4">

      {/* Subtle botanical background texture */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.04]">
        <svg viewBox="0 0 800 800" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <circle cx="200" cy="200" r="180" fill="#8ba888" />
          <circle cx="600" cy="600" r="220" fill="#8ba888" />
          <circle cx="700" cy="150" r="120" fill="#c05d33" />
        </svg>
      </div>

      <div className="relative w-full max-w-sm">

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Image
                src="/images/jimbo_logo.png"
                alt="Jimbo's Nursery"
                width={90}
                height={90}
                className="brightness-0 invert opacity-85"
                unoptimized
              />
            </div>
            <h1 className="font-serif text-3xl font-semibold text-nursery-ivory">
              {destination} Login
            </h1>
            <p className="mt-2 text-sm text-nursery-ivory/45">
              Jimbo&apos;s Nursery &amp; Landscaping
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-nursery-ivory/50">
                Username
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 focus-within:border-nursery-sage/60 transition-colors">
                <User className="h-4 w-4 shrink-0 text-nursery-ivory/30" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  autoComplete="username"
                  className="flex-1 bg-transparent text-sm text-nursery-ivory placeholder:text-nursery-ivory/25 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-nursery-ivory/50">
                Password
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 focus-within:border-nursery-sage/60 transition-colors">
                <Lock className="h-4 w-4 shrink-0 text-nursery-ivory/30" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="flex-1 bg-transparent text-sm text-nursery-ivory placeholder:text-nursery-ivory/25 outline-none"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 text-center -mb-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-nursery-terracotta py-3 text-sm font-bold text-nursery-ivory transition hover:bg-nursery-terracotta/85 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.2em] text-nursery-ivory/20">
          © 2026 Jimbo&apos;s Nursery &amp; Landscaping
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
