import { useState, useRef, useCallback, useEffect } from "react";
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
  { id:"scudetto",  label:"SCUDETTO",       color:"#f5c842", desc:"Campione d'Italia" },
  { id:"champions", label:"CHAMPIONS",      color:"#5ba3f5", desc:"Top 4 UCL" },
  { id:"europa",    label:"EUROPA",         color:"#3dbb6e", desc:"Europa / Conference" },
  { id:"meta",      label:"MET\u00c0 CLASS.",color:"#c084fc", desc:"Stagione tranquilla" },
  { id:"salvezza",  label:"SALVEZZA",       color:"#f0922b", desc:"Zona salvezza" },
  { id:"retro",     label:"RETROCESSIONE",  color:"#e84040", desc:"Scende in Serie B" },
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

const FREE_COLORS = ["#f5c842","#5ba3f5","#3dbb6e","#f0922b","#e84040","#a78bfa","#e8c030","#ff6eb4","#00d4aa","#ff9f43"];

function mkId() { return Math.random().toString(36).slice(2,9); }
function empty(tiers) { const o={}; tiers.forEach(t=>{o[t.id]=[]}); return o; }
function initFreeTiers() {
  return [
    { id:mkId(), label:"S", color:"#f5c842" },
    { id:mkId(), label:"A", color:"#5ba3f5" },
    { id:mkId(), label:"B", color:"#3dbb6e" },
    { id:mkId(), label:"C", color:"#f0922b" },
    { id:mkId(), label:"D", color:"#e84040" },
  ];
}

const LS_KEY = "tierlist_v3";
function saveLS(data) { try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {} }
function loadLS() { try { return JSON.parse(localStorage.getItem(LS_KEY)); } catch { return null; } }

// ═══════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════

function TeamLogo({ team, size }) {
  const [err, setErr] = useState(false);
  if (!team.logo || err)
    return <div style={{ width:size, height:size, borderRadius:"50%", background:team.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*.18, fontWeight:900, color:"#fff", flexShrink:0 }}>{team.short}</div>;
  return <img src={team.logo} alt={team.name} draggable={false} style={{ width:size, height:size, objectFit:"contain", display:"block", pointerEvents:"none", flexShrink:0 }} onError={()=>setErr(true)} />;
}

function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position:"relative", display:"inline-flex" }}
      onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}>
      {children}
      {show && text && (
        <div style={{ position:"absolute", bottom:"calc(100% + 6px)", left:"50%", transform:"translateX(-50%)",
          background:"rgba(0,0,0,0.9)", color:"#fff", fontSize:10, fontWeight:600,
          padding:"3px 8px", borderRadius:5, whiteSpace:"nowrap", pointerEvents:"none", zIndex:999 }}>
          {text}
        </div>
      )}
    </div>
  );
}

