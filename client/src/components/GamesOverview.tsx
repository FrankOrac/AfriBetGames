import GameCard from './GameCard';
import { Zap, Calendar, TrendingUp, Rocket, Star, Crown, Trophy } from 'lucide-react';

export default function GamesOverview() {
  const games = [
    {
      title: 'Virtual Betting',
      description: 'Weekly rounds with a countdown and published draw results across a 35-week cycle.',
      icon: Zap,
      numberRange: '0-40',
      oddsRange: '1-7',
      selections: '5 Numbers',
      minMatches: '3+',
      route: '/virtual',
    },
    {
      title: 'Number Aviator',
      description: 'Fast-paced number predictions with multiplier bonuses. Select 3 numbers and follow the result.',
      icon: Rocket,
      numberRange: '1-36',
      oddsRange: '3-8',
      selections: '3 Numbers',
      minMatches: '2+',
      badge: 'HOT',
      route: '/play/aviator',
    },
    {
      title: 'Minor Game',
      description: 'Pick 5 numbers from 0-40 and match 3 or more numbers to win.',
      icon: Star,
      numberRange: '0-40',
      oddsRange: '1-7',
      selections: '5 Numbers',
      minMatches: '3+',
      route: '/play/minor',
    },
    {
      title: 'Major Game',
      description: 'Pick 7 numbers from 0-60 and match 3 or more numbers to win.',
      icon: Crown,
      numberRange: '0-60',
      oddsRange: '1-13',
      selections: '7 Numbers',
      minMatches: '3+',
      badge: 'POPULAR',
      route: '/play/major',
    },
    {
      title: 'Mega Game',
      description: 'Pick 10 numbers from 0-90 and match 5 or more numbers for the top prize tier.',
      icon: Trophy,
      numberRange: '0-90',
      oddsRange: '1-17',
      selections: '10 Numbers',
      minMatches: '5+',
      badge: 'JACKPOT',
      route: '/play/mega',
    },
    {
      title: 'Noon Game',
      description: 'Daily 12:00 PM draw. Select 3 main numbers and one bonus number from 0-25.',
      icon: Calendar,
      numberRange: '0-25',
      oddsRange: '1-12',
      selections: '3 + Bonus',
      minMatches: '2+',
      badge: 'DAILY',
      route: '/noon',
    },
    {
      title: 'Night Game',
      description: 'Daily 12:00 AM draw. Select 3 main numbers and one bonus number from 0-25.',
      icon: TrendingUp,
      numberRange: '0-25',
      oddsRange: '1-12',
      selections: '3 + Bonus',
      minMatches: '2+',
      badge: 'DAILY',
      route: '/night',
    },
  ];

  return (
    <section id="games" className="scroll-mt-20 border-y bg-muted/20 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-2 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Available games</p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Choose a game</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-right">
            Review the number range, selection rules, odds and minimum matches before opening a ticket.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 lg:gap-4">
          {games.map((game) => (
            <GameCard key={game.title} {...game} href={game.route} />
          ))}
        </div>
      </div>
    </section>
  );
}
