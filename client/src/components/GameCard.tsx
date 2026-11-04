import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface GameCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  numberRange: string;
  oddsRange: string;
  selections: string;
  minMatches: string;
  badge?: string;
  href: string;
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
  href,
}: GameCardProps) {
  return (
    <div className="group relative h-full">
        <Card className="h-full p-2.5 sm:p-3 rounded-lg overflow-visible relative bg-gradient-to-br from-background via-background to-muted/30 border hover:border-primary/50 transition-colors duration-300">
          {/* Glow effect on hover */}
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
          
          <div className="relative z-10 flex h-full flex-col gap-2.5">
            <div className="flex items-start justify-between">
              <div className="flex min-w-0 items-center gap-2">
                <motion.div 
                  className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-md bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center backdrop-blur-sm"
                  whileHover={{ rotate: 6, scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </motion.div>
                <div>
                  <motion.h3 
                    className="font-display font-semibold text-sm sm:text-base leading-tight"
                    style={{ transform: "translateZ(20px)" }}
                  >
                    {title}
                  </motion.h3>
                  {badge && (
                    <motion.div
                      style={{ transform: "translateZ(15px)" }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <Badge variant="secondary" className="mt-0.5 h-4 px-1.5 text-[9px] bg-gradient-to-r from-primary/80 to-purple-500/80 text-white border-0">
                        {badge}
                      </Badge>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            <motion.p 
              className="hidden sm:block text-xs leading-snug text-muted-foreground line-clamp-2 min-h-8"
              style={{ transform: "translateZ(10px)" }}
            >
              {description}
            </motion.p>

            <motion.div 
              className="grid grid-cols-2 gap-1.5"
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
                  className="min-w-0 p-1.5 rounded-md bg-muted/50 backdrop-blur-sm"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.05,
                  }}
                >
                  <p className="truncate text-[9px] sm:text-[10px] leading-tight text-muted-foreground">{item.label}</p>
                  <p className="truncate text-xs sm:text-sm font-semibold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                    {item.value}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            <div className="relative z-20 mt-auto">
              <Button
                asChild
                size="sm"
                className="w-full min-h-8 px-2 text-[11px] sm:text-xs bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-sm shadow-primary/20"
                data-testid={`button-play-${title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <a href={href}>Play now</a>
              </Button>
            </div>
          </div>
        </Card>
    </div>
  );
}
