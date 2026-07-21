import React, { useState, useEffect } from "react";
import { NotebookNavbar } from "@/components/notebook/NotebookNavbar";
import { toast } from "sonner";

const F = "'Press Start 2P', monospace";

function useTypewriter(text: string, speed = 22) {
  const [out, setOut] = useState("");
  useEffect(() => {
    setOut("");
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(iv);
    }, speed);
    return () => clearInterval(iv);
  }, [text]);
  return out;
}

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const intro = useTypewriter("masz pytanie o obiekt? napisz.");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !msg) return;
    setSent(true);
    toast("wiadomosc wyslana.");
  }

  return (
    <div style={{ minHeight: "100vh", fontFamily: F }}>
      <NotebookNavbar />

      <section style={{
        maxWidth: 640, margin: "0 auto",
        padding: "clamp(40px,8vh,80px) clamp(20px,5vw,40px) 60px",
      }}>
        <h1 style={{ fontSize: "clamp(13px,2.5vw,18px)", marginBottom: 28 }}>kontakt.</h1>

        {/* Typewriter desc */}
        <div className="window-box" style={{ fontSize: 11, lineHeight: 2.2, marginBottom: 32, background: "var(--input)" }}>
          <pre style={{ fontFamily: F, fontSize: 11, margin: 0, whiteSpace: "pre-wrap" }}>
            {intro}<span className="blink">■</span>
          </pre>
        </div>

        {/* Quick links */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 }}>
          {[
            { label: "TELEGRAM", val: "@artifexforge", href: "https://t.me/artifexforge" },
            { label: "EMAIL", val: "kontakt@artifexforge.pl", href: "mailto:kontakt@artifexforge.pl" },
            { label: "IG", val: "@artifexforge", href: "https://instagram.com/artifexforge" },
          ].map(c => (
            <div key={c.label} className="window-box" style={{
              padding: "10px 18px", display: "flex",
              justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8
            }}>
              <span style={{ fontSize: 10 }}>{c.label}</span>
              <a href={c.href} target="_blank" rel="noreferrer"
                style={{ fontSize: 9, color: "var(--fg)" }}>{c.val}</a>
            </div>
          ))}
        </div>

        {/* Contact form */}
        {!sent ? (
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="window-box" style={{ padding: "16px 20px 20px" }}>
              <div style={{ fontSize: 10, marginBottom: 14, borderBottom: "2px solid var(--fg)", paddingBottom: 10 }}>
                WYSLIJ WIADOMOSC
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 9, opacity: 0.5, display: "block", marginBottom: 4 }}>IMIE / NICK</label>
                  <input value={name} onChange={e => setName(e.target.value)} style={{ fontSize: 10 }} />
                </div>
                <div>
                  <label style={{ fontSize: 9, opacity: 0.5, display: "block", marginBottom: 4 }}>EMAIL</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ fontSize: 10 }} />
                </div>
                <div>
                  <label style={{ fontSize: 9, opacity: 0.5, display: "block", marginBottom: 4 }}>WIADOMOSC</label>
                  <textarea value={msg} onChange={e => setMsg(e.target.value)}
                    rows={4} style={{ fontSize: 10, resize: "vertical" }} />
                </div>
                <button type="submit" className="pixel-btn" style={{ fontSize: 10, marginTop: 4 }}>
                  WYSLIJ →
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="window-box" style={{ textAlign: "center", padding: "28px 24px" }}>
            <div style={{ fontSize: 12, marginBottom: 10 }}>WYSLANO.</div>
            <div style={{ fontSize: 9, opacity: 0.5, lineHeight: 2 }}>odezwiemy sie wkrotce.</div>
          </div>
        )}
      </section>
    </div>
  );
}
