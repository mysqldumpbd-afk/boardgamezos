// ═══════════════════════════════════════════════════════════════
// runtime.jsx — BOARDGAMEZ OS v3.0
// Motor universal conectado al nuevo pipeline del motor:
// interpret() + resolveRuntime() → UI adaptativa por juego
// ═══════════════════════════════════════════════════════════════
if(window._splashStep) window._splashStep(5);
const {useState,useEffect,useRef,useMemo,useCallback} = React;

// ── CALCULADORA DE JUEGO v2 ─────────────────────────────────────
function GameCalc({ action, player, onConfirm, onCancel }){
  const [val,      setVal]   = React.useState('');
  const allowNeg  = !!action.allowNegative;
  const quick     = (action.quickValues||[]).filter(v=>typeof v==='number');
  const quickPos  = quick.filter(v=>v>0);
  const quickNeg  = quick.filter(v=>v<0);
  const color     = action.color || 'var(--cyan)';

  const numVal    = parseFloat(val);
  const hasVal    = !isNaN(numVal) && numVal !== 0 && val !== '' && val !== '-';
  const display   = val===''?'0':val==='-'?'-':(numVal>0&&allowNeg?'+':'')+val;

  function digit(d){
    snd('tap');
    setVal(prev=>{
      if(prev.replace('-','').length >= 5) return prev;
      if(prev==='' && d==='0') return '0';
      if(d==='-') return allowNeg ? (prev==='-'?'':'-') : prev;
      if(prev==='0' && d!=='.') return d;
      return prev+d;
    });
  }
  function del(){ snd('tap'); setVal(p=>p.slice(0,-1)||''); }
  function tap(v){ snd('tap'); setVal(String(v)); }
  function confirm(){
    if(!hasVal) return;
    snd('score');
    onConfirm({ value: numVal });
  }

  return(
    <div style={{position:'fixed',inset:0,zIndex:9999,
      background:'rgba(0,0,0,.75)',backdropFilter:'blur(10px)',
      display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
      <div style={{
        background:'linear-gradient(180deg,#0F0F20 0%,#090910 100%)',
        borderTop:`2px solid ${color}55`,
        borderRadius:'24px 24px 0 0',
        padding:'0 0 env(safe-area-inset-bottom,0)',
        width:'100%',maxWidth:420,
        boxShadow:`0 -8px 40px ${color}22`,
      }}>

        {/* HANDLE */}
        <div style={{display:'flex',justifyContent:'center',padding:'10px 0 2px'}}>
          <div style={{width:36,height:4,borderRadius:2,background:'rgba(255,255,255,.15)'}}/>
        </div>

        {/* HEADER */}
        <div style={{display:'flex',alignItems:'center',gap:12,padding:'10px 20px 14px'}}>
          <div style={{width:44,height:44,borderRadius:13,
            background:`${color}15`,border:`1.5px solid ${color}30`,
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem'}}>
            {action.icon||'➕'}
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:'var(--font-display)',fontSize:'1rem',letterSpacing:1,color}}>{action.label}</div>
            <div style={{fontFamily:'var(--font-label)',fontSize:'11px',color:'rgba(255,255,255,.35)',marginTop:1}}>
              {player?.emoji} {player?.name}
            </div>
          </div>
          <button onClick={onCancel} style={{width:32,height:32,borderRadius:10,
            background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.12)',
            color:'rgba(255,255,255,.4)',cursor:'pointer',fontSize:'14px',
            display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
        </div>

        {/* QUICK VALUES */}
        {(quickPos.length>0||quickNeg.length>0)&&(
          <div style={{padding:'0 16px 12px',display:'flex',gap:6,flexWrap:'wrap'}}>
            {quickPos.map(v=>(
              <button key={v} onClick={()=>tap(v)}
                style={{flex:1,minWidth:52,padding:'9px 4px',borderRadius:11,border:'none',cursor:'pointer',
                  fontFamily:'var(--font-display)',fontSize:'14px',fontWeight:700,
                  background: String(val)===String(v)?color:'rgba(255,255,255,.08)',
                  color: String(val)===String(v)?'#07070F':'rgba(255,255,255,.7)',
                  transition:'all .12s'}}>
                +{v}
              </button>
            ))}
            {allowNeg&&quickNeg.map(v=>(
              <button key={v} onClick={()=>tap(v)}
                style={{flex:1,minWidth:52,padding:'9px 4px',borderRadius:11,border:'none',cursor:'pointer',
                  fontFamily:'var(--font-display)',fontSize:'14px',fontWeight:700,
                  background: String(val)===String(v)?'var(--red)':'rgba(255,59,92,.1)',
                  color: String(val)===String(v)?'#fff':'rgba(255,100,100,.8)',
                  transition:'all .12s'}}>
                {v}
              </button>
            ))}
          </div>
        )}

        {/* DISPLAY */}
        <div style={{margin:'0 16px 12px',padding:'12px 20px',borderRadius:14,
          background:'rgba(0,0,0,.4)',border:`1px solid ${hasVal?color+'44':'rgba(255,255,255,.08)'}`,
          textAlign:'center',transition:'border .2s'}}>
          <div style={{fontFamily:'var(--font-display)',fontSize:'2.6rem',letterSpacing:2,
            color:hasVal?color:'rgba(255,255,255,.2)',transition:'color .2s',lineHeight:1}}>
            {display}
          </div>
          {hasVal&&(
            <div style={{fontFamily:'var(--font-label)',fontSize:'10px',
              color:'rgba(255,255,255,.25)',marginTop:4,letterSpacing:1}}>
              {action.targetRegister||'puntos'}
            </div>
          )}
        </div>

        {/* KEYPAD */}
        <div style={{padding:'0 16px',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:8}}>
          {['7','8','9','4','5','6','1','2','3'].map(d=>(
            <button key={d} onClick={()=>digit(d)}
              style={{padding:'16px 0',borderRadius:13,border:'none',cursor:'pointer',
                fontFamily:'var(--font-display)',fontSize:'1.3rem',fontWeight:700,
                background:'rgba(255,255,255,.07)',color:'#fff',
                transition:'background .1s',letterSpacing:.5}}>
              {d}
            </button>
          ))}
        </div>
        <div style={{padding:'0 16px 14px',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
          {allowNeg
            ? <button onClick={()=>digit('-')}
                style={{padding:'14px 0',borderRadius:13,border:'1px solid rgba(255,59,92,.2)',
                  cursor:'pointer',fontFamily:'var(--font-display)',fontSize:'1.1rem',fontWeight:700,
                  background:'rgba(255,59,92,.08)',color:'var(--red)',transition:'background .1s'}}>
                ±
              </button>
            : <div/>
          }
          <button onClick={()=>digit('0')}
            style={{padding:'14px 0',borderRadius:13,border:'none',cursor:'pointer',
              fontFamily:'var(--font-display)',fontSize:'1.3rem',fontWeight:700,
              background:'rgba(255,255,255,.07)',color:'#fff',transition:'background .1s'}}>
            0
          </button>
          <button onClick={del}
            style={{padding:'14px 0',borderRadius:13,border:'none',cursor:'pointer',
              fontFamily:'var(--font-display)',fontSize:'1.1rem',
              background:'rgba(255,255,255,.07)',color:'rgba(255,212,71,.8)',transition:'background .1s'}}>
            ⌫
          </button>
        </div>

        {/* CONFIRM */}
        <div style={{padding:'0 16px 20px'}}>
          <button onClick={confirm} disabled={!hasVal}
            style={{width:'100%',padding:'16px',borderRadius:14,border:'none',
              cursor:hasVal?'pointer':'not-allowed',
              fontFamily:'var(--font-display)',fontSize:'1rem',fontWeight:700,letterSpacing:2,
              background:hasVal?color:'rgba(255,255,255,.06)',
              color:hasVal?'#07070F':'rgba(255,255,255,.2)',
              boxShadow:hasVal?`0 4px 24px ${color}44`:'none',
              transition:'all .2s'}}>
            {hasVal?(numVal>0?`+${numVal}`:numVal)+' — CONFIRMAR':'INGRESA UN VALOR'}
          </button>
        </div>
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


// ── TURNO ACTIVO — asistente simplificado ──────────────────────
// Modelo: contexto de fase (informativo) + botones de acción + un botón de terminar turno
// Sin stepper, sin bloqueos por defecto. Máxima agilidad.
function TurnAssistant({ spec, room, currentPlayer, isHost, isMyTurn, onEndTurn, onAction, db, session }){
  const [elapsed, setElapsed] = React.useState(0);
  const [confirmed, setConfirmed] = React.useState({});
  const turnStart = room.turnStartedAt || Date.now();

  React.useEffect(()=>{
    const t = setInterval(()=>setElapsed(Math.floor((Date.now()-turnStart)/1000)),500);
    return ()=>clearInterval(t);
  },[turnStart]);

  const phases      = spec._phases || [];
  const checklist   = spec._checklist || [];
  const hasTurnPhases = phases.some(p=>p.scope==='turn');
  if(!hasTurnPhases && !spec.trackTurnDuration) return null;

  const isActive    = isMyTurn || isHost;
  const curPhase    = room.turnPhase || phases.find(p=>p.scope==='turn')?.id;
  const curPhaseObj = phases.find(p=>p.id===curPhase);
  const roomChecks  = room.checklist || {};

  // Recordatorios de la fase activa — solo informativos en modo ágil
  const phaseChecks = checklist.filter(c=>
    !c.phaseId || c.phaseId===curPhase ||
    (c.autoReset==='turn' && c.phaseId==='draw_card')
  ).slice(0,3); // máximo 3 recordatorios visibles

  function fmtS(s){ return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; }

  async function toggleCheck(id){
    const cur = confirmed[id] ?? roomChecks[id];
    const was = typeof cur==='object'?cur?.done:!!cur;
    setConfirmed(p=>({...p,[id]:!was}));
    if(db&&session) db.set(`rooms/${session.code}/checklist/${id}`,
      typeof roomChecks[id]==='object'?{...roomChecks[id],done:!was}:!was).catch(()=>{});
  }

  return(
    <div style={{borderRadius:14,overflow:'hidden',marginBottom:12,
      border:'1px solid rgba(0,245,255,.2)',background:'rgba(0,245,255,.03)'}}>

      {/* Header: jugador + fase actual (informativo) + reloj */}
      <div style={{padding:'10px 14px',display:'flex',alignItems:'center',gap:10}}>
        <div style={{flex:1}}>
          <div style={{fontFamily:'var(--font-label)',fontWeight:700,fontSize:'13px',
            color:'#fff',display:'flex',alignItems:'center',gap:6}}>
            {currentPlayer?.emoji} {currentPlayer?.name}
            {isMyTurn&&<span style={{fontFamily:'var(--font-ui)',fontSize:'7px',color:'var(--cyan)',
              letterSpacing:2,background:'rgba(0,245,255,.1)',padding:'1px 5px',borderRadius:3}}>TU TURNO</span>}
          </div>
          {curPhaseObj&&(
            <div style={{fontFamily:'var(--font-label)',fontSize:'10px',
              color:'rgba(255,255,255,.35)',marginTop:2}}>
              {curPhaseObj.description||curPhaseObj.label||''}
            </div>
          )}
        </div>
        {/* Reloj sincronizado */}
        <div style={{textAlign:'center',background:'rgba(0,0,0,.3)',borderRadius:10,
          padding:'5px 12px',border:`1px solid ${elapsed>120?'rgba(255,59,92,.3)':elapsed>60?'rgba(255,107,53,.3)':'rgba(255,255,255,.1)'}`}}>
          <div style={{fontFamily:'var(--font-display)',fontSize:'1.2rem',letterSpacing:1,lineHeight:1,
            color:elapsed>120?'var(--red)':elapsed>60?'var(--orange)':'var(--cyan)'}}>
            {fmtS(elapsed)}
          </div>
          <div style={{fontFamily:'var(--font-ui)',fontSize:'6px',letterSpacing:1,
            color:'rgba(255,255,255,.2)',marginTop:2}}>TURNO</div>
        </div>
      </div>

      {/* Recordatorios informativos — aparecen pero NO bloquean */}
      {phaseChecks.length>0&&(
        <div style={{padding:'0 12px 8px',display:'flex',flexDirection:'column',gap:3}}>
          {phaseChecks.map(c=>{
            const v    = confirmed[c.id] ?? roomChecks[c.id];
            const done = typeof v==='object'?v?.done:!!v;
            return(
              <button key={c.id} onClick={()=>isActive&&toggleCheck(c.id)}
                style={{display:'flex',alignItems:'center',gap:8,padding:'6px 10px',
                  borderRadius:8,cursor:isActive?'pointer':'default',textAlign:'left',
                  border:`1px solid ${done?'rgba(0,255,157,.2)':'rgba(255,212,71,.15)'}`,
                  background:done?'rgba(0,255,157,.05)':'rgba(255,212,71,.04)',
                  transition:'all .15s'}}>
                <div style={{fontSize:'.9rem',flexShrink:0}}>
                  {done ? '✅' : '💡'}
                </div>
                <div style={{flex:1,fontFamily:'var(--font-label)',fontSize:'11px',
                  color:done?'rgba(255,255,255,.3)':'rgba(255,212,71,.8)',fontWeight:600,
                  textDecoration:done?'line-through':'none'}}>
                  {c.label}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Botones de acción configurados */}
      {isActive&&(
        <div style={{padding:'0 12px 10px',display:'flex',flexDirection:'column',gap:6}}>
          {(spec.agileTurnButtons||[]).map((btn,i)=>{
            const bC={add_win:'rgba(255,212,71,.15)',add_points:'rgba(0,245,255,.12)',end_game_loss:'rgba(255,59,92,.1)'};
            const bT={add_win:'var(--gold)',add_points:'var(--cyan)',end_game_loss:'var(--red)'};
            return(
              <button key={i} onClick={()=>{
                snd(btn.effect==='end_game_loss'?'elim':'score');
                if(btn.effect==='add_win') onAction&&onAction({id:'add_win',icon:btn.icon||'🎯',label:btn.label,color:'var(--gold)',type:'direct',category:'score'},currentPlayer?.id,{value:1});
                else if(btn.effect==='add_points') onAction&&onAction({id:'add_points',icon:btn.icon||'➕',label:btn.label,color:'var(--cyan)',type:'direct',category:'score'},currentPlayer?.id,{value:1});
                else onAction&&onAction({id:btn.effect||'log_event',icon:btn.icon||'📝',label:btn.label,color:'rgba(255,255,255,.3)',type:'direct',category:'system'},currentPlayer?.id,{note:btn.label});
              }}
                style={{padding:'11px',borderRadius:10,border:'none',cursor:'pointer',
                  fontFamily:'var(--font-display)',fontSize:'.9rem',fontWeight:700,letterSpacing:1,
                  background:bC[btn.effect]||'rgba(155,93,229,.12)',color:bT[btn.effect]||'var(--purple)'}}>
                {btn.icon||'🎯'} {btn.label}
              </button>
            );
          })}

          {/* Fallback wins button */}
          {!(spec.agileTurnButtons?.length)&&spec.registers?.includes('wins')&&(
            <button onClick={()=>{snd('score');onAction&&onAction({id:'add_win',icon:'🎯',label:'Victoria',color:'var(--gold)',type:'direct',category:'score'},currentPlayer?.id,{value:1});}}
              style={{padding:'11px',borderRadius:10,border:'none',cursor:'pointer',
                fontFamily:'var(--font-display)',fontSize:'.9rem',fontWeight:700,letterSpacing:1,
                background:'rgba(255,212,71,.15)',color:'var(--gold)'}}>
              🎯 RESOLVÍ UNA MISIÓN
            </button>
          )}

          {/* Sin opciones */}
          {(spec.showNoOptionsButton||spec._rawConfig?.showNoOptionsButton)&&(
            <button onClick={()=>{snd('elim');onAction&&onAction({id:'no_options',icon:'🚫',label:'Sin opciones',color:'rgba(255,255,255,.3)',type:'direct',category:'system'},currentPlayer?.id,{note:'sin_opciones'});}}
              style={{padding:'9px',borderRadius:10,border:'1px solid rgba(255,255,255,.1)',cursor:'pointer',
                fontFamily:'var(--font-display)',fontSize:'.8rem',letterSpacing:1,
                background:'rgba(255,255,255,.03)',color:'rgba(255,255,255,.35)'}}>
              🚫 Me quedé sin opciones
            </button>
          )}

          {/* TERMINAR TURNO — siempre el último */}
          <button onClick={()=>onEndTurn(elapsed)}
            style={{padding:'14px',borderRadius:12,border:'none',cursor:'pointer',
              fontFamily:'var(--font-display)',fontSize:'1rem',fontWeight:700,letterSpacing:2,
              background:'linear-gradient(135deg,rgba(0,255,157,.18),rgba(0,245,255,.12))',
              color:'var(--green)',boxShadow:'0 4px 16px rgba(0,255,157,.12)'}}>
            ✓ TERMINÉ MI TURNO · {fmtS(elapsed)}
          </button>
        </div>
      )}
    </div>
  );
}

// ── PLAYER ACTION CARD v4 — diseño premium ──────────────────────
function PlayerActionCard({ player, spec, actions, captureActions, resultActions,
  statusIndicators, isHost, myId, onAction, currentRound, presence }){
  const [modal,    setModal]    = useState(null);
  const [expanded, setExpanded] = useState(false);
  const isMe   = player.id === myId;
  const canAct = isHost || isMe;
  const isTurn = player._isTurn;

  const primary   = actions.filter(a=>!a.secondary&&!player.eliminated&&_canSee(a,isHost,isMe));
  const secondary = actions.filter(a=> a.secondary&&!player.eliminated&&_canSee(a,isHost,isMe));
  const captures  = (captureActions||[]).filter(a=>!player.eliminated&&isHost);
  const results   = (resultActions||[]).filter(a=>!player.eliminated);
  const indicators= (statusIndicators||[]);
  const display   = getScoreDisplay(player, spec);

  function fire(action, payload){ setModal(null); onAction(action, player.id, payload||{}); }
  function clickAction(action){
    snd('tap');
    if(action.type==='numeric_modal') setModal({action,type:'calc'});
    else if(action.type==='option_selector') setModal({action,type:'option'});
    else if(action.type==='confirm_action') setModal({action,type:'confirm'});
    else fire(action,{});
  }

  // ── Eliminado — fila compacta ─────────────────────────────────
  if(player.eliminated) return(
    <div style={{display:'flex',alignItems:'center',gap:10,padding:'7px 12px',
      borderRadius:11,background:'rgba(255,59,92,.03)',border:'1px solid rgba(255,59,92,.08)',
      marginBottom:6,opacity:.4}}>
      <div style={{fontFamily:'var(--font-display)',fontSize:'.75rem',color:'var(--red)',
        width:18,textAlign:'center',flexShrink:0}}>#{player.finalPosition||'?'}</div>
      <div style={{fontSize:'1.1rem',flexShrink:0}}>{player.emoji}</div>
      <div style={{flex:1,fontFamily:'var(--font-label)',fontSize:'12px',fontWeight:700,
        color:'rgba(255,255,255,.3)'}}>{player.name} 💀</div>
      {display.main!==null&&<div style={{fontFamily:'var(--font-display)',fontSize:'.8rem',
        color:'rgba(255,255,255,.2)'}}>{display.main}<span style={{fontSize:'.55rem',marginLeft:2,opacity:.5}}>{display.unit}</span></div>}
    </div>
  );

  // ── Color del borde según estado ─────────────────────────────
  const borderColor = isTurn ? 'rgba(0,245,255,.3)'
    : isMe ? 'rgba(155,93,229,.2)'
    : 'rgba(255,255,255,.06)';
  const bgColor = isTurn ? 'rgba(0,245,255,.04)'
    : isMe ? 'rgba(155,93,229,.03)'
    : 'rgba(255,255,255,.02)';

  return(
    <div style={{marginBottom:8,borderRadius:16,background:bgColor,
      border:`1.5px solid ${borderColor}`,transition:'all .2s',overflow:'hidden'}}>

      {/* Modals */}
      {modal?.type==='calc'   && <GameCalc action={modal.action} player={player} onConfirm={p=>fire(modal.action,p)} onCancel={()=>setModal(null)}/>}
      {modal?.type==='option' && <OptionSelectorModal action={modal.action} player={player} onConfirm={p=>fire(modal.action,p)} onCancel={()=>setModal(null)}/>}
      {modal?.type==='confirm'&& <ConfirmModal_R action={modal.action} player={player} spec={spec} onConfirm={p=>fire(modal.action,p)} onCancel={()=>setModal(null)}/>}

      {/* ── FILA PRINCIPAL ──────────────────────────────────── */}
      <div style={{display:'flex',alignItems:'center',gap:10,padding:'11px 13px'}}>

        {/* Avatar */}
        <div style={{position:'relative',flexShrink:0}}>
          <div style={{width:42,height:42,borderRadius:12,display:'flex',alignItems:'center',
            justifyContent:'center',fontSize:'1.5rem',
            background: isTurn?'rgba(0,245,255,.1)':isMe?'rgba(155,93,229,.1)':'rgba(255,255,255,.05)',
            border:`1.5px solid ${isTurn?'rgba(0,245,255,.25)':isMe?'rgba(155,93,229,.2)':'rgba(255,255,255,.08)'}`,
            transition:'all .2s'}}>
            {player.emoji}
          </div>
          {/* Presencia online */}
          {presence?.[player.id]&&(
            <div style={{position:'absolute',bottom:-1,right:-1,width:8,height:8,
              borderRadius:'50%',background:'var(--green)',border:'2px solid var(--bg)'}}/>
          )}
          {/* Token primer jugador */}
          {player.hasFirstPlayerToken&&(
            <div style={{position:'absolute',top:-4,right:-4,fontSize:'.7rem',
              lineHeight:1,filter:'drop-shadow(0 0 4px rgba(255,212,71,.6))'}}>👑</div>
          )}
        </div>

        {/* Info */}
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:2}}>
            <div style={{fontFamily:'var(--font-label)',fontSize:'13px',fontWeight:700,
              color:'#fff',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              {player.name}
            </div>
            {player.id===myId&&<div style={{fontFamily:'var(--font-ui)',fontSize:'6px',
              letterSpacing:2,color:'var(--cyan)',background:'rgba(0,245,255,.1)',
              padding:'1px 4px',borderRadius:3,flexShrink:0}}>TÚ</div>}
            {isTurn&&<div style={{fontFamily:'var(--font-ui)',fontSize:'6px',
              letterSpacing:1.5,color:'var(--orange)',background:'rgba(255,107,53,.12)',
              padding:'1px 5px',borderRadius:3,flexShrink:0}}>TURNO</div>}
          </div>
          {/* Status indicators */}
          {indicators.filter(i=>player['status_'+i.id]).length>0&&(
            <div style={{display:'flex',gap:3,flexWrap:'wrap'}}>
              {indicators.filter(i=>player['status_'+i.id]).map(i=>(
                <span key={i.id} style={{fontFamily:'var(--font-label)',fontSize:'8px',fontWeight:700,
                  padding:'1px 5px',borderRadius:3,
                  background:`rgba(${i.color||'0,245,255'},.12)`,
                  color:i.color||'var(--cyan)'}}>
                  {i.icon} {i.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Score */}
        {display.main!==null&&(
          <div style={{textAlign:'right',flexShrink:0,minWidth:36}}>
            <div style={{fontFamily:'var(--font-display)',fontSize:'1.6rem',
              color:display.color,lineHeight:1,letterSpacing:-1}}>
              {display.main}
            </div>
            <div style={{fontFamily:'var(--font-ui)',fontSize:'7px',letterSpacing:1,
              color:'rgba(255,255,255,.2)',marginTop:1}}>
              {display.unit}
            </div>
          </div>
        )}

        {/* Expand — solo si hay acciones secundarias o capturas */}
        {canAct&&(secondary.length>0||captures.length>0||results.length>0)&&(
          <button onClick={()=>setExpanded(e=>!e)}
            style={{width:26,height:26,background:'rgba(255,255,255,.05)',
              border:'1px solid rgba(255,255,255,.08)',borderRadius:6,
              cursor:'pointer',color:'rgba(255,255,255,.25)',fontSize:'9px',flexShrink:0,
              display:'flex',alignItems:'center',justifyContent:'center'}}>
            {expanded?'▲':'▼'}
          </button>
        )}
      </div>

      {/* ── ACCIONES PRIMARIAS ──────────────────────────────── */}
      {canAct&&primary.length>0&&(
        <div style={{padding:'0 10px 10px',display:'flex',gap:5,flexWrap:'wrap'}}>
          {primary.map(a=>(
            <button key={a.id} onClick={()=>clickAction(a)}
              style={{flex:1,minWidth:90,padding:'10px 6px',borderRadius:10,cursor:'pointer',
                border:`1px solid ${a.color}30`,
                background:`linear-gradient(135deg,${a.color}15,rgba(0,0,0,.1))`,
                color:a.dangerous?'var(--red)':a.color||'#fff',
                fontFamily:'var(--font-display)',fontSize:'12px',fontWeight:700,letterSpacing:.5,
                boxShadow:`0 2px 10px ${a.color}18`,transition:'transform .1s,box-shadow .1s'}}>
              <span style={{marginRight:5}}>{a.icon}</span>{a.label}
            </button>
          ))}
        </div>
      )}

      {/* ── ACCIONES EXPANDIDAS ─────────────────────────────── */}
      {canAct&&expanded&&(
        <div style={{borderTop:'1px solid rgba(255,255,255,.05)',padding:'8px 10px 10px'}}>
          {(results.length>0||captures.length>0)&&(
            <>
              <div style={{fontFamily:'var(--font-ui)',fontSize:'7px',letterSpacing:2,
                color:'rgba(255,255,255,.18)',marginBottom:5}}>ACCIONES</div>
              <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:6}}>
                {results.map(r=>(
                  <button key={r.id} onClick={()=>{snd('tap');onAction({id:r.id,label:r.label,
                    icon:r.icon,color:r.color,type:'direct',category:'result'},player.id,{effect:r.effect});}}
                    style={{padding:'6px 10px',borderRadius:8,cursor:'pointer',
                      border:`1px solid ${r.color||'#FFD447'}25`,background:'rgba(255,255,255,.03)',
                      fontFamily:'var(--font-label)',fontSize:'11px',fontWeight:700,
                      color:r.color||'var(--gold)'}}>
                    {r.icon} {r.label}
                  </button>
                ))}
                {captures.map(c=>(
                  <button key={c.id} onClick={()=>{
                    setModal({action:{id:c.id,label:c.label,icon:c.icon||'📝',
                      color:c.color||'#FFD447',type:'numeric_modal',category:'capture',
                      allowNegative:false,quickValues:c.quickValues||[]},type:'calc'});
                  }} style={{padding:'6px 10px',borderRadius:8,cursor:'pointer',
                    border:`1px solid rgba(255,212,71,.2)`,background:'rgba(255,255,255,.03)',
                    fontFamily:'var(--font-label)',fontSize:'11px',fontWeight:700,
                    color:'var(--gold)'}}>
                    🧮 {c.label}
                  </button>
                ))}
              </div>
            </>
          )}
          {secondary.length>0&&(
            <>
              <div style={{fontFamily:'var(--font-ui)',fontSize:'7px',letterSpacing:2,
                color:'rgba(255,255,255,.18)',marginBottom:5}}>MÁS</div>
              <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                {secondary.map(a=>(
                  <button key={a.id} onClick={()=>clickAction(a)}
                    style={{padding:'6px 10px',borderRadius:8,cursor:'pointer',
                      border:'1px solid rgba(255,255,255,.08)',background:'rgba(255,255,255,.03)',
                      fontFamily:'var(--font-label)',fontSize:'11px',fontWeight:700,
                      color:'rgba(255,255,255,.5)'}}>
                    {a.icon} {a.label}
                  </button>
                ))}
              </div>
            </>
          )}
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

  useEffect(()=>{
    snd('victory');
    // Guardar historial de partida al terminar
    if(room && typeof saveSession === 'function'){
      try{
        saveSession({
          id: room.code,
          gameType: room.gameType,
          customTitle: room.customTitle,
          emoji: room.config?.emoji || '🎮',
          playerCount: (room.players||[]).length,
          winner: room.winner || null,
          players: (room.players||[]).map(p=>({
            id:p.id, name:p.name, emoji:p.emoji,
            points:p.points||0, wins:p.wins||0, eliminated:p.eliminated||false,
            turnHistory:p.turnHistory||[]
          })),
          startedAt: room.startedAt,
          endedAt:   room.endedAt || Date.now(),
          createdAt: room.createdAt,
        });
      }catch(e){}
    }
  },[]);

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
