import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useContractRead, useContractWrite, useTransaction, useWatchContractEvent, usePublicClient } from 'wagmi'
import { type Log, decodeEventLog } from 'viem'
import { parseEther } from 'viem'
import './App.css'
import { AnimatedCoin } from './components/AnimatedCoin'
import { BetAmountSelector } from './components/BetAmountSelector'
import { GameResult } from './components/GameResult'
import { GameResultModal } from './components/GameResultModal'
import { Footer } from './components/Footer'
import { gameStatsService } from './services/gameStats'
import { GlobalStats } from './components/GlobalStats'

// Replace with your deployed contract address
const CONTRACT_ADDRESS = '0x4A3D7D2cE634ACe79de2DCD5461590bdf567dB29'

// Contract ABI
const CONTRACT_ABI = [{
  name: 'flip',
  type: 'function',
  stateMutability: 'payable',
  inputs: [{ type: 'bool' }],
  outputs: [{ type: 'bool' }],
}, {
  name: 'minBet',
  type: 'function',
  stateMutability: 'view',
  inputs: [],
  outputs: [{ type: 'uint256' }],
}, {
  name: 'getPlayerStats',
  type: 'function',
  stateMutability: 'view',
  inputs: [{ type: 'address' }],
  outputs: [
    { type: 'uint256' }, // totalBets
    { type: 'uint256' }, // totalWins
    { type: 'uint256' }, // totalLosses
    { type: 'uint256' }, // winRate
    { type: 'uint256' }, // totalEthBet
    { type: 'uint256' }, // totalEthWon
    { type: 'uint256' }, // totalEthLost
    { type: 'uint256' }, // bestWinStreak
  ],
}, {
  name: 'GamePlayed',
  type: 'event',
  inputs: [
    { type: 'address', name: 'player', indexed: true },
    { type: 'uint256', name: 'bet', indexed: false },
    { type: 'bool', name: 'didWin', indexed: false }
  ],
}]

// Add type definition for GamePlayed event args
type GamePlayedEvent = {
  args: {
    player: string;
    bet: bigint;
    didWin: boolean;
  };
  eventName: string;
}

// Format total won (Wei to MON, 4 decimals, with commas)
const formatMon = (wei: bigint | undefined) => {
  if (!wei) return '0.0000';
  const mon = Number(wei) / 1e18;
  return mon.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
};

