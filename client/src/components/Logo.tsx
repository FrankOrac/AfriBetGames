import { motion } from 'framer-motion';
import { Trophy, Zap } from 'lucide-react';
import { useState } from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export default function Logo({ size = 'medium', showText = true }: LogoProps) {
  const [isHovered, setIsHovered] = useState(false);

  const sizes = {
    small: { container: 32, icon: 16, text: 'text-lg' },
    medium: { container: 40, icon: 20, text: 'text-2xl' },
    large: { container: 56, icon: 28, text: 'text-3xl' },
  };

  const currentSize = sizes[size];

  return (
    <motion.div
      className="flex items-center gap-2 cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* 3D Logo Icon */}
      <motion.div
        className="relative"
        style={{ 
          width: currentSize.container, 
          height: currentSize.container,
          transformStyle: "preserve-3d",
        }}
        animate={{
          rotateY: isHovered ? [0, 360] : 0,
        }}
        transition={{
          duration: 0.8,
          ease: "easeInOut"
        }}
      >
        {/* Gradient background with glow */}
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary via-green-500 to-emerald-600 shadow-lg"
          animate={{
            boxShadow: isHovered
              ? "0 10px 40px rgba(34, 197, 94, 0.5), 0 0 20px rgba(34, 197, 94, 0.3)"
              : "0 5px 20px rgba(34, 197, 94, 0.3)",
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{
            x: isHovered ? ["-100%", "100%"] : "-100%",
          }}
          transition={{
            duration: 1.5,
            repeat: isHovered ? Infinity : 0,
            ease: "linear",
          }}
        />

        {/* Icon container */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{
              rotate: isHovered ? [0, 15, -15, 0] : 0,
              scale: isHovered ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 0.5,
            }}
          >
            <Trophy 
              className="text-white drop-shadow-lg" 
              size={currentSize.icon} 
              strokeWidth={2.5}
            />
          </motion.div>

          {/* Orbiting star */}
          <motion.div
            className="absolute"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              width: currentSize.container,
              height: currentSize.container,
            }}
          >
            <motion.div
              className="absolute -top-1 left-1/2 transform -translate-x-1/2"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Zap className="text-yellow-300 drop-shadow-glow" size={currentSize.icon / 2} fill="currentColor" />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Animated Text */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <motion.h1
            className={`font-display font-bold ${currentSize.text} bg-gradient-to-r from-primary via-green-600 to-emerald-600 bg-clip-text text-transparent`}
            animate={{
              backgroundPosition: isHovered ? ["0% 50%", "100% 50%", "0% 50%"] : "0% 50%",
            }}
            transition={{
              duration: 2,
              ease: "linear",
            }}
            style={{ backgroundSize: "200% 200%" }}
          >
            AfriBet
          </motion.h1>
          <motion.span
            className={`font-display font-semibold text-muted-foreground ${size === 'small' ? 'text-[10px]' : size === 'medium' ? 'text-xs' : 'text-sm'}`}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Games
          </motion.span>
        </div>
      )}

      {/* Floating particles */}
      {isHovered && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/60 rounded-full"
              initial={{ 
                x: 0, 
                y: 0,
                opacity: 0,
                scale: 0,
              }}
              animate={{
                x: (Math.random() - 0.5) * 60,
                y: -20 - Math.random() * 40,
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.2,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
}
