// ═══════════════════════════════════════════════════════════════
// components.jsx — BOARDGAMEZ OS v1.1
// Fixes: join selecciona jugador existente, host=jugador,
//        StrikeHostSetup mejorado, stats actualizadas
// ═══════════════════════════════════════════════════════════════
const{useState,useEffect,useRef,useCallback}=React;

// ── APP SHELL ───────────────────────────────────────────────────
function App(){
  const [screen,setScreen]=useState('home');
  const [session,setSession]=useState(null);
  const [isHost,setIsHost]=useState(false);
  const [myId]=useState(()=>{
    const s=localStorage.getItem('bgos_uid');
    if(s) return s;
    const id=uid();localStorage.setItem('bgos_uid',id);return id;
  });
  const [myProfile,setMyProfile]=useState(()=>({
    name:localStorage.getItem('bgos_name')||'',
    emoji:localStorage.getItem('bgos_emoji')||'🐉',
    color:localStorage.getItem('bgos_color')||'#00F5FF'
  }));
  const db=makeDB(false);

  function goHome(){setScreen('home');setSession(null);setIsHost(false);}

  function saveMyProfile(name,emoji,color){
    localStorage.setItem('bgos_name',name);
    localStorage.setItem('bgos_emoji',emoji);
    localStorage.setItem('bgos_color',color);
    setMyProfile({name,emoji,color});
  }

  async function createRoom(gameType,customTitle,players,config){
    const code=uid4();
    const roomData={
      code,gameType,customTitle,status:'lobby',hostId:myId,
      createdAt:Date.now(),config:config||null,
      players:players.map(p=>({
        ...p,id:p.id||uid(),total:0,wins:0,rounds:[],
        eliminated:false,finalPosition:null,survivalMs:null
      })),
      events:[]
    };
    await db.set(`rooms/${code}`,roomData);
    setSession({code,demo:false,date:Date.now()});
    setIsHost(true);return code;
  }

  // Join: puede unirse como jugador existente (por nombre) o crear nuevo
  async function joinRoom(code,playerId,playerName,playerEmoji,playerColor){
    const existing=await db.get(`rooms/${code}`);
    if(!existing) return{error:'Sala no encontrada'};
    if(existing.status==='finished') return{error:'Esta partida ya terminó'};

    const players=[...(existing.players||[])];
    const alreadyIn=players.find(p=>p.id===myId||p.id===playerId);

    if(!alreadyIn){
      // Unirse como nuevo jugador o tomar slot existente por nombre
      const byName=players.find(p=>p.name.toLowerCase()===playerName.toLowerCase());
      if(byName){
        // Tomar el slot del jugador con ese nombre
        const updated=players.map(p=>p.id===byName.id?{...p,id:myId,emoji:playerEmoji,color:playerColor}:p);
        await db.set(`rooms/${code}/players`,updated);
      } else {
        // Jugador nuevo
        players.push({id:myId,name:playerName,emoji:playerEmoji,color:playerColor,total:0,wins:0,rounds:[],eliminated:false,finalPosition:null});
        await db.set(`rooms/${code}/players`,players);
      }
    }

    saveMyProfile(playerName,playerEmoji,playerColor);
    setSession({code,demo:false,date:existing.createdAt});
    setIsHost(false);

    if(existing.gameType==='preset:strike'){
      setScreen(existing.status==='active'?'strike-game':'strike-lobby');
    } else {
      setScreen(existing.status==='active'?'generic-game':'generic-lobby');
    }
    return{ok:true};
  }

  const screenProps={session,onBack:goHome,isHost,myId,db};
  const hostPlayer={id:myId,name:myProfile.name||'Host',emoji:myProfile.emoji,color:myProfile.color};

  return(
    <div>
      {screen==='home'&&(
        <MainMenu
          onGoStrike={()=>setScreen('strike-host-setup')}
          onGoGeneric={()=>setScreen('generic-setup')}
          onGoJoin={()=>setScreen('join')}
          onGoStats={()=>setScreen('stats')}
          myId={myId} db={db}
        />
      )}
      {screen==='join'&&(
        <JoinRoom onBack={goHome} onJoin={joinRoom} myId={myId}
          savedProfile={myProfile} db={db}/>
      )}
      {screen==='strike-host-setup'&&(
        <StrikeHostSetup onBack={goHome} hostPlayer={hostPlayer}
          onSaveProfile={saveMyProfile}
          onCreateRoom={async({title,players})=>{
            await createRoom('preset:strike',title,players,GAME_PRESETS.strike.config);
            setScreen('strike-lobby');
          }}/>
      )}
      {screen==='strike-lobby'&&session&&(
        <StrikeLobby {...screenProps} onStart={()=>setScreen('strike-game')}/>
      )}
      {screen==='strike-game'&&session&&(
        <StrikeGame {...screenProps}/>
      )}
      {screen==='generic-setup'&&(
        <GenericSetup onBack={goHome} hostPlayer={hostPlayer}
          onCreateRoom={async({title,players,config})=>{
            await createRoom('generic',title,players,config);
            setScreen('generic-lobby');
          }}/>
      )}
      {screen==='generic-lobby'&&session&&(
        <GenericLobby {...screenProps} onStart={()=>setScreen('generic-game')}/>
      )}
      {screen==='generic-game'&&session&&(
        <GenericRuntime {...screenProps}/>
      )}
      {screen==='stats'&&(
        <StatsScreen onBack={goHome} db={db}/>
      )}
    </div>
  );
}

