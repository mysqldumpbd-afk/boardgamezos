// ═══════════════════════════════════════════════════════════════
// builder.jsx — BOARDGAMEZ OS v1.2
// Game Engine Builder: Auth + 5 secciones MVP
// Guarda templates en Firebase por usuario autenticado
// ═══════════════════════════════════════════════════════════════

// ── AUTH SCREEN ──────────────────────────────────────────────────
if(window._splashStep) window._splashStep(7);
function AuthScreen({ onAuth, onSkip }){
  const [mode, setMode] = React.useState('choose'); // choose | email-in | email-up
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  async function handleGoogle(){
    setLoading(true); setError('');
    try{
      const r = await authSignInGoogle();
      onAuth(r.user);
    } catch(e){
      setError('Error con Google: ' + (e.message||'intenta de nuevo'));
      setLoading(false);
    }
  }

  async function handleEmail(isSignUp){
    if(!email.trim() || !password.trim()){ setError('Completa email y contraseña'); return; }
    if(password.length < 6){ setError('La contraseña debe tener al menos 6 caracteres'); return; }
    setLoading(true); setError('');
    try{
      const r = isSignUp
        ? await authSignUpEmail(email.trim(), password)
        : await authSignInEmail(email.trim(), password);
      onAuth(r.user);
    } catch(e){
      const msg = e.code === 'auth/user-not-found' ? 'Usuario no encontrado'
        : e.code === 'auth/wrong-password' ? 'Contraseña incorrecta'
        : e.code === 'auth/email-already-in-use' ? 'Este email ya está registrado'
        : e.code === 'auth/invalid-email' ? 'Email inválido'
        : (e.message || 'Error de autenticación');
      setError(msg);
      setLoading(false);
    }
  }

  return (
    <div className="os-wrap">
      <div className="os-header">
        <div>
          <div className="os-logo">BOARD<span>GAMEZ</span></div>
          <div className="os-logo-sub">OS · GAME BUILDER</div>
        </div>
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onSkip}>
          Después →
        </button>
      </div>

      <div className="os-page" style={{paddingTop:16}}>
        {/* Hero */}
        <div style={{
          textAlign:'center',
          background:'linear-gradient(135deg,rgba(155,93,229,.08),rgba(0,245,255,.04))',
          border:'1px solid rgba(155,93,229,.25)',
          borderRadius:18,padding:'24px 20px',marginBottom:24
        }}>
          <div style={{fontSize:'3rem',marginBottom:10}}>🎮</div>
          <div style={{fontFamily:'var(--font-display)',fontSize:'1.5rem',letterSpacing:2,
            background:'linear-gradient(135deg,var(--purple),var(--cyan))',
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:6}}>
            GAME BUILDER
          </div>
          <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-sm)',fontWeight:600,
            color:'rgba(255,255,255,.45)',letterSpacing:1,lineHeight:1.5}}>
            Crea y guarda la configuración de tus juegos.<br/>
            La próxima vez solo la cargas y juegas.
          </div>
        </div>

        {mode==='choose' && (
          <div className="anim-fade">
            <div className="os-section">INICIAR SESIÓN</div>

            <button className="btn" style={{
              background:'#fff',color:'#333',marginBottom:12,
              border:'none',fontFamily:'var(--font-body)',fontWeight:700,
              fontSize:'var(--fs-sm)'
            }} onClick={handleGoogle} disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google
            </button>

            <div style={{display:'flex',alignItems:'center',gap:10,margin:'16px 0'}}>
              <div style={{flex:1,height:1,background:'rgba(255,255,255,.1)'}}/>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.3)',letterSpacing:2}}>O CON EMAIL</div>
              <div style={{flex:1,height:1,background:'rgba(255,255,255,.1)'}}/>
            </div>

            <button className="btn btn-ghost" onClick={()=>setMode('email-in')}>
              📧 Iniciar sesión con email
            </button>
            <button className="btn btn-ghost" onClick={()=>setMode('email-up')}>
              ✨ Crear cuenta nueva
            </button>

            {error && <div className="os-alert alert-red" style={{marginTop:12}}>{error}</div>}
          </div>
        )}

        {(mode==='email-in'||mode==='email-up') && (
          <div className="anim-fade">
            <div className="os-section">
              {mode==='email-up' ? 'CREAR CUENTA' : 'INICIAR SESIÓN'}
            </div>
            <input className="os-input" type="email" placeholder="tu@email.com"
              value={email} onChange={e=>setEmail(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&handleEmail(mode==='email-up')}/>
            <input className="os-input" type="password"
              placeholder={mode==='email-up'?'Contraseña (mín. 6 caracteres)':'Contraseña'}
              value={password} onChange={e=>setPassword(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&handleEmail(mode==='email-up')}/>

            {error && <div className="os-alert alert-red">{error}</div>}

            <button className="btn btn-cyan" disabled={loading}
              onClick={()=>handleEmail(mode==='email-up')}>
              {loading ? '⏳ ...' : mode==='email-up' ? '✨ Crear cuenta' : '🔑 Iniciar sesión'}
            </button>
            <button className="btn btn-ghost" onClick={()=>{setMode('choose');setError('');}}>
              ← Atrás
            </button>

            {mode==='email-in' && (
              <div style={{textAlign:'center',marginTop:8}}>
                <span style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.3)'}}>
                  ¿No tienes cuenta?{' '}
                </span>
                <button style={{background:'none',border:'none',color:'var(--cyan)',cursor:'pointer',fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',fontWeight:700}}
                  onClick={()=>setMode('email-up')}>
                  Crear una
                </button>
              </div>
            )}
          </div>
        )}

        <div className="g16"/>
        <div style={{
          background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',
          borderRadius:12,padding:'12px 14px',
          fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',
          color:'rgba(255,255,255,.3)',letterSpacing:1,lineHeight:1.6
        }}>
          🔒 Tu cuenta solo se usa para guardar tus juegos en la nube.
          Puedes jugar sin cuenta — solo no podrás guardar configuraciones.
        </div>
      </div>
    </div>
  );
}

// ── MY GAMES SCREEN ──────────────────────────────────────────────
function MyGamesScreen({ user, onBack, onBuildNew, onEditTemplate, onPlayTemplate, onSignOut }){
  const [templates, setTemplates] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [deleting, setDeleting] = React.useState(null);

  React.useEffect(()=>{
    if(!user) return;
    // Sembrar templates preset si es primera vez
    seedPresetTemplates(user.uid).catch(()=>{});
    loadGameTemplates(user.uid).then(t=>{ setTemplates(t); setLoading(false); });
  },[user?.uid]);

  async function handleDelete(t){
    if(!window.confirm(`¿Borrar "${t.name}"?`)) return;
    snd('delete');
    setDeleting(t.id);
    await deleteGameTemplate(user.uid, t.id);
    setTemplates(prev=>prev.filter(x=>x.id!==t.id));
    setDeleting(null);
  }

  // Colores por modo de victoria
  const modeColor = m => m==='points'?'var(--gold)':m==='wins'?'var(--cyan)':m==='elimination'?'var(--red)':'var(--purple)';
  const modeLabel = m => m==='points'?'Puntos':m==='wins'?'Victorias':m==='elimination'?'Eliminación':'Manual';

  return (
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onBack}>← Home</button>
        <div className="os-logo" style={{fontSize:'1.1rem'}}>MIS <span>JUEGOS</span></div>
        {user && (
          <button className="btn btn-ghost btn-sm" style={{width:'auto',fontSize:'var(--fs-micro)'}}
            onClick={onSignOut}>
            {user.photoURL
              ? <img src={user.photoURL} style={{width:22,height:22,borderRadius:'50%'}} alt=""/>
              : '👤'
            }
          </button>
        )}
      </div>

      <div className="os-page" style={{paddingTop:16}}>
        {/* Usuario */}
        <div style={{
          display:'flex',alignItems:'center',gap:10,
          background:'rgba(155,93,229,.06)',border:'1px solid rgba(155,93,229,.2)',
          borderRadius:12,padding:'10px 14px',marginBottom:16
        }}>
          <div style={{fontSize:'1.4rem'}}>{user?.photoURL?<img src={user.photoURL} style={{width:28,height:28,borderRadius:'50%'}} alt=""/>:'👤'}</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:'var(--font-body)',fontWeight:700,fontSize:'var(--fs-sm)',color:'var(--purple)'}}>
              {user?.displayName || user?.email || 'Usuario'}
            </div>
            <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)',letterSpacing:1,marginTop:1}}>
              {templates.length} juego{templates.length!==1?'s':''} guardado{templates.length!==1?'s':''}
            </div>
          </div>
        </div>

        {/* Botón crear nuevo */}
        <button className="btn btn-purple" style={{marginBottom:20}} onClick={()=>{snd('tap');onBuildNew();}}>
          + Crear nuevo juego
        </button>

        {loading && (
          <div style={{textAlign:'center',padding:'40px 0'}}>
            <div className="os-spin" style={{marginBottom:12}}/>
            <div style={{fontFamily:'var(--font-label)',color:'rgba(255,255,255,.35)',letterSpacing:2}}>CARGANDO...</div>
          </div>
        )}

        {!loading && templates.length===0 && (
          <div className="os-empty">
            <div style={{fontSize:'3rem',marginBottom:12}}>🎮</div>
            <div style={{fontFamily:'var(--font-display)',fontSize:'1rem',letterSpacing:1,marginBottom:6}}>Sin juegos aún</div>
            <div style={{fontSize:'var(--fs-sm)'}}>Crea tu primer juego con el builder y aparecerá aquí</div>
          </div>
        )}

        {!loading && templates.map((t,i)=>(
          <div key={t.id} className="anim-fade" style={{
            background:'var(--surface)',
            border:`1px solid ${modeColor(t.config?.victoryMode)}44`,
            borderRadius:16,padding:'14px 15px',marginBottom:10,
            animationDelay: i*.05+'s'
          }}>
            {/* Header */}
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
              <div style={{
                fontSize:'2rem',width:50,height:50,
                borderRadius:13,display:'flex',alignItems:'center',justifyContent:'center',
                background:`${modeColor(t.config?.victoryMode)}18`,
                border:`1px solid ${modeColor(t.config?.victoryMode)}33`,
                flexShrink:0
              }}>{t.emoji||'🎮'}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:'var(--font-display)',fontSize:'1.1rem',letterSpacing:1,color:'#fff'}}>
                  {t.name}
                </div>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',fontWeight:600,
                  color:'rgba(255,255,255,.4)',letterSpacing:1,marginTop:2}}>
                  {t.description||describeTemplate(t)}
                </div>
              </div>
            </div>

            {/* Tags de config */}
            <div className="os-tags" style={{marginBottom:12}}>
              <div className="os-tag" style={{
                background:`${modeColor(t.config?.victoryMode)}18`,
                borderColor:`${modeColor(t.config?.victoryMode)}44`,
                color:modeColor(t.config?.victoryMode)
              }}>
                {t.config?.victoryMode==='points'?'🏅':t.config?.victoryMode==='wins'?'🏆':t.config?.victoryMode==='elimination'?'💀':'🎯'}
                {' '}{modeLabel(t.config?.victoryMode||'points')}
              </div>
              {t.config?.useRounds && (
                <div className="os-tag">
                  {t.config?.rounds==='libre'?'∞ Libre':`${t.config?.rounds} rondas`}
                </div>
              )}
              {t.config?.useTurns && <div className="os-tag purple">↕️ Turnos</div>}
              {t.config?.useFirstPlayerToken && <div className="os-tag gold">👑 Token</div>}
              {t.config?.useTimer && <div className="os-tag orange">⏱ Timer</div>}
              {t.config?.type && (
                <div className="os-tag">{t.config.type==='teams'?'👥 Equipos':'👤 Individual'}</div>
              )}
              {t.config?.tools?.length>0 && (
                <div className="os-tag purple">🎲 {t.config.tools.length} herr.</div>
              )}
              <div className="os-tag" style={{fontSize:'.6rem',color:'rgba(255,255,255,.25)'}}>
                {fmtShortDate(t.updatedAt||t.createdAt)}
              </div>
            </div>

            {/* Acciones */}
            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-cyan btn-sm" style={{flex:1,marginBottom:0}}
                onClick={()=>{snd('tap');onPlayTemplate(t);}}>
                ▶ Jugar
              </button>
              <button className="btn btn-ghost btn-sm" style={{flex:.6,marginBottom:0}}
                onClick={()=>{snd('tap');onEditTemplate(t);}}>
                ✏️ Editar
              </button>
              <button className="btn btn-sm" style={{
                marginBottom:0,background:'rgba(255,59,92,.1)',border:'1px solid rgba(255,59,92,.25)',
                color:'var(--red)',borderRadius:9,padding:'9px 12px',cursor:'pointer',
                fontFamily:'var(--font-display)',fontSize:'var(--fs-xs)',opacity:deleting===t.id?.5:1
              }} onClick={()=>handleDelete(t)}>
                {deleting===t.id?'...':'🗑'}
              </button>
            </div>
          </div>
        ))}

        <div className="g16"/>
      </div>
    </div>
  );
}