function Btn({ color, onClick, children, textColor, title }) {
  return (
    <button onClick={onClick} title={title} style={{ background:`${color}18`, border:`1px solid ${color}55`, color:textColor||color, padding:"7px 13px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}>
      {children}
    </button>
  );
}

function FreeCard({ item, onRemove, isSel, onClick, accent }) {
  const [err, setErr] = useState(false);
  const SIZE = 68;
  return (
    <Tooltip text={item.text || ""}>
      <div onClick={e=>{e.stopPropagation();onClick();}}
        style={{ width:SIZE, height:SIZE, flexShrink:0, borderRadius:10,
          border:isSel?`3px solid ${accent}`:"2px solid rgba(255,255,255,0.15)",
          boxShadow:isSel?`0 0 16px ${accent}88`:"0 2px 6px rgba(0,0,0,0.3)",
          overflow:"hidden", position:"relative", cursor:"pointer",
          background:item.img&&!err?"transparent":"rgba(255,255,255,0.07)",
          display:"flex", alignItems:"center", justifyContent:"center",
          userSelect:"none", transition:"border .15s, transform .15s",
          transform:isSel?"scale(1.06)":"scale(1)",
        }}>
        {item.img && !err
          ? <img src={item.img} alt={item.text} draggable={false} onError={()=>setErr(true)} style={{ width:"100%", height:"100%", objectFit:"cover", pointerEvents:"none" }} />
          : <div style={{ fontSize:10, fontWeight:700, color:"#fff", textAlign:"center", padding:"4px", lineHeight:1.3, wordBreak:"break-word" }}>{item.text}</div>
        }
        {item.img && !err && item.text && (
          <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(0,0,0,0.6)", fontSize:8, color:"#fff", textAlign:"center", padding:"2px", lineHeight:1.2 }}>{item.text}</div>
        )}
        {onRemove && (
          <button onClick={e=>{e.stopPropagation();onRemove();}}
            style={{ position:"absolute",top:2,right:2,width:15,height:15,borderRadius:"50%",background:"#e84040cc",border:"none",color:"#fff",fontSize:9,fontWeight:900,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0 }}>×</button>
        )}
      </div>
    </Tooltip>
  );
}

// ── Card Serie A (fuori da App per evitare re-render/flickering) ──────────────
const Card = ({ teamId, inTier, tierId, tierIdx, tierColor,
  getTeam, selected, setSel, dragRef, newEntries, showArgs,
  argsRef, D, getGlobalBadge, toPool, dark }) => {
  const t = getTeam(teamId); if (!t) return null;
  const isSel  = selected === teamId;
  const isNew  = newEntries.has(teamId);
  const withArgs = (showArgs === "editing" || showArgs === "fatto") && inTier;
  const LOGO = 44; // logo compatto

  function handleDragStart(e) {
    dragRef.current = { id: teamId, fromTier: inTier ? tierId : null, fromIdx: tierIdx };
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", teamId);
  }

  return (
    <Tooltip text={t.name}>
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={()=>{ dragRef.current = { id:null, fromTier:null, fromIdx:null }; }}
        onClick={e=>{ e.stopPropagation(); if(isSel){setSel(null);}else{setSel(teamId);} }}
        style={{
          width: withArgs ? 64 : LOGO+2,
          flexShrink:0, borderRadius:10, overflow:"hidden",
          position:"relative", cursor:"grab", userSelect:"none",
          border:isSel?`2px solid ${D.accent}`:`2px solid rgba(255,255,255,0.1)`,
          boxShadow:isSel?`0 0 12px ${D.accent}88`:"0 2px 6px rgba(0,0,0,0.25)",
          transition:"border .15s, box-shadow .15s",
          transform: isNew ? "scale(1.12)" : "scale(1)",
          display:"flex", flexDirection:"column", alignItems:"center",
          background: withArgs ? `${tierColor||D.accent}12` : "transparent",
        }}
      >
        <div style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", padding: withArgs?"6px 0 2px":"0", position:"relative" }}>
          <TeamLogo team={t} size={LOGO} />
          {inTier && (
            <button onClick={e=>{e.stopPropagation();toPool(teamId);}}
              style={{ position:"absolute",top:1,right:1,width:14,height:14,borderRadius:"50%",background:"#e84040",border:"1px solid rgba(0,0,0,0.3)",color:"#fff",fontSize:9,fontWeight:900,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,lineHeight:1 }}>×</button>
          )}
          {inTier && !withArgs && (
            <div style={{ position:"absolute",bottom:1,left:1,background:"rgba(0,0,0,0.65)",borderRadius:3,fontSize:7,fontWeight:700,color:"#fff",padding:"1px 3px",lineHeight:1.4 }}>
              {getGlobalBadge(tierId, tierIdx)}
            </div>
          )}
        </div>
        {withArgs && (
          <ArgBox teamId={teamId} argsRef={argsRef} D={D} tierColor={tierColor || D.accent} argsMode={showArgs} />
        )}
      </div>
    </Tooltip>
  );
};

// ArgBox — uncontrolled, auto-resize, colore fascia, solo se ha testo in modalità "fatto"
function ArgBox({ teamId, argsRef, D, tierColor, argsMode }) {
  const localRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const [hasText, setHasText] = useState(!!(argsRef.current[teamId]));

  useEffect(() => {
    if (localRef.current) {
      localRef.current.value = argsRef.current[teamId] || "";
      autoResize(localRef.current);
    }
  }, [teamId]);

  function autoResize(el) {
    el.style.height = "auto";
    const maxH = Math.round(parseFloat(getComputedStyle(el).lineHeight) * 2 + 6);
    el.style.height = Math.min(el.scrollHeight, maxH || 44) + "px";
  }

  // In modalità "fatto": mostra solo se c'è testo, oppure se stai editando
  if (argsMode === "fatto" && !hasText && !editing) return null;

  return (
    <div style={{ position:"relative" }}>
      <textarea
        ref={localRef}
        defaultValue={argsRef.current[teamId] || ""}
        onFocus={() => setEditing(true)}
        onChange={e => { argsRef.current[teamId] = e.target.value; autoResize(e.target); }}
        onBlur={e => { argsRef.current[teamId] = e.target.value; setEditing(false); setHasText(!!e.target.value.trim()); }}
        onClick={e => e.stopPropagation()}
        onDragStart={e => e.stopPropagation()}
        onKeyDown={e => e.stopPropagation()}
        placeholder="Motivazione…"
        rows={1}
        style={{ width:"100%", fontSize:9, padding:"3px 4px", borderRadius:"0 0 8px 8px",
          border:`1px solid ${tierColor}66`,
          background:`${tierColor}22`,
          color: tierColor,
          resize:"none", outline:"none", lineHeight:1.4, fontFamily:"'Inter','Segoe UI',sans-serif",
          textAlign:"center", overflowY:"hidden", display:"block",
          fontWeight:600, wordBreak:"break-word",
          borderTop:"none", marginTop:0 }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════

export default function App() {
  const [mode, setMode]   = useState("tier");
  const [dark, setDark]   = useState(true);
  const [showArgs, setShowArgs] = useState("off"); // "off" | "editing" | "fatto"
  const argsRef = useRef({}); // { teamId: "testo" } — ref, non state, per evitare re-render
  const boardRef = useRef(null);
  const tiersRef = useRef(null);

  const [pl, setPl]       = useState(() => { const s=loadLS(); return s?.pl || { tier:empty(TIER_TIERS), market:empty(MARKET_TIERS) }; });
  const [pools, setPools] = useState(() => { const s=loadLS(); return s?.pools || { tier:TEAMS.map(t=>t.id), market:TEAMS.map(t=>t.id) }; });
  const [selected, setSel]= useState(null);

  // Undo / Redo
  const undoStack = useRef([]);
  const redoStack = useRef([]);

  function pushHistory(curPl, curPools) {
    undoStack.current = [...undoStack.current.slice(-29), { pl: JSON.parse(JSON.stringify(curPl)), pools: JSON.parse(JSON.stringify(curPools)) }];
    redoStack.current = []; // nuova azione azzera redo
  }

  function undo() {
    if (!undoStack.current.length) return;
    const prev = undoStack.current[undoStack.current.length - 1];
    undoStack.current = undoStack.current.slice(0, -1);
    // salva stato corrente in redo prima di applicare
    setPl(cur => { redoStack.current = [...redoStack.current, { pl: JSON.parse(JSON.stringify(cur)), pools: JSON.parse(JSON.stringify(pools)) }]; return prev.pl; });
    setPools(prev.pools); setSel(null);
    showToast("↩ Annullato");
  }

  function redo() {
    if (!redoStack.current.length) return;
    const next = redoStack.current[redoStack.current.length - 1];
    redoStack.current = redoStack.current.slice(0, -1);
    setPl(cur => { undoStack.current = [...undoStack.current, { pl: JSON.parse(JSON.stringify(cur)), pools: JSON.parse(JSON.stringify(pools)) }]; return next.pl; });
    setPools(next.pools); setSel(null);
    showToast("↪ Ripristinato");
  }

  // Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y
  useEffect(() => {
    const handler = e => {
      if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z") { e.preventDefault(); redo(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") { e.preventDefault(); redo(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undo(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const dragRef = useRef({ id: null, fromTier: null, fromIdx: null });

  // Free state
  const [freeTiers, setFreeTiers]   = useState(initFreeTiers);
  const [freeItems, setFreeItems]   = useState({});
  const [freePool, setFreePool]     = useState([]);
  const [freeSel, setFreeSel]       = useState(null);
  const freeDragRef = useRef(null);
  const [editingTier, setEditingTier]   = useState(null);
  const [editTierLabel, setEditTierLabel] = useState("");
  const [editingColor, setEditingColor]   = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");

  const [quickText, setQuickText] = useState("");
  const [quickImg, setQuickImg]   = useState(null);
  const quickFileRef = useRef(null);

  // Animated entries
  const [newEntries, setNewEntries] = useState(new Set());
  function flashEntry(id) {
    setNewEntries(prev => new Set([...prev, id]));
    setTimeout(() => setNewEntries(prev => { const n = new Set(prev); n.delete(id); return n; }), 500);
  }

  const [toast, setToast] = useState(null);
  const showToast = useCallback((msg) => { setToast(msg); setTimeout(()=>setToast(null), 2200); }, []);

  const D = dark ? {
    bg:"#0d0d1a", headerBg:"#12122a", rowBg:"#111122",
    poolBg:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.08)",
    text:"#f0f0f8", subText:"rgba(255,255,255,0.3)", accent:"#f5c842",
    inputBg:"rgba(255,255,255,0.1)", inputBorder:"rgba(255,255,255,0.25)",
    photoBtnBg:"rgba(255,255,255,0.14)", photoBtnColor:"#e8e8e8",
    argBg:"rgba(255,255,255,0.07)", argBorder:"rgba(255,255,255,0.15)",
  } : {
    bg:"#f0f2f5", headerBg:"#ffffff", rowBg:"#f8f8fb",
    poolBg:"#ebebef", border:"rgba(0,0,0,0.1)",
    text:"#111", subText:"rgba(0,0,0,0.4)", accent:"#d4a200",
    inputBg:"rgba(0,0,0,0.06)", inputBorder:"rgba(0,0,0,0.2)",
    photoBtnBg:"rgba(0,0,0,0.1)", photoBtnColor:"#333",
    argBg:"rgba(0,0,0,0.05)", argBorder:"rgba(0,0,0,0.15)",
  };

  const TIERS      = mode==="tier" ? TIER_TIERS : MARKET_TIERS;
  const placements = pl[mode] || {};
  const pool       = pools[mode] || [];
  const getTeam    = id => TEAMS.find(t=>t.id===id);

  // ── Tier/Market ───────────────────────────────

  function moveTo(teamId, toTier) {
    pushHistory(pl, pools);
    setPl(prev => {
      const tiers = {};
      TIERS.forEach(t => { tiers[t.id] = [...(prev[mode][t.id]||[])].filter(id=>id!==teamId); });
      tiers[toTier] = [...tiers[toTier], teamId];
      const newPl = { ...prev, [mode]: tiers };
      saveLS({ pl:newPl, pools });
      return newPl;
    });
    setPools(prev => ({ ...prev, [mode]: prev[mode].filter(id=>id!==teamId) }));
    setSel(null);
    flashEntry(teamId);
  }

  function reorderInTier(tierId, fromIdx, toIdx) {
    if (fromIdx === toIdx) return;
    pushHistory(pl, pools);
    setPl(prev => {
      const arr = [...(prev[mode][tierId]||[])];
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      const newPl = { ...prev, [mode]: { ...prev[mode], [tierId]: arr } };
      saveLS({ pl:newPl, pools });
      return newPl;
    });
  }

  function toPool(teamId) {
    pushHistory(pl, pools);
    setPl(prev => {
      const tiers = {};
      TIERS.forEach(t => { tiers[t.id] = (prev[mode][t.id]||[]).filter(id=>id!==teamId); });
      const newPl = { ...prev, [mode]: tiers };
      saveLS({ pl:newPl, pools });
      return newPl;
    });
    // deduplicazione: aggiungi solo se non già presente
    setPools(prev => {
      if (prev[mode].includes(teamId)) return prev;
      return { ...prev, [mode]: [...prev[mode], teamId] };
    });
    setSel(null);
  }

  function clearTier(tierId) {
    pushHistory(pl, pools);
    const teamsInTier = placements[tierId] || [];
    setPl(prev => {
      const newPl = { ...prev, [mode]: { ...prev[mode], [tierId]: [] } };
      saveLS({ pl:newPl, pools });
      return newPl;
    });
    setPools(prev => ({ ...prev, [mode]: [...prev[mode], ...teamsInTier] }));
  }

  function randomize() {
    pushHistory(pl, pools);
    const ids = [...TEAMS.map(t=>t.id)].sort(()=>Math.random()-.5);
    const n = TIERS.length, sizes = Array(n).fill(Math.floor(ids.length/n));
    let rem = ids.length%n; for(let i=0;i<rem;i++) sizes[i]++;
    const tiers = {}; let i=0;
    TIERS.forEach((t,ti) => { tiers[t.id]=ids.slice(i,i+sizes[ti]); i+=sizes[ti]; });
    const newPl = {...pl, [mode]:tiers};
    const newPools = {...pools, [mode]:[]};
    setPl(newPl); setPools(newPools); setSel(null);
    saveLS({ pl:newPl, pools:newPools });
  }

  function resetTM() {
    pushHistory(pl, pools);
    const newPl = {...pl, [mode]:empty(TIERS)};
    const newPools = {...pools, [mode]:TEAMS.map(t=>t.id)};
    setPl(newPl); setPools(newPools); setSel(null);
    saveLS({ pl:newPl, pools:newPools });
  }

  function copyLink() {
    try {
      const s = btoa(encodeURIComponent(JSON.stringify({ pl, pools, mode })));
      navigator.clipboard.writeText(`${location.origin}${location.pathname}#${s}`).then(()=>showToast("🔗 Link copiato!"));
    } catch {}
  }

  // ── Free mode ─────────────────────────────────

  function freeDropToTier(item, tierId) {
    setFreeItems(prev => {
      const n = {};
      freeTiers.forEach(t => { n[t.id] = [...(prev[t.id]||[])].filter(x=>x.id!==item.id); });
      n[tierId] = [...(n[tierId]||[]), item];
      return n;
    });
    setFreePool(prev => prev.filter(x=>x.id!==item.id));
    setFreeSel(null);
    flashEntry(item.id);
  }

  function freeRemove(item, tierId) {
    setFreeItems(prev => { const n={...prev}; n[tierId]=(n[tierId]||[]).filter(x=>x.id!==item.id); return n; });
    setFreePool(prev => [...prev, item]);
    setFreeSel(null);
  }

  function quickAdd() {
    if (!quickText.trim() && !quickImg) return;
    setFreePool(prev => [...prev, { id:mkId(), text:quickText.trim(), img:quickImg }]);
    setQuickText(""); setQuickImg(null);
    if (quickFileRef.current) quickFileRef.current.value = "";
    showToast("Elemento aggiunto!");
  }

  function handleQuickImg(e) {
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => setQuickImg(ev.target.result);
    reader.readAsDataURL(file);
  }

  function importFromText() {
    if (!importText.trim()) return;
    const items = importText.split(/[,\n;]+/).map(s=>s.trim()).filter(Boolean)
      .map(text => ({ id:mkId(), text, img:null }));
    setFreePool(prev => [...prev, ...items]);
    setImportText(""); setShowImport(false);
    showToast(`${items.length} elementi importati!`);
  }

  function addFreeTier() {
    setFreeTiers(prev => [...prev, { id:mkId(), label:"Nuova", color:FREE_COLORS[prev.length % FREE_COLORS.length] }]);
  }

  function duplicateFreeTier(tier) {
    const newTier = { id:mkId(), label:tier.label+" 2", color:tier.color };
    setFreeTiers(prev => {
      const idx = prev.findIndex(t=>t.id===tier.id);
      const next = [...prev];
      next.splice(idx+1, 0, newTier);
      return next;
    });
  }

  function removeFreeTier(tierId) {
    setFreePool(prev => [...prev, ...(freeItems[tierId]||[])]);
    setFreeTiers(prev => prev.filter(t=>t.id!==tierId));
    setFreeItems(prev => { const n={...prev}; delete n[tierId]; return n; });
  }

  function saveTierLabel(tierId) {
    if (editTierLabel.trim()) setFreeTiers(prev => prev.map(t=>t.id===tierId?{...t,label:editTierLabel.trim()}:t));
    setEditingTier(null);
  }

  function resetFree() {
    const all = [...freePool];
    freeTiers.forEach(t => { all.push(...(freeItems[t.id]||[])); });
    setFreeItems({}); setFreePool(all); setFreeSel(null);
  }

  async function saveImage() {
    if (!tiersRef.current) return;
    const canvas = await html2canvas(tiersRef.current, { backgroundColor:dark?"#0d0d1a":"#f0f2f5", scale:2, useCORS:true, allowTaint:true });
    const ctx = canvas.getContext("2d");
    // Watermark basso-sinistra
    const wSize = Math.round(canvas.width * 0.022);
    ctx.font = `bold ${wSize}px Inter,sans-serif`;
    ctx.fillStyle = "#c9a84c";
    ctx.textAlign = "left";
    ctx.fillText("universosportivo.com", 16, canvas.height - 14);
    // Blob URL — non ha problemi di popup né di data URL troppo lungo
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = {tier:"TierList",market:"Mercato",free:"TierListLibera"}[mode]+"-SerieA.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      showToast("🖼️ PNG scaricato!");
    }, "image/png");
  }

  function shareX() {
    const ml = {tier:"Tier List",market:"Voti Mercato",free:"Tier List"}[mode];
    window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(`La mia ${ml} Serie A 2025/26! ⚽ #SerieA #TierList\nuniversosportivo.com`),"_blank");
  }

  const placed = mode==="free" ? Object.values(freeItems).flat().length : Object.values(placements).flat().length;
  const total  = mode==="free" ? (freePool.length+placed) : TEAMS.length;

  // Calcola badge globale: numero progressivo per squadra in fascia
  function getGlobalBadge(tierId, idx) {
    let count = 0;
    for (const tier of TIERS) {
      const items = placements[tier.id] || [];
      if (tier.id === tierId) return count + idx + 1;
      count += items.length;
    }
    return null;
  }

  // ── Tier row ──────────────────────────────────
  function TierRow({ tier }) {
    const tierTeams = placements[tier.id] || [];
    const [isOver, setIsOver] = useState(false);
    const [overIdx, setOverIdx] = useState(null);

    function getDropIdx(e, container) {
      const cards = container.querySelectorAll("[data-cardidx]");
      for (let i = 0; i < cards.length; i++) {
        const r = cards[i].getBoundingClientRect();
        if (e.clientX < r.left + r.width / 2) return i;
      }
      return cards.length;
    }

    function handleDragOver(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setIsOver(true);
      setOverIdx(getDropIdx(e, e.currentTarget));
    }

    function handleDrop(e) {
      e.preventDefault();
      const { id, fromTier, fromIdx } = dragRef.current;
      if (!id) return;
      const dropIdx = getDropIdx(e, e.currentTarget);
      if (fromTier === tier.id) {
        reorderInTier(tier.id, fromIdx, dropIdx > fromIdx ? dropIdx - 1 : dropIdx);
      } else {
        moveTo(id, tier.id);
      }
      dragRef.current = { id:null, fromTier:null, fromIdx:null };
      setIsOver(false); setOverIdx(null);
    }

    return (
      <div style={{ display:"flex", borderBottom:`1px solid ${D.border}`, minHeight:72 }}>
        {/* Label */}
        <div
          style={{ width:96, minWidth:96,
            background:dark?`linear-gradient(90deg,${tier.color}28,${tier.color}08)`:`linear-gradient(90deg,${tier.color}35,${tier.color}10)`,
            borderRight:`4px solid ${tier.color}`,
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
            padding:"4px 3px", cursor:selected?"pointer":"default",
          }}
          onClick={()=>{ if(selected) moveTo(selected, tier.id); }}
        >
          <div style={{ fontSize:9, fontWeight:900, color:tier.color, textAlign:"center", lineHeight:1.15, letterSpacing:0, textShadow:dark?`0 0 14px ${tier.color}55`:"none", wordBreak:"break-word", width:"100%" }}>{tier.label}</div>
          <div style={{ fontSize:7, color:D.subText, marginTop:2, textAlign:"center", lineHeight:1.2 }}>{tier.desc}</div>
          <div style={{ fontSize:7, color:D.subText, marginTop:1 }}>{tierTeams.length > 0 ? `${tierTeams.length}` : ""}</div>
          {selected && <div style={{ fontSize:8, color:tier.color, marginTop:3, opacity:.9 }}>↓ inserisci</div>}

        </div>

        {/* Drop area */}
        <div
          style={{ flex:1, display:"flex", flexWrap:"wrap", alignItems:"center", padding:"10px 8px", gap:8,
            background:isOver?(dark?`${tier.color}20`:`${tier.color}18`):D.rowBg, transition:"background .15s", gap:6, padding:"6px 6px" }}
          onDragOver={handleDragOver}
          onDragLeave={e=>{ if(!e.currentTarget.contains(e.relatedTarget)){setIsOver(false);setOverIdx(null);} }}
          onDrop={handleDrop}
          onClick={()=>{ if(selected) moveTo(selected, tier.id); }}
        >
          {tierTeams.map((tid, idx) => (
            <div key={tid} data-cardidx={idx} style={{ display:"flex", alignItems:"center" }}>
              {isOver && overIdx===idx && <div style={{ width:3, height:52, background:tier.color, borderRadius:2, marginRight:4 }} />}
              <Card teamId={tid} inTier tierId={tier.id} tierIdx={idx} tierColor={tier.color}
                getTeam={getTeam} selected={selected} setSel={setSel} dragRef={dragRef} newEntries={newEntries} showArgs={showArgs} argsRef={argsRef} D={D} getGlobalBadge={getGlobalBadge} toPool={toPool} dark={dark} />
            </div>
          ))}
          {isOver && overIdx===tierTeams.length && tierTeams.length>0 && (
            <div style={{ width:3, height:52, background:tier.color, borderRadius:2 }} />
          )}
        </div>
      </div>
    );
  }

  // ── Free row ──────────────────────────────────
  function FreeRow({ tier }) {
    const items = freeItems[tier.id] || [];
    const [isOver, setIsOver] = useState(false);

    return (
      <div style={{ display:"flex", borderBottom:`1px solid ${D.border}`, minHeight:90 }}>
        <div style={{ width:115, minWidth:115,
          background:dark?`linear-gradient(90deg,${tier.color}28,${tier.color}08)`:`linear-gradient(90deg,${tier.color}35,${tier.color}10)`,
          borderRight:`4px solid ${tier.color}`,
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"6px 4px", gap:3 }}>

          {editingTier===tier.id ? (
            <input autoFocus value={editTierLabel} onChange={e=>setEditTierLabel(e.target.value)}
              onBlur={()=>saveTierLabel(tier.id)}
              onKeyDown={e=>{if(e.key==="Enter")saveTierLabel(tier.id);if(e.key==="Escape")setEditingTier(null);}}
              style={{ width:80, background:"rgba(255,255,255,0.15)", border:`1px solid ${tier.color}`, borderRadius:4, color:tier.color, fontWeight:900, fontSize:12, textAlign:"center", padding:"2px 4px", outline:"none" }}
            />
          ) : (
            <div onDoubleClick={()=>{setEditingTier(tier.id);setEditTierLabel(tier.label);}} title="Doppio click per rinominare"
              style={{ fontSize:11, fontWeight:900, color:tier.color, textAlign:"center", lineHeight:1.2, cursor:"text", textShadow:dark?`0 0 14px ${tier.color}55`:"none" }}>
              {tier.label}
            </div>
          )}

          {/* Color picker */}
          <div style={{ position:"relative" }}>
            <div onClick={()=>setEditingColor(editingColor===tier.id?null:tier.id)} title="Cambia colore"
              style={{ width:14, height:14, borderRadius:"50%", background:tier.color, cursor:"pointer", border:"2px solid rgba(255,255,255,0.3)" }} />
            {editingColor===tier.id && (
              <div onClick={e=>e.stopPropagation()} style={{ position:"absolute", left:"110%", top:0, zIndex:200,
                background:dark?"#1a1a32":"#fff", border:`1px solid ${D.border}`, borderRadius:8, padding:6,
                display:"flex", flexWrap:"wrap", gap:4, width:96, boxShadow:"0 4px 20px rgba(0,0,0,0.4)" }}>
                {FREE_COLORS.map(c=>(
                  <div key={c} onClick={()=>{setFreeTiers(prev=>prev.map(t=>t.id===tier.id?{...t,color:c}:t));setEditingColor(null);}}
                    style={{ width:18, height:18, borderRadius:"50%", background:c, cursor:"pointer", border:tier.color===c?"2px solid white":"2px solid transparent" }} />
                ))}
              </div>
            )}
          </div>

          {freeSel && <div style={{ fontSize:8, color:tier.color }}>↓ inserisci</div>}

          <div style={{ display:"flex", gap:4, marginTop:2 }}>
            <button onClick={()=>duplicateFreeTier(tier)} title="Duplica fascia"
              style={{ background:"none", border:"none", color:"rgba(255,255,255,0.3)", fontSize:11, cursor:"pointer", padding:0 }}>⧉</button>
            <button onClick={()=>removeFreeTier(tier.id)} title="Rimuovi fascia"
              style={{ background:"none", border:"none", color:"#e84040aa", fontSize:11, cursor:"pointer", padding:0 }}>🗑️</button>
          </div>
        </div>

        <div style={{ flex:1, display:"flex", flexWrap:"wrap", alignItems:"center", padding:"10px 8px", gap:8,
          background:isOver?(dark?`${tier.color}20`:`${tier.color}18`):D.rowBg, transition:"background .15s" }}
          onDragOver={e=>{e.preventDefault();setIsOver(true);}}
          onDragLeave={e=>{if(!e.currentTarget.contains(e.relatedTarget))setIsOver(false);}}
          onDrop={e=>{
            e.preventDefault(); setIsOver(false);
            if(!freeDragRef.current) return;
            freeDropToTier(freeDragRef.current, tier.id); freeDragRef.current=null;
          }}
          onClick={()=>{
            if(!freeSel) return;
            const item=[...freePool,...Object.values(freeItems).flat()].find(x=>x.id===freeSel);
            if(item) freeDropToTier(item, tier.id);
          }}
        >
          {items.map(item=>(
            <div key={item.id} draggable
              onDragStart={e=>{e.stopPropagation();freeDragRef.current=item;e.dataTransfer.setData("text/plain",item.id);}}
              onDragEnd={()=>{freeDragRef.current=null;}}>
              <FreeCard item={item} accent={tier.color} isSel={freeSel===item.id}
                onClick={()=>setFreeSel(s=>s===item.id?null:item.id)}
                onRemove={()=>freeRemove(item, tier.id)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════

  return (
    <div style={{ minHeight:"100vh", background:D.bg, color:D.text, fontFamily:"'Inter','Segoe UI',sans-serif", paddingBottom:60, transition:"background .3s" }}>

      <style>{`
        *,*::before,*::after{box-sizing:border-box}
        ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-thumb{background:#333;border-radius:3px}
        button:focus{outline:none}
        @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
      `}</style>

      {toast && (
        <div style={{ position:"fixed", top:16, left:"50%", transform:"translateX(-50%)", zIndex:9999,
          background:"#1e1e3a", border:"1px solid rgba(255,255,255,0.15)", color:"#fff",
          padding:"9px 20px", borderRadius:10, fontSize:13, fontWeight:700,
          boxShadow:"0 4px 24px rgba(0,0,0,0.5)", animation:"toastIn .2s ease", whiteSpace:"nowrap" }}>
          {toast}
        </div>
      )}

      {/* HEADER */}
      <div style={{ background:D.headerBg, borderBottom:`1px solid ${D.border}`, padding:"16px 16px 14px", textAlign:"center",
        boxShadow:dark?"0 4px 30px rgba(0,0,0,0.5)":"0 2px 12px rgba(0,0,0,0.07)" }}>
        <div style={{ fontSize:9, letterSpacing:6, color:D.accent, textTransform:"uppercase", marginBottom:4, opacity:.8 }}>Universosportivo.com</div>
        <h1 style={{ margin:0, fontSize:"clamp(18px,3.5vw,30px)", fontWeight:900, letterSpacing:-1, color:D.text }}>
          {mode==="tier"?"Tier List":mode==="market"?"Voti Mercato":"Tier List Libera"}
          {mode!=="free"&&<>{" "}<span style={{ color:D.accent }}>Serie A</span></>}
        </h1>
        <div style={{ fontSize:11, color:D.subText, marginTop:3 }}>
          {placed} / {total} elementi posizionati
          {mode!=="free"&&<span style={{ marginLeft:8, fontSize:10 }}>· 💾 auto-salvato</span>}
        </div>

        {/* Mode tabs */}
        <div style={{ display:"inline-flex", marginTop:12, background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)", borderRadius:8, padding:3 }}>
          {[["tier","⚽ Tier List"],["market","💰 Voti Mercato"],["free","✏️ Libera"]].map(([m,lbl])=>(
            <button key={m} onClick={()=>{setMode(m);setSel(null);setFreeSel(null);setEditingColor(null);}}
              style={{ padding:"6px 14px", borderRadius:6, border:"none", fontWeight:700, fontSize:12, cursor:"pointer", transition:"all .2s",
                background:mode===m?D.accent:"transparent", color:mode===m?"#0d0d1a":D.subText }}>
              {lbl}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:10, flexWrap:"wrap", alignItems:"center" }}>
          <button onClick={()=>setDark(d=>!d)}
            style={{ padding:"6px 12px", borderRadius:8, border:`1px solid ${D.border}`, background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)", color:D.text, fontSize:14, cursor:"pointer" }}>
            {dark?"☀️":"🌙"}
          </button>

          {/* Motivazioni — solo tier e market */}
          {mode!=="free" && showArgs === "off" && (
            <Btn color="#c084fc" onClick={()=>setShowArgs("editing")}>✏️ Motivazioni</Btn>
          )}
          {mode!=="free" && showArgs === "editing" && (
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={()=>setShowArgs("fatto")}
                style={{ padding:"7px 13px", borderRadius:8, border:"none", background:"#3dbb6e", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer" }}>
                ✔ Fatto
              </button>
              <button onClick={()=>{ argsRef.current = {}; setShowArgs("off"); }}
                style={{ padding:"7px 13px", borderRadius:8, border:"none", background:"#e84040", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer" }}>
                ✕ Cancella
              </button>
            </div>
          )}
          {mode!=="free" && showArgs === "fatto" && (
            <div style={{ display:"flex", gap:6 }}>
              <Btn color="#c084fc" onClick={()=>setShowArgs("editing")}>✏️ Modifica</Btn>
              <button onClick={()=>{ argsRef.current = {}; setShowArgs("off"); }}
                style={{ padding:"7px 13px", borderRadius:8, border:"none", background:"#e84040", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer" }}>
                ✕ Cancella
              </button>
            </div>
          )}

          {mode!=="free"&&<Btn color="#f5c842" onClick={randomize}>🎲 Riempi</Btn>}
          {mode!=="free"&&<Btn color="#888" textColor={dark?"#ccc":"#444"} onClick={undo} title="Annulla (Ctrl+Z)">↩</Btn>}
          {mode!=="free"&&<Btn color="#888" textColor={dark?"#ccc":"#444"} onClick={redo} title="Ripristina (Ctrl+Shift+Z)">↪</Btn>}
          {mode==="free"&&<Btn color="#3dbb6e" onClick={addFreeTier}>+ Fascia</Btn>}
          {mode==="free"&&<Btn color="#a78bfa" onClick={()=>setShowImport(true)}>⬆ Importa lista</Btn>}
          <Btn color={dark?"#bbb":"#555"} textColor={dark?"#ccc":"#444"} onClick={mode==="free"?resetFree:resetTM}>↺ Svuota</Btn>
          {mode!=="free"&&<Btn color="#a78bfa" onClick={copyLink}>🔗 Link</Btn>}
          <Btn color="#3dbb6e" onClick={saveImage}>⬇ PNG</Btn>
          <Btn color="#5ba3f5" onClick={shareX}>𝕏</Btn>
        </div>
      </div>

      <div style={{ textAlign:"center", padding:"7px 12px 0", fontSize:10, color:D.subText, minHeight:20 }}>
        {mode==="free"
          ?(freeSel?"Elemento selezionato — tocca la fascia o trascinalo":"Doppio click sul nome fascia per rinominarlo · 🎨 colore · ⧉ duplica")
          :(selected?`${getTeam(selected)?.name} selezionato — tocca la fascia per inserirlo`:"Trascina nella fascia o tocca logo → fascia · Trascina per riordinare · × per rimuovere")}
      </div>

      {/* BOARD */}
      <div ref={boardRef} style={{ maxWidth:880, margin:"10px auto 0", padding:"0 8px 16px" }}>
        <div style={{ textAlign:"center", fontSize:11, color:D.accent, fontWeight:700, letterSpacing:3, marginBottom:6, opacity:.9, textTransform:"uppercase" }}>universosportivo.com</div>
        <div ref={tiersRef} style={{ borderRadius:14, overflow:"hidden", border:`1px solid ${D.border}`, boxShadow:dark?"0 8px 40px rgba(0,0,0,0.4)":"0 4px 20px rgba(0,0,0,0.08)" }}>
          {mode==="free"
            ? freeTiers.map(tier=><FreeRow key={tier.id} tier={tier} />)
            : TIERS.map(tier=><TierRow key={tier.id} tier={tier} />)
          }
        </div>

        {/* POOL — scroll orizzontale su mobile */}
        <div style={{ marginTop:12, background:D.poolBg, borderRadius:14, border:`1px solid ${D.border}`, padding:"12px 14px" }}
          onDragOver={e=>e.preventDefault()}
          onDrop={e=>{
            e.preventDefault();
            if(mode==="free"){
              if(!freeDragRef.current) return;
              const item=freeDragRef.current;
              setFreeItems(prev=>{const n={};freeTiers.forEach(t=>{n[t.id]=(prev[t.id]||[]).filter(x=>x.id!==item.id)});return n});
              setFreePool(prev=>[...prev.filter(x=>x.id!==item.id),item]);
              freeDragRef.current=null;
            } else {
              const { id } = dragRef.current;
              if(id && !pool.includes(id)){ toPool(id); dragRef.current={id:null,fromTier:null,fromIdx:null}; }
            }
          }}>

          <div style={{ fontSize:9, letterSpacing:4, color:D.subText, textTransform:"uppercase", marginBottom:12 }}>
            Da posizionare ({mode==="free"?freePool.length:pool.length})
          </div>

          {/* Quick add — solo free */}
          {mode==="free" && (
            <div style={{ display:"flex", gap:8, marginBottom:14, alignItems:"center", flexWrap:"wrap" }}>
              <input value={quickText} onChange={e=>setQuickText(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter")quickAdd();}}
                placeholder="Nome elemento…"
                style={{ flex:1, minWidth:130, padding:"7px 10px", borderRadius:8, border:`1px solid ${D.inputBorder}`, background:D.inputBg, color:D.text, fontSize:12, outline:"none" }}
              />
              <label style={{ padding:"7px 14px", borderRadius:8, border:`1px solid ${D.inputBorder}`,
                background:D.photoBtnBg, color:D.photoBtnColor, fontSize:12, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", userSelect:"none" }}>
                {quickImg?"📷 ✓":"📷 Foto"}
                <input ref={quickFileRef} type="file" accept="image/*" onChange={handleQuickImg} style={{ display:"none" }} />
              </label>
              {quickImg && <button onClick={()=>{setQuickImg(null);if(quickFileRef.current)quickFileRef.current.value="";}} style={{ background:"none",border:"none",color:"#e84040",cursor:"pointer",fontSize:14,padding:0 }}>✕</button>}
              <button onClick={quickAdd} disabled={!quickText.trim()&&!quickImg}
                style={{ padding:"7px 14px", borderRadius:8, border:"none", background:D.accent, color:"#0d0d1a", fontWeight:700, fontSize:12, cursor:(!quickText.trim()&&!quickImg)?"not-allowed":"pointer", opacity:(!quickText.trim()&&!quickImg)?0.5:1 }}>
                + Aggiungi
              </button>
            </div>
          )}

          {/* Cards — scroll orizzontale su mobile */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, minHeight:44,
            overflowX:"auto", WebkitOverflowScrolling:"touch",
            /* su mobile (max 600px) non wrappa e scorre */
          }}>
            {mode==="free" ? (
              freePool.length===0
                ? <div style={{ color:D.subText, fontSize:12, alignSelf:"center" }}>Tutti gli elementi posizionati ✔</div>
                : freePool.map(item=>(
                    <div key={item.id} draggable
                      onDragStart={e=>{e.stopPropagation();freeDragRef.current=item;e.dataTransfer.setData("text/plain",item.id);}}
                      onDragEnd={()=>{freeDragRef.current=null;}}>
                      <FreeCard item={item} accent={D.accent} isSel={freeSel===item.id}
                        onClick={()=>setFreeSel(s=>s===item.id?null:item.id)}
                        onRemove={()=>{setFreePool(prev=>prev.filter(x=>x.id!==item.id));if(freeSel===item.id)setFreeSel(null);}}
                      />
                    </div>
                  ))
            ) : (
              pool.length===0
                ? <div style={{ color:D.subText, fontSize:12, alignSelf:"center" }}>Tutte le squadre posizionate ✔</div>
                : pool.map(tid=><Card key={tid} teamId={tid} inTier={false} tierColor={D.accent}
                getTeam={getTeam} selected={selected} setSel={setSel} dragRef={dragRef} newEntries={newEntries} showArgs={showArgs} argsRef={argsRef} D={D} getGlobalBadge={getGlobalBadge} toPool={toPool} dark={dark} />)
            )}
          </div>
        </div>

        <div style={{ textAlign:"center", marginTop:10, fontSize:10, color:D.subText }}>
          Creato con ❤️ da <span style={{ color:D.accent }}>universosportivo.com</span> — nessun dato lascia il browser.
        </div>
      </div>

      {/* MODAL importa lista */}
      {showImport && (
        <div onClick={()=>setShowImport(false)} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(4px)" }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:dark?"#161628":"#fff",border:`1px solid ${D.border}`,borderRadius:16,padding:24,maxWidth:380,width:"92%",boxShadow:"0 20px 60px rgba(0,0,0,0.6)" }}>
            <div style={{ fontWeight:800,fontSize:16,color:D.text,marginBottom:8 }}>Importa lista elementi</div>
            <div style={{ fontSize:11,color:D.subText,marginBottom:12 }}>Incolla i nomi separati da virgola, punto e virgola o a capo</div>
            <textarea value={importText} onChange={e=>setImportText(e.target.value)}
              placeholder={"Messi, Ronaldo, Mbappé\nKantè\nHaaland"}
              rows={5}
              style={{ width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${D.inputBorder}`,background:D.inputBg,color:D.text,fontSize:13,outline:"none",resize:"vertical",fontFamily:"inherit" }}
            />
            <div style={{ display:"flex",gap:10,marginTop:14 }}>
              <button onClick={importFromText} disabled={!importText.trim()}
                style={{ flex:1,padding:"10px",borderRadius:8,border:"none",background:D.accent,color:"#0d0d1a",fontWeight:700,fontSize:13,cursor:importText.trim()?"pointer":"not-allowed",opacity:importText.trim()?1:0.5 }}>
                Importa
              </button>
              <button onClick={()=>{setShowImport(false);setImportText("");}}
                style={{ padding:"10px 16px",borderRadius:8,border:`1px solid ${D.border}`,background:"transparent",color:D.subText,fontWeight:600,fontSize:13,cursor:"pointer" }}>
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

