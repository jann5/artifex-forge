import React, { useState, useEffect, useRef } from "react";
import { NotebookNavbar } from "@/components/notebook/NotebookNavbar";
import { useNavigate } from "react-router";

const F = "'Press Start 2P', monospace";

/* ── Items ── */
const ITEMS = [
  {
    code: "AF-001",
    title: "ZAMOWIENIE INDYWIDUALNE",
    redacted: "████ ███████ ████████ ████████ ████",
    reveal: "opisz co chcesz w 3 slowach albo mniej.\nmy sie domyslimy reszty.",
    tag: "WYCENA NA TELEGRAM",
    link: "/contact",
    linkLabel: "NAPISZ DO NAS →",
  },
  {
    code: "AF-002",
    title: "BEZ METKI",
    redacted: "████ ████. ████ ████. ████ ███████.",
    reveal: "bez metki. bez logo. bez niczego.\ntylko material.",
    tag: "89 ZL",
    link: null,
    linkLabel: null,
  },
  {
    code: "AF-003",
    title: "LIMITOWANA SERIA",
    redacted: "██ ████████ ████ ██ ██████ ██████.",
    reveal: "co jakis czas robimy 10 sztuk czegos dziwnego.\nale tylko jak mamy chote.\nobserwuj nas zeby wiedziec kiedy.",
    tag: "OBSERWUJ IG",
    link: "https://instagram.com/artifexforge",
    linkLabel: "IG →",
    external: true,
  },
  {
    code: "AF-004",
    title: "TWOJ PROJEKT",
    redacted: "███ ████ ████████ ██████████ ██ ████.",
    reveal: "masz szkic? zdjecie? pomysl?\nwyslij nam na telegram.\nzapytamy czy da sie to zrobic.",
    tag: "OD 300 ZL",
    link: "/contact",
    linkLabel: "WYSLIJ SZKIC →",
  },
];

/* ── Code Responses ── */
function getCodeResponse(code: string) {
  const c = code.trim().toUpperCase();
  if (c === "1234" || c === "0000") return "ZA LATWE. ALE DOBRA.";
  if (c === "FORGE" || c === "ARTIFEX" || c === "AF") return "BAZA. DOSTEP PRZYZNANY.";
  if (c.length === 0) return "PUSTY KOD. I TAK WCHODZE.";
  return "NIEZNANY KOD. AKCEPTUJE.";
}

/* ── Redacted line ── */
function RedactedItem({ item, visible }: { item: typeof ITEMS[0]; visible: boolean }) {
  const [uncovered, setUncovered] = useState(false);
  const navigate = useNavigate();

  function go() {
    if (!item.link) return;
    if ((item as any).external) window.open(item.link, "_blank");
    else navigate(item.link);
  }

  return (
    <div
      className="window-box"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.5s, transform 0.5s",
        cursor: "pointer",
      }}
      onClick={() => setUncovered(true)}
    >
      {/* Header row */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 6,
        borderBottom: "2px solid var(--fg)", paddingBottom: 10, marginBottom: 14
      }}>
        <span style={{ fontSize: 9, opacity: 0.4 }}>{item.code}</span>
        <span style={{
          fontSize: 9, background: "var(--fg)", color: "var(--bg)",
          padding: "3px 8px",
        }}>{item.tag}</span>
      </div>

      <div style={{ fontSize: 12, marginBottom: 10 }}>{item.title}</div>

      {/* Redacted / revealed text */}
      <pre style={{
        fontFamily: F, fontSize: 9, lineHeight: 2.2, margin: "0 0 14px",
        whiteSpace: "pre-wrap", wordBreak: "break-word",
        opacity: uncovered ? 1 : 0.6,
        letterSpacing: uncovered ? 0 : "0.05em",
        color: uncovered ? "var(--fg)" : "var(--fg)",
      }}>
        {uncovered ? item.reveal : item.redacted}
      </pre>

      {!uncovered && (
        <div style={{ fontSize: 8, opacity: 0.35, marginBottom: 10 }}>
          [KLIKNIJ ABY ODKRYC]
        </div>
      )}

      {uncovered && item.link && (
        <button onClick={(e) => { e.stopPropagation(); go(); }} className="pixel-btn-outline" style={{ fontSize: 9 }}>
          {item.linkLabel}
        </button>
      )}
    </div>
  );
}

