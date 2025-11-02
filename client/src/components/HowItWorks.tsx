import { Card } from '@/components/ui/card';
import { Hash, DollarSign, BarChart3, Wallet } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useState } from 'react';

interface StepCardProps {
  number: number;
  title: string;
  description: string;
  icon: React.ElementType;
  index: number;
}

function StepCard({ number, title, description, icon: Icon, index }: StepCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 200, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 200, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.6,
        delay: index * 0.15,
        ease: "easeOut"
      }}
    >
      <motion.div
        animate={{
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-6 text-center relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 border-2 hover:border-primary/50 transition-colors duration-300">
          {/* Animated background glow */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-primary/10"
            animate={{
              opacity: isHovered ? 1 : 0,
              scale: isHovered ? 1.5 : 1,
            }}
            transition={{ duration: 0.4 }}
          />

          {/* Particle effect */}
          {isHovered && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-primary/40 rounded-full"
                  initial={{ 
                    x: "50%", 
                    y: "50%",
                  }}
                  animate={{
                    x: `${50 + (Math.random() - 0.5) * 100}%`,
                    y: `${20 + Math.random() * 60}%`,
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </motion.div>
          )}

          <motion.div 
            className="flex flex-col items-center gap-4 relative z-10"
            style={{ transformStyle: "preserve-3d" }}
          >
            <motion.div 
              className="relative"
              style={{ transform: "translateZ(40px)" }}
            >
              <motion.div 
                className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center backdrop-blur-sm relative overflow-hidden"
                animate={{
                  boxShadow: isHovered 
                    ? "0 20px 60px rgba(var(--primary-rgb), 0.4)" 
                    : "0 10px 30px rgba(var(--primary-rgb), 0.2)"
                }}
              >
                {/* Rotating gradient background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/30 via-purple-500/30 to-primary/30"
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <motion.div
                  animate={{
                    scale: isHovered ? [1, 1.2, 1] : 1,
                    rotate: isHovered ? [0, 10, -10, 0] : 0,
                  }}
                  transition={{
                    duration: 0.5,
                  }}
                >
                  <Icon className="w-10 h-10 text-primary relative z-10" />
                </motion.div>
              </motion.div>
              <motion.div 
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 text-primary-foreground flex items-center justify-center font-bold text-sm shadow-lg"
                style={{ transform: "translateZ(50px)" }}
                animate={{
                  rotate: isHovered ? 360 : 0,
                }}
                transition={{ duration: 0.6 }}
              >
                {number}
              </motion.div>
            </motion.div>
            
            <motion.h3 
              className="font-display font-semibold text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text"
              style={{ transform: "translateZ(30px)" }}
            >
              {title}
            </motion.h3>
            
            <motion.p 
              className="text-muted-foreground text-sm"
              style={{ transform: "translateZ(20px)" }}
            >
              {description}
            </motion.p>
          </motion.div>

          {/* Connecting line animation */}
          {index < 3 && (
            <motion.div
              className="hidden lg:block absolute -right-8 top-1/2 w-16 h-0.5 bg-gradient-to-r from-primary/50 to-transparent"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.15 + 0.5 }}
              style={{ transformOrigin: "left" }}
            />
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: 'Select Numbers',
      description: 'Choose your lucky numbers from the available range based on your preferred game type.',
      icon: Hash,
    },
    {
      number: 2,
      title: 'Place Stake',
      description: 'Enter your stake amount. The higher your stake, the bigger your potential winnings.',
      icon: DollarSign,
    },
    {
      number: 3,
      title: 'Instant Results',
      description: 'Get immediate results for Virtual games or check daily for Main, Mid-Week, and Weekend games.',
      icon: BarChart3,
    },
    {
      number: 4,
      title: 'Collect Winnings',
      description: 'Matched numbers? Odds multiply your stake to calculate your winnings. Get paid instantly!',
      icon: Wallet,
    },
  ];

  return (
    <section id="how-to-play" className="py-20 relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        className="absolute top-1/4 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
        animate={{
          x: [0, -50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2 
            className="font-display font-bold text-4xl md:text-5xl mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ backgroundSize: "200% 200%" }}
          >
            How It Works
          </motion.h2>
          <motion.p 
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Four simple steps to start winning. It's easy, fast, and transparent.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => (
            <StepCard key={step.number} {...step} index={index} />
          ))}
        </div>

        <motion.div 
          className="mt-16 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="p-8 bg-gradient-to-br from-primary/5 via-background to-purple-500/5 border-2 border-primary/20 relative overflow-hidden">
            {/* Animated shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                repeatDelay: 1,
              }}
            />
            
            <div className="relative z-10">
              <motion.h3 
                className="font-display font-semibold text-2xl mb-4 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Sample Calculation
              </motion.h3>
              <div className="space-y-4">
                <motion.p 
                  className="text-muted-foreground"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Let's say you select 5 numbers in the Main game with odds: 3x, 2x, 4x, 5x, 2x
                </motion.p>
                <motion.div 
                  className="bg-background p-4 rounded-lg font-mono text-sm border border-primary/20"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="space-y-2">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 }}
                    >
                      Selected Numbers: 12, 34, 56, 78, 89
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 }}
                    >
                      Matched Numbers: 12 (3x), 34 (2x), 56 (4x)
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 }}
                    >
                      Stake: ₦1,000
                    </motion.div>
                    <motion.div 
                      className="pt-2 border-t"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 }}
                    >
                      Calculation: 3 × 2 × 4 × ₦1,000 = <span className="text-primary font-bold">₦24,000</span>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