function App() {
  const { address, isConnected } = useAccount()
  const [betAmount, setBetAmount] = useState('0.005')
  const [choice, setChoice] = useState<'heads' | 'tails' | null>(null)
  const [isFlipping, setIsFlipping] = useState(false)
  const [result, setResult] = useState<'heads' | 'tails' | null>(null)
  const [winAmount, setWinAmount] = useState<string | null>(null)
  const [showResultModal, setShowResultModal] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [isPlayingAgain, setIsPlayingAgain] = useState(false)
  const [activeTransactionHash, setActiveTransactionHash] = useState<string | null>(null)
  const [gameStarted, setGameStarted] = useState(false)

  const publicClient = usePublicClient()

  // Reset game state
  const resetGameState = () => {
    console.log('Resetting game state')
    setChoice(null)
    setResult(null)
    setWinAmount(null)
    setTransactionHash(null)
    setShowResultModal(false)
    setIsFlipping(false)
    setActiveTransactionHash(null)
    setGameStarted(false)
    // Reset bet amount to default
    setBetAmount('0.005')
    // Set playing again state
    setIsPlayingAgain(true)
    // Clear the playing again state after a short delay
    setTimeout(() => {
      setIsPlayingAgain(false)
    }, 100)
  }

  // Contract reads
  const { data: minBet } = useContractRead({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'minBet',
  })

  const { data: playerStats, refetch: refetchPlayerStats } = useContractRead({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getPlayerStats',
    args: [address || '0x0'],
  })

  // Type assertion for playerStats
  const stats = playerStats as [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint] | undefined;

  // Contract writes
  const { writeContract: flip, data: flipData, isPending } = useContractWrite()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useTransaction({
    hash: flipData,
  })

  // Simple choice handler
  const handleChoice = (side: 'heads' | 'tails') => {
    console.log('Choice clicked:', side)
    // Only update the choice state, don't trigger any game logic
    setChoice(side)
  }

  const handleFlip = async () => {
    if (!choice || !betAmount) {
      console.log('Cannot flip: missing choice or bet amount', { choice, betAmount })
      return
    }
    
    try {
      console.log('Starting flip with:', { choice, betAmount })
      
      // Reset states before starting new game
      setResult(null)
      setWinAmount(null)
      setTransactionHash(null)
      setShowResultModal(false)
      setIsFlipping(false)
      setActiveTransactionHash(null) // Reset active transaction hash
      setGameStarted(false) // Ensure game hasn't started yet
      
      // Send the transaction and wait for user to sign
      console.log('Sending transaction...')
      await flip({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'flip',
        args: [choice === 'heads'],
        value: parseEther(betAmount),
      })
      
      // The flipData will be updated by the wagmi hook after the transaction is sent
      console.log('Transaction sent successfully, waiting for confirmation')
      
    } catch (error) {
      console.error('Error flipping coin:', error)
      resetGameState()
    }
  }

  // Watch for flipData changes to set the active transaction
  useEffect(() => {
    if (flipData) {
      console.log('New transaction hash received:', flipData)
      setActiveTransactionHash(flipData)
    }
  }, [flipData])

  // Handle transaction confirmation and game result
  useEffect(() => {
    if (isConfirmed && flipData && publicClient && choice && !showResultModal && !isPlayingAgain && activeTransactionHash) {
      console.log('Transaction confirmed, checking if active:', { flipData, activeTransactionHash })
      
      if (flipData !== activeTransactionHash) {
        console.log('Transaction hash mismatch, ignoring')
        return
      }

      // Check if we're in the middle of a game
      if (isFlipping || gameStarted) {
        console.log('Already flipping or game started, ignoring confirmation')
        return
      }

      console.log('Transaction confirmed, starting flip')
      setGameStarted(true)
      
      const processReceipt = async (receipt: any) => {
        console.log('Transaction receipt received:', receipt)
        
        if (receipt.logs && receipt.logs.length > 0) {
          const gamePlayedLog = receipt.logs.find((log: Log) => {
            try {
              const decoded = decodeEventLog({
                abi: CONTRACT_ABI,
                data: log.data,
                topics: log.topics,
              })
              return decoded.eventName === 'GamePlayed'
            } catch (e) {
              return false
            }
          })

          if (gamePlayedLog) {
            const event = decodeEventLog({
              abi: CONTRACT_ABI,
              data: gamePlayedLog.data,
              topics: gamePlayedLog.topics,
            })

            if (event.args) {
              const args = event.args as unknown as { player: string; bet: bigint; didWin: boolean }
              const { player, didWin } = args

              if (player === address) {
                const result = choice === 'heads' ? (didWin ? 'heads' : 'tails') : (didWin ? 'tails' : 'heads')
                setResult(result)
                setIsFlipping(true)

                setTimeout(async () => {
                  setIsFlipping(false)

                  if (didWin) {
                    const winValue = (parseFloat(betAmount) * 1.9).toFixed(4)
                    setWinAmount(winValue)
                  } else {
                    setWinAmount(null)
                  }

                  if (flipData) {
                    setTransactionHash(flipData)
                  }

                  setShowResultModal(true)
                  refetchPlayerStats()

                  try {
                    await gameStatsService.recordGame({
                      wallet_address: address,
                      choice,
                      result,
                      won: didWin,
                      bet_amount: betAmount,
                      transaction_hash: flipData
                    })
                  } catch (error) {
                    console.error('Error recording game:', error)
                  }
                }, 3000)
              }
            }
          }
        }
      }

      publicClient.getTransactionReceipt({ hash: flipData })
        .then(processReceipt)
        .catch(error => {
          console.error('Error getting transaction receipt:', error)
          resetGameState()
        })
    }
  }, [isConfirmed, flipData, address, choice, betAmount, publicClient, showResultModal, isPlayingAgain, activeTransactionHash, gameStarted, refetchPlayerStats])

  // Debug event handling
  useEffect(() => {
    console.log('Event handling state:', {
      isConnected,
      isPending,
      isConfirming,
      isConfirmed,
      flipData
    })
  }, [isConnected, isPending, isConfirming, isConfirmed, flipData])

  const handlePlayAgain = () => {
    console.log('Playing again')
    // Close the modal first
    setShowResultModal(false)
    // Reset all states
    resetGameState()
    // Refresh player stats when playing again
    refetchPlayerStats()
  }

  return (
    <div className="min-h-screen bg-gray-800 text-white relative pb-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">CoinFlip</h1>
          <ConnectButton />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Game Panel */}
          <div className="bg-gray-800 p-6 rounded-lg flex-1">
            <h2 className="text-2xl font-semibold mb-6">Play CoinFlip</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Bet Amount (MON)</label>
                <BetAmountSelector
                  value={betAmount}
                  onChange={setBetAmount}
                  minBet="0.005"
                  maxBet="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Choose Side</label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => handleChoice('heads')}
                    className={`flex-1 py-2 rounded-lg transition-colors ${
                      choice === 'heads'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    }`}
                  >
                    Heads
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChoice('tails')}
                    className={`flex-1 py-2 rounded-lg transition-colors ${
                      choice === 'tails'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    }`}
                  >
                    Tails
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleFlip}
                  disabled={!isConnected || !choice || isFlipping || isConfirming}
                  className={`flex-1 py-2 rounded-lg transition-colors ${
                    !isConnected || !choice || isFlipping || isConfirming
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700'
                  } text-white`}
                >
                  {isFlipping || isConfirming ? 'Flipping...' : 'Flip Coin'}
                </button>
              </div>

              {/* Game Result */}
              {result && !isFlipping && (
                <div className="mt-4">
                  <GameResult
                    result={result}
                    choice={choice}
                    winAmount={winAmount}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Animated Coin */}
          <div className="flex-shrink-0">
            <AnimatedCoin isFlipping={isFlipping} result={result} />
          </div>

          {/* Stats Panel */}
          <div className="flex-1 space-y-8">
            {/* Player Stats */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-6">Your Stats</h2>
              
              {isConnected && address ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-400">Total Bets</p>
                      <p className="text-xl font-semibold">{stats?.[0]?.toString() || '0'}</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-400">Win Rate</p>
                      <p className="text-xl font-semibold">
                        {stats?.[3] ? (Number(stats[3]) / 100).toFixed(2) : '0'}%
                      </p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-400">Total Won</p>
                      <p className="text-xl font-semibold text-green-400">
                        {formatMon(stats?.[5])} MON
                      </p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-400">Best Streak</p>
                      <p className="text-xl font-semibold">{stats?.[7]?.toString() || '0'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">Connect your wallet to view stats</p>
                  <ConnectButton />
                </div>
              )}
            </div>

            {/* Global Stats */}
            <GlobalStats />
          </div>
        </div>
      </div>

      {/* Game Result Modal */}
      <GameResultModal
        isOpen={showResultModal}
        onClose={() => {
          console.log('Modal close clicked')
          setShowResultModal(false)
        }}
        onPlayAgain={handlePlayAgain}
        result={result}
        choice={choice}
        winAmount={winAmount}
        transactionHash={transactionHash}
      />
      <Footer />
    </div>
  )
}

export default App

