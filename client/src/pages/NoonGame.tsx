import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Sun, Clock, Zap } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NumberSelector from '@/components/NumberSelector';
import StakeInput from '@/components/StakeInput';
import WinningsCalculator from '@/components/WinningsCalculator';
import PrintTicket from '@/components/PrintTicket';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { Game, Bet, Result } from '@shared/schema';

export default function NoonGame() {
  const { toast } = useToast();
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [bonusNumber, setBonusNumber] = useState<number | undefined>();
  const [stakeAmount, setStakeAmount] = useState(1000);
  const [currentBetId, setCurrentBetId] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<Result | null>(null);
  const [betOutcome, setBetOutcome] = useState<any | null>(null);
  const [timeUntilDraw, setTimeUntilDraw] = useState('');

  const { data: game } = useQuery<Game>({
    queryKey: ['/api/games', 'noon'],
    queryFn: async () => {
      const response = await fetch('/api/games/noon');
      if (!response.ok) throw new Error('Game not found');
      return await response.json() as Game;
    },
  });

  // Calculate time until next 12:00 PM draw
  useEffect(() => {
    const calculateTimeUntilDraw = () => {
      const now = new Date();
      const nextDraw = new Date();
      nextDraw.setHours(12, 0, 0, 0);
      
      // If it's past noon, set to tomorrow's noon
      if (now.getHours() >= 12) {
        nextDraw.setDate(nextDraw.getDate() + 1);
      }

      const diff = nextDraw.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const timer = setInterval(() => {
      setTimeUntilDraw(calculateTimeUntilDraw());
    }, 1000);

    setTimeUntilDraw(calculateTimeUntilDraw());

    return () => clearInterval(timer);
  }, []);

  const placeBetMutation = useMutation({
    mutationFn: async () => {
      if (!game) throw new Error('Game not loaded');
      
      const betData = {
        gameId: game.id,
        selectedNumbers,
        bonusNumber,
        stakeAmount: stakeAmount,
      };

      return await apiRequest('POST', '/api/bets', betData);
    },
    onSuccess: async (response) => {
      const betResponse = await response.json();
      setCurrentBetId(betResponse.id);
      queryClient.invalidateQueries({ queryKey: ['/api/bets'] });
      
      toast({
        title: 'Bet Placed Successfully!',
        description: `Your Noon Game bet has been placed. Draw at 12:00 PM.`,
      });

      // For demo purposes, generate instant result
      if (game) {
        setTimeout(() => {
          generateResultMutation.mutate(game.id);
        }, 2000);
      }
    },
    onError: () => {
      toast({
        title: 'Failed to Place Bet',
        description: 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const generateResultMutation = useMutation({
    mutationFn: async (gameId: string) => {
      const response = await fetch(`/api/results/generate/${gameId}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to generate result');
      return await response.json() as Result;
    },
    onSuccess: async (result) => {
      setGeneratedResult(result);
      queryClient.invalidateQueries({ queryKey: ['/api/results'] });
      queryClient.invalidateQueries({ queryKey: ['/api/winnings'] });
      
      if (currentBetId) {
        try {
          const checkResponse = await fetch(`/api/winnings/check/${currentBetId}`, {
            method: 'POST',
          });
          const outcomeData = await checkResponse.json();
          setBetOutcome(outcomeData);
          
          queryClient.invalidateQueries({ queryKey: ['/api/bets', currentBetId, 'ticket'] });
          queryClient.invalidateQueries({ queryKey: ['/api/bets', currentBetId] });
          
          if (outcomeData.won) {
            toast({
              title: '🎉 Noon Game Winner!',
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
        title: 'Noon Draw Complete!',
        description: `Winning numbers: ${winningNums.join(', ')}${result.bonusNumber ? ` + Bonus: ${result.bonusNumber}` : ''}`,
      });
    },
  });

  const handlePlaceBet = () => {
    if (!game) return;
    
    if (selectedNumbers.length !== game.numbersToSelect) {
      toast({
        title: 'Invalid Selection',
        description: `Please select exactly ${game.numbersToSelect} numbers.`,
        variant: 'destructive',
      });
      return;
    }

    if (game.hasBonus && bonusNumber === undefined) {
      toast({
        title: 'Bonus Number Required',
        description: 'Please select a bonus number.',
        variant: 'destructive',
      });
      return;
    }

    placeBetMutation.mutate();
  };

  const handleReset = () => {
    setSelectedNumbers([]);
    setBonusNumber(undefined);
    setCurrentBetId(null);
    setGeneratedResult(null);
    setBetOutcome(null);
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Loading game...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/#games">
            <Button variant="ghost" className="gap-2" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
              Back to Games
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="mb-6 bg-gradient-to-r from-orange-500 to-amber-600 text-white border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Sun className="h-10 w-10" />
                    <CardTitle className="text-3xl font-bold">{game.name}</CardTitle>
                  </div>
                  <CardDescription className="text-orange-100 text-lg">
                    {game.description}
                  </CardDescription>
                </div>
                <Badge className="bg-white text-orange-600 text-lg px-4 py-2">
                  <Clock className="h-5 w-5 mr-2" />
                  12:00 PM Daily
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm mb-1">Next Draw In</p>
                    <p className="text-3xl font-mono font-bold">{timeUntilDraw}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-100 text-sm mb-1">Odds Range</p>
                    <p className="text-2xl font-bold">{game.minOdds}x - {game.maxOdds}x</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {!currentBetId && !generatedResult ? (
            <div className="grid gap-6">
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Select Your Numbers</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Pick {game.numbersToSelect} numbers from {game.minNumber} to {game.maxNumber}
                    {game.hasBonus && ' plus a bonus number'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NumberSelector
                    minNumber={game.minNumber}
                    maxNumber={game.maxNumber}
                    maxSelections={game.numbersToSelect}
                    selectedNumbers={selectedNumbers}
                    onSelectionChange={(numbers, bonus) => {
                      setSelectedNumbers(numbers);
                      setBonusNumber(bonus);
                    }}
                    hasBonus={game.hasBonus}
                    bonusNumber={bonusNumber}
                  />
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <StakeInput
                  initialStake={stakeAmount}
                  onStakeChange={setStakeAmount}
                />
                <WinningsCalculator
                  selectedCount={selectedNumbers.length}
                  requiredMatches={game.minMatches}
                  stakeAmount={stakeAmount}
                  minOdds={game.minOdds}
                  maxOdds={game.maxOdds}
                />
              </div>

              <Button
                onClick={handlePlaceBet}
                disabled={placeBetMutation.isPending || selectedNumbers.length !== game.numbersToSelect}
                className="w-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700 text-white py-6 text-lg font-semibold"
                data-testid="button-place-bet"
              >
                <Zap className="mr-2 h-5 w-5" />
                {placeBetMutation.isPending ? 'Placing Bet...' : `Place Noon Bet - ₦${stakeAmount.toLocaleString()}`}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {currentBetId && !generatedResult && (
                <Card className="bg-orange-50 dark:bg-orange-950 border-2 border-orange-500">
                  <CardHeader>
                    <CardTitle className="text-orange-900 dark:text-orange-100">✓ Bet Placed Successfully!</CardTitle>
                    <CardDescription className="text-orange-700 dark:text-orange-300">
                      Your Noon Game bet has been recorded. Print your betting slip below.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PrintTicket betId={currentBetId} autoOpen={false} />
                    <p className="text-sm text-orange-600 dark:text-orange-400 mt-4 text-center">
                      ⏳ Results will be generated in a moment...
                    </p>
                  </CardContent>
                </Card>
              )}

              {currentBetId && generatedResult && (
                <Card className="bg-gray-50 dark:bg-gray-900">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-100">Print Results Ticket</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Your official results ticket with winning numbers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PrintTicket betId={currentBetId} autoOpen={false} />
                  </CardContent>
                </Card>
              )}

              {generatedResult && betOutcome && (
                <Card className={betOutcome.won ? 'border-2 border-green-500 bg-green-50 dark:bg-green-950' : 'bg-white dark:bg-gray-800'}>
                  <CardHeader>
                    <CardTitle className={betOutcome.won ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-white'}>
                      {betOutcome.won ? '🎉 Congratulations! You Won!' : 'Better Luck Next Time'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Winning Numbers:</p>
                        <div className="flex flex-wrap gap-2">
                          {JSON.parse(generatedResult.winningNumbers).map((num: number, idx: number) => (
                            <div key={idx} className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center font-bold text-orange-700 dark:text-orange-300">
                              {num}
                            </div>
                          ))}
                          {generatedResult.bonusNumber && (
                            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center font-bold text-amber-700 dark:text-amber-300 border-2 border-amber-500">
                              {generatedResult.bonusNumber}
                            </div>
                          )}
                        </div>
                      </div>
                      {betOutcome.won && (
                        <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
                          <p className="text-green-800 dark:text-green-200 font-semibold text-lg">
                            You won: ₦{betOutcome.winning.winningAmount.toLocaleString()}
                          </p>
                          <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                            {betOutcome.message}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button
                onClick={handleReset}
                className="w-full bg-gray-600 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-700"
                data-testid="button-play-again"
              >
                Play Again
              </Button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
