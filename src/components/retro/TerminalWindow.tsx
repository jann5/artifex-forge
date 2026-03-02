import React from "react";

interface TerminalWindowProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  titleRight?: React.ReactNode;
  accent?: "green" | "amber" | "magenta" | "cyan";
}

const accentColors = {
  green:   { bg: "#00ff41", text: "#000", border: "#00ff41", shadow: "rgba(0,255,65,0.4)" },
  amber:   { bg: "#ffb000", text: "#000", border: "#ffb000", shadow: "rgba(255,176,0,0.4)" },
  magenta: { bg: "#ff00ff", text: "#000", border: "#ff00ff", shadow: "rgba(255,0,255,0.4)" },
  cyan:    { bg: "#00ffff", text: "#000", border: "#00ffff", shadow: "rgba(0,255,255,0.4)" },
};

export function TerminalWindow({
  title = "TERMINAL",
  children,
  className = "",
  titleRight,
  accent = "green",
}: TerminalWindowProps) {
  const colors = accentColors[accent];

  return (
    <div
      className={`crt-window ${className}`}
      style={{
        border: `2px solid ${colors.border}`,
        boxShadow: `0 0 20px ${colors.shadow}, 0 0 40px ${colors.shadow.replace("0.4", "0.1")}, inset 0 0 30px rgba(0,20,0,0.5)`,
      }}
    >
      {/* Title bar */}
      <div
        className="dos-titlebar"
        style={{ background: colors.bg, color: colors.text }}
      >
        <div className="flex items-center gap-2">
          {/* Minimize/maximize/close boxes (decorative) */}
          <span className="inline-block w-3 h-3 border border-current flex items-center justify-center text-[8px]">─</span>
          <span className="inline-block w-3 h-3 border border-current flex items-center justify-center text-[8px]">□</span>
          <span className="inline-block w-3 h-3 border border-current flex items-center justify-center text-[8px]">▪</span>
          <span className="ml-2 tracking-wider">{title}</span>
        </div>
        {titleRight && <div>{titleRight}</div>}
      </div>

      {/* Content */}
      <div className="p-4 relative z-10">
        {children}
      </div>
    </div>
  );
}
