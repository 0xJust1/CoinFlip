import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Add validation and logging
if (!supabaseUrl) {
  console.error('VITE_SUPABASE_URL is not defined in environment variables')
}

if (!supabaseAnonKey) {
  console.error('VITE_SUPABASE_ANON_KEY is not defined in environment variables')
}

// Log the URL (without the key for security)
console.log('Supabase URL:', supabaseUrl ? 'Defined' : 'Undefined')

// Create the client with error handling
export const supabase = createClient(
  supabaseUrl || 'https://ckfdwigcijnmmxpuexjz.supabase.co', // Fallback URL
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrZmR3aWdjaWpubW14cHVleGp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MTkyMTQsImV4cCI6MjA2MDM5NTIxNH0.is_4rj2u6xxYyxKgRmwTj6RQfghuMHnTjqVU8_I8MGQ' // Fallback key
)

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