// ── MAIN MENU ───────────────────────────────────────────────────
function MainMenu({onGoStrike,onGoGeneric,onGoJoin,onGoStats,myId,db}){
  const [recentSessions,setRecentSessions]=useState([]);
  useEffect(()=>{loadRecentSessions(3).then(setRecentSessions).catch(()=>{});},[]);

  return(
    <div className="os-wrap">
      <div className="os-header">
        <div><div className="os-logo">BOARD<span>GAMEZ</span></div><div className="os-logo-sub">OS · v1.1</div></div>
        <div className="os-status"><div className="os-dot"/><span>ONLINE</span></div>
      </div>
      <div className="os-page" style={{paddingTop:0}}>
        <div className="os-hero">
          <div className="os-hero-title">BOARDGAMEZ</div>
          <div style={{fontFamily:'var(--font-display)',fontSize:'2.4rem',letterSpacing:6,color:'var(--orange)',textShadow:'var(--glow-o)',marginBottom:4}}>OS</div>
          <div className="os-hero-sub">GAME MANAGEMENT SYSTEM</div>
        </div>

        <div className="os-section">JUEGOS ESPECIALIZADOS</div>
        <div className="preset-card" style={{borderColor:'rgba(255,107,53,.3)',background:'linear-gradient(135deg,rgba(255,107,53,.06),rgba(255,107,53,.02))'}}
          onClick={()=>{snd('tap');onGoStrike();}}>
          <div className="preset-icon">🎳</div>
          <div className="preset-info">
            <div className="preset-title">Strike</div>
            <div className="preset-desc">Supervivencia · Auto-eliminación · Stats completas</div>
            <div style={{display:'flex',gap:5,marginTop:7}}>
              <div className="os-tag orange" style={{fontSize:'var(--fs-micro)'}}>PRECONFIGURADO</div>
              <div className="os-tag" style={{fontSize:'var(--fs-micro)'}}>LISTO PARA JUGAR</div>
            </div>
          </div>
        </div>

        <div className="preset-card" style={{opacity:.35,cursor:'default'}}>
          <div className="preset-icon">🃏</div>
          <div className="preset-info">
            <div className="preset-title" style={{color:'rgba(255,255,255,.4)'}}>Más juegos</div>
            <div className="preset-desc" style={{color:'rgba(255,255,255,.2)'}}>Próximamente · Sushi Go, Catan y más</div>
          </div>
        </div>

        <div className="os-section" style={{marginTop:4}}>PARTIDA LIBRE</div>
        <div className="os-card primary" onClick={()=>{snd('tap');onGoGeneric();}}>
          <div className="os-card-header">
            <div className="os-card-icon">⚔️</div>
            <div><div className="os-card-title">Crear partida</div><div className="os-card-sub">CONFIGURABLE · CUALQUIER JUEGO</div></div>
          </div>
          <div className="os-card-desc">Dale un nombre, configura el modo y lleva el marcador de cualquier juego de mesa.</div>
          <div className="os-tags">
            <div className="os-tag cyan">Puntos</div>
            <div className="os-tag cyan">Victorias</div>
            <div className="os-tag cyan">Supervivencia</div>
            <div className="os-tag cyan">Configs guardadas</div>
          </div>
        </div>

        <div className="os-card secondary" onClick={()=>{snd('tap');onGoJoin();}}>
          <div className="os-card-header">
            <div className="os-card-icon">🚪</div>
            <div><div className="os-card-title">Unirse a sala</div><div className="os-card-sub">CÓDIGO DE 4 LETRAS</div></div>
          </div>
          <div className="os-card-desc">Ingresa el código que compartió el host y únete a la partida en curso.</div>
        </div>

        <div className="os-section">PLATAFORMA</div>
        <div className="os-card tertiary" onClick={()=>{snd('tap');onGoStats();}}>
          <div className="os-card-header">
            <div className="os-card-icon">📊</div>
            <div><div className="os-card-title">Estadísticas</div><div className="os-card-sub">TODOS LOS JUEGOS · HISTORIAL</div></div>
          </div>
          <div className="os-card-desc">Ranking global, historial por jugador, tiempos de supervivencia y vergüenza 💀</div>
          <div className="os-tags">
            <div className="os-tag purple">Win rate</div>
            <div className="os-tag purple">Supervivencia</div>
            <div className="os-tag purple">Vergüenza 💀</div>
          </div>
        </div>

        {recentSessions.length>0&&(
          <>
            <div className="os-section">PARTIDAS RECIENTES</div>
            {recentSessions.map((s,i)=>(
              <div key={s.sessionId||i} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:'11px 14px',marginBottom:8,display:'flex',alignItems:'center',gap:10}}>
                <div style={{fontSize:'1.5rem'}}>{s.gameType==='preset:strike'?'🎳':'⚔️'}</div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:'var(--font-body)',fontWeight:700,fontSize:'var(--fs-sm)'}}>{s.customTitle||s.gameTitle}</div>
                  <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',fontWeight:600,color:'rgba(255,255,255,.35)',letterSpacing:1,marginTop:1}}>
                    {fmtShortDate(s.startedAt)} · {s.playerCount} jugadores · {fmtDuration(s.durationMs)}
                  </div>
                </div>
                <div style={{fontFamily:'var(--font-display)',fontSize:'1.1rem',color:'var(--gold)'}}>
                  {s.players?.find(p=>p.finalPosition===1)?.emoji||'🏆'}
                </div>
              </div>
            ))}
          </>
        )}
        <div className="g16"/>
      </div>
    </div>
  );
}

