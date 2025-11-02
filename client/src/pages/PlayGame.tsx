import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NumberSelector from '@/components/NumberSelector';
import StakeInput from '@/components/StakeInput';
import WinningsCalculator from '@/components/WinningsCalculator';
import PrintTicket from '@/components/PrintTicket';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { Game, Bet, Result } from '@shared/schema';

const VIRTUAL_GAME_TYPES = ['virtual', 'aviator', 'lucky_numbers', 'super_virtual'];
const COUNTDOWN_SECONDS = 10;

export default function PlayGame() {
  const [, params] = useRoute('/play/:gameType');
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [bonusNumber, setBonusNumber] = useState<number | undefined>();
  const [stakeAmount, setStakeAmount] = useState(1000);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentBetId, setCurrentBetId] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<Result | null>(null);
  const [betOutcome, setBetOutcome] = useState<any | null>(null);

  const { data: game, isLoading } = useQuery<Game>({
    queryKey: ['/api/games', params?.gameType],
    enabled: !!params?.gameType,
    queryFn: async () => {
      const response = await fetch(`/api/games/${params?.gameType}`);
      if (!response.ok) {
        throw new Error('Game not found');
      }
      return await response.json() as Game;
    },
  });

  const isVirtualGame = game && VIRTUAL_GAME_TYPES.includes(game.type);

  useEffect(() => {
    if (countdown === null || countdown < 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 0) {
          return prev;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (countdown === 0 && currentBetId && game) {
      generateResultMutation.mutate(game.id);
    }
  }, [countdown, currentBetId, game]);

  const generateResultMutation = useMutation({
    mutationFn: async (gameId: string) => {
      const response = await fetch(`/api/results/generate/${gameId}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to generate result');
      }
      return await response.json() as Result;
    },
    onSuccess: async (result) => {
      setGeneratedResult(result);
      setCountdown(null);
      queryClient.invalidateQueries({ queryKey: ['/api/results'] });
      queryClient.invalidateQueries({ queryKey: ['/api/winnings'] });
      
      // Check win/loss outcome for the current bet
      if (currentBetId) {
        try {
          const checkResponse = await fetch(`/api/winnings/check/${currentBetId}`, {
            method: 'POST',
          });
          const outcomeData = await checkResponse.json();
          setBetOutcome(outcomeData);
          
          // Invalidate ticket query to refresh with updated status
          queryClient.invalidateQueries({ queryKey: ['/api/bets', currentBetId, 'ticket'] });
          queryClient.invalidateQueries({ queryKey: ['/api/bets', currentBetId] });
          
          if (outcomeData.won) {
            toast({
              title: '🎉 Congratulations! You Won!',
              description: outcomeData.message || `You won ₦${outcomeData.winning.winningAmount.toLocaleString()}!`,
            });
          } else {
            toast({
              title: 'Better Luck Next Time',
              description: outcomeData.message || 'No winning numbers matched',
              variant: 'destructive',
            });
          }
        } catch (error) {
          console.error('Failed to check outcome:', error);
        }
      }
      
      const winningNums = JSON.parse(result.winningNumbers) as number[];
      toast({
        title: 'Results Are In!',
        description: `Winning numbers: ${winningNums.join(', ')}${result.bonusNumber ? ` + Bonus: ${result.bonusNumber}` : ''}`,
      });
    },
    onError: () => {
      toast({
        title: 'Failed to Generate Results',
        description: 'Please try again.',
        variant: 'destructive',
      });
      setCountdown(null);
      setCurrentBetId(null);
    },
  });

  const placeBetMutation = useMutation({
    mutationFn: async () => {
      if (!game) throw new Error('Game not found');
      
      const betData = {
        gameId: game.id,
        selectedNumbers,
        bonusNumber: game.hasBonus ? bonusNumber : undefined,
        stakeAmount,
      };

      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(betData),
      });

      if (!response.ok) {
        throw new Error('Failed to place bet');
      }

      return await response.json() as Bet;
    },
    onSuccess: (data) => {
      toast({
        title: 'Bet Placed Successfully!',
        description: isVirtualGame 
          ? `Results in ${COUNTDOWN_SECONDS} seconds...`
          : `Bet ID: ${data.id.slice(0, 8)}... Potential winning: ₦${data.potentialWinning?.toLocaleString()}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bets'] });
      
      if (isVirtualGame) {
        setCurrentBetId(data.id);
        setCountdown(COUNTDOWN_SECONDS);
      } else {
        setSelectedNumbers([]);
        setBonusNumber(undefined);
        setStakeAmount(1000);
      }
    },
    onError: () => {
      toast({
        title: 'Failed to Place Bet',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    },
  });

  const handlePlaceBet = () => {
    if (!game) return;

    if (selectedNumbers.length !== game.numbersToSelect) {
      toast({
        title: 'Invalid Selection',
        description: `Please select exactly ${game.numbersToSelect} numbers`,
        variant: 'destructive',
      });
      return;
    }

    placeBetMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading game...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center">
            <h2 className="font-display font-bold text-2xl mb-4">Game Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The game you're looking for doesn't exist.
            </p>
            <Button onClick={() => setLocation('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const isValidSelection = selectedNumbers.length === game.numbersToSelect;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/')}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {countdown !== null && countdown >= 0 && (
                <Card className="p-6 bg-primary/5 border-primary/20">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <Clock className="w-8 h-8 text-primary animate-pulse" />
                      <h2 className="font-display font-bold text-4xl text-primary">
                        {countdown}s
                      </h2>
                    </div>
                    <p className="text-lg font-medium">
                      {countdown > 0 ? 'Generating results...' : 'Calculating winnings...'}
                    </p>
                    <Progress 
                      value={((COUNTDOWN_SECONDS - countdown) / COUNTDOWN_SECONDS) * 100} 
                      className="h-2"
                    />
                  </div>
                </Card>
              )}

              {generatedResult && countdown === null && (
                <>
                  {betOutcome && (
                    <Card className={`p-6 ${betOutcome.won ? 'bg-green-500/10 dark:bg-green-500/20 border-green-500/50' : 'bg-red-500/10 dark:bg-red-500/20 border-red-500/50'}`}>
                      <div className="text-center space-y-3">
                        <h2 className="font-display font-bold text-3xl">
                          {betOutcome.won ? '🎉 You Won!' : '😔 Better Luck Next Time'}
                        </h2>
                        {betOutcome.won && betOutcome.winning && (
                          <p className="text-2xl font-bold">
                            ₦{betOutcome.winning.winningAmount.toLocaleString()}
                          </p>
                        )}
                        <p className="text-muted-foreground">
                          {betOutcome.message}
                        </p>
                        {betOutcome.won && betOutcome.winning && (
                          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                            <div>
                              <p className="text-sm text-muted-foreground">Matched Numbers</p>
                              <p className="font-semibold">{betOutcome.winning.matchedCount} / {selectedNumbers.length}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Payout</p>
                              <p className="font-semibold">₦{betOutcome.winning.winningAmount.toLocaleString()}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}

                  <Card className="p-6 bg-primary/5 dark:bg-primary/10 border-primary/20">
                    <div className="space-y-4">
                      <div className="text-center">
                        <h2 className="font-display font-bold text-2xl mb-2">
                          🎲 Results Are In!
                        </h2>
                        <p className="text-muted-foreground">
                          Game Draw: {new Date(generatedResult.drawDate).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-background dark:bg-background/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-2">Winning Numbers</p>
                        <div className="flex flex-wrap gap-2">
                          {(JSON.parse(generatedResult.winningNumbers) as number[]).map((num: number, idx: number) => (
                            <div
                              key={idx}
                              className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg"
                              data-testid={`result-number-${idx}`}
                            >
                              {num}
                            </div>
                          ))}
                          {generatedResult.bonusNumber && (
                            <>
                              <div className="flex items-center px-2 text-muted-foreground">+</div>
                              <div
                                className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-lg"
                                data-testid="result-bonus-number"
                              >
                                {generatedResult.bonusNumber}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {currentBetId && <PrintTicket betId={currentBetId} />}
                        <Button
                          className="flex-1"
                          onClick={() => {
                            setGeneratedResult(null);
                            setCurrentBetId(null);
                            setBetOutcome(null);
                            setSelectedNumbers([]);
                            setBonusNumber(undefined);
                            setStakeAmount(1000);
                          }}
                          data-testid="button-play-again"
                        >
                          Play Again
                        </Button>
                      </div>
                    </div>
                  </Card>
                </>
              )}

              <Card className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🎮</span>
                  </div>
                  <div>
                    <h1 className="font-display font-bold text-3xl">{game.name}</h1>
                    <p className="text-muted-foreground">{game.description}</p>
                    {isVirtualGame && (
                      <p className="text-sm text-primary font-medium mt-1">
                        ⚡ Instant results in {COUNTDOWN_SECONDS} seconds
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Number Range</p>
                    <p className="font-semibold">{game.minNumber}-{game.maxNumber}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Odds</p>
                    <p className="font-semibold">{game.minOdds}-{game.maxOdds}x</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">To Select</p>
                    <p className="font-semibold">{game.numbersToSelect} numbers</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Min Matches</p>
                    <p className="font-semibold">{game.minMatches}+</p>
                  </div>
                </div>
              </Card>

              {!generatedResult && countdown === null && (
                <Card className="p-6">
                  <NumberSelector
                    minNumber={game.minNumber}
                    maxNumber={game.maxNumber}
                    maxSelections={game.numbersToSelect}
                    hasBonus={game.hasBonus}
                    onSelectionChange={(numbers, bonus) => {
                      setSelectedNumbers(numbers);
                      setBonusNumber(bonus);
                    }}
                    selectedNumbers={selectedNumbers}
                    bonusNumber={bonusNumber}
                  />
                </Card>
              )}
            </div>

            <div className="space-y-6">
              {!generatedResult && countdown === null && (
                <>
                  <StakeInput
                    onStakeChange={setStakeAmount}
                    initialStake={stakeAmount}
                  />

                  <WinningsCalculator
                    selectedCount={selectedNumbers.length}
                    requiredMatches={game.minMatches}
                    stakeAmount={stakeAmount}
                    minOdds={game.minOdds}
                    maxOdds={game.maxOdds}
                  />

                  <Button
                    size="lg"
                    className="w-full text-lg"
                    disabled={!isValidSelection || placeBetMutation.isPending}
                    onClick={handlePlaceBet}
                    data-testid="button-place-bet"
                  >
                    {placeBetMutation.isPending ? (
                      'Placing Bet...'
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Place Bet - ₦{stakeAmount.toLocaleString()}
                      </>
                    )}
                  </Button>

                  {!isValidSelection && (
                    <p className="text-sm text-muted-foreground text-center">
                      Select {game.numbersToSelect} numbers to place your bet
                    </p>
                  )}
                </>
              )}

              {(countdown !== null || generatedResult) && (
                <Card className="p-6">
                  <div className="text-center space-y-3">
                    <p className="text-sm text-muted-foreground">Your Bet</p>
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {selectedNumbers.map((num, idx) => (
                        <div
                          key={idx}
                          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-semibold"
                        >
                          {num}
                        </div>
                      ))}
                      {bonusNumber && (
                        <>
                          <div className="flex items-center px-1 text-muted-foreground">+</div>
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-semibold">
                            {bonusNumber}
                          </div>
                        </>
                      )}
                    </div>
                    <p className="font-semibold text-lg">
                      Stake: ₦{stakeAmount.toLocaleString()}
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
