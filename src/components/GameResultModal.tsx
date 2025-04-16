import { Fragment, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { motion } from 'framer-motion'
import { TrophyIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface GameResultModalProps {
  isOpen: boolean
  onClose: () => void
  onPlayAgain: () => void
  result: 'heads' | 'tails' | null
  choice: 'heads' | 'tails' | null
  winAmount: string | null
  transactionHash: string | null
}

export function GameResultModal({ isOpen, onClose, onPlayAgain, result, choice, winAmount, transactionHash }: GameResultModalProps) {
  // Debug props
  useEffect(() => {
    console.log('GameResultModal props:', {
      isOpen,
      result,
      choice,
      winAmount,
      transactionHash
    })
  }, [isOpen, result, choice, winAmount, transactionHash])

  const isWin = result === choice

  console.log('GameResultModal rendering with isOpen:', isOpen)

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="absolute right-4 top-4">
                  <button
                    type="button"
                    className="rounded-lg p-1 text-gray-400 hover:text-white"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="flex justify-center mb-4"
                  >
                    <div className={`rounded-full p-4 ${isWin ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      <TrophyIcon className={`h-12 w-12 ${isWin ? 'text-green-500' : 'text-red-500'}`} />
                    </div>
                  </motion.div>

                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold leading-6 text-center mb-2"
                  >
                    {isWin ? 'You Won! 🎉' : 'Better Luck Next Time! 🎲'}
                  </Dialog.Title>

                  <div className="mt-4 space-y-4">
                    <div className="text-center">
                      <p className="text-gray-400">Your Choice</p>
                      <p className="text-xl font-semibold capitalize">{choice}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-gray-400">Result</p>
                      <p className="text-xl font-semibold capitalize">{result}</p>
                    </div>

                    {isWin && (
                      <div className="text-center">
                        <p className="text-gray-400">Won Amount</p>
                        <p className="text-xl font-semibold text-green-500">{winAmount} MON</p>
                      </div>
                    )}

                    {transactionHash && (
                      <div className="text-center">
                        <a
                          href={`https://testnet.monadexplorer.com/tx/${transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-400 hover:text-primary-300 text-sm"
                        >
                          View Transaction
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      className="w-full btn-primary"
                      onClick={onPlayAgain}
                    >
                      Play Again
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 