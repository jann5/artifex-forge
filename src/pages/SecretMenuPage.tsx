import React, { useState, useEffect, useRef, useCallback } from "react";
import { NotebookNavbar } from "@/components/notebook/NotebookNavbar";
import { useNavigate } from "react-router";

const F = "'Press Start 2P', monospace";

/* ═══════════════════════════════════════════════════
   ITEMS
═══════════════════════════════════════════════════ */
const ITEMS = [
  {
    code: "AF-001",
    title: "KOSZULKA Z TWOJEGO SNU",
    redacted: "████ ████ ████ ████████ ███.\n████████. ██ ████████ █████.",
    reveal:
      "opisujesz sen z ostatniej nocy.\nmy go drukujemy.\nim bardziej dziwny, tym lepiej.\njeśli sen był nudny — doplata 50 zl.",
    tag: "OD 120 ZL",
    link: "/contact",
    linkLabel: "OPISZ SEN →",
    warn: null,
  },
  {
    code: "AF-002",
    title: "PACZKA CIEMNA",
    redacted: "████ ████████ ████. █████ ████████.\n███ ████████.",
    reveal:
      "placisz 180 zl.\nopisujesz jednym slowem jak sie teraz czujesz.\nmy decydujemy resztę.\nnie wiesz co dostaniesz.\nnie zwracamy.",
    tag: "180 ZL. FINAL.",
    link: "/contact",
    linkLabel: "ZARYZYKUJ →",
    warn: "UWAGA: ZWROTY NIEDOSTEPNE",
  },
  {
    code: "AF-003",
    title: "INSTRUKCJA OBSLUGI CIEBIE",
    redacted: "████ ████ ████████ ████ ████████\n██████████ ████.",
    reveal:
      "wysylasz nam 5 faktow o sobie.\nmy projektujemy instrukcje obslugi ciebie.\nformat: koszulka A4.\nidealna na urodziny albo kiedy ktos cie nie rozumie.",
    tag: "OD 200 ZL",
    link: "/contact",
    linkLabel: "WYSLIJ 5 FAKTOW →",
    warn: null,
  },
  {
    code: "AF-004",
    title: "ZAMOWIENIE ANONIMOWE",
    redacted: "████ ████ █████████ ████ ██████.\n███ █████.",
    reveal:
      "zamawiasz koszulke dla kogos anonimowo.\nwpisujesz tylko adres dostawy.\nnie podajesz od kogo.\nmy dolaczamy tylko kartke z losowym cytatem.",
    tag: "OD 89 ZL + DOSTAWA",
    link: "/contact",
    linkLabel: "WYSLIJ ANONIMOWO →",
    warn: null,
  },
  {
    code: "AF-005",
    title: "KOSZULKA ZA BARTER",
    redacted: "████ ███ ████████. ████ ██████.\n███████ ████.",
    reveal:
      "nie masz kasy?\nzaproponuj co mozesz dac w zamian.\nprzyjmujemy: umiejetnosci, sztuke, uslugi, ksiazki, muzyczke.\nodpiszemy czy sie zgadzamy.",
    tag: "NEGOCJOWALNE",
    link: "/contact",
    linkLabel: "ZAPROPONUJ →",
    warn: null,
  },
  {
    code: "AF-EGG",
    title: "??? POZIOM WTAJEMNICZENIA ???",
    redacted: "██████████ ████████ ████.\n████ ████ ██████████.",
    reveal:
      "gratulacje. znalazles easter egga.\nta pozycja nie istnieje oficjalnie.\nwyslij nam na telegram: /egg + twoj adres.\ndostaniesz cos czego nie mozna kupic.",
    tag: "TYLKO DLA WYBRANYCH",
    link: "/contact",
    linkLabel: "TELEGRAM: /EGG →",
    warn: null,
    hidden: true,  // only visible with secret code
  },
];

/* ═══════════════════════════════════════════════════
   CODE RESPONSES + SPECIAL CODES
═══════════════════════════════════════════════════ */
type CodeResult = { response: string; unlockEgg: boolean; grantedMsg: string };

