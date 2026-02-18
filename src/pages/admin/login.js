// src/pages/admin/login.js
import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('password') // 'password' or 'magic'

  async function handlePasswordLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      router.push('/admin')
    }
  }

  async function handleMagicLink(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    })
    if (authError) {
      setError(authError.message)
    } else {
      setError('')
      alert('Check your email for a login link!')
    }
    setLoading(false)
  }

  return (
    <>
      <Head>
        <title>Admin Login | RELUXE Med Spa</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6">RELUXE Admin</h1>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
          )}

          {mode === 'password' ? (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-neutral-800 disabled:opacity-50 transition"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={() => setMode('magic')}
                className="w-full text-sm text-neutral-500 hover:text-black transition"
              >
                Use magic link instead
              </button>
            </form>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-neutral-800 disabled:opacity-50 transition"
              >
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>
              <button
                type="button"
                onClick={() => setMode('password')}
                className="w-full text-sm text-neutral-500 hover:text-black transition"
              >
                Use password instead
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
