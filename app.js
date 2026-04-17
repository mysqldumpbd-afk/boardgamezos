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
  return [
    {
      id:'preset_strike', name:'Strike', emoji:'🎳', description:'Supervivencia · El último en pie gana',
      config:{
        type:'individual', minPlayers:2, maxPlayers:10, roomAccess:'code',
        useRounds:false, useTurns:false, useFirstPlayerToken:false, useTimer:false,
        victoryMode:'lives', livesWinMode:'last_alive', tiebreak:'host',
        winConditions:['Sin dados','Sin cartas','Last stand','Sin recursos','Time out'],
        useDefeat:true, defeatType:'lives', defeatLives:'zero',
        defeatMoment:'immediate', defeatConsequence:'eliminated',
        registers:['lives'], captureType:'manual', valueNature:'positive',
        accumulation:'global', modifiers:[], capturedBy:'self', scoreVisibility:'all',
        useElimination:true, elimStartsAt:'round_1', elimMethod:'zero_lives',
        elimTieRule:'host', elimAftermath:'out',
        useTools:false, tools:[], toolsMode:'informal',
        roles:['host','player'], scoreCapture:'self', roundCloseWho:'host',
        endConditions:['last_elim'], showEndScreen:true, saveHistory:true,
        rematchKeepPlayers:true,rematchKeepRoom:true,rematchKeepConfig:true,rematchResetScore:true,
        // Legado
        accumulates:'lives', scoreSign:'positive',
      }
    },
    {
      id:'preset_cubilete', name:'Cubilete', emoji:'🎲', description:'Dados con cubilete · Fichas · El último con vida gana',
      config:{
        type:'individual', minPlayers:2, maxPlayers:6, roomAccess:'code',
        useRounds:true, rounds:'libre', roundClose:'manual', roundReset:'nothing',
        useTurns:true, turnOrder:'fixed', canSkipTurn:false, hasExtraTurns:false,
        turnLimitPerRound:false, useFirstPlayerToken:true, useTimer:false,
        victoryMode:'lives', livesWinMode:'last_alive', tiebreak:'host',
        winConditions:['Par','Dos pares','Tercia','Full','Póker','Quintilla'],
        useDefeat:true, defeatType:'lives', defeatLives:'zero',
        defeatMoment:'round_end', defeatConsequence:'eliminated',
        registers:['lives'], captureType:'manual', valueNature:'positive',
        accumulation:'always_keep', modifiers:['penalty'], capturedBy:'host', scoreVisibility:'all',
        useElimination:true, elimStartsAt:'round_1', elimMethod:'zero_lives',
        elimTieRule:'host', elimAftermath:'out',
        useTools:true, tools:['counter'], toolsMode:'informal', toolsRegistered:'no',
        toolsAffect:[], coinUse:'free', wheelSegments:'fixed', rpsScope:'any',
        roles:['host','player'], scoreCapture:'host', roundCloseWho:'host',
        pauseWho:'host', errorWho:'host', visHost:'all', visPlayer:'all', visSpectator:'score',
        endConditions:['last_elim'], showEndScreen:true, saveHistory:true,
        exportFormat:['image'],
        rematchKeepPlayers:true,rematchKeepRoom:true,rematchKeepConfig:true,rematchResetScore:true,
        accumulates:'lives', scoreSign:'positive',
      }
    },
    {
      id:'preset_uno', name:'UNO', emoji:'🃏', description:'Puntos por cartas · El primero en llegar a 500 gana',
      config:{
        type:'individual', minPlayers:2, maxPlayers:10, roomAccess:'code',
        useRounds:true, rounds:'libre', roundClose:'manual', roundReset:'nothing',
        useTurns:true, turnOrder:'rotating', canSkipTurn:true, hasExtraTurns:true,
        turnLimitPerRound:false, useFirstPlayerToken:true, useTimer:false,
        victoryMode:'points', pointsWinMode:'reach_x', targetScore:500, pointsValidation:'instant',
        tiebreak:'host',
        winConditions:['UNO!','Color especial','Comodín +4','Reversa','Salto'],
        useDefeat:false,
        registers:['points'], captureType:'manual', valueNature:'positive',
        accumulation:'global', modifiers:['penalty','bonus'], capturedBy:'host', scoreVisibility:'all',
        useElimination:false,
        useTools:true, tools:['coin'], toolsMode:'informal', toolsRegistered:'no',
        coinUse:'order', toolsAffect:[],
        roles:['host','player'], scoreCapture:'host', roundCloseWho:'host',
        endConditions:['victory'], showEndScreen:true, saveHistory:true,
        rematchKeepPlayers:true,rematchKeepRoom:true,rematchKeepConfig:true,rematchResetScore:true,
        accumulates:'points', scoreSign:'positive',
      }
    }
  ];
}

async function seedPresetTemplates(uid){
  // Solo siembra si el usuario no tiene templates aún
  const existing = await _db.ref(`gameTemplates/${uid}`).once('value');
  if(existing.val()) return; // ya tiene templates
  const presets = getPresetTemplates();
  for(const p of presets){
    await _db.ref(`gameTemplates/${uid}/${p.id}`).set({
      ...p, uid, updatedAt:Date.now(), createdAt:Date.now()
    });
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
