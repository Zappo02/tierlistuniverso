import { useState, useRef } from "react";
import html2canvas from "html2canvas";

// ═══════════════════════════════════════════════════
// DATI
// ═══════════════════════════════════════════════════

const TEAMS = [
  { id:"sa1",  name:"Inter",      short:"INT", color:"#0a1f5c", logo:"/logos/inter.png" },
  { id:"sa2",  name:"Milan",      short:"MIL", color:"#fb090b", logo:"/logos/milan.png" },
  { id:"sa3",  name:"Juventus",   short:"JUV", color:"#555",    logo:"/logos/juventus.png" },
  { id:"sa4",  name:"Roma",       short:"ROM", color:"#8b1a1a", logo:"/logos/roma.png" },
  { id:"sa5",  name:"Napoli",     short:"NAP", color:"#00a0de", logo:"/logos/napoli.png" },
  { id:"sa6",  name:"Como",       short:"COM", color:"#1f4e79", logo:"/logos/como.png" },
  { id:"sa7",  name:"Atalanta",   short:"ATA", color:"#1e3fa0", logo:"/logos/atalanta.png" },
  { id:"sa8",  name:"Fiorentina", short:"FIO", color:"#6a0dad", logo:"/logos/fiorentina.png" },
  { id:"sa9",  name:"Bologna",    short:"BOL", color:"#c8102e", logo:"/logos/bologna.png" },
  { id:"sa10", name:"Lazio",      short:"LAZ", color:"#4a90d9", logo:"/logos/lazio.png" },
  { id:"sa11", name:"Frosinone",  short:"FRO", color:"#b8960c", logo:"/logos/frosinone.png" },
  { id:"sa12", name:"Cagliari",   short:"CAG", color:"#b22222", logo:"/logos/cagliari.png" },
  { id:"sa13", name:"Lecce",      short:"LEC", color:"#b8960c", logo:"/logos/lecce.png" },
  { id:"sa14", name:"Parma",      short:"PAR", color:"#b8960c", logo:"/logos/parma.png" },
  { id:"sa15", name:"Venezia",    short:"VEN", color:"#f36f21", logo:"/logos/venezia.png" },
  { id:"sa16", name:"Monza",      short:"MON", color:"#c8102e", logo:"/logos/monza.png" },
  { id:"sa17", name:"Genoa",      short:"GEN", color:"#8b0000", logo:"/logos/genoa.png" },
  { id:"sa18", name:"Sassuolo",   short:"SAS", color:"#00622b", logo:"/logos/sassuolo.png" },
  { id:"sa19", name:"Torino",     short:"TOR", color:"#8b2500", logo:"/logos/torino.png" },
  { id:"sa20", name:"Udinese",    short:"UDI", color:"#2a2a4e", logo:"/logos/udinese.png" },
];

const TIER_TIERS = [
  { id:"elite",     label:"ELITE",     color:"#f5c842", desc:"Scudetto / Top 2" },
  { id:"champions", label:"CHAMPIONS", color:"#5ba3f5", desc:"Top 4 UCL" },
  { id:"europa",    label:"EUROPA",    color:"#3dbb6e", desc:"Europa / Conference" },
  { id:"salvezza",  label:"SALVEZZA",  color:"#f0922b", desc:"Mid-table" },
  { id:"retro",     label:"RETRO",     color:"#e84040", desc:"Zona rossa" },
];

const MARKET_TIERS = [
  { id:"v10", label:"10",  color:"#f5c842", desc:"Capolavoro" },
  { id:"v9",  label:"9",   color:"#3dbb6e", desc:"Eccellente" },
  { id:"v8",  label:"8",   color:"#5ba3f5", desc:"Molto bene" },
  { id:"v7",  label:"7",   color:"#a78bfa", desc:"Buono" },
  { id:"v6",  label:"6",   color:"#f0922b", desc:"Sufficiente" },
  { id:"v5",  label:"5",   color:"#e8c030", desc:"Insufficiente" },
  { id:"v04", label:"0-4", color:"#e84040", desc:"Disastroso" },
];

function empty(tiers) {
  const o = {};
  tiers.forEach(t => { o[t.id] = []; });
  return o;
}

// ═══════════════════════════════════════════════════
// LOGO COMPONENT
// ═══════════════════════════════════════════════════

function TeamLogo({ team, size }) {
  const [err, setErr] = useState(false);
  if (!team.logo || err)
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%", background: team.color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.2, fontWeight: 900, color: "#fff",
      }}>{team.short}</div>
    );
  return (
    <img
      src={team.logo}
      alt={team.name}
      draggable={false}
      style={{ width: size, height: size, objectFit: "contain", display: "block" }}
      onError={() => setErr(true)}
    />
  );
}

