// ═══════════════════════════════════════════════════════════════
// app.js — BOARDGAMEZ OS v1.4
// Firebase Auth con signInWithRedirect (compatible GitHub Pages)
// ═══════════════════════════════════════════════════════════════
firebase.initializeApp({
  apiKey:"AIzaSyAPRdb6SiBBYM5VRB5XOtsIGY8gN_KT1NU",
  authDomain:"boardgamezos.firebaseapp.com",
  databaseURL:"https://boardgamezos-default-rtdb.firebaseio.com",
  projectId:"boardgamezos",
  storageBucket:"boardgamezos.firebasestorage.app",
  messagingSenderId:"108883235402",
  appId:"1:108883235402:web:365b118fa7c7bc57f84cb3"
});
const _db   = firebase.database();
const _auth = firebase.auth();

// ── AUTH — usa redirect en vez de popup (compatible con GitHub Pages) ──
const _gProvider = new firebase.auth.GoogleAuthProvider();

async function authSignInGoogle(){
  // Usamos redirect en lugar de popup para evitar bloqueos en GitHub Pages
  return _auth.signInWithRedirect(_gProvider);
}
async function authSignInEmail(e,p){ return _auth.signInWithEmailAndPassword(e,p); }
async function authSignUpEmail(e,p){ return _auth.createUserWithEmailAndPassword(e,p); }
async function authSignOut(){ return _auth.signOut(); }
function authOnChange(cb){ return _auth.onAuthStateChanged(cb); }

// ── PLAYER PROFILE (localStorage) ───────────────────────────────
const PROFILE_KEY='bgos_profile';
function getProfile(){
  try{ return JSON.parse(localStorage.getItem(PROFILE_KEY)||'null'); }catch{ return null; }
}
function saveProfile(profile){ localStorage.setItem(PROFILE_KEY,JSON.stringify(profile)); }
function hasProfile(){ const p=getProfile(); return p&&p.name&&p.name.trim().length>0; }

// ── DEMO STORE ──────────────────────────────────────────────────
const _DS={},_DL={};
function demoSet(p,d){_DS[p]=JSON.parse(JSON.stringify(d));(_DL[p]||[]).forEach(c=>c(_DS[p]));return Promise.resolve();}
function demoGet(p){return Promise.resolve(_DS[p]||null);}
function demoListen(p,cb){_DL[p]=_DL[p]||[];_DL[p].push(cb);if(_DS[p])cb(_DS[p]);return()=>{_DL[p]=_DL[p].filter(f=>f!==cb);};}

function makeDB(demo){
  if(demo) return{set:(p,d)=>demoSet(p,d),get:(p)=>demoGet(p),listen:(p,cb)=>demoListen(p,cb)};
  return{
    set:(p,d)=>_db.ref(p).set(d),
    get:(p)=>_db.ref(p).once("value").then(s=>s.val()),
    listen:(p,cb)=>{const r=_db.ref(p);r.on("value",s=>cb(s.val()));return()=>r.off("value");}
  };
}

// ── GAME TEMPLATES ───────────────────────────────────────────────
async function saveGameTemplate(uid,template){
  try{
    const id=template.id||('gt_'+uid_fn());
    const data={...template,id,uid,updatedAt:Date.now(),createdAt:template.createdAt||Date.now()};
    await _db.ref(`gameTemplates/${uid}/${id}`).set(data);
    return data;
  }catch(e){ console.error('saveGameTemplate error:',e); throw e; }
}
async function loadGameTemplates(uid){
  const snap=await _db.ref(`gameTemplates/${uid}`).once('value');
  const val=snap.val();
  if(!val) return [];
  return Object.values(val).sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
}
async function deleteGameTemplate(uid,id){
  await _db.ref(`gameTemplates/${uid}/${id}`).remove();
}

