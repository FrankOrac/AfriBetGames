import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, TrendingUp, Clock, Zap, Calendar } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NumberSelector from '@/components/NumberSelector';
import StakeInput from '@/components/StakeInput';
import WinningsCalculator from '@/components/WinningsCalculator';
import PrintTicket from '@/components/PrintTicket';
import DemoResultCountdown from '@/components/DemoResultCountdown';
import { useToast } from '@/hooks/use-toast';
import { useDemoResultReveal } from '@/hooks/use-demo-result-reveal';
import { apiRequest } from '@/lib/queryClient';
import { saveTicketId } from '@/lib/tickets';
import { demoSettlementMessage, type BetPlacementResponse } from '@/lib/bet-response';
import type { Game, Result } from '@shared/schema';

export default function VirtualBetting() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { countdown, revealAfterCountdown, cancelReveal } = useDemoResultReveal();
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [stakeAmount, setStakeAmount] = useState(1000);
  const [currentBetId, setCurrentBetId] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<Result | null>(null);
  const [betOutcome, setBetOutcome] = useState<any | null>(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [timeUntilNextWeek, setTimeUntilNextWeek] = useState('');

  const { data: game } = useQuery<Game>({
    queryKey: ['/api/games', 'virtual'],
    queryFn: async () => {
      const response = await fetch('/api/games/virtual');
      if (!response.ok) throw new Error('Game not found');
      return await response.json() as Game;
    },
  });

  // Calculate current week (1-35 cycle) and time until next week
  useEffect(() => {
    const calculateWeekAndTime = () => {
      const now = new Date();
      const startDate = new Date('2025-01-01'); // Start of the year
      const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const weeksSinceStart = Math.floor(daysSinceStart / 7);
      const week = (weeksSinceStart % 35) + 1; // 35-week cycle
      
      setCurrentWeek(week);

      // Calculate time until next week (next Sunday at 6 PM)
      const nextWeek = new Date(now);
      
      // Calculate days until next Sunday (0 if already Sunday)
      const daysUntilSunday = now.getDay() === 0 ? 0 : 7 - now.getDay();
      nextWeek.setDate(now.getDate() + daysUntilSunday);
      nextWeek.setHours(18, 0, 0, 0);
      
      // If the target is in the past (including Sunday after 6 PM), move to next week
      if (nextWeek.getTime() <= now.getTime()) {
        nextWeek.setDate(nextWeek.getDate() + 7);
      }

      const diff = nextWeek.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return `${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    };

    const timer = setInterval(() => {
      setTimeUntilNextWeek(calculateWeekAndTime());
    }, 1000);

    setTimeUntilNextWeek(calculateWeekAndTime());

    return () => clearInterval(timer);
  }, []);

  const placeBetMutation = useMutation({
    mutationFn: async () => {
      if (!game) throw new Error('Game not loaded');
      
      const betData = {
        gameId: game.id,
        selectedNumbers,
        bonusNumber: undefined,
        stakeAmount: stakeAmount,
      };

      return await apiRequest('POST', '/api/bets', betData);
    },
    onSuccess: async (response) => {
      const betResponse = await response.json() as BetPlacementResponse;
      setCurrentBetId(betResponse.id);
      saveTicketId(betResponse.id);
      if (betResponse.demoResult && betResponse.demoOutcome) {
        toast({ title: 'Demo Ticket Accepted', description: 'The draw result will be revealed in 5 seconds.' });
        revealAfterCountdown(() => {
          setGeneratedResult(betResponse.demoResult!);
          setBetOutcome(betResponse.demoOutcome!);
          void queryClient.invalidateQueries({ queryKey: ['/api/demo/wallet'] });
          toast({
            title: betResponse.demoOutcome!.won ? 'Demo Win Settled' : 'Demo Draw Complete',
            description: demoSettlementMessage(betResponse),
          });
        });
        return;
      }
      void queryClient.invalidateQueries({ queryKey: ['/api/demo/wallet'] });
      
      toast({
        title: `Bet Placed for Virtual Week ${currentWeek}`,
        description: 'Your bet will be drawn on Sunday at 6 PM.',
      });

    },
    onError: (error: any) => {
      console.error('Bet placement error:', error);
      const errorMessage = error?.message || 'Please try again.';
      toast({
        title: 'Failed to Place Bet',
        description: errorMessage,
        variant: 'destructive',
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

    placeBetMutation.mutate();
  };

  const handleReset = () => {
    cancelReveal();
    setSelectedNumbers([]);
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

  const weekProgress = (currentWeek / 35) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Header />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="mb-3">
          <Link href="/#games">
            <Button variant="ghost" className="gap-2" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
              Back to Games
            </Button>
          </Link>
        </div>

        <div className="max-w-6xl mx-auto">
          <Card className="mb-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white border-0">
            <CardHeader className="p-4 pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-7 w-7" />
                    <CardTitle className="text-2xl font-bold">{game.name}</CardTitle>
                  </div>
                  <CardDescription className="text-green-100 text-sm">
                    {game.description}
                  </CardDescription>
                </div>
                <div className="text-center">
                  <div className="bg-white/20 backdrop-blur rounded-full w-14 h-14 flex flex-col items-center justify-center mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-lg font-bold">{currentWeek}</span>
                  </div>
                  <Badge className="bg-white text-green-600 font-semibold">
                    Week {currentWeek}/35
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-3">
                <div className="bg-white/20 backdrop-blur rounded-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-green-100 text-sm mb-1">Next Draw In</p>
                      <p className="text-base sm:text-xl font-mono font-bold">{timeUntilNextWeek}</p>
                      <p className="text-green-100 text-xs mt-1">Sunday at 6:00 PM</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-100 text-sm mb-1">Odds Range</p>
                      <p className="text-lg font-bold">{game.minOdds}x - {game.maxOdds}x</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-100 text-sm">35-Week Cycle Progress</span>
                    <span className="text-white font-semibold">{Math.round(weekProgress)}%</span>
                  </div>
                  <Progress value={weekProgress} className="h-3 bg-white/30" />
                  <p className="text-green-100 text-xs mt-1">
                    {35 - currentWeek} weeks remaining in current cycle
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {countdown !== null && <DemoResultCountdown seconds={countdown} />}

          {!currentBetId && !generatedResult ? (
            <div className="grid gap-4">
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader className="p-4 pb-3">
                  <CardTitle className="text-gray-900 dark:text-white">Select Your Numbers</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Pick {game.numbersToSelect} numbers from {game.minNumber} to {game.maxNumber} for Week {currentWeek}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <NumberSelector
                    minNumber={game.minNumber}
                    maxNumber={game.maxNumber}
                    maxSelections={game.numbersToSelect}
                    selectedNumbers={selectedNumbers}
                    onSelectionChange={(numbers) => setSelectedNumbers(numbers)}
                    hasBonus={false}
                  />
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
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
                className="w-full min-h-10 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white text-sm font-semibold"
                data-testid="button-place-bet"
              >
                <Zap className="mr-2 h-5 w-5" />
                {placeBetMutation.isPending ? 'Placing Bet...' : `Place Virtual Bet - Week ${currentWeek} - ₦${stakeAmount.toLocaleString()}`}
              </Button>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">How Virtual Betting Works</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• 35 weeks per cycle, currently in Week {currentWeek}</li>
                      <li>• New draw every Sunday at 6:00 PM</li>
                      <li>• Match {game.minMatches}+ numbers to win</li>
                      <li>• Instant results after each weekly draw</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {currentBetId && !generatedResult && countdown === null && (
                <Card className="bg-blue-50 dark:bg-blue-950 border-2 border-blue-500">
                  <CardHeader>
                    <CardTitle className="text-blue-900 dark:text-blue-100">✓ Bet Placed Successfully!</CardTitle>
                    <CardDescription className="text-blue-700 dark:text-blue-300">
                      Your bet for Week {currentWeek} has been recorded. Print your betting slip below.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PrintTicket betId={currentBetId} autoOpen={false} />
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-4 text-center">
                      Results will be available after the official Sunday draw is published.
                    </p>
                  </CardContent>
                </Card>
              )}

              {currentBetId && generatedResult && (
                <Card className="bg-gray-50 dark:bg-gray-900">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-100">Print Results Ticket</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Your settled ticket with the draw numbers
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
                      {betOutcome.won ? `Week ${currentWeek} Demo Win` : 'Demo Draw Complete'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Week {currentWeek} Winning Numbers:</p>
                        <div className="flex flex-wrap gap-2">
                          {JSON.parse(generatedResult.winningNumbers).map((num: number, idx: number) => (
                            <div key={idx} className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center font-bold text-green-700 dark:text-green-300">
                              {num}
                            </div>
                          ))}
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
                Play Another Week
              </Button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
