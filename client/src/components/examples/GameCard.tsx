import GameCard from '../GameCard';
import { Zap } from 'lucide-react';

export default function GameCardExample() {
  return (
    <div className="p-8 max-w-md">
      <GameCard
        title="Virtual Betting"
        description="Get instant results within minutes. Pick your lucky numbers and watch the winnings roll in!"
        icon={Zap}
        numberRange="0-40"
        oddsRange="1-5"
        selections="5 Numbers"
        minMatches="3+"
        onPlay={() => console.log('Play Virtual Betting clicked')}
      />
    </div>
  );
}
