import { Card } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface WinningsCalculatorProps {
  selectedCount: number;
  requiredMatches: number;
  stakeAmount: number;
  minOdds: number;
  maxOdds: number;
}

export default function WinningsCalculator({
  selectedCount,
  requiredMatches,
  stakeAmount,
  minOdds,
  maxOdds,
}: WinningsCalculatorProps) {
  const canWin = selectedCount >= requiredMatches;

  const minWinning = canWin 
    ? Math.pow(minOdds, requiredMatches) * stakeAmount 
    : 0;
  
  const maxWinning = canWin 
    ? Math.pow(maxOdds, selectedCount) * stakeAmount 
    : 0;

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 to-chart-1/5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-xl">Potential Winnings</h3>
          <p className="text-sm text-muted-foreground">
            Based on your selections
          </p>
        </div>
      </div>

      {canWin ? (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Minimum Win</p>
            <p className="text-2xl font-bold text-primary" data-testid="text-min-winning">
              ₦{minWinning.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              ({requiredMatches} matches at {minOdds}x odds)
            </p>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-1">Maximum Win</p>
            <p className="text-3xl font-bold gradient-text" data-testid="text-max-winning">
              ₦{maxWinning.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              ({selectedCount} matches at {maxOdds}x odds)
            </p>
          </div>

          <div className="bg-background/50 rounded-lg p-3 text-sm">
            <p className="font-medium mb-1">How it works:</p>
            <p className="text-muted-foreground text-xs">
              Your winnings = (Matched odds multiplied together) × Stake amount
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Select at least {requiredMatches} numbers to see potential winnings
          </p>
        </div>
      )}
    </Card>
  );
}
