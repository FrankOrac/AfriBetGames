import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Clock } from 'lucide-react';
import type { Result, Game } from '@shared/schema';

export default function Results() {
  const { data: games = [] } = useQuery<Game[]>({
    queryKey: ['/api/games'],
  });

  const { data: results = [] } = useQuery<Result[]>({
    queryKey: ['/api/results'],
  });

  const getGameName = (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    return game?.name || 'Unknown Game';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="font-display font-bold text-4xl md:text-5xl mb-4">
              Game Results
            </h1>
            <p className="text-xl text-muted-foreground">
              Check the latest winning numbers for all games
            </p>
          </div>

          {results.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-xl text-muted-foreground mb-4">
                No results available yet
              </p>
              <p className="text-sm text-muted-foreground">
                Official results will appear here after they are published by the operator.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((result) => {
                const winningNumbers = JSON.parse(result.winningNumbers) as number[];
                const odds = JSON.parse(result.odds) as number[];

                return (
                  <Card key={result.id} className="p-6" data-testid={`result-${result.id}`}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display font-semibold text-lg">
                          {getGameName(result.gameId)}
                        </h3>
                        <Badge variant="secondary">Latest</Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(result.drawDate)}</span>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Winning Numbers:</p>
                        <div className="flex flex-wrap gap-2">
                          {winningNumbers.map((num, idx) => (
                            <div key={idx} className="text-center">
                              <div
                                className="w-14 h-14 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center text-lg mb-1"
                                data-testid={`winning-number-${num}`}
                              >
                                {num}
                              </div>
                              <span className="text-xs text-muted-foreground">{odds[idx]}x</span>
                            </div>
                          ))}
                          {result.bonusNumber !== null && (
                            <div className="text-center">
                              <div
                                className="w-14 h-14 rounded-lg bg-chart-2/20 text-chart-2 font-bold flex items-center justify-center text-lg border-2 border-chart-2 mb-1"
                                data-testid={`winning-bonus-${result.bonusNumber}`}
                              >
                                {result.bonusNumber}
                              </div>
                              <span className="text-xs text-muted-foreground">Bonus</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
