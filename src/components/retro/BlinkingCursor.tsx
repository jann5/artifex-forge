import React from "react";

interface BlinkingCursorProps {
  char?: string;
  className?: string;
}

export function BlinkingCursor({ char = "█", className = "" }: BlinkingCursorProps) {
  return (
    <span
      className={`animate-blink inline-block text-phosphor ${className}`}
      style={{ userSelect: "none" }}
      aria-hidden
    >
      {char}
    </span>
  );
}
