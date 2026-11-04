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
    <div className="group relative">
        <Card className="p-6 rounded-xl overflow-visible relative bg-gradient-to-br from-background via-background to-muted/30 border-2 hover:border-primary/50 transition-colors duration-300">
          {/* Glow effect on hover */}
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
          
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center backdrop-blur-sm"
                  whileHover={{ rotate: 6, scale: 1.05 }}
                  transition={{ duration: 0.6 }}
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

            <div className="relative z-20">
              <Button
                asChild
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30" 
                data-testid={`button-play-${title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <a href={href}>Play {title}</a>
              </Button>
            </div>
          </div>
        </Card>
    </div>
  );
}
