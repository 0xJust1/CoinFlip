import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export type GameRecord = {
  id: number
  created_at: string
  wallet_address: string
  choice: 'heads' | 'tails'
  result: 'heads' | 'tails'
  won: boolean
  bet_amount: string
  transaction_hash: string
}

export type GameStats = {
  total_games: number
  total_wins: number
  total_losses: number
  heads_count: number
  tails_count: number
} 