function evalCode(code: string): CodeResult {
  const c = code.trim().toUpperCase();
  if (c === "JAJKO" || c === "EGG" || c === "EASTER" || c === "WIELKANOC")
    return { response: "BRAWO. WIESZ CO ROBISZ.", unlockEgg: true, grantedMsg: "EXTRA DOSTEP PRZYZNANY." };
  if (c === "FORGE" || c === "ARTIFEX" || c === "AF")
    return { response: "BAZA. SWOJ CZLOWIEK.", unlockEgg: false, grantedMsg: "DOSTEP PRZYZNANY." };
  if (c === "1234" || c === "0000" || c === "ADMIN")
    return { response: "ZA LATWE. ALE PEWNIE I TAK WEJDZIESZ.", unlockEgg: false, grantedMsg: "DOSTEP PRZYZNANY." };
  if (c === "MAMA" || c === "TATA" || c === "MAMA I TATA")
    return { response: "...OK.", unlockEgg: false, grantedMsg: "DOSTEP PRZYZNANY." };
  if (c === "HASLO" || c === "PASSWORD")
    return { response: "POWAZNIE?", unlockEgg: false, grantedMsg: "DOSTEP PRZYZNANY." };
  if (c.length === 0)
    return { response: "PUSTY KOD. IMPRESYWNE.", unlockEgg: false, grantedMsg: "DOSTEP PRZYZNANY." };
  if (c.length >= 20)
    return { response: "DLUGI KOD. SZANUJĘ POSWIECENIE.", unlockEgg: false, grantedMsg: "DOSTEP PRZYZNANY." };
  return { response: `"${code.toUpperCase()}" — NIEZNANY. AKCEPTUJE.`, unlockEgg: false, grantedMsg: "DOSTEP PRZYZNANY." };
}

/* ═══════════════════════════════════════════════════
   KONAMI EASTER EGG HOOK
═══════════════════════════════════════════════════ */
const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];

function useKonami(onSuccess: () => void) {
  const seq = useRef<string[]>([]);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      seq.current.push(e.key);
      if (seq.current.length > KONAMI.length) seq.current.shift();
      if (seq.current.join(",") === KONAMI.join(",")) {
        seq.current = [];
        onSuccess();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSuccess]);
}

