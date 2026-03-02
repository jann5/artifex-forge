import React, { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { NotebookNavbar } from "@/components/notebook/NotebookNavbar";
import { formatCurrency } from "@/lib/format";
import { getStorageUrl } from "@/lib/utils";

const F = "'Press Start 2P', monospace";
const BG = "var(--bg)";
const FG = "var(--fg)";

type Phase = "splash" | "question" | "game-low" | "game-medium" | "game-high" | "shop";

/* ═══════════════════════════════════════════════════════ */
/*  SPLASH SCREEN                                         */
/* ═══════════════════════════════════════════════════════ */
function Splash({ onDone }: { onDone: () => void }) {
  const [text, setText] = useState("");
  const full = "ARTIFEX FORGE.";
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setText(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(iv);
        setTimeout(() => setShowPrompt(true), 400);
      }
    }, 80);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") { e.preventDefault(); onDone(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onDone]);

  return (
    <div onClick={onDone} style={{
      position: "fixed", inset: 0, zIndex: 100, background: BG,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      cursor: "pointer", fontFamily: F,
    }}>
      <h1 style={{ fontSize: "clamp(18px, 4vw, 28px)", letterSpacing: "0.02em" }}>
        {text}
      </h1>
      {showPrompt && (
        <div style={{ marginTop: 40, textAlign: "center", fontSize: 10, lineHeight: 2.4 }}>
          <div>NACISNIJ ↓ ABY KONTYNUOWAC</div>
          <div className="bounce-arrow" style={{ fontSize: 14, marginTop: 4 }}>▼</div>
          <div style={{ marginTop: 4, opacity: 0.5 }}>[ENTER LUB TAP]</div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  INTELLIGENCE QUESTION                                 */
/* ═══════════════════════════════════════════════════════ */
function IntelligenceQuestion({ onSelect }: { onSelect: (level: "low" | "medium" | "high") => void }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100, background: BG,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: F,
    }}>
      <BackBtn onClick={() => window.history.back()} />
      <div className="window-box" style={{ maxWidth: 440, width: "calc(100% - 40px)", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(11px, 2vw, 14px)", marginBottom: 20, lineHeight: 1.8 }}>
          JAK MADRY JESTES?
        </h2>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          {(["Troche", "Srednio", "Bardzo"] as const).map(level => (
            <button
              key={level}
              onClick={() => onSelect((level === "Troche" ? "low" : level === "Srednio" ? "medium" : "high") as "low" | "medium" | "high")}
              className="pixel-btn-outline"
              style={{ fontSize: 10, padding: "8px 20px" }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  BACK BUTTON (top-left)                                */
/* ═══════════════════════════════════════════════════════ */
function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="pixel-btn-outline"
      style={{
        position: "fixed", top: 12, left: 12, zIndex: 110,
        fontSize: 9, padding: "6px 14px",
      }}
    >
      ← WSTECZ
    </button>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  JUMP GAME (Low Intelligence)                          */
/* ═══════════════════════════════════════════════════════ */
function JumpGame({ onWin, onBack }: { onWin: () => void; onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const stateRef = useRef({
    playerY: 0, velY: 0, jumping: false,
    obstacles: [] as { x: number; w: number; h: number }[],
    frame: 0, score: 0, speed: 4, gameOver: false, won: false,
    groundY: 0, playerSize: 20, canvasW: 0, canvasH: 0,
  });
  const rafRef = useRef(0);

  const reset = useCallback(() => {
    const s = stateRef.current;
    s.playerY = 0; s.velY = 0; s.jumping = false;
    s.obstacles = []; s.frame = 0; s.score = 0; s.speed = 4;
    s.gameOver = false; s.won = false;
    setScore(0); setGameOver(false); setWon(false);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const s = stateRef.current;
    s.canvasW = W; s.canvasH = H;
    s.groundY = H - 30;
    s.playerY = 0;

    function jump() {
      if (s.gameOver) return;
      if (!s.jumping) { s.velY = -10; s.jumping = true; }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowUp") { e.preventDefault(); jump(); }
    };
    const onTouch = () => jump();

    window.addEventListener("keydown", onKey);
    canvas.addEventListener("click", onTouch);
    canvas.addEventListener("touchstart", onTouch);

    function loop() {
      if (!ctx || !canvas) return;
      const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#ede8d0";
      const fg = getComputedStyle(document.documentElement).getPropertyValue("--fg").trim() || "#1a1a1a";

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      if (!s.gameOver) {
        s.frame++;
        // Speed increases
        s.speed = 4 + Math.floor(s.score / 300);

        // Player physics
        s.velY += 0.6; // gravity
        s.playerY += s.velY;
        if (s.playerY >= 0) { s.playerY = 0; s.velY = 0; s.jumping = false; }

        // Spawn obstacles
        if (s.frame % Math.max(40, 70 - Math.floor(s.score / 100)) === 0) {
          const h = 16 + Math.random() * 20;
          s.obstacles.push({ x: W, w: 16, h });
        }

        // Move obstacles
        for (const ob of s.obstacles) ob.x -= s.speed;
        s.obstacles = s.obstacles.filter(o => o.x > -40);

        // Collision
        const px = 30, py = s.groundY + s.playerY - s.playerSize;
        for (const ob of s.obstacles) {
          if (px + s.playerSize > ob.x && px < ob.x + ob.w &&
              py + s.playerSize > s.groundY - ob.h) {
            s.gameOver = true;
            setGameOver(true);
          }
        }

        // Score
        s.score++;
        setScore(s.score);

        // Win check
        if (s.score >= 1250 && !s.won) {
          s.won = true;
          setWon(true);
        }
      }

      // Draw ground line
      ctx.strokeStyle = fg;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, s.groundY);
      ctx.lineTo(W, s.groundY);
      ctx.stroke();

      // Draw player
      ctx.fillStyle = fg;
      ctx.fillRect(30, s.groundY + s.playerY - s.playerSize, s.playerSize, s.playerSize);

      // Draw obstacles
      for (const ob of s.obstacles) {
        ctx.fillStyle = fg;
        ctx.fillRect(ob.x, s.groundY - ob.h, ob.w, ob.h);
      }

      // Border
      ctx.strokeStyle = fg;
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, W, H);

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("click", onTouch);
      canvas.removeEventListener("touchstart", onTouch);
    };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100, background: BG,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: F,
    }}>
      <BackBtn onClick={onBack} />
      <div className="window-box" style={{ maxWidth: 660, width: "calc(100% - 40px)" }}>
        <h2 style={{ fontSize: 13, textAlign: "center", marginBottom: 8, lineHeight: 1.6 }}>
          TEST NISKIEJ INTELIGENCJI:
        </h2>
        <div style={{ fontSize: 9, textAlign: "center", opacity: 0.6, marginBottom: 14, lineHeight: 2 }}>
          TAP / SPACJA / ↑ ABY SKOCZYC. OSIAGNIJ 1250 ABY ODBLOKOWAC.
        </div>
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          style={{ width: "100%", maxWidth: 600, display: "block", margin: "0 auto", imageRendering: "pixelated" }}
        />
        <div style={{ textAlign: "center", marginTop: 12, fontSize: 10 }}>
          SCORE: {score} {score > 0 && !gameOver ? "!" : ""} {won ? "HIT" : ""}
        </div>
        {gameOver && !won && (
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <div style={{ fontSize: 14, marginBottom: 8 }}>KONIEC GRY</div>
            <button onClick={reset} className="pixel-btn-outline" style={{ fontSize: 9 }}>Nowa gra</button>
          </div>
        )}
        {won && (
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <div style={{ fontSize: 11, marginBottom: 8, color: "var(--accent)" }}>ODBLOKOWANO!</div>
            <button onClick={onWin} className="pixel-btn" style={{ fontSize: 10 }}>WEJDZ DO SKLEPU</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  MINESWEEPER (High Intelligence)                       */
/* ═══════════════════════════════════════════════════════ */
const MINE_ROWS = 9, MINE_COLS = 9, MINE_COUNT = 10;
type Cell = { mine: boolean; revealed: boolean; flagged: boolean; adjacent: number };

function createBoard(): Cell[][] {
  const board: Cell[][] = Array.from({ length: MINE_ROWS }, () =>
    Array.from({ length: MINE_COLS }, () => ({ mine: false, revealed: false, flagged: false, adjacent: 0 }))
  );
  let placed = 0;
  while (placed < MINE_COUNT) {
    const r = Math.floor(Math.random() * MINE_ROWS);
    const c = Math.floor(Math.random() * MINE_COLS);
    if (!board[r][c].mine) { board[r][c].mine = true; placed++; }
  }
  for (let r = 0; r < MINE_ROWS; r++) {
    for (let c = 0; c < MINE_COLS; c++) {
      if (board[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < MINE_ROWS && nc >= 0 && nc < MINE_COLS && board[nr][nc].mine) count++;
      }
      board[r][c].adjacent = count;
    }
  }
  return board;
}

function Minesweeper({ onWin, onBack }: { onWin: () => void; onBack: () => void }) {
  const [board, setBoard] = useState(createBoard);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  function reveal(r: number, c: number) {
    if (gameOver || won) return;
    const b = board.map(row => row.map(cell => ({ ...cell })));
    if (b[r][c].revealed || b[r][c].flagged) return;
    if (b[r][c].mine) { setGameOver(true); b[r][c].revealed = true; setBoard(b); return; }
    // Flood fill
    const stack = [[r, c]];
    while (stack.length) {
      const [cr, cc] = stack.pop()!;
      if (cr < 0 || cr >= MINE_ROWS || cc < 0 || cc >= MINE_COLS) continue;
      if (b[cr][cc].revealed || b[cr][cc].mine) continue;
      b[cr][cc].revealed = true;
      if (b[cr][cc].adjacent === 0) {
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) stack.push([cr + dr, cc + dc]);
      }
    }
    setBoard(b);
    // Check win
    const unrevealed = b.flat().filter(c => !c.revealed && !c.mine).length;
    if (unrevealed === 0) setWon(true);
  }

  function retry() {
    setBoard(createBoard());
    setGameOver(false); setWon(false);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100, background: BG,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: F,
    }}>
      <BackBtn onClick={onBack} />
      <div className="window-box" style={{ maxWidth: 520, width: "calc(100% - 40px)" }}>
        <h2 style={{ fontSize: 12, textAlign: "center", marginBottom: 12, lineHeight: 1.6 }}>
          SAPER ({MINE_ROWS}×{MINE_COLS})
        </h2>
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <button onClick={retry} className="pixel-btn-outline" style={{ fontSize: 9 }}>Nowa gra</button>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${MINE_COLS}, 30px)`, gap: 2 }}>
            {board.map((row, r) => row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => reveal(r, c)}
                onContextMenu={(e) => { e.preventDefault(); /* toggle flag */
                  if (!cell.revealed && !gameOver && !won) {
                    setBoard(b => { const nb = b.map(row => row.map(cc => ({...cc}))); nb[r][c].flagged = !nb[r][c].flagged; return nb; });
                  }
                }}
                style={{
                  width: 30, height: 30,
                  background: cell.revealed ? BG : "#8a8578",
                  border: cell.revealed ? "1px solid #999" : "3px solid var(--fg)",
                  fontFamily: F, fontSize: 9,
                  cursor: "pointer",
                  color: cell.adjacent === 1 ? "blue" : cell.adjacent === 2 ? "green" : cell.adjacent >= 3 ? "red" : FG,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: 0,
                }}
              >
                {cell.revealed ? (cell.mine ? "💣" : (cell.adjacent > 0 ? cell.adjacent : "")) :
                  cell.flagged ? "🚩" : ""}
              </button>
            )))}
          </div>
        </div>
        {gameOver && (
          <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "var(--accent)" }}>
            BUM! KONIEC GRY.
            <div style={{ marginTop: 8 }}><button onClick={retry} className="pixel-btn-outline" style={{ fontSize: 9 }}>Nowa gra</button></div>
          </div>
        )}
        {won && (
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <div style={{ fontSize: 11, marginBottom: 8, color: "var(--accent)" }}>OCZYSZCZONO!</div>
            <button onClick={onWin} className="pixel-btn" style={{ fontSize: 10 }}>WEJDZ DO SKLEPU</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  RIDDLE (Medium Intelligence)                          */
/* ═══════════════════════════════════════════════════════ */
function Riddle({ onWin, onBack }: { onWin: () => void; onBack: () => void }) {
  const [answer, setAnswer] = useState("");
  const [wrong, setWrong] = useState(false);

  function submit() {
    const a = answer.trim().toLowerCase()
      .replace(/ą/g, "a").replace(/ę/g, "e").replace(/ó/g, "o")
      .replace(/ś/g, "s").replace(/ź/g, "z").replace(/ż/g, "z")
      .replace(/ć/g, "c").replace(/ń/g, "n").replace(/ł/g, "l");
    if (a === "c" || a === "sea" || a === "litera c") {
      onWin();
    } else {
      setWrong(true);
      setTimeout(() => setWrong(false), 1200);
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100, background: BG,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: F,
    }}>
      <BackBtn onClick={onBack} />
      <div className="window-box" style={{
        maxWidth: 500, width: "calc(100% - 40px)", textAlign: "center",
        animation: wrong ? "shake 0.3s" : "none",
      }}>
        <h2 style={{ fontSize: 12, marginBottom: 8, lineHeight: 1.6 }}>ZAGADKA:</h2>
        <div style={{ fontSize: 10, marginBottom: 16, lineHeight: 2, opacity: 0.7 }}>
          JAKIE ANGIELSKIE SLOWO OZNACZAJACE MORZE JEST TEZ LITERA ALFABETU?
        </div>
        <input
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          style={{ maxWidth: 300, textAlign: "center", marginBottom: 12, fontSize: 12 }}
          autoFocus
        />
        <div>
          <button onClick={submit} className="pixel-btn-outline" style={{ fontSize: 10 }}>Odpowiedz</button>
        </div>
        {wrong && (
          <div style={{ marginTop: 10, fontSize: 9, color: "var(--accent)" }}>ZLE. SPROBUJ JESZCZE RAZ.</div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  SHOP (after passing)                                  */
/* ═══════════════════════════════════════════════════════ */
function Shop() {
  const products = useQuery(api.products.list, {});
  const addToCart = useMutation(api.cart.add);
  const navigate = useNavigate();
  const allProducts = products ?? [];
  const [activeIdx, setActiveIdx] = useState(0);

  // Typewriter for description
  const [desc, setDesc] = useState("");
  const fullDesc = "reczna robota. zamow online.\n-> wybierz produkt -> dodaj do koszyka ->\ntwoje zamowienie bedzie gotowe w 1-2 dni.";
  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDesc(fullDesc.slice(0, i));
      if (i >= fullDesc.length) clearInterval(iv);
    }, 25);
    return () => clearInterval(iv);
  }, []);

  // Arrow key nav
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const len = allProducts.length;
      if (!len) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx(i => Math.min(len - 1, i + 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx(i => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        const p = allProducts[activeIdx]; if (p) navigate(`/products/${p._id}`);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [allProducts, activeIdx, navigate]);

  return (
    <div style={{ minHeight: "100vh", fontFamily: F }}>
      <NotebookNavbar />

      {/* HERO  */}
      <section style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center",
        padding: "clamp(40px, 8vh, 80px) 24px 40px",
      }}>
        <h1 style={{ fontSize: "clamp(14px, 3vw, 22px)", marginBottom: 28 }}>
          artifex forge.
        </h1>

        <div className="window-box" style={{
          maxWidth: 560, width: "100%", textAlign: "left",
          fontSize: 11, lineHeight: 2.2,
          background: "var(--input)",
        }}>
          <pre style={{ fontFamily: F, fontSize: 11, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {desc}<span className="blink">■</span>
          </pre>
        </div>
      </section>

      {/* PRODUCTS */}
      {allProducts.length > 0 && (
        <section style={{ padding: "0 clamp(20px, 5vw, 60px) 60px", maxWidth: 900, margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 28,
          }}>
            {allProducts.map((p: any, i: number) => {
              const imgUrl = p.images?.[0] ? getStorageUrl(p.images[0]) : null;
              const focused = i === activeIdx;
              return (
                <div
                  key={p._id}
                  role="button" tabIndex={0}
                  onClick={() => navigate(`/products/${p._id}`)}
                  onKeyDown={e => e.key === "Enter" && navigate(`/products/${p._id}`)}
                  style={{
                    background: BG,
                    border: focused ? "4px solid var(--fg)" : "3px solid var(--fg)",
                    boxShadow: focused ? "8px 8px 0 var(--fg)" : "6px 6px 0 var(--fg)",
                    position: "relative", cursor: "pointer", outline: "none",
                    fontFamily: F, transition: "box-shadow 0.15s",
                  }}
                >
                  <div style={{ position: "absolute", inset: 5, border: "2px solid var(--fg)", pointerEvents: "none", zIndex: 1 }} />

                  {imgUrl ? (
                    <div style={{ padding: 16, paddingBottom: 0, position: "relative", zIndex: 2 }}>
                      <img src={imgUrl} alt={p.name} loading="lazy" style={{
                        width: "100%", aspectRatio: "1/1", objectFit: "cover",
                        filter: "grayscale(30%) sepia(20%)", display: "block",
                        border: "2px solid var(--fg)",
                      }} />
                    </div>
                  ) : (
                    <div style={{
                      margin: 16, marginBottom: 0,
                      aspectRatio: "1/1", border: "2px solid var(--fg)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, opacity: 0.4, position: "relative", zIndex: 2,
                    }}>NO IMAGE</div>
                  )}

                  <div style={{ padding: "14px 18px 18px", position: "relative", zIndex: 2 }}>
                    <h3 style={{ fontSize: 11, lineHeight: 1.8, marginBottom: 4, textTransform: "uppercase" }}>{p.name}</h3>
                    {p.description && (
                      <p style={{ fontSize: 9, opacity: 0.5, lineHeight: 2, margin: "0 0 8px" }}>
                        {p.description.slice(0, 60)}{p.description.length > 60 ? "..." : ""}
                      </p>
                    )}
                    <div style={{ fontSize: 16, marginBottom: 10 }}>{formatCurrency(p.price)}</div>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        try { await addToCart({ productId: p._id, quantity: 1 }); } catch {}
                      }}
                      className="pixel-btn"
                      style={{ width: "100%", textAlign: "center", fontSize: 9 }}
                    >
                      {p.inventory === 0 ? "BRAK" : "KUP"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {products === undefined && (
        <div style={{ textAlign: "center", padding: "80px 24px", fontSize: 11 }}>
          LOADING<span className="blink">...</span>
        </div>
      )}

      {products && allProducts.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          <div className="window-box" style={{ display: "inline-block", maxWidth: 380 }}>
            <div style={{ fontSize: 12, marginBottom: 8 }}>BRAK PRODUKTOW</div>
            <div style={{ fontSize: 9, opacity: 0.5 }}>sklep w przygotowaniu.</div>
          </div>
        </div>
      )}

      {/* INFO */}
      <section style={{ padding: "40px clamp(20px, 5vw, 60px) 60px", maxWidth: 900, margin: "0 auto" }}>
        <div className="window-box" style={{ padding: "14px 20px", fontSize: 10, lineHeight: 2.2, background: "var(--input)" }}>
          <pre style={{ fontFamily: F, fontSize: 10, margin: 0, whiteSpace: "pre-wrap" }}>
here's what we offer while you're here.{"\n"}handmade goods, fast delivery.{"\n"}hang in there friend{"\n"}<span className="blink">■</span>
          </pre>
        </div>
      </section>

      {/* CONTACT */}
      <section style={{ padding: "0 clamp(20px, 5vw, 60px) 40px", maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { label: "TELEGRAM", value: "@artifexforge", href: "https://t.me/artifexforge" },
          { label: "EMAIL", value: "kontakt@artifexforge.pl", href: "mailto:kontakt@artifexforge.pl" },
        ].map((c, i) => (
          <div key={i} className="window-box" style={{ padding: "10px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 10 }}>{c.label}</span>
            <a href={c.href} style={{ fontSize: 9, color: "var(--fg)" }}>{c.value}</a>
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <footer style={{ textAlign: "center", padding: "20px 24px 24px", fontSize: 9, opacity: 0.4, lineHeight: 2.4 }}>
        <div>© {new Date().getFullYear()} ARTIFEX FORGE</div>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  MAIN LANDING — State Machine                          */
/* ═══════════════════════════════════════════════════════ */
export default function Landing() {
  const [phase, setPhase] = useState<Phase>(() => {
    if (sessionStorage.getItem("af_unlocked")) return "shop";
    if (sessionStorage.getItem("af_splash_done")) return "question";
    return "splash";
  });

  const unlock = useCallback(() => {
    sessionStorage.setItem("af_unlocked", "1");
    setPhase("shop");
  }, []);

  const splashDone = useCallback(() => {
    sessionStorage.setItem("af_splash_done", "1");
    setPhase("question");
  }, []);

  const selectLevel = useCallback((level: "low" | "medium" | "high") => {
    setPhase(`game-${level}` as Phase);
  }, []);

  const goBack = useCallback(() => setPhase("question"), []);

  switch (phase) {
    case "splash":
      return <Splash onDone={splashDone} />;
    case "question":
      return <IntelligenceQuestion onSelect={selectLevel} />;
    case "game-low":
      return <JumpGame onWin={unlock} onBack={goBack} />;
    case "game-medium":
      return <Riddle onWin={unlock} onBack={goBack} />;
    case "game-high":
      return <Minesweeper onWin={unlock} onBack={goBack} />;
    case "shop":
      return <Shop />;
  }
}
