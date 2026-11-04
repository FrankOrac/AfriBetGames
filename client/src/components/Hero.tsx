import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock3, ShieldCheck } from 'lucide-react';
import { Link } from 'wouter';

const schedule = [
  { name: 'Noon Game', timing: 'Daily · 12:00 PM', status: 'Daily draw' },
  { name: 'Night Game', timing: 'Daily · 12:00 AM', status: 'Daily draw' },
  { name: 'Virtual Betting', timing: 'Weekly rounds', status: '35-week cycle' },
];

export default function Hero() {
  return (
    <section className="bg-[#071a12] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Demo environment
          </div>

          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Number games with clear rules and published results.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
            Review each game, create a ticket reference and check every published draw from one account-ready platform.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-11 px-6 font-semibold shadow-none" data-testid="button-hero-start-playing">
              <a href="#games">View games</a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-11 border-white/25 bg-transparent px-6 font-semibold text-white shadow-none hover:bg-white/10 hover:text-white"
              data-testid="button-hero-view-results"
            >
              <Link href="/results">Published results</Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-sm text-white/70">
            {['Transparent game rules', 'Private ticket reference', 'Published draw history'].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="hidden overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 lg:block">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">Game schedule</p>
              <h2 className="mt-1 text-lg font-semibold">Available draws</h2>
            </div>
            <Clock3 className="h-5 w-5 text-white/50" aria-hidden="true" />
          </div>

          <div className="divide-y divide-white/10">
            {schedule.map((game) => (
              <div key={game.name} className="grid grid-cols-[1fr_auto] gap-4 px-5 py-4">
                <div>
                  <p className="font-semibold text-white">{game.name}</p>
                  <p className="mt-1 text-sm text-white/55">{game.timing}</p>
                </div>
                <span className="self-center rounded-md bg-white/10 px-2 py-1 text-xs font-medium text-white/75">{game.status}</span>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-3 bg-black/15 px-5 py-4 text-sm text-white/65">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
            <p>Real-money payments and betting remain disabled while the platform is in testing.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
