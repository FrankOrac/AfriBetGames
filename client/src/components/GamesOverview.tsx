import { useLocation } from 'wouter';
import GameCard from './GameCard';
import { Zap, Calendar, TrendingUp, Rocket, Star, Sparkles, Crown, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GamesOverview() {
  const [, setLocation] = useLocation();

  const games = [
    {
      title: 'Virtual Betting',
      description: 'Weekly rounds with countdown timer. Runs for 35 virtual weeks with instant results!',
      icon: Zap,
      numberRange: '0-40',
      oddsRange: '1-7',
      selections: '5 Numbers',
      minMatches: '3+',
      gameType: 'virtual',
      route: '/virtual',
    },
    {
      title: 'Number Aviator',
      description: 'Fast-paced number predictions with multiplier bonuses. Select 3 numbers and watch your winnings soar!',
      icon: Rocket,
      numberRange: '1-36',
      oddsRange: '3-8',
      selections: '3 Numbers',
      minMatches: '2+',
      badge: 'HOT',
      gameType: 'aviator',
      route: '/play/aviator',
    },
    {
      title: 'Minor Game',
      description: 'Main game category - Minor. Pick 5 numbers from 0-40 and match 3+ to win!',
      icon: Star,
      numberRange: '0-40',
      oddsRange: '1-7',
      selections: '5 Numbers',
      minMatches: '3+',
      gameType: 'minor',
      route: '/play/minor',
    },
    {
      title: 'Major Game',
      description: 'Main game category - Major. Pick 7 numbers from 0-60 and match 3+ to win big!',
      icon: Crown,
      numberRange: '0-60',
      oddsRange: '1-13',
      selections: '7 Numbers',
      minMatches: '3+',
      badge: 'POPULAR',
      gameType: 'major',
      route: '/play/major',
    },
    {
      title: 'Mega Game',
      description: 'Main game category - Mega. Pick 10 numbers from 0-90 and match 5+ for mega wins!',
      icon: Trophy,
      numberRange: '0-90',
      oddsRange: '1-17',
      selections: '10 Numbers',
      minMatches: '5+',
      badge: 'JACKPOT',
      gameType: 'mega',
      route: '/play/mega',
    },
    {
      title: 'Noon Game',
      description: 'Daily noon draw at 12:00 PM. Pick 3 numbers plus bonus from 0-25!',
      icon: Calendar,
      numberRange: '0-25',
      oddsRange: '1-12',
      selections: '3 + Bonus',
      minMatches: '2+',
      badge: 'BONUS',
      gameType: 'noon',
      route: '/noon',
    },
    {
      title: 'Night Game',
      description: 'Daily night draw at 12:00 AM. Pick 3 numbers plus bonus from 0-25!',
      icon: TrendingUp,
      numberRange: '0-25',
      oddsRange: '1-12',
      selections: '3 + Bonus',
      minMatches: '2+',
      badge: 'BONUS',
      gameType: 'night',
      route: '/night',
    },
  ];

  return (
    <section id="games" className="py-20 bg-muted/30 relative overflow-hidden">
      {/* Floating animated background shapes */}
      <motion.div
        className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
        animate={{
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"
        animate={{
          y: [0, 50, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <motion.h2 
              className="font-display font-bold text-4xl md:text-5xl mb-4 inline-block"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ 
                backgroundImage: "linear-gradient(90deg, hsl(var(--foreground)), hsl(var(--primary)), hsl(var(--foreground)))",
                backgroundSize: "200% 200%",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Choose Your Game
            </motion.h2>
          </motion.div>
          <motion.p 
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Multiple ways to win with instant results and favorable odds. Pick your game and start playing today.
          </motion.p>

          {/* Decorative sparkles */}
          <motion.div
            className="flex justify-center gap-4 mt-4"
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  rotate: [0, 180, 360],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              >
                <Sparkles className="w-5 h-5 text-primary" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game, index) => (
            <motion.div
              key={game.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut"
              }}
            >
              <GameCard
                {...game}
                onPlay={() => setLocation(game.route)}
              />
            </motion.div>
          ))}
        </div>

        {/* Floating call-to-action */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.p
            className="text-muted-foreground text-lg"
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Can't decide? Try our most popular games! ✨
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
