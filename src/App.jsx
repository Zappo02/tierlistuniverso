import { useState, useRef, useCallback } from "react";
import html2canvas from "html2canvas";

// ═══════════════════════════════════════════════════
// DATI FISSI
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

const FREE_TIER_COLORS = ["#f5c842","#5ba3f5","#3dbb6e","#f0922b","#e84040","#a78bfa","#e8c030","#ff6eb4"];

function mkId() { return Math.random().toString(36).slice(2,9); }
function empty(tiers) { const o={}; tiers.forEach(t=>{o[t.id]=[];}); return o; }

function initFreeTiers() {
  return [
    { id:mkId(), label:"S", color:"#f5c842" },
    { id:mkId(), label:"A", color:"#5ba3f5" },
    { id:mkId(), label:"B", color:"#3dbb6e" },
    { id:mkId(), label:"C", color:"#f0922b" },
    { id:mkId(), label:"D", color:"#e84040" },
  ];
}

// ═══════════════════════════════════════════════════
// LOGO per modalità Serie A
// ═══════════════════════════════════════════════════

function TeamLogo({ team, size }) {
  const [err, setErr] = useState(false);
  if (!team.logo || err)
    return <div style={{ width:size, height:size, borderRadius:"50%", background:team.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*.2, fontWeight:900, color:"#fff" }}>{team.short}</div>;
  return <img src={team.logo} alt={team.name} draggable={false} style={{ width:size, height:size, objectFit:"contain", display:"block" }} onError={()=>setErr(true)} />;
}

// ═══════════════════════════════════════════════════
// FREE ITEM CARD
// ═══════════════════════════════════════════════════

