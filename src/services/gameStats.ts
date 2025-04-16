import { supabase, type GameRecord, type GameStats } from '../lib/supabase'

const emptyStats: GameStats = {
  total_games: 0,
  total_wins: 0,
  total_losses: 0,
  heads_count: 0,
  tails_count: 0
}

export const gameStatsService = {
  // Record a new game
  async recordGame(gameData: Omit<GameRecord, 'id' | 'created_at'>): Promise<void> {
    const { error: gameError } = await supabase
      .from('game_records')
      .insert([gameData])

    if (gameError) {
      console.error('Error recording game:', gameError)
      throw gameError
    }

    // Update global stats
    const { error: statsError } = await supabase
      .rpc('update_global_stats', {
        p_won: gameData.won,
        p_choice: gameData.choice
      })

    if (statsError) {
      console.error('Error updating global stats:', statsError)
      throw statsError
    }
  },

  // Get global game statistics
  async getGlobalStats(): Promise<GameStats> {
    try {
      const { data, error } = await supabase
        .from('global_stats')
        .select('*')
        .single()

      if (error) {
        console.error('Error fetching global stats:', error)
        return emptyStats
      }

      return {
        total_games: data.total_games || 0,
        total_wins: data.total_wins || 0,
        total_losses: data.total_losses || 0,
        heads_count: data.heads_count || 0,
        tails_count: data.tails_count || 0
      }
    } catch (error) {
      console.error('Error in getGlobalStats:', error)
      return emptyStats
    }
  },

  // Get player-specific statistics
  async getPlayerStats(walletAddress: string): Promise<GameStats> {
    try {
      const { data, error } = await supabase
        .rpc('get_player_stats', { p_wallet_address: walletAddress })
        .single()

      if (error) {
        console.error('Error fetching player stats:', error)
        return emptyStats
      }

      return {
        total_games: (data as GameStats).total_games || 0,
        total_wins: (data as GameStats).total_wins || 0,
        total_losses: (data as GameStats).total_losses || 0,
        heads_count: (data as GameStats).heads_count || 0,
        tails_count: (data as GameStats).tails_count || 0
      }
    } catch (error) {
      console.error('Error in getPlayerStats:', error)
      return emptyStats
    }
  },

  // Get recent games
  async getRecentGames(limit: number = 10): Promise<GameRecord[]> {
    try {
      const { data, error } = await supabase
        .from('game_records')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching recent games:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getRecentGames:', error)
      return []
    }
  },

  // Get player's recent games
  async getPlayerRecentGames(walletAddress: string, limit: number = 10): Promise<GameRecord[]> {
    try {
      const { data, error } = await supabase
        .from('game_records')
        .select('*')
        .eq('wallet_address', walletAddress)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching player recent games:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getPlayerRecentGames:', error)
      return []
    }
  }
} 