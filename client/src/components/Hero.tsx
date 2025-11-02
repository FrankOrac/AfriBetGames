import { Button } from '@/components/ui/button';
import { Trophy, Zap, Clock } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';
import heroImage from '@assets/generated_images/Hero_celebration_winning_image_f913959a.png';

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const ySpring = useSpring(y, springConfig);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ position: 'relative' }}>
      <motion.div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${heroImage})`,
          y: ySpring,
          scale
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-black/70 to-purple-900/80"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      </motion.div>
      
      {/* Animated floating orbs with 3D effect */}
      <motion.div 
        className="absolute top-20 -left-20 w-96 h-96 bg-green-500/20 rounded-full blur-3xl"
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute bottom-20 -right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        animate={{
          y: [0, 30, 0],
          x: [0, -20, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      <motion.div 
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center"
        style={{ opacity }}
      >
        <div className="space-y-8">
          <motion.h1 
            className="font-display font-bold text-5xl md:text-6xl lg:text-7xl leading-tight"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.span 
              className="bg-gradient-to-r from-white via-green-100 to-white bg-clip-text text-transparent inline-block"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ backgroundSize: "200% 200%" }}
            >
              Win Big.
            </motion.span>{' '}
            <motion.span 
              className="bg-gradient-to-r from-green-100 via-white to-green-100 bg-clip-text text-transparent inline-block"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Play Smart.
            </motion.span>
            <br />
            <motion.span 
              className="bg-gradient-to-r from-green-400 via-emerald-300 to-yellow-400 bg-clip-text text-transparent font-extrabold inline-block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                opacity: { duration: 0.8, delay: 0.4 },
                scale: { duration: 0.8, delay: 0.4 },
                backgroundPosition: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }
              }}
              style={{ backgroundSize: "200% 200%" }}
            >
              Get Paid Instantly.
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Africa's premier gaming platform offering instant results, favorable odds, and daily payouts. 
            Simply pick your numbers and start winning today.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 min-h-14 shadow-2xl shadow-green-500/50"
                data-testid="button-hero-start-playing"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Playing
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 min-h-14 backdrop-blur-md bg-white/20 text-white border-white/30 hover:bg-white/30 shadow-xl"
                data-testid="button-hero-view-results"
              >
                View Results
              </Button>
            </motion.div>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            {[
              { icon: Trophy, text: "200+ Branches Planned", delay: 0 },
              { icon: Zap, text: "Daily Payouts", delay: 0.1 },
              { icon: Clock, text: "Instant Results", delay: 0.2 }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center gap-2 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 + item.delay }}
                whileHover={{ 
                  scale: 1.1, 
                  y: -10,
                  transition: { duration: 0.3 }
                }}
              >
                <motion.div
                  animate={{ 
                    rotateY: [0, 360],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                    delay: item.delay
                  }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <item.icon className="w-8 h-8 text-primary drop-shadow-glow" />
                </motion.div>
                <span className="font-semibold text-lg">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
