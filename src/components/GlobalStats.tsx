import { useState, useEffect } from 'react'
import { gameStatsService } from '../services/gameStats'
import type { GameStats } from '../lib/supabase'

export const GlobalStats = () => {
  const [stats, setStats] = useState<GameStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const globalStats = await gameStatsService.getGlobalStats()
        setStats(globalStats)
      } catch (error) {
        console.error('Error loading global stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-6">Global Statistics</h2>
        <div className="text-center py-4">Loading...</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-6">Global Statistics</h2>
        <div className="text-center py-4 text-red-400">Failed to load statistics</div>
      </div>
    )
  }

  const winRate = stats.total_games > 0 
    ? ((stats.total_wins / stats.total_games) * 100).toFixed(1)
    : '0.0'

  const headsPercentage = stats.total_games > 0
    ? ((stats.heads_count / stats.total_games) * 100).toFixed(1)
    : '0.0'

  const tailsPercentage = stats.total_games > 0
    ? ((stats.tails_count / stats.total_games) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-2xl font-semibold mb-6">Global Statistics</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-400">Total Games</p>
          <p className="text-xl font-semibold">{stats.total_games}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-400">Win Rate</p>
          <p className="text-xl font-semibold">{winRate}%</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-400">Heads</p>
          <p className="text-xl font-semibold">{headsPercentage}%</p>
          <p className="text-sm text-gray-400">({stats.heads_count} games)</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-400">Tails</p>
          <p className="text-xl font-semibold">{tailsPercentage}%</p>
          <p className="text-sm text-gray-400">({stats.tails_count} games)</p>
        </div>
      </div>
    </div>
  )
} 