// ── GAME BUILDER WIZARD ──────────────────────────────────────────
function GameBuilder({ user, editingTemplate, onBack, onSaved }){
  const TOTAL_STEPS = 9;
  const [step, setStep] = React.useState(1);
  const [openSection, setOpenSection] = React.useState(1); // for section-based mode
  const [sectionMode, setSectionMode] = React.useState(false); // false=wizard, true=sections
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  // Estado completo del template
  const [tmpl, setTmpl] = React.useState(()=>{
    if(editingTemplate) return { ...editingTemplate };
    return {
      id: null,
      name: '',
      emoji: '🎮',
      description: '',
      // Sec 1 — Identidad
      type: 'individual',          // individual | teams | cooperative
      roomAccess: 'code',          // public | private | code | link
      minPlayers: 2,
      maxPlayers: 8,
      // Sec 2 — Estructura (árbol completo)
      // ── Rondas
      useRounds: true,
      rounds: 3,                    // número | 'libre'
      roundClose: 'manual',         // manual | timer | all_done
      roundTimerSecs: 60,
      roundReset: 'nothing',        // nothing | round_points | turns | temp_tools
      // ── Turnos
      useTurns: false,
      turnOrder: 'fixed',           // fixed | random | rotating | by_score
      canSkipTurn: false,
      hasExtraTurns: false,
      turnLimitPerRound: false,
      turnLimitCount: 1,
      noTurnMode: 'simultaneous',   // simultaneous | mixed (si useTurns=false)
      // ── Token de primer jugador
      useFirstPlayerToken: false,
      // ── Temporizador
      useTimer: false,
      timerScope: 'turn',           // turn | round | total
      timerSecs: 60,
      timerVisualAlert: true,
      timerSoundAlert: true,
      timerExpireAction: 'nothing', // nothing | skip | assign_zero | penalty | auto
      // Sec 3 — Victoria
      victoryMode: 'points',
      // Puntos
      pointsWinMode: 'most',        // most | reach_x | exact_x
      pointsValidation: 'instant',  // instant | round_end
      useTarget: false,
      targetScore: 100,
      // Victorias
      winsMode: 'most',             // most | target | last_decisive
      winsTarget: 3,
      // Vidas
      livesWinMode: 'last_alive',   // last_alive | most_rounds | most_lives
      // Eliminación
      elimWinMode: 'last_player',   // last_player | last_team | eliminate_all
      // Objetivo
      objectiveWinMode: 'complete_mission', // complete_mission | get_resource | activate_cond | unique_event
      // Manual
      manualWinMode: 'host_end',    // host_end | host_winner
      winConditions: [],
      tiebreak: 'share',
      // Sec 4 — Derrota
      useDefeat: false,         // false = sin derrota explícita
      defeatType: 'points',     // points | wins | lives | elimination | time | objective | external
      defeatPoints: 'last',     // last | below_x | no_min | too_behind
      defeatPointsX: 0,
      defeatWins: 'fewer',      // fewer | cant_reach | lose_n
      defeatLoseN: 3,
      defeatLives: 'zero',      // zero | damage | instant_event
      defeatElim: 'last_round', // last_round | elim_rule | specific_round | manual
      defeatElimRound: 1,
      defeatTime: 'timeout',    // timeout | no_act | excess_penalty
      defeatObjective: 'no_mission', // no_mission | fail_key | fail_critical
      defeatExternal: 'dice',   // dice | wheel | coin | ai | host
      defeatMoment: 'round_end',// immediate | turn_end | round_end | phase | game_end
      defeatConsequence: 'eliminated', // eliminated | spectator | lose_turn | lose_points | temp_penalty | weakened | log_only
      // Sec 6 — Eliminación
      useElimination: false,           // ¿hay sistema de eliminación?
      elimStartsAt: 'round_1',         // round_1 | round_2 | round_3 | round_n
      elimStartRound: 1,               // N cuando elimStartsAt='round_n'
      elimMethod: 'last_place',        // last_place | lowest_score | zero_lives | special_condition | manual
      elimTieRule: 'nobody',           // nobody | all_tied | tool | host | ai
      elimAftermath: 'out',            // out | spectator | keep_score | partial
      // Sec 5 — Sistema de progreso / registro
      // ¿Qué se registra? (multi-select)
      registers: ['points'],         // ['points','wins','lives','resources','coins','objectives','custom']
      customCounterName: '',         // nombre del contador custom
      // Tipo de captura
      captureType: 'manual',         // manual | auto | tool | camera | ai | mixed
      // Naturaleza del valor
      valueNature: 'positive',       // positive | both | integers | decimals
      // Acumulación
      accumulation: 'global',        // global | per_round | reset_each_round | always_keep
      // Modificadores habilitados (multi-select)
      modifiers: [],                 // ['bonus','penalty','multiplier','steal','shield','block','double_next']
      // Quién captura (mantener compatibilidad)
      capturedBy: 'host',            // host | self | all
      // Visibilidad
      scoreVisibility: 'all',        // all | host | player | hidden_until_round_end
      // Legado (para compatibilidad con runtime actual)
      accumulates: 'points',
      scoreSign: 'positive',
      // Sec 7 — Herramientas integradas
      useTools: true,                  // ¿se habilitan herramientas en la app?
      tools: [],                       // cuáles están activas: ['coin','dice','wheel','rps','counter','ai']
      toolsMode: 'informal',           // informal | formal
      toolsRegistered: 'no',           // no | manual | auto | mixed
      toolsAffect: [],                 // ['score','turn','elimination','events','rules']
      // Dado
      diceType: 'd6',
      diceCustomSides: 6,
      // Moneda
      coinUse: 'free',                 // free | tiebreak | order | events
      // Ruleta
      wheelSegments: 'fixed',          // fixed | custom | weighted
      // PPS
      rpsScope: 'any',                 // any | active_only
      // Sec 8 — Roles y permisos
      roles: ['host','player'],        // roles activos: host | player | spectator | judge | recorder
      scoreCapture: 'host',            // host | self | all | judge
      toolsWho: 'all',                 // all | host | player | judge
      roundCloseWho: 'host',           // host | all | judge
      pauseWho: 'host',                // host | all
      errorWho: 'host',                // host | judge | all
      // Visibilidad por rol
      visHost: 'all',                  // all | partial | score_only
      visPlayer: 'partial',            // all | partial | own_only
      visSpectator: 'score',           // score | all | none
      // Sec 9 — Finalización
      endConditions: ['victory'],      // victory | rounds_done | time_up | last_elim | manual
      showEndScreen: true,
      saveHistory: true,
      exportFormat: [],                // json | csv | image | report
      rematchKeepPlayers: true,
      rematchKeepRoom: true,
      rematchKeepConfig: true,
      rematchResetScore: true,
      rematchResetAll: false,
    };
  });

  function upd(field, value){ setTmpl(prev=>({...prev, [field]:value})); }
  function toggleTool(tool){
    setTmpl(prev=>({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter(t=>t!==tool)
        : [...prev.tools, tool]
    }));
  }
  function toggleRegister(reg){
    setTmpl(prev=>({
      ...prev,
      registers: prev.registers.includes(reg)
        ? prev.registers.filter(r=>r!==reg)
        : [...prev.registers, reg]
    }));
  }
  function toggleModifier(mod){
    setTmpl(prev=>({
      ...prev,
      modifiers: prev.modifiers.includes(mod)
        ? prev.modifiers.filter(m=>m!==mod)
        : [...prev.modifiers, mod]
    }));
  }
  function toggleToolsAffect(effect){
    setTmpl(prev=>({
      ...prev,
      toolsAffect: prev.toolsAffect.includes(effect)
        ? prev.toolsAffect.filter(e=>e!==effect)
        : [...prev.toolsAffect, effect]
    }));
  }
  function toggleRole(role){
    setTmpl(prev=>({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r=>r!==role)
        : [...prev.roles, role]
    }));
  }
  function toggleEndCond(cond){
    setTmpl(prev=>({
      ...prev,
      endConditions: prev.endConditions.includes(cond)
        ? prev.endConditions.filter(c=>c!==cond)
        : [...prev.endConditions, cond]
    }));
  }
  function toggleExport(fmt){
    setTmpl(prev=>({
      ...prev,
      exportFormat: prev.exportFormat.includes(fmt)
        ? prev.exportFormat.filter(f=>f!==fmt)
        : [...prev.exportFormat, fmt]
    }));
  }
  function toggleArr(field, val){
    setTmpl(prev=>({
      ...prev,
      [field]: prev[field].includes(val)
        ? prev[field].filter(v=>v!==val)
        : [...prev[field], val]
    }));
  }

  const [saveError, setSaveError] = React.useState('');

  async function handleSave(){
    if(!tmpl.name.trim()){ alert('El juego necesita un nombre'); return; }
    setSaving(true);
    setSaveError('');
    snd('save');
    try {
    const saved = await saveGameTemplate(user.uid, {
      ...tmpl,
      config: {
        // Identidad
        type: tmpl.type,
        numTeams: tmpl.numTeams,
        roomAccess: tmpl.roomAccess,
        minPlayers: tmpl.minPlayers,
        maxPlayers: tmpl.maxPlayers,
        // Estructura — Rondas
        useRounds: tmpl.useRounds,
        rounds: tmpl.rounds,
        roundClose: tmpl.roundClose,
        roundTimerSecs: tmpl.roundTimerSecs,
        roundReset: tmpl.roundReset,
        // Estructura — Turnos
        useTurns: tmpl.useTurns,
        turnOrder: tmpl.turnOrder,
        canSkipTurn: tmpl.canSkipTurn,
        hasExtraTurns: tmpl.hasExtraTurns,
        turnLimitPerRound: tmpl.turnLimitPerRound,
        turnLimitCount: tmpl.turnLimitCount,
        noTurnMode: tmpl.noTurnMode,
        // Token primer jugador
        useFirstPlayerToken: tmpl.useFirstPlayerToken,
        // Temporizador
        useTimer: tmpl.useTimer,
        timerScope: tmpl.timerScope,
        timerSecs: tmpl.timerSecs,
        timerVisualAlert: tmpl.timerVisualAlert,
        timerSoundAlert: tmpl.timerSoundAlert,
        timerExpireAction: tmpl.timerExpireAction,
        // Victoria
        victoryMode: tmpl.victoryMode,
        pointsWinMode: tmpl.pointsWinMode,
        pointsValidation: tmpl.pointsValidation,
        useTarget: tmpl.useTarget,
        targetScore: tmpl.targetScore,
        winsMode: tmpl.winsMode,
        winsTarget: tmpl.winsTarget,
        livesWinMode: tmpl.livesWinMode,
        elimWinMode: tmpl.elimWinMode,
        objectiveWinMode: tmpl.objectiveWinMode,
        manualWinMode: tmpl.manualWinMode,
        winConditions: tmpl.winConditions,
        tiebreak: tmpl.tiebreak,
        // Derrota
        useDefeat: tmpl.useDefeat,
        defeatType: tmpl.defeatType,
        defeatPoints: tmpl.defeatPoints,
        defeatPointsX: tmpl.defeatPointsX,
        defeatWins: tmpl.defeatWins,
        defeatLoseN: tmpl.defeatLoseN,
        defeatLives: tmpl.defeatLives,
        defeatElim: tmpl.defeatElim,
        defeatElimRound: tmpl.defeatElimRound,
        defeatTime: tmpl.defeatTime,
        defeatObjective: tmpl.defeatObjective,
        defeatExternal: tmpl.defeatExternal,
        defeatMoment: tmpl.defeatMoment,
        defeatConsequence: tmpl.defeatConsequence,
        // Eliminación
        useElimination: tmpl.useElimination,
        elimStartsAt: tmpl.elimStartsAt,
        elimStartRound: tmpl.elimStartRound,
        elimMethod: tmpl.elimMethod,
        elimTieRule: tmpl.elimTieRule,
        elimAftermath: tmpl.elimAftermath,
        // Sistema de progreso / registro
        registers: tmpl.registers,
        customCounterName: tmpl.customCounterName,
        captureType: tmpl.captureType,
        valueNature: tmpl.valueNature,
        accumulation: tmpl.accumulation,
        modifiers: tmpl.modifiers,
        capturedBy: tmpl.capturedBy,
        scoreVisibility: tmpl.scoreVisibility,
        // Legado runtime
        accumulates: tmpl.registers.includes('points')?'points':tmpl.registers.includes('wins')?'wins':'lives',
        scoreSign: tmpl.valueNature==='positive'?'positive':'both',
        // Herramientas
        useTools: tmpl.useTools,
        tools: tmpl.tools,
        toolsMode: tmpl.toolsMode,
        toolsRegistered: tmpl.toolsRegistered,
        toolsAffect: tmpl.toolsAffect,
        diceType: tmpl.diceType,
        diceCustomSides: tmpl.diceCustomSides,
        coinUse: tmpl.coinUse,
        wheelSegments: tmpl.wheelSegments,
        rpsScope: tmpl.rpsScope,
        // Roles y permisos
        roles: tmpl.roles,
        scoreCapture: tmpl.scoreCapture,
        toolsWho: tmpl.toolsWho,
        roundCloseWho: tmpl.roundCloseWho,
        pauseWho: tmpl.pauseWho,
        errorWho: tmpl.errorWho,
        visHost: tmpl.visHost,
        visPlayer: tmpl.visPlayer,
        visSpectator: tmpl.visSpectator,
        // Finalización
        endConditions: tmpl.endConditions,
        showEndScreen: tmpl.showEndScreen,
        saveHistory: tmpl.saveHistory,
        exportFormat: tmpl.exportFormat,
        rematchKeepPlayers: tmpl.rematchKeepPlayers,
        rematchKeepRoom: tmpl.rematchKeepRoom,
        rematchKeepConfig: tmpl.rematchKeepConfig,
        rematchResetScore: tmpl.rematchResetScore,
        rematchResetAll: tmpl.rematchResetAll,
      }
    });
    setSaving(false);
    setSaved(true);
    setTimeout(()=>onSaved(saved), 1500);
    } catch(e) {
      console.error('Save error:', e);
      setSaving(false);
      setSaveError('Error al guardar: ' + (e.message || 'intenta de nuevo'));
    }
  }

  const stepTitles = ['IDENTIDAD','ESTRUCTURA','VICTORIA','DERROTA','PROGRESO','ELIMINACIÓN','HERRAMIENTAS','ROLES','FINALIZACIÓN'];
  const canNext = step===1 ? tmpl.name.trim().length>=2 : true;

  // ── Sección helpers ──
  function OptionRow({ label, sub, active, onClick, color='var(--cyan)' }){
    return(
      <div className="check-row" style={{borderColor:active?color+'88':undefined,background:active?color+'12':undefined}}
        onClick={onClick}>
        <div className="check-box" style={{borderColor:active?color:undefined,background:active?color:undefined,color:active?'var(--bg)':undefined}}>
          {active?'✓':''}
        </div>
        <div>
          <div className="check-label">{label}</div>
          {sub && <div className="check-sub">{sub}</div>}
        </div>
      </div>
    );
  }

  function SelectRow({ label, options, value, onChange }){
    return(
      <div style={{marginBottom:14}}>
        <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',fontWeight:700,
          color:'rgba(255,255,255,.4)',letterSpacing:2,marginBottom:8,textTransform:'uppercase'}}>
          {label}
        </div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {options.map(o=>(
            <button key={o.value} onClick={()=>{snd('tap');onChange(o.value);}}
              style={{
                background:value===o.value?'var(--cyan)':'rgba(255,255,255,.06)',
                border:`1px solid ${value===o.value?'var(--cyan)':'rgba(255,255,255,.12)'}`,
                color:value===o.value?'var(--bg)':'rgba(255,255,255,.55)',
                borderRadius:9,padding:'8px 14px',cursor:'pointer',
                fontFamily:'var(--font-display)',fontSize:'var(--fs-xs)',letterSpacing:1,
                transition:'all .15s'
              }}>
              {o.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if(saved){
    return(
      <div className="os-wrap">
        <div className="os-page" style={{paddingTop:80,textAlign:'center'}}>
          <div style={{fontSize:'4rem',marginBottom:16,animation:'trophyFloat 1s ease infinite'}}>💾</div>
          <div style={{fontFamily:'var(--font-display)',fontSize:'1.5rem',letterSpacing:2,
            background:'linear-gradient(135deg,var(--purple),var(--cyan))',
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:8}}>
            ¡GUARDADO!
          </div>
          <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-sm)',fontWeight:600,
            color:'rgba(255,255,255,.4)',letterSpacing:1}}>
            "{tmpl.name}" listo para jugar
          </div>
        </div>
      </div>
    );
  }

  return(
    <div className="os-wrap">
      {/* Header */}
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}}
          onClick={()=>{
            if(sectionMode) onBack();
            else if(step>1) setStep(step-1);
            else onBack();
          }}>
          ← {sectionMode?'Mis juegos':step>1?stepTitles[step-2]:'Mis juegos'}
        </button>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <div style={{fontFamily:'var(--font-ui)',fontSize:'.55rem',color:'rgba(255,255,255,.3)',letterSpacing:2}}>
            {sectionMode?'SECCIONES':step+'/'+TOTAL_STEPS}
          </div>
          {/* Toggle wizard/secciones */}
          <button onClick={()=>{snd('tap');setSectionMode(m=>!m);}}
            style={{background:'rgba(155,93,229,.15)',border:'1px solid rgba(155,93,229,.3)',color:'var(--purple)',borderRadius:8,padding:'4px 10px',cursor:'pointer',fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',fontWeight:700,letterSpacing:1}}>
            {sectionMode?'📋 Wizard':'📐 Secciones'}
          </button>
        </div>
      </div>

      {/* Barra de progreso (solo en wizard) */}
      {!sectionMode && (
        <div style={{height:3,background:'rgba(255,255,255,.06)',position:'relative',zIndex:10}}>
          <div style={{height:'100%',width:`${(step/TOTAL_STEPS)*100}%`,background:'linear-gradient(90deg,var(--purple),var(--cyan))',transition:'width .3s ease',boxShadow:'0 0 8px rgba(0,245,255,.4))'}}/>
        </div>
      )}

      {/* Tabs de sección (solo en section mode) */}
      {sectionMode && (
        <div style={{display:'flex',gap:4,padding:'8px 12px',overflowX:'auto',background:'rgba(0,0,0,.3)',borderBottom:'1px solid rgba(255,255,255,.06)'}}>
          {[
            {n:1,icon:'🎮',label:'ID'},
            {n:2,icon:'🏗️',label:'Struct.'},
            {n:3,icon:'🏆',label:'Victoria'},
            {n:4,icon:'💀',label:'Derrota'},
            {n:5,icon:'📊',label:'Progreso'},
            {n:6,icon:'⚔️',label:'Elim.'},
            {n:7,icon:'🧰',label:'Herram.'},
            {n:8,icon:'👥',label:'Roles'},
            {n:9,icon:'🏁',label:'Final'},
          ].map(s=>(
            <button key={s.n} onClick={()=>{snd('tap');setOpenSection(s.n);}}
              style={{
                flexShrink:0,padding:'6px 10px',borderRadius:8,border:'none',cursor:'pointer',
                fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',fontWeight:700,letterSpacing:.5,
                background:openSection===s.n?'rgba(155,93,229,.25)':'rgba(255,255,255,.05)',
                color:openSection===s.n?'var(--purple)':'rgba(255,255,255,.4)',
                borderBottom:openSection===s.n?'2px solid var(--purple)':'2px solid transparent',
                display:'flex',alignItems:'center',gap:4,
              }}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      )}

      <div className="os-page" style={{paddingTop:16}}>

        {/* ── PASO 1: IDENTIDAD ── */}
        {(sectionMode ? openSection===1 : step===1) && (
          <div className="anim-fade">
            {/* Emoji picker compacto */}
            <div style={{textAlign:'center',marginBottom:20}}>
              <div style={{
                fontSize:'4rem',
                width:80,height:80,borderRadius:20,
                background:'rgba(155,93,229,.1)',border:'2px solid rgba(155,93,229,.3)',
                display:'inline-flex',alignItems:'center',justifyContent:'center',
                marginBottom:10,cursor:'pointer',transition:'all .2s'
              }}>
                {tmpl.emoji}
              </div>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(0,245,255,.5)',letterSpacing:2}}>
                TOCA PARA CAMBIAR
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6,justifyContent:'center',marginTop:10}}>
                {GAME_EMOJIS.map((e,i)=>(
                  <div key={i}
                    style={{
                      fontSize:'1.5rem',width:40,height:40,borderRadius:10,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      cursor:'pointer',transition:'all .15s',
                      background:tmpl.emoji===e?'rgba(155,93,229,.25)':'rgba(255,255,255,.05)',
                      border:`2px solid ${tmpl.emoji===e?'var(--purple)':'transparent'}`,
                    }}
                    onClick={()=>{snd('tap');upd('emoji',e);}}>
                    {e}
                  </div>
                ))}
              </div>
            </div>

            <div className="os-section">NOMBRE DEL JUEGO</div>
            <input className="os-input" placeholder="Ej: Mi Catan, UNO Brutal, Dominó Clásico..."
              value={tmpl.name} onChange={e=>upd('name',e.target.value)} autoFocus maxLength={40}/>
            <input className="os-input" placeholder="Descripción corta (opcional)"
              value={tmpl.description} onChange={e=>upd('description',e.target.value)} maxLength={80}/>

            <div className="os-section">TIPO DE PARTIDA</div>
            <OptionRow label="👤 Individual" sub="Cada jugador compite por su cuenta"
              active={tmpl.type==='individual'} onClick={()=>{snd('tap');upd('type','individual');}}/>
            <OptionRow label="👥 Por equipos" sub="Jugadores agrupados en equipos que compiten entre sí"
              active={tmpl.type==='teams'} onClick={()=>{snd('tap');upd('type','teams');}}/>
            <OptionRow label="🤝 Cooperativo" sub="Todos los jugadores juegan juntos contra el juego"
              active={tmpl.type==='cooperative'} onClick={()=>{snd('tap');upd('type','cooperative');}}/>

            {tmpl.type==='cooperative' && (
              <div style={{background:'rgba(0,255,157,.05)',border:'1px solid rgba(0,255,157,.2)',borderRadius:12,padding:'12px 14px',marginBottom:8}}>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(0,255,157,.7)',lineHeight:1.5}}>
                  🤝 En modo cooperativo todos ganan o pierden juntos. La condición de victoria aplica al grupo, no a un jugador individual.
                </div>
              </div>
            )}

            {tmpl.type==='teams' && (
              <div style={{
                background:'rgba(0,245,255,.05)',border:'1px solid rgba(0,245,255,.2)',
                borderRadius:12,padding:'12px 14px',marginBottom:8
              }}>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(0,245,255,.6)',letterSpacing:2,marginBottom:10}}>¿CUÁNTOS EQUIPOS?</div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {[2,3,4,5,6].map(n=>(
                    <button key={n} onClick={()=>{snd('tap');upd('numTeams',n);}}
                      style={{
                        width:52,height:52,borderRadius:12,border:'none',cursor:'pointer',
                        fontFamily:'var(--font-display)',fontSize:'1.2rem',
                        background:tmpl.numTeams===n?'var(--cyan)':'rgba(255,255,255,.08)',
                        color:tmpl.numTeams===n?'var(--bg)':'rgba(255,255,255,.6)',
                        transition:'all .15s'
                      }}>
                      {n}
                    </button>
                  ))}
                </div>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.3)',letterSpacing:1,marginTop:8}}>
                  {tmpl.numTeams} equipos · los jugadores se distribuirán al iniciar la partida
                </div>
              </div>
            )}

            <div className="os-section">NÚMERO DE JUGADORES</div>
            <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:4}}>
              <div style={{flex:1}}>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.4)',letterSpacing:2,marginBottom:6}}>MÍNIMO</div>
                <select className="os-select" style={{marginBottom:0}} value={tmpl.minPlayers}
                  onChange={e=>upd('minPlayers',parseInt(e.target.value))}>
                  {[2,3,4,5,6,7,8].map(n=><option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div style={{flex:1}}>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.4)',letterSpacing:2,marginBottom:6}}>MÁXIMO</div>
                <select className="os-select" style={{marginBottom:0}} value={tmpl.maxPlayers}
                  onChange={e=>upd('maxPlayers',parseInt(e.target.value))}>
                  {[2,3,4,5,6,7,8,10,12,16,20].map(n=><option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.25)',letterSpacing:1,marginBottom:16,textAlign:'right'}}>
              Fijo o variable — el host puede agregar jugadores al crear la sala
            </div>

            <div className="os-section">ACCESO A SALA</div>
            {[
              {v:'public',  icon:'🌐', label:'Pública',  sub:'Cualquiera puede unirse con el código'},
              {v:'private', icon:'🔒', label:'Privada',  sub:'Solo el host puede agregar jugadores manualmente'},
              {v:'code',    icon:'🔑', label:'Por código',sub:'Se comparte un código de 4 letras para unirse (default)'},
              {v:'link',    icon:'🔗', label:'Por link',  sub:'Se genera un enlace directo para compartir'},
            ].map(o=>(
              <OptionRow key={o.v}
                label={<span>{o.icon} {o.label}</span>}
                sub={o.sub}
                active={tmpl.roomAccess===o.v}
                onClick={()=>{snd('tap');upd('roomAccess',o.v);}}/>
            ))}
          </div>
        )}

        {/* ── PASO 2: ESTRUCTURA ── */}
        {(sectionMode ? openSection===2 : step===2) && (
          <div className="anim-fade">
            {/* Título de sección */}
            <div style={{
              textAlign:'center',
              background:'linear-gradient(135deg,rgba(0,245,255,.08),rgba(155,93,229,.06))',
              border:'1px solid rgba(0,245,255,.2)',borderRadius:14,
              padding:'14px 16px',marginBottom:20
            }}>
              <div style={{fontSize:'2rem',marginBottom:6}}>🏗️</div>
              <div style={{fontFamily:'var(--font-display)',fontSize:'1.2rem',letterSpacing:2,
                background:'linear-gradient(135deg,var(--cyan),var(--purple))',
                WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
                ESTRUCTURA DE LA PARTIDA
              </div>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)',letterSpacing:2,marginTop:4}}>
                RONDAS · TURNOS · TOKEN · TEMPORIZADOR
              </div>
            </div>
                BLOQUE A: RONDAS
            ══════════════════════════════ */}
            <div style={{
              background:'rgba(0,245,255,.04)',border:'1px solid rgba(0,245,255,.15)',
              borderRadius:14,padding:'14px 14px 8px',marginBottom:14
            }}>
              <div style={{fontFamily:'var(--font-display)',fontSize:'.85rem',letterSpacing:2,color:'var(--cyan)',marginBottom:12}}>
                🔄 RONDAS
              </div>

              <div className="os-section" style={{marginTop:0}}>¿HAY RONDAS?</div>
              <OptionRow label="Sí — partida por rondas" sub="La partida se divide en rondas numeradas"
                active={tmpl.useRounds} onClick={()=>{snd('tap');upd('useRounds',true);}}/>
              <OptionRow label="No — partida continua" sub="Flujo libre, sin separación en rondas"
                active={!tmpl.useRounds} onClick={()=>{snd('tap');upd('useRounds',false);}}/>

              {tmpl.useRounds && (<>
                <div className="os-section">NÚMERO DE RONDAS</div>
                <select className="os-select" value={tmpl.rounds}
                  onChange={e=>upd('rounds', e.target.value==='libre'?'libre':parseInt(e.target.value))}>
                  {Array.from({length:20},(_,i)=>i+1).map(n=>(
                    <option key={n} value={n}>{n} ronda{n>1?'s':''}</option>
                  ))}
                  <option value="libre">∞ Infinito / Libre</option>
                </select>

                <div className="os-section">CIERRE DE RONDA</div>
                <OptionRow label="Manual" sub="El host cierra la ronda cuando lo decide"
                  active={tmpl.roundClose==='manual'} onClick={()=>{snd('tap');upd('roundClose','manual');}}/>
                <OptionRow label="Automático por tiempo" sub="Cierra al agotarse el timer de ronda"
                  active={tmpl.roundClose==='timer'} onClick={()=>{snd('tap');upd('roundClose','timer');}}/>
                <OptionRow label="Automático cuando todos terminan" sub="Cierra cuando cada jugador marca su acción"
                  active={tmpl.roundClose==='all_done'} onClick={()=>{snd('tap');upd('roundClose','all_done');}}/>

                {tmpl.roundClose==='timer' && (
                  <>
                    <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.4)',letterSpacing:2,marginBottom:6,marginTop:4,textTransform:'uppercase'}}>Duración de ronda</div>
                    <select className="os-select" value={tmpl.roundTimerSecs}
                      onChange={e=>upd('roundTimerSecs',parseInt(e.target.value))}>
                      {[15,30,45,60,90,120,180,300,600].map(s=>(
                        <option key={s} value={s}>{s<60?s+' seg':Math.floor(s/60)+' min'+(s%60?' '+s%60+' seg':'')}</option>
                      ))}
                    </select>
                  </>
                )}

                <div className="os-section">REINICIO ENTRE RONDAS</div>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(255,255,255,.4)',marginBottom:8}}>
                  ¿Qué se resetea al iniciar cada ronda nueva?
                </div>
                {[
                  {v:'nothing',     label:'Nada',                     sub:'Todo persiste de ronda a ronda'},
                  {v:'round_points',label:'Puntos de ronda',          sub:'Se limpian los puntos de esa ronda (acumulado se mantiene)'},
                  {v:'turns',       label:'Turnos',                   sub:'El orden de turnos se reinicia'},
                  {v:'temp_tools',  label:'Herramientas temporales',  sub:'Las herramientas de un solo uso se recargan'},
                ].map(o=>(
                  <OptionRow key={o.v} label={o.label} sub={o.sub}
                    active={tmpl.roundReset===o.v}
                    onClick={()=>{snd('tap');upd('roundReset',o.v);}}/>
                ))}
              </>)}
            </div>

            {/* ══════════════════════════════
                BLOQUE B: TURNOS
            ══════════════════════════════ */}
            <div style={{
              background:'rgba(155,93,229,.04)',border:'1px solid rgba(155,93,229,.18)',
              borderRadius:14,padding:'14px 14px 8px',marginBottom:14
            }}>
              <div style={{fontFamily:'var(--font-display)',fontSize:'.85rem',letterSpacing:2,color:'var(--purple)',marginBottom:12}}>
                ↕️ TURNOS
              </div>

              <div className="os-section" style={{marginTop:0}}>¿HAY TURNOS?</div>
              <OptionRow label="Sí — los jugadores actúan por turno"
                sub="Un jugador a la vez en orden definido"
                active={tmpl.useTurns} onClick={()=>{snd('tap');upd('useTurns',true);}}
                color="var(--purple)"/>
              <OptionRow label="No — acción libre"
                sub="Los jugadores actúan simultáneamente o cuando quieran"
                active={!tmpl.useTurns} onClick={()=>{snd('tap');upd('useTurns',false);}}
                color="var(--purple)"/>

              {tmpl.useTurns && (<>
                <div className="os-section">ORDEN DE TURNOS</div>
                {[
                  {v:'fixed',    label:'Fijo',              sub:'Siempre el mismo orden desde el inicio'},
                  {v:'random',   label:'Aleatorio',         sub:'Se sortea cada ronda'},
                  {v:'rotating', label:'Rotativo',          sub:'El primer jugador rota cada ronda'},
                  {v:'by_score', label:'Por posición/puntaje', sub:'Lidera quien tenga más puntos o esté primero'},
                ].map(o=>(
                  <OptionRow key={o.v} label={o.label} sub={o.sub}
                    active={tmpl.turnOrder===o.v}
                    onClick={()=>{snd('tap');upd('turnOrder',o.v);}}
                    color="var(--purple)"/>
                ))}

                <div className="os-section">OPCIONES DE TURNO</div>
                <div className={`check-row ${tmpl.canSkipTurn?'active':''}`}
                  style={{borderColor:tmpl.canSkipTurn?'rgba(155,93,229,.4)':undefined,background:tmpl.canSkipTurn?'rgba(155,93,229,.08)':undefined}}
                  onClick={()=>{snd('tap');upd('canSkipTurn',!tmpl.canSkipTurn);}}>
                  <div className="check-box" style={{borderColor:tmpl.canSkipTurn?'var(--purple)':undefined,background:tmpl.canSkipTurn?'var(--purple)':undefined,color:tmpl.canSkipTurn?'var(--bg)':undefined}}>{tmpl.canSkipTurn?'✓':''}</div>
                  <div><div className="check-label">Se puede saltar turno</div><div className="check-sub">Un jugador puede pasar su turno</div></div>
                </div>
                <div className={`check-row ${tmpl.hasExtraTurns?'active':''}`}
                  style={{borderColor:tmpl.hasExtraTurns?'rgba(155,93,229,.4)':undefined,background:tmpl.hasExtraTurns?'rgba(155,93,229,.08)':undefined}}
                  onClick={()=>{snd('tap');upd('hasExtraTurns',!tmpl.hasExtraTurns);}}>
                  <div className="check-box" style={{borderColor:tmpl.hasExtraTurns?'var(--purple)':undefined,background:tmpl.hasExtraTurns?'var(--purple)':undefined,color:tmpl.hasExtraTurns?'var(--bg)':undefined}}>{tmpl.hasExtraTurns?'✓':''}</div>
                  <div><div className="check-label">Hay turnos extra</div><div className="check-sub">Ciertos eventos pueden dar un turno adicional</div></div>
                </div>
                <div className={`check-row ${tmpl.turnLimitPerRound?'active':''}`}
                  style={{borderColor:tmpl.turnLimitPerRound?'rgba(155,93,229,.4)':undefined,background:tmpl.turnLimitPerRound?'rgba(155,93,229,.08)':undefined}}
                  onClick={()=>{snd('tap');upd('turnLimitPerRound',!tmpl.turnLimitPerRound);}}>
                  <div className="check-box" style={{borderColor:tmpl.turnLimitPerRound?'var(--purple)':undefined,background:tmpl.turnLimitPerRound?'var(--purple)':undefined,color:tmpl.turnLimitPerRound?'var(--bg)':undefined}}>{tmpl.turnLimitPerRound?'✓':''}</div>
                  <div><div className="check-label">Límite de turnos por ronda</div><div className="check-sub">Cada jugador tiene N turnos máximo por ronda</div></div>
                </div>
                {tmpl.turnLimitPerRound && (
                  <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
                    <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-sm)',color:'rgba(255,255,255,.5)',flex:1}}>Turnos por jugador por ronda:</div>
                    <select className="os-select" style={{marginBottom:0,width:100}} value={tmpl.turnLimitCount}
                      onChange={e=>upd('turnLimitCount',parseInt(e.target.value))}>
                      {[1,2,3,4,5,6,8,10].map(n=><option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                )}
              </>)}

              {!tmpl.useTurns && (<>
                <div className="os-section">MODO SIN TURNOS</div>
                <OptionRow label="Simultáneo" sub="Todos actúan al mismo tiempo"
                  active={tmpl.noTurnMode==='simultaneous'}
                  onClick={()=>{snd('tap');upd('noTurnMode','simultaneous');}}
                  color="var(--purple)"/>
                <OptionRow label="Mixto" sub="Algunas fases son simultáneas, otras por turno"
                  active={tmpl.noTurnMode==='mixed'}
                  onClick={()=>{snd('tap');upd('noTurnMode','mixed');}}
                  color="var(--purple)"/>
              </>)}
            </div>

            {/* ══════════════════════════════
                BLOQUE C: TOKEN PRIMER JUGADOR
            ══════════════════════════════ */}
            <div style={{
              background:'rgba(255,212,71,.04)',border:'1px solid rgba(255,212,71,.18)',
              borderRadius:14,padding:'14px 14px 8px',marginBottom:14
            }}>
              <div style={{fontFamily:'var(--font-display)',fontSize:'.85rem',letterSpacing:2,color:'var(--gold)',marginBottom:12}}>
                👑 TOKEN DE PRIMER JUGADOR
              </div>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(255,255,255,.4)',marginBottom:10,lineHeight:1.5}}>
                Un token visual que indica quién es el "primer jugador" en un momento dado. Se puede pasar entre jugadores durante la partida.
              </div>
              <div className={`check-row ${tmpl.useFirstPlayerToken?'active':''}`}
                style={{borderColor:tmpl.useFirstPlayerToken?'rgba(255,212,71,.4)':undefined,background:tmpl.useFirstPlayerToken?'rgba(255,212,71,.08)':undefined}}
                onClick={()=>{snd('tap');upd('useFirstPlayerToken',!tmpl.useFirstPlayerToken);}}>
                <div className="check-box" style={{borderColor:tmpl.useFirstPlayerToken?'var(--gold)':undefined,background:tmpl.useFirstPlayerToken?'var(--gold)':undefined,color:tmpl.useFirstPlayerToken?'var(--bg)':undefined}}>{tmpl.useFirstPlayerToken?'✓':''}</div>
                <div>
                  <div className="check-label">Habilitar token de primer jugador 👑</div>
                  <div className="check-sub">Aparecerá en el marcador y los jugadores podrán tomarlo o pasarlo</div>
                </div>
              </div>
            </div>

            {/* ══════════════════════════════
                BLOQUE D: TEMPORIZADOR
            ══════════════════════════════ */}
            <div style={{
              background:'rgba(255,107,53,.04)',border:'1px solid rgba(255,107,53,.18)',
              borderRadius:14,padding:'14px 14px 8px',marginBottom:14
            }}>
              <div style={{fontFamily:'var(--font-display)',fontSize:'.85rem',letterSpacing:2,color:'var(--orange)',marginBottom:12}}>
                ⏱ TEMPORIZADOR
              </div>

              <OptionRow label="Sin temporizador" sub="Los jugadores no tienen límite de tiempo"
                active={!tmpl.useTimer} onClick={()=>{snd('tap');upd('useTimer',false);}}
                color="var(--orange)"/>
              <OptionRow label="Con temporizador" sub="Se aplica un límite de tiempo configurable"
                active={tmpl.useTimer} onClick={()=>{snd('tap');upd('useTimer',true);}}
                color="var(--orange)"/>

              {tmpl.useTimer && (<>
                <div className="os-section">ALCANCE DEL TIMER</div>
                {[
                  {v:'turn',  label:'Por turno',          sub:'Cada jugador tiene X segundos por turno'},
                  {v:'round', label:'Por ronda',          sub:'Toda la ronda tiene X segundos totales'},
                  {v:'total', label:'Total de la partida',sub:'La partida completa tiene X minutos'},
                ].map(o=>(
                  <OptionRow key={o.v} label={o.label} sub={o.sub}
                    active={tmpl.timerScope===o.v}
                    onClick={()=>{snd('tap');upd('timerScope',o.v);}}
                    color="var(--orange)"/>
                ))}

                <div className="os-section">DURACIÓN</div>
                <select className="os-select" value={tmpl.timerSecs}
                  onChange={e=>upd('timerSecs',parseInt(e.target.value))}>
                  {[10,15,20,30,45,60,90,120,180,300,600,900,1800].map(s=>(
                    <option key={s} value={s}>
                      {s<60?s+' segundos':Math.floor(s/60)+' min'+(s%60?' '+s%60+' seg':'')}
                    </option>
                  ))}
                </select>

                <div className="os-section">ALERTAS</div>
                <div className={`check-row ${tmpl.timerVisualAlert?'active':''}`}
                  style={{borderColor:tmpl.timerVisualAlert?'rgba(255,107,53,.4)':undefined,background:tmpl.timerVisualAlert?'rgba(255,107,53,.08)':undefined}}
                  onClick={()=>{snd('tap');upd('timerVisualAlert',!tmpl.timerVisualAlert);}}>
                  <div className="check-box" style={{borderColor:tmpl.timerVisualAlert?'var(--orange)':undefined,background:tmpl.timerVisualAlert?'var(--orange)':undefined,color:tmpl.timerVisualAlert?'var(--bg)':undefined}}>{tmpl.timerVisualAlert?'✓':''}</div>
                  <div><div className="check-label">Aviso visual</div><div className="check-sub">La pantalla parpadea o cambia color al acercarse al límite</div></div>
                </div>
                <div className={`check-row ${tmpl.timerSoundAlert?'active':''}`}
                  style={{borderColor:tmpl.timerSoundAlert?'rgba(255,107,53,.4)':undefined,background:tmpl.timerSoundAlert?'rgba(255,107,53,.08)':undefined}}
                  onClick={()=>{snd('tap');upd('timerSoundAlert',!tmpl.timerSoundAlert);}}>
                  <div className="check-box" style={{borderColor:tmpl.timerSoundAlert?'var(--orange)':undefined,background:tmpl.timerSoundAlert?'var(--orange)':undefined,color:tmpl.timerSoundAlert?'var(--bg)':undefined}}>{tmpl.timerSoundAlert?'✓':''}</div>
                  <div><div className="check-label">Aviso sonoro</div><div className="check-sub">Beep al acercarse y al agotarse el tiempo</div></div>
                </div>

                <div className="os-section">AL ACABARSE EL TIEMPO</div>
                {[
                  {v:'nothing',    label:'No pasa nada',       sub:'Solo referencial, el juego continúa'},
                  {v:'skip',       label:'Se salta el turno',  sub:'El turno pasa automáticamente al siguiente jugador'},
                  {v:'assign_zero',label:'Se asigna 0 puntos', sub:'El jugador recibe 0 en esa ronda/turno'},
                  {v:'penalty',    label:'Penalización',       sub:'Se aplica una penalización configurable'},
                  {v:'auto',       label:'Acción automática',  sub:'El sistema ejecuta una acción predefinida'},
                ].map(o=>(
                  <OptionRow key={o.v} label={o.label} sub={o.sub}
                    active={tmpl.timerExpireAction===o.v}
                    onClick={()=>{snd('tap');upd('timerExpireAction',o.v);}}
                    color="var(--orange)"/>
                ))}
              </>)}
            </div>

          </div>
        )}

        {/* ── PASO 3: CONDICIÓN DE VICTORIA ── */}
        {(sectionMode ? openSection===3 : step===3) && (
          <div className="anim-fade">
            {/* Título */}
            <div style={{
              textAlign:'center',
              background:'linear-gradient(135deg,rgba(255,212,71,.08),rgba(255,107,53,.06))',
              border:'1px solid rgba(255,212,71,.2)',borderRadius:14,
              padding:'14px 16px',marginBottom:20
            }}>
              <div style={{fontSize:'2rem',marginBottom:6}}>🏆</div>
              <div style={{fontFamily:'var(--font-display)',fontSize:'1.2rem',letterSpacing:2,color:'var(--gold)'}}>
                CONDICIÓN DE VICTORIA
              </div>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)',letterSpacing:2,marginTop:4}}>
                ¿CÓMO SE GANA ESTE JUEGO?
              </div>
            </div>

            {/* Modos principales */}
            {[
              {v:'points',      icon:'🏅', label:'Por puntos',              sub:'Gana quien acumule o llegue primero a X puntos',    color:'var(--gold)'},
              {v:'wins',        icon:'🏆', label:'Por victorias de ronda',  sub:'Se cuentan rondas ganadas',                         color:'var(--cyan)'},
              {v:'lives',       icon:'❤️', label:'Por vidas / supervivencia',sub:'Gana quien conserve más vidas o sobreviva más',    color:'var(--red)'},
              {v:'elimination', icon:'💀', label:'Por eliminación',          sub:'Gana el último jugador o equipo activo',            color:'var(--orange)'},
              {v:'objective',   icon:'🎯', label:'Por objetivo / evento',    sub:'Completar una misión o activar una condición',      color:'var(--purple)'},
              {v:'time',        icon:'⏱', label:'Por tiempo',               sub:'Gana el mejor posicionado cuando acaba el tiempo',  color:'var(--blue)'},
              {v:'manual',      icon:'👑', label:'Manual / Host decide',     sub:'El host decide cuándo y quién gana',                color:'var(--green)'},
            ].map(m=>(
              <div key={m.v} className="os-card" style={{
                marginBottom:8,padding:'13px 14px',cursor:'pointer',
                borderColor:tmpl.victoryMode===m.v?m.color+'88':undefined,
                background:tmpl.victoryMode===m.v?m.color+'10':undefined
              }} onClick={()=>{snd('tap');upd('victoryMode',m.v);}}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{fontSize:'1.8rem'}}>{m.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:'var(--font-display)',fontSize:'var(--fs-sm)',letterSpacing:1,
                      color:tmpl.victoryMode===m.v?m.color:'#fff'}}>{m.label}</div>
                    <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',fontWeight:600,
                      color:'rgba(255,255,255,.4)',letterSpacing:1,marginTop:2}}>{m.sub}</div>
                  </div>
                  {tmpl.victoryMode===m.v && <div style={{color:m.color,fontSize:'1.3rem'}}>✓</div>}
                </div>
              </div>
            ))}

            {/* ── SUB-OPCIONES POR MODO ── */}

            {/* PUNTOS */}
            {tmpl.victoryMode==='points' && (
              <div style={{background:'rgba(255,212,71,.05)',border:'1px solid rgba(255,212,71,.2)',borderRadius:12,padding:'12px 14px',marginTop:4}}>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'var(--gold)',letterSpacing:2,marginBottom:10}}>DETALLE — PUNTOS</div>
                {[
                  {v:'most',   label:'Gana quien tenga más puntos',       sub:'Al cerrar la partida se compara el total'},
                  {v:'reach_x',label:'Gana quien llegue a X puntos',      sub:'El primero en alcanzar la meta gana'},
                  {v:'exact_x',label:'Debe llegar exacto a X',            sub:'Hay que acertar exactamente la meta'},
                ].map(o=>(
                  <OptionRow key={o.v} label={o.label} sub={o.sub}
                    active={tmpl.pointsWinMode===o.v}
                    onClick={()=>{snd('tap');upd('pointsWinMode',o.v);}}
                    color="var(--gold)"/>
                ))}
                {(tmpl.pointsWinMode==='reach_x'||tmpl.pointsWinMode==='exact_x') && (
                  <input className="os-input" type="number" min="1" max="99999"
                    placeholder="Meta de puntos (ej: 200)"
                    value={tmpl.targetScore||''}
                    onChange={e=>upd('targetScore',Math.min(99999,parseInt(e.target.value)||0))}/>
                )}
                <div className="os-section">¿CUÁNDO SE VALIDA?</div>
                <OptionRow label="Al instante" sub="Tan pronto alguien llega a la meta, gana"
                  active={tmpl.pointsValidation==='instant'}
                  onClick={()=>{snd('tap');upd('pointsValidation','instant');}}
                  color="var(--gold)"/>
                <OptionRow label="Al final de ronda" sub="Se revisa solo cuando el host cierra la ronda"
                  active={tmpl.pointsValidation==='round_end'}
                  onClick={()=>{snd('tap');upd('pointsValidation','round_end');}}
                  color="var(--gold)"/>
              </div>
            )}

            {/* VICTORIAS */}
            {tmpl.victoryMode==='wins' && (
              <div style={{background:'rgba(0,245,255,.05)',border:'1px solid rgba(0,245,255,.2)',borderRadius:12,padding:'12px 14px',marginTop:4}}>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'var(--cyan)',letterSpacing:2,marginBottom:10}}>DETALLE — VICTORIAS</div>
                <OptionRow label="Gana quien más rondas gane" sub="Al final se suma quién ganó más rondas"
                  active={tmpl.winsMode==='most'}
                  onClick={()=>{snd('tap');upd('winsMode','most');}} color="var(--cyan)"/>
                <OptionRow label="Meta de victorias" sub="Gana el primero en llegar a N victorias"
                  active={tmpl.winsMode==='target'}
                  onClick={()=>{snd('tap');upd('winsMode','target');}} color="var(--cyan)"/>
                <OptionRow label="Gana quien gane la última ronda decisiva" sub="La última ronda decide si hay empate"
                  active={tmpl.winsMode==='last_decisive'}
                  onClick={()=>{snd('tap');upd('winsMode','last_decisive');}} color="var(--cyan)"/>
                {tmpl.winsMode==='target' && (
                  <div style={{display:'flex',alignItems:'center',gap:12,marginTop:4}}>
                    <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-sm)',color:'rgba(255,255,255,.5)',flex:1}}>Meta:</div>
                    <select className="os-select" style={{marginBottom:0,width:120}} value={tmpl.winsTarget}
                      onChange={e=>upd('winsTarget',parseInt(e.target.value))}>
                      {[1,2,3,4,5,6,7,8,10,15,20].map(n=><option key={n} value={n}>{n} victorias</option>)}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* VIDAS / SUPERVIVENCIA */}
            {tmpl.victoryMode==='lives' && (
              <div style={{background:'rgba(255,59,92,.05)',border:'1px solid rgba(255,59,92,.2)',borderRadius:12,padding:'12px 14px',marginTop:4}}>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'var(--red)',letterSpacing:2,marginBottom:10}}>DETALLE — VIDAS</div>
                {[
                  {v:'last_alive',    label:'Gana el último con vida',         sub:'Todos los demás deben perder sus vidas'},
                  {v:'most_rounds',   label:'Gana quien sobreviva más rondas', sub:'El que más rondas aguante activo'},
                  {v:'most_lives',    label:'Gana quien conserve más vidas',   sub:'Al finalizar, se comparan vidas restantes'},
                ].map(o=>(
                  <OptionRow key={o.v} label={o.label} sub={o.sub}
                    active={tmpl.livesWinMode===o.v}
                    onClick={()=>{snd('tap');upd('livesWinMode',o.v);}} color="var(--red)"/>
                ))}
              </div>
            )}

            {/* ELIMINACIÓN */}
            {tmpl.victoryMode==='elimination' && (
              <div style={{background:'rgba(255,107,53,.05)',border:'1px solid rgba(255,107,53,.2)',borderRadius:12,padding:'12px 14px',marginTop:4}}>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'var(--orange)',letterSpacing:2,marginBottom:10}}>DETALLE — ELIMINACIÓN</div>
                {[
                  {v:'last_player',label:'Gana el último jugador activo', sub:'Todos los demás deben ser eliminados'},
                  {v:'last_team',  label:'Gana el último equipo activo',  sub:'Para partidas por equipos'},
                  {v:'eliminate_all',label:'Gana al eliminar a todos los demás', sub:'El objetivo es eliminar a los oponentes'},
                ].map(o=>(
                  <OptionRow key={o.v} label={o.label} sub={o.sub}
                    active={tmpl.elimWinMode===o.v}
                    onClick={()=>{snd('tap');upd('elimWinMode',o.v);}} color="var(--orange)"/>
                ))}
              </div>
            )}

            {/* OBJETIVO / EVENTO */}
            {tmpl.victoryMode==='objective' && (
              <div style={{background:'rgba(155,93,229,.05)',border:'1px solid rgba(155,93,229,.2)',borderRadius:12,padding:'12px 14px',marginTop:4}}>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'var(--purple)',letterSpacing:2,marginBottom:10}}>DETALLE — OBJETIVO</div>
                {[
                  {v:'complete_mission', label:'Completar misión',         sub:'El jugador completa una misión definida'},
                  {v:'get_resource',     label:'Obtener recurso/meta',     sub:'Conseguir un objeto o recurso específico'},
                  {v:'activate_cond',   label:'Activar condición especial',sub:'Disparar una condición del juego'},
                  {v:'unique_event',     label:'Cumplir evento único',      sub:'Un evento irrepetible determina al ganador'},
                ].map(o=>(
                  <OptionRow key={o.v} label={o.label} sub={o.sub}
                    active={tmpl.objectiveWinMode===o.v}
                    onClick={()=>{snd('tap');upd('objectiveWinMode',o.v);}} color="var(--purple)"/>
                ))}
              </div>
            )}

            {/* TIEMPO */}
            {tmpl.victoryMode==='time' && (
              <div style={{background:'rgba(74,144,255,.05)',border:'1px solid rgba(74,144,255,.2)',borderRadius:12,padding:'12px 14px',marginTop:4}}>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'var(--blue)',letterSpacing:2,marginBottom:10}}>DETALLE — TIEMPO</div>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-sm)',color:'rgba(255,255,255,.5)',marginBottom:8}}>
                  Cuando termina el tiempo total de la partida, gana el mejor posicionado (más puntos, más victorias, o el que no fue eliminado).
                </div>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)',letterSpacing:1}}>
                  La duración del tiempo total se configura en la sección de Estructura → Temporizador.
                </div>
              </div>
            )}

            {/* MANUAL */}
            {tmpl.victoryMode==='manual' && (
              <div style={{background:'rgba(0,255,157,.05)',border:'1px solid rgba(0,255,157,.2)',borderRadius:12,padding:'12px 14px',marginTop:4}}>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'var(--green)',letterSpacing:2,marginBottom:10}}>DETALLE — MANUAL</div>
                {[
                  {v:'host_end',    label:'El host decide cuándo termina', sub:'El host cierra la partida cuando lo considera'},
                  {v:'host_winner', label:'El host define el ganador',      sub:'El host señala explícitamente quién ganó'},
                ].map(o=>(
                  <OptionRow key={o.v} label={o.label} sub={o.sub}
                    active={tmpl.manualWinMode===o.v}
                    onClick={()=>{snd('tap');upd('manualWinMode',o.v);}} color="var(--green)"/>
                ))}
              </div>
            )}

            {/* Condiciones personalizadas */}
            <div className="os-section" style={{marginTop:8}}>CONDICIONES PERSONALIZADAS (OPCIONAL)</div>
            <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(255,255,255,.4)',marginBottom:10}}>
              Ej: Full house, Corrida, Flush... Al registrar una ronda podrás seleccionar cómo ganaste.
            </div>
            {(tmpl.winConditions||[]).map((c,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:8,background:'rgba(255,212,71,.06)',border:'1px solid rgba(255,212,71,.2)',borderRadius:10,padding:'8px 12px',marginBottom:6}}>
                <div style={{flex:1,fontFamily:'var(--font-body)',fontWeight:700,fontSize:'var(--fs-sm)',color:'var(--gold)'}}>{c}</div>
                <button style={{background:'none',border:'none',color:'rgba(255,59,92,.5)',fontSize:'1.1rem',cursor:'pointer'}}
                  onClick={()=>{snd('tap');upd('winConditions',(tmpl.winConditions||[]).filter((_,j)=>j!==i));}}>×</button>
              </div>
            ))}
            <div style={{display:'flex',gap:8,marginBottom:8}}>
              <input className="os-input" id="wc-input" style={{marginBottom:0,flex:1}}
                placeholder="Ej: Full house, Corrida, Flush..."
                maxLength={30}
                onKeyDown={e=>{
                  if(e.key==='Enter'&&e.target.value.trim()){
                    snd('tap');
                    upd('winConditions',[...(tmpl.winConditions||[]),e.target.value.trim()]);
                    e.target.value='';
                  }
                }}/>
              <button style={{background:'rgba(255,212,71,.1)',border:'1px solid rgba(255,212,71,.3)',color:'var(--gold)',borderRadius:11,padding:'0 16px',cursor:'pointer',fontFamily:'var(--font-display)',fontSize:'1.1rem',flexShrink:0}}
                onClick={()=>{
                  const inp=document.getElementById('wc-input');
                  if(inp&&inp.value.trim()){snd('tap');upd('winConditions',[...(tmpl.winConditions||[]),inp.value.trim()]);inp.value='';}
                }}>+</button>
            </div>

            {/* Desempate */}
            <div className="os-section">DESEMPATE</div>
            <SelectRow value={tmpl.tiebreak} onChange={v=>upd('tiebreak',v)} label="" options={[
              {value:'share', label:'Compartir victoria'},
              {value:'tool',  label:'Herramienta (moneda, etc)'},
              {value:'host',  label:'Host decide'},
            ]}/>
          </div>
        )}

        {/* ── PASO 4: CONDICIÓN DE DERROTA ── */}
        {(sectionMode ? openSection===4 : step===4) && (
          <div className="anim-fade">
            {/* Título */}
            <div style={{
              textAlign:'center',
              background:'linear-gradient(135deg,rgba(255,59,92,.08),rgba(255,107,53,.06))',
              border:'1px solid rgba(255,59,92,.2)',borderRadius:14,
              padding:'14px 16px',marginBottom:20
            }}>
              <div style={{fontSize:'2rem',marginBottom:6}}>💀</div>
              <div style={{fontFamily:'var(--font-display)',fontSize:'1.2rem',letterSpacing:2,color:'var(--red)'}}>
                CONDICIÓN DE DERROTA
              </div>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)',letterSpacing:2,marginTop:4}}>
                ¿HAY UNA FORMA EXPLÍCITA DE PERDER?
              </div>
            </div>

            <OptionRow label="Sin derrota explícita" sub="Solo pierde quien no gana — no hay condición adicional"
              active={!tmpl.useDefeat} onClick={()=>{snd('tap');upd('useDefeat',false);}} color="var(--green)"/>
            <OptionRow label="Con derrota explícita" sub="Hay condiciones específicas que eliminan o penalizan a un jugador"
              active={tmpl.useDefeat} onClick={()=>{snd('tap');upd('useDefeat',true);}} color="var(--red)"/>

            {tmpl.useDefeat && (<>

              {/* Tipo de derrota */}
              <div className="os-section">¿POR QUÉ SE PIERDE?</div>
              {[
                {v:'points',    icon:'🏅', label:'Por puntos',          sub:'Bajar de X, quedar último, no alcanzar mínimo...'},
                {v:'wins',      icon:'🏆', label:'Por victorias',        sub:'Tener menos victorias, no poder alcanzar al líder...'},
                {v:'lives',     icon:'❤️', label:'Por vidas',            sub:'Llegar a 0, daño acumulado, muerte por evento...'},
                {v:'elimination',icon:'💀',label:'Por eliminación',      sub:'Último lugar de ronda, ronda específica, manual...'},
                {v:'time',      icon:'⏱', label:'Por tiempo',           sub:'Timeout, no actuar a tiempo, exceso de penalizaciones'},
                {v:'objective', icon:'🎯', label:'Por objetivo fallido', sub:'No cumplir misión, fallar condición clave...'},
                {v:'external',  icon:'🎲', label:'Por evento externo',   sub:'Resultado de dado, ruleta, moneda, IA, host...'},
              ].map(m=>(
                <div key={m.v} className="os-card" style={{
                  marginBottom:8,padding:'12px 14px',cursor:'pointer',
                  borderColor:tmpl.defeatType===m.v?'rgba(255,59,92,.6)':undefined,
                  background:tmpl.defeatType===m.v?'rgba(255,59,92,.08)':undefined
                }} onClick={()=>{snd('tap');upd('defeatType',m.v);}}>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{fontSize:'1.6rem'}}>{m.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:'var(--font-display)',fontSize:'var(--fs-sm)',letterSpacing:1,
                        color:tmpl.defeatType===m.v?'var(--red)':'#fff'}}>{m.label}</div>
                      <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.4)',letterSpacing:1,marginTop:2}}>{m.sub}</div>
                    </div>
                    {tmpl.defeatType===m.v && <div style={{color:'var(--red)',fontSize:'1.2rem'}}>✓</div>}
                  </div>
                </div>
              ))}

              {/* Sub-opciones por tipo */}
              {tmpl.defeatType==='points' && (
                <div style={{background:'rgba(255,59,92,.05)',border:'1px solid rgba(255,59,92,.2)',borderRadius:12,padding:'12px 14px',marginTop:4}}>
                  {[
                    {v:'below_x',  label:'Bajar de X puntos',          sub:'Si un jugador cae por debajo de cierta cantidad'},
                    {v:'last',     label:'Quedar último',               sub:'El jugador en último lugar pierde'},
                    {v:'no_min',   label:'No alcanzar mínimo requerido',sub:'Hay un umbral mínimo que se debe superar'},
                    {v:'too_behind',label:'Quedar demasiado atrás',     sub:'Una diferencia excesiva con el líder'},
                  ].map(o=>(
                    <OptionRow key={o.v} label={o.label} sub={o.sub}
                      active={tmpl.defeatPoints===o.v}
                      onClick={()=>{snd('tap');upd('defeatPoints',o.v);}} color="var(--red)"/>
                  ))}
                  {tmpl.defeatPoints==='below_x' && (
                    <input className="os-input" type="number" placeholder="Umbral mínimo de puntos"
                      value={tmpl.defeatPointsX||''} onChange={e=>upd('defeatPointsX',parseInt(e.target.value)||0)}/>
                  )}
                </div>
              )}

              {tmpl.defeatType==='wins' && (
                <div style={{background:'rgba(255,59,92,.05)',border:'1px solid rgba(255,59,92,.2)',borderRadius:12,padding:'12px 14px',marginTop:4}}>
                  {[
                    {v:'fewer',      label:'Tener menos victorias',       sub:'El que menos victorias tiene pierde'},
                    {v:'cant_reach', label:'No poder alcanzar al líder',  sub:'Matemáticamente imposible alcanzar el primero'},
                    {v:'lose_n',     label:'Perder N rondas seguidas',    sub:'Una racha de derrotas consecutivas'},
                  ].map(o=>(
                    <OptionRow key={o.v} label={o.label} sub={o.sub}
                      active={tmpl.defeatWins===o.v}
                      onClick={()=>{snd('tap');upd('defeatWins',o.v);}} color="var(--red)"/>
                  ))}
                  {tmpl.defeatWins==='lose_n' && (
                    <div style={{display:'flex',alignItems:'center',gap:12,marginTop:4}}>
                      <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-sm)',color:'rgba(255,255,255,.5)',flex:1}}>Número de derrotas seguidas:</div>
                      <select className="os-select" style={{marginBottom:0,width:80}} value={tmpl.defeatLoseN}
                        onChange={e=>upd('defeatLoseN',parseInt(e.target.value))}>
                        {[2,3,4,5,6,7,8,10].map(n=><option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {tmpl.defeatType==='lives' && (
                <div style={{background:'rgba(255,59,92,.05)',border:'1px solid rgba(255,59,92,.2)',borderRadius:12,padding:'12px 14px',marginTop:4}}>
                  {[
                    {v:'zero',         label:'Llegar a 0 vidas',                sub:'El jugador pierde cuando no tiene vidas'},
                    {v:'damage',       label:'Daño acumulado',                  sub:'La suma de daño supera un umbral'},
                    {v:'instant_event',label:'Muerte instantánea por evento',   sub:'Un evento específico elimina al jugador de inmediato'},
                  ].map(o=>(
                    <OptionRow key={o.v} label={o.label} sub={o.sub}
                      active={tmpl.defeatLives===o.v}
                      onClick={()=>{snd('tap');upd('defeatLives',o.v);}} color="var(--red)"/>
                  ))}
                </div>
              )}

              {tmpl.defeatType==='elimination' && (
                <div style={{background:'rgba(255,59,92,.05)',border:'1px solid rgba(255,59,92,.2)',borderRadius:12,padding:'12px 14px',marginTop:4}}>
                  {[
                    {v:'last_round',   label:'Último lugar de ronda',    sub:'El que queda último en la ronda es eliminado'},
                    {v:'elim_rule',    label:'Regla de eliminación',     sub:'Una regla específica del juego lo elimina'},
                    {v:'specific_round',label:'Ronda específica',        sub:'A partir de cierta ronda se activa la eliminación'},
                    {v:'manual',       label:'Decisión manual',          sub:'El host o un evento decide quién se elimina'},
                  ].map(o=>(
                    <OptionRow key={o.v} label={o.label} sub={o.sub}
                      active={tmpl.defeatElim===o.v}
                      onClick={()=>{snd('tap');upd('defeatElim',o.v);}} color="var(--red)"/>
                  ))}
                  {tmpl.defeatElim==='specific_round' && (
                    <div style={{display:'flex',alignItems:'center',gap:12,marginTop:4}}>
                      <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-sm)',color:'rgba(255,255,255,.5)',flex:1}}>Empieza en ronda:</div>
                      <select className="os-select" style={{marginBottom:0,width:80}} value={tmpl.defeatElimRound}
                        onChange={e=>upd('defeatElimRound',parseInt(e.target.value))}>
                        {Array.from({length:10},(_,i)=>i+1).map(n=><option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {tmpl.defeatType==='time' && (
                <div style={{background:'rgba(255,59,92,.05)',border:'1px solid rgba(255,59,92,.2)',borderRadius:12,padding:'12px 14px',marginTop:4}}>
                  {[
                    {v:'timeout',         label:'Timeout',                  sub:'El jugador agota su tiempo de turno'},
                    {v:'no_act',          label:'No actuar a tiempo',       sub:'No realizó ninguna acción antes de que cerrara'},
                    {v:'excess_penalty',  label:'Exceso de penalizaciones', sub:'Acumula demasiadas penalizaciones por tiempo'},
                  ].map(o=>(
                    <OptionRow key={o.v} label={o.label} sub={o.sub}
                      active={tmpl.defeatTime===o.v}
                      onClick={()=>{snd('tap');upd('defeatTime',o.v);}} color="var(--red)"/>
                  ))}
                </div>
              )}

              {tmpl.defeatType==='objective' && (
                <div style={{background:'rgba(255,59,92,.05)',border:'1px solid rgba(255,59,92,.2)',borderRadius:12,padding:'12px 14px',marginTop:4}}>
                  {[
                    {v:'no_mission',   label:'No cumplir misión',       sub:'El jugador no completó su misión a tiempo'},
                    {v:'fail_key',     label:'Fallar condición clave',   sub:'Una condición esencial del juego fue fallida'},
                    {v:'fail_critical',label:'Fallar evento crítico',    sub:'Un evento irreversible que determina la derrota'},
                  ].map(o=>(
                    <OptionRow key={o.v} label={o.label} sub={o.sub}
                      active={tmpl.defeatObjective===o.v}
                      onClick={()=>{snd('tap');upd('defeatObjective',o.v);}} color="var(--red)"/>
                  ))}
                </div>
              )}

              {tmpl.defeatType==='external' && (
                <div style={{background:'rgba(255,59,92,.05)',border:'1px solid rgba(255,59,92,.2)',borderRadius:12,padding:'12px 14px',marginTop:4}}>
                  {[
                    {v:'dice',  label:'Resultado de dado', sub:'Un dado determina la derrota de un jugador'},
                    {v:'wheel', label:'Resultado de ruleta',sub:'La ruleta señala al perdedor'},
                    {v:'coin',  label:'Resultado de moneda',sub:'Un lanzamiento de moneda decide'},
                    {v:'ai',    label:'Decisión IA',        sub:'La IA actúa como árbitro y decide la derrota'},
                    {v:'host',  label:'Decisión del host',  sub:'El host manualmente señala al perdedor'},
                  ].map(o=>(
                    <OptionRow key={o.v} label={o.label} sub={o.sub}
                      active={tmpl.defeatExternal===o.v}
                      onClick={()=>{snd('tap');upd('defeatExternal',o.v);}} color="var(--red)"/>
                  ))}
                </div>
              )}

              {/* Momento de evaluación */}
              <div className="os-section" style={{marginTop:8}}>MOMENTO DE EVALUACIÓN</div>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(255,255,255,.4)',marginBottom:8}}>¿Cuándo se revisa si se cumplió la condición de derrota?</div>
              {[
                {v:'immediate', label:'Inmediato',       sub:'En cuanto ocurre el evento'},
                {v:'turn_end',  label:'Fin de turno',    sub:'Al terminar el turno del jugador'},
                {v:'round_end', label:'Fin de ronda',    sub:'Cuando el host cierra la ronda'},
                {v:'phase',     label:'Fase específica', sub:'En un momento particular de la partida'},
                {v:'game_end',  label:'Fin de partida',  sub:'Solo se evalúa al terminar la partida'},
              ].map(o=>(
                <OptionRow key={o.v} label={o.label} sub={o.sub}
                  active={tmpl.defeatMoment===o.v}
                  onClick={()=>{snd('tap');upd('defeatMoment',o.v);}} color="var(--orange)"/>
              ))}

              {/* Consecuencia */}
              <div className="os-section">CONSECUENCIA DE LA DERROTA</div>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(255,255,255,.4)',marginBottom:8}}>¿Qué le pasa al jugador que pierde?</div>
              {[
                {v:'eliminated',    label:'Eliminación total',       sub:'Sale completamente de la partida'},
                {v:'spectator',     label:'Pasa a espectador',       sub:'Sigue viendo pero sin participar'},
                {v:'lose_turn',     label:'Pierde turno(s)',         sub:'Se salta su próximo o próximos turnos'},
                {v:'lose_points',   label:'Pierde puntos',           sub:'Se le descuenta una cantidad de puntos'},
                {v:'temp_penalty',  label:'Penalización temporal',   sub:'Sufre un debuff por N rondas'},
                {v:'weakened',      label:'Estado debilitado',       sub:'Continúa pero con capacidades reducidas'},
                {v:'log_only',      label:'Solo registro sin salir', sub:'Se registra pero el jugador sigue activo'},
              ].map(o=>(
                <OptionRow key={o.v} label={o.label} sub={o.sub}
                  active={tmpl.defeatConsequence===o.v}
                  onClick={()=>{snd('tap');upd('defeatConsequence',o.v);}} color="var(--red)"/>
              ))}
            </>)}
          </div>
        )}

        {/* ── PASO 5: SISTEMA DE PROGRESO / REGISTRO ── */}
        {(sectionMode ? openSection===5 : step===5) && (
          <div className="anim-fade">

            {/* Título */}
            <div style={{
              textAlign:'center',
              background:'linear-gradient(135deg,rgba(0,255,157,.07),rgba(0,245,255,.05))',
              border:'1px solid rgba(0,255,157,.2)',borderRadius:14,
              padding:'14px 16px',marginBottom:20
            }}>
              <div style={{fontSize:'2rem',marginBottom:6}}>📊</div>
              <div style={{fontFamily:'var(--font-display)',fontSize:'1.2rem',letterSpacing:2,color:'var(--green)'}}>
                SISTEMA DE PROGRESO
              </div>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)',letterSpacing:2,marginTop:4}}>
                QUÉ SE REGISTRA · CÓMO · CUÁNDO · QUIÉN VE
              </div>
            </div>

            {/* ── A: QUÉ SE REGISTRA ── */}
            <div style={{background:'rgba(0,255,157,.04)',border:'1px solid rgba(0,255,157,.15)',borderRadius:14,padding:'14px 14px 10px',marginBottom:14}}>
              <div style={{fontFamily:'var(--font-display)',fontSize:'.85rem',letterSpacing:2,color:'var(--green)',marginBottom:12}}>
                📋 ¿QUÉ SE REGISTRA?
              </div>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(255,255,255,.4)',marginBottom:10}}>
                Selecciona todo lo que se lleva seguimiento durante la partida (puedes elegir varios).
              </div>
              {[
                {v:'points',    icon:'🏅', label:'Puntos',          sub:'Valor numérico que sube o baja'},
                {v:'wins',      icon:'🏆', label:'Victorias',       sub:'Conteo de rondas o partidas ganadas'},
                {v:'lives',     icon:'❤️', label:'Vidas',           sub:'Contador de vidas disponibles'},
                {v:'resources', icon:'📦', label:'Recursos',        sub:'Monedas, cartas, tokens u otros recursos'},
                {v:'coins',     icon:'🪙', label:'Monedas',         sub:'Sistema de moneda específico'},
                {v:'objectives',icon:'🎯', label:'Objetivos',       sub:'Misiones o metas completadas'},
                {v:'custom',    icon:'🔢', label:'Contador custom', sub:'Un contador con nombre personalizado'},
              ].map(o=>(
                <div key={o.v} className={`check-row ${tmpl.registers.includes(o.v)?'active':''}`}
                  style={{
                    borderColor:tmpl.registers.includes(o.v)?'rgba(0,255,157,.4)':undefined,
                    background:tmpl.registers.includes(o.v)?'rgba(0,255,157,.07)':undefined,
                    marginBottom:6
                  }}
                  onClick={()=>{snd('tap');toggleArr('registers',o.v);}}>
                  <div style={{fontSize:'1.4rem',width:32,textAlign:'center',flexShrink:0}}>{o.icon}</div>
                  <div style={{flex:1}}>
                    <div className="check-label">{o.label}</div>
                    <div className="check-sub">{o.sub}</div>
                  </div>
                  <div className="check-box" style={{
                    borderColor:tmpl.registers.includes(o.v)?'var(--green)':undefined,
                    background:tmpl.registers.includes(o.v)?'var(--green)':undefined,
                    color:tmpl.registers.includes(o.v)?'var(--bg)':undefined
                  }}>{tmpl.registers.includes(o.v)?'✓':''}</div>
                </div>
              ))}

              {tmpl.registers.includes('custom') && (
                <div style={{marginTop:8}}>
                  <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(0,255,157,.6)',letterSpacing:2,marginBottom:6}}>NOMBRE DEL CONTADOR</div>
                  <input className="os-input" placeholder="Ej: Puntos de honor, Energía, Mana..."
                    value={tmpl.customCounterName} onChange={e=>upd('customCounterName',e.target.value)} maxLength={30}/>
                </div>
              )}
            </div>

            {/* ── B: TIPO DE CAPTURA ── */}
            <div style={{background:'rgba(0,245,255,.04)',border:'1px solid rgba(0,245,255,.15)',borderRadius:14,padding:'14px 14px 10px',marginBottom:14}}>
              <div style={{fontFamily:'var(--font-display)',fontSize:'.85rem',letterSpacing:2,color:'var(--cyan)',marginBottom:12}}>
                📥 TIPO DE CAPTURA
              </div>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(255,255,255,.4)',marginBottom:10}}>
                ¿Cómo se ingresan los valores durante la partida?
              </div>
              {[
                {v:'manual',  icon:'✍️',  label:'Manual',          sub:'El host o el jugador escribe el valor a mano'},
                {v:'auto',    icon:'⚡',  label:'Automática',      sub:'El sistema calcula y registra sin intervención'},
                {v:'tool',    icon:'🎲',  label:'Con herramienta', sub:'El valor lo determina un dado, ruleta o moneda'},
                {v:'camera',  icon:'📷',  label:'Con cámara',      sub:'Se escanea o fotografia para registrar (próximamente)',  badge:'🔜'},
                {v:'ai',      icon:'🤖',  label:'Con IA',          sub:'La IA interpreta y asigna el valor (próximamente)',       badge:'🔜'},
                {v:'mixed',   icon:'🔀',  label:'Mixta',           sub:'Combinación de los métodos anteriores'},
              ].map(o=>(
                <OptionRow key={o.v}
                  label={o.badge?`${o.label}  ${o.badge}`:o.label}
                  sub={o.sub}
                  active={tmpl.captureType===o.v}
                  onClick={()=>{snd('tap');upd('captureType',o.v);}}
                  color="var(--cyan)"/>
              ))}
            </div>

            {/* ── C: NATURALEZA DEL VALOR ── */}
            <div style={{background:'rgba(255,212,71,.04)',border:'1px solid rgba(255,212,71,.15)',borderRadius:14,padding:'14px 14px 10px',marginBottom:14}}>
              <div style={{fontFamily:'var(--font-display)',fontSize:'.85rem',letterSpacing:2,color:'var(--gold)',marginBottom:12}}>
                🔢 NATURALEZA DEL VALOR
              </div>
              {[
                {v:'positive', label:'Solo positivos',           sub:'Los valores solo suman — nunca bajan de 0'},
                {v:'both',     label:'Positivos y negativos',    sub:'Se pueden sumar y restar — puntos pueden ser negativos'},
                {v:'integers', label:'Solo enteros',             sub:'Sin decimales — siempre número completo'},
                {v:'decimals', label:'Con decimales',            sub:'Permite valores como 1.5, 3.75, etc.'},
              ].map(o=>(
                <OptionRow key={o.v} label={o.label} sub={o.sub}
                  active={tmpl.valueNature===o.v}
                  onClick={()=>{snd('tap');upd('valueNature',o.v);}}
                  color="var(--gold)"/>
              ))}
            </div>

            {/* ── D: ACUMULACIÓN ── */}
            <div style={{background:'rgba(155,93,229,.04)',border:'1px solid rgba(155,93,229,.15)',borderRadius:14,padding:'14px 14px 10px',marginBottom:14}}>
              <div style={{fontFamily:'var(--font-display)',fontSize:'.85rem',letterSpacing:2,color:'var(--purple)',marginBottom:12}}>
                📈 ACUMULACIÓN
              </div>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(255,255,255,.4)',marginBottom:10}}>
                ¿Cómo se acumulan los valores entre rondas?
              </div>
              {[
                {v:'global',       label:'Total acumulado',          sub:'Se suman todas las rondas — el total global siempre crece'},
                {v:'per_round',    label:'Por ronda independiente',  sub:'Cada ronda se evalúa sola — el total no se acumula'},
                {v:'reset',        label:'Reinicia cada ronda',      sub:'Se guarda historial por ronda pero el marcador se resetea'},
                {v:'hybrid',       label:'Híbrido — historial + total', sub:'Se conserva tanto el total global como el desglose por ronda'},
              ].map(o=>(
                <OptionRow key={o.v} label={o.label} sub={o.sub}
                  active={tmpl.accumulation===o.v}
                  onClick={()=>{snd('tap');upd('accumulation',o.v);}}
                  color="var(--purple)"/>
              ))}
            </div>

            {/* ── E: MODIFICADORES ── */}
            <div style={{background:'rgba(255,107,53,.04)',border:'1px solid rgba(255,107,53,.15)',borderRadius:14,padding:'14px 14px 10px',marginBottom:14}}>
              <div style={{fontFamily:'var(--font-display)',fontSize:'.85rem',letterSpacing:2,color:'var(--orange)',marginBottom:6}}>
                ⚡ MODIFICADORES
              </div>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(255,255,255,.4)',marginBottom:12}}>
                Acciones especiales que el host puede aplicar durante la partida. Aparecerán como botones en el panel del host en el runtime.
              </div>
              {[
                {v:'bonus',       icon:'⭐', label:'Bonus',                 sub:'+N puntos extra a un jugador — el host define el monto'},
                {v:'penalty',     icon:'💢', label:'Penalización',           sub:'-N puntos a un jugador — el host define el monto'},
                {v:'multiplier',  icon:'✖️', label:'Multiplicador',          sub:'Multiplica los puntos de una ronda por un factor'},
                {v:'steal',       icon:'🦊', label:'Robo',                   sub:'Un jugador le roba X puntos a otro'},
                {v:'shield',      icon:'🛡️', label:'Escudo',                 sub:'Protege a un jugador de la siguiente acción negativa'},
                {v:'block',       icon:'🚫', label:'Bloqueo',                sub:'Un jugador no puede capturar puntos por N rondas'},
                {v:'double_next', icon:'🎯', label:'Doble siguiente ronda',  sub:'Los puntos de la próxima ronda valen doble para ese jugador'},
              ].map(o=>(
                <div key={o.v}
                  className={`check-row ${tmpl.modifiers.includes(o.v)?'active':''}`}
                  style={{
                    borderColor:tmpl.modifiers.includes(o.v)?'rgba(255,107,53,.4)':undefined,
                    background:tmpl.modifiers.includes(o.v)?'rgba(255,107,53,.07)':undefined,
                    marginBottom:6
                  }}
                  onClick={()=>{snd('tap');toggleArr('modifiers',o.v);}}>
                  <div style={{fontSize:'1.3rem',width:32,textAlign:'center',flexShrink:0}}>{o.icon}</div>
                  <div style={{flex:1}}>
                    <div className="check-label">{o.label}</div>
                    <div className="check-sub">{o.sub}</div>
                  </div>
                  <div className="check-box" style={{
                    borderColor:tmpl.modifiers.includes(o.v)?'var(--orange)':undefined,
                    background:tmpl.modifiers.includes(o.v)?'var(--orange)':undefined,
                    color:tmpl.modifiers.includes(o.v)?'var(--bg)':undefined
                  }}>{tmpl.modifiers.includes(o.v)?'✓':''}</div>
                </div>
              ))}

              {tmpl.modifiers.length>0 && (
                <div className="os-alert alert-gold" style={{marginTop:8}}>
                  ⚡ {tmpl.modifiers.length} modificador{tmpl.modifiers.length>1?'es':''} activo{tmpl.modifiers.length>1?'s':''}  — aparecerán como acciones en el panel del host durante la partida
                </div>
              )}
            </div>

            {/* ── F: QUIÉN CAPTURA ── */}
            <div style={{background:'rgba(74,144,255,.04)',border:'1px solid rgba(74,144,255,.15)',borderRadius:14,padding:'14px 14px 10px',marginBottom:14}}>
              <div style={{fontFamily:'var(--font-display)',fontSize:'.85rem',letterSpacing:2,color:'var(--blue)',marginBottom:12}}>
                👤 ¿QUIÉN CAPTURA?
              </div>
              {[
                {v:'host', label:'Solo el host',          sub:'El host registra todos los valores centralizadamente'},
                {v:'self', label:'Cada jugador el suyo',  sub:'Cada jugador ingresa sus propios puntos desde su pantalla'},
                {v:'all',  label:'Todos pueden',          sub:'Cualquier jugador puede registrar puntos de cualquier otro'},
              ].map(o=>(
                <OptionRow key={o.v} label={o.label} sub={o.sub}
                  active={tmpl.capturedBy===o.v}
                  onClick={()=>{snd('tap');upd('capturedBy',o.v);}}
                  color="var(--blue)"/>
              ))}
            </div>

            {/* ── G: VISIBILIDAD ── */}
            <div style={{background:'rgba(255,59,92,.04)',border:'1px solid rgba(255,59,92,.15)',borderRadius:14,padding:'14px 14px 10px',marginBottom:14}}>
              <div style={{fontFamily:'var(--font-display)',fontSize:'.85rem',letterSpacing:2,color:'var(--red)',marginBottom:12}}>
                👁 VISIBILIDAD DEL MARCADOR
              </div>
              {[
                {v:'all',              label:'Pública',                   sub:'Todos los jugadores ven el marcador en tiempo real'},
                {v:'host',             label:'Solo el host',              sub:'Los jugadores no ven el marcador — el host sí'},
                {v:'player',           label:'Solo el propio jugador',    sub:'Cada quien solo ve su propio puntaje'},
                {v:'hidden',           label:'Oculta hasta fin de ronda', sub:'Se revela cuando el host cierra la ronda'},
              ].map(o=>(
                <OptionRow key={o.v} label={o.label} sub={o.sub}
                  active={tmpl.scoreVisibility===o.v}
                  onClick={()=>{snd('tap');upd('scoreVisibility',o.v);}}
                  color="var(--red)"/>
              ))}
            </div>

            {/* Resumen Sección 5 */}
            {tmpl.registers.length>0 && (
              <div className="os-alert alert-green">
                ✓ Registrando: {tmpl.registers.map(r=>({
                  points:'Puntos',wins:'Victorias',lives:'Vidas',
                  resources:'Recursos',coins:'Monedas',
                  objectives:'Objetivos',custom:tmpl.customCounterName||'Custom'
                }[r]||r)).join(' · ')}
                {tmpl.modifiers.length>0&&` · ${tmpl.modifiers.length} modificador${tmpl.modifiers.length>1?'es':''}`}
              </div>
            )}

          </div>
        )}

        {/* ── PASO 6: ELIMINACIÓN ── */}
        {(sectionMode ? openSection===6 : step===6) && (
          <div className="anim-fade">

            {/* Título */}
            <div style={{
              textAlign:'center',
              background:'linear-gradient(135deg,rgba(255,59,92,.08),rgba(155,93,229,.05))',
              border:'1px solid rgba(255,59,92,.2)',borderRadius:14,
              padding:'14px 16px',marginBottom:20
            }}>
              <div style={{fontSize:'2rem',marginBottom:6}}>💀</div>
              <div style={{fontFamily:'var(--font-display)',fontSize:'1.2rem',letterSpacing:2,color:'var(--red)'}}>
                SISTEMA DE ELIMINACIÓN
              </div>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)',letterSpacing:2,marginTop:4}}>
                ¿SE PUEDEN ELIMINAR JUGADORES DURANTE LA PARTIDA?
              </div>
            </div>

            {/* ¿Existe eliminación? */}
            <OptionRow label="No — nadie sale de la partida" sub="Todos los jugadores juegan hasta el final sin importar su posición"
              active={!tmpl.useElimination}
              onClick={()=>{snd('tap');upd('useElimination',false);}}
              color="var(--green)"/>
            <OptionRow label="Sí — hay jugadores que se eliminan" sub="Un jugador puede salir de la partida antes de que termine"
              active={tmpl.useElimination}
              onClick={()=>{snd('tap');upd('useElimination',true);}}
              color="var(--red)"/>

            {tmpl.useElimination && (<>

              {/* ══ A: ¿Cuándo inicia? ══ */}
              <div style={{
                background:'rgba(255,59,92,.04)',border:'1px solid rgba(255,59,92,.18)',
                borderRadius:14,padding:'14px 14px 8px',marginBottom:14,marginTop:8
              }}>
                <div style={{fontFamily:'var(--font-display)',fontSize:'.85rem',letterSpacing:2,color:'var(--red)',marginBottom:10}}>
                  🕐 ¿CUÁNDO INICIA LA ELIMINACIÓN?
                </div>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(255,255,255,.4)',marginBottom:10}}>
                  A partir de qué ronda puede ser eliminado un jugador.
                </div>

                {[
                  {v:'round_1', label:'Desde la ronda 1',  sub:'La eliminación es posible desde el inicio de la partida'},
                  {v:'round_2', label:'Desde la ronda 2',  sub:'La primera ronda es "segura" para todos'},
                  {v:'round_3', label:'Desde la ronda 3',  sub:'Dos rondas de gracia antes de activarse'},
                  {v:'round_n', label:'Desde ronda N',     sub:'Se elige el número de ronda de activación'},
                ].map(o=>(
                  <OptionRow key={o.v} label={o.label} sub={o.sub}
                    active={tmpl.elimStartsAt===o.v}
                    onClick={()=>{snd('tap');upd('elimStartsAt',o.v);}}
                    color="var(--red)"/>
                ))}

                {tmpl.elimStartsAt==='round_n' && (
                  <div style={{display:'flex',alignItems:'center',gap:12,marginTop:4,marginBottom:8}}>
                    <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-sm)',color:'rgba(255,255,255,.5)',flex:1}}>
                      Empieza en la ronda:
                    </div>
                    <select className="os-select" style={{marginBottom:0,width:90}} value={tmpl.elimStartRound}
                      onChange={e=>upd('elimStartRound',parseInt(e.target.value))}>
                      {Array.from({length:15},(_,i)=>i+2).map(n=>(
                        <option key={n} value={n}>Ronda {n}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* ══ B: ¿Cómo se elimina? ══ */}
              <div style={{
                background:'rgba(255,107,53,.04)',border:'1px solid rgba(255,107,53,.18)',
                borderRadius:14,padding:'14px 14px 8px',marginBottom:14
              }}>
                <div style={{fontFamily:'var(--font-display)',fontSize:'.85rem',letterSpacing:2,color:'var(--orange)',marginBottom:10}}>
                  ⚔️ ¿CÓMO SE ELIMINA UN JUGADOR?
                </div>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(255,255,255,.4)',marginBottom:10}}>
                  La condición que determina quién es eliminado en cada ronda.
                </div>

                {[
                  {v:'last_place',        label:'Último lugar',              sub:'El jugador en última posición de la ronda queda eliminado'},
                  {v:'lowest_score',      label:'Menor puntaje acumulado',   sub:'El que tenga menos puntos en el acumulado total'},
                  {v:'zero_lives',        label:'0 vidas',                   sub:'El jugador pierde cuando sus vidas llegan a cero'},
                  {v:'special_condition', label:'Condición especial',        sub:'Se define un evento o regla particular del juego'},
                  {v:'manual',            label:'Manual — host decide',       sub:'El host señala quién es eliminado en cada ronda'},
                ].map(o=>(
                  <OptionRow key={o.v} label={o.label} sub={o.sub}
                    active={tmpl.elimMethod===o.v}
                    onClick={()=>{snd('tap');upd('elimMethod',o.v);}}
                    color="var(--orange)"/>
                ))}

                {/* Nota de consistencia con condición de victoria */}
                {tmpl.elimMethod==='zero_lives' && !tmpl.registers.includes('lives') && (
                  <div className="os-alert alert-gold" style={{marginTop:6,fontSize:'var(--fs-micro)'}}>
                    ⚠ La eliminación por 0 vidas requiere que "Vidas" esté activado en el Sistema de Progreso (Paso 5).
                  </div>
                )}
              </div>

              {/* ══ C: ¿Qué pasa si hay empate? ══ */}
              <div style={{
                background:'rgba(255,212,71,.04)',border:'1px solid rgba(255,212,71,.18)',
                borderRadius:14,padding:'14px 14px 8px',marginBottom:14
              }}>
                <div style={{fontFamily:'var(--font-display)',fontSize:'.85rem',letterSpacing:2,color:'var(--gold)',marginBottom:10}}>
                  🤝 ¿QUÉ PASA SI HAY EMPATE EN LA ELIMINACIÓN?
                </div>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(255,255,255,.4)',marginBottom:10}}>
                  Cuando dos o más jugadores están empatados en la posición de eliminación.
                </div>

                {[
                  {v:'nobody',  label:'No se elimina nadie',          sub:'Si hay empate, nadie sale — la ronda se resuelve sin eliminación'},
                  {v:'all',     label:'Se eliminan todos los empatados', sub:'Todos los que están en empate quedan eliminados'},
                  {v:'tool',    label:'Desempate con herramienta',    sub:'Se usa moneda, dado o ruleta para decidir quién sale'},
                  {v:'host',    label:'El host decide',               sub:'El host elige manualmente quién se elimina'},
                  {v:'ai',      label:'Decide la IA',                 sub:'La IA arbitra el desempate (requiere módulo)'},
                ].map(o=>(
                  <OptionRow key={o.v} label={o.label} sub={o.sub}
                    active={tmpl.elimTieRule===o.v}
                    onClick={()=>{snd('tap');upd('elimTieRule',o.v);}}
                    color="var(--gold)"/>
                ))}
              </div>

              {/* ══ D: ¿Qué le pasa al eliminado? ══ */}
              <div style={{
                background:'rgba(155,93,229,.04)',border:'1px solid rgba(155,93,229,.18)',
                borderRadius:14,padding:'14px 14px 8px',marginBottom:14
              }}>
                <div style={{fontFamily:'var(--font-display)',fontSize:'.85rem',letterSpacing:2,color:'var(--purple)',marginBottom:10}}>
                  👻 ¿QUÉ PASA CON EL JUGADOR ELIMINADO?
                </div>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(255,255,255,.4)',marginBottom:10}}>
                  Cómo continúa (o no) el jugador después de ser eliminado.
                </div>

                {[
                  {v:'out',         label:'Sale de la partida',        sub:'El jugador queda completamente fuera — no participa más'},
                  {v:'spectator',   label:'Pasa a espectador',         sub:'Sigue viendo la partida en modo solo lectura'},
                  {v:'keep_score',  label:'Mantiene score histórico',  sub:'Sale pero su puntaje queda registrado para las estadísticas finales'},
                  {v:'partial',     label:'Sigue parcialmente',        sub:'Permanece en la partida con capacidades limitadas (ej: solo observa sin votar)'},
                ].map(o=>(
                  <OptionRow key={o.v} label={o.label} sub={o.sub}
                    active={tmpl.elimAftermath===o.v}
                    onClick={()=>{snd('tap');upd('elimAftermath',o.v);}}
                    color="var(--purple)"/>
                ))}

                {/* Integración con Strike */}
                {(tmpl.victoryMode==='elimination' || tmpl.elimMethod==='last_place') && (
                  <div style={{
                    marginTop:10,
                    background:'rgba(255,107,53,.08)',border:'1px solid rgba(255,107,53,.25)',
                    borderRadius:10,padding:'10px 12px'
                  }}>
                    <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'var(--orange)',letterSpacing:1,marginBottom:4}}>
                      🎳 MODO STRIKE
                    </div>
                    <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(255,255,255,.45)',lineHeight:1.5}}>
                      Esta configuración es compatible con el modo Strike. Al crear una partida desde este template, el runtime usará el motor de supervivencia con auto-eliminación por jugador.
                    </div>
                  </div>
                )}
              </div>

              {/* Resumen visual de la config de eliminación */}
              <div style={{
                background:'rgba(255,59,92,.05)',border:'1px solid rgba(255,59,92,.2)',
                borderRadius:12,padding:'12px 14px',marginTop:4
              }}>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,59,92,.7)',letterSpacing:2,marginBottom:8}}>
                  RESUMEN — ELIMINACIÓN
                </div>
                {[
                  {label:'Inicia', val:{round_1:'Ronda 1',round_2:'Ronda 2',round_3:'Ronda 3',round_n:`Ronda ${tmpl.elimStartRound}`}[tmpl.elimStartsAt]},
                  {label:'Método', val:{last_place:'Último lugar',lowest_score:'Menor puntaje',zero_lives:'0 vidas',special_condition:'Condición especial',manual:'Manual'}[tmpl.elimMethod]},
                  {label:'Empate', val:{nobody:'Nadie sale',all:'Todos salen',tool:'Herramienta',host:'Host decide',ai:'IA arbitra'}[tmpl.elimTieRule]},
                  {label:'Después', val:{out:'Sale de la partida',spectator:'Espectador',keep_score:'Mantiene score',partial:'Sigue parcial'}[tmpl.elimAftermath]},
                ].map((r,i)=>(
                  <div key={i} style={{display:'flex',gap:8,alignItems:'center',marginBottom:4}}>
                    <span style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.3)',letterSpacing:1,minWidth:50}}>{r.label}:</span>
                    <span style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.65)',letterSpacing:.5}}>{r.val}</span>
                  </div>
                ))}
              </div>

            </>)}

          </div>
        )}

        {/* ── PASO 7: HERRAMIENTAS INTEGRADAS ── */}
        {(sectionMode ? openSection===7 : step===7) && (
          <div className="anim-fade">

            {/* Título */}
            <div style={{textAlign:'center',background:'linear-gradient(135deg,rgba(155,93,229,.08),rgba(0,245,255,.04))',border:'1px solid rgba(155,93,229,.2)',borderRadius:14,padding:'14px 16px',marginBottom:20}}>
              <div style={{fontSize:'2rem',marginBottom:6}}>🧰</div>
              <div style={{fontFamily:'var(--font-display)',fontSize:'1.2rem',letterSpacing:2,color:'var(--purple)'}}>HERRAMIENTAS INTEGRADAS</div>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)',letterSpacing:2,marginTop:4}}>COMPLEMENTO OPCIONAL · NO ENTORPECEN EL JUEGO FÍSICO</div>
            </div>

            {/* Nota filosófica */}
            <div style={{background:'rgba(0,245,255,.05)',border:'1px solid rgba(0,245,255,.15)',borderRadius:12,padding:'12px 14px',marginBottom:16}}>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(255,255,255,.55)',lineHeight:1.6}}>
                💡 <strong style={{color:'var(--cyan)'}}>Las herramientas son complemento.</strong> Puedes tenerlas físicas y no activarlas aquí, o activarlas para que formen parte formal del marcador. El jugador decide si las usa — no son obligatorias.
              </div>
            </div>

            <OptionRow label="No — solo herramientas físicas" sub="Los jugadores usan sus propias herramientas, la app solo lleva el marcador"
              active={!tmpl.useTools} onClick={()=>{snd('tap');upd('useTools',false);}} color="var(--green)"/>
            <OptionRow label="Sí — herramientas disponibles en la app" sub="Se habilitan en el menú durante la partida para quien las quiera usar"
              active={tmpl.useTools} onClick={()=>{snd('tap');upd('useTools',true);}} color="var(--purple)"/>

            {tmpl.useTools && (<>

              {/* Formal vs informal */}
              <div style={{background:'rgba(155,93,229,.04)',border:'1px solid rgba(155,93,229,.18)',borderRadius:14,padding:'14px 14px 8px',marginBottom:14,marginTop:8}}>
                <div style={{fontFamily:'var(--font-display)',fontSize:'.85rem',letterSpacing:2,color:'var(--purple)',marginBottom:10}}>🎭 ¿PARTE FORMAL O COMPLEMENTO LIBRE?</div>
                <OptionRow label="Complemento libre / informal" sub="Disponibles pero no afectan el marcador oficial — el jugador las usa cuando quiere"
                  active={tmpl.toolsMode==='informal'} onClick={()=>{snd('tap');upd('toolsMode','informal');upd('toolsAffect',[]);}} color="var(--cyan)"/>
                <OptionRow label="Parte formal de la partida" sub="Los resultados pueden afectar puntos, turnos o eventos del juego"
                  active={tmpl.toolsMode==='formal'} onClick={()=>{snd('tap');upd('toolsMode','formal');}} color="var(--purple)"/>
                {tmpl.toolsMode==='formal' && (<>
                  <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(155,93,229,.7)',letterSpacing:2,marginTop:10,marginBottom:8}}>¿QUÉ AFECTAN?</div>
                  {[
                    {id:'score',label:'Puntaje',sub:'El resultado puede sumar o restar puntos'},
                    {id:'turn',label:'Turno',sub:'Puede cambiar el orden o saltarse un turno'},
                    {id:'elimination',label:'Eliminación',sub:'Puede ser el desempate para eliminar a alguien'},
                    {id:'events',label:'Eventos',sub:'Activa eventos especiales del juego'},
                    {id:'rules',label:'Reglas',sub:'Modifica temporalmente una regla'},
                  ].map(e=>{
                    const a=tmpl.toolsAffect.includes(e.id);
                    return(
                      <div key={e.id} className="check-row" style={{borderColor:a?'rgba(155,93,229,.4)':undefined,background:a?'rgba(155,93,229,.07)':undefined,marginBottom:6}} onClick={()=>{snd('tap');toggleToolsAffect(e.id);}}>
                        <div className="check-box" style={{borderColor:a?'var(--purple)':undefined,background:a?'var(--purple)':undefined,color:a?'var(--bg)':undefined}}>{a?'✓':''}</div>
                        <div><div className="check-label">{e.label}</div><div className="check-sub">{e.sub}</div></div>
                      </div>
                    );
                  })}
                </>)}
              </div>

              {/* Registro */}
              <div style={{background:'rgba(0,245,255,.04)',border:'1px solid rgba(0,245,255,.15)',borderRadius:14,padding:'14px 14px 8px',marginBottom:14}}>
                <div style={{fontFamily:'var(--font-display)',fontSize:'.85rem',letterSpacing:2,color:'var(--cyan)',marginBottom:10}}>📝 ¿CÓMO SE REGISTRAN LOS RESULTADOS?</div>
                {[
                  {v:'no',label:'No se registran',sub:'Solo apoyo visual — nada queda en el historial'},
                  {v:'manual',label:'Manual',sub:'El host decide si el resultado se aplica'},
                  {v:'auto',label:'Automático',sub:'El resultado se aplica directamente sin confirmación'},
                  {v:'mixed',label:'Mixto',sub:'Algunas automáticas, otras requieren confirmación'},
                ].map(o=>(
                  <OptionRow key={o.v} label={o.label} sub={o.sub} active={tmpl.toolsRegistered===o.v}
                    onClick={()=>{snd('tap');upd('toolsRegistered',o.v);}} color="var(--cyan)"/>
                ))}
              </div>

              {/* Herramientas disponibles */}
              <div style={{background:'rgba(255,212,71,.04)',border:'1px solid rgba(255,212,71,.18)',borderRadius:14,padding:'14px 14px 8px',marginBottom:14}}>
                <div style={{fontFamily:'var(--font-display)',fontSize:'.85rem',letterSpacing:2,color:'var(--gold)',marginBottom:6}}>🛠 HERRAMIENTAS DISPONIBLES</div>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(255,255,255,.4)',marginBottom:12}}>Selecciona cuáles estarán en el menú durante la partida.</div>

                {[
                  {id:'coin',icon:'🪙',label:'Moneda',col:'var(--gold)'},
                  {id:'dice',icon:'🎲',label:'Dados',col:'var(--cyan)'},
                  {id:'wheel',icon:'🎡',label:'Ruleta / Spin Wheel',col:'var(--orange)'},
                  {id:'rps',icon:'✊',label:'Piedra Papel Tijera',col:'var(--purple)'},
                  {id:'counter',icon:'🔢',label:'Contador manual',col:'var(--green)'},
                  {id:'ai',icon:'🤖',label:'Juez IA',col:'rgba(255,255,255,.4)'},
                ].map(tool=>{
                  const active=tmpl.tools.includes(tool.id);
                  const isSoon=tool.id==='ai';
                  return(
                    <div key={tool.id}>
                      <div className="check-row" style={{borderColor:active?tool.col+'66':undefined,background:active?tool.col+'0D':undefined,marginBottom:active&&!isSoon?4:8,opacity:isSoon?.7:1}}
                        onClick={()=>{if(!isSoon){snd('tap');toggleTool(tool.id);}}}>
                        <div style={{fontSize:'1.5rem',width:34,textAlign:'center',flexShrink:0}}>{tool.icon}</div>
                        <div style={{flex:1}}>
                          <div className="check-label" style={{color:active?tool.col:'#fff'}}>
                            {tool.label}{isSoon&&<span style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'var(--orange)',marginLeft:8}}>★ próximamente</span>}
                          </div>
                        </div>
                        <div className="check-box" style={{borderColor:active?tool.col:undefined,background:active?tool.col:undefined,color:active?'var(--bg)':undefined}}>{active&&!isSoon?'✓':''}</div>
                      </div>

                      {active && tool.id==='coin' && (
                        <div style={{background:'rgba(255,212,71,.05)',borderRadius:10,padding:'10px 12px',marginBottom:8,marginLeft:8}}>
                          <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,212,71,.6)',letterSpacing:2,marginBottom:8}}>USO DE LA MONEDA</div>
                          {[
                            {v:'free',label:'Libre',sub:'El jugador la lanza cuando quiera'},
                            {v:'tiebreak',label:'Solo desempate',sub:'Disponible solo cuando hay empate'},
                            {v:'order',label:'Decidir orden',sub:'Para sortear quién va primero'},
                            {v:'events',label:'Obligatoria en eventos',sub:'Ciertos eventos del juego exigen lanzarla'},
                          ].map(o=>(
                            <OptionRow key={o.v} label={o.label} sub={o.sub} active={tmpl.coinUse===o.v}
                              onClick={()=>{snd('tap');upd('coinUse',o.v);}} color="var(--gold)"/>
                          ))}
                        </div>
                      )}

                      {active && tool.id==='dice' && (
                        <div style={{background:'rgba(0,245,255,.05)',borderRadius:10,padding:'10px 12px',marginBottom:8,marginLeft:8}}>
                          <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(0,245,255,.6)',letterSpacing:2,marginBottom:8}}>TIPO DE DADO</div>
                          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:8}}>
                            {['d4','d6','d8','d10','d12','d20','custom'].map(d=>(
                              <button key={d} onClick={()=>{snd('tap');upd('diceType',d);}}
                                style={{padding:'7px 12px',borderRadius:9,border:'none',cursor:'pointer',fontFamily:'var(--font-display)',fontSize:'var(--fs-sm)',
                                  background:tmpl.diceType===d?(d==='custom'?'var(--orange)':'var(--cyan)'):'rgba(255,255,255,.08)',
                                  color:tmpl.diceType===d?'var(--bg)':'rgba(255,255,255,.6)',transition:'all .15s'}}>{d}</button>
                            ))}
                          </div>
                          {tmpl.diceType==='custom' && (
                            <div style={{display:'flex',alignItems:'center',gap:10}}>
                              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-sm)',color:'rgba(255,255,255,.5)',flex:1}}>Lados:</div>
                              <select className="os-select" style={{marginBottom:0,width:90}} value={tmpl.diceCustomSides} onChange={e=>upd('diceCustomSides',parseInt(e.target.value))}>
                                {[3,4,5,6,7,8,10,12,14,16,18,20,24,30,100].map(n=><option key={n} value={n}>d{n}</option>)}
                              </select>
                            </div>
                          )}
                        </div>
                      )}

                      {active && tool.id==='wheel' && (
                        <div style={{background:'rgba(255,107,53,.05)',borderRadius:10,padding:'10px 12px',marginBottom:8,marginLeft:8}}>
                          <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,107,53,.6)',letterSpacing:2,marginBottom:8}}>SEGMENTOS DE LA RULETA</div>
                          {[
                            {v:'fixed',label:'Segmentos fijos',sub:'Los segmentos son los jugadores activos de la partida'},
                            {v:'custom',label:'Segmentos personalizados',sub:'El host define los segmentos al iniciar'},
                            {v:'weighted',label:'Pesos / probabilidades',sub:'Cada segmento tiene diferente probabilidad'},
                          ].map(o=>(
                            <OptionRow key={o.v} label={o.label} sub={o.sub} active={tmpl.wheelSegments===o.v}
                              onClick={()=>{snd('tap');upd('wheelSegments',o.v);}} color="var(--orange)"/>
                          ))}
                        </div>
                      )}

                      {active && tool.id==='rps' && (
                        <div style={{background:'rgba(155,93,229,.05)',borderRadius:10,padding:'10px 12px',marginBottom:8,marginLeft:8}}>
                          <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(155,93,229,.6)',letterSpacing:2,marginBottom:8}}>¿QUIÉNES PUEDEN JUGAR PPS?</div>
                          {[
                            {v:'any',label:'Cualquier combinación',sub:'Cualquier jugador puede retarse con otro'},
                            {v:'active_only',label:'Solo jugadores activos',sub:'Solo quienes siguen en la partida — útil en eliminación'},
                          ].map(o=>(
                            <OptionRow key={o.v} label={o.label} sub={o.sub} active={tmpl.rpsScope===o.v}
                              onClick={()=>{snd('tap');upd('rpsScope',o.v);}} color="var(--purple)"/>
                          ))}
                        </div>
                      )}

                      {active && tool.id==='counter' && (
                        <div style={{background:'rgba(0,255,157,.05)',borderRadius:10,padding:'10px 12px',marginBottom:8,marginLeft:8}}>
                          <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(0,255,157,.6)',lineHeight:1.5}}>
                            Contador de apoyo — para vida, maná, recursos u otras métricas secundarias que no van al marcador principal.
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>)}

            {/* Resumen final */}
            <div className="os-section" style={{marginTop:20}}>RESUMEN DEL JUEGO</div>
            <div style={{background:'linear-gradient(135deg,rgba(155,93,229,.08),rgba(0,245,255,.04))',border:'1px solid rgba(155,93,229,.2)',borderRadius:14,padding:'16px 15px',marginBottom:20}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                <div style={{fontSize:'2.5rem'}}>{tmpl.emoji}</div>
                <div>
                  <div style={{fontFamily:'var(--font-display)',fontSize:'1.2rem',letterSpacing:1}}>{tmpl.name}</div>
                  <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.4)',letterSpacing:1,marginTop:2}}>{tmpl.description||'Sin descripción'}</div>
                </div>
              </div>
              <div className="os-tags">
                <div className="os-tag">{tmpl.type==='teams'?`👥 ${tmpl.numTeams} equipos`:'👤 Individual'}</div>
                <div className="os-tag">{tmpl.minPlayers}-{tmpl.maxPlayers} jug.</div>
                <div className="os-tag">{tmpl.useRounds?(tmpl.rounds==='libre'?'∞ Libre':`${tmpl.rounds} rondas`):'Sin rondas'}</div>
                {tmpl.useTurns&&<div className="os-tag purple">↕️ Turnos</div>}
                {tmpl.useFirstPlayerToken&&<div className="os-tag gold">👑 Token</div>}
                {tmpl.useTimer&&<div className="os-tag orange">⏱ Timer</div>}
                <div className="os-tag gold">{tmpl.victoryMode==='points'?'🏅 Puntos':tmpl.victoryMode==='wins'?'🏆 Victorias':tmpl.victoryMode==='lives'?'❤️ Vidas':tmpl.victoryMode==='elimination'?'💀 Eliminación':tmpl.victoryMode==='objective'?'🎯 Objetivo':tmpl.victoryMode==='time'?'⏱ Tiempo':'👑 Manual'}</div>
                {tmpl.useDefeat&&<div className="os-tag red">⚠ Derrota</div>}
                {tmpl.useElimination&&<div className="os-tag red">💀 Eliminación</div>}
                {tmpl.registers.length>0&&<div className="os-tag green">📊 {tmpl.registers.length} registros</div>}
                {tmpl.modifiers.length>0&&<div className="os-tag orange">⚡ {tmpl.modifiers.length} mods</div>}
                {tmpl.useTools&&tmpl.tools.length>0&&<div className={`os-tag ${tmpl.toolsMode==='formal'?'purple':'cyan'}`}>🧰 {tmpl.tools.length} herr. {tmpl.toolsMode==='formal'?'(formal)':'(libre)'}</div>}
              </div>
              {tmpl.useTools&&tmpl.tools.length>0&&(
                <div style={{marginTop:10,paddingTop:10,borderTop:'1px solid rgba(255,255,255,.08)'}}>
                  <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(155,93,229,.6)',letterSpacing:2,marginBottom:6}}>HERRAMIENTAS</div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                    {tmpl.tools.map(t=>({coin:'🪙 Moneda',dice:`🎲 ${tmpl.diceType==='custom'?`d${tmpl.diceCustomSides}`:tmpl.diceType}`,wheel:'🎡 Ruleta',rps:'✊ PPS',counter:'🔢 Contador',ai:'🤖 IA'}[t]||t)).map((label,i)=>(
                      <div key={i} style={{padding:'3px 10px',borderRadius:20,background:'rgba(155,93,229,.1)',border:'1px solid rgba(155,93,229,.25)',fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'var(--purple)',letterSpacing:1}}>{label}</div>
                    ))}
                  </div>
                  <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.3)',letterSpacing:1,marginTop:6}}>
                    {tmpl.toolsMode==='formal'?`Formales · Afectan: ${tmpl.toolsAffect.length>0?tmpl.toolsAffect.map(e=>({score:'puntaje',turn:'turno',elimination:'eliminación',events:'eventos',rules:'reglas'}[e])).join(', '):'nada aún'}`:'Complemento libre — no afectan el marcador'}
                    {tmpl.toolsRegistered!=='no'&&` · Registro: ${tmpl.toolsRegistered}`}
                  </div>
                </div>
              )}
              {tmpl.modifiers.length>0&&(
                <div style={{marginTop:10,paddingTop:10,borderTop:'1px solid rgba(255,255,255,.08)'}}>
                  <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,107,53,.6)',letterSpacing:2,marginBottom:6}}>MODIFICADORES</div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                    {tmpl.modifiers.map(m=>({bonus:'⬆️ Bonus',penalty:'⬇️ Penalización',multiplier:'✖️ Multiplicador',steal:'🦹 Robo',shield:'🛡️ Escudo',block:'🚫 Bloqueo',double_next:'2️⃣ Doble'}[m]||m)).map((label,i)=>(
                      <div key={i} style={{padding:'3px 10px',borderRadius:20,background:'rgba(255,107,53,.1)',border:'1px solid rgba(255,107,53,.25)',fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'var(--orange)',letterSpacing:1}}>{label}</div>
                    ))}
                  </div>
                </div>
              )}
              <div style={{marginTop:10,paddingTop:10,borderTop:'1px solid rgba(255,255,255,.08)'}}>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(0,255,157,.5)',letterSpacing:2,marginBottom:4}}>SISTEMA DE REGISTRO</div>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(255,255,255,.4)',lineHeight:1.6}}>
                  Captura: <strong>{({manual:'manual',auto:'automática',tool:'con herramienta',camera:'por cámara 📷',ai:'con IA 🤖',mixed:'mixta'})[tmpl.captureType]}</strong>
                  {' · '}Valores: <strong>{({positive:'solo positivos',both:'pos. y neg.',integers:'enteros',decimals:'decimales'})[tmpl.valueNature]}</strong>
                  {' · '}Acumulación: <strong>{({global:'global',per_round:'por ronda',reset:'reinicia c/ronda',always_keep:'siempre conserva'})[tmpl.accumulation]}</strong>
                  {' · '}Visible: <strong>{({all:'todos',host:'solo host',player:'c/jugador',hidden_round_end:'oculto/ronda'})[tmpl.scoreVisibility]}</strong>
                </div>
              </div>
            </div>

            {saveError&&<div className="os-alert alert-red" style={{marginBottom:8,fontSize:'var(--fs-micro)'}}>{saveError}</div>}
            <button className="btn btn-purple" disabled={saving} onClick={handleSave}>
              {saving?'⏳ Guardando...':saved?'✅ ¡Guardado!':saveError?'🔄 Reintentar':`💾 Guardar "${tmpl.name}"`}
            </button>
          </div>
        )}

        {/* ── PASO 8: ROLES, VISIBILIDAD Y PERMISOS ── */}
        {(sectionMode ? openSection===8 : step===8) && (
          <div className="anim-fade">

            {/* Título */}
            <div style={{textAlign:'center',background:'linear-gradient(135deg,rgba(74,144,255,.08),rgba(0,245,255,.04))',border:'1px solid rgba(74,144,255,.2)',borderRadius:14,padding:'14px 16px',marginBottom:20}}>
              <div style={{fontSize:'2rem',marginBottom:6}}>👥</div>
              <div style={{fontFamily:'var(--font-display)',fontSize:'1.2rem',letterSpacing:2,color:'var(--blue)'}}>ROLES Y PERMISOS</div>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)',letterSpacing:2,marginTop:4}}>¿QUIÉN PUEDE HACER QUÉ?</div>
            </div>

            {/* ══ A: Roles activos ══ */}
            <div style={{background:'rgba(74,144,255,.04)',border:'1px solid rgba(74,144,255,.18)',borderRadius:14,padding:'14px 14px 8px',marginBottom:14}}>
              <div style={{fontFamily:'var(--font-display)',fontSize:'.85rem',letterSpacing:2,color:'var(--blue)',marginBottom:10}}>🎭 ROLES ACTIVOS EN LA PARTIDA</div>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(255,255,255,.4)',marginBottom:10}}>
                Selecciona los roles que pueden existir. Host y Jugador siempre están activos.
              </div>
              {[
                {id:'host',     icon:'👑', label:'Host',       sub:'Controla el flujo de la partida — siempre presente', locked:true},
                {id:'player',   icon:'🎮', label:'Jugador',    sub:'Participa activamente en la partida — siempre presente', locked:true},
                {id:'spectator',icon:'👁', label:'Espectador', sub:'Solo puede ver — no participa ni anota'},
                {id:'judge',    icon:'⚖️', label:'Juez',       sub:'Árbitro neutral — puede resolver disputas y corregir errores'},
                {id:'recorder', icon:'📝', label:'Anotador',   sub:'Solo puede registrar puntos — no toma decisiones de juego'},
              ].map(r=>{
                const active=r.locked||tmpl.roles.includes(r.id);
                return(
                  <div key={r.id} className="check-row"
                    style={{borderColor:active?'rgba(74,144,255,.4)':undefined,background:active?'rgba(74,144,255,.07)':undefined,marginBottom:6,opacity:r.locked?.8:1}}
                    onClick={()=>{if(!r.locked){snd('tap');toggleRole(r.id);}}}>
                    <div style={{fontSize:'1.4rem',width:34,textAlign:'center',flexShrink:0}}>{r.icon}</div>
                    <div style={{flex:1}}>
                      <div className="check-label" style={{color:active?'var(--blue)':'#fff'}}>
                        {r.label}{r.locked&&<span style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(0,245,255,.5)',marginLeft:8}}>siempre</span>}
                      </div>
                      <div className="check-sub">{r.sub}</div>
                    </div>
                    <div className="check-box" style={{borderColor:active?'var(--blue)':undefined,background:active?'var(--blue)':undefined,color:active?'#fff':undefined}}>{active?'✓':''}</div>
                  </div>
                );
              })}
            </div>

            {/* ══ B: Permisos de acción ══ */}
            <div style={{background:'rgba(0,245,255,.04)',border:'1px solid rgba(0,245,255,.15)',borderRadius:14,padding:'14px 14px 8px',marginBottom:14}}>
              <div style={{fontFamily:'var(--font-display)',fontSize:'.85rem',letterSpacing:2,color:'var(--cyan)',marginBottom:10}}>⚙️ PERMISOS DE ACCIÓN</div>
              {[
                {
                  label:'¿Quién captura puntajes?',
                  field:'scoreCapture',
                  opts:[
                    {v:'host',    label:'Solo el host',          sub:'El host registra todos los puntajes'},
                    {v:'self',    label:'Cada jugador el suyo',  sub:'Cada quien captura sus propios puntos'},
                    {v:'all',     label:'Todos pueden',          sub:'Cualquiera puede capturar puntos de cualquier jugador'},
                    {v:'judge',   label:'Juez / Anotador',       sub:'Solo el rol de juez o anotador registra'},
                  ]
                },
                {
                  label:'¿Quién usa las herramientas?',
                  field:'toolsWho',
                  opts:[
                    {v:'all',    label:'Todos pueden usarlas', sub:'Cualquier jugador accede al menú de herramientas'},
                    {v:'host',   label:'Solo el host',          sub:'El host controla cuándo se usa una herramienta'},
                    {v:'player', label:'Solo los jugadores',   sub:'El host no necesita usarlas'},
                    {v:'judge',  label:'Solo el juez',         sub:'El árbitro decide cuándo se usa una herramienta'},
                  ]
                },
                {
                  label:'¿Quién cierra la ronda?',
                  field:'roundCloseWho',
                  opts:[
                    {v:'host',  label:'Solo el host',       sub:'El host determina cuándo termina la ronda'},
                    {v:'all',   label:'Cualquier jugador',  sub:'Cualquier participante puede cerrar la ronda'},
                    {v:'judge', label:'El juez',            sub:'El árbitro da la señal de cierre'},
                  ]
                },
                {
                  label:'¿Quién puede pausar?',
                  field:'pauseWho',
                  opts:[
                    {v:'host',  label:'Solo el host',          sub:'Solo el host puede pausar la partida'},
                    {v:'all',   label:'Cualquier jugador',     sub:'Cualquier participante puede solicitar pausa'},
                  ]
                },
                {
                  label:'¿Quién puede corregir errores?',
                  field:'errorWho',
                  opts:[
                    {v:'host',  label:'Solo el host',          sub:'El host tiene autoridad para editar registros'},
                    {v:'judge', label:'El juez',               sub:'El árbitro es quien valida y corrige'},
                    {v:'all',   label:'Cualquier jugador',     sub:'Todos pueden proponer correcciones'},
                  ]
                },
              ].map(section=>(
                <div key={section.field} style={{marginBottom:14}}>
                  <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(0,245,255,.6)',letterSpacing:2,marginBottom:8,textTransform:'uppercase'}}>{section.label}</div>
                  {section.opts.map(o=>(
                    <OptionRow key={o.v} label={o.label} sub={o.sub}
                      active={tmpl[section.field]===o.v}
                      onClick={()=>{snd('tap');upd(section.field,o.v);}}
                      color="var(--cyan)"/>
                  ))}
                </div>
              ))}
            </div>

            {/* ══ C: Visibilidad por rol ══ */}
            <div style={{background:'rgba(155,93,229,.04)',border:'1px solid rgba(155,93,229,.18)',borderRadius:14,padding:'14px 14px 8px',marginBottom:14}}>
              <div style={{fontFamily:'var(--font-display)',fontSize:'.85rem',letterSpacing:2,color:'var(--purple)',marginBottom:10}}>👁 ¿QUÉ VE CADA ROL?</div>
              {[
                {
                  label:'Host ve',field:'visHost',
                  opts:[
                    {v:'all',        label:'Todo — marcador completo y controles', sub:'Visión total de la partida'},
                    {v:'partial',    label:'Todo excepto ciertos datos',           sub:'Puede haber información oculta incluso para el host'},
                    {v:'score_only', label:'Solo el marcador',                     sub:'El host actúa sin ver otros detalles'},
                  ]
                },
                {
                  label:'Jugador ve',field:'visPlayer',
                  opts:[
                    {v:'all',      label:'Todos ven todo',             sub:'Marcador público y completo para todos'},
                    {v:'partial',  label:'Ven parcialmente',           sub:'Ven el marcador pero no todos los controles'},
                    {v:'own_only', label:'Solo sus propios datos',     sub:'Cada quien solo ve su propio puntaje'},
                  ]
                },
                {
                  label:'Espectador ve',field:'visSpectator',
                  opts:[
                    {v:'score', label:'Solo el marcador en vivo', sub:'Ve posiciones y puntos pero no los controles'},
                    {v:'all',   label:'Todo (misma vista que jugadores)', sub:'Acceso completo en modo solo lectura'},
                    {v:'none',  label:'Nada — partida privada',      sub:'Los espectadores no pueden ver nada'},
                  ]
                },
              ].map(section=>(
                <div key={section.field} style={{marginBottom:14}}>
                  <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(155,93,229,.6)',letterSpacing:2,marginBottom:8,textTransform:'uppercase'}}>{section.label}</div>
                  {section.opts.map(o=>(
                    <OptionRow key={o.v} label={o.label} sub={o.sub}
                      active={tmpl[section.field]===o.v}
                      onClick={()=>{snd('tap');upd(section.field,o.v);}}
                      color="var(--purple)"/>
                  ))}
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ── PASO 9: FINALIZACIÓN ── */}
        {(sectionMode ? openSection===9 : step===9) && (
          <div className="anim-fade">

            {/* Título */}
            <div style={{textAlign:'center',background:'linear-gradient(135deg,rgba(0,255,157,.07),rgba(255,212,71,.04))',border:'1px solid rgba(0,255,157,.2)',borderRadius:14,padding:'14px 16px',marginBottom:20}}>
              <div style={{fontSize:'2rem',marginBottom:6}}>🏁</div>
              <div style={{fontFamily:'var(--font-display)',fontSize:'1.2rem',letterSpacing:2,color:'var(--green)'}}>FINALIZACIÓN</div>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)',letterSpacing:2,marginTop:4}}>¿CÓMO TERMINA LA PARTIDA?</div>
            </div>

            {/* ══ A: Condiciones de fin ══ */}
            <div style={{background:'rgba(0,255,157,.04)',border:'1px solid rgba(0,255,157,.18)',borderRadius:14,padding:'14px 14px 8px',marginBottom:14}}>
              <div style={{fontFamily:'var(--font-display)',fontSize:'.85rem',letterSpacing:2,color:'var(--green)',marginBottom:10}}>🎯 ¿CÓMO TERMINA LA PARTIDA?</div>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(255,255,255,.4)',marginBottom:10}}>Selecciona todas las formas en que puede terminar. Pueden coexistir varias.</div>
              {[
                {id:'victory',   icon:'🏆', label:'Condición de victoria',  sub:'Un jugador cumple la condición configurada en el Paso 3'},
                {id:'rounds_done',icon:'🔄',label:'Fin de rondas',           sub:'Se completan todas las rondas configuradas'},
                {id:'time_up',   icon:'⏱', label:'Tiempo agotado',          sub:'El temporizador total de la partida llega a 0'},
                {id:'last_elim', icon:'💀', label:'Eliminación final',       sub:'Solo queda un jugador activo'},
                {id:'manual',    icon:'✋', label:'Cierre manual',           sub:'El host decide cuándo terminar la partida'},
              ].map(c=>{
                const active=tmpl.endConditions.includes(c.id);
                return(
                  <div key={c.id} className="check-row"
                    style={{borderColor:active?'rgba(0,255,157,.4)':undefined,background:active?'rgba(0,255,157,.07)':undefined,marginBottom:6}}
                    onClick={()=>{snd('tap');toggleEndCond(c.id);}}>
                    <div style={{fontSize:'1.4rem',width:34,textAlign:'center',flexShrink:0}}>{c.icon}</div>
                    <div style={{flex:1}}>
                      <div className="check-label" style={{color:active?'var(--green)':'#fff'}}>{c.label}</div>
                      <div className="check-sub">{c.sub}</div>
                    </div>
                    <div className="check-box" style={{borderColor:active?'var(--green)':undefined,background:active?'var(--green)':undefined,color:active?'var(--bg)':undefined}}>{active?'✓':''}</div>
                  </div>
                );
              })}
            </div>

            {/* ══ B: Pantalla final e historial ══ */}
            <div style={{background:'rgba(255,212,71,.04)',border:'1px solid rgba(255,212,71,.18)',borderRadius:14,padding:'14px 14px 8px',marginBottom:14}}>
              <div style={{fontFamily:'var(--font-display)',fontSize:'.85rem',letterSpacing:2,color:'var(--gold)',marginBottom:10}}>🖥 PANTALLA FINAL E HISTORIAL</div>

              {[
                {field:'showEndScreen',label:'¿Hay pantalla final?',sub:'Mostrar pantalla de resultados animada al terminar'},
                {field:'saveHistory',  label:'¿Se guarda historial?',sub:'Los resultados quedan guardados en las estadísticas globales'},
              ].map(opt=>(
                <div key={opt.field} className={`check-row ${tmpl[opt.field]?'active':''}`}
                  style={{borderColor:tmpl[opt.field]?'rgba(255,212,71,.4)':undefined,background:tmpl[opt.field]?'rgba(255,212,71,.08)':undefined,marginBottom:8}}
                  onClick={()=>{snd('tap');upd(opt.field,!tmpl[opt.field]);}}>
                  <div className="check-box" style={{borderColor:tmpl[opt.field]?'var(--gold)':undefined,background:tmpl[opt.field]?'var(--gold)':undefined,color:tmpl[opt.field]?'var(--bg)':undefined}}>{tmpl[opt.field]?'✓':''}</div>
                  <div><div className="check-label">{opt.label}</div><div className="check-sub">{opt.sub}</div></div>
                </div>
              ))}

              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,212,71,.6)',letterSpacing:2,marginTop:10,marginBottom:8}}>¿SE EXPORTA EL RESULTADO?</div>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(255,255,255,.4)',marginBottom:10}}>Formatos disponibles al terminar la partida.</div>
              {[
                {id:'json',   icon:'📦', label:'JSON',           sub:'Datos estructurados para integraciones'},
                {id:'csv',    icon:'📊', label:'CSV',            sub:'Tabla de resultados en formato hoja de cálculo'},
                {id:'image',  icon:'🖼', label:'Imagen resumen', sub:'Captura visual del marcador final'},
                {id:'report', icon:'📋', label:'Reporte',        sub:'Resumen detallado con estadísticas de la partida'},
              ].map(f=>{
                const active=tmpl.exportFormat.includes(f.id);
                return(
                  <div key={f.id} className="check-row"
                    style={{borderColor:active?'rgba(255,212,71,.4)':undefined,background:active?'rgba(255,212,71,.07)':undefined,marginBottom:6}}
                    onClick={()=>{snd('tap');toggleExport(f.id);}}>
                    <div style={{fontSize:'1.3rem',width:34,textAlign:'center',flexShrink:0}}>{f.icon}</div>
                    <div style={{flex:1}}>
                      <div className="check-label" style={{color:active?'var(--gold)':'#fff'}}>{f.label}</div>
                      <div className="check-sub">{f.sub}</div>
                    </div>
                    <div className="check-box" style={{borderColor:active?'var(--gold)':undefined,background:active?'var(--gold)':undefined,color:active?'var(--bg)':undefined}}>{active?'✓':''}</div>
                  </div>
                );
              })}
            </div>

            {/* ══ C: Revancha ══ */}
            <div style={{background:'rgba(255,107,53,.04)',border:'1px solid rgba(255,107,53,.18)',borderRadius:14,padding:'14px 14px 8px',marginBottom:14}}>
              <div style={{fontFamily:'var(--font-display)',fontSize:'.85rem',letterSpacing:2,color:'var(--orange)',marginBottom:10}}>🔁 ¿HAY REVANCHA?</div>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(255,255,255,.4)',marginBottom:10}}>Configura qué se conserva y qué se reinicia al jugar de nuevo.</div>

              {[
                {field:'rematchKeepPlayers', label:'Mantener jugadores',       sub:'Los mismos jugadores en la nueva partida'},
                {field:'rematchKeepRoom',    label:'Mantener sala',            sub:'Se usa el mismo código de sala'},
                {field:'rematchKeepConfig',  label:'Mantener configuración',   sub:'Mismas reglas y modo de juego'},
                {field:'rematchResetScore',  label:'Reiniciar score',          sub:'Todos los puntajes vuelven a 0'},
                {field:'rematchResetAll',    label:'Reiniciar todo',           sub:'Como si fuera una partida completamente nueva'},
              ].map(opt=>{
                const active=tmpl[opt.field];
                return(
                  <div key={opt.field} className="check-row"
                    style={{borderColor:active?'rgba(255,107,53,.4)':undefined,background:active?'rgba(255,107,53,.07)':undefined,marginBottom:6}}
                    onClick={()=>{
                      snd('tap');
                      // Si activa "reiniciar todo", desactiva los individuales
                      if(opt.field==='rematchResetAll'&&!active){
                        setTmpl(prev=>({...prev,rematchResetAll:true,rematchKeepPlayers:false,rematchKeepRoom:false,rematchKeepConfig:false,rematchResetScore:true}));
                      } else if(opt.field!=='rematchResetAll'){
                        if(opt.field==='rematchResetScore'||opt.field==='rematchKeepPlayers'||opt.field==='rematchKeepRoom'||opt.field==='rematchKeepConfig'){
                          upd('rematchResetAll',false);
                        }
                        upd(opt.field,!active);
                      } else {
                        upd(opt.field,!active);
                      }
                    }}>
                    <div className="check-box" style={{borderColor:active?'var(--orange)':undefined,background:active?'var(--orange)':undefined,color:active?'#fff':undefined}}>{active?'✓':''}</div>
                    <div><div className="check-label" style={{color:active?'var(--orange)':'#fff'}}>{opt.label}</div><div className="check-sub">{opt.sub}</div></div>
                  </div>
                );
              })}
            </div>

            {/* Resumen final completo */}
            <div className="os-section" style={{marginTop:8}}>RESUMEN COMPLETO DEL JUEGO</div>
            <div style={{background:'linear-gradient(135deg,rgba(0,255,157,.06),rgba(155,93,229,.04))',border:'1px solid rgba(0,255,157,.2)',borderRadius:14,padding:'16px 15px',marginBottom:20}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                <div style={{fontSize:'2.5rem'}}>{tmpl.emoji}</div>
                <div>
                  <div style={{fontFamily:'var(--font-display)',fontSize:'1.2rem',letterSpacing:1,color:'#fff'}}>{tmpl.name}</div>
                  <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.4)',letterSpacing:1,marginTop:2}}>{tmpl.description||'Sin descripción'}</div>
                </div>
              </div>

              {/* Tags resumen */}
              <div className="os-tags" style={{marginBottom:14}}>
                <div className="os-tag">{tmpl.type==='teams'?`👥 ${tmpl.numTeams} eq.`:'👤 Individual'}</div>
                <div className="os-tag">{tmpl.minPlayers}-{tmpl.maxPlayers} jug.</div>
                <div className="os-tag">{tmpl.useRounds?(tmpl.rounds==='libre'?'∞ rondas':`${tmpl.rounds} rondas`):'Sin rondas'}</div>
                {tmpl.useTurns&&<div className="os-tag purple">↕️ Turnos</div>}
                {tmpl.useFirstPlayerToken&&<div className="os-tag gold">👑</div>}
                {tmpl.useTimer&&<div className="os-tag orange">⏱</div>}
                <div className="os-tag gold">{tmpl.victoryMode==='points'?'🏅':tmpl.victoryMode==='wins'?'🏆':tmpl.victoryMode==='lives'?'❤️':tmpl.victoryMode==='elimination'?'💀':tmpl.victoryMode==='objective'?'🎯':tmpl.victoryMode==='time'?'⏱':'👑'} {tmpl.victoryMode}</div>
                {tmpl.useDefeat&&<div className="os-tag red">⚠ Derrota</div>}
                {tmpl.useElimination&&<div className="os-tag red">💀 Elim.</div>}
                {tmpl.registers.length>0&&<div className="os-tag green">📊 {tmpl.registers.length} reg.</div>}
                {tmpl.modifiers.length>0&&<div className="os-tag orange">⚡ {tmpl.modifiers.length} mods</div>}
                {tmpl.useTools&&tmpl.tools.length>0&&<div className="os-tag purple">🧰 {tmpl.tools.length}</div>}
                {tmpl.roles.filter(r=>!['host','player'].includes(r)).length>0&&<div className="os-tag cyan">👥 +{tmpl.roles.filter(r=>!['host','player'].includes(r)).length} roles</div>}
              </div>

              {/* Secciones en lista compacta */}
              {[
                {icon:'🏗️', label:'Estructura', val:`${tmpl.useRounds?(tmpl.rounds==='libre'?'∞ rondas':`${tmpl.rounds} rondas`):'Continua'} · Cierre: ${({manual:'manual',timer:'timer',all_done:'auto'})[tmpl.roundClose]} · Reset: ${({nothing:'nada',round_points:'pts',turns:'turnos',temp_tools:'herr.'})[tmpl.roundReset]}`},
                {icon:'⏱', label:'Turnos/Timer', val:`Turnos: ${tmpl.useTurns?({fixed:'fijos',random:'aleatorios',rotating:'rotativos',by_score:'por puntaje'})[tmpl.turnOrder]:'No'} · Timer: ${tmpl.useTimer?`${tmpl.timerSecs}s/${tmpl.timerScope}`:'Off'}`},
                {icon:'🏆', label:'Victoria', val:`${({points:'Puntos',wins:'Victorias',lives:'Vidas',elimination:'Eliminación',objective:'Objetivo',time:'Tiempo',manual:'Manual'})[tmpl.victoryMode]} · Desempate: ${({share:'compartir',tool:'herramienta',host:'host'})[tmpl.tiebreak]}`},
                tmpl.useDefeat&&{icon:'💀', label:'Derrota', val:`${({points:'Puntos',wins:'Victorias',lives:'Vidas',elimination:'Eliminación',time:'Tiempo',objective:'Objetivo fallido',external:'Evento externo'})[tmpl.defeatType]} · ${({eliminated:'eliminado',spectator:'espectador',lose_turn:'pierde turno',lose_points:'pierde pts',temp_penalty:'penalización',weakened:'debilitado',log_only:'registro'})[tmpl.defeatConsequence]}`},
                tmpl.useElimination&&{icon:'⚔️', label:'Eliminación', val:`Desde ${({round_1:'R1',round_2:'R2',round_3:'R3',round_n:`R${tmpl.elimStartRound}`})[tmpl.elimStartsAt]} · ${({last_place:'último lugar',lowest_score:'menor pts',zero_lives:'0 vidas',special_condition:'condición esp.',manual:'manual'})[tmpl.elimMethod]} · Después: ${({out:'sale',spectator:'espectador',keep_score:'mantiene score',partial:'parcial'})[tmpl.elimAftermath]}`},
                {icon:'📊', label:'Progreso', val:`${tmpl.registers.map(r=>({points:'Pts',wins:'Vict',lives:'Vidas',resources:'Rec',coins:'Mon',objectives:'Obj',custom:tmpl.customCounterName||'Custom'}[r])).join('+')} · ${({manual:'manual',auto:'auto',tool:'herr.',camera:'cámara',ai:'IA',mixed:'mixto'})[tmpl.captureType]} · ${({global:'global',per_round:'c/ronda',reset:'reinicia',always_keep:'siempre'})[tmpl.accumulation]}`},
                {icon:'👥', label:'Roles', val:`Cap: ${({host:'host',self:'c/jugador',all:'todos',judge:'juez'})[tmpl.scoreCapture]} · Cierre ronda: ${({host:'host',all:'todos',judge:'juez'})[tmpl.roundCloseWho]} · Jugador ve: ${({all:'todo',partial:'parcial',own_only:'solo suyo'})[tmpl.visPlayer]}`},
                {icon:'🏁', label:'Fin', val:`${tmpl.endConditions.map(c=>({victory:'Victoria',rounds_done:'Rondas',time_up:'Tiempo',last_elim:'Elim.',manual:'Manual'}[c])).join('+')} · ${tmpl.showEndScreen?'Pantalla final':'Sin pantalla'} · ${tmpl.saveHistory?'Guarda historial':'Sin historial'}`},
                tmpl.exportFormat.length>0&&{icon:'📤', label:'Exporta', val:tmpl.exportFormat.join(', ').toUpperCase()},
                {icon:'🔁', label:'Revancha', val:`${[tmpl.rematchKeepPlayers&&'jugadores',tmpl.rematchKeepRoom&&'sala',tmpl.rematchKeepConfig&&'config',tmpl.rematchResetScore&&'reset score'].filter(Boolean).join(' · ')||'Todo nuevo'}`},
              ].filter(Boolean).map((row,i)=>(
                <div key={i} style={{display:'flex',gap:8,alignItems:'flex-start',marginBottom:6,paddingBottom:6,borderBottom:'1px solid rgba(255,255,255,.05)'}}>
                  <span style={{fontSize:'.95rem',flexShrink:0,width:20}}>{row.icon}</span>
                  <span style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.3)',letterSpacing:1,flexShrink:0,minWidth:60}}>{row.label}:</span>
                  <span style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.55)',letterSpacing:.5,lineHeight:1.4}}>{row.val}</span>
                </div>
              ))}
            </div>

            {saveError&&<div className="os-alert alert-red" style={{marginBottom:8,fontSize:'var(--fs-micro)'}}>{saveError}</div>}
            <button className="btn btn-purple" disabled={saving} onClick={handleSave}>
              {saving?'⏳ Guardando...':saved?'✅ ¡Guardado!':saveError?'🔄 Reintentar':`💾 Guardar "${tmpl.name}"`}
            </button>
          </div>
        )}

        {/* Navegación */}
        <div className="g16"/>
        {!sectionMode && step < TOTAL_STEPS && (
          <button className="btn btn-cyan" disabled={!canNext}
            onClick={()=>{snd('tap');setStep(step+1);}}>
            Siguiente → {stepTitles[step]}
          </button>
        )}
        {sectionMode && (
          <div style={{display:'flex',gap:8}}>
            {openSection>1&&<button className="btn btn-ghost" style={{flex:.5}} onClick={()=>{snd('tap');setOpenSection(s=>s-1);}}>← Anterior</button>}
            {openSection<TOTAL_STEPS&&<button className="btn btn-cyan" style={{flex:1}} onClick={()=>{snd('tap');setOpenSection(s=>s+1);}}>Siguiente →</button>}
          </div>
        )}
        {!sectionMode && (
          <button className="btn btn-ghost" onClick={()=>step>1?setStep(step-1):onBack()}>
            {step>1?'← Atrás':'← Cancelar'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── AUTH GATE — wrapper para proteger Game Builder ───────────────
function AuthGate({ onAuthChange, children }){
  const [user, setUser] = React.useState(undefined); // undefined=cargando

  React.useEffect(()=>{
    const unsub = authOnChange(u=>{ setUser(u||null); onAuthChange(u||null); });
    return ()=>unsub();
  },[]);

  if(user===undefined) return(
    <div className="os-wrap">
      <div className="os-page" style={{paddingTop:80,textAlign:'center'}}>
        <div className="os-spin" style={{marginBottom:16}}/>
        <div style={{fontFamily:'var(--font-label)',color:'rgba(255,255,255,.35)',letterSpacing:2}}>VERIFICANDO...</div>
      </div>
    </div>
  );

  return children(user);
}
