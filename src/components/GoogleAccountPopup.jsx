import { useState } from 'react'
import { X, User, ArrowRight, CheckCircle2, ShieldCheck, Mail } from 'lucide-react'
import { saveCustomerProfile } from '../lib/db'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export default function GoogleAccountPopup({ isOpen, onClose, onSelectAccount }) {
  const [customEmail, setCustomEmail] = useState('')
  const [customName, setCustomName] = useState('')
  const [showAddAccount, setShowAddAccount] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  // Suggested quick demo Google accounts
  const googleAccounts = [
    {
      name: 'Aditya Sharma',
      email: 'aditya.sharma@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80',
    },
    {
      name: 'Pruthvi Patil',
      email: 'pruthvi.patil@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&q=80',
    },
    {
      name: 'Rohan Deshmukh',
      email: 'rohan.deshmukh@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
    },
  ]

  const handleSelect = async (account) => {
    setIsProcessing(true)
    const profile = {
      id: 'google-' + Math.random().toString(36).substring(2, 10),
      name: account.name,
      email: account.email,
      avatar_url: account.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80',
      provider: 'google',
      created_at: new Date().toISOString(),
    }

    saveCustomerProfile(profile)

    // Sync to Supabase profiles table if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profiles').upsert({
          id: '00000000-0000-0000-0000-' + Math.floor(100000000000 + Math.random() * 900000000000),
          full_name: profile.name,
          email: profile.email,
        }).catch(() => {})
      } catch (e) {}
    }

    setTimeout(() => {
      setIsProcessing(false)
      if (onSelectAccount) {
        onSelectAccount(profile)
      }
      onClose()
    }, 400)
  }

  const handleCustomSubmit = (e) => {
    e.preventDefault()
    if (!customEmail.trim()) return

    const emailName = customEmail.split('@')[0]
    const derivedName =
      customName.trim() ||
      emailName.charAt(0).toUpperCase() + emailName.slice(1).replace(/[^a-zA-Z]/g, ' ')

    handleSelect({
      name: derivedName,
      email: customEmail.trim(),
      avatar: null,
    })
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      {/* Google Pop-up Window Dialog */}
      <div className="relative z-10 w-full max-w-[420px] my-auto max-h-[88dvh] overflow-y-auto rounded-3xl bg-[#1E1F20] border border-white/10 p-5 sm:p-8 shadow-2xl shadow-black text-left animate-fade-in-up custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Google Header */}
        <div className="text-center space-y-2 pb-4">
          <div className="flex justify-center">
            {/* Google Multicolor Logo */}
            <svg className="w-8 h-8" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-white font-heading">
            Sign in with Google
          </h3>
          <p className="text-xs text-gray-400">
            Choose an account to continue to <span className="text-white font-medium">Smiths Jewellery</span>
          </p>
        </div>

        {/* Account List */}
        {!showAddAccount ? (
          <div className="space-y-2 pt-2">
            {googleAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => handleSelect(account)}
                disabled={isProcessing}
                className="w-full flex items-center gap-3.5 p-3 rounded-2xl border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all text-left group cursor-pointer disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 shrink-0 border border-white/10">
                  <img src={account.avatar} alt={account.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors truncate">
                    {account.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{account.email}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            ))}

            {/* Use another account */}
            <button
              type="button"
              onClick={() => setShowAddAccount(true)}
              className="w-full flex items-center gap-3.5 p-3 rounded-2xl border border-dashed border-white/15 hover:border-white/30 hover:bg-white/5 transition-all text-left text-xs font-medium text-blue-400 hover:text-blue-300 cursor-pointer pt-3"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-blue-400" />
              </div>
              <span>Use another Google account</span>
            </button>
          </div>
        ) : (
          /* Custom Google Account Form */
          <form onSubmit={handleCustomSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Google / Gmail Address
              </label>
              <input
                type="email"
                required
                autoFocus
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Your Full Name (Optional)
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddAccount(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/15 text-xs text-gray-300 hover:text-white font-medium transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 py-2.5 rounded-xl bg-[#8AB4F8] text-[#1E1F20] font-bold text-xs hover:bg-[#A8C7FA] transition-colors cursor-pointer"
              >
                Continue
              </button>
            </div>
          </form>
        )}

        {/* Footer Disclaimer */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-[11px] text-gray-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>To continue, Google will share your name and email with Smiths Jewellery</span>
          </p>
        </div>
      </div>
    </div>
  )
}
