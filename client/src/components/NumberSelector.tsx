import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Minus } from 'lucide-react';

interface NumberSelectorProps {
  minNumber: number;
  maxNumber: number;
  maxSelections: number;
  hasBonus?: boolean;
  onSelectionChange: (numbers: number[], bonusNumber?: number) => void;
  selectedNumbers?: number[];
  bonusNumber?: number;
}

export default function NumberSelector({
  minNumber,
  maxNumber,
  maxSelections,
  hasBonus = false,
  onSelectionChange,
  selectedNumbers: initialSelected = [],
  bonusNumber: initialBonus,
}: NumberSelectorProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>(initialSelected);
  const [bonusNumber, setBonusNumber] = useState<number | undefined>(initialBonus);

  const handleNumberClick = (num: number) => {
    let newSelection: number[];
    
    if (selectedNumbers.length < maxSelections) {
      newSelection = [...selectedNumbers, num].sort((a, b) => a - b);
    } else {
      return;
    }
    
    setSelectedNumbers(newSelection);
    onSelectionChange(newSelection, bonusNumber);
  };

  const handleRemoveNumber = (indexToRemove: number) => {
    const newSelection = selectedNumbers.filter((_, index) => index !== indexToRemove);
    setSelectedNumbers(newSelection);
    onSelectionChange(newSelection, bonusNumber);
  };

  const handleBonusClick = (num: number) => {
    if (!hasBonus) return;
    
    if (selectedNumbers.includes(num)) return;
    
    const newBonus = bonusNumber === num ? undefined : num;
    setBonusNumber(newBonus);
    onSelectionChange(selectedNumbers, newBonus);
  };

  const clearSelection = () => {
    setSelectedNumbers([]);
    setBonusNumber(undefined);
    onSelectionChange([], undefined);
  };

  const quickPick = () => {
    const available = Array.from({ length: maxNumber - minNumber + 1 }, (_, i) => i + minNumber);
    const newSelection: number[] = [];
    
    while (newSelection.length < maxSelections) {
      const randomIndex = Math.floor(Math.random() * available.length);
      const num = available[randomIndex];
      newSelection.push(num);
      available.splice(randomIndex, 1);
    }
    
    newSelection.sort((a, b) => a - b);
    setSelectedNumbers(newSelection);
    
    let newBonus: number | undefined;
    if (hasBonus && available.length > 0) {
      const randomIndex = Math.floor(Math.random() * available.length);
      newBonus = available[randomIndex];
      setBonusNumber(newBonus);
    }
    
    onSelectionChange(newSelection, newBonus);
  };

  const numbers = Array.from(
    { length: maxNumber - minNumber + 1 },
    (_, i) => i + minNumber
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-xl">
            {hasBonus ? `Select ${maxSelections} Numbers + Bonus` : `Select ${maxSelections} Numbers`}
          </h3>
          <p className="text-sm text-muted-foreground">
            {selectedNumbers.length}/{maxSelections} selected
            {hasBonus && bonusNumber !== undefined && ' + Bonus'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={quickPick}
            data-testid="button-quick-pick"
          >
            Quick Pick
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearSelection}
            data-testid="button-clear"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {selectedNumbers.length > 0 && (
        <Card className="p-4 bg-primary/5 dark:bg-primary/10">
          <p className="text-sm font-medium mb-2">Your Selection:</p>
          <div className="flex flex-wrap gap-2">
            {selectedNumbers.map((num, index) => (
              <Badge 
                key={`${num}-${index}`} 
                variant="default" 
                className="text-base px-3 py-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors group relative"
                onClick={() => handleRemoveNumber(index)}
                data-testid={`selected-number-${num}-${index}`}
              >
                {num}
                <X className="w-3 h-3 ml-1 inline opacity-0 group-hover:opacity-100 transition-opacity" />
              </Badge>
            ))}
            {hasBonus && bonusNumber !== undefined && (
              <Badge 
                variant="secondary" 
                className="text-base px-3 py-1 border-2 border-chart-2"
                data-testid={`selected-bonus-${bonusNumber}`}
              >
                Bonus: {bonusNumber}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Click on a number to remove it</p>
        </Card>
      )}

      <div>
        <p className="text-sm font-medium mb-3">Main Numbers ({minNumber}-{maxNumber}):</p>
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {numbers.map(num => {
            const count = selectedNumbers.filter(n => n === num).length;
            const isDisabled = selectedNumbers.length >= maxSelections;
            
            return (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                disabled={isDisabled}
                className={`
                  aspect-square rounded-md font-semibold text-sm md:text-base
                  transition-all hover-elevate active-elevate-2 relative
                  ${count > 0
                    ? 'bg-primary text-primary-foreground border-2 border-primary' 
                    : isDisabled
                    ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                    : 'bg-background border-2 border-border hover:border-primary/50'
                  }
                `}
                data-testid={`number-${num}`}
              >
                {num}
                {count > 1 && (
                  <span className="absolute -top-1 -right-1 bg-chart-2 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {hasBonus && (
        <div>
          <p className="text-sm font-medium mb-3">Bonus Number (Optional):</p>
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {numbers.map(num => {
              const isBonus = bonusNumber === num;
              const isInMainSelection = selectedNumbers.includes(num);
              
              return (
                <button
                  key={`bonus-${num}`}
                  onClick={() => handleBonusClick(num)}
                  disabled={isInMainSelection}
                  className={`
                    aspect-square rounded-md font-semibold text-sm md:text-base
                    transition-all hover-elevate active-elevate-2
                    ${isBonus 
                      ? 'bg-chart-2 text-white border-2 border-chart-2' 
                      : isInMainSelection
                      ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-30'
                      : 'bg-background border-2 border-border'
                    }
                  `}
                  data-testid={`bonus-option-${num}`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
