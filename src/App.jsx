import { useState, useRef } from "react";
import html2canvas from "html2canvas";

// ═══════════════════════════════════════════════════
// DATI — modifica qui squadre e leghe
// ═══════════════════════════════════════════════════

const LEAGUES = [
  { id: "seriea", label: "Serie A", flag: "🇮🇹" },
];

const TEAMS = {
  seriea: [
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
  ],
};

// ═══════════════════════════════════════════════════
// FASCE — modifica qui label/colori
// ═══════════════════════════════════════════════════

const TIER_TIERS = [
  { id:"elite",     label:"ELITE",     color:"#f5c842", bg:"linear-gradient(90deg,#2a1f00,#1a1200)", desc:"Scudetto / Top 2" },
  { id:"champions", label:"CHAMPIONS", color:"#5ba3f5", bg:"linear-gradient(90deg,#001535,#00112a)", desc:"Top 4 UCL" },
  { id:"europa",    label:"EUROPA",    color:"#3dbb6e", bg:"linear-gradient(90deg,#002010,#001a0e)", desc:"Europa / Conference" },
  { id:"salvezza",  label:"SALVEZZA",  color:"#f0922b", bg:"linear-gradient(90deg,#221200,#1a0d00)", desc:"Mid-table sicuro" },
  { id:"retro",     label:"RETRO",     color:"#e84040", bg:"linear-gradient(90deg,#220000,#1a0000)", desc:"Zona rossa" },
];

const MARKET_TIERS = [
  { id:"v10", label:"10",  color:"#f5c842", bg:"linear-gradient(90deg,#2a1f00,#1a1200)", desc:"Capolavoro" },
  { id:"v9",  label:"9",   color:"#3dbb6e", bg:"linear-gradient(90deg,#002010,#001a0e)", desc:"Eccellente" },
  { id:"v8",  label:"8",   color:"#5ba3f5", bg:"linear-gradient(90deg,#001535,#00112a)", desc:"Molto bene" },
  { id:"v7",  label:"7",   color:"#a78bfa", bg:"linear-gradient(90deg,#0d0022,#0a0022)", desc:"Buono" },
  { id:"v6",  label:"6",   color:"#f0922b", bg:"linear-gradient(90deg,#221200,#1a0d00)", desc:"Sufficiente" },
  { id:"v5",  label:"5",   color:"#e8c030", bg:"linear-gradient(90deg,#221a00,#1a1400)", desc:"Insufficiente" },
  { id:"v04", label:"0-4", color:"#e84040", bg:"linear-gradient(90deg,#220000,#1a0000)", desc:"Disastroso" },
];

// ═══════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════

function empty(tiers) {
  const o = {};
  tiers.forEach(t => { o[t.id] = []; });
  return o;
}

function TeamLogo({ team, size = 52 }) {
  const [err, setErr] = useState(false);
  if (!team.logo || err)
    return (
      <div style={{ width:size, height:size, borderRadius:"50%", background:team.color,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:size*0.18, fontWeight:900, color:"#fff", letterSpacing:0.5 }}>
        {team.short}
      </div>
    );
  return <img src={team.logo} alt={team.name} style={{ width:size, height:size, objectFit:"contain" }} onError={() => setErr(true)} />;
}

