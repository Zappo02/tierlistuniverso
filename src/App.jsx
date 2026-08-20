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
// FASCE — modifica qui le label/colori
// ═══════════════════════════════════════════════════

const TIER_TIERS = [
  { id:"elite",     label:"ELITE",         color:"#c9a84c", bg:"#1a1200", desc:"Scudetto / Top 2" },
  { id:"champions", label:"CHAMPIONS",     color:"#4a90d9", bg:"#00112a", desc:"Top 4 UCL" },
  { id:"europa",    label:"EUROPA",        color:"#3dbb6e", bg:"#001a0e", desc:"Europa / Conference" },
  { id:"salvezza",  label:"SALVEZZA",      color:"#e07b20", bg:"#1a0d00", desc:"Mid-table sicuro" },
  { id:"retro",     label:"RETRO",         color:"#c0392b", bg:"#1a0000", desc:"Zona rossa" },
];

const MARKET_TIERS = [
  { id:"v10", label:"10",  color:"#c9a84c", bg:"#1a1200", desc:"Capolavoro" },
  { id:"v9",  label:"9",   color:"#3dbb6e", bg:"#001a0e", desc:"Eccellente" },
  { id:"v8",  label:"8",   color:"#4a90d9", bg:"#00112a", desc:"Molto bene" },
  { id:"v7",  label:"7",   color:"#7b68ee", bg:"#0a0022", desc:"Buono" },
  { id:"v6",  label:"6",   color:"#e07b20", bg:"#1a0d00", desc:"Sufficiente" },
  { id:"v5",  label:"5",   color:"#c8a000", bg:"#1a1400", desc:"Insufficiente" },
  { id:"v04", label:"0-4", color:"#c0392b", bg:"#1a0000", desc:"Disastroso" },
];

// ═══════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════

function empty(tiers) {
  const o = {};
  tiers.forEach(t => { o[t.id] = []; });
  return o;
}

function Logo({ team }) {
  const [err, setErr] = useState(false);
  if (!team.logo || err)
    return <div style={{ width:34,height:34,borderRadius:"50%",background:team.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:"#fff" }}>{team.short}</div>;
  return <img src={team.logo} alt={team.name} style={{ width:34,height:34,objectFit:"contain" }} onError={() => setErr(true)} />;
}

