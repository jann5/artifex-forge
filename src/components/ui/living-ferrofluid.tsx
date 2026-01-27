import { motion } from "framer-motion";

export function Component() {
  return (
    <div className="relative w-full h-full min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* SVG Ferrofluid Animation */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
        
        {/* Animated Ferrofluid Blobs */}
        <g filter="url(#goo)">
          <motion.circle
            cx="500"
            cy="500"
            r="120"
            fill="rgba(147, 197, 253, 0.6)"
            animate={{
              cx: [500, 600, 400, 500],
              cy: [500, 400, 600, 500],
              r: [120, 150, 100, 120],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.circle
            cx="400"
            cy="600"
            r="100"
            fill="rgba(147, 197, 253, 0.5)"
            animate={{
              cx: [400, 300, 500, 400],
              cy: [600, 500, 700, 600],
              r: [100, 130, 90, 100],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
          <motion.circle
            cx="600"
            cy="400"
            r="110"
            fill="rgba(147, 197, 253, 0.55)"
            animate={{
              cx: [600, 700, 500, 600],
              cy: [400, 500, 300, 400],
              r: [110, 140, 95, 110],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
          <motion.circle
            cx="300"
            cy="300"
            r="90"
            fill="rgba(147, 197, 253, 0.45)"
            animate={{
              cx: [300, 250, 350, 300],
              cy: [300, 400, 250, 300],
              r: [90, 120, 80, 90],
            }}
            transition={{
              duration: 16,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5,
            }}
          />
        </g>
      </svg>

      {/* Content Overlay */}
      <div className="relative z-10 text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-8xl font-bold mb-6"
          style={{
            fontFamily: "'Poppins', 'Inter', sans-serif",
          }}
        >
          ARTIFEX FORGE
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-xl md:text-2xl text-muted-foreground"
          style={{
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Kompleksowa agencja dla wszystkich projektów cyfrowych i kreatywnych
        </motion.p>
      </div>
    </div>
  );
}