// ── CONSTANTS ───────────────────────────────────────────────────
const EMOJIS=[
  "🐀","🐂","🐅","🐇","🐉","🐍","🐎","🐏","🐒","🐓","🐕","🐖",
  "🦁","🐻","🐼","🦊","🦋","🦅","🐬","🦈","🦜","🦩","🐙","🦖",
  "🦝","🦦","🦥","🐿️","🦔","🐲","🎯","⚡","🔥","💎","👑","🌟",
  "🚀","🎮","🎲","🃏","🎳","⚔️","🛡️","🏆"
];
const GAME_EMOJIS=[
  "🎮","🎲","🃏","🎯","🎳","⚔️","🛡️","🏆","🎰","🧩",
  "♟️","🎴","🀄","🎭","🎪","🎠","🚀","🔥","💎","👑",
  "⚡","🌟","🐉","🦁","🐺","🦊","🐸","🤖","👾","🌈"
];
const COLORS=[
  "#E63946","#2EC4B6","#F5C800","#3BB273","#7B2D8B","#FF6B35",
  "#00B4D8","#ff69b4","#ffffff","#A8E63B","#1A4FCC","#FF6B6B",
  "#06D6A0","#9B5DE5","#00CFE8","#FFD700","#6A8C2F","#FF9A8B"
];
const uid4=()=>Math.random().toString(36).slice(2,6).toUpperCase();
const uid_fn=()=>Math.random().toString(36).slice(2,10);
const uid=uid_fn; // alias

// ── FORMATTERS ──────────────────────────────────────────────────
function fmtDuration(ms){
  if(!ms||ms<=0) return "0 seg";
  const s=Math.floor(ms/1000),m=Math.floor(s/60),h=Math.floor(m/60);
  if(h>0) return `${h}h ${m%60}m`;
  if(m>0) return `${m} min ${s%60} seg`;
  return `${s} seg`;
}
function fmtDate(ts){return new Date(ts).toLocaleDateString("es-MX",{weekday:"short",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});}
function fmtShortDate(ts){return new Date(ts).toLocaleDateString("es-MX",{month:"short",day:"numeric"});}

// ── SOUNDS ──────────────────────────────────────────────────────
let _actx=null;
function getAC(){if(!_actx)_actx=new(window.AudioContext||window.webkitAudioContext)();return _actx;}
function beep(f=440,d=.08,t='sine',v=.3){
  try{const a=getAC(),o=a.createOscillator(),g=a.createGain();
  o.connect(g);g.connect(a.destination);o.type=t;o.frequency.value=f;
  g.gain.setValueAtTime(v,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+d);
  o.start();o.stop(a.currentTime+d);}catch(e){}
}
function snd(t){
  if(t==='tap')   beep(600,.05,'sine',.18);
  else if(t==='score'){beep(520,.08,'sine',.28);setTimeout(()=>beep(660,.1,'sine',.28),100);}
  else if(t==='round'){beep(440,.1,'square',.2);setTimeout(()=>beep(550,.1,'square',.2),120);setTimeout(()=>beep(660,.15,'square',.25),240);}
  else if(t==='winner'){[0,150,300,450].forEach((d,i)=>setTimeout(()=>beep(440+i*110,.15,'sine',.35),d));}
  else if(t==='join'){beep(500,.08,'sine',.25);setTimeout(()=>beep(700,.1,'sine',.3),100);}
  else if(t==='elim'){beep(300,.15,'square',.3);setTimeout(()=>beep(200,.2,'square',.25),160);}
  else if(t==='save'){beep(600,.06,'sine',.2);setTimeout(()=>beep(800,.08,'sine',.2),80);setTimeout(()=>beep(1000,.12,'sine',.22),180);}
  else if(t==='delete'){beep(300,.08,'sine',.2);setTimeout(()=>beep(200,.1,'sine',.18),90);}
  else if(t==='up'){beep(600,.06,'sine',.2);setTimeout(()=>beep(800,.1,'sine',.25),80);}
  else if(t==='down') beep(300,.12,'sine',.2);
  else if(t==='victory'){
    const m=[523,523,523,392,523,659,392,330,440,494,466,440,392,523,659,784];
    const d=[.15,.15,.15,.2,.3,.5,.3,.2,.15,.15,.15,.15,.2,.2,.2,.5];
    let t2=0;m.forEach((f,i)=>{setTimeout(()=>beep(f,d[i],'sine',.35),t2*1000);t2+=d[i]+.05;});
  }
}

