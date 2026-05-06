// ═══════════════════════════════════════════════════════════════
// runtime.jsx — BOARDGAMEZ OS v3.0
// Motor universal conectado al nuevo pipeline del motor:
// interpret() + resolveRuntime() → UI adaptativa por juego
// ═══════════════════════════════════════════════════════════════
if(window._splashStep) window._splashStep(5);
const {useState,useEffect,useRef,useMemo,useCallback} = React;

// ── CALCULADORA DE JUEGO (nueva — no el input viejo) ────────────
function GameCalc({ action, player, onConfirm, onCancel }){
  const [val, setVal] = useState('');
  const allowNeg = !!action.allowNegative;
  const quick = action.quickValues || [];
  const color = action.color || 'var(--cyan)';

  function tap(v){ snd('tap'); setVal(String(v)); }
  function digit(d){
    snd('tap');
    setVal(prev => {
      if(prev === '' && d === '-') return allowNeg ? '-' : '';
      if(prev === '-' && d === '-') return '';
      const next = prev + d;
      // máx 6 dígitos
      const num = parseFloat(next);
      if(isNaN(num) && next !== '-') return prev;
      return next;
    });
  }
  function del(){ snd('tap'); setVal(prev => prev.slice(0,-1) || ''); }
  function confirm(){
    const n = parseFloat(val);
    if(isNaN(n) || n === 0) return;
    snd('score');
    onConfirm({ value: n });
  }

  const numVal = parseFloat(val);
  const valid = !isNaN(numVal) && numVal !== 0;

  const btnD = { width:72, height:52, borderRadius:12, border:'1px solid rgba(255,255,255,.1)',
    background:'rgba(255,255,255,.06)', color:'#fff', cursor:'pointer',
    fontFamily:'var(--font-display)', fontSize:'1.4rem', transition:'background .1s' };

  return (
    <div style={{position:'fixed',inset:0,zIndex:999,background:'rgba(0,0,0,.88)',
      backdropFilter:'blur(8px)',display:'flex',alignItems:'flex-end',justifyContent:'center',padding:0}}>
      <div className="anim-slide-up" style={{background:'#0D0D1C',borderTop:`2px solid ${color}44`,
        borderRadius:'22px 22px 0 0',padding:'20px 16px 32px',width:'100%',maxWidth:400}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
          <div style={{fontSize:'1.6rem'}}>{action.icon||'➕'}</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:'var(--font-display)',fontSize:'.95rem',letterSpacing:1,color}}>{action.label}</div>
            <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)',marginTop:1}}>
              {player.emoji} {player.name}
            </div>
          </div>
          <button onClick={onCancel} style={{background:'none',border:'1px solid rgba(255,255,255,.15)',
            borderRadius:8,padding:'4px 10px',color:'rgba(255,255,255,.4)',cursor:'pointer',
            fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)'}}>✕</button>
        </div>

        {/* Valores rápidos */}
        {quick.filter(v=>v>0).length > 0 && (
          <div style={{display:'flex',gap:6,marginBottom:10,flexWrap:'wrap'}}>
            {quick.filter(v=>v>0).map(v=>(
              <button key={v} onClick={()=>tap(v)}
                style={{flex:1,minWidth:50,padding:'10px 4px',borderRadius:10,border:'none',cursor:'pointer',
                  fontFamily:'var(--font-display)',fontSize:'var(--fs-sm)',
                  background: String(val)===String(v) ? color : 'rgba(255,255,255,.08)',
                  color: String(val)===String(v) ? 'var(--bg)' : '#fff',transition:'all .12s'}}>
                +{v}
              </button>
            ))}
          </div>
        )}
        {allowNeg && quick.filter(v=>v<0).length > 0 && (
          <div style={{display:'flex',gap:6,marginBottom:10,flexWrap:'wrap'}}>
            {quick.filter(v=>v<0).map(v=>(
              <button key={v} onClick={()=>tap(v)}
                style={{flex:1,minWidth:50,padding:'10px 4px',borderRadius:10,border:'none',cursor:'pointer',
                  fontFamily:'var(--font-display)',fontSize:'var(--fs-sm)',
                  background: String(val)===String(v) ? '#FF3B5C' : 'rgba(255,59,92,.1)',
                  color: String(val)===String(v) ? '#fff' : '#FF6B6B',transition:'all .12s'}}>
                {v}
              </button>
            ))}
          </div>
        )}

        {/* Display */}
        <div style={{textAlign:'center',fontFamily:'var(--font-display)',fontSize:'2.8rem',
          color: valid ? color : 'rgba(255,255,255,.2)',
          borderBottom:`2px solid ${valid ? color : 'rgba(255,255,255,.1)'}`,
          paddingBottom:8,marginBottom:14,letterSpacing:2,
          minHeight:56,transition:'color .2s'}}>
          {val === '' ? '0' : (val === '-' ? '-' : (numVal > 0 && allowNeg ? '+' : '') + val)}
        </div>

        {/* Keypad */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:12}}>
          {['7','8','9','4','5','6','1','2','3'].map(d=>(
            <button key={d} onClick={()=>digit(d)} style={{...btnD,fontSize:'1.5rem'}}>{d}</button>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:14}}>
          {allowNeg && <button onClick={()=>digit('-')} style={{...btnD,color:'var(--red)',fontSize:'1.2rem',borderColor:'rgba(255,59,92,.2)'}}>±</button>}
          {!allowNeg && <div/>}
          <button onClick={()=>digit('0')} style={{...btnD,fontSize:'1.5rem'}}>0</button>
          <button onClick={del} style={{...btnD,color:'rgba(255,212,71,.7)',fontSize:'1.3rem',borderColor:'rgba(255,212,71,.15)'}}>⌫</button>
        </div>

        {/* Confirm */}
        <button onClick={confirm} disabled={!valid}
          style={{width:'100%',padding:'16px',borderRadius:14,border:'none',cursor:valid?'pointer':'not-allowed',
            fontFamily:'var(--font-display)',fontSize:'1rem',letterSpacing:2,
            background: valid ? color : 'rgba(255,255,255,.08)',
            color: valid ? 'var(--bg)' : 'rgba(255,255,255,.25)',
            boxShadow: valid ? `0 4px 20px ${color}44` : 'none',transition:'all .2s'}}>
          {valid ? (numVal > 0 ? `+${numVal}` : `${numVal}`) + ' — CONFIRMAR' : 'INGRESA UN VALOR'}
        </button>
      </div>
    </div>
  );
}

