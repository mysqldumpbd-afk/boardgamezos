// ═══════════════════════════════════════════════════════════════
// strike.jsx — BOARDGAMEZ OS
// Preset: Strike 🎳 — Modo Supervivencia
// Lógica: auto-eliminación, timestamps, stats por jugador
// ═══════════════════════════════════════════════════════════════

// StrikeGame — componente principal del preset Strike
function StrikeGame({ session, onBack, isHost, myId, db }){
  const { useState, useEffect, useRef, useCallback } = React;

  const [room, setRoom] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [showElimConfirm, setShowElimConfirm] = useState(false);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const timerRef = useRef(null);

  // Escuchar sala en tiempo real
  useEffect(() => {
    const unsub = db.listen(`rooms/${session.code}`, data => {
      if(data) setRoom(data);
    });
    return () => unsub && unsub();
  }, [session.code]);

  // Timer global de partida
  useEffect(() => {
    if(!room || room.status !== 'active') return;
    const start = room.startedAt;
    timerRef.current = setInterval(() => {
      setElapsed(Date.now() - start);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [room?.status, room?.startedAt]);

  // Detectar fin de partida
  useEffect(() => {
    if(room?.status === 'finished') setShowEndScreen(true);
  }, [room?.status]);

  if(!room) return (
    <div className="os-wrap">
      <div className="os-page" style={{paddingTop:80,textAlign:'center'}}>
        <div className="os-spin" style={{marginBottom:16}}/>
        <div style={{fontFamily:'var(--font-label)',color:'rgba(255,255,255,.4)',letterSpacing:2}}>CARGANDO PARTIDA...</div>
      </div>
    </div>
  );

  const players = room.players || [];
  const activePlayers = players.filter(p => !p.eliminated);
  const eliminatedPlayers = players.filter(p => p.eliminated).sort((a,b) => (b.eliminatedOrder||0) - (a.eliminatedOrder||0));
  const me = players.find(p => p.id === myId);
  const alreadyElim = me?.eliminated;
  const isWinner = room.status === 'finished' && players.find(p => p.id === myId)?.finalPosition === 1;

  // Auto-eliminación
  async function handleSelfEliminate(){
    snd('elim');
    const now = Date.now();
    const elimOrder = eliminatedPlayers.length + 1;
    const survivalMs = now - room.startedAt;

    const updatedPlayers = players.map(p => {
      if(p.id !== myId) return p;
      return {
        ...p,
        eliminated: true,
        eliminatedAt: now,
        survivalMs,
        survivalLabel: fmtDuration(survivalMs),
        eliminatedOrder: elimOrder,
        finalPosition: players.length - eliminatedPlayers.length
      };
    });

    // Si solo queda 1 activo después de esta eliminación → terminar partida
    const remainingActive = updatedPlayers.filter(p => !p.eliminated);
    let updates = { players: updatedPlayers };

    if(remainingActive.length === 1){
      const winner = remainingActive[0];
      const winnerUpdated = updatedPlayers.map(p => {
        if(p.id !== winner.id) return p;
        return {
          ...p,
          finalPosition: 1,
          survivalMs: now - room.startedAt,
          survivalLabel: fmtDuration(now - room.startedAt)
        };
      });
      updates = {
        players: winnerUpdated,
        status: 'finished',
        endedAt: now,
        winner: { id: winner.id, name: winner.name, emoji: winner.emoji }
      };
      snd('victory');

      // Guardar estadísticas
      await saveSession({
        sessionId: session.code + "_" + room.startedAt,
        gameType: 'preset:strike',
        gameTitle: 'Strike 🎳',
        customTitle: room.customTitle || 'Strike 🎳',
        startedAt: room.startedAt,
        endedAt: now,
        durationMs: now - room.startedAt,
        hostId: room.hostId,
        playerCount: players.length,
        players: winnerUpdated.map(p => ({
          id: p.id, name: p.name, emoji: p.emoji, color: p.color,
          finalPosition: p.finalPosition,
          eliminatedAt: p.eliminatedAt || null,
          survivalMs: p.survivalMs || (now - room.startedAt),
          survivalLabel: p.survivalLabel || fmtDuration(now - room.startedAt),
          points: null, wins: null
        })),
        events: room.events || []
      }, session.demo);
    }

    await db.set(`rooms/${session.code}`, { ...room, ...updates });
    setShowElimConfirm(false);
  }

  if(showEndScreen) return (
    <StrikeEndScreen
      room={room}
      myId={myId}
      onBack={onBack}
    />
  );

  return (
    <div className="os-wrap">
      {/* Header */}
      <div className="os-header">
        <div>
          <div className="os-logo">BOARD<span>GAMEZ</span></div>
          <div className="os-logo-sub">OS · STRIKE 🎳</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div className="match-timer">{fmtDuration(elapsed)}</div>
          <div style={{fontFamily:'var(--font-label)',fontSize:'.6rem',color:'rgba(255,255,255,.3)',letterSpacing:2}}>
            {activePlayers.length} EN PIE
          </div>
        </div>
      </div>

      <div className="os-page" style={{paddingTop:16}}>

        {/* Info de partida */}
        <div className="match-header anim-fade">
          <div>
            <div className="match-title">{room.customTitle || 'Strike 🎳'}</div>
            <div className="match-meta">
              SALA {session.code} · {players.length} JUGADORES
            </div>
          </div>
          <div className="os-tag green">● EN JUEGO</div>
        </div>

        {/* Botón de auto-eliminación — solo si sigues activo */}
        {!alreadyElim && me && (
          <div className="anim-slide" style={{
            background:'linear-gradient(135deg,rgba(255,59,92,.1),rgba(255,59,92,.04))',
            border:'1px solid rgba(255,59,92,.35)',
            borderRadius:16, padding:16, marginBottom:16
          }}>
            <div style={{
              fontFamily:'var(--font-label)',fontSize:'.7rem',fontWeight:700,
              color:'rgba(255,255,255,.45)',letterSpacing:3,marginBottom:10,
              textAlign:'center',textTransform:'uppercase'
            }}>
              ¿TE QUEDASTE SIN DADOS?
            </div>
            {!showElimConfirm ? (
              <button
                className="btn btn-red"
                onClick={() => { snd('tap'); setShowElimConfirm(true); }}
              >
                💀 Me elimino
              </button>
            ) : (
              <div>
                <div style={{
                  fontFamily:'var(--font-body)',fontSize:'.85rem',
                  color:'rgba(255,255,255,.7)',textAlign:'center',marginBottom:12,fontWeight:700
                }}>
                  ¿Confirmas que te quedaste sin dados?
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button className="btn btn-ghost btn-sm" style={{flex:1}}
                    onClick={() => setShowElimConfirm(false)}>
                    Cancelar
                  </button>
                  <button className="btn btn-red btn-sm" style={{flex:1}}
                    onClick={handleSelfEliminate}>
                    💀 Confirmar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {alreadyElim && (
          <div className="os-alert alert-red anim-fade" style={{marginBottom:16}}>
            💀 Eliminado en {me?.survivalLabel || '—'} · Posición #{me?.finalPosition}
          </div>
        )}

        {/* Jugadores activos */}
        <div className="os-section">EN JUEGO · {activePlayers.length}</div>
        <div className="survival-grid">
          {activePlayers.map((p, i) => (
            <div key={p.id} className="survival-card in-game anim-fade"
              style={{animationDelay: i * 0.05 + 's'}}>
              <div className="player-emoji">{p.emoji}</div>
              <div className="survival-info">
                <div className="survival-name" style={{color: p.color || '#fff'}}>
                  {p.name}
                  {p.id === myId && <span style={{
                    fontFamily:'var(--font-ui)',fontSize:'.5rem',
                    color:'var(--cyan)',letterSpacing:2,marginLeft:6
                  }}>TÚ</span>}
                </div>
                <div className="survival-time live">⏱ Contando...</div>
              </div>
              <div className="os-tag green" style={{fontSize:'.6rem'}}>ACTIVO</div>
            </div>
          ))}
        </div>

        {/* Jugadores eliminados */}
        {eliminatedPlayers.length > 0 && (
          <>
            <div className="os-section">ELIMINADOS · {eliminatedPlayers.length}</div>
            <div className="survival-grid">
              {eliminatedPlayers.map((p, i) => (
                <div key={p.id} className="survival-card eliminated">
                  <div style={{
                    fontFamily:'var(--font-display)',fontSize:'1.1rem',
                    width:28,textAlign:'center',flexShrink:0,
                    color:'rgba(255,59,92,.6)'
                  }}>
                    #{p.finalPosition || (players.length - i)}
                  </div>
                  <div className="player-emoji" style={{opacity:.5}}>{p.emoji}</div>
                  <div className="survival-info">
                    <div className="survival-name" style={{color:p.color||'#fff'}}>
                      {p.name}
                    </div>
                    <div className="survival-time">
                      💀 duró {p.survivalLabel || '—'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Host puede terminar partida manualmente */}
        {isHost && activePlayers.length <= 1 && room.status !== 'finished' && (
          <button className="btn btn-orange" onClick={async () => {
            snd('round');
            await db.set(`rooms/${session.code}/status`, 'finished');
          }}>
            🏁 Cerrar partida
          </button>
        )}

        <div className="g16"/>
        <button className="btn btn-ghost" onClick={onBack}>← Volver al menú</button>
      </div>
    </div>
  );
}

// StrikeEndScreen — pantalla de resultados finales
function StrikeEndScreen({ room, myId, onBack }){
  const players = [...(room.players || [])].sort((a,b) => (a.finalPosition||99) - (b.finalPosition||99));
  const winner = players.find(p => p.finalPosition === 1);
  const confettiDots = Array.from({length:30},(_,i) => ({
    id:i,
    c:['#FFD447','#FF6B35','#00F5FF','#00FF9D','#9B5DE5','#FF3B5C'][i%6],
    l:Math.round(Math.random()*100)+"%",
    dl:Math.round(Math.random()*20)/10+"s",
    dr:Math.round((2+Math.random()*2.5)*10)/10+"s",
    sz:Math.round(6+Math.random()*8)+"px"
  }));

  React.useEffect(() => { snd('victory'); }, []);

  const totalDuration = room.endedAt && room.startedAt
    ? fmtDuration(room.endedAt - room.startedAt)
    : '—';

  return (
    <div className="end-screen">
      {/* Confetti */}
      <div className="end-confetti">
        {confettiDots.map(d => (
          <div key={d.id} style={{
            position:'absolute',background:d.c,width:d.sz,height:d.sz,
            left:d.l,top:-20,borderRadius:Math.random()>.5?'50%':'3px',
            animation:`confettiFall ${d.dr} ${d.dl} linear infinite`
          }}/>
        ))}
      </div>

      <div className="end-trophy">🎳</div>
      <div className="end-label">ÚLTIMO EN PIE</div>
      <div className="end-gamename">
        {room.customTitle || 'STRIKE'}
      </div>

      {winner && (
        <>
          <div style={{fontSize:'2.5rem',marginBottom:6}}>{winner.emoji}</div>
          <div className="end-winner-name" style={{color: winner.color || '#fff'}}>
            {winner.name}
          </div>
          <div className="end-stats">
            SOBREVIVIÓ {winner.survivalLabel || totalDuration}
          </div>
        </>
      )}

      {/* Tabla completa */}
      <div style={{width:'100%',maxWidth:380,marginBottom:24}}>
        {players.map((p, i) => (
          <div key={p.id} className={`player-row ${i===0?'winner-row':'eliminated'}`}
            style={{marginBottom:6,opacity: p.eliminated ? .55 : 1}}>
            <div className="player-pos">
              {i===0?'🏆':i===1?'🥈':i===2?'🥉':`#${i+1}`}
            </div>
            <div className="player-emoji">{p.emoji}</div>
            <div style={{flex:1}}>
              <div className="player-name" style={{color:p.color||'#fff'}}>
                {p.name}
                {p.id === myId && <span style={{
                  fontFamily:'var(--font-ui)',fontSize:'.5rem',
                  color:'var(--cyan)',letterSpacing:2,marginLeft:6
                }}>TÚ</span>}
              </div>
              <div style={{
                fontFamily:'var(--font-label)',fontSize:'.65rem',fontWeight:600,
                color:'rgba(255,255,255,.35)',letterSpacing:1,marginTop:1
              }}>
                {p.eliminated ? `💀 ${p.survivalLabel || '—'}` : `⏱ ${p.survivalLabel || totalDuration}`}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:8,width:'100%',maxWidth:320}}>
        <button className="btn btn-cyan" onClick={onBack}>
          🏠 Volver al menú
        </button>
      </div>
    </div>
  );
}

// StrikeLobby — sala de espera antes de iniciar Strike
function StrikeLobby({ session, onBack, onStart, isHost, myId, db, customTitle }){
  const [room, setRoom] = React.useState(null);

  React.useEffect(() => {
    const unsub = db.listen(`rooms/${session.code}`, data => {
      if(data) setRoom(data);
    });
    return () => unsub && unsub();
  }, [session.code]);

  React.useEffect(() => {
    if(room?.status === 'active') onStart();
  }, [room?.status]);

  const players = room?.players || [];

  async function startGame(){
    snd('round');
    const now = Date.now();
    await db.set(`rooms/${session.code}`, {
      ...room,
      status: 'active',
      startedAt: now,
      events: [{ type:'match_start', ts: now }]
    });
  }

  return (
    <div className="os-wrap">
      <div className="os-header">
        <div>
          <div className="os-logo">BOARD<span>GAMEZ</span></div>
          <div className="os-logo-sub">OS · STRIKE 🎳</div>
        </div>
        <div className="os-tag cyan">LOBBY</div>
      </div>

      <div className="os-page" style={{paddingTop:16}}>
        <div className="lobby-display anim-pop">
          <div style={{
            fontFamily:'var(--font-ui)',fontSize:'.55rem',letterSpacing:4,
            color:'rgba(0,245,255,.5)',marginBottom:6
          }}>CÓDIGO DE SALA</div>
          <div className="lobby-code">{session.code}</div>
          <div className="lobby-hint">COMPARTE ESTE CÓDIGO PARA UNIRSE</div>
        </div>

        <div className="os-section">JUGADORES · {players.length}</div>
        {players.map((p, i) => (
          <div key={p.id} className="player-row active anim-fade"
            style={{animationDelay: i * 0.06 + 's'}}>
            <div className="player-emoji">{p.emoji}</div>
            <div className="player-name" style={{color: p.color || '#fff'}}>
              {p.name}
              {p.id === myId && <span style={{
                fontFamily:'var(--font-ui)',fontSize:'.5rem',
                color:'var(--cyan)',letterSpacing:2,marginLeft:6
              }}>TÚ</span>}
            </div>
            {p.id === room?.hostId && (
              <div className="os-tag gold" style={{fontSize:'.55rem'}}>HOST</div>
            )}
          </div>
        ))}

        {players.length < 2 && (
          <div className="os-alert alert-cyan">
            ⏳ Esperando al menos 2 jugadores para iniciar...
          </div>
        )}

        <div className="g16"/>

        {isHost && (
          <button
            className="btn btn-cyan"
            onClick={startGame}
            disabled={players.length < 2}
          >
            🎳 INICIAR STRIKE
          </button>
        )}
        {!isHost && (
          <div className="os-alert alert-cyan" style={{textAlign:'center',justifyContent:'center'}}>
            ⏳ Esperando que el host inicie la partida...
          </div>
        )}

        <button className="btn btn-ghost" onClick={onBack}>← Volver</button>
      </div>
    </div>
  );
}
