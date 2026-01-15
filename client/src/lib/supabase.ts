import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente Supabase não configuradas')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos
export interface Profile {
  id: string
  name: string | null
  role: 'user' | 'admin'
  theme_preference: 'light' | 'dark'
  created_at: string
  updated_at: string
}

export interface Order {
  id: number
  user_id: string
  client_code: string
  product: string
  volume: number
  revenue: number
  created_at: string
  updated_at: string
}

export interface CustomField {
  id: number
  name: string
  type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DROPDOWN'
  options: string[] | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RankingMetric {
  id: number
  metric_name: string
  weight: string
  is_active: boolean
  created_at: string
  updated_at: string
}
