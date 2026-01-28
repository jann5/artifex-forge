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
        
        {/* Animated Ferrofluid Blobs - 2 with lighter shade, 2 with original */}
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
            fill="rgba(96, 165, 250, 0.6)"
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
            fill="rgba(147, 197, 253, 0.6)"
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
            fill="rgba(96, 165, 250, 0.6)"
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
    </div>
  );
}