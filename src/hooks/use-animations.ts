import { useEffect, useRef, useState, useCallback, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════
// PREMIUM ANIMATION HOOKS — $50k luxury store grade
// Cinematic scroll reveals, magnetic interactions, smooth counters,
// text reveals, cursor glow, and patriotic flourishes.
// ═══════════════════════════════════════════════════════════════

/**
 * Hook for scroll-triggered reveal animations using IntersectionObserver
 */
export function useScrollReveal(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px", ...options }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options]);

  return { ref, isVisible };
}

/**
 * Hook for staggered reveal of multiple elements on scroll
 * Perfect for lists, grids, and sequential content
 */
export function useStaggerReveal(itemCount: number, staggerDelay: number = 100) {
  const ref = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<boolean[]>(
    new Array(itemCount).fill(false)
  );
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered) {
          setHasTriggered(true);
          observer.unobserve(element);

          // Stagger reveal each item
          for (let i = 0; i < itemCount; i++) {
            setTimeout(() => {
              setVisibleItems((prev) => {
                const next = [...prev];
                next[i] = true;
                return next;
              });
            }, i * staggerDelay);
          }
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasTriggered, itemCount, staggerDelay]);

  return { ref, visibleItems };
}

/**
 * Hook for smooth cursor-following glow effect
 * Adds a radial glow that follows the mouse — luxury UI pattern
 */
export function useMouseGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      setPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const handleEnter = () => setIsHovering(true);
    const handleLeave = () => setIsHovering(false);

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseenter", handleEnter);
    element.addEventListener("mouseleave", handleLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseenter", handleEnter);
      element.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  const glowStyle = useMemo(
    () => ({
      background: isHovering
        ? `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(193,39,45,0.06), transparent 40%)`
        : "none",
      transition: isHovering ? "none" : "background 0.5s ease",
    }),
    [isHovering, position.x, position.y]
  );

  return { ref, glowStyle, isHovering };
}

/**
 * Hook for typewriter text reveal
 * Reveals text character by character for dramatic headings
 */
export function useTypewriter(text: string, speed: number = 50, startDelay: number = 0) {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let index = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1));
          index++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, startDelay);

    return () => clearTimeout(timer);
  }, [hasStarted, text, speed, startDelay]);

  return { ref, displayText, isComplete };
}

/**
 * Hook for smooth number counting with easing — premium stats display
 * Optimized for 60fps performance
 */
export function useSmoothCounter(
  end: number,
  duration: number = 2000,
  options?: { prefix?: string; suffix?: string; decimals?: number }
) {
  const [value, setValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    const startTime = performance.now();
    let animationId: number;
    
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Premium ease-out expo - smooth acceleration
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentValue = easedProgress * end;

      setValue(options?.decimals ? parseFloat(currentValue.toFixed(options.decimals)) : Math.floor(currentValue));

      if (progress < 1) {
        animationId = requestAnimationFrame(step);
      }
    };
    
    animationId = requestAnimationFrame(step);
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [hasStarted, end, duration, options?.decimals]);

  const formatted = `${options?.prefix || ""}${value.toLocaleString("pl-PL")}${options?.suffix || ""}`;
  return { ref, value, formatted };
}

/**
 * Hook for counting up numbers when visible
 */
export function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    const startTime = Date.now();
    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easedProgress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [hasStarted, end, duration]);

  return { ref, count };
}

/**
 * Hook for parallax scroll effect
 */
export function useParallax(speed: number = 0.5) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const scrolled = window.innerHeight - rect.top;
      setOffset(scrolled * speed);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return { ref, offset };
}

/**
 * Hook for scroll-based progress indicator
 * Tracks how far down the page the user has scrolled
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      setProgress(scrollHeight > 0 ? scrolled / scrollHeight : 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return progress;
}

/**
 * Hook for "breathing" pulsation effect — subtle scale animation
 * Used for trust badges, certifications, premium elements
 */
export function useBreathingPulse(minScale: number = 0.98, maxScale: number = 1.02, duration: number = 3000) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    let startTime = performance.now();
    let animationId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = (elapsed % duration) / duration;
      const eased = (Math.sin(progress * Math.PI * 2 - Math.PI / 2) + 1) / 2;
      setScale(minScale + eased * (maxScale - minScale));
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [minScale, maxScale, duration]);

  return scale;
}

/**
 * Staggered children animation variants for Framer Motion
 */
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
  },
};

export const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
  },
};

export const fadeInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
};

// ─── PREMIUM VARIANTS ──────────────────────────────────────────

/** Cinematic reveal — optimized for performance */
export const cinematicReveal = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
  },
};

/** Gold line grow — horizontal accent line animation */
export const goldLineGrow = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] },
  },
};

/** Card lift — luxury hover-triggered lift with glow */
export const cardLift = {
  rest: {
    y: 0,
    boxShadow: "0 0 0 rgba(0,0,0,0)",
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
  hover: {
    y: -12,
    boxShadow: "0 25px 60px -12px rgba(193,39,45,0.15)",
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
};

/** Polish flag stripe reveal */
export const flagStripeReveal = {
  hidden: { width: 0, opacity: 0 },
  visible: {
    width: "100%",
    opacity: 1,
    transition: { duration: 1.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

/** Stagger container for trust badges and stats */
export const trustStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

/** Individual trust badge item */
export const trustItem = {
  hidden: { opacity: 0, y: 25, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
  },
};

/**
 * Hook for magnetic button effect
 */
export function useMagnetic(strength: number = 0.3) {
  const ref = useRef<HTMLElement>(null);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      ref.current.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    },
    [strength]
  );

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = "translate(0, 0)";
    ref.current.style.transition = "transform 0.3s ease";
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transition = "transform 0.1s ease";
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);
    element.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [handleMouseMove, handleMouseLeave, handleMouseEnter]);

  return ref;
}