/* ── Main page ── */
type Stage = "input" | "verifying" | "granted" | "menu";

export default function SecretMenuPage() {
  const [stage, setStage] = useState<Stage>("input");
  const [code, setCode] = useState("");
  const [response, setResponse] = useState("");
  const [visibleItems, setVisibleItems] = useState<boolean[]>([false, false, false, false]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Auto focus
  useEffect(() => { inputRef.current?.focus(); }, []);

  function submitCode(e: React.FormEvent) {
    e.preventDefault();
    const resp = getCodeResponse(code);
    setResponse(resp);
    setStage("verifying");
    setTimeout(() => setStage("granted"), 1600);
    setTimeout(() => setStage("menu"), 2800);
  }

  // Reveal items one by one
  useEffect(() => {
    if (stage !== "menu") return;
    ITEMS.forEach((_, i) => {
      setTimeout(() => {
        setVisibleItems(v => { const n = [...v]; n[i] = true; return n; });
      }, i * 350);
    });
  }, [stage]);

  /* ── STAGE: input ── */
  if (stage === "input") {
    return (
      <div style={{ position: "fixed", inset: 0, background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: F }}>
        <button onClick={() => navigate(-1)} className="pixel-btn-outline" style={{ position: "fixed", top: 12, left: 12, fontSize: 9, padding: "6px 14px" }}>← BACK</button>

        <div className="window-box" style={{ maxWidth: 420, width: "calc(100% - 40px)", textAlign: "center" }}>
          <div style={{ fontSize: 9, opacity: 0.4, marginBottom: 6 }}>SECURED CHANNEL</div>
          <div style={{ fontSize: 14, marginBottom: 24 }}>the secret menu.</div>

          <div style={{ fontSize: 9, opacity: 0.5, marginBottom: 16, lineHeight: 2.2 }}>
            ten obszar jest ograniczony.<br/>
            wprowadz kod dostepu.<br/>
            <span style={{ opacity: 0.4 }}>(mozesz wpisac cokolwiek.)</span>
          </div>

          <form onSubmit={submitCode} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              ref={inputRef}
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="KOD DOSTEPU"
              style={{ textAlign: "center", fontSize: 12, letterSpacing: "0.1em" }}
              autoComplete="off"
              spellCheck={false}
            />
            <button type="submit" className="pixel-btn" style={{ fontSize: 10 }}>
              WPROWADZ →
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ── STAGE: verifying ── */
  if (stage === "verifying") {
    return (
      <div style={{ position: "fixed", inset: 0, background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: F, textAlign: "center" }}>
        <div style={{ fontSize: 11, lineHeight: 2.4 }}>
          WERYFIKACJA<span className="blink">...</span>
          <br />
          <span style={{ fontSize: 9, opacity: 0.4 }}>KOD: {code || "PUSTY"}</span>
        </div>
      </div>
    );
  }

  /* ── STAGE: granted ── */
  if (stage === "granted") {
    return (
      <div style={{ position: "fixed", inset: 0, background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: F, textAlign: "center", gap: 14 }}>
        <div style={{ fontSize: 14, color: "var(--accent)" }}>ACCESS GRANTED.</div>
        <div style={{ fontSize: 9, opacity: 0.6, lineHeight: 2 }}>{response}</div>
      </div>
    );
  }

  /* ── STAGE: menu ── */
  return (
    <div style={{ minHeight: "100vh", fontFamily: F }}>
      <NotebookNavbar />

      <section style={{ maxWidth: 640, margin: "0 auto", padding: "clamp(40px,8vh,80px) clamp(20px,5vw,40px) 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
          <h1 style={{ fontSize: "clamp(13px,2.5vw,18px)", margin: 0 }}>the secret menu.</h1>
          <span style={{ fontSize: 8, opacity: 0.35 }}>KOD: {code || "PUSTY"} · {response}</span>
        </div>

        <div style={{ fontSize: 9, opacity: 0.45, marginBottom: 28, lineHeight: 2.2 }}>
          kliknij item aby odkryc szczegoły.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {ITEMS.map((item, i) => (
            <RedactedItem key={item.code} item={item} visible={visibleItems[i]} />
          ))}
        </div>
      </section>
    </div>
  );
}
