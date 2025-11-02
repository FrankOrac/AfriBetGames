import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus } from 'lucide-react';

interface StakeInputProps {
  onStakeChange: (amount: number) => void;
  minStake?: number;
  maxStake?: number;
  initialStake?: number;
}

export default function StakeInput({
  onStakeChange,
  minStake = 100,
  maxStake = 100000,
  initialStake = 1000,
}: StakeInputProps) {
  const [stake, setStake] = useState(initialStake);

  const presetAmounts = [500, 1000, 2000, 5000, 10000];

  const handleStakeChange = (newStake: number) => {
    const validStake = Math.max(minStake, Math.min(maxStake, newStake));
    setStake(validStake);
    onStakeChange(validStake);
  };

  const increment = () => {
    handleStakeChange(stake + 500);
  };

  const decrement = () => {
    handleStakeChange(stake - 500);
  };

  return (
    <Card className="p-6">
      <h3 className="font-display font-semibold text-xl mb-4">Stake Amount</h3>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={decrement}
            disabled={stake <= minStake}
            data-testid="button-decrease-stake"
          >
            <Minus className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
              ₦
            </span>
            <Input
              type="number"
              value={stake}
              onChange={(e) => handleStakeChange(Number(e.target.value))}
              className="text-center text-xl font-bold pl-8"
              min={minStake}
              max={maxStake}
              data-testid="input-stake"
            />
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={increment}
            disabled={stake >= maxStake}
            data-testid="button-increase-stake"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {presetAmounts.map(amount => (
            <Button
              key={amount}
              variant={stake === amount ? "default" : "outline"}
              size="sm"
              onClick={() => handleStakeChange(amount)}
              data-testid={`button-preset-${amount}`}
            >
              ₦{amount.toLocaleString()}
            </Button>
          ))}
        </div>

        <div className="text-xs text-muted-foreground">
          Min: ₦{minStake.toLocaleString()} • Max: ₦{maxStake.toLocaleString()}
        </div>
      </div>
    </Card>
  );
}
