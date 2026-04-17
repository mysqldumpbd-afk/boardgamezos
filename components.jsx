// ═══════════════════════════════════════════════════════════════
// components.jsx — BOARDGAMEZ OS v1.3
// Fixes: ProfileSetup, GameBuilder visible, LiveScoreboard,
//        botón eliminación grande, código sala siempre visible
// ═══════════════════════════════════════════════════════════════
const{useState,useEffect,useRef,useCallback}=React;

// ── PROFILE SETUP — se pide al crear la primera sala ────────────
function ProfileSetup({ onDone, onSkip, context }){
  const [name,setName]=useState('');
  const [emoji,setEmoji]=useState('🐉');
  const [color,setColor]=useState('#00F5FF');
  const [pickMode,setPickMode]=useState(null);

  const contextLabel = context==='strike' ? 'para jugar Strike 🎳'
    : context==='generic' ? 'para crear una partida'
    : '';

  function handleDone(){
    if(!name.trim()) return;
    snd('save');
    const profile={id:uid(),name:name.trim(),emoji,color,createdAt:Date.now()};
    saveProfile(profile);
    onDone(profile);
  }

  if(pickMode){
    return(
      <div className="os-wrap">
        <div className="os-header">
          <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={()=>setPickMode(null)}>← Listo</button>
          <div style={{fontFamily:'var(--font-label)',fontSize:'.75rem',fontWeight:700,color:'rgba(255,255,255,.5)',letterSpacing:3}}>TU AVATAR</div>
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
          {pickMode==='emoji'&&<div className="picker-grid">{EMOJIS.map((e,i)=><div key={i} className={`picker-item ${emoji===e?'sel':''}`} onClick={()=>{snd('tap');setEmoji(e);}}>{e}</div>)}</div>}
          {pickMode==='color'&&<div style={{display:'flex',flexWrap:'wrap',gap:10,padding:'8px 0'}}>{COLORS.map((c,i)=><div key={i} className={`color-dot ${color===c?'sel':''}`} style={{background:c}} onClick={()=>{snd('tap');setColor(c);}}/>)}</div>}
        </div>
      </div>
    );
  }

  return(
    <div className="os-wrap">
      <div className="os-header">
        <div><div className="os-logo">BOARD<span>GAMEZ</span></div><div className="os-logo-sub">OS · PERFIL</div></div>
        {onSkip&&(
          <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onSkip}>
            Ahora no
          </button>
        )}
      </div>
      <div className="os-page" style={{paddingTop:20}}>
        {/* Context banner */}
        {contextLabel&&(
          <div className="os-alert alert-cyan" style={{marginBottom:20,justifyContent:'center',textAlign:'center'}}>
            Configura tu perfil {contextLabel}
          </div>
        )}

        <div style={{textAlign:'center',marginBottom:24}}>
          <div style={{fontFamily:'var(--font-display)',fontSize:'1.8rem',letterSpacing:2,
            background:'linear-gradient(135deg,var(--cyan),var(--orange))',
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:6}}>
            ¿CÓMO TE LLAMAS?
          </div>
          <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-sm)',fontWeight:600,color:'rgba(255,255,255,.4)'}}>
            Tu nombre y avatar aparecerán en la partida
          </div>
        </div>

        {/* Avatar */}
        <div style={{textAlign:'center',marginBottom:20}}>
          <div className="profile-avatar" onClick={()=>setPickMode('emoji')}>{emoji}</div>
          <div style={{width:16,height:16,borderRadius:'50%',background:color,border:'3px solid rgba(255,255,255,.3)',margin:'0 auto 8px',cursor:'pointer'}}
            onClick={()=>setPickMode('color')}/>
          <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(0,245,255,.5)',letterSpacing:2}}>TOCA PARA PERSONALIZAR</div>
        </div>

        <div className="os-section">TU NOMBRE</div>
        <input className="os-input" placeholder="Tu nombre de jugador..."
          value={name} onChange={e=>setName(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&name.trim()&&handleDone()}
          autoFocus maxLength={20}/>

        <div className="g8"/>
        <button className="btn btn-cyan" disabled={!name.trim()} onClick={handleDone}>
          ✓ {contextLabel ? `Listo, crear sala` : 'Guardar perfil'}
        </button>
        <div style={{marginTop:12,fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.25)',textAlign:'center',letterSpacing:1}}>
          Puedes editarlo después desde el menú principal
        </div>
      </div>
    </div>
  );
}

