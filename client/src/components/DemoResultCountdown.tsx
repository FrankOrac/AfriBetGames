import { Clock3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface DemoResultCountdownProps {
  seconds: number;
}

export default function DemoResultCountdown({ seconds }: DemoResultCountdownProps) {
  const progress = ((5 - seconds) / 5) * 100;

  return (
    <Card className="border-primary/25 bg-primary/5 p-5" aria-live="polite" data-testid="demo-result-countdown">
      <div className="mx-auto max-w-sm text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <span className="text-xl font-bold tabular-nums">{seconds}</span>
        </div>
        <div className="mt-3 flex items-center justify-center gap-2">
          <Clock3 className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="font-semibold">Drawing your demo result</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Your ticket is locked. The result will be revealed automatically.</p>
        <Progress value={progress} className="mt-4 h-2" />
      </div>
    </Card>
  );
}