/* ═══════════════════════════════════════════════════
   KONAMI FLASH OVERLAY
═══════════════════════════════════════════════════ */
function KonamiFlash({ onClose }: { onClose: () => void }) {
  const [line, setLine] = useState(0);
  const lines = [
    "↑↑↓↓←→←→BA",
    "KOD KONAMI WYKRYTY.",
    "WTAJEMNICZONY POZIOM: MAKSYMALNY.",
    "nagroda: nic. ale i tak jestes git.",
    "...chyba ze napiszesz do nas /konami na tg.",
    "wtedy cos wymyslimy.",
  ];
  useEffect(() => {
    if (line >= lines.length) return;
    const t = setTimeout(() => setLine(l => l + 1), line === 0 ? 300 : 900);
    return () => clearTimeout(t);
  }, [line]);
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 999,
        background: "var(--fg)", color: "var(--bg)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: F, textAlign: "center", cursor: "pointer",
        padding: 24,
      }}
    >
      {lines.slice(0, line).map((l, i) => (
        <div key={i} style={{
          fontSize: i === 0 ? 18 : i === 1 ? 13 : 10,
          lineHeight: 2.4, opacity: i < line - 1 ? 0.6 : 1,
        }}>{l}</div>
      ))}
      {line >= lines.length && (
        <div style={{ fontSize: 8, opacity: 0.35, marginTop: 20 }}>[KLIKNIJ ABY ZAMKNAC]</div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   REDACTED ITEM COMPONENT
═══════════════════════════════════════════════════ */
type Item = typeof ITEMS[0];

function RedactedItem({ item, visible }: { item: Item; visible: boolean }) {
  const [uncovered, setUncovered] = useState(false);
  const navigate = useNavigate();

  function go() {
    if (!item.link) return;
    if ((item as any).external) window.open(item.link, "_blank");
    else navigate(item.link);
  }

  const isEgg = item.code === "AF-EGG";

  return (
    <div
      className="window-box"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.5s, transform 0.5s",
        cursor: uncovered ? "default" : "pointer",
        border: isEgg ? "3px solid var(--accent)" : undefined,
        boxShadow: isEgg ? "6px 6px 0 var(--accent)" : undefined,
      }}
      onClick={() => !uncovered && setUncovered(true)}
    >
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 6,
        borderBottom: "2px solid var(--fg)", paddingBottom: 10, marginBottom: 14,
      }}>
        <span style={{ fontSize: 9, opacity: 0.4 }}>{item.code}</span>
        <span style={{
          fontSize: 9,
          background: isEgg ? "var(--accent)" : "var(--fg)",
          color: "var(--bg)", padding: "3px 8px",
        }}>{item.tag}</span>
      </div>

      <div style={{ fontSize: 11, marginBottom: 10, lineHeight: 1.8 }}>{item.title}</div>

      <pre style={{
        fontFamily: F, fontSize: 9, lineHeight: 2.2, margin: "0 0 14px",
        whiteSpace: "pre-wrap", wordBreak: "break-word",
        opacity: uncovered ? 1 : 0.5,
        filter: uncovered ? "none" : "blur(0px)",
      }}>
        {uncovered ? item.reveal : item.redacted}
      </pre>

      {!uncovered && (
        <div style={{ fontSize: 8, opacity: 0.3 }}>[KLIKNIJ ABY ODKRYC]</div>
      )}

      {uncovered && item.warn && (
        <div style={{ fontSize: 8, color: "var(--accent)", marginBottom: 10, lineHeight: 2 }}>{item.warn}</div>
      )}

      {uncovered && item.link && (
        <button
          onClick={(e) => { e.stopPropagation(); go(); }}
          className={isEgg ? "pixel-btn" : "pixel-btn-outline"}
          style={{ fontSize: 9 }}
        >
          {item.linkLabel}
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════ */
type Stage = "input" | "verifying" | "granted" | "menu";

export default function SecretMenuPage() {
  const [stage, setStage] = useState<Stage>("input");
  const [code, setCode] = useState("");
  const [result, setResult] = useState<CodeResult>({ response: "", unlockEgg: false, grantedMsg: "" });
  const [visibleCount, setVisibleCount] = useState(0);
  const [konamiActive, setKonamiActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => { inputRef.current?.focus(); }, []);

  const showKonami = useCallback(() => setKonamiActive(true), []);
  useKonami(showKonami);

  function submitCode(e: React.FormEvent) {
    e.preventDefault();
    const r = evalCode(code);
    setResult(r);
    setStage("verifying");
    setTimeout(() => setStage("granted"), 1600);
    setTimeout(() => setStage("menu"), 2800);
  }

  // visible items = base 5, + egg if unlocked
  const visibleItems = ITEMS.filter(i => !(i as any).hidden || result.unlockEgg);

  useEffect(() => {
    if (stage !== "menu") return;
    visibleItems.forEach((_, i) => {
      setTimeout(() => setVisibleCount(n => Math.max(n, i + 1)), i * 400);
    });
  }, [stage]);

  /* ── STAGE: input ── */
  if (stage === "input") {
    return (
      <div style={{
        position: "fixed", inset: 0, background: "var(--bg)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: F,
      }}>
        {konamiActive && <KonamiFlash onClose={() => setKonamiActive(false)} />}
        <button onClick={() => navigate(-1)} className="pixel-btn-outline"
          style={{ position: "fixed", top: 12, left: 12, fontSize: 9, padding: "6px 14px" }}>
          ← WSTECZ
        </button>

        <div className="window-box" style={{ maxWidth: 420, width: "calc(100% - 40px)", textAlign: "center" }}>
          <div style={{ fontSize: 9, opacity: 0.35, marginBottom: 6, letterSpacing: "0.15em" }}>
            [ KANAL ZABEZPIECZONY ]
          </div>
          <div style={{ fontSize: 14, marginBottom: 24 }}>the secret menu.</div>

          <div style={{ fontSize: 9, opacity: 0.5, marginBottom: 20, lineHeight: 2.4 }}>
            ten obszar nie istnieje oficjalnie.<br />
            wprowadz dowolny kod dostepu.<br />
            <span style={{ opacity: 0.35 }}>hint: sprobuj "jajko"</span>
          </div>

          <form onSubmit={submitCode} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              ref={inputRef}
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="KOD DOSTEPU"
              style={{ textAlign: "center", fontSize: 12, letterSpacing: "0.12em" }}
              autoComplete="off"
              spellCheck={false}
            />
            <button type="submit" className="pixel-btn" style={{ fontSize: 10 }}>
              WPROWADZ →
            </button>
          </form>

          <div style={{ marginTop: 20, fontSize: 8, opacity: 0.2, lineHeight: 2.2 }}>
            v2.6 · klasyfikacja: TAJNE
          </div>
        </div>
      </div>
    );
  }

  /* ── STAGE: verifying ── */
  if (stage === "verifying") {
    return (
      <div style={{
        position: "fixed", inset: 0, background: "var(--bg)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: F, textAlign: "center", gap: 14,
      }}>
        <div style={{ fontSize: 11, lineHeight: 2.4 }}>
          WERYFIKACJA<span className="blink">...</span>
        </div>
        <div style={{ fontSize: 9, opacity: 0.35 }}>KOD: &quot;{code || "(pusty)"}&quot;</div>
      </div>
    );
  }

  /* ── STAGE: granted ── */
  if (stage === "granted") {
    return (
      <div style={{
        position: "fixed", inset: 0, background: "var(--bg)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: F, textAlign: "center", gap: 16,
      }}>
        <div style={{ fontSize: 14, color: result.unlockEgg ? "var(--accent)" : "var(--fg)" }}>
          {result.grantedMsg}
        </div>
        <div style={{ fontSize: 9, opacity: 0.55, lineHeight: 2.2 }}>{result.response}</div>
        {result.unlockEgg && (
          <div style={{ fontSize: 9, color: "var(--accent)", lineHeight: 2 }}>
            EASTER EGG ODBLOKOWANY.
          </div>
        )}
      </div>
    );
  }

  /* ── STAGE: menu ── */
  return (
    <div style={{ minHeight: "100vh", fontFamily: F }}>
      {konamiActive && <KonamiFlash onClose={() => setKonamiActive(false)} />}
      <NotebookNavbar />

      <section style={{
        maxWidth: 640, margin: "0 auto",
        padding: "clamp(40px,8vh,80px) clamp(20px,5vw,40px) 80px",
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-end", flexWrap: "wrap", gap: 8, marginBottom: 10,
        }}>
          <h1 style={{ fontSize: "clamp(13px,2.5vw,18px)", margin: 0 }}>the secret menu.</h1>
          <span style={{ fontSize: 8, opacity: 0.3 }}>
            {result.unlockEgg ? "★ EGG AKTYWNY" : `KOD: ${code || "(pusty)"}`}
          </span>
        </div>

        <div style={{ fontSize: 8, opacity: 0.35, marginBottom: 28, lineHeight: 2.2 }}>
          {result.response} · kliknij item aby odkryc.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {visibleItems.map((item, i) => (
            <RedactedItem key={item.code} item={item} visible={i < visibleCount} />
          ))}
        </div>

        <div style={{ marginTop: 40, fontSize: 8, opacity: 0.18, textAlign: "center", lineHeight: 2.4 }}>
          hint: jest jeszcze jeden sekret na tej stronie.
        </div>
      </section>
    </div>
  );
}
