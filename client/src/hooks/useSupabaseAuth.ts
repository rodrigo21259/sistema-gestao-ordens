import { useEffect, useState, useCallback } from 'react'
import { supabase, Profile } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  error: string | null
}

export function useSupabaseAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
  })

  // Extrair nome do email
  const extractNameFromEmail = useCallback((email: string): string => {
    const namePart = email.split('@')[0]
    const names = namePart.split('.')
    return names
      .map(name => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase())
      .join(' ')
  }, [])

  // Buscar perfil
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
        return null
      }
      return data as Profile | null
    } catch (err) {
      console.error('Error fetching profile:', err)
      return null
    }
  }, [])

  // Criar perfil
  const createProfile = useCallback(async (userId: string, email: string) => {
    try {
      const name = extractNameFromEmail(email)
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          name,
          role: 'user',
          theme_preference: 'light',
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
        return null
      }
      return data as Profile
    } catch (err) {
      console.error('Error creating profile:', err)
      return null
    }
  }, [extractNameFromEmail])

  // Inicializar
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        let profile = await fetchProfile(session.user.id)
        if (!profile && session.user.email) {
          profile = await createProfile(session.user.id, session.user.email)
        }
        setState({
          user: session.user,
          profile,
          session,
          loading: false,
          error: null,
        })
      } else {
        setState(prev => ({ ...prev, loading: false }))
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          let profile = await fetchProfile(session.user.id)
          if (!profile && session.user.email) {
            profile = await createProfile(session.user.id, session.user.email)
          }
          setState({
            user: session.user,
            profile,
            session,
            loading: false,
            error: null,
          })
        } else {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: null,
          })
        }
      }
    )

    return () => subscription?.unsubscribe()
  }, [fetchProfile, createProfile])

  const signUp = async (email: string, password: string) => {
    try {
      if (!email.endsWith('@investsmart.com.br')) {
        throw new Error('Use um email @investsmart.com.br')
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao registrar'
      setState(prev => ({ ...prev, error: message }))
      throw err
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login'
      setState(prev => ({ ...prev, error: message }))
      throw err
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer logout'
      setState(prev => ({ ...prev, error: message }))
      throw err
    }
  }

  return {
    user: state.user,
    profile: state.profile,
    session: state.session,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.user,
    isAdmin: state.profile?.role === 'admin',
    signUp,
    signIn,
    signOut,
    extractNameFromEmail,
  }
}
