import { Card } from '@/components/ui/card';
import { Hash, ListChecks, ReceiptText, WalletCards } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Choose a game',
    description: 'Review the number range, selection rules and minimum match requirement.',
    icon: ListChecks,
  },
  {
    number: '02',
    title: 'Select numbers',
    description: 'Choose the required numbers manually or use the quick-pick option.',
    icon: Hash,
  },
  {
    number: '03',
    title: 'Set the stake',
    description: 'Enter a demo stake and review the ticket details before submission.',
    icon: WalletCards,
  },
  {
    number: '04',
    title: 'Check the result',
    description: 'Use the ticket reference to compare against the published draw.',
    icon: ReceiptText,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-to-play" className="scroll-mt-20 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">How to play</p>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">From selection to result</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
            Every ticket follows the same four-step process, with the rules visible before you submit.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.number} className="p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <span className="text-xs font-semibold tracking-wider text-muted-foreground">{step.number}</span>
                </div>
                <h3 className="mt-5 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8 overflow-hidden shadow-sm">
          <div className="grid md:grid-cols-[0.9fr_1.1fr]">
            <div className="border-b p-5 md:border-b-0 md:border-r sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Example payout</p>
              <h3 className="mt-2 text-lg font-semibold">A transparent calculation</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                The ticket shows the stake, matched numbers and applicable odds so the result can be checked independently.
              </p>
            </div>
            <div className="bg-muted/30 p-5 sm:p-6">
              <div className="grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Matched odds</p>
                  <p className="mt-1 font-semibold">3 × 2 × 4</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Demo stake</p>
                  <p className="mt-1 font-semibold">₦1,000</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Potential result</p>
                  <p className="mt-1 font-semibold text-primary">₦24,000</p>
                </div>
              </div>
              <p className="mt-4 border-t pt-3 font-mono text-xs text-muted-foreground">3 × 2 × 4 × ₦1,000 = ₦24,000</p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
