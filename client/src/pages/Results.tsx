import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Clock, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import type { Result, Game } from '@shared/schema';

export default function Results() {
  const { toast } = useToast();

  const { data: games = [] } = useQuery<Game[]>({
    queryKey: ['/api/games'],
  });

  const { data: results = [] } = useQuery<Result[]>({
    queryKey: ['/api/results'],
  });

  const generateResultMutation = useMutation({
    mutationFn: async (gameId: string) => {
      const response = await fetch(`/api/results/generate/${gameId}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to generate result');
      return await response.json();
    },
    onSuccess: (_, gameId) => {
      const game = games.find(g => g.id === gameId);
      toast({
        title: 'New Result Generated!',
        description: `${game?.name} results are now available`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/results'] });
    },
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

          <div className="mb-8 bg-card border rounded-lg p-6">
            <h3 className="font-display font-semibold text-xl mb-4">Generate Demo Results</h3>
            <p className="text-muted-foreground mb-4">
              For demonstration purposes, you can generate random results for any game
            </p>
            <div className="flex flex-wrap gap-3">
              {games.map(game => (
                <Button
                  key={game.id}
                  variant="outline"
                  onClick={() => generateResultMutation.mutate(game.id)}
                  disabled={generateResultMutation.isPending}
                  data-testid={`button-generate-${game.type}`}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate {game.name}
                </Button>
              ))}
            </div>
          </div>

          {results.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-xl text-muted-foreground mb-4">
                No results available yet
              </p>
              <p className="text-sm text-muted-foreground">
                Generate some results above to get started
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
