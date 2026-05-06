// ═══════════════════════════════════════════════════════════════
// runtime.jsx — BOARDGAMEZ OS v1.5
// Motor universal: lee el spec del config-interpreter y genera
// la UI correcta. El usuario solo ve botones.
// ═══════════════════════════════════════════════════════════════

// ── NUMERIC MODAL — redesigned ────────────────────────────────────
if(window._splashStep) window._splashStep(5);
function NumericModal({ action, player, onConfirm, onCancel }) {
  const [value, setValue] = React.useState(0);
  const [condition, setCondition] = React.useState('');
  const allowNeg = action.allowNegative;

  const positiveQuick = (action.quickValues||[]).filter(v=>v>0);
  const negativeQuick = (action.quickValues||[]).filter(v=>v<0);

  function handleConfirm() {
    if(value===0) return;
    snd('score');
    onConfirm({ value, condition: condition || null });
  }

  function step(delta) {
    snd('tap');
    setValue(v => {
      const next = v + delta;
      if(!allowNeg && next < 0) return 0;
      return next;
    });
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div className="anim-pop" style={{
        background: '#0D0D1C', border: `1px solid ${action.color}44`,
        borderRadius: 20, padding: '24px 20px', width: '100%', maxWidth: 340,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ fontSize: '1.8rem' }}>{action.icon}</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: 1, color: action.color }}>
              {action.label}
            </div>
            <div style={{ fontFamily: 'var(--font-label)', fontSize: 'var(--fs-micro)', color: 'rgba(255,255,255,.4)', letterSpacing: 1, marginTop: 2 }}>
              {player.emoji} {player.name}
            </div>
          </div>
        </div>

        {/* Valores rápidos positivos */}
        {positiveQuick.length > 0 && (
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
            {positiveQuick.map(v => (
              <button key={v} onClick={() => { snd('tap'); setValue(v); }}
                style={{
                  flex:1, padding:'9px 6px', borderRadius:10, border:'none', cursor:'pointer',
                  fontFamily:'var(--font-display)', fontSize:'var(--fs-sm)',
                  background: value===v ? action.color : 'rgba(255,255,255,.08)',
                  color: value===v ? 'var(--bg)' : 'rgba(255,255,255,.8)',
                  transition:'all .15s',
                }}>
                +{v}
              </button>
            ))}
          </div>
        )}

        {/* Valor con stepper */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          <button onClick={() => step(-1)}
            style={{
              width:48, height:56, borderRadius:12, border:'1px solid rgba(255,255,255,.15)',
              background:'rgba(255,255,255,.06)', color:'rgba(255,255,255,.8)',
              cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'1.6rem',
              flexShrink:0,
            }}>−</button>
          <div style={{
            flex:1, textAlign:'center', fontFamily:'var(--font-display)',
            fontSize:'2.4rem', color: value!==0 ? action.color : 'rgba(255,255,255,.25)',
            borderBottom:'2px solid '+(value!==0?action.color:'rgba(255,255,255,.1)'),
            paddingBottom:4, transition:'all .2s',
          }}>
            {value > 0 ? '+' : ''}{value}
          </div>
          <button onClick={() => step(1)}
            style={{
              width:48, height:56, borderRadius:12, border:'1px solid rgba(255,255,255,.15)',
              background:'rgba(255,255,255,.06)', color:'rgba(255,255,255,.8)',
              cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'1.6rem',
              flexShrink:0,
            }}>+</button>
        </div>

        {/* Valores rápidos negativos (solo si allowNeg) */}
        {allowNeg && negativeQuick.length > 0 && (
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
            {negativeQuick.map(v => (
              <button key={v} onClick={() => { snd('tap'); setValue(v); }}
                style={{
                  flex:1, padding:'9px 6px', borderRadius:10, border:'none', cursor:'pointer',
                  fontFamily:'var(--font-display)', fontSize:'var(--fs-sm)',
                  background: value===v ? '#FF3B5C' : 'rgba(255,59,92,.12)',
                  color: value===v ? '#fff' : '#FF6B6B',
                  transition:'all .15s',
                }}>
                {v}
              </button>
            ))}
          </div>
        )}

        {/* Condición custom si aplica */}
        {action.category === 'score' && window._runtimeSpec?.winConditions?.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontFamily: 'var(--font-label)', fontSize: 'var(--fs-micro)', color: 'rgba(255,255,255,.35)', letterSpacing: 2, marginBottom: 6 }}>
              ¿CON QUÉ JUGADA? (OPCIONAL)
            </div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              <button onClick={() => { snd('tap'); setCondition(''); }}
                style={{ padding: '4px 10px', borderRadius: 20, border: `1px solid ${!condition ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.1)'}`, background: !condition ? 'rgba(255,255,255,.1)' : 'transparent', color: 'rgba(255,255,255,.5)', cursor: 'pointer', fontFamily: 'var(--font-label)', fontSize: 'var(--fs-micro)' }}>
                Sin especificar
              </button>
              {window._runtimeSpec.winConditions.map(c => (
                <button key={c} onClick={() => { snd('tap'); setCondition(c); }}
                  style={{ padding: '4px 10px', borderRadius: 20, border: `1px solid ${condition === c ? 'rgba(255,212,71,.5)' : 'rgba(255,255,255,.1)'}`, background: condition === c ? 'rgba(255,212,71,.15)' : 'transparent', color: condition === c ? 'var(--gold)' : 'rgba(255,255,255,.5)', cursor: 'pointer', fontFamily: 'var(--font-label)', fontSize: 'var(--fs-micro)' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn btn-ghost" style={{ flex: 1, marginBottom: 0 }} onClick={onCancel}>Cancelar</button>
          <button className="btn" disabled={value===0}
            style={{ flex: 1, marginBottom: 0, background: value!==0?action.color:'rgba(255,255,255,.1)', color: value!==0?'var(--bg)':'rgba(255,255,255,.3)', border: 'none', borderRadius: 12, padding: 14, fontFamily: 'var(--font-display)', fontSize: 'var(--fs-sm)', cursor: value!==0?'pointer':'not-allowed' }}
            onClick={handleConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── OPTION SELECTOR MODAL ─────────────────────────────────────────
function OptionSelectorModal({ action, player, onConfirm, onCancel }) {
  const [selected, setSelected] = React.useState(null);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="anim-pop" style={{ background: '#0D0D1C', border: `1px solid ${action.color}44`, borderRadius: 20, padding: '24px 20px', width: '100%', maxWidth: 340 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: 1, color: action.color, marginBottom: 4 }}>{action.icon} {action.label}</div>
        <div style={{ fontFamily: 'var(--font-label)', fontSize: 'var(--fs-micro)', color: 'rgba(255,255,255,.4)', marginBottom: 16 }}>{player.emoji} {player.name}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
          {(action.options || []).map(opt => (
            <button key={opt} onClick={() => { snd('tap'); setSelected(opt); }}
              style={{ padding: '9px 14px', borderRadius: 10, border: `1px solid ${selected === opt ? action.color : 'rgba(255,255,255,.15)'}`, background: selected === opt ? action.color + '22' : 'transparent', color: selected === opt ? action.color : 'rgba(255,255,255,.6)', cursor: 'pointer', fontFamily: 'var(--font-label)', fontSize: 'var(--fs-sm)', fontWeight: 700 }}>
              {opt}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" style={{ flex: 1, marginBottom: 0 }} onClick={onCancel}>Cancelar</button>
          <button className="btn" disabled={!selected}
            style={{ flex: 1, marginBottom: 0, background: selected ? action.color : 'rgba(255,255,255,.1)', color: 'var(--bg)', border: 'none', borderRadius: 12, padding: 14, fontFamily: 'var(--font-display)', fontSize: 'var(--fs-sm)', cursor: selected ? 'pointer' : 'not-allowed' }}
            onClick={() => { snd('score'); onConfirm({ condition: selected, value: selected }); }}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CONFIRM MODAL ─────────────────────────────────────────────────
function ConfirmModal_R({ action, player, spec, onConfirm, onCancel }) {
  const [elimReason, setElimReason] = React.useState(null);
  const reasons = [
    { id: 'zero_lives', label: 'Sin vidas', emoji: '❤️' },
    { id: 'last_place', label: 'Último lugar', emoji: '📉' },
    { id: 'rule',       label: 'Regla del juego', emoji: '📋' },
    { id: 'manual',     label: 'Decisión del host', emoji: '👑' },
  ];
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="anim-pop" style={{ background: '#0D0D1C', border: '2px solid rgba(255,59,92,.35)', borderRadius: 20, padding: '24px 20px', width: '100%', maxWidth: 340, textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>{player.emoji}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: 1, color: 'var(--red)', marginBottom: 4 }}>
          💀 Eliminar a {player.name}
        </div>
        <div style={{ fontFamily: 'var(--font-label)', fontSize: 'var(--fs-xs)', color: 'rgba(255,255,255,.4)', marginBottom: 16 }}>
          Esta acción no se puede deshacer fácilmente.
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 18 }}>
          {reasons.map(r => (
            <button key={r.id} onClick={() => { snd('tap'); setElimReason(r.id); }}
              style={{ padding: '7px 12px', borderRadius: 10, border: `1px solid ${elimReason === r.id ? 'rgba(255,59,92,.5)' : 'rgba(255,255,255,.12)'}`, background: elimReason === r.id ? 'rgba(255,59,92,.2)' : 'transparent', color: elimReason === r.id ? 'var(--red)' : 'rgba(255,255,255,.5)', cursor: 'pointer', fontFamily: 'var(--font-label)', fontSize: 'var(--fs-micro)' }}>
              {r.emoji} {r.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" style={{ flex: 1, marginBottom: 0 }} onClick={onCancel}>Cancelar</button>
          <button className="btn btn-red" style={{ flex: 1, marginBottom: 0 }} onClick={() => { snd('elim'); onConfirm({ reason: elimReason }); }}>
            💀 Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PLAYER ACTION CARD ────────────────────────────────────────────
function PlayerActionCard({ player, spec, actions, isHost, myId, onAction, currentRound, presence }) {
  const [expanded, setExpanded] = React.useState(false);
  const [modal, setModal] = React.useState(null);
  const isMe = player.id === myId;
  // Host puede operar cualquier jugador; jugador solo puede operar a sí mismo
  const canAct = isHost || isMe;
  const display = getScoreDisplay(player, spec);

  const primaryActions = actions.filter(a =>
    !a.secondary &&
    !player.eliminated &&
    _canSee(a, isHost, isMe)
  );
  const secondaryActions = actions.filter(a =>
    a.secondary &&
    !player.eliminated &&
    _canSee(a, isHost, isMe)
  );

  function handleAction(action, payload) {
    setModal(null);
    onAction(action, player.id, payload || {});
  }

  function handleActionClick(action) {
    snd('tap');
    if (action.type === 'direct') {
      handleAction(action, {});
    } else if (action.type === 'confirm_action') {
      setModal({ action, type: 'confirm' });
    } else if (action.type === 'numeric_modal') {
      setModal({ action, type: 'numeric' });
    } else if (action.type === 'option_selector') {
      setModal({ action, type: 'option' });
    } else if (action.type === 'undo') {
      handleAction(action, {});
    }
  }

  if (player.eliminated) {
    return (
      <div className="player-row eliminated" style={{ marginBottom: 8, opacity: .4 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', width: 28, textAlign: 'center', color: 'var(--red)' }}>
          #{player.finalPosition}
        </div>
        <div className="player-emoji">{player.emoji}</div>
        <div style={{ flex: 1 }}>
          <div className="player-name" style={{ color: 'rgba(255,255,255,.4)' }}>{player.name}</div>
          <div style={{ fontFamily: 'var(--font-label)', fontSize: 'var(--fs-micro)', color: 'rgba(255,59,92,.5)', letterSpacing: 1 }}>
            💀 {player.survivalLabel || '—'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 10 }}>
      {/* Modals */}
      {modal?.type === 'numeric' && (
        <NumericModal action={modal.action} player={player}
          onConfirm={p => handleAction(modal.action, p)}
          onCancel={() => setModal(null)} />
      )}
      {modal?.type === 'option' && (
        <OptionSelectorModal action={modal.action} player={player}
          onConfirm={p => handleAction(modal.action, p)}
          onCancel={() => setModal(null)} />
      )}
      {modal?.type === 'confirm' && (
        <ConfirmModal_R action={modal.action} player={player} spec={spec}
          onConfirm={p => handleAction(modal.action, p)}
          onCancel={() => setModal(null)} />
      )}

      <div style={{
        background: isMe ? 'rgba(0,245,255,.04)' : 'rgba(255,255,255,.03)',
        border: `1px solid ${isMe ? 'rgba(0,245,255,.2)' : 'rgba(255,255,255,.08)'}`,
        borderRadius: 14, padding: '12px 14px',
        transition: 'all .2s',
      }}>
        {/* Player row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: primaryActions.length > 0 ? 12 : 0 }}>
          {/* Position */}
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', width: 24, textAlign: 'center', color: 'rgba(255,255,255,.25)', flexShrink: 0 }}>
            {spec.hasFirstPlayerToken && player.hasFirstPlayerToken ? '👑' : ''}
          </div>
          <div className="player-emoji">{player.emoji}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--fs-base)', color: player.color || '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
              <StatusDot pid={player.id} presence={presence} eliminated={player.eliminated}/>
              {player.name}
              {isMe && <span style={{ fontFamily: 'var(--font-ui)', fontSize: '.5rem', color: 'var(--cyan)', letterSpacing: 2 }}>TÚ</span>}
              {player.activeShield && <span title="Escudo activo">🛡️</span>}
              {player.activeBlock && <span title="Bloqueado">🚫</span>}
              {player.activeDouble && <span title="Doble siguiente">2️⃣</span>}
            </div>
            {display.sub && (
              <div style={{ fontFamily: 'var(--font-label)', fontSize: 'var(--fs-micro)', color: 'rgba(255,255,255,.35)', letterSpacing: 1, marginTop: 1 }}>
                {display.sub}
              </div>
            )}
          </div>
          {/* Score */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            {/* Vidas como corazones */}
            {spec.primaryUnit === 'lives' && player.lives !== undefined ? (
              <div style={{ fontSize: '1rem', letterSpacing: 1 }}>
                {'❤️'.repeat(Math.max(0, player.lives))}
                {'🖤'.repeat(Math.max(0, (spec.playerInit.lives || 5) - player.lives))}
              </div>
            ) : (
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: player.color || 'rgba(255,255,255,.6)' }}>
                {display.main}
                <span style={{ fontSize: 'var(--fs-micro)', color: 'rgba(255,255,255,.3)', marginLeft: 3 }}>{display.unit}</span>
              </div>
            )}
          </div>
        </div>

        {/* Primary action buttons */}
        {primaryActions.length > 0 && (
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {primaryActions.map(action => (
              <button key={action.id}
                onClick={() => handleActionClick(action)}
                style={{
                  flex: 1, minWidth: 60,
                  padding: '10px 8px',
                  borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-label)', fontWeight: 700,
                  fontSize: 'var(--fs-xs)', letterSpacing: .5,
                  background: action.dangerous ? 'rgba(255,59,92,.15)' : `${action.color}18`,
                  color: action.dangerous ? 'var(--red)' : action.color,
                  border: `1px solid ${action.dangerous ? 'rgba(255,59,92,.3)' : action.color + '33'}`,
                  transition: 'all .15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                }}>
                <span style={{ fontSize: '1rem' }}>{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Secondary actions toggle */}
        {secondaryActions.length > 0 && (
          <>
            <button
              onClick={() => { snd('tap'); setExpanded(e => !e); }}
              style={{ marginTop: 8, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-label)', fontSize: 'var(--fs-micro)', color: 'rgba(255,255,255,.3)', letterSpacing: 1, width: '100%', textAlign: 'center', padding: '4px 0' }}>
              {expanded ? '▲ ocultar' : '▾ más acciones'}
            </button>
            {expanded && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }} className="anim-fade">
                {secondaryActions.map(action => (
                  <button key={action.id}
                    onClick={() => handleActionClick(action)}
                    style={{
                      padding: '7px 11px',
                      borderRadius: 9, border: `1px solid ${action.color}33`, cursor: 'pointer',
                      fontFamily: 'var(--font-label)', fontWeight: 700, fontSize: 'var(--fs-micro)', letterSpacing: .5,
                      background: `${action.color}0D`, color: action.color,
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                    {action.icon} {action.label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── TOOLS TOOLBAR ─────────────────────────────────────────────────
function ToolsToolbar({ spec, players }) {
  const [activeTool, setActiveTool] = React.useState(null);
  const items = spec.toolbarItems || [];
  if (items.length === 0) return null;

  if (activeTool === 'coin')  return <CoinTool    onBack={() => setActiveTool(null)} />;
  if (activeTool === 'dice')  return <DiceTool     onBack={() => setActiveTool(null)} />;
  if (activeTool === 'wheel') return <SpinWheelTool onBack={() => setActiveTool(null)} players={players} />;
  if (activeTool === 'rps')   return <RPSTool      onBack={() => setActiveTool(null)} />;

  return (
    <div style={{ display: 'flex', gap: 7, padding: '8px 0', overflowX: 'auto', marginBottom: 4 }}>
      {items.map(t => (
        <button key={t.id}
          onClick={() => { snd('tap'); setActiveTool(t.id); }}
          style={{
            flexShrink: 0, padding: '8px 12px', borderRadius: 10,
            border: `1px solid ${t.color}44`, background: `${t.color}0D`,
            color: t.color, cursor: 'pointer',
            fontFamily: 'var(--font-label)', fontSize: 'var(--fs-micro)', fontWeight: 700, letterSpacing: .5,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
          <span style={{ fontSize: '1rem' }}>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ── HOST CONTROL PANEL ────────────────────────────────────────────
function HostPanel({ spec, room, onHostAction, isOpen, onToggle }) {
  const actions = spec.hostActions || [];
  return (
    <div style={{ marginTop: 16, marginBottom: 8 }}>
      <button onClick={() => { snd('tap'); onToggle(); }}
        style={{
          width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
          borderRadius: 10, padding: '10px 14px', cursor: 'pointer', color: 'rgba(255,255,255,.5)',
          fontFamily: 'var(--font-label)', fontSize: 'var(--fs-micro)', letterSpacing: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
        <span>⚙️ PANEL DEL HOST</span>
        <span>{isOpen ? '▲' : '▾'}</span>
      </button>
      {isOpen && (
        <div className="anim-fade" style={{
          background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.08)',
          borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '12px 14px',
        }}>
          {/* Acciones primarias y peligrosas — full width, grandes */}
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:8 }}>
            {actions.filter(a=>a.primary||a.dangerous).map(a => (
              <button key={a.id}
                onClick={() => { snd(a.dangerous?'elim':'round'); onHostAction(a.id); }}
                style={{
                  width:'100%', padding:'18px 20px', borderRadius:14,
                  border:`2px solid ${a.dangerous?'rgba(255,59,92,.4)':'rgba(0,255,157,.3)'}`,
                  cursor:'pointer',
                  fontFamily:'var(--font-display)', fontWeight:700,
                  fontSize:'1.1rem', letterSpacing:1,
                  background: a.dangerous?'rgba(255,59,92,.18)':'rgba(0,255,157,.15)',
                  color: a.dangerous?'var(--red)':'var(--green)',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  boxShadow: a.dangerous?'0 4px 16px rgba(255,59,92,.2)':'0 4px 16px rgba(0,255,157,.15)',
                }}>
                <span style={{fontSize:'1.3rem'}}>{a.icon}</span> {a.label}
              </button>
            ))}
          </div>
          {/* Acciones secundarias — fila compacta */}
          <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
            {actions.filter(a=>!a.primary&&!a.dangerous).map(a => (
              <button key={a.id}
                onClick={() => { snd('tap'); onHostAction(a.id); }}
                style={{
                  padding:'10px 14px', borderRadius:9,
                  border:'1px solid rgba(255,255,255,.1)', cursor:'pointer',
                  fontFamily:'var(--font-label)', fontWeight:700,
                  fontSize:'var(--fs-sm)', letterSpacing:.5,
                  background:'rgba(255,255,255,.06)',
                  color:'rgba(255,255,255,.65)',
                  display:'flex', alignItems:'center', gap:5,
                }}>
                {a.icon} {a.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── UNIVERSAL RUNTIME ─────────────────────────────────────────────
function UniversalRuntime({ session, onBack, isHost, myId, db, templateConfig }) {
  const [room, setRoom] = React.useState(null);
  const [elapsed, setElapsed] = React.useState(0);
  const [showEndScreen, setShowEndScreen] = React.useState(false);
  const [hostPanelOpen, setHostPanelOpen] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [victoryResult, setVictoryResult] = React.useState(null);
  const timerRef = React.useRef(null);
  const prevStartedAtRef = React.useRef(null);

  // Config v2: soporta formato nuevo (.grouped, .runtime) y legacy (config plano)
  const [resolvedConfig, setResolvedConfig] = React.useState(templateConfig);
  const [resolvedRuntime, setResolvedRuntime] = React.useState(null);

  React.useEffect(() => {
    const unsub = db.listen(`rooms/${session.code}`, data => {
      if (data) {
        setRoom(data);
        if (!resolvedConfig) {
          const cfg = data.config || null;
          if (cfg) setResolvedConfig(cfg);
          if (data.runtimeSpec) setResolvedRuntime(data.runtimeSpec);
        }
      }
    });
    return () => unsub && unsub();
  }, [session.code]);

  const spec = React.useMemo(() => {
    if (!resolvedConfig) return null;
    const s = interpret(resolvedConfig);
    if (resolvedRuntime) {
      s._timeline  = resolvedRuntime.timeline || [];
      s._gameState = resolvedRuntime.gameState || {};
      s._checklist = resolvedRuntime.phaseChecklistResolved || [];
      s._entities  = resolvedRuntime.externalEntitiesResolved || [];
    }
    window._runtimeSpec = s;
    return s;
  }, [resolvedConfig, resolvedRuntime]);

  // Presencia
  React.useEffect(() => {
    if (myId && session.code) setupPresence(session.code, myId);
    return () => teardownPresence();
  }, [session.code, myId]);

  // RematchPending overlay state (Flip7 pattern)
  const [showRematchOverlay, setShowRematchOverlay] = React.useState(false);
  React.useEffect(() => {
    if (!session?.code) return;
    const unsub = db.listen(`rooms/${session.code}/rematchPending`, pending => {
      if (pending === true) setShowRematchOverlay(true);
      else if (pending === false) setShowRematchOverlay(false);
    });
    return () => unsub && unsub();
  }, [session?.code]);

  // Presencia de otros jugadores
  const [presence, setPresence] = React.useState({});
  React.useEffect(() => {
    if (!session.code) return;
    const unsub = listenPresence(session.code, setPresence);
    return () => unsub && unsub();
  }, [session.code]);

  // Escuchar rematchCode — jugadores no-host se redirigen automáticamente
  React.useEffect(() => {
    if (!session?.code) return;
    const unsub = db.listen(`rooms/${session.code}/rematchCode`, newCode => {
      if (!newCode) return;
      const myIsHost = myId && room?.hostId && room?.hostId === myId;
    // Reload handled by db.listen rematchPending

    });
    return () => unsub && unsub();
  }, [session?.code, room?.hostId, myId]);

  React.useEffect(() => {
    if (!room || room.status !== 'active') return;
    const start = room.startedAt;
    timerRef.current = setInterval(() => setElapsed(Date.now() - start), 1000);
    return () => clearInterval(timerRef.current);
  }, [room?.status, room?.startedAt]);

  React.useEffect(() => {
    if (room?.status === 'finished') setShowEndScreen(true);
    else setShowEndScreen(false);
  }, [room?.status]);

  React.useEffect(() => {
    if (!room) return;

    // Limpiar residuos de victoria cuando se inicia otra partida
    // o cuando la sala regresa al lobby por revancha.
    if (room.status === 'active') {
      if (prevStartedAtRef.current !== room.startedAt) {
        prevStartedAtRef.current = room.startedAt || null;
        setShowEndScreen(false);
        setVictoryResult(null);
        setToast(null);
        setShowRematchOverlay(false);
      }
    } else if (room.status === 'lobby') {
      setShowEndScreen(false);
      setVictoryResult(null);
      setToast(null);
      setShowRematchOverlay(false);
    }
  }, [room?.status, room?.startedAt]);

  function showToast(msg, color = 'var(--cyan)') {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2500);
  }

  async function handlePlayerAction(action, playerId, payload) {
    if (!room) return;
    snd('score');
    const result = applyAction(action, playerId, payload, room, spec);
    if (!result) return;

    let updates = { players: result.players, events: result.events };

    // Victoria detectada
    if (result.victoryResult) {
      const winner = result.victoryResult.winner;
      updates.status = 'finished';
      updates.endedAt = Date.now();
      updates.winner = { id: winner.id, name: winner.name, emoji: winner.emoji };
      snd('victory');
      showToast(`🏆 ${winner.name} gana!`, 'var(--gold)');
    }

    await db.set(`rooms/${session.code}`, { ...room, ...updates });

    // Toast de feedback
    if (action.id === 'add_points') showToast(`+${payload.value} pts para ${result.players.find(p => p.id === playerId)?.name}`, 'var(--cyan)');
    if (action.id === 'lose_life')  showToast(`${result.players.find(p => p.id === playerId)?.name} pierde una vida`, 'var(--red)');
    if (action.id === 'add_win')    showToast(`🏆 ${result.players.find(p => p.id === playerId)?.name} gana la ronda`, 'var(--gold)');
    if (action.id === 'eliminate')  showToast(`💀 ${result.players.find(p => p.id === playerId)?.name} eliminado`, 'var(--red)');
  }

  async function handleHostAction(actionId) {
    if (!room) return;
    const now = Date.now();

    switch (actionId) {
      case 'close_round': {
        snd('round');
        const players = room.players || [];
        // Determinar ganador de ronda por puntos si aplica
        let roundWinner = null;
        if (spec.victoryMode === 'wins') {
          // en modo victorias se selecciona manualmente — por ahora el primero
        }
        const newRound = { number: room.currentRound || 1, closedAt: now, winner: roundWinner };
        const rounds = [...(room.rounds || []), newRound];
        const nextRound = (room.currentRound || 1) + 1;
        let finished = spec.totalRounds && nextRound > spec.totalRounds;
        let updates = { rounds, currentRound: nextRound };

        if (finished) {
          const sorted = sortPlayers(room.players || [], spec);
          const winner = sorted[0];
          updates.status = 'finished';
          updates.endedAt = now;
          updates.winner = { id: winner?.id, name: winner?.name, emoji: winner?.emoji };
          snd('victory');
        }
        await db.set(`rooms/${session.code}`, { ...room, ...updates });
        showToast(`✓ Ronda ${room.currentRound} cerrada`, 'var(--green)');
        break;
      }
      case 'end_match': {
        const sorted = sortPlayers(room.players || [], spec);
        const winner = sorted[0];
        await db.set(`rooms/${session.code}`, {
          ...room, status: 'finished', endedAt: now,
          winner: { id: winner?.id, name: winner?.name, emoji: winner?.emoji },
        });
        break;
      }
      case 'next_turn': {
        snd('tap');
        const active = (room.players || []).filter(p => !p.eliminated);
        const cur = room.currentTurnIdx || 0;
        const next = (cur + 1) % active.length;
        await db.set(`rooms/${session.code}/currentTurnIdx`, next);
        break;
      }
      default: break;
    }
  }

  if (showRematchOverlay) return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.92)',zIndex:9999,
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16}}>
      <div style={{fontFamily:'var(--font-display)',fontSize:'3rem',animation:'elimPulse 1s ease-in-out infinite'}}>🔁</div>
      <div style={{fontFamily:'var(--font-display)',fontSize:'1.4rem',letterSpacing:3,color:'var(--cyan)'}}>REVANCHA</div>
      <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-sm)',color:'rgba(255,255,255,.4)',letterSpacing:2}}>Preparando nueva partida...</div>
      <div className="os-spin" style={{width:32,height:32,borderWidth:3,marginTop:8}}/>
    </div>
  );

  if (!room || !resolvedConfig || !spec) return (
    <div className="os-wrap">
      <div className="os-page" style={{ paddingTop: 80, textAlign: 'center' }}>
        <div className="os-spin" style={{ marginBottom: 16 }} />
        <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.3)',letterSpacing:2}}>
          {!room ? 'CONECTANDO...' : 'CARGANDO CONFIG...'}
        </div>
      </div>
    </div>
  );

  if (showEndScreen) return (
    <UniversalEndScreen room={room} myId={myId} isHost={effectiveIsHost} spec={spec} onBack={onBack} db={db} session={session} />
  );

  const players = room.players || [];
  const effectiveIsHost = isHost || (myId && room.hostId && room.hostId === myId);
  const sorted = sortPlayers(players, spec);
  const currentRound = room.currentRound || 1;
  const totalRounds = spec.totalRounds;
  const actions = spec.playerActions || [];
  const activeCount = players.filter(p => !p.eliminated).length;
  const currentTurnPlayer = spec.hasTurns
    ? (players.filter(p => !p.eliminated)[(room.currentTurnIdx || 0) % Math.max(1, activeCount)])
    : null;

  return (
    <div className="os-wrap">
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 70, left: '50%', transform: 'translateX(-50%)',
          zIndex: 998, background: '#0D0D1C', border: `1px solid ${toast.color}55`,
          borderRadius: 30, padding: '8px 20px',
          fontFamily: 'var(--font-display)', fontSize: 'var(--fs-sm)', color: toast.color,
          letterSpacing: 1, whiteSpace: 'nowrap', animation: 'popIn .25s ease',
          boxShadow: `0 4px 20px ${toast.color}33`,
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="os-header">
        <div>
          <div className="os-logo">BOARD<span>GAMEZ</span></div>
          <div className="os-logo-sub">OS · {(room.customTitle || 'PARTIDA').toUpperCase()}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="room-code-badge">{session.code}</div>
          <div style={{ textAlign: 'right' }}>
            <div className="match-timer" style={{ fontSize: '1rem' }}>{fmtDuration(elapsed)}</div>
            {spec.hasRounds && (
              <div style={{ fontFamily: 'var(--font-label)', fontSize: 'var(--fs-micro)', color: 'rgba(255,255,255,.3)', letterSpacing: 1 }}>
                R{currentRound}{totalRounds ? `/${totalRounds}` : ''}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="os-page" style={{ paddingTop: 16 }}>

        {/* Timer visual */}
        {spec.hasTimer && spec.timerScope === 'turn' && (
          <div style={{ background: 'rgba(255,107,53,.08)', border: '1px solid rgba(255,107,53,.2)', borderRadius: 10, padding: '8px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--orange)' }}>⏳</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--orange)' }}>{spec.timerSecs}s</div>
            <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,.1)', borderRadius: 2 }}>
              <div style={{ width: '60%', height: '100%', background: 'var(--orange)', borderRadius: 2, transition: 'width 1s linear' }} />
            </div>
          </div>
        )}

        {/* Turno actual */}
        {spec.hasTurns && currentTurnPlayer && (
          <div style={{ background: 'rgba(0,245,255,.06)', border: '1px solid rgba(0,245,255,.2)', borderRadius: 12, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontFamily: 'var(--font-label)', fontSize: 'var(--fs-micro)', color: 'rgba(0,245,255,.5)', letterSpacing: 2, flexShrink: 0 }}>TURNO</div>
            <div style={{ fontSize: '1.4rem' }}>{currentTurnPlayer.emoji}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: currentTurnPlayer.color || 'var(--cyan)' }}>{currentTurnPlayer.name}</div>
            {currentTurnPlayer.id === myId && <div style={{ fontFamily: 'var(--font-ui)', fontSize: '.5rem', color: 'var(--cyan)', letterSpacing: 2, marginLeft: 'auto' }}>TÚ</div>}
          </div>
        )}

        {/* Herramientas toolbar */}
        {spec.hasTools && spec.toolbarItems?.length > 0 && (
          <ToolsToolbar spec={spec} players={players.filter(p => !p.eliminated)} />
        )}

        {/* MARCADOR + ACCIONES por jugador */}
        <div className="os-section">
          {activeCount} ACTIVOS
          {players.some(p => p.eliminated) && ` · ${players.filter(p => p.eliminated).length} ELIMINADOS`}
        </div>

        {sorted.map((player, i) => (
          <PlayerActionCard
            key={player.id}
            player={player}
            spec={spec}
            actions={actions}
            isHost={effectiveIsHost}
            myId={myId}
            onAction={handlePlayerAction}
            currentRound={currentRound}
            presence={presence}
          />
        ))}

        {/* Botón de auto-eliminación para jugador no-host en modo survival */}
        {(() => {
          const me = players.find(p => p.id === myId);
          const isSurvival = spec.hasElimination || spec.victoryMode === 'lives' || spec.victoryMode === 'elimination';
          if (!me || me.eliminated || !isSurvival) return null;
          return (
            <div style={{ marginTop: 8 }}>
              <button className="btn-elim-big"
                onClick={() => handlePlayerAction({id:'eliminate',icon:'💀',color:'var(--red)',type:'confirm_action'}, me.id, {reason:'manual'})}>
                💀 ME ELIMINÉ
              </button>
            </div>
          );
        })()}

        {/* Panel del host */}
        {/* ── EMOJI SPAM — todos los jugadores incluyendo host ── */}
        <div style={{display:'flex',gap:8,marginTop:12,marginBottom:4}}>
          <div style={{display:'flex',gap:5,flexWrap:'wrap',flex:1}}>
            {['🔥','💥','⚡','🎉','❤️','💀','👑','😈','🤡','🚀'].map(e=>(
              <button key={e}
                onClick={()=>{snd('tap');setMyEmojiU&&setMyEmojiU(e);}}
                style={{width:34,height:34,borderRadius:8,
                  border:'2px solid rgba(255,255,255,.1)',
                  background:'rgba(255,255,255,.05)',
                  cursor:'pointer',fontSize:'1.1rem',flexShrink:0}}>
                {e}
              </button>
            ))}
          </div>
        </div>

        {effectiveIsHost && (
          <HostPanel
            spec={spec}
            room={room}
            onHostAction={handleHostAction}
            isOpen={hostPanelOpen}
            onToggle={() => setHostPanelOpen(o => !o)}
          />
        )}

        {!effectiveIsHost && myId && !players.find(p=>p.id===myId) && (
          <div className="os-alert alert-cyan" style={{ justifyContent: 'center', textAlign: 'center', marginTop: 16 }}>
            👁 Modo espectador · Solo lectura
          </div>
        )}

        <div className="g16" />
        {effectiveIsHost && (
          <button className="btn btn-ghost" onClick={onBack} style={{marginBottom:8}}>🚪 Salir como host</button>
        )}
        <button className="btn btn-back" onClick={onBack}>← Volver al menú</button>
      </div>
    </div>
  );
}

// ── UNIVERSAL END SCREEN ──────────────────────────────────────────
function UniversalEndScreen({ room, myId, isHost, spec, onBack, db, session }) {
  const players = sortPlayers(room.players || [], spec);
  const winner = players[0];
  const totalDuration = room.endedAt && room.startedAt ? fmtDuration(room.endedAt - room.startedAt) : '—';
  const confetti = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    c: ['#FFD447', '#FF6B35', '#00F5FF', '#00FF9D', '#9B5DE5'][i % 5],
    l: Math.round(Math.random() * 100) + '%',
    dl: Math.round(Math.random() * 20) / 10 + 's',
    dr: Math.round((2 + Math.random() * 2.5) * 10) / 10 + 's',
    sz: Math.round(6 + Math.random() * 8) + 'px',
  }));
  const [rematchLoading, setRematchLoading] = React.useState(false);

  React.useEffect(() => { snd('victory'); }, []);

  const winEmoji = spec.victoryMode === 'points' ? '🏅' : spec.victoryMode === 'wins' ? '🏆' : spec.victoryMode === 'lives' ? '❤️' : spec.victoryMode === 'elimination' ? '💀' : '🏆';

  const effectiveIsHostES = isHost || (myId && room.hostId && room.hostId === myId);

  async function handleRematch() {
    if (!effectiveIsHostES) return;
    snd('round');
    setRematchLoading(true);
    // Flip7 pattern: signal → overlay → reset in-place
    await db.set(`rooms/${session.code}/rematchPending`, true);
    await new Promise(r => setTimeout(r, 2500));
    const freshPlayers = (room.players || []).map(p => ({
      ...spec.playerInit,
      id: p.id, name: p.name, emoji: p.emoji, color: p.color, isHost: p.isHost || false,
    }));
    await db.set(`rooms/${session.code}`, {
      ...room,
      status: 'lobby',
      players: freshPlayers,
      currentRound: 1, rounds: [], events: [],
      startedAt: null, endedAt: null, winner: null,
      rematchPending: false, rematchCode: null,
    });
    setRematchLoading(false);
  }


  return (
    <div className="end-screen">
      <div className="end-confetti">
        {confetti.map(d => (
          <div key={d.id} style={{ position: 'absolute', background: d.c, width: d.sz, height: d.sz, left: d.l, top: -20, borderRadius: Math.random() > .5 ? '50%' : '3px', animation: `confettiFall ${d.dr} ${d.dl} linear infinite` }} />
        ))}
      </div>
      <div className="end-trophy">{winEmoji}</div>
      <div className="end-label">
        {spec.victoryMode === 'lives' ? 'ÚLTIMO CON VIDA' : spec.victoryMode === 'wins' ? 'MÁS VICTORIAS' : 'CAMPEÓN'}
      </div>
      <div className="end-gamename">{(room.customTitle || 'PARTIDA').toUpperCase()}</div>
      {winner && (
        <>
          <div style={{ fontSize: '2.6rem', marginBottom: 6 }}>{winner.emoji}</div>
          <div className="end-winner-name" style={{ color: winner.color || '#fff' }}>{winner.name}</div>
          <div className="end-stats">
            {spec.primaryUnit === 'points' ? `${winner.points || 0} PUNTOS · ${totalDuration}` :
             spec.primaryUnit === 'wins'   ? `${winner.wins || 0} VICTORIAS · ${totalDuration}` :
             spec.primaryUnit === 'lives'  ? `${winner.lives || 0} VIDAS · ${totalDuration}` :
             totalDuration}
          </div>
        </>
      )}
      <div style={{ width: '100%', maxWidth: 380, marginBottom: 20 }}>
        {players.slice(0, 6).map((p, i) => {
          const display = getScoreDisplay(p, spec);
          return (
            <div key={p.id} className={`player-row ${i === 0 ? 'winner-row' : ''}`} style={{ marginBottom: 6 }}>
              <div className="player-pos">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</div>
              <div className="player-emoji">{p.emoji}</div>
              <div style={{ flex: 1 }}>
                <div className="player-name" style={{ color: p.color || '#fff' }}>
                  {p.name}{p.id === myId && <span style={{ fontFamily: 'var(--font-ui)', fontSize: '.5rem', color: 'var(--cyan)', letterSpacing: 2, marginLeft: 5 }}>TÚ</span>}
                </div>
              </div>
              <div className="player-stat" style={{ color: i === 0 ? 'var(--gold)' : 'rgba(255,255,255,.55)' }}>
                {display.main}{' '}{display.unit}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {spec.rematch.keepPlayers && effectiveIsHostES && (
          !rematchLoading ? (
            <button className="btn btn-cyan" style={{ marginBottom: 0 }} onClick={handleRematch}>
              🔁 REVANCHA — Mismos jugadores
            </button>
          ) : (
            <div style={{textAlign:'center',padding:'12px 0'}}>
              <div style={{fontFamily:'var(--font-display)',fontSize:'1rem',color:'var(--cyan)',
                letterSpacing:2,animation:'osBlink 1s ease-in-out infinite'}}>🔁 PREPARANDO...</div>
            </div>
          )
        )}
        {spec.rematch.keepPlayers && !effectiveIsHostES && !isHost && (
          <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',
            color:'rgba(255,255,255,.3)',letterSpacing:1,textAlign:'center',padding:'8px 0'}}>
            ⏳ Esperando decisión del host para revancha
          </div>
        )}
        {effectiveIsHostES && (
          <button className="btn btn-ghost" style={{ marginBottom: 0 }} onClick={onBack}>🚪 Salir como host</button>
        )}
        <button className="btn btn-ghost" style={{ marginBottom: 0 }} onClick={onBack}>🏠 Volver al menú</button>
      </div>
    </div>
  );
}

// ── HELPER ────────────────────────────────────────────────────────
function _canSee(action, isHost, isMe) {
  // Host siempre puede operar cualquier jugador
  if (isHost) return true;
  if (!action.visibleTo) return true;
  if (action.visibleTo.includes('all')) return true;
  // El mismo jugador puede ver sus propias acciones
  if (isMe && (action.visibleTo.includes('self') || action.visibleTo.includes('player'))) return true;
  return false;
}