// ── FASE ACTIVA — banda visual de fases, checklist y entidades ──
function PhaseBand({ spec, room, onCheck, isHost }){
  const phases   = spec._timeline?.filter(t=>t.type==='phase')    || [];
  const allChecks= spec._timeline?.filter(t=>t.type==='checklist')|| [];
  const entities = spec._timeline?.filter(t=>t.type==='entity')   || [];
  const curPhase = room.currentPhase || phases[0]?.phaseId;
  const checklist= room.checklist || {};

  // Solo mostrar checks de la fase activa (o todos si no hay fases)
  const visibleChecks = curPhase && phases.length
    ? allChecks.filter(c=> !c.phaseId || c.phaseId === curPhase || c.phaseId === 'manual')
    : allChecks;

  const doneCount = visibleChecks.filter(c=>{
    const val = checklist[c.id];
    return typeof val==='object' ? val?.done : !!val;
  }).length;
  const reqCount = visibleChecks.filter(c=>c.required).length;

  const roundPhases   = phases.filter(p=>p.scope==='round');
  const inRoundPhase  = curPhase && roundPhases.some(p=>p.id===curPhase);
  const turnPhasesAll = phases.filter(p=>p.scope==='turn');

  if(!phases.length && !allChecks.length && !entities.length) return null;

  return(
    <div style={{borderRadius:14,overflow:'hidden',marginBottom:12,
      border:`1px solid ${inRoundPhase?'rgba(155,93,229,.4)':'rgba(155,93,229,.2)'}`,
      background:`rgba(155,93,229,${inRoundPhase?'.07':'.04'})`}}>

      {/* Banner de fase global activa */}
      {inRoundPhase && (
        <div style={{padding:'8px 12px',background:'rgba(155,93,229,.15)',
          display:'flex',alignItems:'center',gap:8}}>
          <div style={{fontSize:'1rem',animation:'osBlink 2s ease-in-out infinite'}}>📍</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:'var(--font-ui)',fontSize:'7px',letterSpacing:2,
              color:'rgba(155,93,229,.7)'}}>FASE GLOBAL ACTIVA</div>
            <div style={{fontFamily:'var(--font-label)',fontSize:'13px',fontWeight:700,
              color:'var(--purple)'}}>
              {phases.find(p=>p.id===curPhase)?.label||curPhase}
            </div>
          </div>
          <div style={{fontFamily:'var(--font-label)',fontSize:'10px',
            color:'rgba(155,93,229,.5)'}}>
            {phases.find(p=>p.id===curPhase)?.description||''}
          </div>
        </div>
      )}

      {/* Header de sección con progreso */}
      <div style={{padding:'8px 12px',borderBottom:'1px solid rgba(155,93,229,.1)',
        display:'flex',alignItems:'center',gap:8}}>
        <div style={{fontFamily:'var(--font-ui)',fontSize:'8px',letterSpacing:2,
          color:'rgba(155,93,229,.7)',flex:1}}>FLUJO DE PARTIDA</div>
        {visibleChecks.length>0 && (
          <div style={{fontFamily:'var(--font-display)',fontSize:'11px',
            color: doneCount===visibleChecks.length?'var(--green)':'rgba(255,255,255,.3)'}}>
            {doneCount}/{visibleChecks.length}
            {reqCount>0&&` · ${reqCount} req`}
          </div>
        )}
      </div>

      <div style={{padding:'10px 12px',display:'flex',flexDirection:'column',gap:10}}>

        {/* Fases — selector horizontal */}
        {phases.length > 0 && (
          <div>
            <div style={{fontFamily:'var(--font-ui)',fontSize:'7px',letterSpacing:2,
              color:'rgba(255,255,255,.25)',marginBottom:5}}>FASE</div>
            <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
              {phases.map((p,idx)=>{
                const active = p.phaseId===curPhase;
                const phaseChecks = allChecks.filter(c=>c.phaseId===p.phaseId);
                const phaseDone   = phaseChecks.filter(c=>{
                  const v=checklist[c.id]; return typeof v==='object'?v?.done:!!v;
                }).length;
                return(
                  <button key={p.id}
                    onClick={()=>isHost&&onCheck&&onCheck('set_phase',p.phaseId)}
                    style={{padding:'6px 11px',borderRadius:8,cursor:isHost?'pointer':'default',
                      border:`1px solid ${active?'rgba(155,93,229,.5)':'rgba(255,255,255,.07)'}`,
                      background:active?'rgba(155,93,229,.18)':'rgba(255,255,255,.02)',
                      color:active?'var(--purple)':'rgba(255,255,255,.35)',
                      fontFamily:'var(--font-label)',fontSize:'11px',fontWeight:700,
                      letterSpacing:.3,display:'flex',alignItems:'center',gap:5}}>
                    <span style={{opacity:.5,fontSize:'9px'}}>{idx+1}.</span>
                    {p.label}
                    {phaseChecks.length>0&&(
                      <span style={{fontFamily:'var(--font-ui)',fontSize:'7px',
                        color:phaseDone===phaseChecks.length?'var(--green)':'rgba(255,255,255,.25)',
                        marginLeft:2}}>{phaseDone}/{phaseChecks.length}</span>
                    )}
                    {active&&<span style={{width:5,height:5,borderRadius:'50%',
                      background:'var(--purple)',flexShrink:0}}/>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Checklist de fase activa */}
        {visibleChecks.length > 0 && (
          <div>
            {curPhase&&phases.length>0&&(
              <div style={{fontFamily:'var(--font-ui)',fontSize:'7px',letterSpacing:2,
                color:'rgba(255,255,255,.2)',marginBottom:5}}>
                CHECKLIST — {phases.find(p=>p.phaseId===curPhase)?.label||curPhase}
              </div>
            )}
            {!curPhase||!phases.length?(
              <div style={{fontFamily:'var(--font-ui)',fontSize:'7px',letterSpacing:2,
                color:'rgba(255,255,255,.2)',marginBottom:5}}>CHECKLIST</div>
            ):null}
            <div style={{display:'flex',flexDirection:'column',gap:4}}>
              {visibleChecks.map(c=>{
                const raw  = checklist[c.id];
                const done = typeof raw==='object' ? raw?.done : !!raw;
                return(
                  <button key={c.id}
                    onClick={()=>isHost&&onCheck&&onCheck('toggle_check',c.id)}
                    style={{display:'flex',alignItems:'center',gap:8,padding:'7px 10px',
                      borderRadius:8,textAlign:'left',cursor:isHost?'pointer':'default',
                      border:`1px solid ${done?'rgba(0,255,157,.2)':'rgba(255,255,255,.07)'}`,
                      background:done?'rgba(0,255,157,.05)':'rgba(255,255,255,.02)',
                      transition:'all .15s'}}>
                    <div style={{width:18,height:18,borderRadius:5,flexShrink:0,
                      border:`2px solid ${done?'var(--green)':'rgba(255,255,255,.2)'}`,
                      background:done?'var(--green)':'transparent',
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:'10px',color:'var(--bg)',fontWeight:900,transition:'all .15s'}}>
                      {done?'✓':''}
                    </div>
                    <div style={{flex:1,fontFamily:'var(--font-label)',fontSize:'12px',fontWeight:600,
                      color:done?'rgba(255,255,255,.35)':'rgba(255,255,255,.75)',
                      textDecoration:done?'line-through':'none',lineHeight:1.3}}>
                      {c.label}
                    </div>
                    {c.required&&!done&&(
                      <div style={{fontFamily:'var(--font-ui)',fontSize:'6px',letterSpacing:1,
                        color:'rgba(255,107,53,.7)',background:'rgba(255,107,53,.1)',
                        padding:'2px 5px',borderRadius:3,flexShrink:0}}>REQ</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Entidades externas — tokens, bolsa, etc. */}
        {entities.length > 0 && (
          <div>
            <div style={{fontFamily:'var(--font-ui)',fontSize:'7px',letterSpacing:2,
              color:'rgba(255,255,255,.2)',marginBottom:5}}>ENTIDADES</div>
            <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
              {entities.map(e=>{
                const roomEntities = room.entities||{};
                const val = roomEntities[e.entityType==='token'
                  ? e.id.replace('entity_','') : e.id.replace('entity_','')]?.value
                  ?? e.defaultState ?? '—';
                return(
                  <div key={e.id} style={{padding:'5px 10px',borderRadius:8,
                    background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',
                    display:'flex',alignItems:'center',gap:5}}>
                    <span style={{fontSize:'1rem'}}>{
                      (()=>{ const raw=e.id.replace('entity_',''); const found=spec._entities?.find(en=>en.id===raw); return found?.icon||'🔹'; })()
                    }</span>
                    <div>
                      <div style={{fontFamily:'var(--font-label)',fontSize:'10px',fontWeight:700,
                        color:'rgba(255,255,255,.6)',lineHeight:1}}>{e.label}</div>
                      <div style={{fontFamily:'var(--font-ui)',fontSize:'8px',
                        color:'rgba(255,255,255,.3)',marginTop:1}}>{String(val)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── RONDA VISUAL ─────────────────────────────────────────────────
function RoundBadge({ current, total, spec }){
  if(!spec.hasRounds) return null;
  const pct = total ? Math.min(100, ((current-1)/total)*100) : 0;
  return(
    <div style={{display:'flex',alignItems:'center',gap:8,
      background:'rgba(0,245,255,.05)',border:'1px solid rgba(0,245,255,.15)',
      borderRadius:10,padding:'6px 12px',marginBottom:10}}>
      <div style={{fontFamily:'var(--font-ui)',fontSize:'8px',letterSpacing:2,
        color:'rgba(0,245,255,.5)'}}>RONDA</div>
      <div style={{fontFamily:'var(--font-display)',fontSize:'1.1rem',color:'var(--cyan)'}}>
        {current}{total?`/${total}`:''}
      </div>
      {total && (
        <div style={{flex:1,height:4,background:'rgba(255,255,255,.07)',borderRadius:2}}>
          <div style={{width:pct+'%',height:'100%',borderRadius:2,
            background:'linear-gradient(90deg,var(--cyan),var(--purple))',
            transition:'width .4s ease'}}/>
        </div>
      )}
      {!total && <div style={{fontFamily:'var(--font-label)',fontSize:'10px',
        color:'rgba(255,255,255,.25)'}}>∞ Libre</div>}
    </div>
  );
}


// ── TURNO ACTIVO — reloj + fases del turno + recordatorios ──────
// Dos modos:
// 'agile'      — 1 botón grande "Terminé mi turno" + recordatorios informativos
// 'regulatory' — stepper de fases con checks bloqueantes
function TurnAssistant({ spec, room, currentPlayer, isHost, isMyTurn, onEndTurn, onPhaseAction, onAction, db, session }){
  // Usar turnStartedAt de Firebase para que todos los jugadores vean el mismo reloj
  const turnStart = room.turnStartedAt || Date.now();
  const [elapsed, setElapsed] = React.useState(0);
  const [confirmed, setConfirmed] = React.useState({});

  React.useEffect(()=>{
    const t = setInterval(()=>setElapsed(Math.floor((Date.now()-turnStart)/1000)),500);
    return ()=>{ clearInterval(t); };
  },[turnStart]);

  const phases   = spec._phases || [];
  const checklist= spec._checklist || [];
  const turnPhases = phases.filter(p=>p.scope==='turn');
  if(!turnPhases.length) return null;

  // Detectar modo: lee de spec (que viene de interpret(config))
  // Fallback: si algún check es required → regulatory, si no → agile
  const turnAssistMode = spec.turnAssistMode ||
    (checklist.some(c=>c.required) ? 'regulatory' : 'agile');
  const isAgile = turnAssistMode === 'agile';

  // Fase actual del turno (guardada en room por jugador activo)
  const curTurnPhase = room.turnPhase || turnPhases[0]?.id;
  const curPhaseIdx  = turnPhases.findIndex(p=>p.id===curTurnPhase);
  const curPhaseObj  = turnPhases[curPhaseIdx] || turnPhases[0];

  // Checks de la fase actual
  const phaseChecks = checklist.filter(c=>c.phaseId===curTurnPhase||c.phaseId===curPhaseObj?.id);
  const roomChecks  = room.checklist || {};
  const pendingReq  = phaseChecks.filter(c=>{
    if(!c.required) return false;
    const v = confirmed[c.id] || roomChecks[c.id];
    return typeof v==='object' ? !v?.done : !v;
  });
  const blocked = pendingReq.length > 0;

  function fmtSecs(s){ return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}` }

  async function advancePhase(){
    if(blocked) return;
    const nextIdx = curPhaseIdx + 1;
    if(nextIdx >= turnPhases.length){
      // Último paso — fin de turno
      onEndTurn(elapsed);
    } else {
      const nextPhase = turnPhases[nextIdx];
      if(db&&session) await db.set(`rooms/${session.code}/turnPhase`, nextPhase.id).catch(()=>{});
    }
  }

  async function toggleCheck(checkId){
    const cur = confirmed[checkId] || roomChecks[checkId];
    const curDone = typeof cur==='object' ? cur?.done : !!cur;
    setConfirmed(prev=>({...prev,[checkId]:!curDone}));
    if(db&&session) await db.set(`rooms/${session.code}/checklist/${checkId}`,
      typeof roomChecks[checkId]==='object'
        ? {...roomChecks[checkId], done:!curDone}
        : !curDone
    ).catch(()=>{});
  }

  const isActive = isMyTurn || isHost;

  // ── MODO ÁGIL: un botón + recordatorios informativos ──────────
  if(isAgile){
    return(
      <div style={{borderRadius:14,overflow:'hidden',marginBottom:12,
        border:'1px solid rgba(0,255,157,.2)',
        background:'rgba(0,255,157,.03)'}}>

        {/* Header jugador + reloj */}
        <div style={{padding:'10px 14px',display:'flex',alignItems:'center',gap:10}}>
          <div style={{fontSize:'1.3rem'}}>{currentPlayer?.emoji||'👤'}</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:'var(--font-label)',fontWeight:700,fontSize:'13px',color:'#fff',
              display:'flex',alignItems:'center',gap:6}}>
              {currentPlayer?.name||'Jugador'}
              {isMyTurn&&<span style={{fontFamily:'var(--font-ui)',fontSize:'7px',color:'var(--cyan)',
                letterSpacing:2,background:'rgba(0,245,255,.1)',padding:'1px 5px',borderRadius:3}}>TU TURNO</span>}
            </div>
          </div>
          {/* Reloj de ajedrez */}
          <div style={{textAlign:'center',background:'rgba(0,0,0,.3)',borderRadius:10,
            padding:'5px 11px',border:`1px solid ${elapsed>60?'rgba(255,107,53,.3)':'rgba(255,255,255,.1)'}`}}>
            <div style={{fontFamily:'var(--font-display)',fontSize:'1.1rem',letterSpacing:1,lineHeight:1,
              color:elapsed>120?'var(--red)':elapsed>60?'var(--orange)':'var(--cyan)'}}>
              {fmtSecs(elapsed)}
            </div>
            <div style={{fontFamily:'var(--font-ui)',fontSize:'6px',letterSpacing:1,
              color:'rgba(255,255,255,.2)',marginTop:1}}>TURNO</div>
          </div>
        </div>

        {/* Recordatorios informativos — NO bloquean */}
        {phaseChecks.length>0&&(
          <div style={{padding:'0 12px 8px'}}>
            {phaseChecks.map(c=>{
              const v    = confirmed[c.id] ?? roomChecks[c.id];
              const done = typeof v==='object'?v?.done:!!v;
              return(
                <div key={c.id}
                  style={{display:'flex',alignItems:'center',gap:8,padding:'6px 10px',
                    borderRadius:8,marginBottom:3,
                    background:'rgba(255,212,71,.05)',border:'1px solid rgba(255,212,71,.12)'}}>
                  <div style={{fontSize:'1rem',flexShrink:0}}>💡</div>
                  <div style={{flex:1,fontFamily:'var(--font-label)',fontSize:'11px',
                    color:'rgba(255,212,71,.8)',fontWeight:600}}>
                    {c.label}
                  </div>
                  <button onClick={()=>isActive&&toggleCheck(c.id)}
                    style={{width:20,height:20,borderRadius:5,flexShrink:0,border:'none',cursor:'pointer',
                      background:done?'var(--green)':'rgba(255,255,255,.1)',
                      color:done?'var(--bg)':'rgba(255,255,255,.3)',
                      fontSize:'10px',fontWeight:900,transition:'all .15s'}}>
                    {done?'✓':'·'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        "Acciones del turno ágil */}
        {isActive&&(
          <div style={{padding:'0 12px 12px',display:'flex',flexDirection:'column',gap:8}}>

            {/* Botones configurados en agileTurnButtons */}
            {(spec.agileTurnButtons||[]).map((btn,i)=>{
              const bColors={add_win:'rgba(255,212,71,.15)',add_points:'rgba(0,245,255,.12)',end_game_loss:'rgba(255,59,92,.12)'};
              const bText={add_win:'var(--gold)',add_points:'var(--cyan)',end_game_loss:'var(--red)'};
              return(
                <button key={i} onClick={()=>{
                  snd(btn.effect==='end_game_loss'?'elim':'score');
                  if(btn.effect==='add_win') onAction&&onAction({id:'add_win',label:btn.label,icon:btn.icon||'🎯',color:'var(--gold)',type:'direct',category:'score'},currentPlayer?.id,{value:1});
                  else if(btn.effect==='add_points') onAction&&onAction({id:'add_points',label:btn.label,icon:btn.icon||'➕',color:'var(--cyan)',type:'direct',category:'score'},currentPlayer?.id,{value:1});
                  else onAction&&onAction({id:btn.effect||'log_event',label:btn.label,icon:btn.icon||'📝',color:'rgba(255,255,255,.4)',type:'direct',category:'system'},currentPlayer?.id,{note:btn.label});
                }}
                  style={{width:'100%',padding:'13px',borderRadius:12,border:'none',cursor:'pointer',
                    fontFamily:'var(--font-display)',fontSize:'1rem',fontWeight:700,letterSpacing:1.5,
                    background:bColors[btn.effect]||'rgba(155,93,229,.12)',
                    color:bText[btn.effect]||'var(--purple)'}}>
                  {btn.icon||'🎯'} {(btn.label||'').toUpperCase()}
                </button>
              );
            })}

            {/* Fallback si no hay agileTurnButtons pero sí registers wins */}
            {!(spec.agileTurnButtons?.length)&&spec.registers?.includes('wins')&&(
              <button onClick={()=>{snd('score');onAction&&onAction({id:'add_win',label:'Victoria',icon:'🎯',color:'var(--gold)',type:'direct',category:'score'},currentPlayer?.id,{value:1});}}
                style={{width:'100%',padding:'13px',borderRadius:12,border:'none',cursor:'pointer',
                  fontFamily:'var(--font-display)',fontSize:'1rem',fontWeight:700,letterSpacing:1.5,
                  background:'rgba(255,212,71,.15)',color:'var(--gold)'}}>
                🎯 RESOLVÍ UNA MISIÓN
              </button>
            )}

            {/* Me quedé sin opciones */}
            {(spec.showNoOptionsButton||spec._rawConfig?.showNoOptionsButton)&&(
              <button onClick={()=>{snd('elim');onAction&&onAction({id:'no_options',label:'Sin opciones',icon:'🚫',color:'rgba(255,255,255,.3)',type:'direct',category:'system'},currentPlayer?.id,{note:'sin_opciones'});}}
                style={{width:'100%',padding:'11px',borderRadius:10,border:'1px solid rgba(255,255,255,.12)',
                  cursor:'pointer',fontFamily:'var(--font-display)',fontSize:'.85rem',letterSpacing:1,
                  background:'rgba(255,255,255,.04)',color:'rgba(255,255,255,.4)'}}>
                🚫 Me quedé sin opciones
              </button>
            )}

                        {/* Botón principal — terminar turno */}
            <button onClick={()=>onEndTurn(elapsed)}
              style={{width:'100%',padding:'16px',borderRadius:12,border:'none',cursor:'pointer',
                fontFamily:'var(--font-display)',fontSize:'1.1rem',fontWeight:700,letterSpacing:2,
                background:'linear-gradient(135deg,rgba(0,255,157,.18),rgba(0,245,255,.12))',
                color:'var(--green)',
                boxShadow:'0 4px 20px rgba(0,255,157,.15)',transition:'all .15s'}}>
              ✓ TERMINÉ MI TURNO · {fmtSecs(elapsed)}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── MODO REGULATORIO: stepper + checks bloqueantes ────────────
  return(
    <div style={{borderRadius:16,overflow:'hidden',marginBottom:12,
      border:`2px solid ${blocked?'rgba(255,107,53,.4)':'rgba(0,245,255,.25)'}`,
      background:`linear-gradient(135deg,${blocked?'rgba(255,107,53,.06)':'rgba(0,245,255,.04)'},rgba(0,0,0,.1))`,
      transition:'border .3s,background .3s'}}>

      {/* Header — jugador + timer */}
      <div style={{padding:'10px 14px',borderBottom:'1px solid rgba(255,255,255,.06)',
        display:'flex',alignItems:'center',gap:10}}>
        <div style={{fontSize:'1.4rem'}}>{currentPlayer?.emoji||'👤'}</div>
        <div style={{flex:1}}>
          <div style={{fontFamily:'var(--font-label)',fontWeight:700,fontSize:'13px',
            color:'#fff',display:'flex',alignItems:'center',gap:6}}>
            {currentPlayer?.name||'Jugador'}
            {isMyTurn&&<span style={{fontFamily:'var(--font-ui)',fontSize:'7px',
              color:'var(--cyan)',letterSpacing:2,background:'rgba(0,245,255,.1)',
              padding:'1px 5px',borderRadius:3}}>TU TURNO</span>}
          </div>
          <div style={{fontFamily:'var(--font-ui)',fontSize:'8px',letterSpacing:2,
            color:'rgba(255,255,255,.3)',marginTop:1}}>
            {curPhaseObj?.description||''}
          </div>
        </div>
        {/* Reloj de ajedrez */}
        <div style={{textAlign:'center',background:'rgba(0,0,0,.3)',borderRadius:10,
          padding:'6px 12px',border:`1px solid ${elapsed>60?'rgba(255,107,53,.3)':'rgba(255,255,255,.1)'}`}}>
          <div style={{fontFamily:'var(--font-display)',fontSize:'1.1rem',
            color:elapsed>120?'var(--red)':elapsed>60?'var(--orange)':'var(--cyan)',
            letterSpacing:1,lineHeight:1}}>
            {fmtSecs(elapsed)}
          </div>
          <div style={{fontFamily:'var(--font-ui)',fontSize:'7px',letterSpacing:1,
            color:'rgba(255,255,255,.25)',marginTop:2}}>TURNO</div>
        </div>
      </div>

      {/* Pasos del turno — stepper horizontal */}
      <div style={{padding:'10px 14px',display:'flex',alignItems:'center',gap:4,
        overflowX:'auto',borderBottom:'1px solid rgba(255,255,255,.05)'}}>
        {turnPhases.map((p,i)=>{
          const isPast   = i < curPhaseIdx;
          const isCur    = p.id === curTurnPhase;
          const isFuture = i > curPhaseIdx;
          return(
            <React.Fragment key={p.id}>
              {i>0&&<div style={{flex:'0 0 12px',height:1,
                background:isPast||isCur?'rgba(0,245,255,.3)':'rgba(255,255,255,.1)'}}/>}
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',
                gap:3,flexShrink:0,opacity:isFuture?.4:1}}>
                <div style={{width:26,height:26,borderRadius:'50%',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:'11px',fontWeight:900,
                  border:`2px solid ${isCur?'var(--cyan)':isPast?'rgba(0,255,157,.4)':'rgba(255,255,255,.15)'}`,
                  background:isCur?'rgba(0,245,255,.15)':isPast?'rgba(0,255,157,.1)':'transparent',
                  color:isCur?'var(--cyan)':isPast?'var(--green)':'rgba(255,255,255,.3)'}}>
                  {isPast?'✓':i+1}
                </div>
                <div style={{fontFamily:'var(--font-label)',fontSize:'9px',fontWeight:700,
                  color:isCur?'var(--cyan)':isPast?'var(--green)':'rgba(255,255,255,.3)',
                  textAlign:'center',maxWidth:60,lineHeight:1.2}}>
                  {p.label}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Recordatorios / checks de la fase actual */}
      {phaseChecks.length>0&&(
        <div style={{padding:'8px 14px',
          background:blocked?'rgba(255,107,53,.04)':'transparent',
          borderBottom:'1px solid rgba(255,255,255,.05)'}}>
          {blocked&&(
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
              <div style={{fontSize:'1rem'}}>⚠️</div>
              <div style={{fontFamily:'var(--font-label)',fontSize:'11px',fontWeight:700,
                color:'var(--orange)'}}>Pendiente antes de continuar</div>
            </div>
          )}
          {phaseChecks.map(c=>{
            const v    = confirmed[c.id] ?? (roomChecks[c.id]);
            const done = typeof v==='object'?v?.done:!!v;
            return(
              <button key={c.id} onClick={()=>isActive&&toggleCheck(c.id)}
                style={{display:'flex',alignItems:'center',gap:8,width:'100%',
                  padding:'7px 10px',borderRadius:8,marginBottom:4,
                  border:`1px solid ${done?'rgba(0,255,157,.2)':c.required?'rgba(255,107,53,.25)':'rgba(255,255,255,.08)'}`,
                  background:done?'rgba(0,255,157,.05)':c.required?'rgba(255,107,53,.04)':'rgba(255,255,255,.02)',
                  cursor:isActive?'pointer':'default',textAlign:'left',transition:'all .15s'}}>
                <div style={{width:20,height:20,borderRadius:5,flexShrink:0,
                  border:`2px solid ${done?'var(--green)':c.required?'var(--orange)':'rgba(255,255,255,.2)'}`,
                  background:done?'var(--green)':'transparent',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:'11px',color:'var(--bg)',fontWeight:900,transition:'all .15s'}}>
                  {done?'✓':''}
                </div>
                <div style={{flex:1,fontFamily:'var(--font-label)',fontSize:'12px',fontWeight:600,
                  color:done?'rgba(255,255,255,.35)':c.required?'rgba(255,200,100,.9)':'rgba(255,255,255,.75)',
                  textDecoration:done?'line-through':'none'}}>
                  {c.label}
                </div>
                {c.required&&!done&&(
                  <div style={{fontFamily:'var(--font-ui)',fontSize:'6px',letterSpacing:1,
                    color:'var(--orange)',background:'rgba(255,107,53,.12)',
                    padding:'2px 5px',borderRadius:3,flexShrink:0}}>REQ</div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Botón de avanzar / terminar turno */}
      {isActive&&(
        <div style={{padding:'10px 14px'}}>
          <button onClick={advancePhase} disabled={blocked}
            style={{width:'100%',padding:'13px',borderRadius:12,border:'none',
              cursor:blocked?'not-allowed':'pointer',
              fontFamily:'var(--font-display)',fontSize:'.95rem',fontWeight:700,
              letterSpacing:1.5,transition:'all .2s',
              background:blocked
                ?'rgba(255,255,255,.06)'
                : curPhaseIdx>=turnPhases.length-1
                  ?'linear-gradient(135deg,rgba(0,255,157,.2),rgba(0,245,255,.15))'
                  :'rgba(0,245,255,.1)',
              color:blocked?'rgba(255,255,255,.2)'
                :curPhaseIdx>=turnPhases.length-1?'var(--green)':'var(--cyan)',
              boxShadow:blocked?'none':`0 4px 16px ${curPhaseIdx>=turnPhases.length-1?'rgba(0,255,157,.15)':'rgba(0,245,255,.1)'}`}}>
            {blocked
              ?`⏸ Completa el recordatorio`
              :curPhaseIdx>=turnPhases.length-1
                ?`✓ TURNO TERMINADO (${fmtSecs(elapsed)})`
                :`→ ${turnPhases[curPhaseIdx+1]?.label}`
            }
          </button>
        </div>
      )}
    </div>
  );
}


// ── PLAYER ACTION CARD v3 ────────────────────────────────────────
function PlayerActionCard({ player, spec, actions, captureActions, resultActions, statusIndicators,
  isHost, myId, onAction, currentRound, presence }){
  const [modal, setModal] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const isMe = player.id === myId;
  const canAct = isHost || isMe;

  const primary   = actions.filter(a => !a.secondary && !player.eliminated && _canSee(a,isHost,isMe));
  const secondary = actions.filter(a =>  a.secondary && !player.eliminated && _canSee(a,isHost,isMe));

  // Acciones de captura del nuevo motor
  const captures = (captureActions||[]).filter(a => !player.eliminated && isHost);
  // Resultados del nuevo motor
  const results  = (resultActions||[]).filter(a => !player.eliminated);
  // Indicadores de estado
  const indicators = (statusIndicators||[]);

  const display = getScoreDisplay(player, spec);

  function fire(action, payload){ setModal(null); onAction(action, player.id, payload||{}); }

  function clickAction(action){
    snd('tap');
    if(action.type==='direct') fire(action,{});
    else if(action.type==='numeric_modal') setModal({action, type:'calc'});
    else if(action.type==='option_selector') setModal({action, type:'option'});
    else if(action.type==='confirm_action') setModal({action, type:'confirm'});
    else if(action.type==='undo') fire(action,{});
    else fire(action,{});
  }

  if(player.eliminated){
    return(
      <div style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',
        borderRadius:12,background:'rgba(255,59,92,.04)',border:'1px solid rgba(255,59,92,.1)',
        marginBottom:8,opacity:.45}}>
        <div style={{fontFamily:'var(--font-display)',fontSize:'.85rem',color:'var(--red)',width:22,textAlign:'center'}}>
          #{player.finalPosition||'?'}
        </div>
        <div style={{fontSize:'1.2rem'}}>{player.emoji}</div>
        <div style={{flex:1,fontFamily:'var(--font-label)',fontSize:'12px',fontWeight:700,
          color:'rgba(255,255,255,.35)'}}>
          {player.name} <span style={{color:'var(--red)'}}>💀</span>
        </div>
        <div style={{fontFamily:'var(--font-display)',fontSize:'.85rem',color:'rgba(255,255,255,.25)'}}>
          {display.main} {display.unit}
        </div>
      </div>
    );
  }

  const isTurn = spec.hasTurns && player.id === (player._isTurn ? player.id : null);

  return(
    <div style={{marginBottom:10,borderRadius:14,
      background:`rgba(255,255,255,${isTurn?'.05':'.025'})`,
      border:`1px solid ${isTurn?'rgba(0,245,255,.25)':'rgba(255,255,255,.07)'}`,
      transition:'border .2s,background .2s'}}>

      {/* Modals */}
      {modal?.type==='calc' && (
        <GameCalc action={modal.action} player={player}
          onConfirm={p=>fire(modal.action,p)} onCancel={()=>setModal(null)}/>
      )}
      {modal?.type==='option' && (
        <OptionSelectorModal action={modal.action} player={player}
          onConfirm={p=>fire(modal.action,p)} onCancel={()=>setModal(null)}/>
      )}
      {modal?.type==='confirm' && (
        <ConfirmModal_R action={modal.action} player={player} spec={spec}
          onConfirm={p=>fire(modal.action,p)} onCancel={()=>setModal(null)}/>
      )}

      {/* Fila principal */}
      <div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px'}}>
        <div style={{position:'relative',flexShrink:0}}>
          <div style={{width:40,height:40,borderRadius:11,display:'flex',alignItems:'center',
            justifyContent:'center',fontSize:'1.4rem',
            background:`rgba(255,255,255,.06)`,border:'1px solid rgba(255,255,255,.1)'}}>
            {player.emoji}
          </div>
          {presence?.[player.id] && (
            <div style={{position:'absolute',bottom:-2,right:-2,width:9,height:9,borderRadius:'50%',
              background:'var(--green)',border:'2px solid var(--bg)'}}/>
          )}
        </div>

        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:'var(--font-label)',fontSize:'13px',fontWeight:700,
            color:'#fff',marginBottom:2,display:'flex',alignItems:'center',gap:5}}>
            {player.name}
            {player.hasFirstPlayerToken && <span title="Primer jugador">👑</span>}
            {player.id===myId && <span style={{fontFamily:'var(--font-ui)',fontSize:'7px',
              color:'var(--cyan)',letterSpacing:2}}>TÚ</span>}
            {isTurn && <span style={{fontFamily:'var(--font-ui)',fontSize:'7px',
              color:'var(--orange)',letterSpacing:1,background:'rgba(255,107,53,.15)',
              padding:'1px 5px',borderRadius:4}}>TURNO</span>}
          </div>
          {/* Indicadores de estado activos */}
          {indicators.filter(ind=>player['status_'+ind.id]).length>0 && (
            <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
              {indicators.filter(ind=>player['status_'+ind.id]).map(ind=>(
                <span key={ind.id} style={{fontFamily:'var(--font-label)',fontSize:'9px',
                  padding:'1px 5px',borderRadius:4,
                  background:`rgba(${ind.color||'0,245,255'},.15)`,
                  color:ind.color||'var(--cyan)',fontWeight:700}}>
                  {ind.icon} {ind.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Score principal — solo si hay algo que mostrar */}
        {display.main !== null && (
          <div style={{textAlign:'right',flexShrink:0}}>
            <div style={{fontFamily:'var(--font-display)',fontSize:'1.5rem',
              color: display.color || 'var(--gold)',lineHeight:1}}>
              {display.main}
            </div>
            <div style={{fontFamily:'var(--font-ui)',fontSize:'8px',letterSpacing:1,
              color:'rgba(255,255,255,.25)',marginTop:1}}>
              {display.unit}
            </div>
          </div>
        )}

        {/* Expand toggle */}
        <button onClick={()=>setExpanded(e=>!e)}
          style={{background:'none',border:'1px solid rgba(255,255,255,.08)',borderRadius:6,
            padding:'4px 7px',cursor:'pointer',color:'rgba(255,255,255,.3)',fontSize:'10px'}}>
          {expanded?'▲':'▼'}
        </button>
      </div>

      {/* Acciones primarias */}
      {canAct && primary.length>0 && (
        <div style={{display:'flex',gap:6,padding:'0 12px 10px',flexWrap:'wrap'}}>
          {primary.map(a=>(
            <button key={a.id} onClick={()=>clickAction(a)}
              style={{flex:1,minWidth:80,padding:'10px 8px',borderRadius:10,
                border:`1px solid ${a.color}33`,cursor:'pointer',
                fontFamily:'var(--font-display)',fontSize:'12px',fontWeight:700,letterSpacing:.5,
                background:`linear-gradient(135deg,${a.color}18,rgba(255,255,255,.02))`,
                color: a.dangerous?'var(--red)':a.color||'#fff',
                boxShadow:`0 2px 8px ${a.color}22`,transition:'all .12s'}}>
              <span style={{marginRight:4}}>{a.icon}</span>{a.label}
            </button>
          ))}
        </div>
      )}

      {/* Acciones del nuevo motor — resultados y capturas */}
      {canAct && expanded && (captures.length>0 || results.length>0) && (
        <div style={{padding:'0 12px 10px'}}>
          <div style={{fontFamily:'var(--font-ui)',fontSize:'7px',letterSpacing:2,
            color:'rgba(255,255,255,.2)',marginBottom:5}}>ACCIONES DEL MOTOR</div>
          <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
            {results.map(r=>(
              <button key={r.id}
                onClick={()=>{snd('tap'); onAction({id:r.id,label:r.label,icon:r.icon,
                  color:r.color,type:'direct',category:'result'}, player.id, {effect:r.effect});}}
                style={{padding:'7px 10px',borderRadius:8,border:`1px solid ${r.color||'#FFD447'}33`,
                  background:`rgba(255,255,255,.03)`,cursor:'pointer',
                  fontFamily:'var(--font-label)',fontSize:'11px',fontWeight:700,
                  color:r.color||'var(--gold)'}}>
                {r.icon} {r.label}
              </button>
            ))}
            {captures.map(c=>(
              <button key={c.id}
                onClick={()=>{
                  const act = {id:c.id,label:c.label,icon:c.icon||'📝',
                    color:c.color||'#FFD447',type:'numeric_modal',category:'capture',
                    allowNegative:false, quickValues:c.quickValues||[]};
                  setModal({action:act, type:'calc'});
                }}
                style={{padding:'7px 10px',borderRadius:8,border:`1px solid ${c.color||'#FFD447'}33`,
                  background:`rgba(255,255,255,.03)`,cursor:'pointer',
                  fontFamily:'var(--font-label)',fontSize:'11px',fontWeight:700,
                  color:c.color||'var(--gold)'}}>
                🧮 {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Acciones secundarias desplegables */}
      {canAct && expanded && secondary.length>0 && (
        <div style={{padding:'0 12px 10px'}}>
          <div style={{fontFamily:'var(--font-ui)',fontSize:'7px',letterSpacing:2,
            color:'rgba(255,255,255,.2)',marginBottom:5}}>MÁS ACCIONES</div>
          <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
            {secondary.map(a=>(
              <button key={a.id} onClick={()=>clickAction(a)}
                style={{padding:'7px 10px',borderRadius:8,
                  border:`1px solid rgba(255,255,255,.1)`,background:'rgba(255,255,255,.04)',
                  cursor:'pointer',fontFamily:'var(--font-label)',fontSize:'11px',fontWeight:700,
                  color:'rgba(255,255,255,.55)'}}>
                {a.icon} {a.label}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

// ── HOST PANEL v3 ────────────────────────────────────────────────
function HostPanel({ spec, room, onHostAction, isOpen, onToggle }){
  const actions    = spec.hostActions || [];
  const primary    = actions.filter(a=>a.primary&&!a.dangerous);
  const danger     = actions.filter(a=>a.dangerous);
  const rest       = actions.filter(a=>!a.primary&&!a.dangerous);
  const roundPhases = (spec._phases||[]).filter(p=>p.scope==='round');
  const turnPhases  = (spec._phases||[]).filter(p=>p.scope==='turn');
  const inRoundPhase = room.currentPhase && roundPhases.some(p=>p.id===room.currentPhase);
  const curRPIdx    = roundPhases.findIndex(p=>p.id===room.currentPhase);
  const isLastRP    = curRPIdx === roundPhases.length-1;

  return(
    <div style={{marginTop:16,borderRadius:14,overflow:'hidden',
      border:'1px solid rgba(0,255,157,.15)'}}>
      <button onClick={onToggle}
        style={{width:'100%',padding:'12px 16px',background:'rgba(0,255,157,.06)',
          border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:10}}>
        <div style={{fontFamily:'var(--font-ui)',fontSize:'8px',letterSpacing:2,
          color:'var(--green)',flex:1,textAlign:'left'}}>PANEL DEL HOST</div>
        <div style={{fontFamily:'var(--font-display)',fontSize:'10px',color:'rgba(255,255,255,.3)'}}>
          {isOpen?'▲':'▼'}
        </div>
      </button>

      {isOpen && (
        <div style={{padding:'12px 14px',background:'rgba(0,0,0,.2)'}}>
          {/* Fase global activa — controles de navegación */}
          {inRoundPhase && (
            <div style={{marginBottom:10,padding:'10px 12px',borderRadius:10,
              background:'rgba(155,93,229,.08)',border:'1px solid rgba(155,93,229,.25)'}}>
              <div style={{fontFamily:'var(--font-ui)',fontSize:'7px',letterSpacing:2,
                color:'rgba(155,93,229,.7)',marginBottom:6}}>
                FASE GLOBAL {curRPIdx+1}/{roundPhases.length}
              </div>
              <div style={{fontFamily:'var(--font-label)',fontSize:'13px',fontWeight:700,
                color:'var(--purple)',marginBottom:8}}>
                📍 {roundPhases[curRPIdx]?.label}
              </div>
              <div style={{display:'flex',gap:6}}>
                {!isLastRP ? (
                  <button onClick={()=>onHostAction('advance_round_phase')}
                    style={{flex:1,padding:'10px',borderRadius:9,border:'none',cursor:'pointer',
                      fontFamily:'var(--font-display)',fontSize:'12px',fontWeight:700,
                      background:'rgba(155,93,229,.2)',color:'var(--purple)'}}>
                    → {roundPhases[curRPIdx+1]?.label}
                  </button>
                ) : (
                  <button onClick={()=>onHostAction('advance_round_phase')}
                    style={{flex:1,padding:'10px',borderRadius:9,border:'none',cursor:'pointer',
                      fontFamily:'var(--font-display)',fontSize:'12px',fontWeight:700,
                      background:'rgba(0,255,157,.12)',color:'var(--green)'}}>
                    ✓ Cerrar ronda
                  </button>
                )}
                <button onClick={()=>onHostAction('back_to_turns')}
                  style={{padding:'10px 12px',borderRadius:9,border:'1px solid rgba(255,255,255,.1)',
                    cursor:'pointer',fontFamily:'var(--font-label)',fontSize:'11px',fontWeight:700,
                    background:'rgba(255,255,255,.04)',color:'rgba(255,255,255,.4)'}}>
                  ↩ Turnos
                </button>
              </div>
            </div>
          )}

          {/* Acciones primarias */}
          {primary.map(a=>(
            <button key={a.id} onClick={()=>{snd('round');onHostAction(a.id);}}
              style={{width:'100%',padding:'16px',borderRadius:12,border:'none',cursor:'pointer',
                fontFamily:'var(--font-display)',fontSize:'1rem',fontWeight:700,letterSpacing:1,
                background:'rgba(0,255,157,.12)',color:'var(--green)',marginBottom:8,
                boxShadow:'0 4px 12px rgba(0,255,157,.1)'}}>
              {a.icon} {a.label}
            </button>
          ))}

          {/* Acciones secundarias */}
          {rest.length>0 && (
            <div style={{display:'flex',gap:7,flexWrap:'wrap',marginBottom:8}}>
              {rest.map(a=>(
                <button key={a.id} onClick={()=>{snd('tap');onHostAction(a.id);}}
                  style={{padding:'9px 12px',borderRadius:9,
                    border:'1px solid rgba(255,255,255,.1)',cursor:'pointer',
                    fontFamily:'var(--font-label)',fontSize:'12px',fontWeight:700,
                    background:'rgba(255,255,255,.05)',color:'rgba(255,255,255,.6)'}}>
                  {a.icon} {a.label}
                </button>
              ))}
            </div>
          )}

          {/* Acciones peligrosas */}
          {danger.map(a=>(
            <button key={a.id} onClick={()=>{snd('elim');onHostAction(a.id);}}
              style={{width:'100%',padding:'13px',borderRadius:12,cursor:'pointer',
                fontFamily:'var(--font-display)',fontSize:'.9rem',letterSpacing:1,
                background:'rgba(255,59,92,.1)',color:'var(--red)',
                border:'1px solid rgba(255,59,92,.25)',marginBottom:4}}>
              {a.icon} {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── HELPERS ──────────────────────────────────────────────────────
function _canSee(action, isHost, isMe){
  if(isHost) return true;
  if(!action.visibleTo) return true;
  const vt = Array.isArray(action.visibleTo) ? action.visibleTo : [action.visibleTo];
  if(vt.includes('all')) return true;
  if(vt.includes('host') && isHost) return true;
  if(isMe && (vt.includes('self')||vt.includes('player')||vt.includes('all'))) return true;
  return false;
}

function getScoreDisplay(player, spec){
  const pu = spec.primaryUnit;
  // Sin registros ni victoria por puntos/wins — no mostrar score
  const hasRegs = spec.registers && spec.registers.length > 0;
  const noScore = !hasRegs && (spec.victoryMode==='manual'||spec.victoryMode==='objective');
  if(noScore) return { main:null, unit:'', color:'rgba(255,255,255,.2)' };
  if(pu==='lives')   return { main:player.lives??'—',       unit:'❤️', color:'var(--red)' };
  if(pu==='wins')    return { main:player.wins??0,           unit:'🎯', color:'var(--green)' };
  if(pu==='coins')   return { main:player.coins??0,          unit:'🪙', color:'var(--gold)' };
  if(pu==='resources') return { main:player.resources??0,   unit:'📦', color:'var(--orange)' };
  if(pu==='objectives') return { main:player.objectives??0, unit:'🎯', color:'var(--purple)' };
  return { main:player.points??0, unit:'pts', color:'var(--cyan)' };
}

function sortPlayers(players, spec){
  const active   = players.filter(p=>!p.eliminated);
  const elim     = players.filter(p=> p.eliminated);
  const pu       = spec.primaryUnit;
  const key      = pu==='lives'?'lives':pu==='wins'?'wins':pu==='coins'?'coins':'points';
  const sorted   = [...active].sort((a,b)=>(b[key]||0)-(a[key]||0));
  return [...sorted, ...elim];
}


// ── WAITING BADGE — aparece cuando no es tu turno ───────────────
function WaitingBadge({ currentPlayer, room }){
  const [elapsed, setElapsed] = React.useState(0);
  const start = room?.turnStartedAt || Date.now();
  React.useEffect(()=>{
    const t = setInterval(()=>setElapsed(Math.floor((Date.now()-start)/1000)),500);
    return ()=>clearInterval(t);
  },[start]);
  function fmtS(s){ return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; }
  return(
    <div style={{borderRadius:12,padding:'10px 14px',marginBottom:12,
      background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',
      display:'flex',alignItems:'center',gap:10}}>
      <div style={{fontSize:'1.2rem',animation:'osBlink 1.5s ease-in-out infinite'}}>⏳</div>
      <div style={{flex:1}}>
        <div style={{fontFamily:'var(--font-label)',fontSize:'12px',fontWeight:700,
          color:'rgba(255,255,255,.45)'}}>
          Turno de {currentPlayer?.name||'otro jugador'}
        </div>
        <div style={{fontFamily:'var(--font-ui)',fontSize:'8px',letterSpacing:1,
          color:'rgba(255,255,255,.25)',marginTop:2}}>
          espera tu turno
        </div>
      </div>
      <div style={{fontFamily:'var(--font-display)',fontSize:'1.1rem',
        color:elapsed>120?'var(--red)':elapsed>60?'var(--orange)':'rgba(255,255,255,.3)',
        letterSpacing:1}}>
        {fmtS(elapsed)}
      </div>
    </div>
  );
}

// ── UNIVERSAL RUNTIME v3 ─────────────────────────────────────────
function UniversalRuntime({ session, onBack, isHost, myId, db, templateConfig }){
  const [room,             setRoom]            = useState(null);
  const [elapsed,          setElapsed]         = useState(0);
  const [showEndScreen,    setShowEndScreen]   = useState(false);
  const [hostPanelOpen,    setHostPanelOpen]   = useState(false);
  const [toast,            setToast]           = useState(null);
  const [victoryResult,    setVictoryResult]   = useState(null);
  const [showRematchOverlay, setShowRematchOverlay] = useState(false);
  const [presence,         setPresence]        = useState({});
  const timerRef           = useRef(null);
  const prevStartedAtRef   = useRef(null);

  // Config v2: soporta formato nuevo y legacy
  const [resolvedConfig,   setResolvedConfig]  = useState(templateConfig);
  const [resolvedRuntime,  setResolvedRuntime] = useState(null);

  useEffect(()=>{
    const unsub = db.listen(`rooms/${session.code}`, data=>{
      if(data){
        setRoom(data);
        if(!resolvedConfig){
          const cfg = data.config || null;
          if(cfg) setResolvedConfig(cfg);
          if(data.runtimeSpec) setResolvedRuntime(data.runtimeSpec);
        }
      }
    });
    return ()=>unsub&&unsub();
  },[session.code]);

  const spec = useMemo(()=>{
    if(!resolvedConfig) return null;
    const s = interpret(resolvedConfig);

    // Enriquecer con motor v2: usa runtimeSpec del room si existe,
    // si no, lo calcula en el cliente (fallback para salas sin runtimeSpec)
    const rt = resolvedRuntime ||
      (typeof window.RuntimeResolver?.resolveRuntime === 'function'
        ? (() => { try{ return window.RuntimeResolver.resolveRuntime(resolvedConfig); }catch(e){ return null; } })()
        : null);

    if(rt){
      s._timeline         = rt.timeline                   || [];
      s._checklist        = rt.phaseChecklistResolved     || [];
      s._entities         = rt.externalEntitiesResolved   || [];
      s._captureActions   = rt.captureActionsResolved     || [];
      s._resultActions    = rt.resultActionsResolved      || [];
      s._statusIndicators = rt.statusIndicatorsResolved   || [];
      s._phases           = rt.gamePhasesResolved         || [];
    }
    window._runtimeSpec = s;
    return s;
  },[resolvedConfig, resolvedRuntime, resolverReady]);

  // Forzar recálculo del spec cuando RuntimeResolver carga (puede cargarse después del runtime)
  const [resolverReady, setResolverReady] = useState(!!window.RuntimeResolver?.resolveRuntime);
  useEffect(()=>{
    if(resolverReady) return;
    const check = setInterval(()=>{
      if(window.RuntimeResolver?.resolveRuntime){
        setResolverReady(true);
        clearInterval(check);
      }
    }, 200);
    return ()=>clearInterval(check);
  },[resolverReady]);

  useEffect(()=>{ if(myId&&session.code) setupPresence(session.code,myId); return()=>teardownPresence(); },[session.code,myId]);
  useEffect(()=>{
    if(!session?.code) return;
    const unsub = db.listen(`rooms/${session.code}/rematchPending`, p=>{ setShowRematchOverlay(p===true); });
    return ()=>unsub&&unsub();
  },[session?.code]);
  useEffect(()=>{
    if(!session.code) return;
    const unsub = listenPresence(session.code, setPresence);
    return ()=>unsub&&unsub();
  },[session.code]);
  useEffect(()=>{
    if(!room||room.status!=='active') return;
    timerRef.current = setInterval(()=>setElapsed(Date.now()-room.startedAt),1000);
    return ()=>clearInterval(timerRef.current);
  },[room?.status,room?.startedAt]);
  useEffect(()=>{
    if(room?.status==='finished') setShowEndScreen(true);
    else setShowEndScreen(false);
  },[room?.status]);
  useEffect(()=>{
    if(!room) return;
    if(room.status==='active' && prevStartedAtRef.current!==room.startedAt){
      prevStartedAtRef.current = room.startedAt||null;
      setShowEndScreen(false); setVictoryResult(null);
      setToast(null); setShowRematchOverlay(false);
      // Auto-inicializar checklist y fase si no existen
      if(spec && !room.checklist && spec._checklist?.length){
        const initCl = {};
        spec._checklist.forEach(c=>{
          initCl[c.id]={done:false,required:c.required!==false,reset:c.autoReset||'round'};
        });
        db.set(`rooms/${session.code}/checklist`, initCl).catch(()=>{});
      }
      if(spec && !room.currentPhase && spec._phases?.length){
        const firstPhase = spec._phases[0];
        if(firstPhase?.id) db.set(`rooms/${session.code}/currentPhase`, firstPhase.id).catch(()=>{});
      }
      // Inicializar fase de turno si hay fases de scope:turn
      if(spec && !room.turnPhase && spec._phases?.length){
        const firstTurnPhase = spec._phases.find(p=>p.scope==='turn');
        if(firstTurnPhase?.id) db.set(`rooms/${session.code}/turnPhase`, firstTurnPhase.id).catch(()=>{});
      }
    } else if(room.status==='lobby'){
      setShowEndScreen(false); setVictoryResult(null); setToast(null); setShowRematchOverlay(false);
    }
  },[room?.status,room?.startedAt]);

  function showToast(msg, color='var(--cyan)'){
    setToast({msg,color}); setTimeout(()=>setToast(null),2500);
  }

  async function handlePlayerAction(action, playerId, payload){
    if(!room||!spec) return;
    snd('score');
    const result = applyAction(action, playerId, payload, room, spec);
    if(!result) return;
    let updates = { players:result.players, events:result.events };
    if(result.victoryResult){
      const w = result.victoryResult.winner;
      updates.status='finished'; updates.endedAt=Date.now();
      updates.winner={id:w.id,name:w.name,emoji:w.emoji};
      snd('victory'); showToast(`🏆 ${w.name} gana!`,'var(--gold)');
    }
    await db.set(`rooms/${session.code}`,{...room,...updates});
    const pname = result.players.find(p=>p.id===playerId)?.name||'';
    if(action.id==='add_points') showToast(`+${payload.value} pts → ${pname}`,'var(--cyan)');
    if(action.id==='lose_life')  showToast(`${pname} pierde una vida`,'var(--red)');
    if(action.id==='add_win')    showToast(`🏆 ${pname} gana ronda`,'var(--gold)');
    if(action.id==='eliminate')  showToast(`💀 ${pname} eliminado`,'var(--red)');
  }

  async function handleHostAction(actionId){
    if(!room||!spec) return;
    const now = Date.now();
    switch(actionId){
      case 'advance_round_phase':{
        snd('tap');
        const rPhases = (spec._phases||[]).filter(p=>p.scope==='round');
        const curRPIdx = rPhases.findIndex(p=>p.id===room.currentPhase);
        if(curRPIdx < rPhases.length-1){
          const nextRP = rPhases[curRPIdx+1];
          await db.set(`rooms/${session.code}/currentPhase`, nextRP.id);
          showToast(`📍 ${nextRP.label}`,'var(--purple)');
          // Reset round checks for this new phase
          const resetCL = Object.fromEntries(
            Object.entries(room.checklist||{}).map(([k,v])=>{
              const sc = spec._checklist?.find(c=>c.phaseId===nextRP.id&&c.id===k);
              return sc ? [k, typeof v==='object'?{...v,done:false}:false] : [k,v];
            })
          );
          await db.set(`rooms/${session.code}/checklist`, resetCL);
        } else {
          // Last round phase done → close round
          handleHostAction('close_round');
        }
        break;
      }
      case 'back_to_turns':{
        // Return from round phases back to player turns
        snd('tap');
        const firstTurnPhase2 = (spec._phases||[]).find(p=>p.scope==='turn')?.id||null;
        await db.set(`rooms/${session.code}/currentPhase`, firstTurnPhase2);
        showToast('↩ Volviendo a turnos de jugadores','var(--cyan)');
        break;
      }
      case 'close_round':{
        snd('round');
        const nextRound = (room.currentRound||1)+1;
        const newRound  = {number:room.currentRound||1, closedAt:now};
        const rounds    = [...(room.rounds||[]), newRound];
        // Al cerrar ronda: volver a primera fase si las fases son de scope=round
        const firstPhase = spec._timeline?.find(t=>t.type==='phase');
        let updates     = {rounds, currentRound:nextRound,
          ...(firstPhase?{currentPhase:firstPhase.phaseId}:{})};
        // Reiniciar checklist de ronda
        if(room.checklist){
          const resetChecklist = {};
          const cl = room.checklist;
          Object.keys(cl).forEach(k=>{
            if(cl[k]?.reset==='round') resetChecklist[k]={...cl[k],done:false};
            else resetChecklist[k]=cl[k];
          });
          updates.checklist = resetChecklist;
        }
        const finished = spec.totalRounds && nextRound > spec.totalRounds;
        if(finished){
          const sorted = sortPlayers(room.players||[],spec);
          const w = sorted[0];
          updates.status='finished'; updates.endedAt=now;
          updates.winner={id:w?.id,name:w?.name,emoji:w?.emoji};
          snd('victory');
        }
        await db.set(`rooms/${session.code}`,{...room,...updates});
        showToast(`✓ Ronda ${room.currentRound||1} cerrada`,'var(--green)');
        break;
      }
      case 'set_phase':{
        // Lo maneja handleCheckAction
        break;
      }
      case 'next_turn':{
        snd('tap');
        const active = (room.players||[]).filter(p=>!p.eliminated);
        const cur = room.currentTurnIdx||0;
        const next = (cur+1)%Math.max(1,active.length);
        const firstTurnPhaseNT = spec._phases?.find(p=>p.scope==='turn')?.id||null;
        await db.set(`rooms/${session.code}`,{
          ...room,
          currentTurnIdx:next,
          turnPhase:firstTurnPhaseNT,
          turnStartedAt:Date.now(),
        });
        showToast(`↩ Turno de ${active[next]?.name||'siguiente'}`,'var(--gold)');
        break;
      }
      case 'end_match':{
        const sorted = sortPlayers(room.players||[],spec);
        const w = sorted[0];
        await db.set(`rooms/${session.code}`,{...room,status:'finished',endedAt:now,
          winner:{id:w?.id,name:w?.name,emoji:w?.emoji}});
        break;
      }
      default: break;
    }
  }

  async function handleCheckAction(type, id){
    if(!room||!spec) return;
    if(type==='toggle_check'){
      const cur = room.checklist?.[id];
      const curDone = typeof cur==='object' ? cur.done : !!cur;
      // Si el checklist no existe en Firebase, inicializarlo desde spec
      if(!room.checklist){
        const initChecklist = {};
        (spec._checklist||[]).forEach(c=>{
          initChecklist[c.id] = {done:false,required:c.required!==false,reset:c.autoReset||'round'};
        });
        initChecklist[id] = {...(initChecklist[id]||{}), done:true};
        await db.set(`rooms/${session.code}/checklist`, initChecklist);
      } else {
        const newVal = typeof cur==='object' ? {...cur, done:!curDone} : !curDone;
        await db.set(`rooms/${session.code}/checklist/${id}`, newVal);
      }
      snd('tap');
    } else if(type==='set_phase'){
      await db.set(`rooms/${session.code}/currentPhase`, id);
      snd('tap');
      const phaseName = spec._timeline?.find(t=>t.phaseId===id&&t.type==='phase')?.label || id;
      showToast(`📍 ${phaseName}`,'var(--purple)');
    }
  }

  if(showRematchOverlay) return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.92)',zIndex:9999,
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16}}>
      <div style={{fontFamily:'var(--font-display)',fontSize:'3rem',animation:'elimPulse 1s ease-in-out infinite'}}>🔁</div>
      <div style={{fontFamily:'var(--font-display)',fontSize:'1.4rem',letterSpacing:3,color:'var(--cyan)'}}>REVANCHA</div>
      <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-sm)',color:'rgba(255,255,255,.4)',letterSpacing:2}}>Preparando nueva partida...</div>
      <div className="os-spin" style={{width:32,height:32,borderWidth:3,marginTop:8}}/>
    </div>
  );

  if(!room||!resolvedConfig||!spec) return(
    <div className="os-wrap"><div className="os-page" style={{paddingTop:80,textAlign:'center'}}>
      <div className="os-spin" style={{marginBottom:16}}/>
      <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.3)',letterSpacing:2}}>
        {!room?'CONECTANDO...':!spec?'INICIANDO MOTOR...':'CARGANDO CONFIG...'}
      </div>
    </div></div>
  );

  if(showEndScreen) return(
    <UniversalEndScreen room={room} myId={myId} isHost={effectiveIsHost}
      spec={spec} onBack={onBack} db={db} session={session}/>
  );

  const players          = room.players||[];
  const effectiveIsHost  = isHost||(myId&&room.hostId&&room.hostId===myId);
  const sorted           = sortPlayers(players,spec);
  const currentRound     = room.currentRound||1;
  const activeCount      = players.filter(p=>!p.eliminated).length;
  const activePlayers    = players.filter(p=>!p.eliminated);
  const currentTurnPlayer= spec.hasTurns
    ? activePlayers[(room.currentTurnIdx||0)%Math.max(1,activePlayers.length)]
    : null;
  const actions          = spec.playerActions||[];
  // Datos del nuevo motor
  const captureActions   = spec._captureActions||[];
  const resultActions    = spec._resultActions||[];
  const statusIndicators = spec._statusIndicators||[];

  return(
    <div className="os-wrap">
      {/* Toast */}
      {toast&&(
        <div style={{position:'fixed',top:70,left:'50%',transform:'translateX(-50%)',
          zIndex:998,background:'#0D0D1C',border:`1px solid ${toast.color}55`,
          borderRadius:30,padding:'8px 20px',fontFamily:'var(--font-display)',
          fontSize:'var(--fs-sm)',color:toast.color,letterSpacing:1,
          whiteSpace:'nowrap',animation:'popIn .25s ease',
          boxShadow:`0 4px 20px ${toast.color}33`}}>
          {toast.msg}
        </div>
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
            <div className="match-timer" style={{fontSize:'1rem'}}>{fmtDuration(elapsed)}</div>
          </div>
        </div>
      </div>

      <div className="os-page" style={{paddingTop:14}}>

        {/* Ronda */}
        <RoundBadge current={currentRound} total={spec.totalRounds} spec={spec}/>

        {/* Para jugadores no-host cuando no es su turno */}
        {spec.hasTurns && currentTurnPlayer && !effectiveIsHost &&
          currentTurnPlayer.id !== myId &&
          spec._phases?.filter(p=>p.scope==='turn').length > 0 && (
          <WaitingBadge currentPlayer={currentTurnPlayer} room={room}/>
        )}

        {/* Asistente de turno — reloj + fases + recordatorios */}
        {spec.hasTurns && currentTurnPlayer && spec._phases?.filter(p=>p.scope==='turn').length > 0 &&
         (effectiveIsHost || currentTurnPlayer.id === myId) && (
          <TurnAssistant
            spec={spec}
            room={room}
            currentPlayer={currentTurnPlayer}
            isHost={effectiveIsHost}
            isMyTurn={currentTurnPlayer?.id === myId || effectiveIsHost}
            onEndTurn={async (turnSecs)=>{
              snd('round');
              const updatedPlayers = (room.players||[]).map(p=>
                p.id===currentTurnPlayer.id
                  ? {...p, turnHistory:[...(p.turnHistory||[]),{round:currentRound,secs:turnSecs}]}
                  : p
              );
              const active  = updatedPlayers.filter(p=>!p.eliminated);
              const cur     = room.currentTurnIdx||0;
              const next    = (cur+1)%Math.max(1,active.length);
              const firstTurnPhase = spec._phases?.find(p=>p.scope==='turn')?.id || null;

              // Detectar si TODOS los jugadores activos completaron su turno en esta vuelta
              // Usamos: el último turno completado es el del último jugador activo (next vuelve a 0)
              const completedFullRound = next === 0 && active.length > 1;
              const roundPhases = (spec._phases||[]).filter(p=>p.scope==='round');
              const turnPhasesList = (spec._phases||[]).filter(p=>p.scope==='turn');
              const curRoundPhase = room.currentPhase;
              const curRoundPhaseIdx = roundPhases.findIndex(p=>p.id===curRoundPhase);

              // Si había fases de ronda activas (scope:round), mantener la actual
              // Si todos completaron su turno Y hay fases de ronda → avanzar a la primera
              let nextRoundPhase = curRoundPhase;
              const inRoundPhase = curRoundPhase && roundPhases.some(p=>p.id===curRoundPhase);

              if(completedFullRound && roundPhases.length > 0 && !inRoundPhase){
                // Entrar a la primera fase de ronda
                nextRoundPhase = roundPhases[0].id;
                const phaseName = roundPhases[0].label;
                showToast(`📍 ${phaseName}`, 'var(--purple)');
                snd('round');
              } else if(completedFullRound && roundPhases.length === 0){
                // Sin fases de ronda — solo notificar vuelta completa
                showToast(`🔄 Todos jugaron — Ronda ${currentRound}`, 'var(--cyan)');
              }

              // Reset checks según scope
              const resetChecklist = Object.fromEntries(
                Object.entries(room.checklist||{}).map(([k,v])=>{
                  const sc = spec._checklist?.find(c=>c.id===k);
                  if(sc?.autoReset==='turn') return [k, typeof v==='object'?{...v,done:false}:false];
                  if(sc?.autoReset==='round' && completedFullRound) return [k, typeof v==='object'?{...v,done:false}:false];
                  return [k,v];
                })
              );

              await db.set(`rooms/${session.code}`,{
                ...room,
                players: updatedPlayers,
                currentTurnIdx: next,
                turnPhase: firstTurnPhase,
                currentPhase: nextRoundPhase,
                checklist: resetChecklist,
                turnStartedAt: Date.now(),
              });

              if(!completedFullRound || roundPhases.length === 0){
                showToast(`↩ Turno de ${active[next]?.name||'siguiente'}`,'var(--gold)');
              }
            }}
            onPhaseAction={handleCheckAction}
            onAction={handlePlayerAction}
            db={db}
            session={session}
          />
        )}
        {/* Turno simple (sin fases definidas) */}
        {spec.hasTurns && currentTurnPlayer && !spec._phases?.filter(p=>p.scope==='turn').length && (
          <div style={{background:'rgba(255,212,71,.05)',border:'1px solid rgba(255,212,71,.2)',
            borderRadius:10,padding:'8px 12px',marginBottom:10,
            display:'flex',alignItems:'center',gap:8}}>
            <div style={{fontFamily:'var(--font-ui)',fontSize:'8px',letterSpacing:2,
              color:'rgba(255,212,71,.5)',flexShrink:0}}>TURNO</div>
            <div style={{fontSize:'1.2rem'}}>{currentTurnPlayer.emoji}</div>
            <div style={{fontFamily:'var(--font-label)',fontWeight:700,fontSize:'13px',
              color:'var(--gold)',flex:1}}>{currentTurnPlayer.name}</div>
            {currentTurnPlayer.id===myId&&(
              <div style={{fontFamily:'var(--font-ui)',fontSize:'7px',color:'var(--cyan)',letterSpacing:2}}>TÚ</div>
            )}
            {effectiveIsHost&&(
              <button onClick={()=>handleHostAction('next_turn')}
                style={{background:'rgba(255,212,71,.1)',border:'1px solid rgba(255,212,71,.25)',
                  borderRadius:7,padding:'4px 10px',cursor:'pointer',fontFamily:'var(--font-label)',
                  fontSize:'11px',fontWeight:700,color:'var(--gold)'}}>↩ Sig.</button>
            )}
          </div>
        )}

        {/* Timer */}
        {spec.hasTimer&&spec.timerScope==='turn'&&(
          <div style={{background:'rgba(255,107,53,.08)',border:'1px solid rgba(255,107,53,.2)',
            borderRadius:10,padding:'8px 14px',marginBottom:10,display:'flex',alignItems:'center',gap:10}}>
            <div style={{fontFamily:'var(--font-display)',fontSize:'1.3rem',color:'var(--orange)'}}>⏳</div>
            <div style={{fontFamily:'var(--font-display)',fontSize:'1.3rem',color:'var(--orange)'}}>{spec.timerSecs}s</div>
            <div style={{flex:1,height:4,background:'rgba(255,255,255,.1)',borderRadius:2}}>
              <div style={{width:'60%',height:'100%',background:'var(--orange)',borderRadius:2}}/>
            </div>
          </div>
        )}

        {/* Fases y checklist */}
        <PhaseBand spec={spec} room={room}
          onCheck={handleCheckAction} isHost={effectiveIsHost}/>

        {/* Herramientas */}
        {spec.hasTools&&spec.toolbarItems?.length>0&&(
          <ToolsToolbar spec={spec} players={activePlayers}/>
        )}

        {/* Jugadores */}
        <div className="os-section">
          {activeCount} ACTIVOS
          {players.some(p=>p.eliminated)&&` · ${players.filter(p=>p.eliminated).length} ELIMINADOS`}
        </div>

        {sorted.map(player=>(
          <PlayerActionCard key={player.id}
            player={{...player, _isTurn: currentTurnPlayer?.id===player.id}}
            spec={spec} actions={actions}
            captureActions={captureActions}
            resultActions={resultActions}
            statusIndicators={statusIndicators}
            isHost={effectiveIsHost} myId={myId}
            onAction={handlePlayerAction}
            currentRound={currentRound} presence={presence}/>
        ))}

        {/* Auto-eliminación jugador */}
        {(()=>{
          const me = players.find(p=>p.id===myId);
          const isSurvival = spec.hasElimination||spec.victoryMode==='lives'||spec.victoryMode==='elimination';
          if(!me||me.eliminated||!isSurvival) return null;
          return(
            <div style={{marginTop:8}}>
              <button className="btn-elim-big"
                onClick={()=>handlePlayerAction({id:'eliminate',icon:'💀',color:'var(--red)',
                  type:'confirm_action'},me.id,{reason:'manual'})}>
                💀 ME ELIMINÉ
              </button>
            </div>
          );
        })()}

        {/* Panel host */}
        {effectiveIsHost&&(
          <HostPanel spec={spec} room={room}
            onHostAction={handleHostAction}
            isOpen={hostPanelOpen}
            onToggle={()=>setHostPanelOpen(o=>!o)}/>
        )}

        {!effectiveIsHost&&myId&&!players.find(p=>p.id===myId)&&(
          <div className="os-alert alert-cyan" style={{justifyContent:'center',textAlign:'center',marginTop:16}}>
            👁 Modo espectador · Solo lectura
          </div>
        )}

        <div className="g16"/>
        {effectiveIsHost&&<button className="btn btn-ghost" onClick={onBack} style={{marginBottom:8}}>🚪 Salir como host</button>}
        <button className="btn btn-back" onClick={onBack}>← Volver al menú</button>
      </div>
    </div>
  );
}

// ── UNIVERSAL END SCREEN ─────────────────────────────────────────
function UniversalEndScreen({ room, myId, isHost, spec, onBack, db, session }){
  const players = sortPlayers(room.players||[], spec);
  const isCooperative = spec.type === 'cooperative';
  const winner  = isCooperative ? null : players[0];
  const totalDuration = room.endedAt&&room.startedAt ? fmtDuration(room.endedAt-room.startedAt) : '—';
  const [rematchLoading, setRematchLoading] = useState(false);
  const effectiveIsHostES = isHost||(myId&&room.hostId&&room.hostId===myId);

  useEffect(()=>{ snd('victory'); },[]);

  const confetti = Array.from({length:28},(_,i)=>({
    id:i, c:['#FFD447','#FF6B35','#00F5FF','#00FF9D','#9B5DE5'][i%5],
    l:Math.round(Math.random()*100)+'%',
    dl:Math.round(Math.random()*20)/10+'s',
    dr:Math.round((2+Math.random()*2.5)*10)/10+'s',
    sz:Math.round(6+Math.random()*8)+'px',
  }));

  const winEmoji = spec.victoryMode==='points'?'🏅':spec.victoryMode==='wins'?'🏆':
    spec.victoryMode==='lives'?'❤️':spec.victoryMode==='elimination'?'💀':'🏆';

  async function handleRematch(){
    if(!effectiveIsHostES) return;
    snd('round'); setRematchLoading(true);
    await db.set(`rooms/${session.code}/rematchPending`,true);
    await new Promise(r=>setTimeout(r,2500));
    const freshPlayers = (room.players||[]).map(p=>({
      ...spec.playerInit,
      id:p.id,name:p.name,emoji:p.emoji,color:p.color,isHost:p.isHost||false,
    }));
    await db.set(`rooms/${session.code}`,{
      ...room,status:'lobby',players:freshPlayers,
      currentRound:1,rounds:[],events:[],currentPhase:null,
      checklist:null,startedAt:null,endedAt:null,winner:null,
      rematchPending:false,rematchCode:null,
    });
    setRematchLoading(false);
  }

  return(
    <div className="end-screen">
      <div className="end-confetti">
        {confetti.map(d=>(
          <div key={d.id} style={{position:'absolute',background:d.c,width:d.sz,height:d.sz,
            left:d.l,top:-20,borderRadius:Math.random()>.5?'50%':'3px',
            animation:`confettiFall ${d.dr} ${d.dl} linear infinite`}}/>
        ))}
      </div>
      <div className="end-trophy">{winEmoji}</div>
      <div className="end-label">
        {spec.victoryMode==='lives'?'ÚLTIMO CON VIDA':spec.victoryMode==='wins'?'MÁS VICTORIAS':'CAMPEÓN'}
      </div>
      <div className="end-gamename">{(room.customTitle||'PARTIDA').toUpperCase()}</div>
      {isCooperative ? (
        <div style={{textAlign:'center',marginBottom:8}}>
          <div style={{fontSize:'2.8rem',marginBottom:8}}>🤝</div>
          <div className="end-winner-name" style={{color:'var(--green)'}}>¡EQUIPO GANADOR!</div>
          <div style={{display:'flex',gap:6,justifyContent:'center',flexWrap:'wrap',marginTop:8,marginBottom:4}}>
            {players.map(p=>(
              <div key={p.id} style={{padding:'4px 10px',borderRadius:20,
                background:'rgba(0,255,157,.1)',border:'1px solid rgba(0,255,157,.25)',
                fontFamily:'var(--font-label)',fontSize:'12px',fontWeight:700,color:'var(--green)'}}>
                {p.emoji} {p.name}
              </div>
            ))}
          </div>
          <div className="end-stats">{totalDuration}</div>
        </div>
      ) : winner&&(
        <>
          <div style={{fontSize:'2.6rem',marginBottom:6}}>{winner.emoji}</div>
          <div className="end-winner-name" style={{color:winner.color||'#fff'}}>{winner.name}</div>
          <div className="end-stats">
            {spec.primaryUnit==='points'?`${winner.points||0} PUNTOS · ${totalDuration}`:
             spec.primaryUnit==='wins'?`${winner.wins||0} MISIONES · ${totalDuration}`:
             spec.primaryUnit==='lives'?`${winner.lives||0} VIDAS · ${totalDuration}`:totalDuration}
          </div>
        </>
      )}
      <div style={{width:'100%',maxWidth:380,marginBottom:20}}>
        {players.slice(0,6).map((p,i)=>{
          const display = getScoreDisplay(p,spec);
          // Calcular tiempo total de todos los turnos del jugador
          const totalTurnSecs = (p.turnHistory||[]).reduce((s,t)=>s+(t.secs||0),0);
          const avgTurnSecs   = p.turnHistory?.length
            ? Math.round(totalTurnSecs/p.turnHistory.length) : null;
          const showTime = spec.trackTurnDuration && totalTurnSecs > 0;
          function fmtS(s){ return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; }
          return(
            <div key={p.id} className={`player-row ${i===0?'winner-row':''}`}
              style={{marginBottom:6,flexWrap:'wrap'}}>
              <div className="player-pos">{i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}</div>
              <div className="player-emoji">{p.emoji}</div>
              <div style={{flex:1}}>
                <div className="player-name" style={{color:p.color||'#fff'}}>
                  {p.name}{p.id===myId&&<span style={{fontFamily:'var(--font-ui)',fontSize:'.5rem',color:'var(--cyan)',letterSpacing:2,marginLeft:5}}>TÚ</span>}
                </div>
                {showTime&&(
                  <div style={{fontFamily:'var(--font-ui)',fontSize:'8px',letterSpacing:1,
                    color:'rgba(255,255,255,.3)',marginTop:1}}>
                    ⏱ total {fmtS(totalTurnSecs)}
                    {avgTurnSecs&&` · prom ${fmtS(avgTurnSecs)}`}
                    {` · ${p.turnHistory?.length||0} turnos`}
                  </div>
                )}
              </div>
              <div className="player-stat" style={{color:i===0?'var(--gold)':'rgba(255,255,255,.55)'}}>
                {display.main !== null ? `${display.main} ${display.unit}` : (showTime ? fmtS(totalTurnSecs) : '—')}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{width:'100%',maxWidth:320,display:'flex',flexDirection:'column',gap:8}}>
        {spec.rematch?.keepPlayers&&effectiveIsHostES&&(
          !rematchLoading
            ? <button className="btn btn-cyan" style={{marginBottom:0}} onClick={handleRematch}>🔁 REVANCHA</button>
            : <div style={{textAlign:'center',padding:'12px 0'}}>
                <div style={{fontFamily:'var(--font-display)',fontSize:'1rem',color:'var(--cyan)',
                  letterSpacing:2,animation:'osBlink 1s ease-in-out infinite'}}>🔁 PREPARANDO...</div>
              </div>
        )}
        {spec.rematch?.keepPlayers&&!effectiveIsHostES&&(
          <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(255,255,255,.3)',
            letterSpacing:1,textAlign:'center',padding:'8px 0'}}>
            ⏳ Esperando decisión del host
          </div>
        )}
        {effectiveIsHostES&&<button className="btn btn-ghost" style={{marginBottom:0}} onClick={onBack}>🚪 Salir como host</button>}
        <button className="btn btn-ghost" style={{marginBottom:0}} onClick={onBack}>🏠 Volver al menú</button>
      </div>
    </div>
  );
}

// ── OPTION SELECTOR MODAL ─────────────────────────────────────────
function OptionSelectorModal({ action, player, onConfirm, onCancel }){
  const [selected, setSelected] = React.useState(null);
  return(
    <div style={{position:'fixed',inset:0,zIndex:999,background:'rgba(0,0,0,.8)',
      backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div className="anim-pop" style={{background:'#0D0D1C',border:`1px solid ${action.color}44`,
        borderRadius:20,padding:'24px 20px',width:'100%',maxWidth:340}}>
        <div style={{fontFamily:'var(--font-display)',fontSize:'1rem',letterSpacing:1,
          color:action.color,marginBottom:4}}>{action.icon} {action.label}</div>
        <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',
          color:'rgba(255,255,255,.4)',marginBottom:16}}>{player.emoji} {player.name}</div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:20}}>
          {(action.options||[]).map(opt=>(
            <button key={opt} onClick={()=>{snd('tap');setSelected(opt);}}
              style={{padding:'9px 14px',borderRadius:10,cursor:'pointer',
                border:`1px solid ${selected===opt?action.color:'rgba(255,255,255,.15)'}`,
                background:selected===opt?action.color+'22':'transparent',
                color:selected===opt?action.color:'rgba(255,255,255,.6)',
                fontFamily:'var(--font-label)',fontSize:'var(--fs-sm)',fontWeight:700}}>
              {opt}
            </button>
          ))}
        </div>
        <div style={{display:'flex',gap:10}}>
          <button className="btn btn-ghost" style={{flex:1,marginBottom:0}} onClick={onCancel}>Cancelar</button>
          <button className="btn" disabled={!selected}
            style={{flex:1,marginBottom:0,background:selected?action.color:'rgba(255,255,255,.1)',
              color:'var(--bg)',border:'none',borderRadius:12,padding:14,
              fontFamily:'var(--font-display)',fontSize:'var(--fs-sm)',
              cursor:selected?'pointer':'not-allowed'}}
            onClick={()=>{snd('score');onConfirm({condition:selected,value:selected});}}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CONFIRM MODAL ─────────────────────────────────────────────────
function ConfirmModal_R({ action, player, spec, onConfirm, onCancel }){
  const [elimReason, setElimReason] = React.useState(null);
  const reasons = [
    {id:'zero_lives',label:'Sin vidas',emoji:'❤️'},
    {id:'last_place',label:'Último lugar',emoji:'📉'},
    {id:'rule',label:'Regla del juego',emoji:'📋'},
    {id:'manual',label:'Decisión del host',emoji:'👑'},
  ];
  return(
    <div style={{position:'fixed',inset:0,zIndex:999,background:'rgba(0,0,0,.85)',
      backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div className="anim-pop" style={{background:'#0D0D1C',border:'2px solid rgba(255,59,92,.35)',
        borderRadius:20,padding:'24px 20px',width:'100%',maxWidth:340,textAlign:'center'}}>
        <div style={{fontSize:'2.5rem',marginBottom:8}}>{player.emoji}</div>
        <div style={{fontFamily:'var(--font-display)',fontSize:'1.1rem',letterSpacing:1,
          color:'var(--red)',marginBottom:4}}>💀 Eliminar a {player.name}</div>
        <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',
          color:'rgba(255,255,255,.4)',marginBottom:16}}>Esta acción no se puede deshacer fácilmente.</div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'center',marginBottom:18}}>
          {reasons.map(r=>(
            <button key={r.id} onClick={()=>{snd('tap');setElimReason(r.id);}}
              style={{padding:'7px 12px',borderRadius:10,cursor:'pointer',
                border:`1px solid ${elimReason===r.id?'rgba(255,59,92,.5)':'rgba(255,255,255,.12)'}`,
                background:elimReason===r.id?'rgba(255,59,92,.2)':'transparent',
                color:elimReason===r.id?'var(--red)':'rgba(255,255,255,.5)',
                fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)'}}>
              {r.emoji} {r.label}
            </button>
          ))}
        </div>
        <div style={{display:'flex',gap:10}}>
          <button className="btn btn-ghost" style={{flex:1,marginBottom:0}} onClick={onCancel}>Cancelar</button>
          <button className="btn btn-red" style={{flex:1,marginBottom:0}}
            onClick={()=>{snd('elim');onConfirm({reason:elimReason});}}>
            💀 Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── TOOLS TOOLBAR ────────────────────────────────────────────────
function ToolsToolbar({ spec, players }){
  const items = spec.toolbarItems || [];
  if(!items.length) return null;
  return(
    <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
      {items.map(item=>(
        <button key={item.id}
          style={{padding:'7px 11px',borderRadius:9,cursor:'pointer',
            border:'1px solid rgba(255,255,255,.1)',background:'rgba(255,255,255,.05)',
            color:'rgba(255,255,255,.65)',fontFamily:'var(--font-label)',
            fontSize:'11px',fontWeight:700}}>
          {item.icon} {item.label}
        </button>
      ))}
    </div>
  );
}
