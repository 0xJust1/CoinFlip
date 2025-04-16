import { motion } from 'framer-motion';

interface GameResultProps {
  result: 'heads' | 'tails' | null;
  choice: 'heads' | 'tails' | null;
  winAmount: string | null;
}

export const GameResult = ({ result, choice, winAmount }: GameResultProps) => {
  if (!result || !choice) return null;

  const isWin = result === choice;
  const message = isWin ? 'You Won!' : 'You Lost!';
  const color = isWin ? 'text-green-400' : 'text-red-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center space-y-2"
    >
      <motion.h3 
        className={`text-3xl font-bold ${color}`}
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
      >
        {message}
      </motion.h3>
      
      <motion.p 
        className="text-xl text-gray-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {isWin ? (
          <>You won <span className="text-green-400 font-bold">{winAmount} MON</span>!</>
        ) : (
          <>Better luck next time!</>
        )}
      </motion.p>

      <motion.p 
        className="text-lg text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        The coin landed on {result.toUpperCase()}
      </motion.p>
    </motion.div>
  );
}; 