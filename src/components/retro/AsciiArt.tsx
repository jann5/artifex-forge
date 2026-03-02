import React from "react";

interface AsciiArtProps {
  art: string;
  className?: string;
  color?: string;
}

export function AsciiArt({ art, className = "", color = "#00ff41" }: AsciiArtProps) {
  return (
    <pre
      className={`ascii-art select-none ${className}`}
      style={{ color, textShadow: `0 0 8px ${color}80` }}
      aria-hidden
    >
      {art}
    </pre>
  );
}

// ─── Built-in ASCII art pieces ────────────────────────────────

export const ASCII_FLOPPY = `
 ___________
|  _______  |
| |       | |
| |  3.5" | |
| |_______| |
|___________|
|  [_____]  |
|___________|`;

export const ASCII_MONITOR = `
  .---------.
 /           \\
|  .-------.  |
|  |       |  |
|  | " _ " |  |
|  '-------'  |
 \\___________/
   |_________|`;

export const ASCII_SKULL = `
  ___  ___
 /   \\/   \\
|  O    O  |
|    __    |
|   |__|   |
 \\________/
  || || ||`;

export const ASCII_STORE = `
  _____ _____ ___  ____  _____ 
 / ____|_   _/ _ \\|  _ \\| ____|
| (___   | || | | | |_) |  _|  
 \\___ \\  | || | | |  _ <| |___ 
 ____) |_| || |_| | |_) |_____|
|_____/|_____\\___/|____/|_____|`;

export const ASCII_COMPUTER = `
 ____________
|            |
|  ARTIFEX   |
|   FORGE    |
|____________|
|  [======]  |
|____________|
  ||||  ||||`;

export const ASCII_CASSETTE = `
  ___________
 |  _______  |
 | /  o  o  \\|
 ||  [___]   |
 |\\__________/|
 |___________|`;
