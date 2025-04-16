import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface BetAmountSelectorProps {
  value: string;
  onChange: (value: string) => void;
  minBet: string;
  maxBet: string;
}

const PRESET_AMOUNTS = ['0.005', '0.05', '0.1'];

export const BetAmountSelector = ({ value, onChange, minBet, maxBet }: BetAmountSelectorProps) => {
  const [isCustom, setIsCustom] = useState(false);

  const handlePresetClick = useCallback((amount: string) => {
    setIsCustom(false);
    onChange(amount);
  }, [onChange]);

  const handleCustomChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue === '' || (parseFloat(newValue) >= parseFloat(minBet) && parseFloat(newValue) <= parseFloat(maxBet))) {
      onChange(newValue);
    }
  }, [onChange, minBet, maxBet]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {PRESET_AMOUNTS.map((amount) => (
          <motion.button
            key={amount}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              value === amount && !isCustom
                ? 'bg-primary-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
            }`}
            onClick={() => handlePresetClick(amount)}
          >
            {amount} MON
          </motion.button>
        ))}
      </div>

      <div className="relative">
        <input
          type="number"
          value={isCustom ? value : ''}
          onChange={handleCustomChange}
          onFocus={() => setIsCustom(true)}
          placeholder="Custom amount"
          min={minBet}
          max={maxBet}
          step="0.001"
          className={`w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 ${
            isCustom ? 'border-2 border-primary-500' : ''
          }`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
          MON
        </div>
      </div>

      <div className="flex justify-between text-sm text-gray-400">
        <span>Min: {minBet} MON</span>
        <span>Max: {maxBet} MON</span>
      </div>
    </div>
  );
}; 