// ═══════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════

export default function App() {
  const [mode, setMode]     = useState("tier");
  const [dark, setDark]     = useState(true);
  const [pl, setPl]         = useState({ tier: empty(TIER_TIERS), market: empty(MARKET_TIERS) });
  const [pools, setPools]   = useState({ tier: TEAMS.map(t => t.id), market: TEAMS.map(t => t.id) });
  const [selected, setSel]  = useState(null); // teamId selezionato
  const [dragId, setDragId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null); // tierId su cui si sta hovering
  const boardRef = useRef(null);

  const TIERS      = mode === "tier" ? TIER_TIERS : MARKET_TIERS;
  const placements = pl[mode];
  const pool       = pools[mode];
  const getTeam    = id => TEAMS.find(t => t.id === id);

  // Colori tema
  const D = dark ? {
    bg: "#0d0d1a",
    headerBg: "#12122a",
    boardBg: "#0d0d1a",
    rowBg: "#111122",
    poolBg: "rgba(255,255,255,0.03)",
    border: "rgba(255,255,255,0.08)",
    text: "#f0f0f8",
    subText: "rgba(255,255,255,0.25)",
    cardBg: "rgba(255,255,255,0.05)",
    cardBorder: "rgba(255,255,255,0.1)",
    accent: "#f5c842",
    btnReset: { color:"#aaa", border:"rgba(255,255,255,0.25)" },
  } : {
    bg: "#f0f2f5",
    headerBg: "#ffffff",
    boardBg: "#ffffff",
    rowBg: "#f8f8fb",
    poolBg: "#f0f2f5",
    border: "rgba(0,0,0,0.1)",
    text: "#111",
    subText: "rgba(0,0,0,0.35)",
    cardBg: "rgba(0,0,0,0.04)",
    cardBorder: "rgba(0,0,0,0.12)",
    accent: "#d4a200",
    btnReset: { color:"#444", border:"rgba(0,0,0,0.3)" },
  };

  function moveTo(teamId, toTier) {
    setPl(prev => {
      const m = { ...prev };
      const tiers = {};
      TIERS.forEach(t => { tiers[t.id] = [...(m[mode][t.id]||[])].filter(id => id !== teamId); });
      tiers[toTier] = [...tiers[toTier], teamId];
      m[mode] = tiers;
      return m;
    });
    setPools(prev => ({ ...prev, [mode]: prev[mode].filter(id => id !== teamId) }));
    setSel(null);
  }

  function toPool(teamId) {
    setPl(prev => {
      const m = { ...prev };
      const tiers = {};
      TIERS.forEach(t => { tiers[t.id] = (m[mode][t.id]||[]).filter(id => id !== teamId); });
      m[mode] = tiers;
      return m;
    });
    setPools(prev => ({ ...prev, [mode]: [...prev[mode], teamId] }));
    setSel(null);
  }

  function randomize() {
    const ids = [...TEAMS.map(t=>t.id)].sort(() => Math.random() - .5);
    const n = TIERS.length;
    const sizes = Array(n).fill(Math.floor(ids.length / n));
    let rem = ids.length % n;
    for (let i = 0; i < rem; i++) sizes[i]++;
    const tiers = {}; let i = 0;
    TIERS.forEach((t, ti) => { tiers[t.id] = ids.slice(i, i + sizes[ti]); i += sizes[ti]; });
    setPl(prev => ({ ...prev, [mode]: tiers }));
    setPools(prev => ({ ...prev, [mode]: [] }));
    setSel(null);
  }

  function resetAll() {
    setPl(prev => ({ ...prev, [mode]: empty(TIERS) }));
    setPools(prev => ({ ...prev, [mode]: TEAMS.map(t => t.id) }));
    setSel(null);
  }

  async function saveImage() {
    if (!boardRef.current) return;
    const canvas = await html2canvas(boardRef.current, {
      backgroundColor: dark ? "#0d0d1a" : "#f0f2f5",
      scale: 2, useCORS: true, allowTaint: true,
    });
    const a = document.createElement("a");
    a.download = (mode === "tier" ? "TierList" : "Mercato") + "-SerieA.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  }

  function shareX() {
    const ml = mode === "tier" ? "Tier List" : "Voti Mercato";
    const txt = encodeURIComponent(`La mia ${ml} Serie A 2025/26! ⚽ #SerieA #TierList @universo_calcio`);
    window.open("https://twitter.com/intent/tweet?text=" + txt, "_blank");
  }

  const placed = Object.values(placements).flat().length;

  // ── Card logo ──────────────────────────────────────
  function Card({ teamId, inTier }) {
    const t = getTeam(teamId);
    if (!t) return null;
    const isSel = selected === teamId;
    const CARD = 60;

    return (
      <div
        title={t.name}
        draggable
        onDragStart={e => { e.stopPropagation(); setDragId(teamId); }}
        onDragEnd={() => { setDragId(null); setDropTarget(null); }}
        onClick={e => {
          e.stopPropagation();
          if (isSel) { setSel(null); return; }
          setSel(teamId);
        }}
        style={{
          width: CARD, height: CARD, flexShrink: 0,
          borderRadius: 10,
          border: isSel ? `3px solid ${D.accent}` : `2px solid ${D.cardBorder}`,
          boxShadow: isSel ? `0 0 16px ${D.accent}88` : `0 2px 6px rgba(0,0,0,0.25)`,
          cursor: "grab",
          userSelect: "none",
          overflow: "hidden",
          position: "relative",
          transition: "border .15s, box-shadow .15s, transform .1s",
          transform: dragId === teamId ? "scale(0.88) rotate(-3deg)" : "scale(1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "transparent",
        }}
      >
        <TeamLogo team={t} size={CARD} />
        {inTier && (
          <button
            onClick={e => { e.stopPropagation(); toPool(teamId); }}
            title="Rimuovi"
            style={{
              position: "absolute", top: 2, right: 2,
              width: 16, height: 16, borderRadius: "50%",
              background: "#e84040cc", border: "none",
              color: "#fff", fontSize: 10, fontWeight: 900,
              cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
              lineHeight: 1, padding: 0,
            }}>×</button>
        )}
      </div>
    );
  }

  // ── Tier row ────────────────────────────────────────
  function TierRow({ tier }) {
    const tierTeams = placements[tier.id] || [];
    const isDropTarget = dropTarget === tier.id;

    return (
      <div style={{ display: "flex", borderBottom: `1px solid ${D.border}`, minHeight: 84 }}>

        {/* Label */}
        <div
          style={{
            width: 110, minWidth: 110,
            background: dark
              ? `linear-gradient(90deg, ${tier.color}25, ${tier.color}08)`
              : `linear-gradient(90deg, ${tier.color}30, ${tier.color}10)`,
            borderRight: `4px solid ${tier.color}`,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "6px 4px", cursor: selected ? "pointer" : "default",
          }}
          onClick={() => {
            if (!selected) return;
            moveTo(selected, tier.id);
          }}
        >
          <div style={{
            fontSize: tier.label.length > 5 ? 10 : tier.label.length > 3 ? 12 : 20,
            fontWeight: 900, color: tier.color, textAlign: "center",
            lineHeight: 1.1, letterSpacing: 0.5,
            textShadow: dark ? `0 0 16px ${tier.color}66` : "none",
          }}>{tier.label}</div>
          <div style={{ fontSize: 8, color: D.subText, marginTop: 3, textAlign: "center" }}>{tier.desc}</div>
          {selected && (
            <div style={{ fontSize: 9, color: tier.color, marginTop: 4, opacity: 0.8 }}>← inserisci</div>
          )}
        </div>

        {/* Drop area */}
        <div
          style={{
            flex: 1, display: "flex", flexWrap: "wrap",
            alignItems: "center", padding: "10px 10px",
            gap: 8, background: isDropTarget
              ? (dark ? `${tier.color}18` : `${tier.color}15`)
              : D.rowBg,
            transition: "background .15s",
          }}
          onDragOver={e => { e.preventDefault(); setDropTarget(tier.id); }}
          onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDropTarget(null); }}
          onDrop={e => {
            e.preventDefault();
            if (dragId) { moveTo(dragId, tier.id); setDragId(null); }
            setDropTarget(null);
          }}
          onClick={() => {
            if (!selected) return;
            moveTo(selected, tier.id);
          }}
        >
          {tierTeams.map(tid => <Card key={tid} teamId={tid} inTier />)}
        </div>
      </div>
    );
  }

  // ── RENDER ──────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: D.bg, color: D.text, fontFamily: "'Inter','Segoe UI',sans-serif", paddingBottom: 60, transition: "background .3s, color .3s" }}>

      {/* HEADER */}
      <div style={{
        background: D.headerBg,
        borderBottom: `1px solid ${D.border}`,
        padding: "16px 16px 14px", textAlign: "center",
        boxShadow: dark ? "0 4px 30px rgba(0,0,0,0.5)" : "0 2px 12px rgba(0,0,0,0.08)",
      }}>
        <div style={{ fontSize: 9, letterSpacing: 6, color: D.accent, textTransform: "uppercase", marginBottom: 4, opacity: .8 }}>
          Universosportivo.com
        </div>
        <h1 style={{ margin: 0, fontSize: "clamp(18px,3.5vw,30px)", fontWeight: 900, letterSpacing: -1, color: D.text }}>
          {mode === "tier" ? "Tier List" : "Voti Mercato"}
          {" "}<span style={{ color: D.accent }}>Serie A</span>
          {" "}<span style={{ color: D.subText, fontSize: "0.6em", fontWeight: 600 }}>2025/26</span>
        </h1>
        <div style={{ fontSize: 11, color: D.subText, marginTop: 3 }}>
          {placed} / {TEAMS.length} squadre posizionate
        </div>

        {/* Mode + Dark toggle */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          <div style={{ display: "inline-flex", background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", borderRadius: 8, padding: 3 }}>
            {[["tier","⚽ Tier List"],["market","💰 Voti Mercato"]].map(([m,lbl]) => (
              <button key={m} onClick={() => { setMode(m); setSel(null); }}
                style={{
                  padding: "6px 16px", borderRadius: 6, border: "none", fontWeight: 700, fontSize: 12,
                  cursor: "pointer", transition: "all .2s",
                  background: mode === m ? D.accent : "transparent",
                  color: mode === m ? "#0d0d1a" : D.subText,
                }}>{lbl}</button>
            ))}
          </div>

          {/* Dark/Light toggle */}
          <button
            onClick={() => setDark(d => !d)}
            title={dark ? "Passa al tema chiaro" : "Passa al tema scuro"}
            style={{
              padding: "6px 12px", borderRadius: 8, border: `1px solid ${D.border}`,
              background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
              color: D.text, fontSize: 14, cursor: "pointer",
            }}>
            {dark ? "☀️" : "🌙"}
          </button>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 10, flexWrap: "wrap" }}>
          <Btn color="#f5c842" dark={dark} onClick={randomize}>🎲 Riempi a caso</Btn>
          <Btn color={dark ? "#aaa" : "#555"} dark={dark} onClick={resetAll} textColor={dark ? "#aaa" : "#333"}>↺ Svuota tutto</Btn>
          <Btn color="#3dbb6e" dark={dark} onClick={saveImage}>⬇ Salva PNG</Btn>
          <Btn color="#5ba3f5" dark={dark} onClick={shareX}>𝕏 Condividi</Btn>
        </div>
      </div>

      {selected && (
        <div style={{ textAlign: "center", padding: "8px 0", fontSize: 12, color: D.accent, fontWeight: 700 }}>
          {getTeam(selected)?.name} selezionato — tocca una fascia per inserirlo · tocca ancora per deselezionare
        </div>
      )}
      {!selected && (
        <div style={{ textAlign: "center", padding: "8px 0 0", fontSize: 10, color: D.subText }}>
          Trascina nella fascia oppure tocca il logo poi la fascia · × per rimuovere
        </div>
      )}

      {/* BOARD */}
      <div ref={boardRef} style={{ maxWidth: 860, margin: "10px auto 0", padding: "0 8px" }}>
        <div style={{
          borderRadius: 14, overflow: "hidden",
          border: `1px solid ${D.border}`,
          boxShadow: dark ? "0 8px 40px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.08)",
        }}>
          {TIERS.map(tier => <TierRow key={tier.id} tier={tier} />)}
        </div>

        {/* POOL */}
        <div style={{
          marginTop: 12, background: D.poolBg,
          borderRadius: 14, border: `1px solid ${D.border}`, padding: "12px 14px",
        }}>
          <div style={{ fontSize: 9, letterSpacing: 4, color: D.subText, textTransform: "uppercase", marginBottom: 12 }}>
            Da posizionare
          </div>
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 8, minHeight: 44 }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); if (dragId) { toPool(dragId); setDragId(null); } }}
          >
            {pool.length === 0
              ? <div style={{ color: D.subText, fontSize: 12, alignSelf: "center" }}>Tutte le squadre posizionate ✔</div>
              : pool.map(tid => <Card key={tid} teamId={tid} inTier={false} />)
            }
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 10, fontSize: 10, color: D.subText }}>
          Creato con ❤️ da <span style={{ color: D.accent }}>universosportivo.com</span> — nessun dato lascia il browser.
        </div>
      </div>
    </div>
  );
}

function Btn({ color, dark, onClick, children, textColor }) {
  const tc = textColor || color;
  return (
    <button onClick={onClick} style={{
      background: `${color}18`,
      border: `1px solid ${color}55`,
      color: tc,
      padding: "7px 14px", borderRadius: 8,
      fontSize: 12, fontWeight: 600, cursor: "pointer",
    }}>{children}</button>
  );
}

