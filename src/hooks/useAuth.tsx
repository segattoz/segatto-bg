import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client'
import type { Profile } from '@/types'

interface AuthContextValue {
  user: Profile | null
  loading: boolean
  isMockAuth: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const MOCK_SESSION_KEY = 'pulse-crm.mock-session'

function loadMockProfile(): Profile | null {
  const raw = localStorage.getItem(MOCK_SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Profile
  } catch {
    return null
  }
}

function profileFromEmail(email: string): Profile {
  const namePart = email.split('@')[0]?.replace(/[._-]/g, ' ') ?? 'Usuário'
  const name = namePart.replace(/\b\w/g, (c) => c.toUpperCase())
  return { id: 'demo-user', name, email, createdAt: new Date().toISOString() }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setUser(loadMockProfile())
      setLoading(false)
      return
    }
    const client = supabase

    client.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        const { data: profile } = await client
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .maybeSingle()
        setUser(
          profile
            ? { id: profile.id, name: profile.name, email: profile.email, createdAt: profile.created_at }
            : profileFromEmail(data.session.user.email ?? ''),
        )
      }
      setLoading(false)
    })

    const { data: subscription } = client.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(profileFromEmail(session.user.email ?? ''))
      } else {
        setUser(null)
      }
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      if (!email || !password) return { error: 'Informe e-mail e senha' }
      const profile = profileFromEmail(email)
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(profile))
      setUser(profile)
      return { error: null }
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { error: null }
  }, [])

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      localStorage.removeItem(MOCK_SESSION_KEY)
      setUser(null)
      return
    }
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, isMockAuth: !isSupabaseConfigured, signIn, signOut }),
    [user, loading, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