// ── STRIKE HOST SETUP ───────────────────────────────────────────
function StrikeHostSetup({onBack,hostPlayer,onSaveProfile,onCreateRoom}){
  const [title,setTitle]=useState('Strike 🎳');
  const [players,setPlayers]=useState([]);
  const [newName,setNewName]=useState('');
  const [pickingFor,setPickingFor]=useState(null);

  // Agregar host como primer jugador
  useEffect(()=>{
    if(hostPlayer.name){
      setPlayers([{...hostPlayer,isHost:true}]);
    }
  },[]);

  function addPlayer(){
    if(!newName.trim()) return;
    snd('join');
    const idx=players.length%EMOJIS.length;
    const cidx=players.length%COLORS.length;
    setPlayers([...players,{id:uid(),name:newName.trim(),emoji:EMOJIS[idx],color:COLORS[cidx]}]);
    setNewName('');
  }
  function updatePlayer(id,field,value){
    setPlayers(players.map(p=>p.id===id?{...p,[field]:value}:p));
    // Sincronizar perfil del host
    if(players.find(p=>p.id===id)?.isHost){
      onSaveProfile(
        field==='name'?value:players.find(p=>p.id===id)?.name||'',
        field==='emoji'?value:players.find(p=>p.id===id)?.emoji||'🐉',
        field==='color'?value:players.find(p=>p.id===id)?.color||'#00F5FF'
      );
    }
  }

  if(pickingFor!==null){
    const p=players.find(pl=>pl.id===pickingFor);
    if(!p){setPickingFor(null);return null;}
    return <PlayerPicker player={p} onUpdate={(f,v)=>{updatePlayer(p.id,f,v);}} onClose={()=>setPickingFor(null)}/>;
  }

  return(
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onBack}>← Atrás</button>
        <div style={{fontSize:'2rem'}}>🎳</div>
        <div style={{width:70}}/>
      </div>
      <div className="os-page" style={{paddingTop:16}}>
        <div style={{background:'linear-gradient(135deg,rgba(255,107,53,.1),rgba(255,107,53,.03))',border:'1px solid rgba(255,107,53,.3)',borderRadius:16,padding:16,marginBottom:20,textAlign:'center'}}>
          <div style={{fontFamily:'var(--font-display)',fontSize:'2rem',letterSpacing:2,color:'var(--orange)',marginBottom:4}}>STRIKE 🎳</div>
          <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-sm)',fontWeight:600,color:'rgba(255,255,255,.45)',letterSpacing:2}}>SUPERVIVENCIA · ÚLTIMO EN PIE GANA</div>
        </div>

        <div className="os-section">NOMBRE DE LA SESIÓN</div>
        <input className="os-input" placeholder="Ej: Strike del viernes..."
          value={title} onChange={e=>setTitle(e.target.value)} maxLength={40}/>
        <div className="g8"/>

        <div className="os-section">JUGADORES · {players.length}</div>
        {players.map((p)=>(
          <div key={p.id} className="player-row" style={{marginBottom:8}}>
            <div style={{fontSize:'1.7rem',width:38,textAlign:'center',cursor:'pointer'}}
              onClick={()=>{snd('tap');setPickingFor(p.id);}}>
              {p.emoji}
            </div>
            <div style={{width:13,height:13,borderRadius:'50%',background:p.color,border:'2px solid rgba(255,255,255,.2)',flexShrink:0,cursor:'pointer'}}
              onClick={()=>{snd('tap');setPickingFor(p.id);}}/>
            <div className="player-name" style={{color:p.color}}>
              {p.name}
              {p.isHost&&<span style={{fontFamily:'var(--font-ui)',fontSize:'.5rem',color:'var(--gold)',letterSpacing:2,marginLeft:6}}>HOST</span>}
            </div>
            {!p.isHost&&(
              <button style={{background:'none',border:'none',color:'rgba(255,59,92,.5)',fontSize:'1.2rem',cursor:'pointer',padding:'0 4px'}}
                onClick={()=>{snd('tap');setPlayers(players.filter(pl=>pl.id!==p.id));}}>×</button>
            )}
          </div>
        ))}

        <div style={{display:'flex',gap:8,marginBottom:16}}>
          <input className="os-input" style={{marginBottom:0,flex:1}}
            placeholder="Agregar jugador..." value={newName}
            onChange={e=>setNewName(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&addPlayer()} maxLength={20}/>
          <button style={{background:'rgba(255,107,53,.15)',border:'1px solid rgba(255,107,53,.4)',color:'var(--orange)',borderRadius:11,padding:'0 18px',cursor:'pointer',fontFamily:'var(--font-display)',fontSize:'1.2rem',flexShrink:0}}
            onClick={addPlayer}>+</button>
        </div>

        {players.length>=2&&(
          <div className="os-alert alert-green" style={{marginBottom:12}}>
            ✓ {players.length} jugadores · stats se guardan automáticamente con timestamps
          </div>
        )}
        <button className="btn btn-orange" disabled={players.length<2||!title.trim()}
          onClick={()=>{snd('round');onCreateRoom({title:title.trim(),players});}}>
          🎳 CREAR SALA DE STRIKE
        </button>
        <button className="btn btn-ghost" onClick={onBack}>← Cancelar</button>
      </div>
    </div>
  );
}

