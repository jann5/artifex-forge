import React, { useEffect, useRef, useState } from "react";

interface TypeWriterProps {
  lines: string[];
  speed?: number;         // ms per character
  lineDelay?: number;     // ms between lines
  className?: string;
  style?: React.CSSProperties;
  onDone?: () => void;
  startDelay?: number;
}

export function TypeWriter({
  lines,
  speed = 28,
  lineDelay = 250,
  className = "",
  style,
  onDone,
  startDelay = 0,
}: TypeWriterProps) {
  const [displayed, setDisplayed] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [started, setStarted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(t);
  }, [startDelay]);

  useEffect(() => {
    if (!started) return;
    if (currentLine >= lines.length) {
      onDone?.();
      return;
    }

    const line = lines[currentLine];

    if (currentChar < line.length) {
      timerRef.current = setTimeout(() => {
        setDisplayed((prev) => {
          const next = [...prev];
          if (!next[currentLine]) next[currentLine] = "";
          next[currentLine] = line.slice(0, currentChar + 1);
          return next;
        });
        setCurrentChar((c) => c + 1);
      }, speed);
    } else {
      // Line done — move to next
      timerRef.current = setTimeout(() => {
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
      }, lineDelay);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [started, currentLine, currentChar, lines, speed, lineDelay, onDone]);

  return (
    <div className={`font-terminal ${className}`} style={style}>
      {lines.map((line, i) => (
        <div key={i} className="whitespace-pre">
          {i < currentLine
            ? line
            : i === currentLine
            ? (displayed[currentLine] || "")
            : ""}
          {i === currentLine && currentLine < lines.length && (
            <span className="animate-blink">█</span>
          )}
        </div>
      ))}
    </div>
  );
}
