import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Wallet, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import type { Bet, Game, Winning } from '@shared/schema';

export default function Dashboard() {
  const { data: games = [] } = useQuery<Game[]>({
    queryKey: ['/api/games'],
  });

  const { data: bets = [] } = useQuery<Bet[]>({
    queryKey: ['/api/bets'],
  });

  const { data: winnings = [] } = useQuery<Winning[]>({
    queryKey: ['/api/winnings'],
  });

  const totalStaked = bets.reduce((sum, bet) => sum + bet.stakeAmount, 0);
  const totalWon = winnings.reduce((sum, winning) => sum + winning.winningAmount, 0);
  const activeBets = bets.length;

  const getGameName = (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    return game?.name || 'Unknown Game';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const checkWinning = async (betId: string) => {
    try {
      const response = await fetch(`/api/winnings/check/${betId}`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.won) {
        alert(`Congratulations! You won ₦${data.winning.winningAmount.toLocaleString()}`);
      } else {
        alert(data.message || 'No win this time. Better luck next time!');
      }
    } catch (error) {
      alert('Error checking winning status');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="font-display font-bold text-4xl md:text-5xl mb-4">
              My Dashboard
            </h1>
            <p className="text-xl text-muted-foreground">
              Track your bets, winnings, and gaming activity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Staked</p>
              <p className="text-3xl font-bold" data-testid="text-total-staked">
                ₦{totalStaked.toLocaleString()}
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-chart-1/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-chart-1" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Won</p>
              <p className="text-3xl font-bold text-chart-1" data-testid="text-total-won">
                ₦{totalWon.toLocaleString()}
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-chart-2" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Active Bets</p>
              <p className="text-3xl font-bold" data-testid="text-active-bets">
                {activeBets}
              </p>
            </Card>
          </div>

          <Card className="p-6 mb-8">
            <h2 className="font-display font-semibold text-2xl mb-6">Recent Bets</h2>
            
            {bets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No bets placed yet</p>
                <Button onClick={() => window.location.href = '/#games'}>
                  Start Playing
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {bets.map(bet => {
                  const selectedNumbers = JSON.parse(bet.selectedNumbers) as number[];
                  const hasWinning = winnings.some(w => w.betId === bet.id);

                  return (
                    <Card key={bet.id} className="p-4" data-testid={`bet-${bet.id}`}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{getGameName(bet.gameId)}</h3>
                            {hasWinning && (
                              <Badge variant="default" className="bg-chart-1">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Won
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-2">
                            {selectedNumbers.map(num => (
                              <Badge key={num} variant="outline" className="text-sm">
                                {num}
                              </Badge>
                            ))}
                            {bet.bonusNumber !== null && (
                              <Badge variant="secondary" className="text-sm border-2 border-chart-2">
                                Bonus: {bet.bonusNumber}
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            Placed on {formatDate(bet.createdAt)} • Stake: ₦{bet.stakeAmount.toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {bet.potentialWinning && (
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Potential Win</p>
                              <p className="font-semibold">₦{bet.potentialWinning.toLocaleString()}</p>
                            </div>
                          )}
                          {!hasWinning && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => checkWinning(bet.id)}
                              data-testid={`button-check-${bet.id}`}
                            >
                              Check Result
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </Card>

          {winnings.length > 0 && (
            <Card className="p-6">
              <h2 className="font-display font-semibold text-2xl mb-6">Winnings History</h2>
              <div className="space-y-3">
                {winnings.map(winning => (
                  <div
                    key={winning.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-chart-1/5"
                    data-testid={`winning-${winning.id}`}
                  >
                    <div>
                      <p className="font-semibold">₦{winning.winningAmount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        Matched {winning.matchedCount} numbers
                      </p>
                    </div>
                    <Badge variant="default" className="bg-chart-1">
                      Won
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
