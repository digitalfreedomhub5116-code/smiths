import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { saveCustomerProfile } from '../lib/db'

export default function AuthCallbackPage() {
  const [statusText, setStatusText] = useState('Connecting Google Account...')

  useEffect(() => {
    let isMounted = true

    async function processAuth() {
      if (supabase) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession()
          if (error) throw error

          if (session?.user) {
            const u = session.user
            const profile = {
              id: u.id,
              name:
                u.user_metadata?.full_name ||
                u.user_metadata?.name ||
                u.email?.split('@')[0] ||
                'Google Collector',
              email: u.email,
              phone: u.user_metadata?.phone || '',
              avatar_url:
                u.user_metadata?.avatar_url ||
                u.user_metadata?.picture ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80',
              provider: 'google',
              created_at: new Date().toISOString(),
            }

            saveCustomerProfile(profile)

            // Upsert profile in Supabase public.profiles table
            try {
              await supabase.from('profiles').upsert({
                id: u.id,
                full_name: profile.name,
                email: profile.email,
                avatar_url: profile.avatar_url,
              })
            } catch (err) {
              console.warn('Profiles table sync warning:', err)
            }

            if (isMounted) setStatusText('Signed in successfully! Returning...')

            // If this was opened in a popup window
            if (window.opener) {
              try {
                window.opener.postMessage(
                  { type: 'OAUTH_AUTH_SUCCESS', session, profile },
                  '*'
                )
              } catch (err) {}
              setTimeout(() => {
                window.close()
              }, 300)
              return
            }
          }
        } catch (e) {
          console.warn('Auth callback parsing error', e)
        }
      }

      const returnTo = sessionStorage.getItem('smiths_oauth_return_to') || '/'
      sessionStorage.removeItem('smiths_oauth_return_to')

      setTimeout(() => {
        window.location.href = returnTo
      }, 500)
    }

    processAuth()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center text-cream p-4 text-center">
      <div className="h-10 w-10 rounded-full border-2 border-gold border-t-transparent animate-spin mb-4" />
      <p className="text-sm font-heading font-semibold tracking-wide text-cream mb-1">{statusText}</p>
      <p className="text-xs text-cream-muted/60">Securing your session with Smiths Jewellery...</p>
    </div>
  )
}
