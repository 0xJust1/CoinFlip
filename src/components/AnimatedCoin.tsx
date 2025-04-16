import { motion } from 'framer-motion';

interface AnimatedCoinProps {
  isFlipping: boolean;
  result: 'heads' | 'tails' | null;
}

export const AnimatedCoin = ({ isFlipping, result }: AnimatedCoinProps) => {
  // Calculate final rotation based on result
  const getFinalRotation = () => {
    if (!result) return 0;
    // For tails, we want the back face showing (180 degrees)
    return result === 'tails' ? 180 : 0;
  };

  // Gold and silver color schemes
  const gold = {
    outer: "linear-gradient(45deg, #b8860b, #ffd700, #b8860b)",
    inner: "linear-gradient(45deg, #ffd700, #fff8dc, #ffd700)",
    face: "radial-gradient(circle at 30% 30%, #ffd700, #b8860b)",
    rim: "linear-gradient(45deg, #b8860b, #ffd700, #b8860b)",
    glow: "0 0 60px 20px #ffe066, 0 0 0 0 #fff"
  };
  const silver = {
    outer: "linear-gradient(45deg, #888 0%, #e0e0e0 80%, #888 100%)",
    rim: "linear-gradient(45deg, #b0b0b0 0%, #e0e0e0 60%, #444 100%)",
    inner: "linear-gradient(45deg, #fff 0%, #cccccc 80%, #888 100%)",
    face: "radial-gradient(circle at 30% 30%, #f0f0f0 60%, #b0b0b0 100%)",
    glow: "0 0 0 4px #b0b0b0, 0 0 60px 20px #e0e0e0, 0 0 30px 10px #b0b0b0, 0 0 10px 2px #888"
  };

  // Use gold or silver scheme based on result
  const scheme = result === 'tails' ? silver : gold;
  const borderColor = result === 'tails' ? '#b0b0b0' : '#b8860b';

  return (
    <div className="flex justify-center items-center my-8" style={{ perspective: '1000px' }}>
      <motion.div
        className="relative w-32 h-32"
        animate={isFlipping ? {
          rotateY: [0, 1800, 1800 + getFinalRotation()],
          scale: [1, 1.2, 1],
        } : {
          rotateY: getFinalRotation(),
          scale: 1,
        }}
        transition={{
          duration: isFlipping ? 3 : 0,
          ease: "easeInOut",
          times: [0, 0.8, 1],
        }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Coin border - outer ring */}
        <motion.div
          className="absolute w-full h-full rounded-full"
          style={{
            background: scheme.outer,
            transform: "translateZ(-4px)",
            boxShadow: scheme.glow,
            backfaceVisibility: "hidden",
            border: `2px solid ${borderColor}`,
          }}
        />
        {/* Coin border - inner ring (same size for both coins) */}
        <motion.div
          className="absolute w-[95%] h-[95%] rounded-full"
          style={{
            background: scheme.inner,
            transform: "translateZ(-2px)",
            top: "2.5%",
            left: "2.5%",
            backfaceVisibility: "hidden",
            border: `2.5px solid ${borderColor}`,
          }}
        />
        {/* Coin edge - detailed rim (same size for both coins) */}
        <motion.div
          className="absolute w-[90%] h-[90%] rounded-full"
          style={{
            background: scheme.rim,
            transform: "translateZ(-3px)",
            boxShadow: scheme.glow,
            backfaceVisibility: "hidden",
            border: `2.5px solid ${borderColor}`,
            top: "5%",
            left: "5%",
          }}
        />
        {/* Front face (Heads) */}
        <motion.div
          className="absolute w-[80%] h-[80%] rounded-full flex items-center justify-center text-4xl font-bold"
          style={{
            backfaceVisibility: "hidden",
            transform: "translateZ(2px)",
            top: "10%",
            left: "10%",
            background: gold.face,
            boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.3)",
            border: "2px solid #b8860b",
            borderRadius: "50%",
          }}
        >
          <div className="flex flex-col items-center">
            <span className="text-5xl font-bold text-yellow-900">H</span>
            <span className="text-xs mt-1 font-semibold text-yellow-900">HEADS</span>
          </div>
        </motion.div>
        {/* Back face (Tails) */}
        <motion.div
          className="absolute w-[80%] h-[80%] rounded-full flex items-center justify-center text-4xl font-bold"
          style={{
            backfaceVisibility: "hidden",
            transform: "translateZ(2px) rotateY(180deg)",
            top: "10%",
            left: "10%",
            background: silver.face,
            boxShadow: silver.glow + ", inset 0 0 20px rgba(0,0,0,0.3)",
            border: "2px solid #b0b0b0",
            borderRadius: "50%",
          }}
        >
          <div className="flex flex-col items-center">
            <span className="text-5xl font-bold text-yellow-900">T</span>
            <span className="text-xs mt-1 font-semibold text-yellow-900">TAILS</span>
          </div>
        </motion.div>
      </motion.div>
      {/* Result indicator */}
      {result && !isFlipping && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute mt-40 text-2xl font-bold"
        >
          {result.toUpperCase()}!
        </motion.div>
      )}
      {/* Question mark when not flipped */}
      {!result && !isFlipping && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute mt-40 text-2xl font-bold"
        >
          ?
        </motion.div>
      )}
    </div>
  );
}; 