export default function App() {
  const [mode, setMode]       = useState("tier");
  const [league, setLeague]   = useState("seriea");
  const [pl, setPl]           = useState({ tier: empty(TIER_TIERS), market: empty(MARKET_TIERS) });
  const [pools, setPools]     = useState({ tier: TEAMS.seriea.map(t=>t.id), market: TEAMS.seriea.map(t=>t.id) });
  const [selected, setSel]    = useState(null); // {teamId, fromTier}
  const [dragInfo, setDragInfo] = useState(null); // {teamId, fromTier, fromIdx}
  const [dragOver, setDragOver] = useState(null); // {tierId, idx}
  const [modal, setModal]     = useState(null);
  const boardRef              = useRef(null);

  const TIERS      = mode === "tier" ? TIER_TIERS : MARKET_TIERS;
  const placements = pl[mode];
  const pool       = pools[mode];
  const teams      = TEAMS[league] || [];
  const getTeam    = id => teams.find(t => t.id === id);

  function changeLeague(lg) {
    const ids = (TEAMS[lg] || []).map(t => t.id);
    setLeague(lg);
    setPl({ tier: empty(TIER_TIERS), market: empty(MARKET_TIERS) });
    setPools({ tier: ids, market: ids });
    setSel(null);
  }

  function move(teamId, toTier, toIdx) {
    setPl(prev => {
      const m = { ...prev };
      const tiers = {};
      TIERS.forEach(t => { tiers[t.id] = [...(m[mode][t.id]||[])].filter(id => id !== teamId); });
      const arr = tiers[toTier];
      if (toIdx !== undefined && toIdx !== null) arr.splice(toIdx, 0, teamId);
      else arr.push(teamId);
      m[mode] = tiers;
      return m;
    });
    setPools(prev => ({ ...prev, [mode]: prev[mode].filter(id => id !== teamId) }));
  }

  function reorder(tierId, fromIdx, toIdx) {
    if (fromIdx === toIdx) return;
    setPl(prev => {
      const m = { ...prev };
      const arr = [...(m[mode][tierId]||[])];
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      m[mode] = { ...m[mode], [tierId]: arr };
      return m;
    });
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
    const ids = [...teams.map(t=>t.id)].sort(()=>Math.random()-.5);
    const n = TIERS.length;
    const sizes = Array(n).fill(Math.floor(ids.length/n));
    let rem = ids.length % n;
    for (let i=0;i<rem;i++) sizes[i]++;
    const tiers = {}; let i=0;
    TIERS.forEach((t,ti) => { tiers[t.id]=ids.slice(i,i+sizes[ti]); i+=sizes[ti]; });
    setPl(prev => ({ ...prev, [mode]: tiers }));
    setPools(prev => ({ ...prev, [mode]: [] }));
    setSel(null);
  }

  function resetAll() {
    setPl(prev => ({ ...prev, [mode]: empty(TIERS) }));
    setPools(prev => ({ ...prev, [mode]: teams.map(t=>t.id) }));
    setSel(null);
  }

  async function saveImage() {
    if (!boardRef.current) return;
    const canvas = await html2canvas(boardRef.current, { backgroundColor:"#0d0d1a", scale:2, useCORS:true, allowTaint:true });
    const a = document.createElement("a");
    const lg = LEAGUES.find(l=>l.id===league)?.label||league;
    a.download = (mode==="tier"?"TierList":"Mercato")+"-"+lg+".png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  }

  function shareX() {
    const lg = LEAGUES.find(l=>l.id===league)?.label||"";
    const ml = mode==="tier" ? "Tier List" : "Voti Mercato";
    const txt = encodeURIComponent(`La mia ${ml} ${lg} 2025/26! ⚽ #SerieA #TierList @universo_calcio`);
    window.open("https://twitter.com/intent/tweet?text="+txt,"_blank");
  }

  const placed = Object.values(placements).flat().length;

  // ── Card (solo logo, niente testo) ─────────────────
  const Card = ({ teamId, fromTier, fromIdx, inModal, inPool }) => {
    const t = getTeam(teamId);
    if (!t) return null;
    const isSel = selected?.teamId === teamId;
    const tier = fromTier ? TIERS.find(x=>x.id===fromTier) : null;
    const accentColor = tier?.color || "#f5c842";

    const isDragTarget = dragOver && fromTier &&
      dragOver.tierId === fromTier && dragOver.idx === fromIdx;

    return (
      <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
        {/* Drop indicator */}
        {isDragTarget && (
          <div style={{ width:3, height:60, background:accentColor, borderRadius:2, marginRight:4, opacity:.8 }} />
        )}
        <div
          draggable
          onDragStart={e => {
            e.stopPropagation();
            setDragInfo({ teamId, fromTier, fromIdx });
            e.dataTransfer.effectAllowed = "move";
          }}
          onDragEnd={() => { setDragInfo(null); setDragOver(null); }}
          onDragOver={e => {
            e.preventDefault();
            e.stopPropagation();
            if (fromTier && dragInfo) setDragOver({ tierId: fromTier, idx: fromIdx });
          }}
          onDrop={e => {
            e.preventDefault();
            e.stopPropagation();
            if (!dragInfo) return;
            if (dragInfo.fromTier === fromTier && dragInfo.fromIdx !== undefined && fromIdx !== undefined) {
              reorder(fromTier, dragInfo.fromIdx, fromIdx);
            } else {
              move(dragInfo.teamId, fromTier, fromIdx);
            }
            setDragInfo(null);
            setDragOver(null);
          }}
          onClick={e => {
            e.stopPropagation();
            if (inModal) { move(teamId, modal); setModal(null); return; }
            if (isSel) { setSel(null); return; }
            setSel({ teamId, fromTier });
          }}
          title={t.name}
          style={{
            width: inModal || inPool ? 60 : 64,
            height: inModal || inPool ? 60 : 64,
            flexShrink: 0,
            background: isSel
              ? `radial-gradient(circle, ${accentColor}33, #151525)`
              : "rgba(255,255,255,0.04)",
            border: isSel
              ? `2px solid ${accentColor}`
              : "2px solid rgba(255,255,255,0.08)",
            boxShadow: isSel
              ? `0 0 14px ${accentColor}99, 0 0 30px ${accentColor}33`
              : "0 2px 8px rgba(0,0,0,0.4)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: inModal ? "pointer" : "grab",
            userSelect: "none",
            position: "relative",
            transition: "border .15s, box-shadow .15s, transform .1s",
            transform: dragInfo?.teamId === teamId ? "scale(0.92) rotate(-2deg)" : "scale(1)",
          }}
        >
          <TeamLogo team={t} size={inModal || inPool ? 40 : 44} />
          {fromTier && (
            <button
              onClick={e => { e.stopPropagation(); toPool(teamId); }}
              title="Rimuovi"
              style={{
                position:"absolute", top:-6, right:-6,
                width:16, height:16, borderRadius:"50%",
                background:"#e84040", border:"none",
                color:"#fff", fontSize:10, fontWeight:700,
                cursor:"pointer", display:"flex", alignItems:"center",
                justifyContent:"center", lineHeight:1, padding:0,
                opacity: 0.85,
              }}>×</button>
          )}
        </div>
      </div>
    );
  };

  // ── Tier row ────────────────────────────────────────
  const TierRow = ({ tier }) => {
    const tierTeams = placements[tier.id] || [];
    const isOver = dragOver?.tierId === tier.id;
    return (
      <div style={{ display:"flex", borderBottom:"1px solid rgba(255,255,255,0.05)", minHeight:88 }}>

        {/* Label */}
        <div style={{
          width:110, minWidth:110,
          background: tier.bg,
          borderRight:`3px solid ${tier.color}`,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          padding:"8px 6px", position:"relative", overflow:"hidden",
        }}>
          <div style={{
            position:"absolute", inset:0,
            background:`radial-gradient(ellipse at left, ${tier.color}22, transparent 70%)`,
            pointerEvents:"none",
          }} />
          <div style={{
            fontSize: tier.label.length > 5 ? 11 : tier.label.length > 3 ? 13 : 22,
            fontWeight:900, color:tier.color, textAlign:"center",
            lineHeight:1.1, letterSpacing: tier.label.length > 3 ? 0.5 : 1,
            textShadow:`0 0 20px ${tier.color}88`,
          }}>{tier.label}</div>
          <div style={{ fontSize:8, color:"rgba(255,255,255,0.3)", marginTop:3, textAlign:"center", lineHeight:1.3 }}>{tier.desc}</div>
        </div>

        {/* Slots */}
        <div
          style={{
            flex:1, display:"flex", flexWrap:"wrap", alignItems:"center",
            padding:"10px 8px", gap:8,
            background: isOver ? `rgba(255,255,255,0.03)` : "transparent",
            transition:"background .15s",
          }}
          onDragOver={e => { e.preventDefault(); setDragOver({ tierId: tier.id, idx: tierTeams.length }); }}
          onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(null); }}
          onDrop={e => {
            e.preventDefault();
            if (!dragInfo) return;
            if (dragInfo.fromTier === tier.id && dragInfo.fromIdx !== undefined) {
              // reorder to end
              reorder(tier.id, dragInfo.fromIdx, tierTeams.length - 1);
            } else {
              move(dragInfo.teamId, tier.id);
            }
            setDragInfo(null); setDragOver(null);
          }}
          onClick={() => {
            if (!selected) return;
            if (selected.fromTier) toPool(selected.teamId);
            move(selected.teamId, tier.id);
            setSel(null);
          }}
        >
          {tierTeams.map((tid, idx) => (
            <Card key={tid} teamId={tid} fromTier={tier.id} fromIdx={idx} />
          ))}

          {/* Add slot */}
          {pool.length > 0 && (
            <div
              onClick={e => { e.stopPropagation(); setModal(tier.id); }}
              style={{
                width:64, height:64, flexShrink:0,
                border:`2px dashed rgba(255,255,255,0.12)`,
                borderRadius:10, display:"flex", alignItems:"center",
                justifyContent:"center", cursor:"pointer",
                color:"rgba(255,255,255,0.2)", fontSize:26,
                transition:"all .2s",
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = tier.color; e.currentTarget.style.color = tier.color; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.2)"; }}
            >+</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0d0d1a", color:"#f0f0f8", fontFamily:"'Inter','Segoe UI',sans-serif", paddingBottom:60 }}>

      {/* ── HEADER ────────────────────────────────── */}
      <div style={{
        background:"linear-gradient(180deg, #12122a 0%, #0d0d1a 100%)",
        borderBottom:"1px solid rgba(245,200,66,0.2)",
        padding:"18px 16px 16px", textAlign:"center",
        boxShadow:"0 4px 40px rgba(0,0,0,0.6)",
      }}>
        <div style={{ fontSize:9, letterSpacing:7, color:"#f5c842", textTransform:"uppercase", marginBottom:4, opacity:.7 }}>
          Universosportivo.com
        </div>
        <h1 style={{ margin:0, fontSize:"clamp(20px,4vw,34px)", fontWeight:900, letterSpacing:-1.5, color:"#fff",
          textShadow:"0 2px 20px rgba(245,200,66,0.3)" }}>
          {mode==="tier" ? "Tier List" : "Voti Mercato"}
          {" "}<span style={{ color:"#f5c842" }}>Serie A</span>
          {" "}<span style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.65em", fontWeight:600 }}>2025/26</span>
        </h1>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:4 }}>
          {placed} / {teams.length} squadre posizionate
        </div>

        {/* Mode switch */}
        <div style={{ display:"inline-flex", marginTop:12, background:"rgba(255,255,255,0.05)", borderRadius:8, padding:3 }}>
          {[["tier","⚽ Tier List"],["market","💰 Voti Mercato"]].map(([m,lbl])=>(
            <button key={m} onClick={()=>{setMode(m);setSel(null);}}
              style={{
                padding:"7px 18px", borderRadius:6, border:"none", fontWeight:700, fontSize:12,
                cursor:"pointer", transition:"all .2s",
                background: mode===m ? "#f5c842" : "transparent",
                color: mode===m ? "#0d0d1a" : "rgba(255,255,255,0.4)",
                boxShadow: mode===m ? "0 2px 12px rgba(245,200,66,0.4)" : "none",
              }}>{lbl}</button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:12, flexWrap:"wrap" }}>
          {[
            ["#f5c842","🎲 Riempi a caso", randomize],
            ["rgba(255,255,255,0.3)","↺ Svuota",resetAll],
            ["#3dbb6e","⬇ Salva PNG",saveImage],
            ["#5ba3f5","𝕏 Condividi",shareX],
          ].map(([c,lbl,fn])=>(
            <button key={lbl} onClick={fn} style={{
              background:`${c}18`, border:`1px solid ${c}55`, color:c,
              padding:"7px 14px", borderRadius:8, fontSize:12, fontWeight:600,
              cursor:"pointer", transition:"all .2s",
            }}
            onMouseOver={e=>e.currentTarget.style.background=`${c}30`}
            onMouseOut={e=>e.currentTarget.style.background=`${c}18`}
            >{lbl}</button>
          ))}
        </div>
      </div>

      <div style={{ textAlign:"center", fontSize:10, color:"rgba(255,255,255,0.2)", padding:"8px 0 0" }}>
        Trascina per posizionare e riordinare · Tocca per selezionare · × per rimuovere
      </div>

      {/* ── BOARD ─────────────────────────────────── */}
      <div ref={boardRef} style={{ maxWidth:860, margin:"12px auto 0", padding:"0 8px" }}>
        <div style={{
          borderRadius:14, overflow:"hidden",
          border:"1px solid rgba(255,255,255,0.08)",
          boxShadow:"0 8px 40px rgba(0,0,0,0.5)",
        }}>
          {TIERS.map(tier => <TierRow key={tier.id} tier={tier} />)}
        </div>

        {/* Pool */}
        <div style={{
          marginTop:14, background:"rgba(255,255,255,0.03)",
          borderRadius:14, border:"1px solid rgba(255,255,255,0.07)", padding:"12px 14px",
        }}>
          <div style={{ fontSize:9, letterSpacing:4, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", marginBottom:12 }}>
            Da posizionare
          </div>
          <div
            style={{ display:"flex", flexWrap:"wrap", gap:8, minHeight:44 }}
            onDragOver={e=>e.preventDefault()}
            onDrop={e=>{e.preventDefault();if(dragInfo?.fromTier){toPool(dragInfo.teamId);setDragInfo(null);setDragOver(null);}}}
          >
            {pool.length===0
              ? <div style={{ color:"rgba(255,255,255,0.2)", fontSize:12, alignSelf:"center" }}>Tutte le squadre posizionate ✔</div>
              : pool.map(tid => <Card key={tid} teamId={tid} fromTier={null} inPool />)
            }
          </div>
        </div>

        <div style={{ textAlign:"center", marginTop:12, fontSize:10, color:"rgba(255,255,255,0.15)" }}>
          Creato con ❤️ da <span style={{ color:"#f5c842" }}>universosportivo.com</span> — nessun dato lascia il browser.
        </div>
      </div>

      {/* ── MODAL ─────────────────────────────────── */}
      {modal && (
        <div onClick={()=>setModal(null)} style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.85)",
          display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000,
          backdropFilter:"blur(4px)",
        }}>
          <div onClick={e=>e.stopPropagation()} style={{
            background:"#161628", border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:16, padding:22, maxWidth:420, width:"92%", maxHeight:"80vh", overflowY:"auto",
            boxShadow:"0 20px 60px rgba(0,0,0,0.7)",
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <span style={{ fontWeight:800, fontSize:15, color:"#fff" }}>Scegli una squadra</span>
              <button onClick={()=>setModal(null)} style={{ background:"rgba(255,255,255,0.1)", border:"none", color:"#fff", fontSize:16, cursor:"pointer", borderRadius:6, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
              {pool.map(tid => <Card key={tid} teamId={tid} fromTier={null} inModal />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

