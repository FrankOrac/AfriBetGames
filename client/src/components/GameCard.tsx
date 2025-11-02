import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useState } from 'react';

interface GameCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  numberRange: string;
  oddsRange: string;
  selections: string;
  minMatches: string;
  badge?: string;
  onPlay: () => void;
}

export default function GameCard({
  title,
  description,
  icon: Icon,
  numberRange,
  oddsRange,
  selections,
  minMatches,
  badge,
  onPlay,
}: GameCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

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
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <motion.div
        animate={{
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-6 rounded-xl overflow-visible relative bg-gradient-to-br from-background via-background to-muted/30 border-2 hover:border-primary/50 transition-colors duration-300">
          {/* Glow effect on hover */}
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ transform: "translateZ(-20px)" }}
          />
          
          <motion.div 
            className="flex flex-col gap-6 relative"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center backdrop-blur-sm"
                  animate={{
                    rotateY: isHovered ? 360 : 0,
                  }}
                  transition={{ duration: 0.6 }}
                  style={{ transform: "translateZ(30px)" }}
                >
                  <Icon className="w-6 h-6 text-primary" />
                </motion.div>
                <div>
                  <motion.h3 
                    className="font-display font-semibold text-xl"
                    style={{ transform: "translateZ(20px)" }}
                  >
                    {title}
                  </motion.h3>
                  {badge && (
                    <motion.div
                      style={{ transform: "translateZ(15px)" }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <Badge variant="secondary" className="mt-1 bg-gradient-to-r from-primary/80 to-purple-500/80 text-white border-0">
                        {badge}
                      </Badge>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            <motion.p 
              className="text-muted-foreground"
              style={{ transform: "translateZ(10px)" }}
            >
              {description}
            </motion.p>

            <motion.div 
              className="grid grid-cols-2 gap-4"
              style={{ transform: "translateZ(15px)" }}
            >
              {[
                { label: "Number Range", value: numberRange },
                { label: "Odds", value: oddsRange },
                { label: "Selections", value: selections },
                { label: "Min Matches", value: minMatches }
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  className="space-y-1 p-3 rounded-lg bg-muted/50 backdrop-blur-sm"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.05,
                  }}
                >
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="font-semibold text-lg bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                    {item.value}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              style={{ transform: "translateZ(25px)" }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30" 
                onClick={onPlay}
                data-testid={`button-play-${title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                Play {title}
              </Button>
            </motion.div>
          </motion.div>
        </Card>
      </motion.div>

      {/* Floating particles effect */}
      {isHovered && (
        <>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full"
              initial={{ 
                x: "50%", 
                y: "50%",
                opacity: 0 
              }}
              animate={{
                x: `${50 + (Math.random() - 0.5) * 100}%`,
                y: `${50 + (Math.random() - 0.5) * 100}%`,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              style={{ pointerEvents: "none" }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
}
