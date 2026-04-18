// ═══════════════════════════════════════════════════════════════
// strike.jsx — BOARDGAMEZ OS v1.5
// Fix: jugadores que se unen por código también pueden eliminarse
// Motivos de eliminación configurables
// ═══════════════════════════════════════════════════════════════

// Motivos de eliminación predeterminados (usados en Strike y modo survival)
if(window._splashStep) window._splashStep(3);
const ELIM_REASONS_DEFAULT=[
  {id:'nodice',   label:'Sin dados',    emoji:'🎲'},
  {id:'nocards',  label:'Sin cartas',   emoji:'🃏'},
  {id:'nolives',  label:'Sin vidas',    emoji:'❤️'},
  {id:'nochips',  label:'Sin fichas',   emoji:'🪙'},
  {id:'noresource',label:'Sin recursos',emoji:'📦'},
  {id:'laststand',label:'Last stand',   emoji:'⚔️'},
  {id:'timeout',  label:'Time out',     emoji:'⏱'},
  {id:'manual',   label:'Eliminado',    emoji:'💀'},
];

function StrikeGame({session,onBack,isHost,myId,db}){
  const [room,setRoom]=React.useState(null);
  const [elapsed,setElapsed]=React.useState(0);
  const [showElimPanel,setShowElimPanel]=React.useState(false);
  const [elimReason,setElimReason]=React.useState(null);
  const [presence,setPresence]=React.useState({});
  const [myEmoji,setMyEmoji]=React.useState(()=>getProfile()?.emoji||'🎉');
  const [showSpamEmojis,setShowSpamEmojis]=React.useState([]);
  const [showEndConfirm,setShowEndConfirm]=React.useState(false);
  const [elimToast,setElimToast]=React.useState(null);

  function sendEmoji(){
    if(!session?.code) return;
    snd('tap');
    const id=Date.now()+Math.random();
    const x=10+Math.random()*80;const y=20+Math.random()*60;
    setShowSpamEmojis(prev=>[...prev,{id,emoji:myEmoji,x,y}]);
    setTimeout(()=>setShowSpamEmojis(prev=>prev.filter(e=>e.id!==id)),2200);
    const spamId=uid4()+Math.random().toString(36).slice(2,5);
    const prof=getProfile();
    db.set(`rooms/${session.code}/emojiSpam/${spamId}`,{
      emoji:myEmoji,ts:Date.now(),by:prof?.name||'?',x,y
    }).catch(()=>{});
    setTimeout(()=>db.set(`rooms/${session.code}/emojiSpam/${spamId}`,null).catch(()=>{}),4000);
  }

  // Presencia — setup + listen
  React.useEffect(()=>{
    if(!session?.code||!myId) return;
    setupPresence(session.code,myId);
    const unsub=listenPresence(session.code,setPresence);
    return ()=>{ teardownPresence(); unsub&&unsub(); };
  },[session?.code,myId]);

  // Escuchar rematchCode — jugadores no-host se redirigen automáticamente
  React.useEffect(()=>{
    if(!session?.code) return;
    const unsub=db.listen(`rooms/${session.code}/rematchCode`,newCode=>{
      if(!newCode) return;
      const myIsHost=isHost||(myId&&room?.hostId&&room?.hostId===myId);
      if(!myIsHost){
        localStorage.setItem('bgos_rematch_code','strike:'+newCode);
        window.location.reload();
      }
    });
    return()=>unsub&&unsub();
  },[session?.code,room?.hostId,myId,isHost]);

  // Escuchar broadcast de eliminación
  React.useEffect(()=>{
    if(!session?.code) return;
    const unsub=db.listen(`rooms/${session.code}/lastElim`,data=>{
      if(!data||!data.ts) return;
      // Solo mostrar si es reciente (< 5s)
      if(Date.now()-data.ts>5000) return;
      setElimToast(data);
      setTimeout(()=>setElimToast(null),3000);
    });
    return ()=>unsub&&unsub();
  },[session?.code]);
  const [showEndScreen,setShowEndScreen]=React.useState(false);
  const timerRef=React.useRef(null);

  React.useEffect(()=>{
    const unsub=db.listen(`rooms/${session.code}`,data=>{if(data)setRoom(data);});
    return()=>unsub&&unsub();
  },[session.code]);

  React.useEffect(()=>{
    if(!room||room.status!=='active') return;
    const start=room.startedAt;
    timerRef.current=setInterval(()=>setElapsed(Date.now()-start),1000);
    return()=>clearInterval(timerRef.current);
  },[room?.status,room?.startedAt]);

  React.useEffect(()=>{if(room?.status==='finished')setShowEndScreen(true);},[room?.status]);

  if(!room) return(
    <div className="os-wrap"><div className="os-page" style={{paddingTop:80,textAlign:'center'}}>
      <div className="os-spin" style={{marginBottom:16}}/></div></div>
  );

  const players=room.players||[];
  const activePlayers=players.filter(p=>!p.eliminated);
  const eliminatedPlayers=players.filter(p=>p.eliminated)
    .sort((a,b)=>(b.eliminatedOrder||0)-(a.eliminatedOrder||0));

  // Derivar isHost del room para sobrevivir recargas
  const effectiveIsHost = isHost || (myId && room.hostId && room.hostId===myId);
  // Encontrar al jugador actual — buscar por myId directamente
  const me=players.find(p=>p.id===myId);
  const alreadyElim=me?.eliminated;

  // Motivos configurados en la sala o los default
  const elimReasons=(room.config?.elimReasons)||ELIM_REASONS_DEFAULT;

  async function handleSelfEliminate(reason){
    snd('elim');
    const now=Date.now();
    const elimOrder=eliminatedPlayers.length+1;
    const survivalMs=now-room.startedAt;
    const updatedPlayers=players.map(p=>{
      if(p.id!==myId) return p;
      return{
        ...p,eliminated:true,eliminatedAt:now,survivalMs,
        survivalLabel:fmtDuration(survivalMs),
        eliminatedOrder:elimOrder,
        elimReason:reason||null,
        finalPosition:players.length-eliminatedPlayers.length
      };
    });
    const remainingActive=updatedPlayers.filter(p=>!p.eliminated);
    let updates={players:updatedPlayers};
    if(remainingActive.length===1){
      const winner=remainingActive[0];
      const winnerUpdated=updatedPlayers.map(p=>{
        if(p.id!==winner.id) return p;
        return{...p,finalPosition:1,survivalMs:now-room.startedAt,
          survivalLabel:fmtDuration(now-room.startedAt)};
      });
      updates={
        players:winnerUpdated,status:'finished',endedAt:now,
        winner:{id:winner.id,name:winner.name,emoji:winner.emoji}
      };
      snd('victory');
      await saveSession({
        sessionId:session.code+"_"+room.startedAt,
        gameType:'preset:strike',gameTitle:'Strike 🎳',
        customTitle:room.customTitle||'Strike 🎳',
        startedAt:room.startedAt,endedAt:now,durationMs:now-room.startedAt,
        hostId:room.hostId,playerCount:players.length,
        players:winnerUpdated.map(p=>({
          id:p.id,name:p.name,emoji:p.emoji,color:p.color,
          finalPosition:p.finalPosition,eliminatedAt:p.eliminatedAt||null,
          survivalMs:p.survivalMs||(now-room.startedAt),
          survivalLabel:p.survivalLabel||fmtDuration(now-room.startedAt),
          points:null,wins:null
        })),
        events:room.events||[]
      },session.demo);
    }
    await db.set(`rooms/${session.code}`,{...room,...updates});
    setShowElimPanel(false);
    setElimReason(null);
    // Broadcast eliminación para que todos vean la animación
    if(!updates.status) { // no broadcast si ya terminó el juego (lo maneja la pantalla final)
      await db.set(`rooms/${session.code}/lastElim`,{
        id:myId, name:me?.name||'?', emoji:me?.emoji||'💀',
        ts:Date.now()
      });
    }
  }

  async function handleHostEliminate(targetId, reason){
    snd('elim');
    const now=Date.now();
    const elimOrder=eliminatedPlayers.length+1;
    const survivalMs=now-room.startedAt;
    const updatedPlayers=players.map(p=>{
      if(p.id!==targetId) return p;
      return{
        ...p,eliminated:true,eliminatedAt:now,survivalMs,
        survivalLabel:fmtDuration(survivalMs),
        eliminatedOrder:elimOrder,
        elimReason:reason||'manual',
        finalPosition:players.length-eliminatedPlayers.length
      };
    });
    const remainingActive=updatedPlayers.filter(p=>!p.eliminated);
    let updates={players:updatedPlayers};
    if(remainingActive.length===1){
      const winner=remainingActive[0];
      const winnerUpdated=updatedPlayers.map(p=>{
        if(p.id!==winner.id) return p;
        return{...p,finalPosition:1,survivalMs:now-room.startedAt,
          survivalLabel:fmtDuration(now-room.startedAt)};
      });
      updates={
        players:winnerUpdated,status:'finished',endedAt:now,
        winner:{id:winner.id,name:winner.name,emoji:winner.emoji}
      };
      snd('victory');
      await saveSession({
        sessionId:session.code+"_"+room.startedAt,
        gameType:'preset:strike',gameTitle:'Strike 🎳',
        customTitle:room.customTitle||'Strike 🎳',
        startedAt:room.startedAt,endedAt:now,durationMs:now-room.startedAt,
        hostId:room.hostId,playerCount:players.length,
        players:winnerUpdated.map(p=>({
          id:p.id,name:p.name,emoji:p.emoji,color:p.color,
          finalPosition:p.finalPosition,eliminatedAt:p.eliminatedAt||null,
          survivalMs:p.survivalMs||(now-room.startedAt),
          survivalLabel:p.survivalLabel||fmtDuration(now-room.startedAt),
          points:null,wins:null
        })),
        events:room.events||[]
      },session.demo);
    }
    await db.set(`rooms/${session.code}`,{...room,...updates});
  }

  async function handleHostEndMatch(){
    const now=Date.now();
    const sorted=[...players].sort((a,b)=>{
      if(!a.eliminated&&b.eliminated) return -1;
      if(a.eliminated&&!b.eliminated) return 1;
      return (b.eliminatedOrder||0)-(a.eliminatedOrder||0);
    });
    const winner=sorted[0];
    const winnerUpdated=players.map(p=>p.id===winner.id?{...p,finalPosition:1,survivalMs:now-room.startedAt,survivalLabel:fmtDuration(now-room.startedAt)}:p);
    await saveSession({
      sessionId:session.code+"_"+room.startedAt,
      gameType:'preset:strike',gameTitle:'Strike 🎳',
      customTitle:room.customTitle||'Strike 🎳',
      startedAt:room.startedAt,endedAt:now,durationMs:now-room.startedAt,
      hostId:room.hostId,playerCount:players.length,
      players:winnerUpdated.map(p=>({
        id:p.id,name:p.name,emoji:p.emoji,color:p.color,
        finalPosition:p.finalPosition,eliminatedAt:p.eliminatedAt||null,
        survivalMs:p.survivalMs||(now-room.startedAt),
        survivalLabel:p.survivalLabel||fmtDuration(now-room.startedAt),
        points:null,wins:null
      })),
      events:room.events||[]
    },session.demo);
    await db.set(`rooms/${session.code}`,{...room,players:winnerUpdated,status:'finished',endedAt:now,winner:{id:winner.id,name:winner.name,emoji:winner.emoji}});
    snd('victory');
  }

  if(showEndScreen) return <StrikeEndScreen room={room} myId={myId} onBack={onBack} session={session} db={db}/>;

  return(
    <div className="os-wrap">
      {/* Eliminación broadcast toast */}
      {/* Emoji spam local */}
      {showSpamEmojis.map(e=>(
        <div key={e.id} style={{position:'fixed',left:`${e.x}%`,top:`${e.y}%`,
          zIndex:9998,pointerEvents:'none',fontSize:'2.8rem',
          animation:'emojiFloat 2s ease-out forwards',textShadow:'0 2px 8px rgba(0,0,0,.5)'}}>
          {e.emoji}
        </div>
      ))}
      {elimToast && (
        <div style={{
          position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:9999,
          display:'flex',alignItems:'center',justifyContent:'center',
          pointerEvents:'none',
        }}>
          <div style={{
            background:'linear-gradient(135deg,rgba(255,59,92,.95),rgba(180,0,40,.9))',
            border:'2px solid rgba(255,59,92,.6)',
            borderRadius:20,padding:'24px 32px',textAlign:'center',
            animation:'popIn .3s ease',
            boxShadow:'0 20px 60px rgba(255,59,92,.6)',
          }}>
            <div style={{fontSize:'3rem',marginBottom:8}}>{elimToast.emoji}</div>
            <div style={{fontFamily:'var(--font-display)',fontSize:'1.4rem',
              letterSpacing:2,color:'#fff',marginBottom:4}}>
              💀 ELIMINADO
            </div>
            <div style={{fontFamily:'var(--font-body)',fontWeight:700,
              fontSize:'1.1rem',color:'rgba(255,220,220,.9)'}}>
              {elimToast.name}
            </div>
          </div>
        </div>
      )}
      <div className="os-header">
        <div>
          <div className="os-logo">BOARD<span>GAMEZ</span></div>
          <div className="os-logo-sub">OS · STRIKE 🎳</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div className="room-code-badge">{session.code}</div>
          <div style={{textAlign:'right'}}>
            <div className="match-timer" style={{fontSize:'1.1rem'}}>{fmtDuration(elapsed)}</div>
            <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.3)',letterSpacing:1}}>
              {activePlayers.length} EN PIE
            </div>
          </div>
        </div>
      </div>

      <div className="os-page" style={{paddingTop:16}}>
        <div className="match-header anim-fade">
          <div>
            <div className="match-title">{room.customTitle||'Strike 🎳'}</div>
            <div className="match-meta">SALA {session.code} · {players.length} JUGADORES</div>
          </div>
          <div className="os-tag green">● EN JUEGO</div>
        </div>

        {/* ── PANEL HOST: terminar + eliminar ── */}
        {effectiveIsHost && (
          <>
            {/* Confirmación de terminar */}
            {showEndConfirm && (
              <div style={{position:'fixed',inset:0,zIndex:999,background:'rgba(0,0,0,.85)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
                <div className="anim-pop" style={{background:'#0D0D1C',border:'2px solid rgba(255,59,92,.4)',borderRadius:20,padding:'28px 22px',width:'100%',maxWidth:340,textAlign:'center'}}>
                  <div style={{fontSize:'3rem',marginBottom:12}}>🏁</div>
                  <div style={{fontFamily:'var(--font-display)',fontSize:'1.2rem',letterSpacing:2,color:'var(--red)',marginBottom:8}}>TERMINAR PARTIDA</div>
                  <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(255,255,255,.45)',marginBottom:20}}>
                    ¿Estás seguro? Se guardarán las estadísticas y se mostrará el resultado final.
                  </div>
                  <div style={{display:'flex',gap:10}}>
                    <button className="btn btn-ghost" style={{flex:1,marginBottom:0}} onClick={()=>setShowEndConfirm(false)}>Cancelar</button>
                    <button className="btn btn-red" style={{flex:1,marginBottom:0}} onClick={()=>{setShowEndConfirm(false);handleHostEndMatch();}}>🏁 Terminar</button>
                  </div>
                </div>
              </div>
            )}
            {/* Botón terminar — siempre visible */}
            <button style={{
              width:'100%',padding:'16px 20px',borderRadius:14,border:'2px solid rgba(255,59,92,.35)',
              background:'rgba(255,59,92,.12)',color:'var(--red)',cursor:'pointer',
              fontFamily:'var(--font-display)',fontSize:'1rem',letterSpacing:1,
              display:'flex',alignItems:'center',justifyContent:'center',gap:8,
              boxShadow:'0 4px 16px rgba(255,59,92,.12)',marginBottom:10,
            }} onClick={()=>{snd('tap');setShowEndConfirm(true);}}>
              🏁 Terminar partida
            </button>
            {/* Eliminar jugadores */}
            {activePlayers.length > 0 && (
              <div style={{background:'rgba(255,59,92,.04)',border:'1px solid rgba(255,59,92,.15)',borderRadius:14,padding:'12px 14px',marginBottom:14}}>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,59,92,.5)',letterSpacing:2,marginBottom:8}}>⚙️ ELIMINAR JUGADOR</div>
                <div style={{display:'flex',flexDirection:'column',gap:5}}>
                  {activePlayers.filter(p=>p.id!==myId).map(p=>(
                    <div key={p.id} style={{display:'flex',alignItems:'center',gap:10,background:'rgba(255,255,255,.03)',borderRadius:10,padding:'8px 12px'}}>
                      <div style={{fontSize:'1.3rem'}}>{p.emoji}</div>
                      <div style={{flex:1,fontFamily:'var(--font-body)',fontWeight:700,fontSize:'var(--fs-sm)',color:p.color||'#fff'}}>{p.name}</div>
                      <button style={{background:'rgba(255,59,92,.15)',border:'1px solid rgba(255,59,92,.3)',color:'var(--red)',borderRadius:8,padding:'6px 12px',cursor:'pointer',fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',fontWeight:700}}
                        onClick={()=>handleHostEliminate(p.id,'manual')}>💀 Elim.</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── PANEL DE ELIMINACIÓN — grande, visible para el propio jugador ── */}
        {/* Emoji spam button — para todos los jugadores */}
        {me && !alreadyElim && (
          <div style={{marginBottom:8}}>
            <div style={{display:'flex',gap:8,marginBottom:6}}>
              {/* Cycle through fun emojis */}
              {['🔥','💥','⚡','🎉','❤️','💀','👑','😈','🤡','🚀'].map(e=>(
                <button key={e} onClick={()=>{snd('tap');setMyEmoji(e);}}
                  style={{width:36,height:36,borderRadius:8,border:`2px solid ${myEmoji===e?'var(--cyan)':'rgba(255,255,255,.1)'}`,
                    background:myEmoji===e?'rgba(0,245,255,.15)':'rgba(255,255,255,.05)',
                    cursor:'pointer',fontSize:'1.2rem',flexShrink:0}}>
                  {e}
                </button>
              ))}
            </div>
            <button onClick={sendEmoji}
              style={{width:'100%',height:48,borderRadius:12,border:'2px solid rgba(0,245,255,.2)',
                background:'rgba(0,245,255,.08)',cursor:'pointer',
                fontFamily:'var(--font-display)',fontSize:'.85rem',letterSpacing:2,color:'var(--cyan)',
                display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              <span style={{fontSize:'1.4rem'}}>{myEmoji}</span> ENVIAR A TODOS
            </button>
          </div>
        )}
        {!alreadyElim && me && (
          <div className="anim-slide" style={{marginBottom:20}}>
            {!showElimPanel ? (
              <button className="btn-elim-big" onClick={()=>{snd('tap');setShowElimPanel(true);}}>
                💀 ME QUEDÉ SIN...
              </button>
            ) : (
              <div style={{
                background:'linear-gradient(135deg,rgba(255,59,92,.12),rgba(200,20,50,.06))',
                border:'2px solid rgba(255,59,92,.4)',borderRadius:18,padding:16
              }}>
                <div style={{
                  fontFamily:'var(--font-display)',fontSize:'1rem',letterSpacing:2,
                  color:'var(--red)',textAlign:'center',marginBottom:14
                }}>¿POR QUÉ TE ELIMINASTE?</div>

                {/* Grid de motivos */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
                  {elimReasons.map(r=>(
                    <button key={r.id}
                      style={{
                        padding:'12px 8px',borderRadius:12,border:'none',cursor:'pointer',
                        background:elimReason===r.id?'rgba(255,59,92,.3)':'rgba(255,255,255,.06)',
                        color:elimReason===r.id?'#fff':'rgba(255,255,255,.6)',
                        fontFamily:'var(--font-body)',fontWeight:700,
                        fontSize:'var(--fs-sm)',transition:'all .15s',
                        boxShadow:elimReason===r.id?'0 0 16px rgba(255,59,92,.4)':'none',
                        border:`1px solid ${elimReason===r.id?'rgba(255,59,92,.6)':'rgba(255,255,255,.1)'}`
                      }}
                      onClick={()=>{snd('tap');setElimReason(r.id);}}>
                      <div style={{fontSize:'1.5rem',marginBottom:4}}>{r.emoji}</div>
                      {r.label}
                    </button>
                  ))}
                </div>

                <div style={{display:'flex',gap:8}}>
                  <button className="btn btn-ghost btn-sm" style={{flex:1,marginBottom:0}}
                    onClick={()=>{setShowElimPanel(false);setElimReason(null);}}>
                    Cancelar
                  </button>
                  <button className="btn btn-red" style={{flex:1,marginBottom:0}}
                    onClick={()=>handleSelfEliminate(elimReason)}>
                    💀 {elimReason
                      ? elimReasons.find(r=>r.id===elimReason)?.label||'Confirmar'
                      : 'Confirmar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {alreadyElim && me && (
          <div className="os-alert alert-red anim-fade" style={{marginBottom:16,fontSize:'var(--fs-sm)'}}>
            💀 {me.elimReason ? elimReasons.find(r=>r.id===me.elimReason)?.label||'Eliminado' : 'Eliminado'}
            {' '}en <strong>{me.survivalLabel||'—'}</strong> · Posición #{me.finalPosition}
          </div>
        )}

        {/* EN JUEGO */}
        <div className="os-section">EN JUEGO · {activePlayers.length}</div>
        <div className="survival-grid">
          {activePlayers.map((p,i)=>(
            <div key={p.id} className="survival-card in-game anim-fade" style={{animationDelay:i*.05+'s'}}>
              <div className="player-emoji">{p.emoji}</div>
              <div className="survival-info">
                <div className="survival-name" style={{color:p.color||'#fff',display:'flex',alignItems:'center',gap:5}}>
                  <StatusDot pid={p.id} presence={presence} eliminated={p.eliminated}/>
                  {p.name}
                  {p.id===myId&&<span style={{fontFamily:'var(--font-ui)',fontSize:'.5rem',color:'var(--cyan)',letterSpacing:2,marginLeft:4}}>TÚ</span>}
                </div>
                <div className="survival-time live">⏱ {fmtDuration(elapsed)}</div>
              </div>
              <div className="os-tag green" style={{fontSize:'var(--fs-micro)'}}>ACTIVO</div>
            </div>
          ))}
        </div>

        {eliminatedPlayers.length>0&&(
          <>
            <div className="os-section">ELIMINADOS · {eliminatedPlayers.length}</div>
            <div className="survival-grid">
              {eliminatedPlayers.map(p=>{
                const reason=p.elimReason?elimReasons.find(r=>r.id===p.elimReason):null;
                return(
                  <div key={p.id} className="survival-card eliminated">
                    <div style={{fontFamily:'var(--font-display)',fontSize:'1.1rem',width:28,textAlign:'center',flexShrink:0,color:'rgba(255,59,92,.6)'}}>
                      #{p.finalPosition||(players.length)}
                    </div>
                    <div className="player-emoji" style={{opacity:.5}}>{p.emoji}</div>
                    <div className="survival-info">
                      <div className="survival-name" style={{color:p.color||'#fff'}}>{p.name}</div>
                      <div className="survival-time">
                        {reason?`${reason.emoji} ${reason.label} · `:'💀 '}
                        {p.survivalLabel||'—'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {effectiveIsHost&&activePlayers.length<=1&&room.status!=='finished'&&(
          <button className="btn btn-orange" onClick={async()=>{
            snd('round');
            await db.set(`rooms/${session.code}/status`,'finished');
          }}>🏁 Cerrar partida</button>
        )}

        <div className="g16"/>
        <button className="btn btn-ghost" onClick={onBack}>← Volver al menú</button>
      </div>
    </div>
  );
}

function StrikeEndScreen({room,myId,onBack,session,db}){
  const players=[...(room.players||[])].sort((a,b)=>(a.finalPosition||99)-(b.finalPosition||99));
  const winner=players.find(p=>p.finalPosition===1);
  const confetti=Array.from({length:30},(_,i)=>({
    id:i,c:['#FFD447','#FF6B35','#00F5FF','#00FF9D','#9B5DE5','#FF3B5C'][i%6],
    l:Math.round(Math.random()*100)+"%",dl:Math.round(Math.random()*20)/10+"s",
    dr:Math.round((2+Math.random()*2.5)*10)/10+"s",sz:Math.round(6+Math.random()*8)+"px"
  }));
  React.useEffect(()=>{snd('victory');},[]);
  const totalDuration=room.endedAt&&room.startedAt?fmtDuration(room.endedAt-room.startedAt):'—';
  const elimReasons=ELIM_REASONS_DEFAULT;

  return(
    <div className="end-screen">
      <div className="end-confetti">
        {confetti.map(d=>(
          <div key={d.id} style={{position:'absolute',background:d.c,width:d.sz,height:d.sz,left:d.l,top:-20,
            borderRadius:Math.random()>.5?'50%':'3px',animation:`confettiFall ${d.dr} ${d.dl} linear infinite`}}/>
        ))}
      </div>
      <div className="end-trophy">🎳</div>
      <div className="end-label">ÚLTIMO EN PIE</div>
      <div className="end-gamename">{(room.customTitle||'STRIKE').toUpperCase()}</div>
      {winner&&(
        <>
          <div style={{fontSize:'2.6rem',marginBottom:6}}>{winner.emoji}</div>
          <div className="end-winner-name" style={{color:winner.color||'#fff'}}>{winner.name}</div>
          <div className="end-stats">SOBREVIVIÓ {winner.survivalLabel||totalDuration}</div>
        </>
      )}
      <div style={{width:'100%',maxWidth:380,marginBottom:24}}>
        {players.map((p,i)=>{
          const reason=p.elimReason?elimReasons.find(r=>r.id===p.elimReason):null;
          return(
            <div key={p.id} className={`player-row ${i===0?'winner-row':'eliminated'}`}
              style={{marginBottom:6,opacity:p.eliminated?.55:1}}>
              <div className="player-pos">{i===0?'🏆':i===1?'🥈':i===2?'🥉':`#${i+1}`}</div>
              <div className="player-emoji">{p.emoji}</div>
              <div style={{flex:1}}>
                <div className="player-name" style={{color:p.color||'#fff'}}>
                  {p.name}{p.id===myId&&<span style={{fontFamily:'var(--font-ui)',fontSize:'.5rem',color:'var(--cyan)',letterSpacing:2,marginLeft:5}}>TÚ</span>}
                </div>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',fontWeight:600,color:'rgba(255,255,255,.35)',letterSpacing:1,marginTop:1}}>
                  {p.eliminated
                    ? `${reason?reason.emoji+' '+reason.label:'💀'} · ${p.survivalLabel||'—'}`
                    : `⏱ ${p.survivalLabel||totalDuration}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button className="btn btn-cyan" style={{maxWidth:320}} onClick={onBack}>🏠 Volver al menú</button>
      {myId===room.hostId && (
        <button className="btn btn-ghost" style={{maxWidth:320,marginTop:8}} onClick={async()=>{
          const code=uid4();
          const newPlayers=(room.players||[]).map(p=>({
            ...p,total:0,wins:0,rounds:[],lives:5,
            eliminated:false,finalPosition:null,survivalMs:null,elimReason:null,
            activeShield:false,activeBlock:false,activeDouble:false,
          }));
          const db2=makeDB(false);
          await db2.set(`rooms/${code}`,{
            code,gameType:'preset:strike',
            customTitle:(room.customTitle||'Strike 🎳')+' (revancha)',
            status:'lobby',hostId:myId,createdAt:Date.now(),
            config:room.config||null,players:newPlayers,events:[]
          });
          saveActiveSession({code,isHost:true,gameType:'preset:strike',screen:'strike-lobby',myId});
          // Broadcast to all players via Firebase
          await db2.set(`rooms/${session.code}/rematchCode`, code);
          localStorage.setItem('bgos_rematch_code','strike:'+code);
          window.location.reload();
        }}>🔁 Revancha — mismos jugadores</button>
      )}
      {myId!==room.hostId && (
        <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',
          color:'rgba(255,255,255,.3)',letterSpacing:1,marginTop:8,textAlign:'center'}}>
          ⏳ Esperando decisión del host para revancha
        </div>
      )}
    </div>
  );
}

function StrikeLobby({session,onBack,onStart,isHost,myId,db}){
  const [room,setRoom]=React.useState(null);
  React.useEffect(()=>{
    const unsub=db.listen(`rooms/${session.code}`,data=>{if(data)setRoom(data);});
    return()=>unsub&&unsub();
  },[session.code]);
  React.useEffect(()=>{if(room?.status==='active')onStart();},[room?.status]);

  const players=room?.players||[];
  const effectiveIsHost=isHost||(myId&&room?.hostId&&room?.hostId===myId);
  const [presence,setPresence]=React.useState({});
  const [myEmoji,setMyEmoji]=React.useState(()=>getProfile()?.emoji||'🎉');
  const [showSpamEmojis,setShowSpamEmojis]=React.useState([]);

  function sendEmoji(){
    if(!session?.code) return;
    snd('tap');
    const id=Date.now()+Math.random();
    const x=10+Math.random()*80;const y=20+Math.random()*60;
    setShowSpamEmojis(prev=>[...prev,{id,emoji:myEmoji,x,y}]);
    setTimeout(()=>setShowSpamEmojis(prev=>prev.filter(e=>e.id!==id)),2200);
    const spamId=uid4()+Math.random().toString(36).slice(2,5);
    const prof=getProfile();
    db.set(`rooms/${session.code}/emojiSpam/${spamId}`,{
      emoji:myEmoji,ts:Date.now(),by:prof?.name||'?',x,y
    }).catch(()=>{});
    setTimeout(()=>db.set(`rooms/${session.code}/emojiSpam/${spamId}`,null).catch(()=>{}),4000);
  }
  React.useEffect(()=>{
    if(!session?.code||!myId) return;
    setupPresence(session.code,myId);
    const unsub=listenPresence(session.code,setPresence);
    return ()=>{ teardownPresence(); unsub&&unsub(); };
  },[session?.code,myId]);

  async function startGame(){
    snd('round');
    const now=Date.now();
    await db.set(`rooms/${session.code}`,{...room,status:'active',startedAt:now,
      events:[{type:'match_start',ts:now}]});
  }

  return(
    <div className="os-wrap">
      <div className="os-header">
        <div><div className="os-logo">BOARD<span>GAMEZ</span></div><div className="os-logo-sub">OS · STRIKE 🎳</div></div>
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
        {players.length<2&&<div className="os-alert alert-cyan">⏳ Mínimo 2 jugadores...</div>}
        <div className="g16"/>
        {effectiveIsHost
          ? <button className="btn btn-cyan" onClick={startGame} disabled={players.length<2}>🎳 INICIAR STRIKE</button>
          : <div className="os-alert alert-cyan" style={{textAlign:'center',justifyContent:'center'}}>⏳ Esperando que el host inicie...</div>
        }
        <button className="btn btn-back" onClick={onBack}>← Volver</button>
      </div>
    </div>
  );
}

function StrikeHostSetup({onBack,hostPlayer,onUpdateProfile,onCreateRoom}){
  const [title,setTitle]=React.useState('Strike 🎳');
  const [players,setPlayers]=React.useState([]);
  const [newName,setNewName]=React.useState('');
  const [pickingFor,setPickingFor]=React.useState(null);

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
  function updatePlayer(id,f,v){
    setPlayers(prev=>prev.map(p=>p.id===id?{...p,[f]:v}:p));
    const p=players.find(pl=>pl.id===id);
    if(p?.isHost&&onUpdateProfile){
      onUpdateProfile({...hostPlayer,[f]:v});
    }
  }

  if(pickingFor!==null){
    const p=players.find(pl=>pl.id===pickingFor);
    if(!p){setPickingFor(null);return null;}
    // Use PlayerPicker from components.jsx
    return(
      <div className="os-wrap">
        <div className="os-header">
          <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={()=>setPickingFor(null)}>← Listo</button>
          <div style={{fontFamily:'var(--font-label)',fontSize:'.75rem',fontWeight:700,color:'rgba(255,255,255,.5)',letterSpacing:3}}>{p.name.toUpperCase()}</div>
          <div style={{width:70}}/>
        </div>
        <div className="os-page" style={{paddingTop:16}}>
          <div className="picker-grid">
            {EMOJIS.map((e,i)=>(
              <div key={i} className={`picker-item ${p.emoji===e?'sel':''}`}
                onClick={()=>{snd('tap');updatePlayer(p.id,'emoji',e);}}>
                {e}
              </div>
            ))}
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:10,padding:'8px 0'}}>
            {COLORS.map((c,i)=>(
              <div key={i} className={`color-dot ${p.color===c?'sel':''}`}
                style={{background:c}} onClick={()=>{snd('tap');updatePlayer(p.id,'color',c);}}/>
            ))}
          </div>
        </div>
      </div>
    );
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
        {players.map(p=>(
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
                onClick={()=>setPlayers(prev=>prev.filter(pl=>pl.id!==p.id))}>×</button>
            )}
          </div>
        ))}

        <div style={{display:'flex',gap:8,marginBottom:8}}>
          <input className="os-input" style={{marginBottom:0,flex:1}}
            placeholder="Agregar jugador..." value={newName}
            onChange={e=>setNewName(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&addPlayer()} maxLength={20}/>
          <button style={{background:'rgba(255,107,53,.15)',border:'1px solid rgba(255,107,53,.4)',color:'var(--orange)',borderRadius:11,padding:'0 18px',cursor:'pointer',fontFamily:'var(--font-display)',fontSize:'1.2rem',flexShrink:0}}
            onClick={addPlayer}>+</button>
        </div>

        {/* Jugadores habituales */}
        {(()=>{
          const contacts=getSavedPlayers();
          const usedNames=players.map(p=>p.name.toLowerCase());
          const available=contacts.filter(c=>!usedNames.includes(c.name.toLowerCase()));
          if(!available.length) return null;
          return(
            <div style={{marginBottom:14}}>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)',letterSpacing:2,marginBottom:7}}>
                ⭐ JUGADORES HABITUALES
              </div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {available.slice(0,10).map(p=>(
                  <button key={p.id} onClick={()=>{
                    snd('join');
                    setPlayers(prev=>[...prev,{id:p.id||uid_fn(),name:p.name,emoji:p.emoji||'🎮',color:p.color||'#fff',isHost:false}]);
                  }}
                    style={{display:'flex',alignItems:'center',gap:6,padding:'7px 11px',borderRadius:11,border:'none',cursor:'pointer',background:'rgba(255,255,255,.08)',transition:'all .15s'}}>
                    <span style={{fontSize:'1.1rem'}}>{p.emoji}</span>
                    <span style={{fontFamily:'var(--font-body)',fontWeight:700,fontSize:'var(--fs-sm)',color:p.color||'#fff'}}>{p.name}</span>
                    <span style={{color:'rgba(0,255,157,.6)',fontSize:'.9rem'}}>+</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {players.length>=2&&(
          <div className="os-alert alert-green" style={{marginBottom:12}}>
            ✓ {players.length} jugadores · timestamps automáticos
          </div>
        )}
        <button className="btn btn-orange" disabled={players.length<2||!title.trim()}
          onClick={()=>{snd('round');onCreateRoom({title:title.trim(),players});}}>
          🎳 CREAR SALA DE STRIKE
        </button>
        <button className="btn btn-back" onClick={onBack}>← Cancelar</button>
      </div>
    </div>
  );
}
