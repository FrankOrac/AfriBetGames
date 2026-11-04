import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Zap, Star, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Game } from '@shared/schema';

export default function MainGame() {
  const { data: games } = useQuery<Game[]>({
    queryKey: ['/api/games'],
  });

  const mainGames = games?.filter(g => ['minor', 'major', 'mega'].includes(g.type)) || [];

  const getGameIcon = (type: string) => {
    switch (type) {
      case 'minor':
        return <Trophy className="h-6 w-6" />;
      case 'major':
        return <Zap className="h-6 w-6" />;
      case 'mega':
        return <Star className="h-6 w-6" />;
      default:
        return <Trophy className="h-6 w-6" />;
    }
  };

  const getGameColor = (type: string) => {
    switch (type) {
      case 'minor':
        return 'from-blue-500 to-blue-700';
      case 'major':
        return 'from-purple-500 to-purple-700';
      case 'mega':
        return 'from-orange-500 to-orange-700';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Header />
      
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Main Game Categories
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Choose your game category and start winning big! Each category offers different number ranges, odds, and winning potential.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-6xl mx-auto mb-6">
          {mainGames.map((game) => (
            <Card 
              key={game.id}
              className="relative overflow-hidden border-2 hover:border-green-500 dark:hover:border-green-600 transition-all hover:shadow-xl bg-white dark:bg-gray-800"
              data-testid={`card-game-${game.type}`}
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getGameColor(game.type)}`} />
              
              <CardHeader className="p-4 pt-5 text-center">
                <div className={`w-11 h-11 mx-auto mb-2 rounded-full bg-gradient-to-br ${getGameColor(game.type)} flex items-center justify-center text-white`}>
                  {getGameIcon(game.type)}
                </div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                  {game.name}
                </CardTitle>
                <CardDescription className="text-xs leading-snug text-gray-600 dark:text-gray-400 line-clamp-2 min-h-8">
                  {game.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="px-4 pb-3 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded-md">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Number Range</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {game.minNumber}-{game.maxNumber}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded-md">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Pick Numbers</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {game.numbersToSelect}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded-md">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Odds Range</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {game.minOdds}x - {game.maxOdds}x
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded-md">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Min Matches</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {game.minMatches}+
                    </p>
                  </div>
                </div>

                {game.type === 'mega' && (
                  <Badge className="w-full justify-center py-1 text-[10px] bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                    <Star className="h-4 w-4 mr-2" />
                    Highest Winning Potential
                  </Badge>
                )}
                {game.type === 'major' && (
                  <Badge className="w-full justify-center py-1 text-[10px] bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    <Zap className="h-4 w-4 mr-2" />
                    Best Odds Balance
                  </Badge>
                )}
                {game.type === 'minor' && (
                  <Badge className="w-full justify-center py-1 text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    <Trophy className="h-4 w-4 mr-2" />
                    Perfect For Beginners
                  </Badge>
                )}
              </CardContent>

              <CardFooter className="px-4 pb-4 pt-0">
                <Link href={`/play/${game.type}`} className="w-full">
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold"
                    data-testid={`button-play-${game.type}`}
                  >
                    Play {game.name}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-4xl mx-auto border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-600" />
            How to Play Main Games
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600 dark:text-green-400 font-bold text-sm">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Choose Category</h3>
              <p className="hidden sm:block text-xs text-gray-600 dark:text-gray-400">
                Select Minor, Major, or Mega based on your risk preference
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600 dark:text-green-400 font-bold text-sm">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Pick Numbers</h3>
              <p className="hidden sm:block text-xs text-gray-600 dark:text-gray-400">
                Select your lucky numbers from the available range
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600 dark:text-green-400 font-bold text-sm">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Win Big</h3>
              <p className="hidden sm:block text-xs text-gray-600 dark:text-gray-400">
                Match {mainGames[0]?.minMatches}+ numbers for a winning ticket under the published rules
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
