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
  const [tab,setTab]=useState('score'); // score | rounds
  const timerRef=useRef(null);

  useEffect(()=>{
    const unsub=db.listen(`rooms/${code}`,data=>{if(data)setRoom(data);});
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

  // Ordenar marcador
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

  // Mapa id → player para historial
  const playerMap=Object.fromEntries(players.map(p=>[p.id,p]));

  const statusLabel=room.status==='active'?'EN JUEGO':room.status==='lobby'?'LOBBY':'TERMINADA';
  const statusColor=room.status==='active'?'var(--green)':room.status==='lobby'?'var(--gold)':'var(--red)';

  return(
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onBack}>← Salir</button>
        <div>
          <div className="os-logo" style={{fontSize:'1.1rem'}}>BOARD<span>GAMEZ</span></div>
          <div className="os-logo-sub">MARCADOR EN VIVO</div>
        </div>
        <div className="room-code-badge">{code}</div>
      </div>

      <div className="os-page" style={{paddingTop:16}}>
        {/* Status */}
        <div style={{
          display:'flex',alignItems:'center',justifyContent:'space-between',
          background:'var(--surface)',border:'1px solid var(--border)',
          borderRadius:12,padding:'10px 14px',marginBottom:14
        }}>
          <div>
            <div style={{fontFamily:'var(--font-display)',fontSize:'1rem',letterSpacing:1,color:statusColor}}>
              {room.customTitle||'Partida'}
            </div>
            <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)',letterSpacing:1,marginTop:2}}>
              {players.length} jugadores · Sala {code}
            </div>
          </div>
          <div style={{textAlign:'right'}}>
            {room.status==='active'&&(
              <div className="match-timer" style={{fontSize:'1.1rem'}}>{fmtDuration(elapsed)}</div>
            )}
            <div className="os-tag" style={{background:`${statusColor}18`,borderColor:`${statusColor}44`,color:statusColor,fontSize:'var(--fs-micro)'}}>
              ● {statusLabel}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:6,marginBottom:16}}>
          {[
            ['score','📊 Marcador'],
            ['rounds',`📋 Rondas${rounds.length>0?' ('+rounds.length+')':''}`]
          ].map(([id,lbl])=>(
            <button key={id} style={{
              flex:1,border:'none',borderRadius:10,padding:'10px 4px',cursor:'pointer',
              fontFamily:'var(--font-ui)',fontSize:'var(--fs-micro)',letterSpacing:1,transition:'all .18s',
              background:tab===id?'linear-gradient(135deg,var(--cyan),#00B8CC)':'rgba(255,255,255,.06)',
              color:tab===id?'var(--bg)':'rgba(255,255,255,.4)'
            }} onClick={()=>{snd('tap');setTab(id);}}>
              {lbl}
            </button>
          ))}
        </div>

        {/* ── TAB: MARCADOR ── */}
        {tab==='score'&&(
          <>
            {sorted.map((p,i)=>{
              const isFirst=i===0&&!p.eliminated;
              const isElim=p.eliminated;
              return(
                <div key={p.id} className={`live-score-row ${isFirst?'first':''} ${isElim?'eliminated-row':''} anim-fade`}
                  style={{animationDelay:i*.04+'s'}}>
                  <div className="player-pos" style={{color:isFirst?'var(--gold)':isElim?'var(--red)':'rgba(255,255,255,.3)'}}>
                    {isElim?'💀':i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}
                  </div>
                  <div className="player-emoji">{p.emoji}</div>
                  <div style={{flex:1}}>
                    <div className="player-name" style={{color:p.color||'#fff'}}>{p.name}</div>
                    <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',fontWeight:600,color:'rgba(255,255,255,.35)',letterSpacing:1,marginTop:1}}>
                      {isStrike
                        ? (isElim ? `💀 ${p.survivalLabel||'—'}` : '⏱ En juego')
                        : (cfg.mode==='wins' ? `${p.wins||0} victorias` : `${p.total||0} pts`)
                      }
                    </div>
                  </div>
                  <div style={{fontFamily:'var(--font-display)',fontSize:'1.3rem',color:isFirst?'var(--gold)':isElim?'rgba(255,59,92,.5)':'rgba(255,255,255,.5)'}}>
                    {isStrike
                      ? (isElim ? `#${p.finalPosition}` : '✓')
                      : (cfg.mode==='wins' ? (p.wins||0)+'🏆' : (p.total||0))
                    }
                  </div>
                </div>
              );
            })}
            <div className="os-alert alert-cyan" style={{marginTop:16,justifyContent:'center',textAlign:'center'}}>
              👁 Solo lectura · Se actualiza en tiempo real
            </div>
          </>
        )}

        {/* ── TAB: HISTORIAL DE RONDAS ── */}
        {tab==='rounds'&&(
          <>
            {rounds.length===0&&(
              <div className="os-empty">
                <div style={{fontSize:'2rem',marginBottom:8}}>📋</div>
                <div>Aún no se han cerrado rondas</div>
              </div>
            )}
            {[...rounds].reverse().map((r,i)=>{
              const roundWinner=playerMap[r.winner];
              // Ordenar scores de mayor a menor
              const scoreEntries=Object.entries(r.scores||{})
                .map(([pid,score])=>({player:playerMap[pid],score}))
                .filter(e=>e.player)
                .sort((a,b)=>b.score-a.score);

              return(
                <div key={r.number||i} className="anim-fade" style={{
                  background:'var(--surface)',
                  border:`1px solid ${i===0?'rgba(0,245,255,.25)':'var(--border)'}`,
                  borderRadius:14,padding:'13px 15px',marginBottom:10
                }}>
                  {/* Header de ronda */}
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                    <div style={{fontFamily:'var(--font-display)',fontSize:'.95rem',letterSpacing:2,color:i===0?'var(--cyan)':'rgba(255,255,255,.5)'}}>
                      RONDA {r.number}
                      {i===0&&room.status==='active'&&(
                        <span style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'var(--green)',letterSpacing:1,marginLeft:8}}>ÚLTIMA</span>
                      )}
                    </div>
                    {roundWinner&&(
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <span style={{fontSize:'1.1rem'}}>{roundWinner.emoji}</span>
                        <span style={{fontFamily:'var(--font-display)',fontSize:'var(--fs-xs)',color:roundWinner.color||'var(--gold)',letterSpacing:1}}>
                          {roundWinner.name}
                        </span>
                        <span style={{color:'var(--gold)'}}>🏆</span>
                      </div>
                    )}
                  </div>

                  {/* Scores de la ronda */}
                  {scoreEntries.length>0&&(
                    <div style={{display:'flex',flexDirection:'column',gap:5}}>
                      {scoreEntries.map(({player,score},si)=>(
                        <div key={player.id} style={{
                          display:'flex',alignItems:'center',gap:8,
                          padding:'5px 8px',borderRadius:8,
                          background:player.id===r.winner?'rgba(255,212,71,.08)':'rgba(255,255,255,.03)',
                          border:`1px solid ${player.id===r.winner?'rgba(255,212,71,.2)':'transparent'}`
                        }}>
                          <div style={{fontSize:'1rem',width:24,textAlign:'center'}}>{player.emoji}</div>
                          <div style={{flex:1,fontFamily:'var(--font-body)',fontWeight:700,fontSize:'var(--fs-sm)',color:player.color||'#fff'}}>
                            {player.name}
                          </div>
                          <div style={{fontFamily:'var(--font-display)',fontSize:'var(--fs-sm)',
                            color:player.id===r.winner?'var(--gold)':'rgba(255,255,255,.55)'}}>
                            {score>0?'+':''}{score} pts
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Si es modo victorias (sin puntos individuales) */}
                  {scoreEntries.length===0&&cfg.mode==='wins'&&roundWinner&&(
                    <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-sm)',color:'rgba(255,255,255,.4)'}}>
                      Ganador de ronda: {roundWinner.emoji} {roundWinner.name}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Resumen acumulado */}
            {rounds.length>0&&(
              <>
                <div className="os-section" style={{marginTop:8}}>RESUMEN ACUMULADO</div>
                {sorted.map((p,i)=>(
                  <div key={p.id} className="live-score-row" style={{marginBottom:6}}>
                    <div className="player-pos" style={{color:i===0?'var(--gold)':'rgba(255,255,255,.3)'}}>
                      {i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}
                    </div>
                    <div className="player-emoji">{p.emoji}</div>
                    <div style={{flex:1}}>
                      <div className="player-name" style={{color:p.color||'#fff'}}>{p.name}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      {cfg.mode!=='wins'&&(
                        <div style={{fontFamily:'var(--font-display)',fontSize:'1.1rem',color:i===0?'var(--gold)':'rgba(255,255,255,.55)'}}>
                          {p.total||0} pts
                        </div>
                      )}
                      <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)',letterSpacing:1}}>
                        {p.wins||0} 🏆 victorias
                      </div>
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

  // Cargar perfil al inicio — siempre va al home, perfil se pide al crear sala
  useEffect(()=>{
    authOnChange(u=>setAuthUser(u||null));
    const p=getProfile();
    if(p&&p.name) setProfile(p);
    setScreen('home');
  },[]);

  // Pendiente de crear sala tras configurar perfil
  const [pendingAction,setPendingAction]=useState(null); // 'strike' | 'generic'

  // El myId viene del perfil guardado
  const myId=profile?.id||null;

  function goHome(){ setScreen('home'); setSession(null); setIsHost(false); setPlayTemplate(null); }

  function updateProfile(p){
    saveProfile(p);
    setProfile(p);
  }

  const hostPlayer=profile
    ? {id:profile.id,name:profile.name,emoji:profile.emoji,color:profile.color}
    : {id:'host',name:'Host',emoji:'🐉',color:'#00F5FF'};

  async function createRoom(gameType,customTitle,players,config){
    const code=uid4();
    await db.set(`rooms/${code}`,{
      code,gameType,customTitle,status:'lobby',hostId:myId,
      createdAt:Date.now(),config:config||null,
      players:players.map(p=>({
        ...p,id:p.id||uid(),total:0,wins:0,rounds:[],
        eliminated:false,finalPosition:null,survivalMs:null
      })),
      events:[]
    });
    setSession({code,demo:false,date:Date.now()});
    setIsHost(true);
    return code;
  }

  async function joinRoom(code,playerId,playerName,playerEmoji,playerColor){
    const existing=await db.get(`rooms/${code}`);
    if(!existing) return{error:'Sala no encontrada'};
    if(existing.status==='finished') return{error:'Esta partida ya terminó'};
    const players=[...(existing.players||[])];
    const alreadyIn=players.find(p=>p.id===myId||p.id===playerId);
    if(!alreadyIn){
      const byName=players.find(p=>p.name.toLowerCase()===playerName.toLowerCase());
      if(byName){
        const updated=players.map(p=>p.id===byName.id?{...p,id:myId,emoji:playerEmoji,color:playerColor}:p);
        await db.set(`rooms/${code}/players`,updated);
      } else {
        players.push({id:myId,name:playerName,emoji:playerEmoji,color:playerColor,total:0,wins:0,rounds:[],eliminated:false,finalPosition:null});
        await db.set(`rooms/${code}/players`,players);
      }
    }
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
            setScreen('generic-lobby');
          }}
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
function MainMenu({profile,onGoStrike,onGoGeneric,onGoJoin,onGoStats,onGoMyGames,onGoProfile,myId,db,authUser}){
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
  const [tab,setTab]=useState('leaderboard');
  const [players,setPlayers]=useState([]);
  const [sessions,setSessions]=useState([]);
  const [loading,setLoading]=useState(true);
  const [selectedPlayer,setSelectedPlayer]=useState(null);

  useEffect(()=>{
    async function load(){
      setLoading(true);
      try{const [lb,sess]=await Promise.all([loadLeaderboard(false),loadRecentSessions(30,false)]);
        setPlayers(lb);setSessions(sess);
      }catch(e){console.error(e);}finally{setLoading(false);}
    }
    load();
  },[]);

  if(selectedPlayer){
    const p=selectedPlayer;
    const wr=p.games>0?Math.round((p.wins/p.games)*100):0;
    return(
      <div className="os-wrap">
        <div className="os-header">
          <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={()=>setSelectedPlayer(null)}>← Ranking</button>
          <div style={{fontFamily:'var(--font-label)',fontSize:'.75rem',fontWeight:700,color:'rgba(255,255,255,.4)',letterSpacing:3}}>PERFIL</div>
          <div style={{width:70}}/>
        </div>
        <div className="os-page" style={{paddingTop:20}}>
          <div style={{textAlign:'center',marginBottom:20}}>
            <div style={{fontSize:'3.8rem',marginBottom:6}}>{p.emoji}</div>
            <div style={{fontFamily:'var(--font-display)',fontSize:'1.7rem',letterSpacing:2,color:p.color||'#fff'}}>{p.name}</div>
            <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)',letterSpacing:2,marginTop:4}}>Última: {p.lastGameTitle||'—'}</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:20}}>
            {[
              {label:'PARTIDAS',value:p.games||0,color:'var(--cyan)'},
              {label:'VICTORIAS',value:p.wins||0,color:'var(--gold)'},
              {label:'WIN RATE',value:wr+'%',color:'var(--green)'},
              {label:'MEJOR POS.',value:'#'+(p.bestPosition||'—'),color:'var(--orange)'},
              {label:'PROM. SUPERV.',value:p.avgSurvivalMs?fmtDuration(p.avgSurvivalMs):'—',color:'var(--purple)'},
              {label:'💀 1° ELIM.',value:p.firstEliminations||0,color:'var(--red)'},
            ].map(s=>(
              <div key={s.label} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:'13px 14px',textAlign:'center'}}>
                <div style={{fontFamily:'var(--font-display)',fontSize:'1.7rem',color:s.color,marginBottom:3}}>{s.value}</div>
                <div style={{fontFamily:'var(--font-ui)',fontSize:'.5rem',fontWeight:700,color:'rgba(255,255,255,.3)',letterSpacing:2}}>{s.label}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-ghost" onClick={()=>setSelectedPlayer(null)}>← Volver</button>
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
            <button key={id} style={{flex:1,border:'none',borderRadius:10,padding:'10px 4px',cursor:'pointer',fontFamily:'var(--font-ui)',fontSize:'var(--fs-micro)',letterSpacing:1,transition:'all .18s',background:tab===id?'linear-gradient(135deg,var(--cyan),#00B8CC)':'rgba(255,255,255,.06)',color:tab===id?'var(--bg)':'rgba(255,255,255,.4)'}}
              onClick={()=>{snd('tap');setTab(id);}}>
              {lbl}
            </button>
          ))}
        </div>
        {loading&&<div style={{textAlign:'center',paddingTop:40}}><div className="os-spin" style={{marginBottom:14}}/></div>}
        {!loading&&tab==='leaderboard'&&(
          <>
            {players.length===0&&<div className="os-empty"><div style={{fontSize:'2.5rem',marginBottom:10}}>📊</div><div>Completa una partida para ver el ranking</div></div>}
            {players.map((p,i)=>{
              const wr=p.games>0?Math.round((p.wins/p.games)*100):0;
              return(
                <div key={p.pKey||i} className={`stat-card ${i===0?'gold-border':''}`}
                  onClick={()=>{snd('tap');setSelectedPlayer(p);}}>
                  <div className="stat-rank">{i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}</div>
                  <div style={{fontSize:'1.7rem'}}>{p.emoji}</div>
                  <div style={{flex:1}}>
                    <div className="stat-name" style={{color:p.color||'#fff'}}>{p.name}</div>
                    <div className="stat-meta">{p.games||0} partidas · {wr}% wins{p.firstEliminations>0?` · 💀 ×${p.firstEliminations}`:''}</div>
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
            {sessions.length===0&&<div className="os-empty"><div style={{fontSize:'2.5rem',marginBottom:10}}>🎮</div><div>Sin partidas registradas</div></div>}
            {sessions.map((s,i)=>(
              <div key={s.sessionId||i} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:13,padding:'13px 15px',marginBottom:8}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:'var(--fs-sm)',display:'flex',alignItems:'center',gap:6}}>
                      <span>{s.gameType==='preset:strike'?'🎳':'⚔️'}</span>{s.customTitle||s.gameTitle}
                    </div>
                    <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)',letterSpacing:1,marginTop:2}}>
                      {fmtDate(s.startedAt)} · {fmtDuration(s.durationMs)}
                    </div>
                  </div>
                  <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',fontWeight:700,color:'rgba(255,255,255,.3)',background:'rgba(255,255,255,.06)',padding:'3px 9px',borderRadius:20}}>
                    {s.playerCount||0} jug.
                  </div>
                </div>
                {(s.players||[]).slice(0,3).map((p,pi)=>(
                  <div key={p.id||pi} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0',borderBottom:'1px solid rgba(255,255,255,.04)'}}>
                    <div style={{fontFamily:'var(--font-display)',fontSize:'.95rem',width:22,color:'rgba(255,255,255,.25)'}}>{pi===0?'🥇':pi===1?'🥈':'🥉'}</div>
                    <div style={{fontSize:'1.05rem'}}>{p.emoji}</div>
                    <div style={{fontWeight:800,flex:1,fontSize:'var(--fs-sm)',color:p.color||'#fff'}}>{p.name}</div>
                    <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.4)'}}>
                      {p.survivalLabel&&`⏱ ${p.survivalLabel}`}{p.points&&`${p.points}pts`}
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
