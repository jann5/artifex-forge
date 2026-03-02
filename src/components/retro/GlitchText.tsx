import React, { useState } from "react";

interface GlitchTextProps {
  children: React.ReactNode;
  className?: string;
  tag?: React.ElementType;
  style?: React.CSSProperties;
  intensity?: "low" | "medium" | "high";
}

export function GlitchText({
  children,
  className = "",
  tag: Tag = "span",
  style: externalStyle,
  intensity = "medium",
}: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false);

  function triggerGlitch() {
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 400);
  }

  const glitchStyle = isGlitching
    ? {
        animation: "glitch-x 0.4s ease-in-out, glitch-color 0.4s ease-in-out",
      }
    : {};

  const baseStyle: React.CSSProperties = {
    display: "inline-block",
    position: "relative",
    ...glitchStyle,
    ...externalStyle,
  };

  return React.createElement(
    Tag,
    {
      className: `glitch-hover ${className}`,
      style: baseStyle,
      onMouseEnter: triggerGlitch,
    },
    children
  );
}
