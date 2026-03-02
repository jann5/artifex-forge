import React, { useEffect, useRef, useState } from "react";

interface LoadingBarProps {
  label?: string;
  duration?: number; // ms
  onDone?: () => void;
  className?: string;
  color?: string;
}

export function LoadingBar({
  label = "LOADING...",
  duration = 3000,
  onDone,
  className = "",
  color = "#00ff41",
}: LoadingBarProps) {
  const [pct, setPct] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    function step(ts: number) {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out curve for that authentic "stalling" feel
      const eased = 1 - Math.pow(1 - progress, 2);
      setPct(Math.floor(eased * 100));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        onDone?.();
      }
    }
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration, onDone]);

  const blocks = Math.floor((pct / 100) * 30);

  return (
    <div className={`font-terminal ${className}`} style={{ color }}>
      <div className="text-xs mb-2" style={{ textShadow: `0 0 8px ${color}80` }}>
        {label}
      </div>
      <div
        className="flex items-center gap-2 text-sm mb-1"
        style={{ textShadow: `0 0 6px ${color}60` }}
      >
        <span>[</span>
        <span style={{ letterSpacing: "0" }}>
          {"█".repeat(blocks)}
          {"░".repeat(30 - blocks)}
        </span>
        <span>]</span>
        <span className="text-xs opacity-80">{pct}%</span>
      </div>
      <div className="text-xs opacity-60">
        {pct < 100 ? `${Math.ceil((duration * (1 - pct / 100)) / 1000)} SEC REMAINING` : "DONE."}
      </div>
    </div>
  );
}

export function BootSequence({ onDone }: { onDone?: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const allLines = [
    "ARTIFEX FORGE BIOS v2.1B (C)1985",
    "640K BASE MEMORY",
    "TESTING MEMORY... OK",
    "LOADING SYSTEM FILES...",
    "AUTOEXEC.BAT PROCESSING...",
    "SET PATH=C:\\DOS;C:\\WINDOWS",
    "SHOP.EXE INITIALIZING...",
    "CONNECTED TO PRODUCT DATABASE.",
    "WELCOME. STARTING SESSION.",
  ];

  useEffect(() => {
    let i = 0;
    const show = () => {
      if (i < allLines.length) {
        setLines((prev) => [...prev, allLines[i]]);
        i++;
        setTimeout(show, 200 + Math.random() * 150);
      } else {
        setTimeout(() => onDone?.(), 400);
      }
    };
    show();
  }, [onDone]);

  return (
    <div className="font-terminal text-xs text-phosphor space-y-1">
      {lines.map((line, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-dim">{">"}</span>
          <span>{line}</span>
        </div>
      ))}
      {lines.length < allLines.length && (
        <div className="flex items-center gap-2">
          <span className="text-dim">{">"}</span>
          <span className="animate-blink">█</span>
        </div>
      )}
    </div>
  );
}