// ── JOIN ROOM ── con selección de jugador existente ──────────────
function JoinRoom({onBack,onJoin,myId,savedProfile,db}){
  const [code,setCode]=useState('');
  const [step,setStep]=useState('code'); // code | select
  const [roomData,setRoomData]=useState(null);
  const [loadingRoom,setLoadingRoom]=useState(false);
  const [roomError,setRoomError]=useState('');
  const [selectedSlot,setSelectedSlot]=useState(null); // null=nuevo, 'pid'=existente
  const [name,setName]=useState(savedProfile?.name||'');
  const [emoji,setEmoji]=useState(savedProfile?.emoji||'🐉');
  const [color,setColor]=useState(savedProfile?.color||'#00F5FF');
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [pickMode,setPickMode]=useState(null);

  async function lookupRoom(){
    if(code.length<4) return;
    setLoadingRoom(true);setRoomError('');
    const data=await db.get(`rooms/${code.toUpperCase()}`);
    setLoadingRoom(false);
    if(!data){setRoomError('Sala no encontrada');return;}
    if(data.status==='finished'){setRoomError('Esta partida ya terminó');return;}
    setRoomData(data);setStep('select');
  }

  async function handleJoin(){
    setLoading(true);setError('');
    let joinName=name,joinEmoji=emoji,joinColor=color,joinId=myId;
    if(selectedSlot&&selectedSlot!=='new'){
      const p=roomData.players.find(pl=>pl.id===selectedSlot);
      if(p){joinName=p.name;joinEmoji=p.emoji||emoji;joinColor=p.color||color;}
      joinId=selectedSlot;
    }
    const result=await onJoin(code.toUpperCase(),joinId,joinName,joinEmoji,joinColor);
    if(result?.error){setError(result.error);setLoading(false);}
  }

  if(pickMode){
    const fakePlayer={name,emoji,color};
    return(
      <div className="os-wrap">
        <div className="os-header">
          <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={()=>setPickMode(null)}>← Listo</button>
          <div style={{fontFamily:'var(--font-label)',fontSize:'.75rem',fontWeight:700,color:'rgba(255,255,255,.5)',letterSpacing:3}}>PERSONALIZAR</div>
          <div style={{width:70}}/>
        </div>
        <div className="os-page" style={{paddingTop:16}}>
          <div style={{display:'flex',gap:6,marginBottom:16}}>
            {['emoji','color'].map(m=>(
              <button key={m} className="btn btn-ghost btn-sm" style={{flex:1,background:pickMode===m?'var(--cyan)':undefined,color:pickMode===m?'var(--bg)':undefined,border:pickMode===m?'none':undefined}}
                onClick={()=>setPickMode(m)}>
                {m==='emoji'?'🐉 Emoji':'🎨 Color'}
              </button>
            ))}
          </div>
          {pickMode==='emoji'&&(
            <div className="picker-grid">
              {EMOJIS.map((e,i)=>(
                <div key={i} className={`picker-item ${emoji===e?'sel':''}`}
                  onClick={()=>{snd('tap');setEmoji(e);}}>
                  {e}
                </div>
              ))}
            </div>
          )}
          {pickMode==='color'&&(
            <div style={{display:'flex',flexWrap:'wrap',gap:10,padding:'8px 0'}}>
              {COLORS.map((c,i)=>(
                <div key={i} className={`color-dot ${color===c?'sel':''}`}
                  style={{background:c}} onClick={()=>{snd('tap');setColor(c);}}/>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return(
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={()=>{if(step==='select'){setStep('code');setRoomData(null);}else onBack();}}>← Atrás</button>
        <div className="os-logo" style={{fontSize:'1.1rem'}}>UNIRSE <span>A SALA</span></div>
        <div style={{width:70}}/>
      </div>

      <div className="os-page" style={{paddingTop:16}}>

        {/* PASO 1: CÓDIGO */}
        {step==='code'&&(
          <div className="anim-fade">
            <div className="os-section">CÓDIGO DE SALA</div>
            <input className="os-input os-code-input" placeholder="XXXX"
              value={code} onChange={e=>setCode(e.target.value.toUpperCase().slice(0,4))}
              maxLength={4} autoFocus
              onKeyDown={e=>e.key==='Enter'&&code.length===4&&lookupRoom()}/>
            {roomError&&<div className="os-alert alert-red">{roomError}</div>}
            <button className="btn btn-cyan" disabled={code.length<4||loadingRoom}
              onClick={lookupRoom}>
              {loadingRoom?'⏳ Buscando...':`🔍 Buscar sala ${code}`}
            </button>
          </div>
        )}

        {/* PASO 2: SELECCIONAR JUGADOR */}
        {step==='select'&&roomData&&(
          <div className="anim-fade">
            <div style={{background:'rgba(0,245,255,.05)',border:'1px solid rgba(0,245,255,.2)',borderRadius:14,padding:'12px 14px',marginBottom:16}}>
              <div style={{fontFamily:'var(--font-display)',fontSize:'1rem',color:'var(--cyan)',letterSpacing:1}}>{roomData.customTitle||'Sala encontrada'}</div>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',fontWeight:600,color:'rgba(255,255,255,.4)',letterSpacing:1,marginTop:3}}>
                {roomData.players?.length} jugadores · {roomData.status==='active'?'En juego':'En lobby'}
              </div>
            </div>

            <div className="os-section">¿ERES ALGUNO DE ESTOS JUGADORES?</div>
            <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-sm)',fontWeight:600,color:'rgba(255,255,255,.4)',marginBottom:12}}>
              Si ya estás en la lista, selecciónate. Si eres nuevo, elige "Nuevo jugador".
            </div>

            {(roomData.players||[]).map(p=>(
              <div key={p.id}
                className={`player-row ${selectedSlot===p.id?'active':''}`}
                style={{cursor:'pointer',marginBottom:8,borderColor:selectedSlot===p.id?'rgba(0,245,255,.5)':undefined}}
                onClick={()=>{snd('tap');setSelectedSlot(p.id);setName(p.name);}}>
                <div className="player-emoji">{p.emoji}</div>
                <div className="player-name" style={{color:p.color||'#fff'}}>{p.name}</div>
                {selectedSlot===p.id&&<div style={{color:'var(--cyan)',fontSize:'1.2rem'}}>✓</div>}
              </div>
            ))}

            {/* Opción: jugador nuevo */}
            <div className={`player-row ${selectedSlot==='new'?'active':''}`}
              style={{cursor:'pointer',marginBottom:16,borderStyle:'dashed',borderColor:selectedSlot==='new'?'rgba(0,245,255,.5)':'rgba(255,255,255,.15)'}}
              onClick={()=>{snd('tap');setSelectedSlot('new');}}>
              <div className="player-emoji">➕</div>
              <div className="player-name" style={{color:'rgba(255,255,255,.5)'}}>Soy un jugador nuevo</div>
              {selectedSlot==='new'&&<div style={{color:'var(--cyan)',fontSize:'1.2rem'}}>✓</div>}
            </div>

            {/* Formulario para jugador nuevo */}
            {selectedSlot==='new'&&(
              <div className="anim-fade" style={{marginBottom:16}}>
                <div style={{display:'flex',alignItems:'center',gap:12,background:'rgba(0,245,255,.05)',border:'1px solid rgba(0,245,255,.15)',borderRadius:14,padding:'12px 14px',marginBottom:12,cursor:'pointer'}}
                  onClick={()=>setPickMode('emoji')}>
                  <div style={{fontSize:'2rem'}}>{emoji}</div>
                  <div style={{width:14,height:14,borderRadius:'50%',background:color,border:'2px solid rgba(255,255,255,.2)'}}/>
                  <div style={{flex:1,fontFamily:'var(--font-body)',fontWeight:700,fontSize:'var(--fs-sm)',color:color}}>
                    {name||'Tu nombre aquí'}
                  </div>
                  <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(0,245,255,.5)',letterSpacing:2}}>EDITAR ›</div>
                </div>
                <input className="os-input" placeholder="Tu nombre..." value={name}
                  onChange={e=>setName(e.target.value)} maxLength={20}/>
              </div>
            )}

            {error&&<div className="os-alert alert-red">{error}</div>}

            <button className="btn btn-cyan"
              disabled={!selectedSlot||(selectedSlot==='new'&&!name.trim())||loading}
              onClick={handleJoin}>
              {loading?'⏳ Entrando...':`🚪 ${selectedSlot==='new'?'Unirse como '+name:selectedSlot&&roomData.players?.find(p=>p.id===selectedSlot)?.name?'Soy '+roomData.players.find(p=>p.id===selectedSlot).name:'Unirse'}`}
            </button>
            <button className="btn btn-ghost" onClick={()=>{setStep('code');setRoomData(null);setSelectedSlot(null);}}>← Cambiar sala</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── STATS SCREEN ────────────────────────────────────────────────
function StatsScreen({onBack,db}){
  const [tab,setTab]=useState('leaderboard');
  const [players,setPlayers]=useState([]);
  const [sessions,setSessions]=useState([]);
  const [loading,setLoading]=useState(true);
  const [selectedPlayer,setSelectedPlayer]=useState(null);

  useEffect(()=>{
    async function load(){
      setLoading(true);
      try{
        const [lb,sess]=await Promise.all([loadLeaderboard(false),loadRecentSessions(30,false)]);
        setPlayers(lb);setSessions(sess);
      }catch(e){console.error(e);}
      finally{setLoading(false);}
    }
    load();
  },[]);

  if(selectedPlayer){
    const p=selectedPlayer;
    const winRate=p.games>0?Math.round((p.wins/p.games)*100):0;
    return(
      <div className="os-wrap">
        <div className="os-header">
          <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={()=>setSelectedPlayer(null)}>← Ranking</button>
          <div style={{fontFamily:'var(--font-label)',fontSize:'.75rem',fontWeight:700,color:'rgba(255,255,255,.4)',letterSpacing:3}}>PERFIL DE JUGADOR</div>
          <div style={{width:70}}/>
        </div>
        <div className="os-page" style={{paddingTop:20}}>
          <div style={{textAlign:'center',marginBottom:20}}>
            <div style={{fontSize:'3.8rem',marginBottom:6}}>{p.emoji}</div>
            <div style={{fontFamily:'var(--font-display)',fontSize:'1.7rem',letterSpacing:2,color:p.color||'#fff'}}>{p.name}</div>
            <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',fontWeight:600,color:'rgba(255,255,255,.35)',letterSpacing:2,marginTop:4}}>
              Última: {p.lastGameTitle||'—'}
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:20}}>
            {[
              {label:'PARTIDAS',value:p.games||0,color:'var(--cyan)'},
              {label:'VICTORIAS',value:p.wins||0,color:'var(--gold)'},
              {label:'WIN RATE',value:winRate+'%',color:'var(--green)'},
              {label:'MEJOR POS.',value:'#'+(p.bestPosition||'—'),color:'var(--orange)'},
              {label:'PROM. SUPERV.',value:p.avgSurvivalMs?fmtDuration(p.avgSurvivalMs):'—',color:'var(--purple)'},
              {label:'💀 PRIMERO ELIM.',value:p.firstEliminations||0,color:'var(--red)'},
            ].map(s=>(
              <div key={s.label} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:'13px 14px',textAlign:'center'}}>
                <div style={{fontFamily:'var(--font-display)',fontSize:'1.7rem',color:s.color,marginBottom:3}}>{s.value}</div>
                <div style={{fontFamily:'var(--font-ui)',fontSize:'.5rem',fontWeight:700,color:'rgba(255,255,255,.3)',letterSpacing:2}}>{s.label}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-ghost" onClick={()=>setSelectedPlayer(null)}>← Volver al ranking</button>
        </div>
      </div>
    );
  }

  return(
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onBack}>← Home</button>
        <div className="os-logo" style={{fontSize:'1.1rem'}}>STATS <span>OS</span></div>
        <div style={{width:70}}/>
      </div>
      <div className="os-page" style={{paddingTop:16}}>
        <div style={{display:'flex',gap:6,marginBottom:16}}>
          {[['leaderboard','🏆 Ranking'],['sessions','🎮 Partidas']].map(([id,lbl])=>(
            <button key={id} style={{
              flex:1,border:'none',borderRadius:10,padding:'10px 4px',cursor:'pointer',
              fontFamily:'var(--font-ui)',fontSize:'var(--fs-micro)',letterSpacing:1,transition:'all .18s',
              background:tab===id?'linear-gradient(135deg,var(--cyan),#00B8CC)':'rgba(255,255,255,.06)',
              color:tab===id?'var(--bg)':'rgba(255,255,255,.4)',
            }} onClick={()=>{snd('tap');setTab(id);}}>
              {lbl}
            </button>
          ))}
        </div>

        {loading&&<div style={{textAlign:'center',paddingTop:40}}><div className="os-spin" style={{marginBottom:14}}/></div>}

        {!loading&&tab==='leaderboard'&&(
          <>
            {players.length===0&&<div className="os-empty"><div style={{fontSize:'2.5rem',marginBottom:10}}>📊</div><div>Completa una partida para ver el ranking</div></div>}
            {players.map((p,i)=>{
              const winRate=p.games>0?Math.round((p.wins/p.games)*100):0;
              return(
                <div key={p.pKey||i} className={`stat-card ${i===0?'gold-border':''}`}
                  onClick={()=>{snd('tap');setSelectedPlayer(p);}}>
                  <div className="stat-rank">{i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}</div>
                  <div style={{fontSize:'1.7rem'}}>{p.emoji}</div>
                  <div style={{flex:1}}>
                    <div className="stat-name" style={{color:p.color||'#fff'}}>{p.name}</div>
                    <div className="stat-meta">
                      {p.games||0} partidas · {winRate}% wins
                      {p.firstEliminations>0&&` · 💀 ×${p.firstEliminations}`}
                    </div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div className="stat-value" style={{color:i===0?'var(--gold)':'rgba(255,255,255,.5)'}}>{p.wins||0}</div>
                    <div style={{fontFamily:'var(--font-ui)',fontSize:'.48rem',color:'rgba(255,255,255,.25)',letterSpacing:1}}>🏆 WINS</div>
                  </div>
                  <div style={{color:'rgba(255,255,255,.2)',fontSize:'.95rem'}}>›</div>
                </div>
              );
            })}
          </>
        )}

        {!loading&&tab==='sessions'&&(
          <>
            {sessions.length===0&&<div className="os-empty"><div style={{fontSize:'2.5rem',marginBottom:10}}>🎮</div><div>Sin partidas registradas aún</div></div>}
            {sessions.map((s,i)=>(
              <div key={s.sessionId||i} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:13,padding:'13px 15px',marginBottom:8}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:'var(--fs-sm)',display:'flex',alignItems:'center',gap:6}}>
                      <span>{s.gameType==='preset:strike'?'🎳':'⚔️'}</span>
                      {s.customTitle||s.gameTitle}
                    </div>
                    <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',fontWeight:600,color:'rgba(255,255,255,.35)',letterSpacing:1,marginTop:2}}>
                      {fmtDate(s.startedAt)} · {fmtDuration(s.durationMs)}
                    </div>
                  </div>
                  <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',fontWeight:700,color:'rgba(255,255,255,.3)',background:'rgba(255,255,255,.06)',padding:'3px 9px',borderRadius:20,letterSpacing:1}}>
                    {s.playerCount||0} jug.
                  </div>
                </div>
                {(s.players||[]).slice(0,3).map((p,pi)=>(
                  <div key={p.id||pi} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0',borderBottom:'1px solid rgba(255,255,255,.04)'}}>
                    <div style={{fontFamily:'var(--font-display)',fontSize:'.95rem',width:22,color:'rgba(255,255,255,.25)'}}>
                      {pi===0?'🥇':pi===1?'🥈':'🥉'}
                    </div>
                    <div style={{fontSize:'1.05rem'}}>{p.emoji}</div>
                    <div style={{fontWeight:800,flex:1,fontSize:'var(--fs-sm)',color:p.color||'#fff'}}>{p.name}</div>
                    <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',fontWeight:600,color:'rgba(255,255,255,.4)'}}>
                      {p.survivalLabel&&`⏱ ${p.survivalLabel}`}
                      {p.points&&`${p.points}pts`}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