// ── STATS ENGINE ────────────────────────────────────────────────
async function saveSession(sessionData,demo=false){
  const db=makeDB(demo);
  const{sessionId,players}=sessionData;
  // Auto-save all players as contacts
  if(players&&!demo){ players.forEach(p=>{ if(p&&p.name) saveContact(p); }); }
  const existing=await db.get(`sessions/${sessionId}/saved`);
  if(existing===true) return;
  await db.set(`sessions/${sessionId}`,{...sessionData,saved:true});
  for(const p of players){
    const pKey=p.name.trim().toLowerCase().replace(/[^a-z0-9]/g,"_").slice(0,30);
    const position=p.finalPosition||1;
    const won=position===1;
    await db.set(`players/${pKey}/sessions/${sessionId}`,{
      sessionId,gameType:sessionData.gameType,gameTitle:sessionData.gameTitle,
      customTitle:sessionData.customTitle||sessionData.gameTitle,
      date:sessionData.startedAt,finalPosition:position,
      totalPlayers:players.length,won,
      survivalMs:p.survivalMs||null,survivalLabel:p.survivalLabel||null,
      points:p.points||null,wins:p.wins||null
    });
    const summaryRef=`players/${pKey}/summary`;
    const prev=await db.get(summaryRef)||{};
    await db.set(summaryRef,{
      name:p.name,emoji:p.emoji,color:p.color,pKey,
      games:(prev.games||0)+1,wins:(prev.wins||0)+(won?1:0),
      totalSurvivalMs:(prev.totalSurvivalMs||0)+(p.survivalMs||0),
      avgSurvivalMs:Math.round(((prev.totalSurvivalMs||0)+(p.survivalMs||0))/((prev.games||0)+1)),
      totalPoints:(prev.totalPoints||0)+(p.points||0),
      bestPoints:Math.max(prev.bestPoints||0,p.points||0),
      bestPosition:Math.min(prev.bestPosition||99,position),
      firstEliminations:(prev.firstEliminations||0)+(position===players.length?1:0),
      lastPlayed:sessionData.startedAt,
      lastGameTitle:sessionData.customTitle||sessionData.gameTitle
    });
  }
}
async function loadLeaderboard(demo=false){
  const db=makeDB(demo);
  const data=await db.get("players");
  if(!data) return [];
  return Object.values(data).map(p=>p.summary).filter(Boolean).sort((a,b)=>(b.wins||0)-(a.wins||0));
}
async function loadRecentSessions(limit=20,demo=false){
  const db=makeDB(demo);
  const data=await db.get("sessions");
  if(!data) return [];
  return Object.values(data).filter(s=>s.saved).sort((a,b)=>(b.startedAt||0)-(a.startedAt||0)).slice(0,limit);
}

// ── DESCRIPTOR ──────────────────────────────────────────────────
function describeTemplate(t){
  const cfg=t.config||{};
  const mode=cfg.victoryMode==='points'?'Puntos':cfg.victoryMode==='wins'?'Victorias':cfg.victoryMode==='elimination'?'Eliminación':'Manual';
  const rounds=cfg.useRounds?(cfg.rounds==='libre'?'∞ rondas':`${cfg.rounds} rondas`):'Partida libre';
  return `${mode} · ${rounds}`;
}

// ── PRESET GAME TEMPLATES ───────────────────────────────────────
// Templates precargados que demuestran el motor completo
function getPresetTemplates(){
  // Usa OFFICIAL_PRESETS (official-presets.js) como fuente única de verdad
  // Convierte cada preset al formato de template para Firebase
  const map = window.OFFICIAL_PRESETS || {};
  return Object.values(map)
    .filter(p => p && p.config)
    .sort((a,b) => (a.order||999) - (b.order||999))
    .map(p => ({
      id: p.id,
      name: p.name,
      emoji: p.emoji || '🎮',
      description: (p.valueAdd || []).join(' · ') || p.name,
      color: p.color || '#00F5FF',
      category: p.category || 'general',
      complexity: p.complexity || 'medium',
      validates: p.validates || [],
      valueAdd: p.valueAdd || [],
      config: p.config,
      schemaVersion: '2.0',
    }));
}

