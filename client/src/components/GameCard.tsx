import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface GameCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  numberRange: string;
  oddsRange: string;
  selections: string;
  minMatches: string;
  badge?: string;
  href: string;
}

export default function GameCard({
  title,
  description,
  icon: Icon,
  numberRange,
  oddsRange,
  selections,
  minMatches,
  badge,
  href,
}: GameCardProps) {
  const compactSelections = selections.replace(' Numbers', '').replace(' + Bonus', ' + B');
  const facts = [
    { label: 'Range', value: numberRange },
    { label: 'Odds', value: oddsRange },
    { label: 'Pick', value: compactSelections },
    { label: 'Match', value: minMatches },
  ];

  return (
    <Card className="group h-full overflow-hidden border-border/80 bg-card shadow-sm transition-colors hover:border-primary/50">
      <div className="flex h-full flex-col">
        <div className="p-2 sm:p-4">
          <div className="flex min-w-0 items-start gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 sm:h-9 sm:w-9">
              <Icon className="h-4 w-4 text-primary sm:h-5 sm:w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                <h3 className="text-sm font-semibold leading-tight text-foreground sm:text-base">{title}</h3>
                {badge && (
                  <Badge variant="outline" className="hidden h-5 border-primary/25 bg-primary/5 px-1.5 text-[9px] font-semibold text-primary sm:inline-flex">
                    {badge}
                  </Badge>
                )}
              </div>
              <p className="mt-1 hidden h-9 overflow-hidden text-xs leading-[18px] text-muted-foreground sm:block">
                {description}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 border-y bg-muted/30 lg:grid-cols-4">
          {facts.map((item) => (
            <div key={item.label} className="min-w-0 border-border/70 px-2 py-1.5 odd:border-r sm:py-2 lg:border-r lg:last:border-r-0">
              <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground sm:text-[10px]">{item.label}</p>
              <p className="text-xs font-semibold text-foreground sm:text-sm">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-auto p-2 sm:p-3">
          <Button
            asChild
            size="sm"
            className="h-8 w-full text-xs font-semibold shadow-none"
            data-testid={`button-play-${title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <a href={href}>Open game</a>
          </Button>
        </div>
      </div>
    </Card>
  );
}
