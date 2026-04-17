// ═══════════════════════════════════════════════════════════════
// generic.jsx — BOARDGAMEZ OS v1.4
// Fixes: ganador automático, modal inline, revancha,
//        condiciones de victoria, puntos default 0,
//        marcador animado
// ═══════════════════════════════════════════════════════════════

// ── INLINE CONFIRM MODAL ─────────────────────────────────────────
function ConfirmModal({title,message,onConfirm,onCancel,confirmLabel='Confirmar',confirmColor='var(--red)'}){
  return(
    <div style={{
      position:'fixed',inset:0,zIndex:999,
      background:'rgba(0,0,0,.7)',backdropFilter:'blur(4px)',
      display:'flex',alignItems:'center',justifyContent:'center',padding:20
    }}>
      <div className="anim-pop" style={{
        background:'#0D0D1C',border:'1px solid rgba(0,245,255,.25)',
        borderRadius:20,padding:'24px 20px',width:'100%',maxWidth:340,textAlign:'center'
      }}>
        {title&&<div style={{fontFamily:'var(--font-display)',fontSize:'1.2rem',letterSpacing:1,marginBottom:10,color:'#fff'}}>{title}</div>}
        <div style={{fontFamily:'var(--font-body)',fontSize:'var(--fs-sm)',color:'rgba(255,255,255,.6)',lineHeight:1.5,marginBottom:20}}>{message}</div>
        <div style={{display:'flex',gap:10}}>
          <button className="btn btn-ghost" style={{flex:1,marginBottom:0}} onClick={onCancel}>Cancelar</button>
          <button className="btn" style={{flex:1,marginBottom:0,background:confirmColor,color:'white',border:'none',borderRadius:12,padding:14,fontFamily:'var(--font-display)',fontSize:'var(--fs-sm)',cursor:'pointer'}}
            onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ── PLAYER PICKER ────────────────────────────────────────────────
function PlayerPicker_G({player,onUpdate,onClose}){
  const [mode,setMode]=React.useState('emoji');
  return(
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onClose}>← Listo</button>
        <div style={{fontFamily:'var(--font-label)',fontSize:'.75rem',fontWeight:700,color:'rgba(255,255,255,.5)',letterSpacing:3}}>{player.name.toUpperCase()}</div>
        <div style={{width:70}}/>
      </div>
      <div className="os-page" style={{paddingTop:16}}>
        <div style={{display:'flex',gap:6,marginBottom:16}}>
          {['emoji','color'].map(m=>(
            <button key={m} className="btn btn-ghost btn-sm" style={{flex:1,background:mode===m?'var(--cyan)':undefined,color:mode===m?'var(--bg)':undefined,border:mode===m?'none':undefined}}
              onClick={()=>setMode(m)}>
              {m==='emoji'?'🐉 Emoji':'🎨 Color'}
            </button>
          ))}
        </div>
        {mode==='emoji'&&<div className="picker-grid">{EMOJIS.map((e,i)=><div key={i} className={`picker-item ${player.emoji===e?'sel':''}`} onClick={()=>{snd('tap');onUpdate('emoji',e);}}>{e}</div>)}</div>}
        {mode==='color'&&<div style={{display:'flex',flexWrap:'wrap',gap:10,padding:'8px 0'}}>{COLORS.map((c,i)=><div key={i} className={`color-dot ${player.color===c?'sel':''}`} style={{background:c}} onClick={()=>{snd('tap');onUpdate('color',c);}}/>)}</div>}
      </div>
    </div>
  );
}

// ── CONFIG PANEL ─────────────────────────────────────────────────
function ConfigPanel({config,onChange}){
  const ROUND_OPTIONS=Array.from({length:20},(_,i)=>i+1).concat(['libre']);
  const [newCondition,setNewCondition]=React.useState('');

  function addCondition(){
    if(!newCondition.trim()) return;
    snd('tap');
    onChange({...config,winConditions:[...(config.winConditions||[]),newCondition.trim()]});
    setNewCondition('');
  }
  function removeCondition(i){
    snd('tap');
    const arr=[...(config.winConditions||[])];
    arr.splice(i,1);
    onChange({...config,winConditions:arr});
  }

  return(
    <div>
      <div className="os-section">MODO DE PARTIDA</div>
      {[
        {id:'points',icon:'🏅',label:'Puntos acumulados',desc:'Gana quien llegue a la meta o tenga más al final'},
        {id:'wins',icon:'🏆',label:'Victorias por ronda',desc:'Se cuentan victorias de ronda, no puntos'},
        {id:'survival',icon:'💀',label:'Supervivencia / Eliminación',desc:'Se eliminan jugadores hasta que queda uno'}
      ].map(m=>(
        <div key={m.id} className="os-card" style={{marginBottom:8,padding:'13px 14px',cursor:'pointer',
          borderColor:config.mode===m.id?'rgba(0,245,255,.5)':undefined,
          background:config.mode===m.id?'rgba(0,245,255,.07)':undefined}}
          onClick={()=>{snd('tap');onChange({...config,mode:m.id});}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{fontSize:'1.9rem'}}>{m.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:'var(--font-display)',fontSize:'1rem',letterSpacing:1,color:config.mode===m.id?'var(--cyan)':'#fff'}}>{m.label}</div>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',fontWeight:600,color:'rgba(255,255,255,.4)',letterSpacing:1,marginTop:2}}>{m.desc}</div>
            </div>
            {config.mode===m.id&&<div style={{color:'var(--cyan)',fontSize:'1.3rem'}}>✓</div>}
          </div>
        </div>
      ))}

      {/* CONDICIONES DE VICTORIA PERSONALIZADAS */}
      <div className="os-section" style={{marginTop:6}}>CONDICIONES DE VICTORIA (OPCIONAL)</div>
      <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(255,255,255,.4)',marginBottom:10}}>
        Ej: Full house, Corrida, Escalera... Al registrar una ronda podrás seleccionar cómo ganaste.
      </div>
      {(config.winConditions||[]).map((c,i)=>(
        <div key={i} style={{display:'flex',alignItems:'center',gap:8,background:'rgba(255,212,71,.06)',border:'1px solid rgba(255,212,71,.2)',borderRadius:10,padding:'8px 12px',marginBottom:6}}>
          <div style={{flex:1,fontFamily:'var(--font-body)',fontWeight:700,fontSize:'var(--fs-sm)',color:'var(--gold)'}}>{c}</div>
          <button style={{background:'none',border:'none',color:'rgba(255,59,92,.5)',fontSize:'1.1rem',cursor:'pointer'}} onClick={()=>removeCondition(i)}>×</button>
        </div>
      ))}
      <div style={{display:'flex',gap:8,marginBottom:16}}>
        <input className="os-input" style={{marginBottom:0,flex:1}}
          placeholder="Ej: Full house, Corrida, Flush..."
          value={newCondition} onChange={e=>setNewCondition(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&addCondition()} maxLength={30}/>
        <button style={{background:'rgba(255,212,71,.1)',border:'1px solid rgba(255,212,71,.3)',color:'var(--gold)',borderRadius:11,padding:'0 16px',cursor:'pointer',fontFamily:'var(--font-display)',fontSize:'1.1rem',flexShrink:0}}
          onClick={addCondition}>+</button>
      </div>

      <div className="os-section" style={{marginTop:6}}>RONDAS</div>
      <div className={`check-row ${config.useRounds?'active':''}`} style={{marginBottom:8}}
        onClick={()=>{snd('tap');onChange({...config,useRounds:!config.useRounds});}}>
        <div className="check-box">{config.useRounds?'✓':''}</div>
        <div>
          <div className="check-label">¿Número de rondas definido?</div>
          <div className="check-sub">Si no, es libre hasta cerrar manualmente</div>
        </div>
      </div>
      {config.useRounds&&(
        <select className="os-select" value={config.rounds||3}
          onChange={e=>{snd('tap');onChange({...config,rounds:e.target.value==='libre'?'libre':parseInt(e.target.value)});}}>
          {ROUND_OPTIONS.map(r=>(
            <option key={r} value={r}>{r==='libre'?'∞ Libre':r+' ronda'+(r>1?'s':'')}</option>
          ))}
        </select>
      )}

      {config.mode==='points'&&(
        <>
          <div className="os-section" style={{marginTop:6}}>META DE PUNTOS</div>
          <div className={`check-row ${config.useTarget?'active':''}`} style={{marginBottom:8}}
            onClick={()=>{snd('tap');onChange({...config,useTarget:!config.useTarget});}}>
            <div className="check-box">{config.useTarget?'✓':''}</div>
            <div>
              <div className="check-label">¿Con meta de puntos?</div>
              <div className="check-sub">Si no, gana quien más tenga al cerrar</div>
            </div>
          </div>
          {config.useTarget&&(
            <input className="os-input" type="number" min="1" max="99999"
              placeholder="Meta (ej: 200)"
              value={config.targetScore||''}
              onChange={e=>onChange({...config,targetScore:Math.min(99999,parseInt(e.target.value)||0)})}/>
          )}
        </>
      )}
    </div>
  );
}

// ── GENERIC SETUP ────────────────────────────────────────────────
function GenericSetup({onBack,hostPlayer,onCreateRoom}){
  const [step,setStep]=React.useState('name');
  const [title,setTitle]=React.useState('');
  const [players,setPlayers]=React.useState([]);
  const [newName,setNewName]=React.useState('');
  const [pickingFor,setPickingFor]=React.useState(null);
  const [config,setConfig]=React.useState({mode:'points',useRounds:true,rounds:3,useTarget:true,targetScore:100,winConditions:[]});
  const [savedConfigs]=React.useState(()=>{
    try{return JSON.parse(localStorage.getItem('bgos_saved_configs')||'[]');}catch{return [];}
  });
  const [saveName,setSaveName]=React.useState('');
  const [showSaveForm,setShowSaveForm]=React.useState(false);

  React.useEffect(()=>{
    if(hostPlayer&&hostPlayer.name&&hostPlayer.name!=='Host'){
      setPlayers([{...hostPlayer,isHost:true}]);
    }
  },[]);

  function addPlayer(){
    if(!newName.trim()) return;
    snd('join');
    const idx=players.length%EMOJIS.length;
    const cidx=players.length%COLORS.length;
    setPlayers(prev=>[...prev,{id:uid(),name:newName.trim(),emoji:EMOJIS[idx],color:COLORS[cidx]}]);
    setNewName('');
  }
  function updatePlayer(id,f,v){ setPlayers(prev=>prev.map(p=>p.id===id?{...p,[f]:v}:p)); }

  function handleSaveConfig(){
    if(!saveName.trim()) return;
    snd('save');
    const configs=savedConfigs;
    const id='cfg_'+uid();
    configs.unshift({id,name:saveName.trim(),config,savedAt:Date.now()});
    localStorage.setItem('bgos_saved_configs',JSON.stringify(configs.slice(0,10)));
    setSaveName('');setShowSaveForm(false);
  }

  if(pickingFor!==null){
    const p=players.find(pl=>pl.id===pickingFor);
    if(!p){setPickingFor(null);return null;}
    return <PlayerPicker_G player={p} onUpdate={(f,v)=>updatePlayer(p.id,f,v)} onClose={()=>setPickingFor(null)}/>;
  }

  return(
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-back btn-sm" style={{width:'auto'}} onClick={onBack}>← Atrás</button>
        <div className="os-logo" style={{fontSize:'1rem'}}>PARTIDA <span>LIBRE</span></div>
        <div style={{fontFamily:'var(--font-ui)',fontSize:'.58rem',color:'rgba(0,245,255,.5)',letterSpacing:2}}>
          {step==='name'?'1/3':step==='players'?'2/3':'3/3'}
        </div>
      </div>

      <div className="os-page" style={{paddingTop:16}}>
        {step==='name'&&(
          <div className="anim-fade">
            <div className="os-section">NOMBRE DE LA PARTIDA</div>
            <div style={{background:'rgba(0,245,255,.04)',border:'1px solid rgba(0,245,255,.15)',borderRadius:14,padding:16,marginBottom:16,textAlign:'center'}}>
              <div style={{fontSize:'3rem',marginBottom:6}}>⚔️</div>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-sm)',fontWeight:700,color:'rgba(255,255,255,.5)',letterSpacing:2}}>¿QUÉ ESTÁN JUGANDO?</div>
            </div>
            <input className="os-input" placeholder="Ej: Catan del sábado, Poker brutal..."
              value={title} onChange={e=>setTitle(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&title.trim().length>=2&&setStep('players')}
              autoFocus maxLength={40}/>
            <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.3)',textAlign:'right',marginBottom:16}}>{title.length}/40</div>
            <div className="os-section">SUGERENCIAS</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:20}}>
              {['Catan','UNO','Dominó','Poker','Lotería','Truco','Parqués','Mahjong'].map(s=>(
                <button key={s} style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.12)',color:'rgba(255,255,255,.55)',borderRadius:20,padding:'6px 13px',cursor:'pointer',fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',fontWeight:600,letterSpacing:1}}
                  onClick={()=>{snd('tap');setTitle(s);}}>
                  {s}
                </button>
              ))}
            </div>
            <button className="btn btn-cyan" disabled={title.trim().length<2} onClick={()=>{snd('tap');setStep('players');}}>
              Siguiente → Jugadores
            </button>
            <button className="btn btn-back" onClick={onBack}>← Cancelar</button>
          </div>
        )}

        {step==='players'&&(
          <div className="anim-fade">
            <div className="os-section">JUGADORES · {players.length}</div>
            {players.map(p=>(
              <div key={p.id} className="player-row" style={{marginBottom:8}}>
                <div className="player-emoji" style={{cursor:'pointer'}} onClick={()=>{snd('tap');setPickingFor(p.id);}}>{p.emoji}</div>
                <div style={{width:13,height:13,borderRadius:'50%',background:p.color,border:'2px solid rgba(255,255,255,.2)',flexShrink:0,cursor:'pointer'}} onClick={()=>{snd('tap');setPickingFor(p.id);}}/>
                <div className="player-name" style={{color:p.color}}>
                  {p.name}{p.isHost&&<span style={{fontFamily:'var(--font-ui)',fontSize:'.5rem',color:'var(--gold)',letterSpacing:2,marginLeft:6}}>HOST</span>}
                </div>
                {!p.isHost&&<button style={{background:'none',border:'none',color:'rgba(255,59,92,.5)',fontSize:'1.2rem',cursor:'pointer',padding:'0 4px'}} onClick={()=>setPlayers(prev=>prev.filter(pl=>pl.id!==p.id))}>×</button>}
              </div>
            ))}
            <div style={{display:'flex',gap:8,marginBottom:8}}>
              <input className="os-input" style={{marginBottom:0,flex:1}} placeholder="Agregar jugador..."
                value={newName} onChange={e=>setNewName(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&addPlayer()} maxLength={20}/>
              <button style={{background:'rgba(0,245,255,.1)',border:'1px solid rgba(0,245,255,.3)',color:'var(--cyan)',borderRadius:11,padding:'0 18px',cursor:'pointer',fontFamily:'var(--font-display)',fontSize:'1.1rem',flexShrink:0}} onClick={addPlayer}>+</button>
            </div>
            {players.length<2&&<div className="os-alert alert-cyan" style={{marginBottom:12}}>Agrega al menos 2 jugadores</div>}
            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-back" style={{flex:.5}} onClick={()=>setStep('name')}>← Atrás</button>
              <button className="btn btn-cyan" style={{flex:1}} disabled={players.length<2}
                onClick={()=>{snd('tap');setStep('config');}}>
                Siguiente → Config
              </button>
            </div>
          </div>
        )}

        {step==='config'&&(
          <div className="anim-fade">
            {savedConfigs.length>0&&(
              <>
                <div className="os-section">CONFIGS GUARDADAS</div>
                {savedConfigs.map(sc=>(
                  <div key={sc.id} className="saved-config" onClick={()=>{snd('tap');setConfig({...sc.config});}}>
                    <div style={{fontSize:'1.5rem'}}>💾</div>
                    <div className="saved-config-info">
                      <div className="saved-config-title">{sc.name}</div>
                      <div className="saved-config-meta">{sc.config?.mode==='points'?'Puntos':sc.config?.mode==='wins'?'Victorias':'Supervivencia'}</div>
                    </div>
                  </div>
                ))}
                <div className="os-divider"/>
              </>
            )}

            <ConfigPanel config={config} onChange={setConfig}/>

            <div className="os-section" style={{marginTop:8}}>GUARDAR CONFIGURACIÓN</div>
            {!showSaveForm?(
              <button className="btn btn-gold" onClick={()=>setShowSaveForm(true)}>💾 Guardar esta config para después</button>
            ):(
              <div style={{display:'flex',gap:8,marginBottom:8}}>
                <input className="os-input" style={{marginBottom:0,flex:1}}
                  placeholder="Nombre de la config..." value={saveName}
                  onChange={e=>setSaveName(e.target.value)} maxLength={30}
                  onKeyDown={e=>e.key==='Enter'&&handleSaveConfig()}/>
                <button style={{background:'rgba(155,93,229,.2)',border:'1px solid rgba(155,93,229,.4)',color:'var(--purple)',borderRadius:11,padding:'0 14px',cursor:'pointer',fontFamily:'var(--font-display)',fontSize:'var(--fs-xs)',flexShrink:0}}
                  onClick={handleSaveConfig}>💾</button>
                <button style={{background:'none',border:'1px solid rgba(255,255,255,.1)',color:'rgba(255,255,255,.4)',borderRadius:11,padding:'0 12px',cursor:'pointer',flexShrink:0}}
                  onClick={()=>{setShowSaveForm(false);setSaveName('');}}>×</button>
              </div>
            )}
            <div className="g8"/>
            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-back" style={{flex:.5}} onClick={()=>setStep('players')}>← Atrás</button>
              <button className="btn btn-cyan" style={{flex:1}}
                onClick={()=>{snd('round');onCreateRoom({title,players,config});}}>🚀 Crear sala</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── GENERIC LOBBY ────────────────────────────────────────────────
function GenericLobby({session,onBack,onStart,isHost,myId,db}){
  const [room,setRoom]=React.useState(null);
  React.useEffect(()=>{
    const unsub=db.listen(`rooms/${session.code}`,data=>{if(data)setRoom(data);});
    return()=>unsub&&unsub();
  },[session.code]);
  React.useEffect(()=>{if(room?.status==='active')onStart();},[room?.status]);

  const players=room?.players||[];
  const config=room?.config||{};
  const effectiveIsHost=isHost||(room?.hostId&&room?.hostId===myId);
  const [presence,setPresence]=React.useState({});
  React.useEffect(()=>{
    if(!session?.code||!myId) return;
    setupPresence(session.code,myId);
    const unsub=listenPresence(session.code,setPresence);
    return ()=>{ teardownPresence(); unsub&&unsub(); };
  },[session?.code,myId]);

  async function startGame(){
    snd('round');
    const now=Date.now();
    await db.set(`rooms/${session.code}`,{...room,status:'active',startedAt:now,currentRound:1,rounds:[],events:[{type:'match_start',ts:now}]});
  }

  return(
    <div className="os-wrap">
      <div className="os-header">
        <div><div className="os-logo">BOARD<span>GAMEZ</span></div><div className="os-logo-sub">OS · {(room?.customTitle||'PARTIDA').toUpperCase()}</div></div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div className="room-code-badge">{session.code}</div>
          <div className="os-tag cyan">LOBBY</div>
        </div>
      </div>
      <div className="os-page" style={{paddingTop:16}}>
        <div className="lobby-display anim-pop">
          <div style={{fontFamily:'var(--font-ui)',fontSize:'.58rem',letterSpacing:4,color:'rgba(0,245,255,.5)',marginBottom:6}}>CÓDIGO DE SALA</div>
          <div className="lobby-code">{session.code}</div>
          <div className="lobby-hint">COMPARTE PARA UNIRSE</div>
        </div>
        {config&&(
          <div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'center',marginBottom:16}}>
            <div className="os-tag cyan">{config.mode==='points'?'🏅 Puntos':config.mode==='wins'?'🏆 Victorias':'💀 Supervivencia'}</div>
            {config.useRounds&&<div className="os-tag">{config.rounds==='libre'?'∞ Libre':`${config.rounds} rondas`}</div>}
            {config.mode==='points'&&config.useTarget&&<div className="os-tag gold">Meta: {config.targetScore}pts</div>}
            {(config.winConditions||[]).length>0&&<div className="os-tag gold">🏆 {config.winConditions.length} condiciones</div>}
          </div>
        )}
        <div className="os-section">JUGADORES · {players.length}</div>
        {players.map((p,i)=>{
          const prs=presence[p.id];
          const st=p.id===room?.hostId&&!prs?'online':(!prs?'pending':prs.status);
          const col=getPresenceColor(st);
          return(
            <div key={p.id} className="player-row active anim-fade" style={{animationDelay:i*.06+'s'}}>
              <div className="player-emoji">{p.emoji}</div>
              <div className="player-name" style={{color:p.color||'#fff',display:'flex',alignItems:'center',gap:6}}>
                <span style={{width:8,height:8,borderRadius:'50%',background:col,flexShrink:0,
                  boxShadow:st!=='offline'?`0 0 6px ${col}`:'none',display:'inline-block'}}/>
                {p.name}
                {p.id===myId&&<span style={{fontFamily:'var(--font-ui)',fontSize:'.5rem',color:'var(--cyan)',letterSpacing:2,marginLeft:4}}>TÚ</span>}
              </div>
              {p.id===room?.hostId&&<div className="os-tag gold" style={{fontSize:'var(--fs-micro)'}}>HOST</div>}
            </div>
          );
        })}
        <div className="g16"/>
        {effectiveIsHost
          ? <button className="btn btn-cyan" onClick={startGame} disabled={players.length<2}>⚔️ INICIAR PARTIDA</button>
          : <div className="os-alert alert-cyan" style={{justifyContent:'center',textAlign:'center'}}>⏳ Esperando que el host inicie...</div>
        }
        <button className="btn btn-back" onClick={onBack}>← Volver</button>
      </div>
    </div>
  );
}

// ── GENERIC RUNTIME ──────────────────────────────────────────────
function GenericRuntime({session,onBack,isHost,myId,db}){
  const [room,setRoom]=React.useState(null);
  const [elapsed,setElapsed]=React.useState(0);
  // scoreInputs: default vacío, se trata como 0
  const [scoreInputs,setScoreInputs]=React.useState({});
  const [showEndScreen,setShowEndScreen]=React.useState(false);
  const [editingPlayer,setEditingPlayer]=React.useState(null);
  const [showElimConfirm,setShowElimConfirm]=React.useState(false);
  const [showEndConfirm,setShowEndConfirm]=React.useState(false);
  const [showCloseRoundConfirm,setShowCloseRoundConfirm]=React.useState(false);
  // Para condiciones de victoria
  const [selectedCondition,setSelectedCondition]=React.useState('');
  // Animación de posiciones previas
  const [prevPositions,setPrevPositions]=React.useState({});
  const timerRef=React.useRef(null);

  React.useEffect(()=>{
    const unsub=db.listen(`rooms/${session.code}`,data=>{
      if(data){
        // Guardar posiciones previas para animación
        if(data.players){
          const sorted=[...data.players].sort((a,b)=>(b.total||0)-(a.total||0));
          const newPos={};
          sorted.forEach((p,i)=>newPos[p.id]=i);
          setPrevPositions(newPos);
        }
        setRoom(data);
      }
    });
    return()=>unsub&&unsub();
  },[session.code]);

  React.useEffect(()=>{
    if(!room||room.status!=='active') return;
    const start=room.startedAt;
    timerRef.current=setInterval(()=>setElapsed(Date.now()-start),1000);
    return()=>clearInterval(timerRef.current);
  },[room?.status,room?.startedAt]);

  React.useEffect(()=>{if(room?.status==='finished')setShowEndScreen(true);},[room?.status]);

  if(!room) return(<div className="os-wrap"><div className="os-page" style={{paddingTop:80,textAlign:'center'}}><div className="os-spin" style={{marginBottom:16}}/></div></div>);

  const players=room.players||[];
  const config=room.config||{};
  const isFreeSessions=!config.useRounds||config.rounds==='libre';
  const totalRounds=isFreeSessions?null:parseInt(config.rounds)||null;
  const currentRound=room.currentRound||1;
  const isSurvival=config.mode==='survival';
  // Derivar isHost del room (sobrevive recargas)
  const effectiveIsHost=isHost||(room.hostId&&room.hostId===myId);
  const me=players.find(p=>p.id===myId);
  const alreadyElim=me?.eliminated;

  // Presencia
  const [presence,setPresence]=React.useState({});
  const [elimToast,setElimToast]=React.useState(null);
  React.useEffect(()=>{
    if(!session?.code||!myId) return;
    setupPresence(session.code,myId);
    const unsub=listenPresence(session.code,setPresence);
    return ()=>{ teardownPresence(); unsub&&unsub(); };
  },[session?.code,myId]);

  // Toast de eliminación broadcast
  React.useEffect(()=>{
    if(!session?.code) return;
    const unsub2=db.listen(`rooms/${session.code}/lastElim`,data=>{
      if(!data||!data.ts) return;
      if(Date.now()-data.ts>5000) return;
      setElimToast(data);
      setTimeout(()=>setElimToast(null),3000);
    });
    return ()=>unsub2&&unsub2();
  },[session?.code]);

  const winConditions=config.winConditions||[];

  // Auto-calcular ganador de ronda por puntos
  function autoWinner(){
    if(config.mode==='wins') return null; // en modo victorias, el host selecciona
    const active=players.filter(p=>!p.eliminated);
    let maxScore=-Infinity;
    let winnerId=null;
    active.forEach(p=>{
      const score=parseInt(scoreInputs[p.id]??0);
      if(score>maxScore){ maxScore=score; winnerId=p.id; }
    });
    return winnerId;
  }

  const sortedPlayers=[...players].sort((a,b)=>{
    if(isSurvival){
      if(!a.eliminated&&b.eliminated) return -1;
      if(a.eliminated&&!b.eliminated) return 1;
      return 0;
    }
    return config.mode==='wins'?(b.wins||0)-(a.wins||0):(b.total||0)-(a.total||0);
  });

  if(editingPlayer&&effectiveIsHost){
    const p=players.find(pl=>pl.id===editingPlayer);
    if(!p){setEditingPlayer(null);return null;}
    return <PlayerPicker_G player={p}
      onUpdate={async(f,v)=>{
        const updated=players.map(pl=>pl.id===p.id?{...pl,[f]:v}:pl);
        await db.set(`rooms/${session.code}/players`,updated);
      }}
      onClose={()=>setEditingPlayer(null)}/>;
  }

  // Auto-eliminación
  async function handleSelfElim(){
    snd('elim');
    const now=Date.now();
    const elimPlayers=players.filter(p=>p.eliminated);
    const survivalMs=now-room.startedAt;
    const updated=players.map(p=>{
      if(p.id!==myId) return p;
      return{...p,eliminated:true,eliminatedAt:now,survivalMs,
        survivalLabel:fmtDuration(survivalMs),
        eliminatedOrder:elimPlayers.length+1,
        finalPosition:players.length-elimPlayers.length};
    });
    const remaining=updated.filter(p=>!p.eliminated);
    let updates={players:updated};
    if(remaining.length===1){
      const winner=remaining[0];
      const winnerUpdated=updated.map(p=>p.id!==winner.id?p:{...p,finalPosition:1,survivalMs:now-room.startedAt,survivalLabel:fmtDuration(now-room.startedAt)});
      updates={players:winnerUpdated,status:'finished',endedAt:now,winner:{id:winner.id,name:winner.name,emoji:winner.emoji}};
      snd('victory');
      await _saveGenericSession(winnerUpdated,now,config);
    }
    await db.set(`rooms/${session.code}`,{...room,...updates});
    setShowElimConfirm(false);
  }

  // Cerrar ronda — ganador auto por puntos, manual en modo wins
  async function closeRound(overrideWinnerId){
    snd('round');
    const now=Date.now();
    const winnerId=overrideWinnerId||(config.mode!=='wins'?autoWinner():null);
    // Scores: default 0 si no se ingresó
    const scores=Object.fromEntries(players.map(p=>[p.id,parseInt(scoreInputs[p.id]??0)||0]));
    const updatedPlayers=players.map(p=>{
      const score=scores[p.id]||0;
      const isWinner=p.id===winnerId;
      return{...p,
        total:(p.total||0)+(config.mode!=='wins'?score:0),
        wins:(p.wins||0)+(isWinner?1:0),
        rounds:[...(p.rounds||[]),{
          round:currentRound,
          score:config.mode!=='wins'?score:0,
          won:isWinner,
          condition:selectedCondition||null,
          ts:now
        }]
      };
    });
    const newRound={
      number:currentRound,
      scores,
      winner:winnerId||null,
      condition:selectedCondition||null,
      closedAt:now
    };
    let finished=false,matchWinner=null;
    if(config.mode==='points'&&config.useTarget&&config.targetScore){
      matchWinner=updatedPlayers.find(p=>(p.total||0)>=parseInt(config.targetScore));
      if(matchWinner) finished=true;
    }
    if(!finished&&totalRounds&&currentRound>=totalRounds){
      finished=true;
      matchWinner=[...updatedPlayers].sort((a,b)=>config.mode==='wins'?(b.wins||0)-(a.wins||0):(b.total||0)-(a.total||0))[0];
    }
    const updates={players:updatedPlayers,rounds:[...(room.rounds||[]),newRound],currentRound:currentRound+1};
    if(finished){
      updates.status='finished';updates.endedAt=now;
      updates.winner={id:matchWinner?.id,name:matchWinner?.name,emoji:matchWinner?.emoji};
      snd('victory');
      await _saveGenericSession(updatedPlayers,now,config);
    }
    await db.set(`rooms/${session.code}`,{...room,...updates});
    setScoreInputs({});setSelectedCondition('');setShowCloseRoundConfirm(false);
  }

  async function endMatchNow(){
    const now=Date.now();
    const sorted=[...players].sort((a,b)=>config.mode==='wins'?(b.wins||0)-(a.wins||0):(b.total||0)-(a.total||0));
    await _saveGenericSession(players,now,config);
    await db.set(`rooms/${session.code}`,{...room,status:'finished',endedAt:now,
      winner:{id:sorted[0]?.id||'',name:sorted[0]?.name||'',emoji:sorted[0]?.emoji||''}});
    setShowEndConfirm(false);
  }

  async function _saveGenericSession(currentPlayers,now,cfg){
    const sorted=[...currentPlayers].sort((a,b)=>cfg.mode==='wins'?(b.wins||0)-(a.wins||0):(b.total||0)-(a.total||0));
    await saveSession({
      sessionId:session.code+"_"+room.startedAt,
      gameType:'generic',gameTitle:'⚔️ Partida Libre',
      customTitle:room.customTitle||'Partida Libre',
      startedAt:room.startedAt,endedAt:now,durationMs:now-room.startedAt,
      hostId:room.hostId,playerCount:currentPlayers.length,
      players:sorted.map((p,i)=>({
        id:p.id,name:p.name,emoji:p.emoji,color:p.color,
        finalPosition:i+1,eliminatedAt:p.eliminatedAt||null,
        survivalMs:p.survivalMs||(now-room.startedAt),
        survivalLabel:p.survivalLabel||fmtDuration(now-room.startedAt),
        points:p.total||0,wins:p.wins||0
      })),
      events:room.events||[]
    },session.demo);
  }

  if(showEndScreen) return <GenericEndScreen room={room} myId={myId} onBack={onBack} db={db} session={session}/>;

  // Ganador auto calculado en tiempo real para mostrar sugerencia
  const suggestedWinner = config.mode!=='wins' ? autoWinner() : null;

  return(
    <div className="os-wrap">
      {elimToast && (
        <div style={{position:'fixed',inset:0,zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}>
          <div style={{background:'linear-gradient(135deg,rgba(255,59,92,.95),rgba(180,0,40,.9))',border:'2px solid rgba(255,59,92,.6)',borderRadius:20,padding:'24px 32px',textAlign:'center',animation:'popIn .3s ease',boxShadow:'0 20px 60px rgba(255,59,92,.6)'}}>
            <div style={{fontSize:'3rem',marginBottom:8}}>{elimToast.emoji}</div>
            <div style={{fontFamily:'var(--font-display)',fontSize:'1.4rem',letterSpacing:2,color:'#fff',marginBottom:4}}>💀 ELIMINADO</div>
            <div style={{fontFamily:'var(--font-body)',fontWeight:700,fontSize:'1.1rem',color:'rgba(255,220,220,.9)'}}>{elimToast.name}</div>
          </div>
        </div>
      )}
      {/* Modales inline */}
      {showEndConfirm&&(
        <ConfirmModal
          title="¿Terminar partida?"
          message="Se calculará el ganador con los puntos actuales y se guardará el historial."
          confirmLabel="🏁 Terminar"
          onConfirm={endMatchNow}
          onCancel={()=>setShowEndConfirm(false)}
        />
      )}
      {showElimConfirm&&(
        <ConfirmModal
          title="¿Confirmas eliminación?"
          message="¿Te quedaste sin recursos? Esta acción registrará tu tiempo de supervivencia."
          confirmLabel="💀 Confirmar"
          onConfirm={handleSelfElim}
          onCancel={()=>setShowElimConfirm(false)}
        />
      )}

      {/* Header */}
      <div className="os-header">
        <div>
          <div className="os-logo">BOARD<span>GAMEZ</span></div>
          <div className="os-logo-sub">OS · {(room.customTitle||'PARTIDA').toUpperCase()}</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div className="room-code-badge">{session.code}</div>
          <div style={{textAlign:'right'}}>
            <div className="match-timer" style={{fontSize:'1.1rem'}}>{fmtDuration(elapsed)}</div>
            <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.3)',letterSpacing:1}}>
              R{currentRound}{totalRounds?`/${totalRounds}`:''}
            </div>
          </div>
        </div>
      </div>

      <div className="os-page" style={{paddingTop:16}}>

        {/* Botón eliminación survival */}
        {isSurvival&&me&&!alreadyElim&&(
          <div className="anim-slide" style={{marginBottom:16}}>
            <button className="btn-elim-big" onClick={()=>{snd('tap');setShowElimConfirm(true);}}>
              💀 ME ELIMINÉ
            </button>
          </div>
        )}
        {isSurvival&&alreadyElim&&(
          <div className="os-alert alert-red anim-fade" style={{marginBottom:16}}>
            💀 Eliminado en <strong>{me?.survivalLabel||'—'}</strong>
          </div>
        )}

        {/* MARCADOR ANIMADO */}
        <div className="os-section">MARCADOR</div>
        {sortedPlayers.map((p,i)=>{
          const isLeading=i===0&&!p.eliminated;
          return(
            <div key={p.id}
              className={`player-row ${isLeading?'winner-row':p.eliminated?'eliminated':''} anim-fade`}
              style={{
                animationDelay:i*.04+'s',marginBottom:6,
                cursor:effectiveIsHost?'pointer':'default',
                transition:'all .4s cubic-bezier(.34,1.56,.64,1)'
              }}
              onClick={()=>effectiveIsHost&&setEditingPlayer(p.id)}>
              <div className="player-pos" style={{
                color:isLeading?'var(--gold)':p.eliminated?'var(--red)':'rgba(255,255,255,.3)',
                transition:'color .3s'
              }}>
                {p.eliminated?'💀':i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}
              </div>
              <div className="player-emoji">{p.emoji}</div>
              <div style={{flex:1}}>
                <div className="player-name" style={{color:p.color||'#fff',display:'flex',alignItems:'center',gap:5}}>
                  <StatusDot pid={p.id} presence={presence} eliminated={p.eliminated}/>
                  {p.name}
                  {p.id===myId&&<span style={{fontFamily:'var(--font-ui)',fontSize:'.5rem',color:'var(--cyan)',letterSpacing:2,marginLeft:4}}>TÚ</span>}
                  {effectiveIsHost&&<span style={{fontFamily:'var(--font-ui)',fontSize:'.45rem',color:'rgba(255,255,255,.2)',marginLeft:5}}>✏️</span>}
                </div>
                {/* Última ronda */}
                {(p.rounds||[]).length>0&&(
                  <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.3)',letterSpacing:1,marginTop:1}}>
                    {config.mode!=='wins'
                      ? `Última: ${(p.rounds[p.rounds.length-1]?.score||0)>=0?'+':''}${p.rounds[p.rounds.length-1]?.score||0}pts`
                      : `${p.wins||0} victorias`
                    }
                    {p.rounds[p.rounds.length-1]?.condition&&(
                      <span style={{color:'var(--gold)',marginLeft:6}}>· {p.rounds[p.rounds.length-1].condition}</span>
                    )}
                  </div>
                )}
              </div>
              <div style={{textAlign:'right'}}>
                <div className="player-stat" style={{
                  color:isLeading?'var(--gold)':p.eliminated?'rgba(255,59,92,.5)':'rgba(255,255,255,.6)',
                  transition:'color .3s'
                }}>
                  {isSurvival?(p.eliminated?`#${p.finalPosition}`:'✓'):
                   config.mode==='wins'?(p.wins||0)+'🏆':(p.total||0)+'pts'}
                </div>
              </div>
            </div>
          );
        })}

        {/* PANEL HOST — SURVIVAL: eliminar jugadores */}
        {effectiveIsHost&&isSurvival&&(
          <div style={{
            background:'rgba(255,59,92,.05)',border:'1px solid rgba(255,59,92,.2)',
            borderRadius:14,padding:'12px 14px',marginBottom:14,marginTop:8
          }}>
            <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,59,92,.6)',letterSpacing:2,marginBottom:10}}>
              ⚙️ PANEL HOST — ELIMINAR JUGADOR
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {players.filter(p=>!p.eliminated).map(p=>(
                <div key={p.id} style={{display:'flex',alignItems:'center',gap:10,
                  background:'rgba(255,255,255,.03)',borderRadius:10,padding:'8px 12px'}}>
                  <div style={{fontSize:'1.3rem'}}>{p.emoji}</div>
                  <div style={{flex:1,fontFamily:'var(--font-body)',fontWeight:700,
                    fontSize:'var(--fs-sm)',color:p.color||'#fff'}}>
                    {p.name}
                    {p.id===myId&&<span style={{fontFamily:'var(--font-ui)',fontSize:'.5rem',color:'var(--cyan)',letterSpacing:2,marginLeft:5}}>TÚ</span>}
                  </div>
                  <button
                    style={{background:'rgba(255,59,92,.15)',border:'1px solid rgba(255,59,92,.3)',
                      color:'var(--red)',borderRadius:8,padding:'6px 12px',cursor:'pointer',
                      fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',fontWeight:700}}
                    onClick={async()=>{
                      snd('elim');
                      const now=Date.now();
                      const elimPlayers=players.filter(pl=>pl.eliminated);
                      const survivalMs=now-room.startedAt;
                      const updated=players.map(pl=>{
                        if(pl.id!==p.id) return pl;
                        return{...pl,eliminated:true,eliminatedAt:now,survivalMs,
                          survivalLabel:fmtDuration(survivalMs),
                          eliminatedOrder:elimPlayers.length+1,
                          finalPosition:players.length-elimPlayers.length};
                      });
                      const remaining=updated.filter(pl=>!pl.eliminated);
                      let upd={players:updated};
                      if(remaining.length===1){
                        const winner=remaining[0];
                        const wUpd=updated.map(pl=>pl.id!==winner.id?pl:{...pl,finalPosition:1,survivalMs:now-room.startedAt,survivalLabel:fmtDuration(now-room.startedAt)});
                        upd={players:wUpd,status:'finished',endedAt:now,winner:{id:winner.id,name:winner.name,emoji:winner.emoji}};
                        snd('victory');
                      }
                      // Broadcast para toast
                    await db.set(`rooms/${session.code}/lastElim`,{id:p.id,name:p.name,emoji:p.emoji,ts:Date.now()});
                    await db.set(`rooms/${session.code}`,{...room,...upd});
                    }}>
                    💀 Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PANEL HOST */}
        {effectiveIsHost&&!isSurvival&&(
          <>
            <div className="os-section" style={{marginTop:20}}>
              RONDA {currentRound}{totalRounds?` DE ${totalRounds}`:''}
            </div>
            <div className="round-box">
              {/* Puntos — default 0, el ganador se auto-calcula */}
              {config.mode!=='wins'&&(
                <>
                  <div className="round-box-title">PUNTOS DE ESTA RONDA</div>
                  {players.filter(p=>!p.eliminated).map(p=>{
                    const isAutoWinner=suggestedWinner===p.id;
                    return(
                      <div key={p.id} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10,
                        background:isAutoWinner?'rgba(255,212,71,.06)':'transparent',
                        borderRadius:10,padding:isAutoWinner?'4px 8px':'0 8px',
                        border:isAutoWinner?'1px solid rgba(255,212,71,.2)':'1px solid transparent',
                        transition:'all .3s'
                      }}>
                        <div style={{fontSize:'1.3rem',width:30}}>{p.emoji}</div>
                        <div style={{flex:1,fontFamily:'var(--font-body)',fontWeight:700,fontSize:'var(--fs-sm)',color:p.color||'#fff'}}>
                          {p.name}
                          {isAutoWinner&&<span style={{fontSize:'var(--fs-micro)',color:'var(--gold)',marginLeft:6}}>← ganador</span>}
                        </div>
                        <input type="number" className="os-input"
                          style={{width:90,marginBottom:0,textAlign:'center',padding:'10px 8px',
                            borderColor:isAutoWinner?'rgba(255,212,71,.4)':undefined}}
                          placeholder="0" min={config.scoreSign==='both'?undefined:0} max="99999"
                          value={scoreInputs[p.id]??''}
                          onChange={e=>setScoreInputs({...scoreInputs,[p.id]:e.target.value})}/>
                      </div>
                    );
                  })}
                  <div className="os-divider"/>
                </>
              )}

              {/* Condiciones de victoria — si hay definidas */}
              {winConditions.length>0&&(
                <>
                  <div className="round-box-title">¿CÓMO GANÓ? (OPCIONAL)</div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:12}}>
                    <button
                      style={{padding:'6px 12px',borderRadius:20,border:'1px solid rgba(255,255,255,.15)',
                        background:selectedCondition===''?'rgba(255,255,255,.1)':'rgba(255,255,255,.04)',
                        color:'rgba(255,255,255,.5)',cursor:'pointer',fontFamily:'var(--font-label)',
                        fontSize:'var(--fs-xs)',fontWeight:600,letterSpacing:1}}
                      onClick={()=>{snd('tap');setSelectedCondition('');}}>
                      Sin especificar
                    </button>
                    {winConditions.map((c,i)=>(
                      <button key={i}
                        style={{padding:'6px 12px',borderRadius:20,
                          border:`1px solid ${selectedCondition===c?'rgba(255,212,71,.5)':'rgba(255,255,255,.15)'}`,
                          background:selectedCondition===c?'rgba(255,212,71,.15)':'rgba(255,255,255,.04)',
                          color:selectedCondition===c?'var(--gold)':'rgba(255,255,255,.55)',
                          cursor:'pointer',fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',fontWeight:600,letterSpacing:1}}
                        onClick={()=>{snd('tap');setSelectedCondition(c);}}>
                        {c}
                      </button>
                    ))}
                  </div>
                  <div className="os-divider"/>
                </>
              )}

              {/* Ganador: auto en modo puntos, manual en victorias */}
              {config.mode==='wins'&&(
                <>
                  <div className="round-box-title">GANADOR DE ESTA RONDA</div>
                  {players.filter(p=>!p.eliminated).map(p=>(
                    <button key={p.id}
                      className="btn btn-ghost"
                      style={{marginBottom:8,justifyContent:'flex-start',gap:12,padding:'12px 14px'}}
                      onClick={()=>{snd('round');closeRound(p.id);}}>
                      <span style={{fontSize:'1.3rem'}}>{p.emoji}</span>
                      <span style={{color:p.color||'#fff',fontWeight:700}}>{p.name}</span>
                      <span style={{marginLeft:'auto',color:'var(--gold)',fontSize:'var(--fs-xs)'}}>🏆 Ganó esta ronda</span>
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Cerrar ronda — en modo puntos es automático */}
            {config.mode!=='wins'&&(
              <button style={{
                width:'100%',padding:'18px 20px',borderRadius:14,border:'2px solid rgba(0,255,157,.35)',
                background:'rgba(0,255,157,.15)',color:'var(--green)',cursor:'pointer',
                fontFamily:'var(--font-display)',fontSize:'1.1rem',letterSpacing:1,
                display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                boxShadow:'0 4px 16px rgba(0,255,157,.15)',marginBottom:8,
              }} onClick={()=>closeRound(null)}>
                <span style={{fontSize:'1.3rem'}}>✓</span>
                Cerrar ronda {currentRound}
                {suggestedWinner&&(
                  <span style={{fontSize:'var(--fs-sm)',opacity:.8}}>
                    · {players.find(p=>p.id===suggestedWinner)?.name}
                  </span>
                )}
              </button>
            )}

            <button style={{
              width:'100%',padding:'18px 20px',borderRadius:14,border:'2px solid rgba(255,59,92,.35)',
              background:'rgba(255,59,92,.15)',color:'var(--red)',cursor:'pointer',
              fontFamily:'var(--font-display)',fontSize:'1.1rem',letterSpacing:1,
              display:'flex',alignItems:'center',justifyContent:'center',gap:8,
              boxShadow:'0 4px 16px rgba(255,59,92,.15)',
            }} onClick={()=>{snd('tap');setShowEndConfirm(true);}}>
              <span style={{fontSize:'1.3rem'}}>🏁</span> Terminar partida
            </button>
          </>
        )}

        {effectiveIsHost&&isSurvival&&(
          <button style={{
            width:'100%',padding:'18px 20px',borderRadius:14,border:'2px solid rgba(255,59,92,.35)',
            background:'rgba(255,59,92,.15)',color:'var(--red)',cursor:'pointer',
            fontFamily:'var(--font-display)',fontSize:'1.1rem',letterSpacing:1,
            display:'flex',alignItems:'center',justifyContent:'center',gap:8,
            boxShadow:'0 4px 16px rgba(255,59,92,.15)',marginTop:8,
          }} onClick={()=>{snd('tap');setShowEndConfirm(true);}}>
            <span style={{fontSize:'1.3rem'}}>🏁</span> Terminar partida
          </button>
        )}

        {!effectiveIsHost&&(
          <div className="os-alert alert-cyan" style={{marginTop:16,justifyContent:'center',textAlign:'center'}}>
            ⏳ Esperando al host...
          </div>
        )}

        <div className="g16"/>
        <button className="btn btn-back" onClick={onBack}>← Volver al menú</button>
      </div>
    </div>
  );
}

// ── GENERIC END SCREEN — con revancha ────────────────────────────
function GenericEndScreen({room,myId,onBack,db,session}){
  const config=room.config||{};
  const [rematchLoading,setRematchLoading]=React.useState(false);
  const players=[...(room.players||[])].sort((a,b)=>
    config.mode==='wins'?(b.wins||0)-(a.wins||0):(b.total||0)-(a.total||0)
  );
  const winner=players[0];
  const totalDuration=room.endedAt&&room.startedAt?fmtDuration(room.endedAt-room.startedAt):'—';

  const confetti=Array.from({length:30},(_,i)=>({
    id:i,c:['#FFD447','#FF6B35','#00F5FF','#00FF9D','#9B5DE5'][i%5],
    l:Math.round(Math.random()*100)+"%",dl:Math.round(Math.random()*20)/10+"s",
    dr:Math.round((2+Math.random()*2.5)*10)/10+"s",sz:Math.round(6+Math.random()*8)+"px"
  }));
  React.useEffect(()=>{snd('victory');},[]);

  async function handleRematch(){
    if(!session||!db) return;
    snd('round');
    setRematchLoading(true);
    // Crear nueva sala con los mismos jugadores y config, reset de stats
    const newCode=uid4();
    const freshPlayers=room.players.map(p=>({
      ...p,total:0,wins:0,rounds:[],
      eliminated:false,finalPosition:null,survivalMs:null,
      eliminatedAt:null,survivalLabel:null
    }));
    await db.set(`rooms/${newCode}`,{
      code:newCode,
      gameType:room.gameType,
      customTitle:(room.customTitle||'Partida')+ ' (revancha)',
      status:'lobby',
      hostId:room.hostId,
      createdAt:Date.now(),
      config:room.config,
      players:freshPlayers,
      events:[],currentRound:1,rounds:[]
    });
    // Redirigir al lobby de la revancha — navegar al home y luego el host abre el nuevo lobby
    // Como workaround, guardamos el código en localStorage para que App lo detecte
    localStorage.setItem('bgos_rematch_code',newCode);
    window.location.reload();
  }

  return(
    <div className="end-screen">
      <div className="end-confetti">
        {confetti.map(d=><div key={d.id} style={{position:'absolute',background:d.c,width:d.sz,height:d.sz,left:d.l,top:-20,borderRadius:Math.random()>.5?'50%':'3px',animation:`confettiFall ${d.dr} ${d.dl} linear infinite`}}/>)}
      </div>
      <div className="end-trophy">🏆</div>
      <div className="end-label">CAMPEÓN</div>
      <div className="end-gamename">{(room.customTitle||'PARTIDA LIBRE').toUpperCase()}</div>
      {winner&&(
        <>
          <div style={{fontSize:'2.6rem',marginBottom:6}}>{winner.emoji}</div>
          <div className="end-winner-name" style={{color:winner.color||'#fff'}}>{winner.name}</div>
          <div className="end-stats">{config.mode==='wins'?`${winner.wins||0} VICTORIAS · ${totalDuration}`:`${winner.total||0} PUNTOS · ${totalDuration}`}</div>
        </>
      )}
      <div style={{width:'100%',maxWidth:380,marginBottom:20}}>
        {players.map((p,i)=>(
          <div key={p.id} className={`player-row ${i===0?'winner-row':''}`} style={{marginBottom:6}}>
            <div className="player-pos">{i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}</div>
            <div className="player-emoji">{p.emoji}</div>
            <div style={{flex:1}}>
              <div className="player-name" style={{color:p.color||'#fff'}}>
                {p.name}{p.id===myId&&<span style={{fontFamily:'var(--font-ui)',fontSize:'.5rem',color:'var(--cyan)',letterSpacing:2,marginLeft:5}}>TÚ</span>}
              </div>
            </div>
            <div className="player-stat" style={{color:i===0?'var(--gold)':'rgba(255,255,255,.55)'}}>
              {config.mode==='wins'?(p.wins||0)+'🏆':(p.total||0)+'pts'}
            </div>
          </div>
        ))}
      </div>
      <div style={{width:'100%',maxWidth:320,display:'flex',flexDirection:'column',gap:8}}>
        <button className="btn btn-cyan" style={{marginBottom:0}} disabled={rematchLoading}
          onClick={handleRematch}>
          {rematchLoading?'⏳ Creando revancha...':'🔁 REVANCHA — Mismos jugadores'}
        </button>
        <button className="btn btn-ghost" style={{marginBottom:0}} onClick={onBack}>🏠 Volver al menú</button>
      </div>
    </div>
  );
}