async function seedPresetTemplates(uid){
  if(!uid) return;
  const presets = getPresetTemplates();
  if(!presets.length) return;
  for(const p of presets){
    try{
      const snap = await _db.ref(`gameTemplates/${uid}/${p.id}`).once('value');
      const existing = snap.val();
      // Solo sembrar si no existe, o si es una versión vieja (sin schemaVersion)
      if(!existing || !existing.schemaVersion){
        const now = Date.now();
        // Generar runtime spec si el motor está disponible
        let runtimeSpec = {};
        let grouped = {};
        try{
          if(typeof resolveRuntime === 'function') runtimeSpec = resolveRuntime(p.config);
          if(window.SchemaUtils?.groupConfigForStorage) grouped = window.SchemaUtils.groupConfigForStorage(p.config);
        }catch(e){}
        await _db.ref(`gameTemplates/${uid}/${p.id}`).set({
          id: p.id,
          uid,
          name: p.name,
          emoji: p.emoji,
          description: p.description,
          color: p.color,
          category: p.category,
          complexity: p.complexity,
          schemaVersion: '2.0',
          config: p.config,          // plano — compatible con runtime actual
          grouped,                   // por secciones — nuevo motor
          runtime: runtimeSpec,      // spec + timeline + gameState
          updatedAt: now,
          createdAt: existing?.createdAt || now,
          isPreset: true,
        });
      }
    }catch(e){ console.warn('seedPreset error:', p.id, e); }
  }
}

// ── GAME PRESETS ─────────────────────────────────────────────────
const GAME_PRESETS={
  strike:{
    id:'strike',title:'Strike',emoji:'🎳',
    description:'Supervivencia · El último en pie gana',
    color:'#FF6B35',mode:'survival',
    config:{rounds:null,usePoints:false,useTimer:false,eliminationType:'self',minPlayers:2,maxPlayers:10}
  }
};

// ── SESSION PERSISTENCE ─────────────────────────────────────────
const SESSION_KEY='bgos_active_session';

function saveActiveSession(data){
  // data: {code, isHost, gameType, screen, myId, templateConfig}
  try{
    localStorage.setItem(SESSION_KEY,JSON.stringify({...data,savedAt:Date.now()}));
  }catch(e){}
}
function getActiveSession(){
  try{
    const s=JSON.parse(localStorage.getItem(SESSION_KEY)||'null');
    if(!s) return null;
    // Expira a las 4 horas
    if(Date.now()-s.savedAt>4*60*60*1000){ clearActiveSession(); return null; }
    return s;
  }catch{ return null; }
}
function clearActiveSession(){
  try{ localStorage.removeItem(SESSION_KEY); }catch(e){}
}

// ── PRESENCE SYSTEM ─────────────────────────────────────────────
let _presRef=null, _presInterval=null;

function setupPresence(roomCode,playerId){
  if(!roomCode||!playerId) return;
  teardownPresence();
  _presRef=_db.ref(`rooms/${roomCode}/presence/${playerId}`);
  const connRef=_db.ref('.info/connected');
  connRef.on('value',snap=>{
    if(snap.val()===true){
      _presRef.onDisconnect().set({status:'offline',lastSeen:firebase.database.ServerValue.TIMESTAMP});
      _presRef.set({status:'online',lastSeen:firebase.database.ServerValue.TIMESTAMP});
      _presInterval=setInterval(()=>{
        _presRef&&_presRef.update({lastSeen:firebase.database.ServerValue.TIMESTAMP});
      },25000);
    }
  });
}

function teardownPresence(){
  if(_presRef){
    try{_presRef.onDisconnect().cancel();}catch(e){}
    _presRef=null;
  }
  if(_presInterval){ clearInterval(_presInterval); _presInterval=null; }
}

