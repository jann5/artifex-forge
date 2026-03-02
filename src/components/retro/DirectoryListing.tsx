import React, { useState } from "react";
import { BlinkingCursor } from "./BlinkingCursor";

export interface DirEntry {
  name: string;
  type: "DIR" | "FILE" | "EXE";
  size?: string;
  date?: string;
  time?: string;
  onClick?: () => void;
  accent?: string;
}

interface DirectoryListingProps {
  path?: string;
  entries: DirEntry[];
  className?: string;
  showPrompt?: boolean;
  promptPath?: string;
}

const typeColors: Record<string, string> = {
  DIR:  "#00ffff",
  FILE: "#00ff41",
  EXE:  "#ff00ff",
};

const typeBrackets: Record<string, string> = {
  DIR:  "[DIR]",
  FILE: "     ",
  EXE:  "[EXE]",
};

export function DirectoryListing({
  path = "C:\\>",
  entries,
  className = "",
  showPrompt = true,
  promptPath,
}: DirectoryListingProps) {
  const [highlighted, setHighlighted] = useState<number | null>(null);

  return (
    <div className={`font-terminal text-sm ${className}`}>
      {/* Header */}
      <div className="text-dim mb-1 text-xs">
        {"================================================================================"}
      </div>
      <div className="text-center text-dim text-xs mb-1">
        Volume in drive C is ARTIFEX &nbsp; Directory of&nbsp;
        <span className="text-phosphor">{path}</span>
      </div>
      <div className="text-dim mb-2 text-xs">
        {"================================================================================"}
      </div>

      {/* Entries */}
      <div className="space-y-0">
        {entries.map((entry, i) => (
          <div
            key={i}
            className={`dir-row ${highlighted === i ? "selected" : ""}`}
            style={
              highlighted !== i && entry.accent
                ? { color: entry.accent, textShadow: `0 0 8px ${entry.accent}80` }
                : undefined
            }
            onMouseEnter={() => setHighlighted(i)}
            onMouseLeave={() => setHighlighted(null)}
            onClick={entry.onClick}
            role={entry.onClick ? "button" : undefined}
            tabIndex={entry.onClick ? 0 : undefined}
            onKeyDown={entry.onClick ? (e) => e.key === "Enter" && entry.onClick?.() : undefined}
          >
            {/* Type badge */}
            <span
              className="w-12 shrink-0 text-[11px]"
              style={
                highlighted === i
                  ? {}
                  : { color: typeColors[entry.type] ?? "#00ff41" }
              }
            >
              {typeBrackets[entry.type]}
            </span>

            {/* Name */}
            <span className="flex-1 truncate uppercase font-bold tracking-wider px-2">
              {entry.name}
            </span>

            {/* Size */}
            {entry.size && (
              <span className="w-20 text-right shrink-0 text-dim text-xs">
                {entry.size}
              </span>
            )}

            {/* Date/Time */}
            {entry.date && (
              <span className="w-36 text-right shrink-0 text-dim text-xs pl-4">
                {entry.date} {entry.time}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Prompt */}
      {showPrompt && (
        <div className="mt-4 flex items-center gap-1 text-phosphor">
          <span>{promptPath ?? path}&gt;</span>
          <BlinkingCursor />
        </div>
      )}
    </div>
  );
}