// ── LIVE SCOREBOARD — marcador + historial de rondas ─────────────
function LiveScoreboard({ code, onBack, db }){
  const [room,setRoom]=useState(null);
  const [elapsed,setElapsed]=useState(0);
  const [tab,setTab]=useState('score');
  const [prevScores,setPrevScores]=useState({});
  const [changedIds,setChangedIds]=useState([]);
  const timerRef=useRef(null);

  useEffect(()=>{
    const unsub=db.listen(`rooms/${code}`,data=>{
      if(!data) return;
      // Detectar cambios de puntaje para animación
      if(data.players){
        const changed=[];
        data.players.forEach(p=>{
          const prev=prevScores[p.id];
          if(prev!==undefined&&(p.total||0)!==prev) changed.push(p.id);
        });
        if(changed.length){
          setChangedIds(changed);
          setTimeout(()=>setChangedIds([]),600);
        }
        const newScores={};
        data.players.forEach(p=>newScores[p.id]=(p.total||0));
        setPrevScores(newScores);
      }
      setRoom(data);
    });
    return()=>unsub&&unsub();
  },[code]);

  useEffect(()=>{
    if(!room||room.status!=='active') return;
    const start=room.startedAt;
    timerRef.current=setInterval(()=>setElapsed(Date.now()-start),1000);
    return()=>clearInterval(timerRef.current);
  },[room?.status,room?.startedAt]);

  if(!room) return(
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onBack}>← Atrás</button>
        <div className="room-code-badge">{code}</div>
        <div style={{width:70}}/>
      </div>
      <div className="os-page" style={{paddingTop:60,textAlign:'center'}}>
        <div className="os-spin" style={{marginBottom:16}}/>
        <div style={{fontFamily:'var(--font-label)',color:'rgba(255,255,255,.35)',letterSpacing:2}}>BUSCANDO SALA...</div>
      </div>
    </div>
  );

  const cfg=room.config||{};
  const players=[...(room.players||[])];
  const isStrike=room.gameType==='preset:strike';
  const rounds=room.rounds||[];
  const isActive=room.status==='active';
  const isFinished=room.status==='finished';

  const sorted=isStrike
    ? [...players].sort((a,b)=>{
        if(!a.eliminated&&b.eliminated) return -1;
        if(a.eliminated&&!b.eliminated) return 1;
        if(a.eliminated&&b.eliminated) return (b.eliminatedOrder||0)-(a.eliminatedOrder||0);
        return 0;
      })
    : [...players].sort((a,b)=>
        cfg.mode==='wins'?(b.wins||0)-(a.wins||0):(b.total||0)-(a.total||0)
      );

  const playerMap=Object.fromEntries(players.map(p=>[p.id,p]));

  // Máximo para barras de progreso
  const maxScore=Math.max(1,...players.map(p=>p.total||0));
  const maxWins=Math.max(1,...players.map(p=>p.wins||0));
  const target=cfg.useTarget&&cfg.targetScore?parseInt(cfg.targetScore):null;
  const barMax=target||maxScore;

  // % victoria estimado (simple: posición relativa)
  function winPct(p,i){
    if(isStrike) return p.eliminated?0:Math.round(100/(players.filter(pl=>!pl.eliminated).length||1));
    if(players.length===0) return 0;
    const score=cfg.mode==='wins'?(p.wins||0):(p.total||0);
    const total=players.reduce((s,pl)=>s+(cfg.mode==='wins'?(pl.wins||0):(pl.total||0)),0);
    if(total===0) return Math.round(100/players.length);
    return Math.round((score/total)*100);
  }

  const statusColor=isActive?'var(--green)':isFinished?'var(--red)':'var(--gold)';

  return(
    <div className="os-wrap">
      {/* Header impactante */}
      <div style={{
        position:'sticky',top:0,zIndex:100,
        background:'linear-gradient(180deg,rgba(8,8,16,.98) 85%,transparent)',
        borderBottom:'1px solid rgba(0,245,255,.15)',
        padding:'8px 14px'
      }}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
          <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onBack}>← Salir</button>
          <div style={{textAlign:'center'}}>
            <div style={{
              fontFamily:'var(--font-display)',fontSize:'1.1rem',letterSpacing:2,
              background:'linear-gradient(135deg,var(--cyan),var(--orange))',
              WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'
            }}>
              {room.customTitle||'MARCADOR EN VIVO'}
            </div>
          </div>
          <div className="room-code-badge">{code}</div>
        </div>
        {/* Status bar animada */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <div style={{
              width:8,height:8,borderRadius:'50%',background:statusColor,
              boxShadow:`0 0 8px ${statusColor}`,
              animation:isActive?'osBlink 1.2s ease-in-out infinite':'none'
            }}/>
            <span style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:statusColor,letterSpacing:2,fontWeight:700}}>
              {isActive?'EN VIVO':isFinished?'TERMINADA':'LOBBY'}
              {isActive&&` · ${players.filter(p=>!p.eliminated).length} activos`}
            </span>
          </div>
          {isActive&&(
            <div style={{fontFamily:'var(--font-display)',fontSize:'1.1rem',color:'var(--gold)',textShadow:'var(--glow-g)'}}>
              {fmtDuration(elapsed)}
            </div>
          )}
          {rounds.length>0&&(
            <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.4)',letterSpacing:1}}>
              R{rounds.length}{cfg.rounds&&cfg.rounds!=='libre'?`/${cfg.rounds}`:''}
            </div>
          )}
        </div>
      </div>

      <div className="os-page" style={{paddingTop:12}}>
        {/* Tabs */}
        <div style={{display:'flex',gap:5,marginBottom:14}}>
          {[
            ['score','📊 Marcador'],
            ['rounds',`📋 Rondas${rounds.length>0?' ('+rounds.length+')':''}`]
          ].map(([id,lbl])=>(
            <button key={id} style={{
              flex:1,border:'none',borderRadius:10,padding:'9px 4px',cursor:'pointer',
              fontFamily:'var(--font-ui)',fontSize:'var(--fs-micro)',letterSpacing:1,transition:'all .18s',
              background:tab===id?'linear-gradient(135deg,var(--cyan),#00B8CC)':'rgba(255,255,255,.06)',
              color:tab===id?'var(--bg)':'rgba(255,255,255,.4)'
            }} onClick={()=>{snd('tap');setTab(id);}}>
              {lbl}
            </button>
          ))}
        </div>

        {/* ── TAB: MARCADOR VISTOSO ── */}
        {tab==='score'&&sorted.map((p,i)=>{
          const isFirst=i===0&&!p.eliminated;
          const isElim=p.eliminated;
          const score=cfg.mode==='wins'?(p.wins||0):(p.total||0);
          const pct=winPct(p,i);
          const barW=isStrike?0:Math.round((score/barMax)*100);
          const isChanged=changedIds.includes(p.id);
          const posClass=['pos-1','pos-2','pos-3','other'][Math.min(i,3)];

          return(
            <div key={p.id}
              className={`live-score-card ${posClass} ${isElim?'elim':''} ${isChanged?'score-changed':''} anim-fade`}
              style={{animationDelay:i*.05+'s'}}>

              {/* Posición + Avatar */}
              <div style={{
                fontFamily:'var(--font-display)',fontSize:'1.4rem',
                width:32,textAlign:'center',flexShrink:0,
                color:isFirst?'var(--gold)':isElim?'rgba(255,59,92,.5)':'rgba(255,255,255,.25)'
              }}>
                {isElim?'💀':i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`}
              </div>
              <div style={{fontSize:'1.9rem',flexShrink:0}}>{p.emoji}</div>

              {/* Nombre + barra */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginBottom:4}}>
                  <div style={{
                    fontFamily:'var(--font-body)',fontWeight:700,fontSize:'var(--fs-base)',
                    color:isElim?'rgba(255,255,255,.3)':p.color||'#fff',
                    overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'
                  }}>{p.name}</div>
                  <div style={{
                    fontFamily:'var(--font-display)',fontSize:'1.2rem',
                    color:isFirst?'var(--gold)':isElim?'rgba(255,59,92,.5)':'rgba(255,255,255,.6)',
                    flexShrink:0,marginLeft:8,
                    transition:'color .3s',
                    animation:isChanged?'scoreUp .4s cubic-bezier(.34,1.56,.64,1)':'none'
                  }}>
                    {isStrike
                      ? (isElim?`#${p.finalPosition}`:fmtDuration(elapsed))
                      : (cfg.mode==='wins'?(score+'🏆'):(score+' pts'))
                    }
                  </div>
                </div>

                {/* Barra de progreso */}
                {!isStrike&&!isElim&&(
                  <div style={{
                    height:5,borderRadius:3,background:'rgba(255,255,255,.08)',
                    overflow:'hidden',marginBottom:3
                  }}>
                    <div style={{
                      height:'100%',borderRadius:3,
                      background:isFirst
                        ? `linear-gradient(90deg,${p.color||'var(--gold)'},var(--gold))`
                        : (p.color||'rgba(0,245,255,.5)'),
                      width:`${Math.min(100,barW)}%`,
                      transition:'width .6s cubic-bezier(.34,1.56,.64,1)',
                      boxShadow:isFirst?`0 0 8px ${p.color||'var(--gold)'}88`:'none'
                    }}/>
                  </div>
                )}

                {/* Sub-info */}
                <div style={{
                  fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',fontWeight:600,
                  color:'rgba(255,255,255,.3)',letterSpacing:1
                }}>
                  {isStrike
                    ? (isElim?`💀 duró ${p.survivalLabel||'—'}`:'⏱ Contando...')
                    : (target
                        ? `${score}/${target} pts · ${Math.min(100,Math.round(score/target*100))}%`
                        : (rounds.length>0
                            ? `${p.wins||0} 🏆 · ${pct}% chances`
                            : `${pct}% chances`))
                  }
                </div>
              </div>
            </div>
          );
        })}

        {/* ── TAB: HISTORIAL HORIZONTAL (estilo Flip7) ── */}
        {tab==='rounds'&&(
          <>
            {rounds.length===0&&(
              <div className="os-empty">
                <div style={{fontSize:'2rem',marginBottom:8}}>📋</div>
                <div>Aún no se han cerrado rondas</div>
              </div>
            )}

            {/* Rondas en horizontal scrollable */}
            {rounds.length>0&&(
              <>
                <div style={{
                  overflowX:'auto',paddingBottom:8,marginBottom:16,
                  WebkitOverflowScrolling:'touch'
                }}>
                  <div style={{display:'flex',gap:8,minWidth:'max-content',padding:'0 2px'}}>
                    {rounds.map((r,ri)=>{
                      const rw=playerMap[r.winner];
                      return(
                        <div key={r.number||ri} style={{
                          minWidth:110,borderRadius:12,padding:'10px 12px',
                          background:ri===rounds.length-1?'rgba(0,245,255,.08)':'rgba(255,255,255,.04)',
                          border:`1px solid ${ri===rounds.length-1?'rgba(0,245,255,.3)':'rgba(255,255,255,.08)'}`,
                          flexShrink:0
                        }}>
                          <div style={{
                            fontFamily:'var(--font-display)',fontSize:'.75rem',letterSpacing:2,
                            color:ri===rounds.length-1?'var(--cyan)':'rgba(255,255,255,.35)',marginBottom:6
                          }}>R{r.number}</div>
                          {rw&&(
                            <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:6}}>
                              <span style={{fontSize:'1.2rem'}}>{rw.emoji}</span>
                              <span style={{fontFamily:'var(--font-display)',fontSize:'.7rem',color:rw.color||'var(--gold)',letterSpacing:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:60}}>{rw.name}</span>
                              <span style={{color:'var(--gold)'}}>🏆</span>
                            </div>
                          )}
                          {r.condition&&(
                            <div style={{fontFamily:'var(--font-label)',fontSize:'.6rem',color:'var(--gold)',letterSpacing:1,marginBottom:4}}>{r.condition}</div>
                          )}
                          {/* Mini scores */}
                          {Object.entries(r.scores||{}).slice(0,3).map(([pid,score])=>{
                            const pl=playerMap[pid];
                            if(!pl) return null;
                            return(
                              <div key={pid} style={{
                                display:'flex',alignItems:'center',gap:4,
                                fontFamily:'var(--font-label)',fontSize:'.6rem',
                                color:pl.id===r.winner?pl.color||'var(--gold)':'rgba(255,255,255,.35)',
                                marginBottom:2
                              }}>
                                <span>{pl.emoji}</span>
                                <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{pl.name}</span>
                                <span style={{fontWeight:700}}>{score>0?'+':''}{score}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tabla acumulada */}
                <div className="os-section">ACUMULADO</div>
                {sorted.map((p,i)=>(
                  <div key={p.id} style={{
                    display:'flex',alignItems:'center',gap:10,
                    background:i===0?'rgba(255,212,71,.06)':'var(--surface)',
                    border:`1px solid ${i===0?'rgba(255,212,71,.3)':'var(--border)'}`,
                    borderRadius:12,padding:'10px 14px',marginBottom:6
                  }}>
                    <div style={{fontFamily:'var(--font-display)',fontSize:'1.2rem',width:28,textAlign:'center',color:i===0?'var(--gold)':'rgba(255,255,255,.25)'}}>
                      {i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}
                    </div>
                    <div style={{fontSize:'1.6rem'}}>{p.emoji}</div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:'var(--font-body)',fontWeight:700,fontSize:'var(--fs-sm)',color:p.color||'#fff'}}>{p.name}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      {cfg.mode!=='wins'&&<div style={{fontFamily:'var(--font-display)',fontSize:'1.1rem',color:i===0?'var(--gold)':'rgba(255,255,255,.6)'}}>{p.total||0} pts</div>}
                      <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)',letterSpacing:1}}>{p.wins||0} 🏆</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        <div className="g16"/>
        <button className="btn btn-ghost" onClick={onBack}>← Volver</button>
      </div>
    </div>
  );
}

// ── APP SHELL ────────────────────────────────────────────────────
function App(){
  const [screen,setScreen]=useState('loading');
  const [profile,setProfile]=useState(null);
  const [session,setSession]=useState(null);
  const [isHost,setIsHost]=useState(false);
  const [authUser,setAuthUser]=useState(null);
  const [editingTemplate,setEditingTemplate]=useState(null);
  const [playTemplate,setPlayTemplate]=useState(null);
  const [spectateCode,setSpectateCode]=useState(null);
  const db=makeDB(false);

  // ── INIT: restaurar sesión, perfil, presencia ──────────────────
  useEffect(()=>{
    authOnChange(u=>setAuthUser(u||null));

    // 1. Cargar perfil
    const p=getProfile();
    if(p&&p.name) setProfile(p);

    // 2. Intentar restaurar sesión activa (sobrevive recargas)
    const saved=getActiveSession();
    if(saved && saved.code){
      // Verificar que la sala sigue viva
      const db2=makeDB(false);
      db2.get(`rooms/${saved.code}`).then(room=>{
        if(room && room.status!=='finished'){
          setSession({code:saved.code,demo:false,date:room.createdAt});
          setIsHost(saved.isHost||false);
          if(saved.templateConfig) setPlayTemplate({config:saved.templateConfig,name:room.customTitle||''});
          setScreen(saved.screen||'home');
          // Reactivar presencia
          const profile2=getProfile();
          if(profile2?.id) setupPresence(saved.code,profile2.id);
        } else {
          clearActiveSession();
          _restoreNormal(p);
        }
      }).catch(()=>{ clearActiveSession(); _restoreNormal(p); });
    } else {
      _restoreNormal(p);
    }

    function _restoreNormal(prof){
      const rematchCode=localStorage.getItem('bgos_rematch_code');
      if(rematchCode){
        localStorage.removeItem('bgos_rematch_code');
        if(rematchCode.startsWith('strike:')){
          // Revancha de Strike — ir directamente al lobby
          const code=rematchCode.replace('strike:','');
          setSession({code,demo:false,date:Date.now()});
          setIsHost(true);
          setScreen('strike-lobby');
        } else {
          setSpectateCode(rematchCode);
          setScreen('live-scoreboard');
        }
      } else {
        setScreen('home');
      }
    }
  },[]);

  // Pendiente de crear sala tras configurar perfil
  const [pendingAction,setPendingAction]=useState(null); // 'strike' | 'generic'

  // El myId viene del perfil guardado
  const myId=profile?.id||null;

  function goHome(){
    setScreen('home'); setSession(null); setIsHost(false); setPlayTemplate(null);
    clearActiveSession(); teardownPresence();
  }

  function updateProfile(p){
    saveProfile(p);
    setProfile(p);
  }

  const hostPlayer=profile
    ? {id:profile.id,name:profile.name,emoji:profile.emoji,color:profile.color}
    : {id:'host',name:'Host',emoji:'🐉',color:'#00F5FF'};

  async function createRoom(gameType,customTitle,players,config){
    const code=uid4();
    // Inicializar jugadores según config del motor
    const cfg=config||{};
    const initLives=cfg.registers?.includes('lives')||
      cfg.accumulates==='lives'||
      cfg.victoryMode==='lives'||
      gameType==='preset:strike' ? 5 : null;

    await db.set(`rooms/${code}`,{
      code,gameType,customTitle,status:'lobby',hostId:myId,
      createdAt:Date.now(),config:cfg||null,
      players:players.map((p,i)=>({
        ...p,
        id:p.id||uid(),
        // Scores
        total:0,wins:0,rounds:[],
        // Vidas (si aplica)
        ...(initLives!==null?{lives:initLives}:{}),
        // Recursos / monedas
        ...(cfg.registers?.includes('resources')?{resources:0}:{}),
        ...(cfg.registers?.includes('coins')?{coins:0}:{}),
        ...(cfg.registers?.includes('objectives')?{objectives:0}:{}),
        ...(cfg.registers?.includes('custom')?{custom:0}:{}),
        // Estado
        eliminated:false,finalPosition:null,survivalMs:null,
        // Modificadores
        activeShield:false,activeBlock:false,activeDouble:false,
        // Token primer jugador
        hasFirstPlayerToken:cfg.useFirstPlayerToken===true && i===0,
      })),
      events:[]
    });
    setSession({code,demo:false,date:Date.now()});
    setIsHost(true);
    // Persistir sesión para sobrevivir recargas
    const prof=getProfile();
    saveActiveSession({code,isHost:true,gameType,screen:gameType==='preset:strike'?'strike-lobby':'generic-lobby',myId:prof?.id});
    // Activar presencia
    if(prof?.id) setupPresence(code,prof.id);
    return code;
  }

  async function joinRoom(code,playerId,playerName,playerEmoji,playerColor){
    const existing=await db.get(`rooms/${code}`);
    if(!existing) return{error:'Sala no encontrada'};
    if(existing.status==='finished') return{error:'Esta partida ya terminó'};
    const players=[...(existing.players||[])];

    // Check if already in room with myId
    const alreadyIn=players.find(p=>p.id===myId);
    if(!alreadyIn){
      // Try to match by name (slot taken)
      const byName=players.find(p=>p.name.toLowerCase()===playerName.toLowerCase());
      if(byName){
        // Take over this slot — update ID to myId
        const updated=players.map(p=>p.id===byName.id
          ?{...p,id:myId,emoji:playerEmoji||p.emoji,color:playerColor||p.color}
          :p);
        await db.set(`rooms/${code}/players`,updated);
      } else if(playerId && playerId!=='new' && players.find(p=>p.id===playerId)){
        // Take over specific slot by ID
        const updated=players.map(p=>p.id===playerId
          ?{...p,id:myId,emoji:playerEmoji||p.emoji,color:playerColor||p.color}
          :p);
        await db.set(`rooms/${code}/players`,updated);
      } else {
        // New player
        const cfg=existing.config||{};
        const initLives=cfg.registers?.includes('lives')||cfg.accumulates==='lives'||cfg.victoryMode==='lives'?5:null;
        const newPlayer={
          id:myId,name:playerName,emoji:playerEmoji,color:playerColor,
          total:0,wins:0,rounds:[],
          ...(initLives!==null?{lives:initLives}:{}),
          eliminated:false,finalPosition:null,survivalMs:null,
          activeShield:false,activeBlock:false,activeDouble:false,
        };
        players.push(newPlayer);
        await db.set(`rooms/${code}/players`,players);
      }
    }

    setSession({code,demo:false,date:existing.createdAt,myId});
    setIsHost(false);

    const gt=existing.gameType||'';
    let targetScreen='home';
    if(gt==='preset:strike'){
      targetScreen=existing.status==='active'?'strike-game':'strike-lobby';
    } else if(gt.startsWith('generic:template')||gt==='universal'){
      targetScreen=existing.status==='active'?'universal-game':'universal-lobby';
      // Cargar config del template desde el room para players que se unen
      if(existing.config) setPlayTemplate({config:existing.config,name:existing.customTitle||''});
    } else {
      targetScreen=existing.status==='active'?'generic-game':'generic-lobby';
    }
    setScreen(targetScreen);
    // Persistir sesión
    const prof=getProfile();
    saveActiveSession({code,isHost:false,gameType:gt,screen:targetScreen,myId:prof?.id,
      templateConfig:existing.config||null});
    // Activar presencia
    if(prof?.id) setupPresence(code,prof.id);
    return{ok:true};
  }

  // isHost se guarda en state pero también se puede derivar del room
  // Pasamos ambos para que el runtime lo resuelva
  const screenProps={session,onBack:goHome,isHost,myId,db,hostId:session?.hostId};

  if(screen==='loading') return(
    <div className="os-wrap">
      <div className="os-page" style={{paddingTop:80,textAlign:'center'}}>
        <div className="os-spin" style={{marginBottom:16}}/>
      </div>
    </div>
  );

  return(
    <div>
      {/* Perfil se pide inline al crear sala — también accesible desde home */}
      {screen==='profile-setup' && (
        <ProfileSetup
          context={pendingAction}
          onDone={p=>{
            setProfile(p);
            updateProfile(p);
            // Si venía de intentar crear sala, continuar
            if(pendingAction==='strike')  { setPendingAction(null); setScreen('strike-host-setup'); }
            else if(pendingAction==='generic') { setPendingAction(null); setScreen('generic-setup'); }
            else { setPendingAction(null); setScreen('home'); }
          }}
          onSkip={()=>{ setPendingAction(null); setScreen('home'); }}
        />
      )}

      {screen==='home' && (
        <MainMenu
          profile={profile}
          onGoStrike={()=>setScreen('strike-host-setup')}
          onGoGeneric={()=>setScreen('generic-setup')}
          onGoJoin={()=>setScreen('join')}
          onGoStats={()=>setScreen('stats')}
          onGoMyGames={()=>setScreen('my-games')}
          onGoProfile={()=>setScreen('profile-edit')}
          onGoTools={()=>setScreen('tools')}
          myId={myId} db={db} authUser={authUser}
        />
      )}

      {screen==='profile-edit' && (
        <ProfileEditScreen
          profile={profile}
          onBack={goHome}
          onSave={p=>{ updateProfile(p); goHome(); }}
        />
      )}

      {/* MARCADOR EN VIVO */}
      {screen==='live-scoreboard' && spectateCode && (
        <LiveScoreboard code={spectateCode} onBack={goHome} db={db}/>
      )}

      {/* AUTH */}
      {screen==='auth' && (
        <AuthScreen
          onAuth={u=>{ setAuthUser(u); setScreen('my-games'); }}
          onSkip={()=>setScreen('home')}
        />
      )}

      {/* MIS JUEGOS */}
      {screen==='my-games' && !authUser && (
        <AuthScreen
          onAuth={u=>{ setAuthUser(u); setScreen('my-games'); }}
          onSkip={goHome}
        />
      )}
      {screen==='my-games' && authUser && (
        <MyGamesScreen
          user={authUser}
          onBack={goHome}
          onBuildNew={()=>{ setEditingTemplate(null); setScreen('game-builder'); }}
          onEditTemplate={t=>{ setEditingTemplate(t); setScreen('game-builder'); }}
          onPlayTemplate={t=>{ setPlayTemplate(t); setScreen('generic-setup-from-template'); }}
          onSignOut={async()=>{ await authSignOut(); setAuthUser(null); goHome(); }}
        />
      )}

      {screen==='game-builder' && authUser && (
        <GameBuilder
          user={authUser}
          editingTemplate={editingTemplate}
          onBack={()=>setScreen('my-games')}
          onSaved={()=>setScreen('my-games')}
        />
      )}

      {screen==='generic-setup-from-template' && playTemplate && (
        <GenericSetupFromTemplate
          template={playTemplate}
          hostPlayer={hostPlayer}
          onBack={()=>setScreen('my-games')}
          onCreateRoom={async({players})=>{
            await createRoom('generic:template',playTemplate.name,players,playTemplate.config||{});
            // Use universal runtime for template-based games
            setScreen('universal-lobby');
          }}
        />
      )}

      {/* UNIVERSAL RUNTIME — para templates del builder */}
      {screen==='universal-lobby' && session && (
        <GenericLobby
          {...{session,onBack:goHome,isHost,myId,db}}
          onStart={()=>setScreen('universal-game')}
        />
      )}
      {screen==='universal-game' && session && (
        <UniversalRuntime
          session={session}
          onBack={goHome}
          isHost={isHost}
          myId={myId}
          db={db}
          templateConfig={playTemplate?.config||null}
        />
      )}

      {/* STRIKE — si no hay perfil, pedir primero */}
      {screen==='strike-host-setup' && !hasProfile() && (
        <ProfileSetup
          context="strike"
          onDone={p=>{ setProfile(p); updateProfile(p); setScreen('strike-host-setup'); }}
          onSkip={()=>setScreen('home')}
        />
      )}
      {screen==='strike-host-setup' && hasProfile() && (
        <StrikeHostSetup onBack={goHome} hostPlayer={hostPlayer}
          onUpdateProfile={updateProfile}
          onCreateRoom={async({title,players})=>{
            await createRoom('preset:strike',title,players,GAME_PRESETS.strike.config);
            setScreen('strike-lobby');
          }}/>
      )}
      {screen==='strike-lobby' && session && <StrikeLobby {...screenProps} onStart={()=>setScreen('strike-game')}/>}
      {screen==='strike-game'  && session && <StrikeGame  {...screenProps}/>}

      {/* GENÉRICA — si no hay perfil, pedir primero */}
      {screen==='generic-setup' && !hasProfile() && (
        <ProfileSetup
          context="generic"
          onDone={p=>{ setProfile(p); updateProfile(p); setScreen('generic-setup'); }}
          onSkip={()=>setScreen('home')}
        />
      )}
      {screen==='generic-setup' && hasProfile() && (
        <GenericSetup onBack={goHome} hostPlayer={hostPlayer}
          onCreateRoom={async({title,players,config})=>{
            await createRoom('generic',title,players,config);
            setScreen('generic-lobby');
          }}/>
      )}
      {screen==='generic-lobby' && session && <GenericLobby {...screenProps} onStart={()=>setScreen('generic-game')}/>}
      {screen==='generic-game'  && session && <GenericRuntime {...screenProps}/>}

      {/* JOIN — con opción de marcador en vivo */}
      {screen==='join' && (
        <JoinRoom
          onBack={goHome}
          onJoin={joinRoom}
          myId={myId}
          profile={profile}
          db={db}
          onSpectate={code=>{ setSpectateCode(code); setScreen('live-scoreboard'); }}
        />
      )}

      {screen==='stats' && <StatsScreen onBack={goHome} db={db}/>}

      {/* HERRAMIENTAS */}
      {screen==='tools' && <ToolsHub onBack={goHome}/>}
    </div>
  );
}

// ── PROFILE EDIT ─────────────────────────────────────────────────
function ProfileEditScreen({ profile, onBack, onSave }){
  const [name,setName]=useState(profile?.name||'');
  const [emoji,setEmoji]=useState(profile?.emoji||'🐉');
  const [color,setColor]=useState(profile?.color||'#00F5FF');
  const [pickMode,setPickMode]=useState(null);

  if(pickMode){
    return(
      <div className="os-wrap">
        <div className="os-header">
          <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={()=>setPickMode(null)}>← Listo</button>
          <div style={{fontFamily:'var(--font-label)',fontSize:'.75rem',fontWeight:700,color:'rgba(255,255,255,.5)',letterSpacing:3}}>TU AVATAR</div>
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
          {pickMode==='emoji'&&<div className="picker-grid">{EMOJIS.map((e,i)=><div key={i} className={`picker-item ${emoji===e?'sel':''}`} onClick={()=>{snd('tap');setEmoji(e);}}>{e}</div>)}</div>}
          {pickMode==='color'&&<div style={{display:'flex',flexWrap:'wrap',gap:10,padding:'8px 0'}}>{COLORS.map((c,i)=><div key={i} className={`color-dot ${color===c?'sel':''}`} style={{background:c}} onClick={()=>{snd('tap');setColor(c);}}/>)}</div>}
        </div>
      </div>
    );
  }

  return(
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onBack}>← Home</button>
        <div className="os-logo" style={{fontSize:'1.1rem'}}>MI <span>PERFIL</span></div>
        <div style={{width:70}}/>
      </div>
      <div className="os-page" style={{paddingTop:20}}>
        <div style={{textAlign:'center',marginBottom:24}}>
          <div className="profile-avatar" onClick={()=>setPickMode('emoji')}>{emoji}</div>
          <div style={{width:18,height:18,borderRadius:'50%',background:color,border:'3px solid rgba(255,255,255,.3)',margin:'0 auto 8px',cursor:'pointer'}}
            onClick={()=>setPickMode('color')}/>
          <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(0,245,255,.5)',letterSpacing:2}}>TOCA PARA CAMBIAR</div>
        </div>
        <div className="os-section">TU NOMBRE</div>
        <input className="os-input" placeholder="Tu nombre..." value={name}
          onChange={e=>setName(e.target.value)} maxLength={20} autoFocus/>
        <div className="g8"/>
        <button className="btn btn-cyan" disabled={!name.trim()}
          onClick={()=>{ snd('save'); onSave({...profile,name:name.trim(),emoji,color}); }}>
          💾 Guardar perfil
        </button>
        <button className="btn btn-back" onClick={onBack}>← Cancelar</button>
      </div>
    </div>
  );
}

// ── PLAYER PICKER (compartido) ────────────────────────────────────
function PlayerPicker({player,onUpdate,onClose}){
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

// ── MAIN MENU v1.3 ────────────────────────────────────────────────
function MainMenu({profile,onGoStrike,onGoGeneric,onGoJoin,onGoStats,onGoMyGames,onGoProfile,onGoTools,myId,db,authUser}){
  const [recentSessions,setRecentSessions]=useState([]);
  useEffect(()=>{loadRecentSessions(3).then(setRecentSessions).catch(()=>{});},[]);

  return(
    <div className="os-wrap">
      <div className="os-header">
        <div><div className="os-logo">BOARD<span>GAMEZ</span></div><div className="os-logo-sub">OS · v1.3</div></div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {/* Avatar del usuario — toca para editar perfil */}
          <div style={{
            fontSize:'1.5rem',width:38,height:38,borderRadius:10,
            background:'rgba(0,245,255,.08)',border:'1px solid rgba(0,245,255,.2)',
            display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'
          }} onClick={()=>{ snd('tap'); onGoProfile(); }}>
            {profile?.emoji||'👤'}
          </div>
        </div>
      </div>

      <div className="os-page" style={{paddingTop:0}}>
        {/* Saludo personalizado */}
        <div style={{padding:'16px 0 8px',display:'flex',alignItems:'center',gap:10}}>
          <div style={{
            width:44,height:44,borderRadius:12,fontSize:'1.8rem',
            background:'rgba(0,245,255,.08)',border:'1px solid rgba(0,245,255,.15)',
            display:'flex',alignItems:'center',justifyContent:'center'
          }}>{profile?.emoji||'👤'}</div>
          <div>
            <div style={{fontFamily:'var(--font-display)',fontSize:'1rem',letterSpacing:1,color:'#fff'}}>
              Hola, <span style={{color:profile?.color||'var(--cyan)'}}>{profile?.name||'Jugador'}</span>
            </div>
            <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)',letterSpacing:1,marginTop:1}}>
              BOARDGAMEZ OS · LISTO PARA JUGAR
            </div>
          </div>
        </div>

        {/* GAME BUILDER */}
        <div className="os-section">GAME BUILDER</div>
        <div className="os-card" style={{
          borderColor:'rgba(155,93,229,.4)',
          background:'linear-gradient(135deg,rgba(155,93,229,.1) 0%,rgba(0,245,255,.04) 100%)'
        }} onClick={()=>{snd('tap');onGoMyGames();}}>
          <div className="os-card-header">
            <div className="os-card-icon" style={{background:'rgba(155,93,229,.15)',border:'1px solid rgba(155,93,229,.3)',fontSize:'1.8rem'}}>🎮</div>
            <div>
              <div className="os-card-title">Mis Juegos</div>
              <div className="os-card-sub">
                {authUser?`SESIÓN: ${authUser.displayName||authUser.email||'Usuario'}`:'CREA · GUARDA · REUTILIZA'}
              </div>
            </div>
          </div>
          <div className="os-card-desc">Diseña la configuración de tus juegos y guárdalos. La próxima vez solo los cargas.</div>
          <div className="os-tags">
            <div className="os-tag purple">5 secciones</div>
            <div className="os-tag purple">Nube</div>
            <div className="os-tag purple">Reutilizable</div>
          </div>
        </div>

        <div className="os-section" style={{marginTop:4}}>JUEGOS ESPECIALIZADOS</div>
        <div className="preset-card" style={{borderColor:'rgba(255,107,53,.3)',background:'linear-gradient(135deg,rgba(255,107,53,.06),rgba(255,107,53,.02))'}}
          onClick={()=>{snd('tap');onGoStrike();}}>
          <div className="preset-icon">🎳</div>
          <div className="preset-info">
            <div className="preset-title">Strike</div>
            <div className="preset-desc">Supervivencia · Auto-eliminación · Stats</div>
            <div style={{display:'flex',gap:5,marginTop:7}}>
              <div className="os-tag orange" style={{fontSize:'var(--fs-micro)'}}>PRECONFIGURADO</div>
            </div>
          </div>
        </div>

        <div className="os-section" style={{marginTop:4}}>PARTIDA RÁPIDA</div>
        <div className="os-card primary" onClick={()=>{snd('tap');onGoGeneric();}}>
          <div className="os-card-header">
            <div className="os-card-icon">⚔️</div>
            <div><div className="os-card-title">Crear partida</div><div className="os-card-sub">SIN TEMPLATE · CONFIGURA AL MOMENTO</div></div>
          </div>
          <div className="os-card-desc">Configura rápido sin necesidad de un juego guardado.</div>
        </div>

        <div className="os-card secondary" onClick={()=>{snd('tap');onGoJoin();}}>
          <div className="os-card-header">
            <div className="os-card-icon">🚪</div>
            <div><div className="os-card-title">Unirse / Ver marcador</div><div className="os-card-sub">CÓDIGO DE 4 LETRAS</div></div>
          </div>
          <div className="os-card-desc">Únete como jugador o mira el marcador en vivo como espectador.</div>
        </div>

        <div className="os-section">PLATAFORMA</div>
        <div className="os-card tertiary" onClick={()=>{snd('tap');onGoStats();}}>
          <div className="os-card-header">
            <div className="os-card-icon">📊</div>
            <div><div className="os-card-title">Estadísticas</div><div className="os-card-sub">TODOS LOS JUEGOS</div></div>
          </div>
          <div className="os-card-desc">Ranking, historial y vergüenza histórica 💀</div>
        </div>

        {/* HERRAMIENTAS */}
        <div className="os-card" style={{borderColor:'rgba(0,255,157,.25)',background:'rgba(0,255,157,.04)'}}
          onClick={()=>{snd('tap');onGoTools();}}>
          <div className="os-card-header">
            <div className="os-card-icon" style={{background:'rgba(0,255,157,.1)',border:'1px solid rgba(0,255,157,.2)'}}>🧰</div>
            <div><div className="os-card-title">Herramientas</div><div className="os-card-sub">MONEDA · DADOS · RULETA · PPS</div></div>
          </div>
          <div className="os-card-desc">Herramientas de apoyo para cualquier partida.</div>
          <div className="os-tags">
            <div className="os-tag green">🪙 Moneda</div>
            <div className="os-tag green">🎲 Dados</div>
            <div className="os-tag green">🎡 Ruleta</div>
            <div className="os-tag green">✊ PPS</div>
          </div>
        </div>

        {recentSessions.length>0&&(
          <>
            <div className="os-section">RECIENTES</div>
            {recentSessions.map((s,i)=>(
              <div key={s.sessionId||i} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:'11px 14px',marginBottom:8,display:'flex',alignItems:'center',gap:10}}>
                <div style={{fontSize:'1.5rem'}}>{s.gameType==='preset:strike'?'🎳':'⚔️'}</div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:'var(--font-body)',fontWeight:700,fontSize:'var(--fs-sm)'}}>{s.customTitle||s.gameTitle}</div>
                  <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',fontWeight:600,color:'rgba(255,255,255,.35)',letterSpacing:1,marginTop:1}}>
                    {fmtShortDate(s.startedAt)} · {s.playerCount} jug. · {fmtDuration(s.durationMs)}
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

// ── JOIN ROOM v1.3 — con opción Marcador en vivo ──────────────────
function JoinRoom({onBack,onJoin,myId,profile,db,onSpectate}){
  const [code,setCode]=useState('');
  const [step,setStep]=useState('code');
  const [roomData,setRoomData]=useState(null);
  const [loadingRoom,setLoadingRoom]=useState(false);
  const [roomError,setRoomError]=useState('');
  const [selectedSlot,setSelectedSlot]=useState(null);
  const [name,setName]=useState(profile?.name||'');
  const [emoji,setEmoji]=useState(profile?.emoji||'🐉');
  const [color,setColor]=useState(profile?.color||'#00F5FF');
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
          {pickMode==='emoji'&&<div className="picker-grid">{EMOJIS.map((e,i)=><div key={i} className={`picker-item ${emoji===e?'sel':''}`} onClick={()=>{snd('tap');setEmoji(e);}}>{e}</div>)}</div>}
          {pickMode==='color'&&<div style={{display:'flex',flexWrap:'wrap',gap:10,padding:'8px 0'}}>{COLORS.map((c,i)=><div key={i} className={`color-dot ${color===c?'sel':''}`} style={{background:c}} onClick={()=>{snd('tap');setColor(c);}}/>)}</div>}
        </div>
      </div>
    );
  }

  return(
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}}
          onClick={()=>step==='select'?setStep('code'):onBack()}>← Atrás</button>
        <div className="os-logo" style={{fontSize:'1.1rem'}}>UNIRSE <span>A SALA</span></div>
        <div style={{width:70}}/>
      </div>
      <div className="os-page" style={{paddingTop:16}}>
        {step==='code'&&(
          <div className="anim-fade">
            <div className="os-section">CÓDIGO DE SALA</div>
            <input className="os-input os-code-input" placeholder="XXXX"
              value={code} onChange={e=>setCode(e.target.value.toUpperCase().slice(0,4))}
              maxLength={4} autoFocus onKeyDown={e=>e.key==='Enter'&&code.length===4&&lookupRoom()}/>
            {roomError&&<div className="os-alert alert-red">{roomError}</div>}
            <button className="btn btn-cyan" disabled={code.length<4||loadingRoom} onClick={lookupRoom}>
              {loadingRoom?'⏳ Buscando...':`🔍 Buscar sala ${code}`}
            </button>
          </div>
        )}

        {step==='select'&&roomData&&(
          <div className="anim-fade">
            {/* Info de la sala */}
            <div style={{background:'rgba(0,245,255,.05)',border:'1px solid rgba(0,245,255,.2)',borderRadius:14,padding:'12px 14px',marginBottom:16}}>
              <div style={{fontFamily:'var(--font-display)',fontSize:'1rem',color:'var(--cyan)',letterSpacing:1}}>
                {roomData.customTitle||'Sala encontrada'}
              </div>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',fontWeight:600,color:'rgba(255,255,255,.4)',letterSpacing:1,marginTop:3}}>
                {roomData.players?.length} jugadores · {roomData.status==='active'?'En juego':'En lobby'}
              </div>
            </div>

            {/* OPCIÓN MARCADOR EN VIVO */}
            <div style={{
              display:'flex',alignItems:'center',gap:12,
              background:'rgba(155,93,229,.08)',border:'1px solid rgba(155,93,229,.3)',
              borderRadius:13,padding:'13px 15px',marginBottom:14,cursor:'pointer',transition:'all .2s'
            }} onClick={()=>{ snd('tap'); onSpectate(code.toUpperCase()); }}>
              <div style={{fontSize:'1.8rem'}}>👁</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:'var(--font-display)',fontSize:'var(--fs-sm)',letterSpacing:1,color:'var(--purple)'}}>Ver marcador en vivo</div>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.4)',letterSpacing:1,marginTop:2}}>
                  Solo lectura · Sin unirte como jugador
                </div>
              </div>
              <div style={{color:'var(--purple)',fontSize:'1.3rem'}}>›</div>
            </div>

            <div className="os-section">¿ERES ALGUNO DE ESTOS JUGADORES?</div>

            {(roomData.players||[]).map(p=>(
              <div key={p.id} className={`player-row ${selectedSlot===p.id?'active':''}`}
                style={{cursor:'pointer',marginBottom:8,borderColor:selectedSlot===p.id?'rgba(0,245,255,.5)':undefined}}
                onClick={()=>{snd('tap');setSelectedSlot(p.id);setName(p.name);}}>
                <div className="player-emoji">{p.emoji}</div>
                <div className="player-name" style={{color:p.color||'#fff'}}>{p.name}</div>
                {selectedSlot===p.id&&<div style={{color:'var(--cyan)',fontSize:'1.2rem'}}>✓</div>}
              </div>
            ))}

            <div className={`player-row ${selectedSlot==='new'?'active':''}`}
              style={{cursor:'pointer',marginBottom:16,borderStyle:'dashed',borderColor:selectedSlot==='new'?'rgba(0,245,255,.5)':'rgba(255,255,255,.15)'}}
              onClick={()=>{snd('tap');setSelectedSlot('new');}}>
              <div className="player-emoji">➕</div>
              <div className="player-name" style={{color:'rgba(255,255,255,.5)'}}>Soy un jugador nuevo</div>
              {selectedSlot==='new'&&<div style={{color:'var(--cyan)',fontSize:'1.2rem'}}>✓</div>}
            </div>

            {selectedSlot==='new'&&(
              <div className="anim-fade" style={{marginBottom:16}}>
                <div style={{display:'flex',alignItems:'center',gap:12,background:'rgba(0,245,255,.05)',border:'1px solid rgba(0,245,255,.15)',borderRadius:14,padding:'12px 14px',marginBottom:12,cursor:'pointer'}}
                  onClick={()=>setPickMode('emoji')}>
                  <div style={{fontSize:'2rem'}}>{emoji}</div>
                  <div style={{width:14,height:14,borderRadius:'50%',background:color,border:'2px solid rgba(255,255,255,.2)'}}/>
                  <div style={{flex:1,fontFamily:'var(--font-body)',fontWeight:700,fontSize:'var(--fs-sm)',color:color}}>{name||'Tu nombre'}</div>
                  <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(0,245,255,.5)',letterSpacing:2}}>EDITAR ›</div>
                </div>
                <input className="os-input" placeholder="Tu nombre..." value={name} onChange={e=>setName(e.target.value)} maxLength={20}/>
              </div>
            )}

            {error&&<div className="os-alert alert-red">{error}</div>}

            <button className="btn btn-cyan"
              disabled={!selectedSlot||(selectedSlot==='new'&&!name.trim())||loading}
              onClick={handleJoin}>
              {loading?'⏳ Entrando...':'🚪 Unirse como jugador'}
            </button>
            <button className="btn btn-back" onClick={()=>{setStep('code');setRoomData(null);setSelectedSlot(null);}}>
              ← Cambiar sala
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── STATS SCREEN ──────────────────────────────────────────────────
function StatsScreen({onBack,db}){
  const [tab,setTab]=useState('overview');
  const [players,setPlayers]=useState([]);
  const [sessions,setSessions]=useState([]);
  const [loading,setLoading]=useState(true);
  const [selectedPlayer,setSelectedPlayer]=useState(null);

  useEffect(()=>{
    async function load(){
      setLoading(true);
      try{
        const [lb,sess]=await Promise.all([loadLeaderboard(false),loadRecentSessions(50,false)]);
        setPlayers(lb); setSessions(sess);
      }catch(e){console.error(e);}finally{setLoading(false);}
    }
    load();
  },[]);

  // Computed global stats from sessions
  const globalStats = React.useMemo(()=>{
    if(!sessions.length) return null;
    const totalTime = sessions.reduce((s,x)=>s+(x.durationMs||0),0);
    const avgTime = sessions.length ? totalTime/sessions.length : 0;
    // Longest/shortest sessions
    const sorted = [...sessions].sort((a,b)=>(b.durationMs||0)-(a.durationMs||0));
    const longest = sorted[0];
    const shortest = sorted[sorted.length-1];
    // Most played game
    const gameCounts = {};
    sessions.forEach(s=>{ gameCounts[s.customTitle||s.gameTitle]=(gameCounts[s.customTitle||s.gameTitle]||0)+1; });
    const mostPlayed = Object.entries(gameCounts).sort((a,b)=>b[1]-a[1])[0];
    // Slowest/fastest players by survival
    const allPlayers = sessions.flatMap(s=>(s.players||[]).map(p=>({...p,game:s.customTitle||s.gameTitle})));
    const withSurvival = allPlayers.filter(p=>p.survivalMs>0).sort((a,b)=>b.survivalMs-a.survivalMs);
    return { totalTime, avgTime, longest, shortest, mostPlayed, slowest:withSurvival[0], fastest:withSurvival[withSurvival.length-1] };
  },[sessions]);

  if(selectedPlayer){
    const p=selectedPlayer;
    const wr=p.games>0?Math.round((p.wins/p.games)*100):0;
    const pSessions=sessions.filter(s=>(s.players||[]).some(sp=>sp.name===p.name));
    const totalMs=pSessions.reduce((acc,s)=>acc+(s.durationMs||0),0);
    const wins1=pSessions.filter(s=>(s.players||[]).find(sp=>sp.name===p.name)?.finalPosition===1).length;
    return(
      <div className="os-wrap">
        <div className="os-header">
          <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={()=>setSelectedPlayer(null)}>← Stats</button>
          <div style={{fontFamily:'var(--font-label)',fontSize:'.75rem',fontWeight:700,color:'rgba(255,255,255,.4)',letterSpacing:3}}>JUGADOR</div>
          <div style={{width:70}}/>
        </div>
        <div className="os-page" style={{paddingTop:20}}>
          <div style={{textAlign:'center',marginBottom:20}}>
            <div style={{fontSize:'4rem',marginBottom:6}}>{p.emoji}</div>
            <div style={{fontFamily:'var(--font-display)',fontSize:'1.7rem',letterSpacing:2,color:p.color||'#fff'}}>{p.name}</div>
            <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.3)',letterSpacing:2,marginTop:4}}>
              {p.lastGameTitle||'—'} · {fmtShortDate(p.lastPlayed)||''}
            </div>
          </div>
          {/* Win rate bar */}
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:14,padding:'16px',marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.4)',letterSpacing:2}}>WIN RATE</div>
              <div style={{fontFamily:'var(--font-display)',fontSize:'1.1rem',color:'var(--gold)'}}>{wr}%</div>
            </div>
            <div style={{height:8,background:'rgba(255,255,255,.08)',borderRadius:4,overflow:'hidden'}}>
              <div style={{height:'100%',width:wr+'%',background:'linear-gradient(90deg,var(--cyan),var(--gold))',borderRadius:4,transition:'width 1s ease'}}/>
            </div>
          </div>
          {/* Stats grid */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
            {[
              {label:'PARTIDAS',value:p.games||0,color:'var(--cyan)',icon:'🎮'},
              {label:'VICTORIAS',value:p.wins||0,color:'var(--gold)',icon:'🏆'},
              {label:'TIEMPO TOTAL',value:fmtDuration(totalMs),color:'var(--green)',icon:'⏱'},
              {label:'MEJOR POS.',value:'#'+(p.bestPosition||'—'),color:'var(--orange)',icon:'🥇'},
            ].map(s=>(
              <div key={s.label} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:'14px',textAlign:'center'}}>
                <div style={{fontSize:'1.4rem',marginBottom:4}}>{s.icon}</div>
                <div style={{fontFamily:'var(--font-display)',fontSize:'1.5rem',color:s.color,marginBottom:3}}>{s.value}</div>
                <div style={{fontFamily:'var(--font-ui)',fontSize:'.5rem',fontWeight:700,color:'rgba(255,255,255,.3)',letterSpacing:2}}>{s.label}</div>
              </div>
            ))}
          </div>
          {/* Recent sessions for this player */}
          {pSessions.length>0&&(
            <>
              <div className="os-section">PARTIDAS RECIENTES</div>
              {pSessions.slice(0,5).map((s,i)=>{
                const me=(s.players||[]).find(sp=>sp.name===p.name);
                const pos=me?.finalPosition;
                return(
                  <div key={i} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:'12px 14px',marginBottom:7,display:'flex',alignItems:'center',gap:10}}>
                    <div style={{fontFamily:'var(--font-display)',fontSize:'1.2rem',width:28,textAlign:'center'}}>
                      {pos===1?'🥇':pos===2?'🥈':pos===3?'🥉':'#'+(pos||'?')}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:'var(--font-body)',fontWeight:700,fontSize:'var(--fs-sm)'}}>{s.customTitle||s.gameTitle}</div>
                      <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)',marginTop:2}}>{fmtShortDate(s.startedAt)} · {fmtDuration(s.durationMs)}</div>
                    </div>
                    {me?.survivalMs&&<div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.4)'}}>⏱ {fmtDuration(me.survivalMs)}</div>}
                  </div>
                );
              })}
            </>
          )}
          <button className="btn btn-ghost" onClick={()=>setSelectedPlayer(null)}>← Volver</button>
        </div>
      </div>
    );
  }

  const TABS=[['overview','📊 Overview'],['ranking','🏆 Ranking'],['sessions','🎮 Partidas']];

  return(
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onBack}>← Home</button>
        <div className="os-logo" style={{fontSize:'1.1rem'}}>STATS <span>OS</span></div>
        <div style={{width:70}}/>
      </div>
      <div className="os-page" style={{paddingTop:16}}>
        {/* Tabs */}
        <div style={{display:'flex',gap:5,marginBottom:16}}>
          {TABS.map(([id,lbl])=>(
            <button key={id} onClick={()=>{snd('tap');setTab(id);}}
              style={{flex:1,border:'none',borderRadius:10,padding:'9px 4px',cursor:'pointer',
                fontFamily:'var(--font-ui)',fontSize:'var(--fs-micro)',letterSpacing:1,transition:'all .18s',
                background:tab===id?'linear-gradient(135deg,var(--cyan),#00B8CC)':'rgba(255,255,255,.06)',
                color:tab===id?'var(--bg)':'rgba(255,255,255,.4)'}}>
              {lbl}
            </button>
          ))}
        </div>

        {loading&&<div style={{textAlign:'center',paddingTop:40}}><div className="os-spin" style={{marginBottom:14}}/></div>}

        {/* ── OVERVIEW ── */}
        {!loading&&tab==='overview'&&(
          <div className="anim-fade">
            {/* Big numbers */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:14}}>
              {[
                {label:'PARTIDAS',value:sessions.length,color:'var(--cyan)',icon:'🎮'},
                {label:'JUGADORES',value:players.length,color:'var(--purple)',icon:'👥'},
                {label:'TIEMPO TOTAL',value:fmtDuration(globalStats?.totalTime||0),color:'var(--green)',icon:'⏱'},
              ].map(s=>(
                <div key={s.label} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:14,padding:'14px 10px',textAlign:'center'}}>
                  <div style={{fontSize:'1.3rem',marginBottom:4}}>{s.icon}</div>
                  <div style={{fontFamily:'var(--font-display)',fontSize:'1.3rem',color:s.color,marginBottom:3}}>{s.value}</div>
                  <div style={{fontFamily:'var(--font-ui)',fontSize:'.48rem',fontWeight:700,color:'rgba(255,255,255,.3)',letterSpacing:2}}>{s.label}</div>
                </div>
              ))}
            </div>

            {globalStats&&(<>
              {/* Records */}
              <div className="os-section">🏅 RÉCORDS</div>
              {[
                {label:'Partida más larga',icon:'🐢',value:globalStats.longest?`${fmtDuration(globalStats.longest.durationMs)} — ${globalStats.longest.customTitle||globalStats.longest.gameTitle}`:'—'},
                {label:'Partida más corta',icon:'⚡',value:globalStats.shortest?`${fmtDuration(globalStats.shortest.durationMs)} — ${globalStats.shortest.customTitle||globalStats.shortest.gameTitle}`:'—'},
                {label:'Duración promedio',icon:'📊',value:fmtDuration(globalStats.avgTime)},
                {label:'Juego más jugado',icon:'🎮',value:globalStats.mostPlayed?`${globalStats.mostPlayed[0]} (${globalStats.mostPlayed[1]}×)`:'—'},
                {label:'Jugador más lento',icon:'🐌',value:globalStats.slowest?`${globalStats.slowest.emoji} ${globalStats.slowest.name} — ${fmtDuration(globalStats.slowest.survivalMs)} (${globalStats.slowest.game})`:'—'},
                {label:'Jugador más rápido',icon:'🚀',value:globalStats.fastest?`${globalStats.fastest.emoji} ${globalStats.fastest.name} — ${fmtDuration(globalStats.fastest.survivalMs)} (${globalStats.fastest.game})`:'—'},
              ].map((r,i)=>(
                <div key={i} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:'12px 14px',marginBottom:7,display:'flex',alignItems:'flex-start',gap:12}}>
                  <div style={{fontSize:'1.4rem',flexShrink:0}}>{r.icon}</div>
                  <div>
                    <div style={{fontFamily:'var(--font-ui)',fontSize:'.52rem',letterSpacing:2,color:'rgba(255,255,255,.3)',marginBottom:3}}>{r.label.toUpperCase()}</div>
                    <div style={{fontFamily:'var(--font-body)',fontWeight:700,fontSize:'var(--fs-sm)',color:'rgba(255,255,255,.8)',lineHeight:1.4}}>{r.value}</div>
                  </div>
                </div>
              ))}

              {/* Top 3 players mini */}
              {players.length>0&&(
                <>
                  <div className="os-section">👑 TOP JUGADORES</div>
                  {players.slice(0,3).map((p,i)=>{
                    const wr=p.games>0?Math.round((p.wins/p.games)*100):0;
                    return(
                      <div key={i} style={{background:'var(--surface)',border:`1px solid ${i===0?'rgba(255,212,71,.3)':'var(--border)'}`,borderRadius:12,padding:'12px 14px',marginBottom:7,display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}
                        onClick={()=>{snd('tap');setSelectedPlayer(p);}}>
                        <div style={{fontSize:'1.5rem'}}>{i===0?'🥇':i===1?'🥈':'🥉'}</div>
                        <div style={{fontSize:'1.6rem'}}>{p.emoji}</div>
                        <div style={{flex:1}}>
                          <div style={{fontFamily:'var(--font-body)',fontWeight:700,color:p.color||'#fff'}}>{p.name}</div>
                          <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)',marginTop:2}}>{p.games} partidas · {wr}% WR</div>
                        </div>
                        <div style={{textAlign:'right'}}>
                          <div style={{fontFamily:'var(--font-display)',fontSize:'1.3rem',color:i===0?'var(--gold)':'rgba(255,255,255,.5)'}}>{p.wins}</div>
                          <div style={{fontFamily:'var(--font-ui)',fontSize:'.45rem',color:'rgba(255,255,255,.25)',letterSpacing:1}}>🏆 wins</div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </>)}

            {!globalStats&&!loading&&<div className="os-empty"><div style={{fontSize:'2.5rem',marginBottom:10}}>📊</div><div>Completa partidas para ver estadísticas</div></div>}
          </div>
        )}

        {/* ── RANKING ── */}
        {!loading&&tab==='ranking'&&(
          <div className="anim-fade">
            {players.length===0&&<div className="os-empty"><div style={{fontSize:'2.5rem',marginBottom:10}}>🏆</div><div>Sin jugadores registrados aún</div></div>}
            {players.map((p,i)=>{
              const wr=p.games>0?Math.round((p.wins/p.games)*100):0;
              return(
                <div key={p.pKey||i} className={`stat-card ${i===0?'gold-border':''}`}
                  onClick={()=>{snd('tap');setSelectedPlayer(p);}}>
                  <div className="stat-rank">{i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}</div>
                  <div style={{fontSize:'1.7rem'}}>{p.emoji}</div>
                  <div style={{flex:1}}>
                    <div className="stat-name" style={{color:p.color||'#fff'}}>{p.name}</div>
                    <div className="stat-meta">{p.games||0} partidas · {wr}% WR</div>
                    {/* Mini win rate bar */}
                    <div style={{height:3,background:'rgba(255,255,255,.08)',borderRadius:2,marginTop:5,overflow:'hidden'}}>
                      <div style={{height:'100%',width:wr+'%',background:i===0?'var(--gold)':'var(--cyan)',borderRadius:2}}/>
                    </div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div className="stat-value" style={{color:i===0?'var(--gold)':'rgba(255,255,255,.5)'}}>{p.wins||0}</div>
                    <div style={{fontFamily:'var(--font-ui)',fontSize:'.45rem',color:'rgba(255,255,255,.25)',letterSpacing:1}}>🏆</div>
                  </div>
                  <div style={{color:'rgba(255,255,255,.2)',fontSize:'.95rem'}}>›</div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── PARTIDAS ── */}
        {!loading&&tab==='sessions'&&(
          <div className="anim-fade">
            {sessions.length===0&&<div className="os-empty"><div style={{fontSize:'2.5rem',marginBottom:10}}>🎮</div><div>Sin partidas registradas</div></div>}
            {sessions.map((s,i)=>(
              <div key={s.sessionId||i} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:13,padding:'13px 15px',marginBottom:8}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:'var(--fs-sm)',display:'flex',alignItems:'center',gap:6}}>
                      <span>{s.gameType==='preset:strike'?'🎳':s.gameType?.includes('template')?'🎮':'⚔️'}</span>
                      {s.customTitle||s.gameTitle}
                    </div>
                    <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)',letterSpacing:1,marginTop:2}}>
                      {fmtDate(s.startedAt)} · <strong>{fmtDuration(s.durationMs)}</strong>
                    </div>
                  </div>
                  <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',fontWeight:700,color:'rgba(255,255,255,.3)',background:'rgba(255,255,255,.06)',padding:'3px 9px',borderRadius:20}}>
                    {s.playerCount||0} jug.
                  </div>
                </div>
                {(s.players||[]).slice(0,4).map((p,pi)=>(
                  <div key={p.id||pi} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0',borderBottom:'1px solid rgba(255,255,255,.04)'}}>
                    <div style={{fontFamily:'var(--font-display)',fontSize:'.95rem',width:22,color:'rgba(255,255,255,.3)'}}>{pi===0?'🥇':pi===1?'🥈':pi===2?'🥉':'#'+(pi+1)}</div>
                    <div style={{fontSize:'1.05rem'}}>{p.emoji}</div>
                    <div style={{fontWeight:800,flex:1,fontSize:'var(--fs-sm)',color:p.color||'#fff'}}>{p.name}</div>
                    <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.4)'}}>
                      {p.survivalMs?`⏱ ${fmtDuration(p.survivalMs)}`:''}
                      {p.points?` · ${p.points}pts`:''}
                      {p.wins?` · ${p.wins}🏆`:''}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// ── GENERIC SETUP FROM TEMPLATE ───────────────────────────────────
function GenericSetupFromTemplate({template,hostPlayer,onBack,onCreateRoom}){
  const [players,setPlayers]=useState([]);
  const [newName,setNewName]=useState('');
  const [pickingFor,setPickingFor]=useState(null);
  const cfg=template.config||{};

  useEffect(()=>{
    if(hostPlayer.name) setPlayers([{...hostPlayer,isHost:true}]);
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

  if(pickingFor!==null){
    const p=players.find(pl=>pl.id===pickingFor);
    if(!p){setPickingFor(null);return null;}
    return <PlayerPicker player={p} onUpdate={(f,v)=>updatePlayer(p.id,f,v)} onClose={()=>setPickingFor(null)}/>;
  }

  return(
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onBack}>← Mis juegos</button>
        <div style={{fontSize:'1.6rem'}}>{template.emoji||'🎮'}</div>
        <div style={{width:70}}/>
      </div>
      <div className="os-page" style={{paddingTop:16}}>
        <div style={{background:'linear-gradient(135deg,rgba(155,93,229,.08),rgba(0,245,255,.04))',border:'1px solid rgba(155,93,229,.25)',borderRadius:16,padding:'16px',marginBottom:20}}>
          <div style={{fontFamily:'var(--font-display)',fontSize:'1.3rem',letterSpacing:1,marginBottom:4}}>{template.name}</div>
          {template.description&&<div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-sm)',color:'rgba(255,255,255,.45)',marginBottom:10}}>{template.description}</div>}
          <div className="os-tags">
            <div className="os-tag gold">{cfg.victoryMode==='points'?'🏅 Puntos':cfg.victoryMode==='wins'?'🏆 Victorias':cfg.victoryMode==='elimination'?'💀 Eliminación':'🎯 Manual'}</div>
            {cfg.useRounds&&<div className="os-tag">{cfg.rounds==='libre'?'∞ Libre':`${cfg.rounds} rondas`}</div>}
          </div>
        </div>

        <div className="os-section">JUGADORES · {players.length} / {cfg.maxPlayers||8}</div>
        {players.map(p=>(
          <div key={p.id} className="player-row" style={{marginBottom:8}}>
            <div style={{fontSize:'1.7rem',width:38,textAlign:'center',cursor:'pointer'}} onClick={()=>{snd('tap');setPickingFor(p.id);}}>{p.emoji}</div>
            <div style={{width:13,height:13,borderRadius:'50%',background:p.color,border:'2px solid rgba(255,255,255,.2)',flexShrink:0,cursor:'pointer'}} onClick={()=>{snd('tap');setPickingFor(p.id);}}/>
            <div className="player-name" style={{color:p.color}}>
              {p.name}{p.isHost&&<span style={{fontFamily:'var(--font-ui)',fontSize:'.5rem',color:'var(--gold)',letterSpacing:2,marginLeft:6}}>HOST</span>}
            </div>
            {!p.isHost&&<button style={{background:'none',border:'none',color:'rgba(255,59,92,.5)',fontSize:'1.2rem',cursor:'pointer',padding:'0 4px'}} onClick={()=>setPlayers(prev=>prev.filter(pl=>pl.id!==p.id))}>×</button>}
          </div>
        ))}

        <div style={{display:'flex',gap:8,marginBottom:16}}>
          <input className="os-input" style={{marginBottom:0,flex:1}} placeholder="Agregar jugador..."
            value={newName} onChange={e=>setNewName(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&addPlayer()} maxLength={20}/>
          <button style={{background:'rgba(155,93,229,.15)',border:'1px solid rgba(155,93,229,.4)',color:'var(--purple)',borderRadius:11,padding:'0 18px',cursor:'pointer',fontFamily:'var(--font-display)',fontSize:'1.2rem',flexShrink:0}} onClick={addPlayer}>+</button>
        </div>

        {players.length<(cfg.minPlayers||2)&&<div className="os-alert alert-cyan">Mínimo {cfg.minPlayers||2} jugadores</div>}
        <div className="g8"/>
        <button className="btn btn-purple" disabled={players.length<(cfg.minPlayers||2)||players.length>(cfg.maxPlayers||20)}
          onClick={()=>{snd('round');onCreateRoom({players});}}>
          🚀 CREAR SALA — {template.name}
        </button>
        <button className="btn btn-back" onClick={onBack}>← Cancelar</button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