function listenPresence(roomCode,callback){
  const ref=_db.ref(`rooms/${roomCode}/presence`);
  ref.on('value',snap=>{
    const raw=snap.val()||{};
    const now=Date.now();
    const result={};
    Object.entries(raw).forEach(([pid,data])=>{
      const age=now-(data.lastSeen||0);
      let status=data.status||'offline';
      if(status==='online'&&age>90000) status='away';
      if(status==='online'&&age>150000) status='offline';
      result[pid]={...data,status,age};
    });
    callback(result);
  });
  return ()=>ref.off('value');
}

// Colores y etiquetas de status — usar solo colores en UI, glosario en manual
const PRESENCE_CONFIG={
  online:   {color:'#00FF9D',label:'Activo'},
  away:     {color:'#FFD447',label:'Ausente'},
  offline:  {color:'rgba(255,255,255,.2)',label:'Desconectado'},
  pending:  {color:'#4A90FF',label:'Por entrar'},
  eliminated:{color:'#FF3B5C',label:'Eliminado'},
  spectator:{color:'#9B5DE5',label:'Espectador'},
};
function getPresenceColor(status){ return (PRESENCE_CONFIG[status]||PRESENCE_CONFIG.offline).color; }

// ── EVENT LOG — CORE UNDO/REDO ───────────────────────────────────
async function logEvent(roomCode,event){
  const id=uid_fn();
  const full={id,...event,ts:Date.now(),reverted:false,revertedAt:null,revertedBy:null};
  await _db.ref(`rooms/${roomCode}/eventLog/${id}`).set(full);
  return full;
}
async function revertEvent(roomCode,eventId,revertedBy){
  await _db.ref(`rooms/${roomCode}/eventLog/${eventId}`).update({
    reverted:true,revertedAt:Date.now(),revertedBy
  });
}
function listenEventLog(roomCode,callback){
  const ref=_db.ref(`rooms/${roomCode}/eventLog`);
  ref.on('value',snap=>{
    const val=snap.val()||{};
    callback(Object.values(val).sort((a,b)=>a.ts-b.ts));
  });
  return ()=>ref.off('value');
}
function getLastRevertibleEvent(events,playerId){
  const types=['add_points','add_win','lose_life','apply_bonus','apply_penalty'];
  return events
    .filter(e=>!e.reverted&&e.playerId===playerId&&types.includes(e.type))
    .sort((a,b)=>b.ts-a.ts)[0]||null;
}

// ── JUGADORES HABITUALES (saved contacts) ────────────────────────
const CONTACTS_KEY = 'bgos_contacts';

function getSavedPlayers(){
  try{ return JSON.parse(localStorage.getItem(CONTACTS_KEY)||'[]'); }catch{ return []; }
}
function saveContact(player){
  // player: {id, name, emoji, color}
  if(!player.name) return;
  const existing = getSavedPlayers();
  const idx = existing.findIndex(p=>p.name===player.name);
  const contact = {id:player.id||uid_fn(), name:player.name, emoji:player.emoji||'🎮', color:player.color||'#00F5FF', lastSeen:Date.now()};
  if(idx>=0){ existing[idx]={...existing[idx],...contact}; }
  else { existing.push(contact); }
  // Keep max 20 contacts, sorted by lastSeen
  const sorted = existing.sort((a,b)=>(b.lastSeen||0)-(a.lastSeen||0)).slice(0,20);
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(sorted));
}
function removeContact(name){
  const existing = getSavedPlayers().filter(p=>p.name!==name);
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(existing));
}

// ── ANIME.JS HELPERS ────────────────────────────────────────────
// Use anime() from the global scope (loaded via CDN in index.html)
function animePop(el) {
  if(!window.anime||!el) return;
  anime({ targets:el, scale:[.85,1], opacity:[0,1], duration:320, easing:'cubicBezier(.34,1.56,.64,1)' });
}
function animeSlideUp(el, delay=0) {
  if(!window.anime||!el) return;
  anime({ targets:el, translateY:[28,0], opacity:[0,1], duration:380, delay, easing:'easeOutExpo' });
}
function animeScore(el, positive=true) {
  if(!window.anime||!el) return;
  anime({ targets:el, scale:[1,positive?1.35:1.1], color:positive?'#FFD447':'#FF3B5C',
    direction:'alternate', duration:300, easing:'easeOutExpo' });
}