export default function App() {
  const [mode, setMode]     = useState("tier");
  const [league, setLeague] = useState("seriea");
  const [pl, setPl]         = useState({ tier: empty(TIER_TIERS), market: empty(MARKET_TIERS) });
  const [pools, setPools]   = useState({ tier: TEAMS.seriea.map(t=>t.id), market: TEAMS.seriea.map(t=>t.id) });
  const [selected, setSel]  = useState(null);
  const [dragging, setDrag] = useState(null);
  const [modal, setModal]   = useState(null);
  const boardRef            = useRef(null);

  const TIERS    = mode === "tier" ? TIER_TIERS : MARKET_TIERS;
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

  function move(teamId, toTier) {
    setPl(prev => {
      const m = { ...prev };
      const tiers = { ...m[mode] };
      TIERS.forEach(t => { tiers[t.id] = (tiers[t.id]||[]).filter(id => id !== teamId); });
      tiers[toTier] = [...(tiers[toTier]||[]), teamId];
      m[mode] = tiers;
      return m;
    });
    setPools(prev => ({ ...prev, [mode]: prev[mode].filter(id => id !== teamId) }));
  }

  function toPool(teamId) {
    setPl(prev => {
      const m = { ...prev };
      const tiers = { ...m[mode] };
      TIERS.forEach(t => { tiers[t.id] = (tiers[t.id]||[]).filter(id => id !== teamId); });
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
    const canvas = await html2canvas(boardRef.current, { backgroundColor:"#0a0a12", scale:2, useCORS:true, allowTaint:true });
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

  // Card component
  const Card = ({ teamId, fromTier, inModal }) => {
    const t = getTeam(teamId);
    if (!t) return null;
    const isSel = selected?.teamId === teamId;
    const tier = fromTier ? TIERS.find(x=>x.id===fromTier) : null;
    return (
      <div
        draggable={!inModal}
        onDragStart={e => { e.stopPropagation(); setDrag({ teamId, fromTier }); e.dataTransfer.effectAllowed="move"; }}
        onClick={e => {
          e.stopPropagation();
          if (inModal) { move(teamId, modal); setModal(null); return; }
          if (isSel) { setSel(null); return; }
          setSel({ teamId, fromTier });
        }}
        style={{
          width:72, height:84, flexShrink:0,
          background: isSel ? "#ffffff18" : "#151525",
          border: isSel ? `2px solid ${tier?.color||"#c9a84c"}` : "2px solid #252540",
          boxShadow: isSel ? `0 0 10px ${tier?.color||"#c9a84c"}88` : "none",
          borderRadius:8, display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          cursor: inModal ? "pointer" : "grab",
          userSelect:"none", position:"relative", transition:"border .15s",
        }}
      >
        <Logo team={t} />
        <div style={{ fontSize:9,marginTop:4,color:"#ccc",textAlign:"center",lineHeight:1.2,maxWidth:68,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",padding:"0 2px" }}>{t.name}</div>
        {fromTier && (
          <button onClick={e=>{e.stopPropagation();toPool(teamId);}}
            style={{ position:"absolute",top:2,right:2,background:"none",border:"none",color:"#c0392b",fontSize:11,cursor:"pointer",lineHeight:1,padding:1 }}>×</button>
        )}
      </div>
    );
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a12", color:"#f0f0f8", fontFamily:"'Inter','Segoe UI',sans-serif", paddingBottom:60 }}>

      {/* HEADER */}
      <div style={{ background:"linear-gradient(135deg,#0a0a12,#131325)", borderBottom:"2px solid #c9a84c33", padding:"16px 16px 14px", textAlign:"center" }}>
        <div style={{ fontSize:10,letterSpacing:6,color:"#c9a84c",textTransform:"uppercase",marginBottom:3 }}>Universosportivo.com</div>
        <h1 style={{ margin:0, fontSize:"clamp(17px,3.5vw,28px)", fontWeight:900, letterSpacing:-1, color:"#fff" }}>
          {mode==="tier" ? "Tier List" : "Voti Mercato"} <span style={{ color:"#c9a84c" }}>{LEAGUES.find(l=>l.id===league)?.flag} {LEAGUES.find(l=>l.id===league)?.label}</span> 2025/26
        </h1>
        <div style={{ fontSize:11,color:"#888",marginTop:3 }}>{placed} / {teams.length} squadre posizionate</div>

        {/* MODE */}
        <div style={{ display:"flex",justifyContent:"center",marginTop:10,background:"#13131f",borderRadius:8,padding:3,width:"fit-content",margin:"10px auto 0" }}>
          {[["tier","⚽ Tier List"],["market","💰 Voti Mercato"]].map(([m,lbl])=>(
            <button key={m} onClick={()=>{setMode(m);setSel(null);}}
              style={{ padding:"6px 16px",borderRadius:6,border:"none",fontWeight:700,fontSize:12,cursor:"pointer",background:mode===m?"#c9a84c":"transparent",color:mode===m?"#000":"#888",transition:"all .2s" }}>{lbl}</button>
          ))}
        </div>

        {/* LEAGUES */}
        <div style={{ display:"flex",justifyContent:"center",gap:6,marginTop:10,flexWrap:"wrap" }}>
          {LEAGUES.map(lg=>(
            <button key={lg.id} onClick={()=>changeLeague(lg.id)}
              style={{ padding:"4px 12px",borderRadius:20,border:`1px solid ${league===lg.id?"#c9a84c":"#333"}`,background:league===lg.id?"#c9a84c18":"transparent",color:league===lg.id?"#c9a84c":"#888",fontSize:11,fontWeight:600,cursor:"pointer",transition:"all .2s" }}>
              {lg.flag} {lg.label}
            </button>
          ))}
        </div>

        {/* ACTIONS */}
        <div style={{ display:"flex",gap:8,justifyContent:"center",marginTop:10,flexWrap:"wrap" }}>
          {[["#c9a84c","#1a120033","🎲 Riempi a caso",randomize],["#888","#1a1a1a33","↺ Svuota tutto",resetAll],["#3dbb6e","#001a0e33","⬇ Salva PNG",saveImage],["#1da1f2","#00112a33","𝕏 Condividi",shareX]].map(([c,bg,lbl,fn])=>(
            <button key={lbl} onClick={fn} style={{ background:bg,border:`1px solid ${c}66`,color:c,padding:"6px 13px",borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer" }}>{lbl}</button>
          ))}
        </div>
      </div>

      <div style={{ textAlign:"center",fontSize:10,color:"#555",padding:"7px 16px 0" }}>
        Trascina nelle fasce · Mobile: tocca squadra poi fascia · × per rimuovere
      </div>

      {/* BOARD */}
      <div ref={boardRef} style={{ maxWidth:800,margin:"12px auto 0",padding:"0 8px" }}>
        <div style={{ background:"#0d0d1a",borderRadius:12,overflow:"hidden",border:"1px solid #222" }}>
          {TIERS.map(tier => {
            const tierTeams = placements[tier.id] || [];
            return (
              <div key={tier.id} style={{ display:"flex",borderBottom:"1px solid #1a1a2e",minHeight:96 }}>
                {/* Label */}
                <div style={{ width:90,minWidth:90,background:tier.bg,borderRight:`3px solid ${tier.color}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"6px 4px" }}>
                  <div style={{ fontSize:tier.label.length>3?10:16,fontWeight:900,color:tier.color,textAlign:"center",lineHeight:1.2 }}>{tier.label}</div>
                  <div style={{ fontSize:8,color:"#555",marginTop:2,textAlign:"center",lineHeight:1.3 }}>{tier.desc}</div>
                </div>
                {/* Teams */}
                <div
                  style={{ flex:1,display:"flex",flexWrap:"wrap",alignItems:"center",padding:"8px 6px",gap:6,background:"#0d0d1a" }}
                  onDragOver={e=>e.preventDefault()}
                  onDrop={e=>{e.preventDefault();if(dragging){move(dragging.teamId,tier.id);setDrag(null);}}}
                  onClick={()=>{if(selected){if(selected.fromTier)toPool(selected.teamId);move(selected.teamId,tier.id);setSel(null);}}}
                >
                  {tierTeams.map(tid=><Card key={tid} teamId={tid} fromTier={tier.id} />)}
                  {pool.length > 0 && (
                    <div onClick={e=>{e.stopPropagation();setModal(tier.id);}}
                      onMouseOver={e=>{e.currentTarget.style.borderColor=tier.color;e.currentTarget.style.color=tier.color;}}
                      onMouseOut={e=>{e.currentTarget.style.borderColor="#333";e.currentTarget.style.color="#444";}}
                      style={{ width:72,height:84,border:"2px dashed #333",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#444",fontSize:24,flexShrink:0,transition:"all .15s" }}>+</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* POOL */}
        <div style={{ marginTop:12,background:"#0d0d1a",borderRadius:12,border:"1px solid #222",padding:12 }}>
          <div style={{ fontSize:10,letterSpacing:3,color:"#555",textTransform:"uppercase",marginBottom:10 }}>Squadre da posizionare</div>
          <div style={{ display:"flex",flexWrap:"wrap",gap:8,minHeight:40 }}
            onDragOver={e=>e.preventDefault()}
            onDrop={e=>{e.preventDefault();if(dragging?.fromTier){toPool(dragging.teamId);setDrag(null);}}}>
            {pool.length===0
              ? <div style={{ color:"#333",fontSize:12,alignSelf:"center" }}>Tutte le squadre posizionate ✔</div>
              : pool.map(tid=><Card key={tid} teamId={tid} fromTier={null} />)
            }
          </div>
        </div>

        <div style={{ textAlign:"center",marginTop:12,fontSize:10,color:"#333" }}>
          Creato con ❤️ da <span style={{ color:"#c9a84c" }}>universosportivo.com</span> — nessun dato lascia il browser.
        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div onClick={()=>setModal(null)} style={{ position:"fixed",inset:0,background:"#000c",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#13131f",border:"1px solid #333",borderRadius:14,padding:20,maxWidth:400,width:"90%",maxHeight:"80vh",overflowY:"auto" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
              <span style={{ fontWeight:700,fontSize:14 }}>Scegli una squadra</span>
              <button onClick={()=>setModal(null)} style={{ background:"none",border:"none",color:"#888",fontSize:18,cursor:"pointer" }}>×</button>
            </div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
              {pool.map(tid=><Card key={tid} teamId={tid} fromTier={null} inModal />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

