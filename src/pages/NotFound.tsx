import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { TerminalWindow } from "@/components/retro/TerminalWindow";
import { BlinkingCursor } from "@/components/retro/BlinkingCursor";
import { TypeWriter } from "@/components/retro/TypeWriter";
import { RetroNavbar } from "@/components/retro/RetroNavbar";

const BSOD_LINES = [
  "*** STOP: 0x00000404 (PAGE_NOT_FOUND)",
  "",
  "A problem has been detected and your session",
  "has been terminated to prevent further damage.",
  "",
  "BAD_SECTOR_ON_DISK",
  "",
  "Technical information:",
  "",
  "*** STOP: 0x00000404",
  "*** Address 0xFF404000 BASE AT FFFFFFFF, DateStamp 00000000",
  "",
  "Beginning dump of physical memory...",
  "Physical memory dump complete.",
];

export default function NotFound() {
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!done) return;
    const timer = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [done, navigate]);

  return (
    <div className="min-h-screen font-terminal" style={{ background: "#0000AA" }}>
      <RetroNavbar />

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* BSOD panel */}
        <div className="p-8" style={{ background: "#0000AA", color: "#FFFFFF" }}>
          <div
            className="text-center mb-8 py-2 text-black"
            style={{ background: "#AAAAAA", fontFamily: '"Press Start 2P", monospace', fontSize: "11px" }}
          >
            ARTIFEX FORGE — SYSTEM ERROR / BŁĄD SYSTEMU
          </div>

          <TypeWriter
            lines={BSOD_LINES}
            speed={22}
            lineDelay={100}
            className="text-[13px] mb-6"
            style={{ color: "#fff", textShadow: "none" } as React.CSSProperties}
            onDone={() => setDone(true)}
          />

          {done && (
            <div className="mt-8 space-y-4">
              <div
                className="text-center py-2"
                style={{
                  background: "#AAAAAA",
                  color: "#000",
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: "10px",
                }}
              >
                Press any key to continue... (auto-redirect in {countdown}s)
              </div>

              <div className="flex flex-wrap gap-4 justify-center mt-6">
                <button
                  onClick={() => navigate("/")}
                  style={{
                    background: "transparent",
                    border: "2px solid #fff",
                    color: "#fff",
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: "10px",
                    padding: "8px 16px",
                    cursor: "pointer",
                  }}
                >
                  REBOOT → C:\HOME
                </button>
                <button
                  onClick={() => navigate(-1)}
                  style={{
                    background: "transparent",
                    border: "2px solid #aaa",
                    color: "#aaa",
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: "10px",
                    padding: "8px 16px",
                    cursor: "pointer",
                  }}
                >
                  ← GO BACK
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Terminal crash log */}
        <TerminalWindow title="CRASH.LOG — SYSTEM FAULT" className="mt-6 text-xs">
          <div className="space-y-1 font-terminal text-[11px]">
            <div className="text-dim">&gt; ERROR CODE: 0x00000404</div>
            <div style={{ color: "#ff0040" }}>&gt; FILE NOT FOUND: THE PAGE DOES NOT EXIST</div>
            <div className="text-dim">&gt; DISK STATUS: BAD SECTOR DETECTED</div>
            <div className="text-dim">&gt; RECOVERY: AUTO-REDIRECT IN {countdown}s</div>
            <div className="flex items-center gap-2 text-phosphor mt-2">
              <span>&gt; C:\SYSTEM\REPAIR.EXE</span>
              <BlinkingCursor />
            </div>
          </div>
        </TerminalWindow>
      </div>
    </div>
  );
}