function FreeCard({ item, onRemove, isSel, onClick, accent }) {
  const SIZE = 68;
  return (
    <div
      title={item.text}
      onClick={e => { e.stopPropagation(); onClick(); }}
      style={{
        width:SIZE, height:SIZE, flexShrink:0, borderRadius:10,
        border: isSel ? `3px solid ${accent}` : "2px solid rgba(255,255,255,0.12)",
        boxShadow: isSel ? `0 0 16px ${accent}88` : "0 2px 6px rgba(0,0,0,0.3)",
        overflow:"hidden", position:"relative", cursor:"pointer",
        background: item.img ? "transparent" : "rgba(255,255,255,0.07)",
        display:"flex", alignItems:"center", justifyContent:"center",
        userSelect:"none", transition:"border .15s, box-shadow .15s",
      }}
    >
      {item.img
        ? <img src={item.img} alt={item.text} draggable={false} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
        : <div style={{ fontSize:10, fontWeight:700, color:"#fff", textAlign:"center", padding:"4px 4px", lineHeight:1.3, wordBreak:"break-word" }}>{item.text}</div>
      }
      {item.img && item.text && (
        <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(0,0,0,0.55)", fontSize:8, color:"#fff", textAlign:"center", padding:"2px 2px", lineHeight:1.2 }}>{item.text}</div>
      )}
      {onRemove && (
        <button onClick={e=>{e.stopPropagation();onRemove();}} style={{ position:"absolute",top:2,right:2,width:15,height:15,borderRadius:"50%",background:"#e84040cc",border:"none",color:"#fff",fontSize:9,fontWeight:900,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0 }}>×</button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════

export default function App() {
  const [mode, setMode]   = useState("tier"); // "tier" | "market" | "free"
  const [dark, setDark]   = useState(true);
  const boardRef          = useRef(null);

  // ── Stato Tier / Market ────────────────────────
  const [pl, setPl]       = useState({ tier: empty(TIER_TIERS), market: empty(MARKET_TIERS) });
  const [pools, setPools] = useState({ tier: TEAMS.map(t=>t.id), market: TEAMS.map(t=>t.id) });
  const [selected, setSel]= useState(null);
  const [dragId, setDragId]     = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  // ── Stato Free ────────────────────────────────
  const [freeTiers, setFreeTiers]   = useState(initFreeTiers);
  const [freeItems, setFreeItems]   = useState({}); // tierId -> [item]
  const [freePool, setFreePool]     = useState([]); // [{id,text,img}]
  const [freeSel, setFreeSel]       = useState(null); // item id
  const [editingTier, setEditingTier] = useState(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newText, setNewText]       = useState("");
  const [newImg, setNewImg]         = useState(null);
  const [editTierLabel, setEditTierLabel] = useState("");

  // Tema
  const D = dark ? {
    bg:"#0d0d1a", headerBg:"#12122a", rowBg:"#111122",
    poolBg:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.08)",
    text:"#f0f0f8", subText:"rgba(255,255,255,0.3)",
    accent:"#f5c842",
  } : {
    bg:"#f0f2f5", headerBg:"#ffffff", rowBg:"#f8f8fb",
    poolBg:"#ebebef", border:"rgba(0,0,0,0.1)",
    text:"#111", subText:"rgba(0,0,0,0.4)",
    accent:"#d4a200",
  };

  const TIERS = mode==="tier" ? TIER_TIERS : MARKET_TIERS;
  const placements = pl[mode] || {};
  const pool = pools[mode] || [];
  const getTeam = id => TEAMS.find(t=>t.id===id);

  // ── Funzioni Tier/Market ───────────────────────
  function moveTo(teamId, toTier) {
    setPl(prev => {
      const m={...prev}, tiers={};
      TIERS.forEach(t=>{ tiers[t.id]=[...(m[mode][t.id]||[])].filter(id=>id!==teamId); });
      tiers[toTier]=[...tiers[toTier],teamId];
      m[mode]=tiers; return m;
    });
    setPools(prev=>({...prev,[mode]:prev[mode].filter(id=>id!==teamId)}));
    setSel(null);
  }

  function toPool(teamId) {
    setPl(prev=>{
      const m={...prev},tiers={};
      TIERS.forEach(t=>{tiers[t.id]=(m[mode][t.id]||[]).filter(id=>id!==teamId);});
      m[mode]=tiers; return m;
    });
    setPools(prev=>({...prev,[mode]:[...prev[mode],teamId]}));
    setSel(null);
  }

  function randomize() {
    const ids=[...TEAMS.map(t=>t.id)].sort(()=>Math.random()-.5);
    const n=TIERS.length, sizes=Array(n).fill(Math.floor(ids.length/n));
    let rem=ids.length%n; for(let i=0;i<rem;i++) sizes[i]++;
    const tiers={}; let i=0;
    TIERS.forEach((t,ti)=>{tiers[t.id]=ids.slice(i,i+sizes[ti]);i+=sizes[ti];});
    setPl(prev=>({...prev,[mode]:tiers}));
    setPools(prev=>({...prev,[mode]:[]}));
    setSel(null);
  }

  function resetTierMarket() {
    setPl(prev=>({...prev,[mode]:empty(TIERS)}));
    setPools(prev=>({...prev,[mode]:TEAMS.map(t=>t.id)}));
    setSel(null);
  }

  // ── Funzioni Free ──────────────────────────────
  function freeMoveTo(itemId, toTier) {
    setFreeItems(prev=>{
      const next={};
      freeTiers.forEach(t=>{next[t.id]=[...(prev[t.id]||[])].filter(x=>x.id!==itemId);});
      next[toTier]=[...(next[toTier]||[]),freePool.find(x=>x.id===itemId)||freeItems[Object.keys(freeItems).find(k=>(freeItems[k]||[]).some(x=>x.id===itemId))]?.find(x=>x.id===itemId)];
      // clean nulls
      Object.keys(next).forEach(k=>{next[k]=next[k].filter(Boolean);});
      return next;
    });
    setFreePool(prev=>prev.filter(x=>x.id!==itemId));
    setFreeSel(null);
  }

  function freeToPool(item, fromTier) {
    setFreeItems(prev=>{
      const next={...prev};
      next[fromTier]=(next[fromTier]||[]).filter(x=>x.id!==item.id);
      return next;
    });
    setFreePool(prev=>[...prev,item]);
    setFreeSel(null);
  }

  function addFreeItem() {
    if (!newText.trim() && !newImg) return;
    const item = { id:mkId(), text:newText.trim(), img:newImg };
    setFreePool(prev=>[...prev,item]);
    setNewText(""); setNewImg(null); setShowAddItem(false);
  }

  function addFreeTier() {
    const idx = freeTiers.length % FREE_TIER_COLORS.length;
    setFreeTiers(prev=>[...prev,{ id:mkId(), label:"Nuova", color:FREE_TIER_COLORS[idx] }]);
  }

  function removeFreeTier(tierId) {
    const items = freeItems[tierId]||[];
    setFreePool(prev=>[...prev,...items]);
    setFreeTiers(prev=>prev.filter(t=>t.id!==tierId));
    setFreeItems(prev=>{const n={...prev};delete n[tierId];return n;});
  }

  function saveTierLabel(tierId) {
    if (!editTierLabel.trim()) { setEditingTier(null); return; }
    setFreeTiers(prev=>prev.map(t=>t.id===tierId?{...t,label:editTierLabel.trim()}:t));
    setEditingTier(null);
  }

  function resetFree() {
    const all=[];
    freeTiers.forEach(t=>{all.push(...(freeItems[t.id]||[]));});
    all.push(...freePool);
    setFreeItems({});
    setFreePool(all);
    setFreeSel(null);
  }

  function handleImgUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setNewImg(ev.target.result);
    reader.readAsDataURL(file);
  }

  async function saveImage() {
    if (!boardRef.current) return;
    const canvas = await html2canvas(boardRef.current, { backgroundColor:dark?"#0d0d1a":"#f0f2f5", scale:2, useCORS:true, allowTaint:true });
    const a=document.createElement("a");
    const names={"tier":"TierList","market":"Mercato","free":"TierListLibera"};
    a.download=names[mode]+"-SerieA.png"; a.href=canvas.toDataURL("image/png"); a.click();
  }

  function shareX() {
    const ml={"tier":"Tier List","market":"Voti Mercato","free":"Tier List Libera"}[mode];
    const txt=encodeURIComponent(`La mia ${ml} Serie A 2025/26! ⚽ #SerieA #TierList @universo_calcio`);
    window.open("https://twitter.com/intent/tweet?text="+txt,"_blank");
  }

  const placed = mode==="free"
    ? Object.values(freeItems).flat().length
    : Object.values(placements).flat().length;
  const total = mode==="free" ? (freePool.length+placed) : TEAMS.length;

  // ── Tier/Market card ──────────────────────────
  function Card({ teamId, inTier }) {
    const t=getTeam(teamId); if(!t) return null;
    const isSel=selected===teamId;
    return (
      <div title={t.name} draggable
        onDragStart={e=>{e.stopPropagation();setDragId(teamId);}}
        onDragEnd={()=>{setDragId(null);setDropTarget(null);}}
        onClick={e=>{e.stopPropagation();if(isSel){setSel(null);}else{setSel(teamId);}}}
        style={{ width:60,height:60,flexShrink:0,borderRadius:10,overflow:"hidden",position:"relative",cursor:"grab",userSelect:"none",
          border:isSel?`3px solid ${D.accent}`:`2px solid rgba(255,255,255,0.1)`,
          boxShadow:isSel?`0 0 16px ${D.accent}88`:"0 2px 6px rgba(0,0,0,0.25)",
          transition:"border .15s,box-shadow .15s",
          display:"flex",alignItems:"center",justifyContent:"center",
        }}>
        <TeamLogo team={t} size={60} />
        {inTier&&<button onClick={e=>{e.stopPropagation();toPool(teamId);}} style={{ position:"absolute",top:2,right:2,width:15,height:15,borderRadius:"50%",background:"#e84040cc",border:"none",color:"#fff",fontSize:9,fontWeight:900,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0 }}>×</button>}
      </div>
    );
  }

  // ── Tier/Market row ───────────────────────────
  function TierRow({ tier }) {
    const tierTeams=placements[tier.id]||[];
    const isOver=dropTarget===tier.id;
    return (
      <div style={{ display:"flex",borderBottom:`1px solid ${D.border}`,minHeight:84 }}>
        <div
          style={{ width:110,minWidth:110,background:dark?`linear-gradient(90deg,${tier.color}22,${tier.color}06)`:`linear-gradient(90deg,${tier.color}30,${tier.color}10)`,borderRight:`4px solid ${tier.color}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"6px 4px",cursor:selected?"pointer":"default" }}
          onClick={()=>{ if(!selected) return; moveTo(selected,tier.id); }}
        >
          <div style={{ fontSize:tier.label.length>5?10:tier.label.length>3?12:20,fontWeight:900,color:tier.color,textAlign:"center",lineHeight:1.1,textShadow:dark?`0 0 16px ${tier.color}55`:"none" }}>{tier.label}</div>
          <div style={{ fontSize:8,color:D.subText,marginTop:2,textAlign:"center" }}>{tier.desc}</div>
          {selected&&<div style={{ fontSize:8,color:tier.color,marginTop:3 }}>← inserisci</div>}
        </div>
        <div style={{ flex:1,display:"flex",flexWrap:"wrap",alignItems:"center",padding:"10px 8px",gap:8,background:isOver?(dark?`${tier.color}18`:`${tier.color}15`):D.rowBg,transition:"background .15s" }}
          onDragOver={e=>{e.preventDefault();setDropTarget(tier.id);}}
          onDragLeave={e=>{if(!e.currentTarget.contains(e.relatedTarget))setDropTarget(null);}}
          onDrop={e=>{e.preventDefault();if(dragId){moveTo(dragId,tier.id);setDragId(null);}setDropTarget(null);}}
          onClick={()=>{ if(!selected) return; moveTo(selected,tier.id); }}
        >
          {tierTeams.map(tid=><Card key={tid} teamId={tid} inTier />)}
        </div>
      </div>
    );
  }

  // ── Free row ──────────────────────────────────
  function FreeRow({ tier }) {
    const items=freeItems[tier.id]||[];
    const [isOver,setIsOver]=useState(false);
    return (
      <div style={{ display:"flex",borderBottom:`1px solid ${D.border}`,minHeight:90 }}>
        {/* Label editabile */}
        <div style={{ width:110,minWidth:110,background:dark?`linear-gradient(90deg,${tier.color}22,${tier.color}06)`:`linear-gradient(90deg,${tier.color}30,${tier.color}10)`,borderRight:`4px solid ${tier.color}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"6px 4px",gap:4 }}>
          {editingTier===tier.id ? (
            <input
              autoFocus
              value={editTierLabel}
              onChange={e=>setEditTierLabel(e.target.value)}
              onBlur={()=>saveTierLabel(tier.id)}
              onKeyDown={e=>{ if(e.key==="Enter") saveTierLabel(tier.id); if(e.key==="Escape") setEditingTier(null); }}
              style={{ width:80,background:"rgba(255,255,255,0.15)",border:`1px solid ${tier.color}`,borderRadius:4,color:tier.color,fontWeight:900,fontSize:13,textAlign:"center",padding:"2px 4px",outline:"none" }}
            />
          ) : (
            <div
              title="Doppio click per rinominare"
              onDoubleClick={()=>{ setEditingTier(tier.id); setEditTierLabel(tier.label); }}
              style={{ fontSize:tier.label.length>6?10:tier.label.length>3?13:20,fontWeight:900,color:tier.color,textAlign:"center",lineHeight:1.1,cursor:"text",textShadow:dark?`0 0 16px ${tier.color}55`:"none" }}
            >{tier.label}</div>
          )}
          <div style={{ fontSize:8,color:D.subText,textAlign:"center" }}>✏️ doppio click</div>
          {freeSel&&<div style={{ fontSize:8,color:tier.color,marginTop:2 }}>← inserisci</div>}
          <button onClick={()=>removeFreeTier(tier.id)} title="Rimuovi fascia" style={{ background:"none",border:"none",color:"#e84040aa",fontSize:11,cursor:"pointer",padding:0,marginTop:2 }}>🗑️</button>
        </div>
        {/* Drop area */}
        <div style={{ flex:1,display:"flex",flexWrap:"wrap",alignItems:"center",padding:"10px 8px",gap:8,background:isOver?(dark?`${tier.color}18`:`${tier.color}15`):D.rowBg,transition:"background .15s" }}
          onDragOver={e=>{e.preventDefault();setIsOver(true);}}
          onDragLeave={e=>{if(!e.currentTarget.contains(e.relatedTarget))setIsOver(false);}}
          onDrop={e=>{
            e.preventDefault(); setIsOver(false);
            const raw=e.dataTransfer.getData("freeItem");
            if(!raw) return;
            const item=JSON.parse(raw);
            // rimuovi da dove era
            setFreeItems(prev=>{
              const n={};
              freeTiers.forEach(t=>{n[t.id]=(prev[t.id]||[]).filter(x=>x.id!==item.id);});
              n[tier.id]=[...(n[tier.id]||[]),item];
              return n;
            });
            setFreePool(prev=>prev.filter(x=>x.id!==item.id));
            setFreeSel(null);
          }}
          onClick={()=>{ if(!freeSel) return;
            const item=[...freePool,...Object.values(freeItems).flat()].find(x=>x.id===freeSel);
            if(!item) return;
            setFreeItems(prev=>{
              const n={};
              freeTiers.forEach(t=>{n[t.id]=(prev[t.id]||[]).filter(x=>x.id!==item.id);});
              n[tier.id]=[...(n[tier.id]||[]),item];
              return n;
            });
            setFreePool(prev=>prev.filter(x=>x.id!==item.id));
            setFreeSel(null);
          }}
        >
          {items.map(item=>(
            <div key={item.id} draggable
              onDragStart={e=>{e.stopPropagation();e.dataTransfer.setData("freeItem",JSON.stringify(item));}}
            >
              <FreeCard item={item} accent={tier.color}
                isSel={freeSel===item.id}
                onClick={()=>setFreeSel(s=>s===item.id?null:item.id)}
                onRemove={()=>freeToPool(item,tier.id)}
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
    <div style={{ minHeight:"100vh",background:D.bg,color:D.text,fontFamily:"'Inter','Segoe UI',sans-serif",paddingBottom:60,transition:"background .3s" }}>

      {/* HEADER */}
      <div style={{ background:D.headerBg,borderBottom:`1px solid ${D.border}`,padding:"16px 16px 14px",textAlign:"center",boxShadow:dark?"0 4px 30px rgba(0,0,0,0.5)":"0 2px 12px rgba(0,0,0,0.07)" }}>
        <div style={{ fontSize:9,letterSpacing:6,color:D.accent,textTransform:"uppercase",marginBottom:4,opacity:.8 }}>Universosportivo.com</div>
        <h1 style={{ margin:0,fontSize:"clamp(18px,3.5vw,30px)",fontWeight:900,letterSpacing:-1,color:D.text }}>
          {mode==="tier"?"Tier List":mode==="market"?"Voti Mercato":"Tier List Libera"}
          {mode!=="free"&&<>{" "}<span style={{ color:D.accent }}>Serie A</span>{" "}<span style={{ color:D.subText,fontSize:"0.6em",fontWeight:600 }}>2025/26</span></>}
        </h1>
        <div style={{ fontSize:11,color:D.subText,marginTop:3 }}>{placed} / {total} elementi posizionati</div>

        {/* Mode tabs */}
        <div style={{ display:"inline-flex",marginTop:12,background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",borderRadius:8,padding:3 }}>
          {[["tier","⚽ Tier List"],["market","💰 Voti Mercato"],["free","✏️ Libera"]].map(([m,lbl])=>(
            <button key={m} onClick={()=>{setMode(m);setSel(null);setFreeSel(null);}}
              style={{ padding:"6px 14px",borderRadius:6,border:"none",fontWeight:700,fontSize:12,cursor:"pointer",transition:"all .2s",background:mode===m?D.accent:"transparent",color:mode===m?"#0d0d1a":D.subText }}>
              {lbl}
            </button>
          ))}
        </div>

        {/* Dark toggle + actions */}
        <div style={{ display:"flex",gap:8,justifyContent:"center",marginTop:10,flexWrap:"wrap",alignItems:"center" }}>
          <button onClick={()=>setDark(d=>!d)} style={{ padding:"6px 12px",borderRadius:8,border:`1px solid ${D.border}`,background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",color:D.text,fontSize:14,cursor:"pointer" }}>{dark?"☀️":"🌙"}</button>
          {mode!=="free" && <Btn color="#f5c842" onClick={randomize}>🎲 Riempi a caso</Btn>}
          {mode==="free" && <Btn color="#5ba3f5" onClick={()=>setShowAddItem(true)}>+ Aggiungi elemento</Btn>}
          {mode==="free" && <Btn color="#3dbb6e" onClick={addFreeTier}>+ Aggiungi fascia</Btn>}
          <Btn color={dark?"#bbb":"#555"} textColor={dark?"#bbb":"#444"} onClick={mode==="free"?resetFree:resetTierMarket}>↺ Svuota tutto</Btn>
          <Btn color="#3dbb6e" onClick={saveImage}>⬇ Salva PNG</Btn>
          <Btn color="#5ba3f5" onClick={shareX}>𝕏 Condividi</Btn>
        </div>
      </div>

      {/* Hint */}
      {mode!=="free" && (
        <div style={{ textAlign:"center",padding:"7px 0 0",fontSize:10,color:D.subText }}>
          {selected ? `${getTeam(selected)?.name} selezionato — tocca la fascia per inserirlo` : "Trascina nella fascia o tocca il logo poi la fascia · × per rimuovere"}
        </div>
      )}
      {mode==="free" && (
        <div style={{ textAlign:"center",padding:"7px 0 0",fontSize:10,color:D.subText }}>
          {freeSel ? "Elemento selezionato — tocca la fascia per inserirlo" : "Doppio click sul nome fascia per rinominarlo · Trascina o tocca per inserire"}
        </div>
      )}

      {/* BOARD */}
      <div ref={boardRef} style={{ maxWidth:860,margin:"10px auto 0",padding:"0 8px" }}>
        <div style={{ borderRadius:14,overflow:"hidden",border:`1px solid ${D.border}`,boxShadow:dark?"0 8px 40px rgba(0,0,0,0.4)":"0 4px 20px rgba(0,0,0,0.08)" }}>
          {mode==="free"
            ? freeTiers.map(tier=><FreeRow key={tier.id} tier={tier} />)
            : TIERS.map(tier=><TierRow key={tier.id} tier={tier} />)
          }
        </div>

        {/* POOL */}
        <div style={{ marginTop:12,background:D.poolBg,borderRadius:14,border:`1px solid ${D.border}`,padding:"12px 14px" }}>
          <div style={{ fontSize:9,letterSpacing:4,color:D.subText,textTransform:"uppercase",marginBottom:12 }}>Da posizionare</div>
          <div style={{ display:"flex",flexWrap:"wrap",gap:8,minHeight:44 }}
            onDragOver={e=>e.preventDefault()}
            onDrop={e=>{
              e.preventDefault();
              if(mode==="free"){
                const raw=e.dataTransfer.getData("freeItem");
                if(!raw) return;
                const item=JSON.parse(raw);
                setFreeItems(prev=>{const n={};freeTiers.forEach(t=>{n[t.id]=(prev[t.id]||[]).filter(x=>x.id!==item.id);});return n;});
                setFreePool(prev=>[...prev.filter(x=>x.id!==item.id),item]);
              } else {
                if(dragId){toPool(dragId);setDragId(null);}
              }
            }}
          >
            {mode==="free" ? (
              freePool.length===0
                ? <div style={{ color:D.subText,fontSize:12,alignSelf:"center" }}>Tutti gli elementi posizionati ✔</div>
                : freePool.map(item=>(
                    <div key={item.id} draggable onDragStart={e=>{e.stopPropagation();e.dataTransfer.setData("freeItem",JSON.stringify(item));}}>
                      <FreeCard item={item} accent={D.accent}
                        isSel={freeSel===item.id}
                        onClick={()=>setFreeSel(s=>s===item.id?null:item.id)}
                        onRemove={()=>{ setFreePool(prev=>prev.filter(x=>x.id!==item.id)); if(freeSel===item.id)setFreeSel(null); }}
                      />
                    </div>
                  ))
            ) : (
              pool.length===0
                ? <div style={{ color:D.subText,fontSize:12,alignSelf:"center" }}>Tutte le squadre posizionate ✔</div>
                : pool.map(tid=><Card key={tid} teamId={tid} inTier={false} />)
            )}
          </div>
        </div>

        <div style={{ textAlign:"center",marginTop:10,fontSize:10,color:D.subText }}>
          Creato con ❤️ da <span style={{ color:D.accent }}>universosportivo.com</span> — nessun dato lascia il browser.
        </div>
      </div>

      {/* MODAL aggiungi elemento libero */}
      {showAddItem && (
        <div onClick={()=>setShowAddItem(false)} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(4px)" }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:dark?"#161628":"#fff",border:`1px solid ${D.border}`,borderRadius:16,padding:24,maxWidth:360,width:"92%",boxShadow:"0 20px 60px rgba(0,0,0,0.6)" }}>
            <div style={{ fontWeight:800,fontSize:16,color:D.text,marginBottom:16 }}>Nuovo elemento</div>

            {/* Testo */}
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:11,color:D.subText,display:"block",marginBottom:4 }}>Testo (nome, etichetta…)</label>
              <input
                value={newText}
                onChange={e=>setNewText(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter")addFreeItem();}}
                placeholder="Es. Messi, Stagione 2024…"
                style={{ width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${D.border}`,background:dark?"rgba(255,255,255,0.08)":"#f0f0f5",color:D.text,fontSize:13,outline:"none",boxSizing:"border-box" }}
              />
            </div>

            {/* Foto */}
            <div style={{ marginBottom:18 }}>
              <label style={{ fontSize:11,color:D.subText,display:"block",marginBottom:4 }}>Foto (opzionale)</label>
              <input type="file" accept="image/*" onChange={handleImgUpload}
                style={{ fontSize:12,color:D.text,width:"100%" }} />
              {newImg && (
                <div style={{ marginTop:8,display:"flex",alignItems:"center",gap:8 }}>
                  <img src={newImg} alt="preview" style={{ width:50,height:50,objectFit:"cover",borderRadius:8,border:`1px solid ${D.border}` }} />
                  <button onClick={()=>setNewImg(null)} style={{ background:"none",border:"none",color:"#e84040",cursor:"pointer",fontSize:12 }}>Rimuovi</button>
                </div>
              )}
            </div>

            <div style={{ display:"flex",gap:10 }}>
              <button onClick={addFreeItem} disabled={!newText.trim()&&!newImg}
                style={{ flex:1,padding:"10px",borderRadius:8,border:"none",background:D.accent,color:"#0d0d1a",fontWeight:700,fontSize:13,cursor:(!newText.trim()&&!newImg)?"not-allowed":"pointer",opacity:(!newText.trim()&&!newImg)?0.5:1 }}>
                Aggiungi
              </button>
              <button onClick={()=>{setShowAddItem(false);setNewText("");setNewImg(null);}}
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

function Btn({ color, onClick, children, textColor }) {
  return (
    <button onClick={onClick} style={{ background:`${color}18`,border:`1px solid ${color}55`,color:textColor||color,padding:"7px 13px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer" }}>
      {children}
    </button>
  );
}

