if(!window.ENGINE_SCHEMA){
  console.error('ENGINE_SCHEMA no está cargado');
}
if(!window.SchemaUtils){
  console.error('SchemaUtils no está cargado');
}

const BUILDER_SECTION_PALETTE = [
  '#9B5DE5', // morado
  '#FFD447', // amarillo
  '#FF3B5C', // rojo
  '#00FF9D', // verde
  '#FF4FA3', // rosa
  '#B7FF3C', // verde limón
  '#FF8A3D', // naranja
  '#4A90FF'  // azul
];

function _sectionColor(section, index = 0){
  return BUILDER_SECTION_PALETTE[index % BUILDER_SECTION_PALETTE.length];
}

function _withAlpha(hex, alpha){
  if(!hex || typeof hex !== 'string') return `rgba(255,255,255,${alpha})`;
  const clean = hex.replace('#','').trim();
  const full = clean.length === 3 ? clean.split('').map(c=>c+c).join('') : clean;
  if(full.length !== 6) return `rgba(255,255,255,${alpha})`;
  const int = parseInt(full, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function _gradientButtonStyle(color, opts = {}){
  const compact = !!opts.compact;
  return {
    margin: 0,
    padding: compact ? '10px 14px' : '12px 18px',
    textAlign: 'center',
    textTransform: 'uppercase',
    transition: '0.28s',
    backgroundSize: '200% auto',
    color: '#fff',
    borderRadius: compact ? 10 : 12,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    border: '0px',
    fontWeight: 800,
    letterSpacing: 1,
    boxShadow: `0px 0px 14px -7px ${color}`,
    backgroundImage: `linear-gradient(45deg, ${_withAlpha(color,.82)} 0%, ${color} 51%, ${_withAlpha(color,.82)} 100%)`,
    cursor: 'pointer',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'manipulation',
    fontFamily: 'var(--font-label)',
    fontSize: compact ? '12px' : '13px',
    width: opts.full ? '100%' : 'auto'
  };
}

function _softGhostButtonStyle(color, opts = {}){
  return {
    padding: opts.compact ? '9px 12px' : '11px 16px',
    borderRadius: 12,
    border: `1px solid ${_withAlpha(color,.32)}`,
    background: `linear-gradient(135deg, ${_withAlpha(color,.10)}, rgba(255,255,255,.03))`,
    color: color,
    fontFamily: 'var(--font-label)',
    fontSize: opts.compact ? '12px' : '13px',
    fontWeight: 800,
    letterSpacing: 1,
    cursor: 'pointer'
  };
}

function _badgeStyle(status, color){
  if(status === 'complete'){
    return {
      background: color + '22',
      border: `1px solid ${color}66`,
      color
    };
  }
  if(status === 'partial'){
    return {
      background: 'rgba(255,212,71,.14)',
      border: '1px solid rgba(255,212,71,.45)',
      color: 'var(--gold)'
    };
  }
  if(status === 'empty'){
    return {
      background: 'rgba(255,59,92,.12)',
      border: '1px solid rgba(255,59,92,.4)',
      color: 'var(--red)'
    };
  }
  return {
    background: 'rgba(255,255,255,.06)',
    border: '1px solid rgba(255,255,255,.12)',
    color: 'rgba(255,255,255,.55)'
  };
}

function _sectionRequiredFields(section, config){
  return (section.fields || [])
    .filter(f => window.SchemaUtils.isVisible(f, config))
    .filter(f => f.required);
}

function _sectionFilledCount(section, config){
  const required = _sectionRequiredFields(section, config);
  const hasValue = window.SchemaUtils.hasValue || function(field, value){
    if(field.type === 'boolean') return value === true || value === false;
    if(field.type === 'multi_select' || field.type === 'list_text') return Array.isArray(value) && value.length > 0;
    if(field.type === 'number') return value !== null && value !== undefined && value !== '';
    return String(value ?? '').trim().length > 0;
  };

  return required.filter(f => hasValue(f, config[f.id])).length;
}

function _sectionPercent(section, config){
  const total = _sectionRequiredFields(section, config).length;
  if(total === 0) return 100;
  const filled = _sectionFilledCount(section, config);
  return Math.round((filled / total) * 100);
}

function _disabledReason(field, config){
  if(!field.visible_if) return '';
  const failed = Object.entries(field.visible_if).filter(([key, expected])=>{
    const current = config[key];
    if(Array.isArray(expected)) return !expected.includes(current);
    return current !== expected;
  });
  if(!failed.length) return '';
  return 'No aplica con la configuración actual';
}

function ValidationPanel({ validation }){
  if(!validation) return null;
  const { errors = [], warnings = [] } = validation;
  if(errors.length === 0 && warnings.length === 0) return null;

  return (
    <div style={{marginBottom:16}}>
      {errors.length > 0 && (
        <div className="os-alert alert-red" style={{marginBottom:8, display:'block'}}>
          <div style={{fontWeight:700, marginBottom:6}}>Antes de guardar, revisa esto:</div>
          {errors.map((msg, i)=><div key={i}>• {msg}</div>)}
        </div>
      )}
      {warnings.length > 0 && (
        <div className="os-alert alert-cyan" style={{display:'block'}}>
          <div style={{fontWeight:700, marginBottom:6}}>Sugerencias automáticas:</div>
          {warnings.map((msg, i)=><div key={i}>• {msg}</div>)}
        </div>
      )}
    </div>
  );
}

function HumanSummary({ config }){
  const summary = window.SchemaUtils.summarizeConfig(config);
  const autoBehaviors = Array.isArray(config?.autoBehaviors) ? config.autoBehaviors : [];
  const phases = Array.isArray(config?.gamePhases) ? config.gamePhases : [];
  const checklist = Array.isArray(config?.phaseChecklist) ? config.phaseChecklist : [];
  const entities = Array.isArray(config?.externalEntities) ? config.externalEntities : [];

  return (
    <div style={{
      marginBottom:16,
      background:'linear-gradient(135deg,rgba(0,245,255,.07),rgba(155,93,229,.06))',
      border:'1px solid rgba(255,255,255,.08)',
      borderRadius:16,
      padding:'14px 16px'
    }}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
        <div style={{
          width:46,height:46,borderRadius:14,
          background:'rgba(255,255,255,.08)',
          border:'1px solid rgba(255,255,255,.10)',
          display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:'1.45rem', flexShrink:0
        }}>
          {summary.emoji}
        </div>
        <div style={{minWidth:0}}>
          <div style={{fontFamily:'var(--font-display)',fontSize:'1rem',letterSpacing:1,color:'var(--cyan)'}}>
            {summary.title}
          </div>
          <div style={{fontFamily:'var(--font-label)',fontSize:'12px',color:'rgba(255,255,255,.45)'}}>
            {summary.players} · {summary.mode}
          </div>
        </div>
      </div>

      <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
        {[
          `Victoria: ${summary.victory}`
        ].map((pill, i)=>(
          <div key={i} style={{
            padding:'6px 10px',
            borderRadius:999,
            background:'rgba(255,255,255,.05)',
            border:'1px solid rgba(255,255,255,.08)',
            fontFamily:'var(--font-label)',
            fontSize:'var(--fs-micro)',
            color:'rgba(255,255,255,.62)'
          }}>
            {pill}
          </div>
        ))}
      </div>
      {(phases.length > 0 || checklist.length > 0 || entities.length > 0) && <>
        <div style={{fontFamily:'var(--font-label)',fontSize:'11px',letterSpacing:1.2,color:'rgba(255,255,255,.48)',marginBottom:8,textTransform:'uppercase'}}>Fases y checklist</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:8,marginBottom:12}}>
          {phases.map((p)=><div key={p.id} style={{padding:'9px 12px',borderRadius:12,background:'rgba(255,138,61,.08)',border:'1px solid rgba(255,138,61,.24)',color:'rgba(255,255,255,.86)',fontFamily:'var(--font-label)',fontSize:'12px'}}>🧭 {p.order}. {p.label}</div>)}
          {checklist.map((c)=><div key={c.id} style={{padding:'9px 12px',borderRadius:12,background:'rgba(183,255,60,.07)',border:'1px solid rgba(183,255,60,.22)',color:'rgba(255,255,255,.82)',fontFamily:'var(--font-label)',fontSize:'12px'}}>☑ {c.label}</div>)}
          {entities.map((e)=><div key={e.id} style={{padding:'9px 12px',borderRadius:12,background:'rgba(74,144,255,.07)',border:'1px solid rgba(74,144,255,.22)',color:'rgba(255,255,255,.82)',fontFamily:'var(--font-label)',fontSize:'12px'}}>{e.icon || '📦'} {e.label}{e.defaultState ? `: ${e.defaultState}` : ''}</div>)}
        </div>
      </>}

      {autoBehaviors.length > 0 && <>
        <div style={{fontFamily:'var(--font-label)',fontSize:'11px',letterSpacing:1.2,color:'rgba(255,255,255,.48)',marginBottom:8,textTransform:'uppercase'}}>Reglas automáticas del sistema</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:8}}>{autoBehaviors.map((rule)=><div key={rule.id} style={{padding:'9px 12px',borderRadius:12,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',color:'rgba(255,255,255,.82)',fontFamily:'var(--font-label)',fontSize:'12px'}}>{rule.label || rule.effect}</div>)}</div>
      </>}
    </div>
  );
}

function EmojiInlineField({ nameValue, emojiValue, onChangeName, onChangeEmoji }){
  return (
    <div style={{
      marginBottom:10,
      padding:'8px',
      borderRadius:12,
      border:'1px solid rgba(255,255,255,.07)',
      background:'rgba(255,255,255,.03)'
    }}>
      <div style={{
        fontFamily:'var(--font-label)',
        fontSize:'11px',
        color:'rgba(255,255,255,.55)',
        letterSpacing:1,
        marginBottom:7
      }}>
        Nombre del juego
      </div>

      <div style={{display:'flex',gap:8,alignItems:'stretch'}}>
        <div style={{
          width:56,
          minWidth:56,
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          borderRadius:12,
          border:'1px solid rgba(255,255,255,.10)',
          background:'rgba(255,255,255,.04)',
          padding:'6px'
        }}>
          <EmojiPickerField
            value={emojiValue || '🎮'}
            onChange={onChangeEmoji}
            disabled={false}
          />
        </div>

        <input
          className="os-input"
          style={{flex:1, marginBottom:0, minHeight:38, fontSize:'0.88rem', padding:'8px 10px'}}
          value={nameValue ?? ''}
          onChange={e=>onChangeName(e.target.value)}
          placeholder="Ej. Strike, Cubilete, Sushi..."
        />
      </div>
    </div>
  );
}

function ListTextField({ label, value, onChange, disabled }){
  const [draft, setDraft] = React.useState('');

  function _safeItemText(item){
    if(item == null) return '';
    if(typeof item === 'string' || typeof item === 'number') return String(item);
    if(typeof item === 'object'){
      if(item.label) return String(item.label);
      if(item.name) return String(item.name);
      if(item.id) return String(item.id);
      try{
        return JSON.stringify(item);
      }catch{
        return '[objeto]';
      }
    }
    return String(item);
  }

  return (
    <div style={{marginBottom:12, opacity: disabled ? .45 : 1}}>
      <div style={{
        fontFamily:'var(--font-label)',
        fontSize:'12px',
        color:'rgba(255,255,255,.55)',
        letterSpacing:1,
        marginBottom:6
      }}>
        {label}
      </div>

      {(value || []).map((item, idx)=>(
        <div key={idx} style={{display:'flex',gap:8,marginBottom:6,alignItems:'center'}}>
          <div style={{
            flex:1,
            padding:'8px 10px',
            borderRadius:10,
            background:'rgba(255,255,255,.04)',
            border:'1px solid rgba(255,255,255,.08)',
            fontFamily:'var(--font-body)',
            fontSize:'13px',
            color:'rgba(255,255,255,.82)'
          }}>
            {_safeItemText(item)}
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={()=>onChange((value || []).filter((_,i)=>i!==idx))}
              style={{background:'none',border:'none',color:'var(--red)',cursor:'pointer',fontSize:'1rem'}}
            >
              ×
            </button>
          )}
        </div>
      ))}

      {!disabled && (
        <div style={{display:'flex',gap:8}}>
          <input
            className="os-input"
            style={{marginBottom:0, flex:1, minHeight:42, fontSize:'0.92rem', padding:'10px 12px'}}
            value={draft}
            onChange={e=>setDraft(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-ghost"
            style={{width:'auto'}}
            onClick={()=>{
              if(!draft.trim()) return;
              onChange([...(value || []), draft.trim()]);
              setDraft('');
            }}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}



function _splitCSV(text){
  return String(text || '').split(',').map(x=>x.trim()).filter(Boolean);
}

function _rowInputStyle(){
  return {
    marginBottom:0,
    minHeight:30,
    padding:'4px 8px',
    fontSize:'0.8rem',
    borderRadius:10
  };
}

const BUILDER_EMOJI_OPTIONS = [
  '🎮','🎲','🃏','🪙','🏆','⚔️','💀','🛡️','⭐','🔥',
  '🎯','👑','💌','🤠','👹','🧱','🍣','🐍','🎴','🟥',
  '🟦','🟩','🟨','🟪','🟧','❤️','⚡','💎','🧠','👾',
  '🚀','🌙','☀️','🌈','🍀','🎪','🎭','🎵','🔮','🗝️',
  '📦','📜','🧪','🕹️','🎰','🏁','🏹','🪄','🥷','🐉',
  '🦊','🐺','🐻','🐼','🐸','🦉','🦄','🐙','🦂','🦖',
  '🥇','🥈','🥉','🎖️','🧭','🗺️','🏰','🌋','🌊','🌪️',
  '🍎','🍇','🍉','🍄','🥕','🍔','🍕','🍪','☕','🧃',
  '👀','❗','❓','✅','❌','➕','➖','✖️','🔁','⏱️',
  '📈','📉','💥','💫','🌟','🔒','🔓','🎁','🪬','🫧'
];

function _normalizeHexColor(value, fallback = '#00F5FF'){
  const raw = String(value || '').trim();
  if(/^#[0-9a-fA-F]{6}$/.test(raw)) return raw.toUpperCase();
  if(/^#[0-9a-fA-F]{3}$/.test(raw)){
    return ('#' + raw.slice(1).split('').map(ch=>ch+ch).join('')).toUpperCase();
  }
  return fallback.toUpperCase();
}

function _cardEditorStyle(color){
  return {
    padding:'10px',
    borderRadius:12,
    background:'linear-gradient(135deg, rgba(255,255,255,.03), rgba(255,255,255,.018))',
    border:`1px solid ${_withAlpha(color || '#00F5FF', .18)}`,
    marginBottom:8
  };
}

function MiniAddButton({ label, onClick, color='#00F5FF', disabled }){
  return (
    <button
      type='button'
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        width:'auto',
        minWidth:104,
        padding:'8px 12px',
        borderRadius:12,
        border:`1px solid ${_withAlpha(color,.28)}`,
        background:`linear-gradient(135deg, ${_withAlpha(color,.14)}, rgba(255,255,255,.03))`,
        color:'#fff',
        fontFamily:'var(--font-label)',
        fontSize:'12px',
        fontWeight:800,
        letterSpacing:.8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow:`0 0 14px -8px ${color}`,
        transition:'transform .18s ease, box-shadow .18s ease',
        textTransform:'none'
      }}
      onMouseDown={e=>{ e.currentTarget.style.transform='scale(.97)'; }}
      onMouseUp={e=>{ e.currentTarget.style.transform='scale(1)'; }}
      onMouseLeave={e=>{ e.currentTarget.style.transform='scale(1)'; }}
    >
      ✚ {label}
    </button>
  );
}

function ContextHint({ title, lines = [] }){
  return (
    <div style={{
      marginBottom:8,
      padding:'9px 10px',
      borderRadius:10,
      background:'rgba(255,255,255,.025)',
      border:'1px dashed rgba(255,255,255,.10)'
    }}>
      <div style={{fontFamily:'var(--font-label)',fontSize:'11px',fontWeight:800,letterSpacing:1,color:'rgba(255,255,255,.64)',marginBottom:4}}>
        {title}
      </div>
      {lines.map((line, i)=>(
        <div key={i} style={{fontFamily:'var(--font-label)',fontSize:'11px',lineHeight:1.4,color:'rgba(255,255,255,.44)'}}>
          • {line}
        </div>
      ))}
    </div>
  );
}

function ColorPickerField({ value, onChange, disabled, accent='#00F5FF' }){
  const [open, setOpen] = React.useState(false);
  const current = _normalizeHexColor(value || accent, accent);
  const swatches = ['#9B5DE5','#FFD447','#FF3B5C','#00FF9D','#FF4FA3','#B7FF3C','#FF8A3D','#4A90FF','#00F5FF','#FFFFFF'];

  return (
    <div style={{position:'relative'}}>
      <button
        type='button'
        disabled={disabled}
        onClick={()=>!disabled && setOpen(v=>!v)}
        style={{
          width:'100%',
          minHeight:30,
          borderRadius:12,
          border:`1px solid ${_withAlpha(current,.42)}`,
          background:'rgba(255,255,255,.04)',
          cursor:disabled?'not-allowed':'pointer',
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          padding:'3px'
        }}
        aria-label='Elegir color'
      >
        <span style={{
          width:24,
          height:24,
          borderRadius:8,
          background:current,
          border:'1px solid rgba(255,255,255,.22)',
          display:'block'
        }}/>
      </button>

      {open && !disabled && (
        <div style={{
          position:'absolute',
          zIndex:20,
          top:'calc(100% + 6px)',
          right:0,
          width:150,
          padding:8,
          borderRadius:14,
          border:'1px solid rgba(255,255,255,.12)',
          background:'linear-gradient(180deg, rgba(9,12,22,.98), rgba(8,9,20,.98))',
          boxShadow:'0 14px 30px rgba(0,0,0,.38)'
        }}>
          <label style={{
            height:30,borderRadius:10,border:`1px solid ${_withAlpha(current,.40)}`,
            background:current,cursor:'pointer',display:'block',position:'relative',overflow:'hidden',marginBottom:8
          }}>
            <input
              type='color'
              value={current}
              onChange={e=>onChange(_normalizeHexColor(e.target.value, accent))}
              style={{opacity:0,position:'absolute',inset:0,width:'100%',height:'100%',cursor:'pointer'}}
            />
          </label>

          <div style={{display:'grid',gridTemplateColumns:'repeat(5, 1fr)',gap:7}}>
            {swatches.map(sw=>(
              <button
                key={sw}
                type='button'
                onClick={()=>{ onChange(sw); setOpen(false); }}
                style={{
                  width:'100%',
                  aspectRatio:'1 / 1',
                  borderRadius:999,
                  border:`2px solid ${current===sw ? '#fff' : 'rgba(255,255,255,.10)'}`,
                  background:sw,
                  cursor:'pointer',
                  padding:0
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EmojiPickerField({ value, onChange, disabled }){
  const [open, setOpen] = React.useState(false);
  const current = value || '🎮';

  return (
    <div style={{position:'relative'}}>
      <button
        type='button'
        disabled={disabled}
        onClick={()=>!disabled && setOpen(v=>!v)}
        style={{
          width:'100%',
          minHeight:30,
          borderRadius:12,
          border:'1px solid rgba(255,255,255,.10)',
          background:'rgba(255,255,255,.04)',
          color:'#fff',
          cursor:disabled?'not-allowed':'pointer',
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          padding:'2px'
        }}
        aria-label='Elegir emoji'
      >
        <span style={{fontSize:'1rem', lineHeight:1}}>{current}</span>
      </button>

      {open && !disabled && (
        <div style={{
          position:'absolute',
          zIndex:20,
          top:'calc(100% + 6px)',
          left:0,
          width:300,
          maxWidth:'min(300px, 78vw)',
          padding:8,
          borderRadius:14,
          border:'1px solid rgba(255,255,255,.12)',
          background:'linear-gradient(180deg, rgba(9,12,22,.98), rgba(8,9,20,.98))',
          boxShadow:'0 14px 30px rgba(0,0,0,.38)'
        }}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(10, 1fr)',gap:6,maxHeight:210,overflowY:'auto'}}>
            {BUILDER_EMOJI_OPTIONS.map(emoji=>(
              <button
                key={emoji}
                type='button'
                onClick={()=>{ onChange(emoji); setOpen(false); }}
                style={{
                  width:'100%',
                  aspectRatio:'1 / 1',
                  borderRadius:9,
                  border:`1px solid ${emoji===current ? 'rgba(0,245,255,.55)' : 'rgba(255,255,255,.08)'}`,
                  background:emoji===current ? 'rgba(0,245,255,.12)' : 'rgba(255,255,255,.03)',
                  cursor:'pointer',
                  fontSize:'0.95rem'
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CounterSetEditor({ value = [], onChange, disabled }){
  const items = Array.isArray(value) ? value : [];
  function add(){ onChange([...(items||[]), { id:`counter_${Date.now()}`, label:'Contador', color:'#FFD447', icon:'🪙', scope:'player', initialValue:0, min:0, max:null, resetOn:'never', visibleTo:'all' }]); }
  function update(idx, patch){ onChange(items.map((x,i)=> i===idx ? { ...x, ...patch } : x)); }
  function remove(idx){ onChange(items.filter((_,i)=>i!==idx)); }
  return <div style={{opacity: disabled ? .45 : 1}}>
    <ContextHint title='¿Qué son?' lines={['Contadores persistentes visibles para todos o ciertos roles.', 'Úsalos para vidas, energía, monedas o cualquier recurso continuo.']} />
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
      <div style={{fontFamily:'var(--font-label)',fontSize:'12px',color:'rgba(255,255,255,.55)'}}>Contadores visibles</div>
      {!disabled && <MiniAddButton label='Contador' color='#FFD447' onClick={add} />}
    </div>
    {items.map((item, idx)=><div key={item.id||idx} style={_cardEditorStyle(item.color || '#FFD447')}>
      <div style={{display:'grid',gridTemplateColumns:'46px 46px 1fr',gap:8,marginBottom:8}}>
        <EmojiPickerField disabled={disabled} value={item.icon||'🪙'} onChange={emoji=>update(idx,{icon:emoji})} />
        <ColorPickerField disabled={disabled} value={item.color||'#FFD447'} onChange={color=>update(idx,{color})} accent='#FFD447' />
        <input className='os-input' style={_rowInputStyle()} disabled={disabled} value={item.label||''} onChange={e=>update(idx,{label:e.target.value})} placeholder='Vidas / Energía' />
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:8}}>
        <select className='os-select' style={_rowInputStyle()} disabled={disabled} value={item.scope||'player'} onChange={e=>update(idx,{scope:e.target.value})}><option value='player'>Jugador</option><option value='team'>Equipo</option><option value='global'>Global</option></select>
        <input className='os-input' type='number' style={_rowInputStyle()} disabled={disabled} value={item.initialValue ?? 0} onChange={e=>update(idx,{initialValue:e.target.value})} placeholder='Inicial' />
        <select className='os-select' style={_rowInputStyle()} disabled={disabled} value={item.visibleTo||'all'} onChange={e=>update(idx,{visibleTo:e.target.value})}><option value='all'>Todos</option><option value='host'>Host</option><option value='player'>Jugador</option></select>
      </div>
      {!disabled && <button type='button' className='btn btn-ghost' style={{width:'auto', color:'var(--red)', padding:'6px 9px', fontSize:'11px'}} onClick={()=>remove(idx)}>Eliminar</button>}
    </div>)}
  </div>;
}

function ResultActionsEditor({ value = [], onChange, disabled }){
  const items = Array.isArray(value) ? value : [];
  function add(){ onChange([...(items||[]), { id:`result_${Date.now()}`, label:'Resultado', icon:'🏁', color:'#00FF9D', scope:'round', target:'self', effect:'record_only', visibleTo:'all', isPrimary:true, prompt:'' }]); }
  function update(idx, patch){ onChange(items.map((x,i)=> i===idx ? { ...x, ...patch } : x)); }
  function remove(idx){ onChange(items.filter((_,i)=>i!==idx)); }
  return <div style={{opacity: disabled ? .45 : 1}}>
    <ContextHint title='¿Cuál es la diferencia?' lines={['Esto crea botones de resultado visibles en el pad del jugador.', 'Úsalos para Fuera, Ganó ronda, Eliminar, Sobrevive o Solo registro.']} />
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
      <div style={{fontFamily:'var(--font-label)',fontSize:'12px',color:'rgba(255,255,255,.55)'}}>Botones/resultados personalizados</div>
      {!disabled && <MiniAddButton label='Acción' color='#00FF9D' onClick={add} />}
    </div>
    {items.map((item, idx)=><div key={item.id || idx} style={_cardEditorStyle(item.color || '#00FF9D')}>
      <div style={{display:'grid',gridTemplateColumns:'46px 46px 1fr',gap:8,marginBottom:8}}>
        <EmojiPickerField disabled={disabled} value={item.icon||'🏁'} onChange={emoji=>update(idx,{icon:emoji})} />
        <ColorPickerField disabled={disabled} value={item.color||'#00FF9D'} onChange={color=>update(idx,{color})} accent='#00FF9D' />
        <input className='os-input' style={_rowInputStyle()} disabled={disabled} value={item.label||''} onChange={e=>update(idx,{label:e.target.value})} placeholder='Fuera / Gané / Eliminar' />
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:8}}>
        <select className='os-select' style={_rowInputStyle()} disabled={disabled} value={item.scope||'round'} onChange={e=>update(idx,{scope:e.target.value})}><option value='round'>Ronda</option><option value='turn'>Turno</option><option value='match'>Partida</option></select>
        <select className='os-select' style={_rowInputStyle()} disabled={disabled} value={item.effect||'record_only'} onChange={e=>update(idx,{effect:e.target.value})}><option value='mark_victory'>Marca victoria</option><option value='mark_defeat'>Marca derrota</option><option value='mark_out'>Fuera</option><option value='survive'>Sobrevive</option><option value='record_only'>Solo registro</option></select>
        <select className='os-select' style={_rowInputStyle()} disabled={disabled} value={item.visibleTo||'all'} onChange={e=>update(idx,{visibleTo:e.target.value})}><option value='host'>Host</option><option value='player'>Jugador</option><option value='all'>Todos</option></select>
      </div>
      <input className='os-input' style={{..._rowInputStyle(), width:'100%'}} disabled={disabled} value={item.prompt||''} onChange={e=>update(idx,{prompt:e.target.value})} placeholder='Pregunta opcional: ¿Con cuántos dados quedó?' />
      {!disabled && <button type='button' className='btn btn-ghost' style={{width:'auto', marginTop:8, color:'var(--red)', padding:'6px 9px', fontSize:'11px'}} onClick={()=>remove(idx)}>Eliminar</button>}
    </div>)}
  </div>;
}

function CaptureActionsEditor({ value = [], onChange, disabled }){
  const items = Array.isArray(value) ? value : [];
  function add(){ onChange([...(items||[]), { id:`capture_${Date.now()}`, label:'Captura', icon:'📝', color:'#FFD447', captureType:'number', targetRegister:'points', min:0, max:null, quickValues:[], visibleTo:'host', askAt:'manual', options:[] }]); }
  function update(idx, patch){ onChange(items.map((x,i)=> i===idx ? { ...x, ...patch } : x)); }
  function remove(idx){ onChange(items.filter((_,i)=>i!==idx)); }
  return <div style={{opacity: disabled ? .45 : 1}}>
    <ContextHint title='¿Para qué sirven?' lines={['Piden datos extra como dados restantes, tiradas usadas o posición final.', 'Úsalas cuando quieras guardar un valor, no solo marcar un resultado.']} />
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
      <div style={{fontFamily:'var(--font-label)',fontSize:'12px',color:'rgba(255,255,255,.55)'}}>Capturas opcionales</div>
      {!disabled && <MiniAddButton label='Captura' color='#FFD447' onClick={add} />}
    </div>
    {items.map((item, idx)=><div key={item.id||idx} style={_cardEditorStyle(item.color || '#FFD447')}>
      <div style={{display:'grid',gridTemplateColumns:'46px 46px 1fr',gap:8,marginBottom:8}}>
        <EmojiPickerField disabled={disabled} value={item.icon||'📝'} onChange={emoji=>update(idx,{icon:emoji})} />
        <ColorPickerField disabled={disabled} value={item.color||'#FFD447'} onChange={color=>update(idx,{color})} accent='#FFD447' />
        <input className='os-input' style={_rowInputStyle()} disabled={disabled} value={item.label||''} onChange={e=>update(idx,{label:e.target.value})} placeholder='Dados restantes / Tiradas' />
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:8}}>
        <select className='os-select' style={_rowInputStyle()} disabled={disabled} value={item.captureType||'number'} onChange={e=>update(idx,{captureType:e.target.value})}><option value='number'>Número</option><option value='select'>Selector</option><option value='text'>Texto</option></select>
        <input className='os-input' style={_rowInputStyle()} disabled={disabled} value={item.targetRegister||''} onChange={e=>update(idx,{targetRegister:e.target.value})} placeholder='points / wins / custom' />
        <select className='os-select' style={_rowInputStyle()} disabled={disabled} value={item.askAt||'manual'} onChange={e=>update(idx,{askAt:e.target.value})}><option value='manual'>Manual</option><option value='round_end'>Fin ronda</option><option value='match_end'>Fin partida</option></select>
      </div>
      {item.captureType === 'number' && <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}><input className='os-input' type='number' style={_rowInputStyle()} disabled={disabled} value={item.min ?? 0} onChange={e=>update(idx,{min:e.target.value})} placeholder='Min' /><input className='os-input' type='number' style={_rowInputStyle()} disabled={disabled} value={item.max ?? ''} onChange={e=>update(idx,{max:e.target.value})} placeholder='Max' /></div>}
      {item.captureType === 'select' && <input className='os-input' style={{..._rowInputStyle(), width:'100%', marginBottom:8}} disabled={disabled} value={(item.options||[]).join(', ')} onChange={e=>update(idx,{options:_splitCSV(e.target.value)})} placeholder='Opciones: 1,2,3 o Full,Póker,Corrida' />}
      {!disabled && <button type='button' className='btn btn-ghost' style={{width:'auto', color:'var(--red)', padding:'6px 9px', fontSize:'11px'}} onClick={()=>remove(idx)}>Eliminar</button>}
    </div>)}
  </div>;
}

function StatusIndicatorsEditor({ value = [], onChange, disabled }){
  const items = Array.isArray(value) ? value : [];
  function add(){ onChange([...(items||[]), { id:`status_${Date.now()}`, label:'Protegido', icon:'🛡️', color:'#4A90FF', scope:'player', visibility:'all', mode:'toggle', defaultValue:false, durationMode:'manual', clearOn:'none' }]); }
  function update(idx, patch){ onChange(items.map((x,i)=> i===idx ? { ...x, ...patch } : x)); }
  function remove(idx){ onChange(items.filter((_,i)=>i!==idx)); }
  return <div style={{opacity: disabled ? .45 : 1}}>
    <ContextHint title='¿Qué muestran?' lines={['Son estados ON/OFF visibles en el marcador en vivo.', 'Aquí asumimos que todos los verán; úsalos para Protegido, Sheriff, Maid o Bloqueado.']} />
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
      <div style={{fontFamily:'var(--font-label)',fontSize:'12px',color:'rgba(255,255,255,.55)'}}>Estados visibles en el marcador</div>
      {!disabled && <MiniAddButton label='Indicador' color='#4A90FF' onClick={add} />}
    </div>
    {items.map((item, idx)=><div key={item.id||idx} style={_cardEditorStyle(item.color || '#4A90FF')}>
      <div style={{display:'grid',gridTemplateColumns:'46px 46px 1fr',gap:8,marginBottom:8}}>
        <EmojiPickerField disabled={disabled} value={item.icon||'🛡️'} onChange={emoji=>update(idx,{icon:emoji})} />
        <ColorPickerField disabled={disabled} value={item.color||'#4A90FF'} onChange={color=>update(idx,{color})} accent='#4A90FF' />
        <input className='os-input' style={_rowInputStyle()} disabled={disabled} value={item.label||''} onChange={e=>update(idx,{label:e.target.value})} placeholder='Protegido / Sheriff' />
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
        <select className='os-select' style={_rowInputStyle()} disabled={disabled} value={item.scope||'player'} onChange={e=>update(idx,{scope:e.target.value})}><option value='player'>Jugador</option><option value='team'>Equipo</option><option value='global'>Global</option></select>
        <select className='os-select' style={_rowInputStyle()} disabled={disabled} value={item.durationMode||'manual'} onChange={e=>update(idx,{durationMode:e.target.value})}><option value='manual'>Manual</option><option value='turn'>Hasta fin turno</option><option value='round'>Hasta fin ronda</option></select>
      </div>
      {!disabled && <button type='button' className='btn btn-ghost' style={{width:'auto', color:'var(--red)', padding:'6px 9px', fontSize:'11px'}} onClick={()=>remove(idx)}>Eliminar</button>}
    </div>)}
  </div>;
}

function RoundQuestionsEditor({ value = [], onChange, disabled }){
  const items = Array.isArray(value) ? value : [];
  function add(){ onChange([...(items||[]), { id:`question_${Date.now()}`, label:'Tipo de jugada', inputType:'select', options:['Full','Póker','Corrida'], required:true, saveAs:'handType', visibleTo:'host', min:0, max:null }]); }
  function update(idx, patch){ onChange(items.map((x,i)=> i===idx ? { ...x, ...patch } : x)); }
  function remove(idx){ onChange(items.filter((_,i)=>i!==idx)); }
  return <div style={{opacity: disabled ? .45 : 1}}>
    <ContextHint title='¿Cuándo aparecen?' lines={['Estas preguntas salen al cierre de ronda o partida.', 'Úsalas para tipo de jugada, tiradas usadas, dados restantes o notas importantes.']} />
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
      <div style={{fontFamily:'var(--font-label)',fontSize:'12px',color:'rgba(255,255,255,.55)'}}>Preguntas al cierre de ronda</div>
      {!disabled && <MiniAddButton label='Pregunta' color='#00F5FF' onClick={add} />}
    </div>
    {items.map((item, idx)=><div key={item.id||idx} style={_cardEditorStyle('#00F5FF')}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 130px',gap:8,marginBottom:8}}><input className='os-input' style={_rowInputStyle()} disabled={disabled} value={item.label||''} onChange={e=>update(idx,{label:e.target.value})} placeholder='¿Con cuántas tiradas lo logró?' /><select className='os-select' style={_rowInputStyle()} disabled={disabled} value={item.inputType||'select'} onChange={e=>update(idx,{inputType:e.target.value})}><option value='select'>Selector</option><option value='number'>Número</option><option value='text'>Texto</option></select></div>
      <input className='os-input' style={{..._rowInputStyle(), width:'100%', marginBottom:8}} disabled={disabled} value={item.saveAs||''} onChange={e=>update(idx,{saveAs:e.target.value})} placeholder='Clave guardada: throwsUsed' />
      {item.inputType === 'select' && <input className='os-input' style={{..._rowInputStyle(), width:'100%', marginBottom:8}} disabled={disabled} value={(item.options||[]).join(', ')} onChange={e=>update(idx,{options:_splitCSV(e.target.value)})} placeholder='Opciones: 1,2,3 o Full,Póker,Corrida' />}
      {item.inputType === 'number' && <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}><input className='os-input' type='number' style={_rowInputStyle()} disabled={disabled} value={item.min ?? 0} onChange={e=>update(idx,{min:e.target.value})} placeholder='Min' /><input className='os-input' type='number' style={_rowInputStyle()} disabled={disabled} value={item.max ?? ''} onChange={e=>update(idx,{max:e.target.value})} placeholder='Max' /></div>}
      {!disabled && <button type='button' className='btn btn-ghost' style={{width:'auto', color:'var(--red)', padding:'6px 9px', fontSize:'11px'}} onClick={()=>remove(idx)}>Eliminar</button>}
    </div>)}
  </div>;
}

function AutoBehaviorsEditor({ value = [], onChange, disabled }){
  const items = Array.isArray(value) ? value : [];
  function add(){ onChange([...(items||[]), { id:`behavior_${Date.now()}`, trigger:'player_eliminated', condition:'only_one_active_remains', effect:'declare_round_winner', enabled:true, clearAfter:false, label:'' }]); }
  function update(idx, patch){ onChange(items.map((x,i)=> i===idx ? { ...x, ...patch } : x)); }
  function remove(idx){ onChange(items.filter((_,i)=>i!==idx)); }
  return <div style={{opacity: disabled ? .45 : 1}}>
    <ContextHint title='¿Qué automatizan?' lines={['Son reglas sugeridas para evitar pasos manuales repetidos.', 'Ejemplo: si solo queda uno vivo, declarar ganador de ronda automáticamente.']} />
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
      <div style={{fontFamily:'var(--font-label)',fontSize:'12px',color:'rgba(255,255,255,.55)'}}>Automatizaciones sugeridas</div>
      {!disabled && <MiniAddButton label='Regla' color='#FF8A3D' onClick={add} />}
    </div>
    {items.map((item, idx)=><div key={item.id||idx} style={_cardEditorStyle('#FF8A3D')}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:8}}><input className='os-input' style={_rowInputStyle()} disabled={disabled} value={item.trigger||''} onChange={e=>update(idx,{trigger:e.target.value})} placeholder='player_eliminated' /><input className='os-input' style={_rowInputStyle()} disabled={disabled} value={item.condition||''} onChange={e=>update(idx,{condition:e.target.value})} placeholder='only_one_active_remains' /><input className='os-input' style={_rowInputStyle()} disabled={disabled} value={item.effect||''} onChange={e=>update(idx,{effect:e.target.value})} placeholder='declare_round_winner' /></div>
      {!disabled && <button type='button' className='btn btn-ghost' style={{width:'auto', color:'var(--red)', padding:'6px 9px', fontSize:'11px'}} onClick={()=>remove(idx)}>Eliminar</button>}
    </div>)}
  </div>;
}


function safeEval(expr){
  try{
    let clean = String(expr || '').replace(/[^0-9+\-*/().]/g,'');
    if(!clean) return 0;
    clean = clean.replace(/(^|[^0-9])0+(\d+)/g, '$1$2');
    const r = Function('return (' + clean + ')')();
    return Number.isFinite(r) ? Math.round(r * 100) / 100 : null;
  }catch(e){
    if(field.type === 'lifecycle_editor'){
    return <div style={wrapStyle}><LifecycleEditor value={Array.isArray(value)?value:[]} onChange={set} disabled={disabled} />{reason && <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)'}}>{reason}</div>}</div>;
  }

  return null;
  }
}

function ScoreCalculatorModal({ title='Calculadora', subtitle='', initialValue='', allowNegative=false, onClose, onSubmit }){
  const [expr, setExpr] = React.useState(initialValue !== undefined && initialValue !== null && String(initialValue) !== '' ? String(initialValue) : '');
  const calcResult = safeEval(expr);
  const hasError = expr.trim() && calcResult === null;

  function pressNum(n){ setExpr(p => p + String(n)); }
  function pressOp(op){
    setExpr(p => {
      const v = String(p || '');
      if(!v && op !== '-') return v;
      return v + op;
    });
  }
  function pressDel(){ setExpr(p => String(p || '').slice(0, -1)); }
  function pressClear(){ setExpr(''); }

  function confirm(){
    if(calcResult === null) return;
    let finalVal = calcResult;
    if(!allowNegative) finalVal = Math.max(0, finalVal);
    if(onSubmit) onSubmit(finalVal);
  }

  const keyStyle = {
    border:'1px solid rgba(255,255,255,.10)',
    borderRadius:14,
    minHeight:46,
    background:'rgba(255,255,255,.05)',
    color:'#fff',
    fontFamily:'var(--font-display)',
    fontSize:'1rem',
    cursor:'pointer'
  };

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:1200,
      background:'rgba(7,9,16,.72)', backdropFilter:'blur(8px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:16
    }}>
      <div style={{
        width:'min(420px, 94vw)',
        borderRadius:20,
        border:'1px solid rgba(255,255,255,.12)',
        background:'linear-gradient(180deg, rgba(13,16,28,.98), rgba(9,11,22,.98))',
        boxShadow:'0 24px 70px rgba(0,0,0,.55)',
        overflow:'hidden'
      }}>
        <div style={{padding:'14px 14px 10px', borderBottom:'1px solid rgba(255,255,255,.08)'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12}}>
            <div>
              <div style={{fontFamily:'var(--font-display)', fontSize:'1rem', letterSpacing:1, color:'var(--gold, #FFD447)'}}>🧮 {title}</div>
              {subtitle ? <div style={{fontFamily:'var(--font-label)', fontSize:'11px', color:'rgba(255,255,255,.42)', marginTop:4}}>{subtitle}</div> : null}
            </div>
            <button type="button" onClick={onClose} style={{background:'none', border:'none', color:'rgba(255,255,255,.6)', fontSize:'1.2rem', cursor:'pointer'}}>✕</button>
          </div>
        </div>

        <div style={{padding:14}}>
          <div style={{
            borderRadius:16,
            border:'1px solid rgba(255,255,255,.10)',
            background:'rgba(255,255,255,.04)',
            padding:'12px 14px',
            marginBottom:12
          }}>
            <div style={{minHeight:24, fontFamily:'var(--font-label)', fontSize:'13px', color:'rgba(255,255,255,.76)', wordBreak:'break-all'}}>{expr || '0'}</div>
            <div style={{marginTop:8, fontFamily:'var(--font-display)', fontSize:'1.4rem', color: hasError ? '#FF6B6B' : 'var(--cyan, #00F5FF)'}}>
              {hasError ? 'ERROR' : calcResult}
            </div>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:8}}>
            {[
              ['7', ()=>pressNum(7)], ['8', ()=>pressNum(8)], ['9', ()=>pressNum(9)], ['÷', ()=>pressOp('/')],
              ['4', ()=>pressNum(4)], ['5', ()=>pressNum(5)], ['6', ()=>pressNum(6)], ['×', ()=>pressOp('*')],
              ['1', ()=>pressNum(1)], ['2', ()=>pressNum(2)], ['3', ()=>pressNum(3)], ['-', ()=>pressOp('-')],
              ['0', ()=>pressNum(0)], ['.', ()=>pressOp('.')], ['(', ()=>pressOp('(')], [')', ()=>pressOp(')')],
            ].map(([label, fn], idx)=>(
              <button key={idx} type="button" onClick={fn} style={keyStyle}>{label}</button>
            ))}
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginTop:8}}>
            <button type="button" onClick={pressClear} style={{...keyStyle, background:'rgba(255,107,107,.12)', color:'#FF8A8A'}}>C</button>
            <button type="button" onClick={pressDel} style={{...keyStyle, background:'rgba(255,255,255,.08)'}}>⌫</button>
            <button type="button" onClick={()=>pressOp('+')} style={{...keyStyle, background:'rgba(0,245,255,.10)', color:'var(--cyan, #00F5FF)'}}>+</button>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:12}}>
            <button type="button" onClick={onClose} style={{...keyStyle, minHeight:44, fontFamily:'var(--font-label)', fontSize:'12px'}}>Cancelar</button>
            <button type="button" onClick={confirm} disabled={calcResult===null} style={{...keyStyle, minHeight:44, fontFamily:'var(--font-label)', fontSize:'12px', background:'linear-gradient(135deg, var(--cyan, #00F5FF), #5cf4ff)', color:'#081018', opacity: calcResult===null ? 0.45 : 1}}>Usar resultado</button>
          </div>
        </div>
      </div>
    </div>
  );
}


function PhasesEditor({ value = [], onChange, disabled }){
  const items = Array.isArray(value) ? value : [];
  function add(){ onChange([...(items||[]), { id:`phase_${Date.now()}`, label:'Nueva fase', order:items.length+1, scope:'round', owner:'host', trigger:'manual', description:'' }]); }
  function update(idx, patch){ onChange(items.map((x,i)=> i===idx ? { ...x, ...patch } : x)); }
  function remove(idx){ onChange(items.filter((_,i)=>i!==idx)); }
  return <div style={{opacity: disabled ? .45 : 1}}>
    <ContextHint title='¿Para qué sirve?' lines={['Divide la partida en pasos claros para que el host no olvide qué sigue.', 'Ejemplo: preparar ronda, turno del jugador, resolver amenaza, cierre.']} />
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
      <div style={{fontFamily:'var(--font-label)',fontSize:'12px',color:'rgba(255,255,255,.55)'}}>Fases del juego</div>
      {!disabled && <MiniAddButton label='Fase' color='#FF8A3D' onClick={add} />}
    </div>
    {items.map((item, idx)=><div key={item.id||idx} style={_cardEditorStyle('#FF8A3D')}>
      <div style={{display:'grid',gridTemplateColumns:'58px 1fr 110px',gap:8,marginBottom:8}}>
        <input className='os-input' type='number' style={_rowInputStyle()} disabled={disabled} value={item.order ?? idx+1} onChange={e=>update(idx,{order:+e.target.value||idx+1})} />
        <input className='os-input' style={_rowInputStyle()} disabled={disabled} value={item.label||''} onChange={e=>update(idx,{label:e.target.value})} placeholder='Fase' />
        <select className='os-select' style={_rowInputStyle()} disabled={disabled} value={item.scope||'round'} onChange={e=>update(idx,{scope:e.target.value})}><option value='setup'>Setup</option><option value='round'>Ronda</option><option value='turn'>Turno</option><option value='endgame'>Final</option></select>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
        <select className='os-select' style={_rowInputStyle()} disabled={disabled} value={item.owner||'host'} onChange={e=>update(idx,{owner:e.target.value})}><option value='host'>Host</option><option value='player'>Jugador</option><option value='system'>Sistema</option></select>
        <select className='os-select' style={_rowInputStyle()} disabled={disabled} value={item.trigger||'manual'} onChange={e=>update(idx,{trigger:e.target.value})}><option value='manual'>Manual</option><option value='turn_start'>Inicio turno</option><option value='round_start'>Inicio ronda</option><option value='round_end'>Fin ronda</option></select>
      </div>
      <input className='os-input' style={{..._rowInputStyle(), width:'100%'}} disabled={disabled} value={item.description||''} onChange={e=>update(idx,{description:e.target.value})} placeholder='Descripción breve / recordatorio' />
      {!disabled && <button type='button' className='btn btn-ghost' style={{width:'auto', marginTop:8, color:'var(--red)', padding:'6px 9px', fontSize:'11px'}} onClick={()=>remove(idx)}>Eliminar</button>}
    </div>)}
  </div>;
}

function ChecklistEditor({ value = [], onChange, disabled }){
  const items = Array.isArray(value) ? value : [];
  function add(){ onChange([...(items||[]), { id:`check_${Date.now()}`, label:'Nuevo recordatorio', phaseId:'', visibleTo:'host', required:true, defaultDone:false, autoReset:'round' }]); }
  function update(idx, patch){ onChange(items.map((x,i)=> i===idx ? { ...x, ...patch } : x)); }
  function remove(idx){ onChange(items.filter((_,i)=>i!==idx)); }
  return <div style={{opacity: disabled ? .45 : 1}}>
    <ContextHint title='Checklist de apoyo' lines={['Recordatorios que aparecen durante la partida.', 'Ejemplo: tirar dado de monstruo, pasar primer jugador, revisar bonus final.']} />
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
      <div style={{fontFamily:'var(--font-label)',fontSize:'12px',color:'rgba(255,255,255,.55)'}}>Recordatorios</div>
      {!disabled && <MiniAddButton label='Recordatorio' color='#B7FF3C' onClick={add} />}
    </div>
    {items.map((item, idx)=><div key={item.id||idx} style={_cardEditorStyle('#B7FF3C')}>
      <input className='os-input' style={{..._rowInputStyle(), width:'100%', marginBottom:8}} disabled={disabled} value={item.label||''} onChange={e=>update(idx,{label:e.target.value})} placeholder='Recordatorio' />
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
        <input className='os-input' style={_rowInputStyle()} disabled={disabled} value={item.phaseId||''} onChange={e=>update(idx,{phaseId:e.target.value})} placeholder='phaseId opcional' />
        <select className='os-select' style={_rowInputStyle()} disabled={disabled} value={item.visibleTo||'host'} onChange={e=>update(idx,{visibleTo:e.target.value})}><option value='host'>Host</option><option value='player'>Jugador</option><option value='all'>Todos</option></select>
        <select className='os-select' style={_rowInputStyle()} disabled={disabled} value={item.autoReset||'round'} onChange={e=>update(idx,{autoReset:e.target.value})}><option value='round'>Cada ronda</option><option value='turn'>Cada turno</option><option value='never'>Manual</option></select>
      </div>
      {!disabled && <button type='button' className='btn btn-ghost' style={{width:'auto', marginTop:8, color:'var(--red)', padding:'6px 9px', fontSize:'11px'}} onClick={()=>remove(idx)}>Eliminar</button>}
    </div>)}
  </div>;
}

function ExternalEntitiesEditor({ value = [], onChange, disabled }){
  const items = Array.isArray(value) ? value : [];
  function add(){ onChange([...(items||[]), { id:`entity_${Date.now()}`, label:'Entidad', icon:'📦', entityType:'global', stateType:'status', defaultState:'', visibleTo:'all', description:'' }]); }
  function update(idx, patch){ onChange(items.map((x,i)=> i===idx ? { ...x, ...patch } : x)); }
  function remove(idx){ onChange(items.filter((_,i)=>i!==idx)); }
  return <div style={{opacity: disabled ? .45 : 1}}>
    <ContextHint title='Entidades externas' lines={['Cosas del juego que no son jugadores, pero afectan la partida.', 'Ejemplo: primer jugador, enemigo activo, bolsa de piezas, evento pendiente.']} />
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
      <div style={{fontFamily:'var(--font-label)',fontSize:'12px',color:'rgba(255,255,255,.55)'}}>Entidades externas</div>
      {!disabled && <MiniAddButton label='Entidad' color='#4A90FF' onClick={add} />}
    </div>
    {items.map((item, idx)=><div key={item.id||idx} style={_cardEditorStyle('#4A90FF')}>
      <div style={{display:'grid',gridTemplateColumns:'46px 1fr 110px',gap:8,marginBottom:8}}>
        <EmojiPickerField disabled={disabled} value={item.icon||'📦'} onChange={icon=>update(idx,{icon})} />
        <input className='os-input' style={_rowInputStyle()} disabled={disabled} value={item.label||''} onChange={e=>update(idx,{label:e.target.value})} placeholder='Primer jugador / enemigo activo' />
        <select className='os-select' style={_rowInputStyle()} disabled={disabled} value={item.entityType||'global'} onChange={e=>update(idx,{entityType:e.target.value})}><option value='global'>Global</option><option value='token'>Token</option><option value='deck'>Mazo/Bolsa</option><option value='enemy'>Enemigo</option><option value='room'>Habitación</option><option value='board'>Tablero</option></select>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:8}}>
        <select className='os-select' style={_rowInputStyle()} disabled={disabled} value={item.stateType||'status'} onChange={e=>update(idx,{stateType:e.target.value})}><option value='status'>Estado</option><option value='holder'>Quién lo tiene</option><option value='count'>Cantidad</option><option value='zone'>Zona</option></select>
        <input className='os-input' style={_rowInputStyle()} disabled={disabled} value={item.defaultState||''} onChange={e=>update(idx,{defaultState:e.target.value})} placeholder='Estado inicial' />
        <select className='os-select' style={_rowInputStyle()} disabled={disabled} value={item.visibleTo||'all'} onChange={e=>update(idx,{visibleTo:e.target.value})}><option value='all'>Todos</option><option value='host'>Host</option><option value='player'>Jugador</option></select>
      </div>
      <input className='os-input' style={{..._rowInputStyle(), width:'100%'}} disabled={disabled} value={item.description||''} onChange={e=>update(idx,{description:e.target.value})} placeholder='Descripción breve' />
      {!disabled && <button type='button' className='btn btn-ghost' style={{width:'auto', marginTop:8, color:'var(--red)', padding:'6px 9px', fontSize:'11px'}} onClick={()=>remove(idx)}>Eliminar</button>}
    </div>)}
  </div>;
}



function LifecycleEditor({ value = [], onChange, disabled }){
  const items = Array.isArray(value) ? value : [];
  function add(){ onChange([...(items||[]), { id:`lifecycle_${Date.now()}`, phaseId:'', label:'Lifecycle', reset:'round', autoEnter:false, autoExit:false, blocksAdvance:false, persistUntil:'' }]); }
  function update(idx, patch){ onChange(items.map((x,i)=> i===idx ? { ...x, ...patch } : x)); }
  function remove(idx){ onChange(items.filter((_,i)=>i!==idx)); }
  return <div style={{opacity: disabled ? .45 : 1}}>
    <ContextHint title='Lifecycle' lines={['Define cuándo se muestra, resetea o bloquea el avance una fase.', 'Si lo dejas vacío, el runtime genera defaults.']} />
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
      <div style={{fontFamily:'var(--font-label)',fontSize:'12px',color:'rgba(255,255,255,.55)'}}>Lifecycle de fases</div>
      {!disabled && <MiniAddButton label='Lifecycle' color='#9B5DE5' onClick={add} />}
    </div>
    {items.map((item, idx)=><div key={item.id||idx} style={_cardEditorStyle('#9B5DE5')}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 110px',gap:8,marginBottom:8}}>
        <input className='os-input' style={_rowInputStyle()} disabled={disabled} value={item.phaseId||''} onChange={e=>update(idx,{phaseId:e.target.value})} placeholder='phaseId' />
        <input className='os-input' style={_rowInputStyle()} disabled={disabled} value={item.label||''} onChange={e=>update(idx,{label:e.target.value})} placeholder='Etiqueta' />
        <select className='os-select' style={_rowInputStyle()} disabled={disabled} value={item.reset||'round'} onChange={e=>update(idx,{reset:e.target.value})}><option value='none'>No reset</option><option value='turn'>Turno</option><option value='round'>Ronda</option><option value='game'>Partida</option><option value='after_trigger'>Al dispararse</option></select>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
        <select className='os-select' style={_rowInputStyle()} disabled={disabled} value={item.autoEnter?'yes':'no'} onChange={e=>update(idx,{autoEnter:e.target.value==='yes'})}><option value='no'>Entrada manual</option><option value='yes'>Auto entrar</option></select>
        <select className='os-select' style={_rowInputStyle()} disabled={disabled} value={item.autoExit?'yes':'no'} onChange={e=>update(idx,{autoExit:e.target.value==='yes'})}><option value='no'>Salida manual</option><option value='yes'>Auto salir</option></select>
        <select className='os-select' style={_rowInputStyle()} disabled={disabled} value={item.blocksAdvance?'yes':'no'} onChange={e=>update(idx,{blocksAdvance:e.target.value==='yes'})}><option value='no'>No bloquea</option><option value='yes'>Bloquea avance</option></select>
      </div>
      {!disabled && <button type='button' className='btn btn-ghost' style={{width:'auto', marginTop:8, color:'var(--red)', padding:'6px 9px', fontSize:'11px'}} onClick={()=>remove(idx)}>Eliminar</button>}
    </div>)}
  </div>;
}


function AnimatedFieldMount({ children, delay = 0 }){
  const [entered, setEntered] = React.useState(false);
  React.useEffect(()=>{
    const t = setTimeout(()=>setEntered(true), delay);
    return ()=>clearTimeout(t);
  }, [delay]);

  return (
    <div style={{
      opacity: entered ? 1 : 0,
      transform: entered ? 'translateY(0) scale(1)' : 'translateY(10px) scale(.985)',
      filter: entered ? 'blur(0px)' : 'blur(2px)',
      transition: 'opacity 220ms ease, transform 320ms cubic-bezier(.22,.9,.3,1), filter 220ms ease'
    }}>
      {children}
    </div>
  );
}

function ArcadeToggle({ checked, disabled, label, sublabel, onToggle, accent='#00F5FF' }){
  return (
    <div style={{ opacity: disabled ? .55 : 1 }}>
      <button
        type="button"
        onClick={disabled ? undefined : onToggle}
        style={{
          width:'100%',
          border:`1px solid ${checked ? _withAlpha(accent,.52) : 'rgba(255,255,255,.10)'}`,
          background: checked
            ? `linear-gradient(135deg, ${_withAlpha(accent,.14)}, rgba(255,255,255,.03))`
            : 'linear-gradient(135deg, rgba(255,255,255,.035), rgba(255,255,255,.02))',
          borderRadius:14,
          padding:'11px 12px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display:'flex',
          alignItems:'center',
          justifyContent:'space-between',
          gap:12,
          boxShadow: checked ? `0 0 0 1px ${_withAlpha(accent,.08)} inset, 0 8px 22px ${_withAlpha(accent,.12)}` : 'none',
          transition:'all .24s ease'
        }}
      >
        <div style={{ textAlign:'left', minWidth:0 }}>
          <div style={{
            fontFamily:'var(--font-label)',
            fontSize:'13px',
            fontWeight:800,
            color: checked ? '#F2FDFF' : 'rgba(255,255,255,.82)',
            letterSpacing:.8,
            textTransform:'uppercase'
          }}>
            {label}
          </div>
          {sublabel && (
            <div style={{
              marginTop:4,
              fontFamily:'var(--font-label)',
              fontSize:'11px',
              color:'rgba(255,255,255,.42)',
              lineHeight:1.35
            }}>
              {sublabel}
            </div>
          )}
        </div>

        <div style={{
          position:'relative',
          width:74,
          height:34,
          flexShrink:0,
          borderRadius:10,
          overflow:'hidden',
          transform:'skew(-10deg)',
          background: checked
            ? `linear-gradient(135deg, ${_withAlpha(accent,.9)}, ${accent})`
            : 'linear-gradient(135deg, #5a6170, #777)',
          border:`1px solid ${checked ? _withAlpha(accent,.28) : 'rgba(255,255,255,.10)'}`,
          boxShadow: checked ? `0 0 18px ${_withAlpha(accent,.28)}` : 'none',
          transition:'all .22s ease'
        }}>
          <div style={{
            position:'absolute',
            inset:0,
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            fontFamily:'var(--font-ui)',
            fontSize:'11px',
            fontWeight:700,
            color:'rgba(255,255,255,.92)',
            letterSpacing:1.2,
            textShadow:'0 1px 0 rgba(0,0,0,.28)'
          }}>
            <span style={{
              position:'absolute',
              left: checked ? '-100%' : '0%',
              width:'100%',
              textAlign:'center',
              transform:'skew(10deg)',
              transition:'left .22s ease'
            }}>OFF</span>
            <span style={{
              position:'absolute',
              left: checked ? '0%' : '100%',
              width:'100%',
              textAlign:'center',
              transform:'skew(10deg)',
              transition:'left .22s ease'
            }}>ON</span>
          </div>
          <div style={{
            position:'absolute',
            top:3,
            left: checked ? 39 : 3,
            width:32,
            height:26,
            borderRadius:8,
            background:'rgba(7,7,15,.24)',
            boxShadow:'inset 0 1px 0 rgba(255,255,255,.12)',
            transition:'left .24s cubic-bezier(.22,.9,.3,1)'
          }}/>
        </div>
      </button>
    </div>
  );
}

function BuilderFXStyles(){
  return (
    <style>{`
      @keyframes bgzToggleGlow {
        0% { box-shadow: 0 0 0 rgba(0,245,255,0); }
        45% { box-shadow: 0 0 0 6px rgba(0,245,255,.10); }
        100% { box-shadow: 0 0 0 rgba(0,245,255,0); }
      }
      .bgz-children-reveal{
        transform-origin: top center;
        animation: bgzChildrenReveal 320ms cubic-bezier(.22,.9,.3,1);
      }
      @keyframes bgzChildrenReveal {
        0% { opacity: 0; transform: translateY(-10px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .os-page .os-input,
      .os-page .os-select{
        min-height:40px !important;
        padding:9px 11px !important;
        font-size:.9rem !important;
        border-radius:14px !important;
      }
      .os-page textarea.os-input{
        min-height:78px !important;
        padding:10px 11px !important;
      }
    `}</style>
  );
}



function _findFieldById(fieldId){
  const sections = window.ENGINE_SCHEMA?.sections || [];
  for(const section of sections){
    const found = (section.fields || []).find(f => f.id === fieldId);
    if(found) return found;
  }
  return null;
}

function _fieldDepth(field, seen = new Set()){
  if(!field?.visible_if) return 0;
  const parents = Object.keys(field.visible_if || {});
  if(!parents.length) return 0;
  let maxParentDepth = 0;
  parents.forEach(parentId => {
    if(seen.has(parentId)) return;
    const parentField = _findFieldById(parentId);
    if(parentField){
      const nextSeen = new Set(seen);
      nextSeen.add(parentId);
      maxParentDepth = Math.max(maxParentDepth, _fieldDepth(parentField, nextSeen) + 1);
    } else {
      maxParentDepth = Math.max(maxParentDepth, 1);
    }
  });
  return maxParentDepth;
}

function FieldRenderer({ field, value, config, onChange, depth = 0 }){
  const visible = window.SchemaUtils.isVisible(field, config);
  const disabled = !visible;
  const reason = _disabledReason(field, config);

  function set(next){
    if(disabled) return;
    onChange(field.id, next);
  }

  const nested = depth > 0;
  const wrapStyle = {
    marginBottom: nested ? 10 : 12,
    marginLeft: nested ? Math.min(12 + depth * 10, 28) : 0,
    padding: nested ? '9px 10px' : '10px 12px',
    borderRadius: nested ? 10 : 12,
    borderLeft: nested ? `3px solid ${disabled ? 'rgba(255,255,255,.08)' : 'rgba(0,245,255,.22)'}` : undefined,
    borderTop: disabled ? '1px dashed rgba(255,255,255,.10)' : '1px solid rgba(255,255,255,.07)',
    borderRight: disabled ? '1px dashed rgba(255,255,255,.10)' : '1px solid rgba(255,255,255,.07)',
    borderBottom: disabled ? '1px dashed rgba(255,255,255,.10)' : '1px solid rgba(255,255,255,.07)',
    background: nested
      ? (disabled ? 'rgba(255,255,255,.018)' : 'linear-gradient(135deg, rgba(0,245,255,.045), rgba(255,255,255,.022))')
      : (disabled ? 'rgba(255,255,255,.02)' : 'rgba(255,255,255,.03)'),
    boxShadow: nested && !disabled ? 'inset 0 1px 0 rgba(255,255,255,.04)' : 'none',
    opacity: disabled ? .55 : 1
  };

  const labelStyle = {
    fontFamily:'var(--font-label)',
    fontSize: nested ? '11px' : '12px',
    color: nested ? 'rgba(255,255,255,.48)' : 'rgba(255,255,255,.55)',
    letterSpacing: nested ? .6 : 1,
    marginBottom:6
  };

  if(field.id === 'name' || field.id === 'emoji') return null;

  if(field.type === 'boolean'){
    return (
      <div style={wrapStyle}>
        <ArcadeToggle
          checked={!!value}
          disabled={disabled}
          label={field.label}
          sublabel={reason || (value ? 'Activo · mostrará opciones relacionadas debajo.' : 'Inactivo · al encenderlo aparecerán más opciones.')}
          onToggle={()=>set(!value)}
          accent={config.__sectionColor || '#00F5FF'}
        />
      </div>
    );
  }

  if(field.type === 'text' || field.type === 'number'){
    return (
      <div style={wrapStyle}>
        <div style={labelStyle}>{field.label}</div>
        <input
          className="os-input"
          disabled={disabled}
          type={field.type === 'number' ? 'number' : 'text'}
          value={value ?? ''}
          onChange={e=>{
            if(field.type === 'number') set(parseInt(e.target.value || '0', 10) || 0);
            else set(e.target.value);
          }}
          style={{marginBottom: reason ? 6 : 0, minHeight:nested ? 40 : 42, padding:nested ? '8px 10px' : '9px 11px', fontSize:nested ? '0.9rem' : '0.92rem', fontFamily:'var(--font-body)', fontWeight:600}}
        />
        {reason && <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)'}}>{reason}</div>}
      </div>
    );
  }

  if(field.type === 'textarea'){
    return (
      <div style={wrapStyle}>
        <div style={labelStyle}>{field.label}</div>
        <textarea
          className="os-input"
          disabled={disabled}
          value={value ?? ''}
          onChange={e=>set(e.target.value)}
          style={{minHeight:nested ? 72 : 80, resize:'vertical', marginBottom: reason ? 6 : 0, padding:'10px 12px', fontSize:nested ? '0.9rem' : '0.92rem', fontFamily:'var(--font-body)'}}
        />
        {reason && <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)'}}>{reason}</div>}
      </div>
    );
  }

  if(field.type === 'select'){
    return (
      <div style={wrapStyle}>
        <div style={labelStyle}>{field.label}</div>
        <select
          className="os-select"
          disabled={disabled}
          value={value ?? ''}
          onChange={e=>set(e.target.value)}
          style={{minHeight:nested ? 40 : 42, padding:nested ? '8px 10px' : '9px 11px', fontSize:nested ? '0.9rem' : '0.92rem', fontFamily:'var(--font-body)', fontWeight:700}}
        >
          {(field.options || []).map(opt=>(
            <option key={String(opt.value)} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {reason && <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)',marginTop:6}}>{reason}</div>}
      </div>
    );
  }

  if(field.type === 'multi_select'){
    const current = Array.isArray(value) ? value : [];
    return (
      <div style={wrapStyle}>
        <div style={labelStyle}>{field.label}</div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {(field.options || []).map(opt=>{
            const active = current.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                disabled={disabled}
                onClick={()=>{
                  if(disabled) return;
                  if(active) set(current.filter(v=>v!==opt.value));
                  else set([...current, opt.value]);
                }}
                style={{
                  padding:'6px 10px',
                  borderRadius:10,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  border:`1px solid ${active ? 'rgba(0,245,255,.45)' : 'rgba(255,255,255,.12)'}`,
                  background:active ? 'rgba(0,245,255,.16)' : 'rgba(255,255,255,.04)',
                  color:active ? 'var(--cyan)' : 'rgba(255,255,255,.65)',
                  fontFamily:'var(--font-label)',
                  fontSize:'12px',
                  fontWeight:700,
                  opacity: disabled ? .55 : 1
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        {reason && <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)',marginTop:6}}>{reason}</div>}
      </div>
    );
  }

  if(field.type === 'counter_set_editor'){
    return <div style={wrapStyle}><CounterSetEditor value={Array.isArray(value)?value:[]} onChange={set} disabled={disabled} />{reason && <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)'}}>{reason}</div>}</div>;
  }

  if(field.type === 'list_text'){
    return (
      <div style={wrapStyle}>
        <ListTextField label={field.label} value={Array.isArray(value) ? value : []} onChange={set} disabled={disabled} />
        {reason && <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)'}}>{reason}</div>}
      </div>
    );
  }

  if(field.type === 'result_actions_editor'){
    return <div style={wrapStyle}><ResultActionsEditor value={Array.isArray(value)?value:[]} onChange={set} disabled={disabled} />{reason && <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)'}}>{reason}</div>}</div>;
  }

  if(field.type === 'capture_actions_editor'){
    return <div style={wrapStyle}><CaptureActionsEditor value={Array.isArray(value)?value:[]} onChange={set} disabled={disabled} />{reason && <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)'}}>{reason}</div>}</div>;
  }

  if(field.type === 'status_indicators_editor'){
    return <div style={wrapStyle}><StatusIndicatorsEditor value={Array.isArray(value)?value:[]} onChange={set} disabled={disabled} />{reason && <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)'}}>{reason}</div>}</div>;
  }

  if(field.type === 'round_questions_editor'){
    return <div style={wrapStyle}><RoundQuestionsEditor value={Array.isArray(value)?value:[]} onChange={set} disabled={disabled} />{reason && <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)'}}>{reason}</div>}</div>;
  }

  if(field.type === 'auto_behaviors_editor'){
    return <div style={wrapStyle}><AutoBehaviorsEditor value={Array.isArray(value)?value:[]} onChange={set} disabled={disabled} />{reason && <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)'}}>{reason}</div>}</div>;
  }

  if(field.type === 'phases_editor'){
    return <div style={wrapStyle}><PhasesEditor value={Array.isArray(value)?value:[]} onChange={set} disabled={disabled} />{reason && <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)'}}>{reason}</div>}</div>;
  }

  if(field.type === 'checklist_editor'){
    return <div style={wrapStyle}><ChecklistEditor value={Array.isArray(value)?value:[]} onChange={set} disabled={disabled} />{reason && <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)'}}>{reason}</div>}</div>;
  }

  if(field.type === 'entities_editor'){
    return <div style={wrapStyle}><ExternalEntitiesEditor value={Array.isArray(value)?value:[]} onChange={set} disabled={disabled} />{reason && <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)'}}>{reason}</div>}</div>;
  }

  return null;
}

function _fieldHasStoredValue(field, value){
  if(value === null || value === undefined) return false;
  if(field.type === 'boolean') return value === true;
  if(field.type === 'multi_select' || field.type === 'list_text' || field.type === 'counter_set_editor' || field.type === 'phases_editor' || field.type === 'checklist_editor' || field.type === 'entities_editor'){
    return Array.isArray(value) && value.length > 0;
  }
  if(field.type === 'number') return value !== '' && !Number.isNaN(Number(value));
  return String(value).trim().length > 0;
}

function _compactValueText(field, value){
  if(value === null || value === undefined || value === '') return null;
  if(field.type === 'boolean') return value ? 'Sí' : 'No';
  if(field.type === 'multi_select' || field.type === 'list_text' || field.type === 'counter_set_editor' || field.type === 'phases_editor' || field.type === 'checklist_editor' || field.type === 'entities_editor'){
    return Array.isArray(value) && value.length ? `${value.length}` : null;
  }
  if(field.type === 'select'){
    const opt = (field.options || []).find(o => String(o.value) === String(value));
    return opt?.label || String(value);
  }
  if(field.type === 'textarea'){
    const txt = String(value).trim();
    return txt.length > 24 ? txt.slice(0, 24) + '…' : txt;
  }
  return String(value);
}

function _inactiveSectionSummary(section, config){
  const active = [];
  const prepared = [];

  (section.fields || []).forEach(field => {
    if(field.id === 'name' || field.id === 'emoji') return;
    const visible = window.SchemaUtils.isVisible(field, config);
    const val = config[field.id];
    const compact = _compactValueText(field, val);

    if(visible && _fieldHasStoredValue(field, val)){
      active.push(`${field.label}: ${compact}`);
      return;
    }

    if(!visible && _fieldHasStoredValue(field, val)){
      prepared.push(`${field.label}: ${compact}`);
    }
  });

  return { active, prepared };
}


function SectionBlock({ section, index, config, isOpen, onToggle, onChange, onComplete, isLast }){
  const color = _sectionColor(section, index);
  const info = window.SchemaUtils.sectionState(section, config);
  const pct = _sectionPercent(section, config);
  const summary = _inactiveSectionSummary(section, config);
  const [showInactive, setShowInactive] = React.useState(false);
  const headerRef = React.useRef(null);
  const bodyInnerRef = React.useRef(null);
  const [bodyMaxHeight, setBodyMaxHeight] = React.useState(0);

  const visibleFields = (section.fields || []).filter(field => window.SchemaUtils.isVisible(field, config));
  const inactiveFields = (section.fields || []).filter(field => !window.SchemaUtils.isVisible(field, config));
  const preparedCount = summary.prepared.length;
  const hiddenCount = inactiveFields.length;

  React.useLayoutEffect(()=>{
    const extraPad = 18;
    const el = bodyInnerRef.current;
    if(!el){
      setBodyMaxHeight(isOpen ? 2400 : 0);
      return;
    }
    const nextHeight = isOpen ? (el.scrollHeight + extraPad) : 0;
    setBodyMaxHeight(nextHeight);
  }, [isOpen, showInactive, config, section.id]);

  React.useEffect(()=>{
    if(!window.anime || !headerRef.current) return;

    if(isOpen){
      window.anime.remove(headerRef.current);
      window.anime({
        targets: headerRef.current,
        scale: [0.992, 1],
        duration: 260,
        easing: 'easeOutQuad'
      });
    }
  }, [isOpen]);

  const headerStyle = {
    width:'100%',
    textAlign:'left',
    background:isOpen
      ? `linear-gradient(135deg, ${color}26, rgba(255,255,255,.055))`
      : `linear-gradient(135deg, ${color}1A, rgba(255,255,255,.03))`,
    border:`1px solid ${isOpen ? color + '66' : color + '40'}`,
    borderRadius:isOpen ? '18px 18px 0 0' : '18px',
    padding:'13px 14px',
    cursor:'pointer',
    position:'relative',
    overflow:'hidden',
    transition:'background .28s ease, border-color .28s ease, border-radius .24s ease, box-shadow .28s ease, transform .18s ease',
    boxShadow:isOpen ? `0 10px 30px ${color}18, inset 0 1px 0 rgba(255,255,255,.05)` : 'none',
    transform:isOpen ? 'translateY(-1px)' : 'translateY(0)'
  };

  const bodyWrapStyle = {
    maxHeight: isOpen ? bodyMaxHeight : 0,
    opacity: isOpen ? 1 : 0,
    overflow:'hidden',
    transition:'max-height 360ms cubic-bezier(.22,.9,.3,1), opacity 180ms ease, transform 300ms ease',
    transform:isOpen ? 'translateY(0)' : 'translateY(-6px)'
  };

  return (
    <div style={{marginBottom:14}}>
      <button
        ref={headerRef}
        type="button"
        onClick={onToggle}
        style={headerStyle}
      >
        <div style={{
          position:'absolute',
          left:0,
          top:8,
          bottom:8,
          width:isOpen ? 5 : 0,
          borderRadius:'0 10px 10px 0',
          background:`linear-gradient(180deg, ${color}, rgba(255,255,255,.9))`,
          boxShadow:isOpen ? `0 0 18px ${color}` : 'none',
          opacity:isOpen ? 1 : 0,
          transition:'width .22s ease, opacity .22s ease, box-shadow .28s ease'
        }}/>

        <div style={{
          position:'absolute',
          left:14,
          right:14,
          bottom:0,
          height:isOpen ? 2 : 0,
          borderRadius:999,
          background:`linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity:isOpen ? .95 : 0,
          transition:'height .18s ease, opacity .25s ease'
        }}/>

        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12, position:'relative', zIndex:1}}>
          <div style={{display:'flex',alignItems:'center',gap:12,minWidth:0}}>
            <div style={{
              width:38,height:38,borderRadius:12,
              display:'flex',alignItems:'center',justifyContent:'center',
              background: isOpen ? color + '2F' : color + '22',
              border:`1px solid ${isOpen ? color + '88' : color + '55'}`,
              fontSize:'1rem',
              flexShrink:0,
              boxShadow:isOpen ? `0 0 20px ${color}33` : 'none',
              transform:isOpen ? 'scale(1.04)' : 'scale(1)',
              transition:'all .24s ease'
            }}>
              {section.icon || '•'}
            </div>
            <div style={{minWidth:0}}>
              <div style={{fontFamily:'var(--font-display)',fontSize:'0.98rem',letterSpacing:.8,color,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                {index + 1}. {section.title}
              </div>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',letterSpacing:2,color:isOpen ? 'rgba(255,255,255,.56)' : 'rgba(255,255,255,.38)',marginTop:3, transition:'color .22s ease'}}>
                {info.label} · {pct}%
              </div>
            </div>
          </div>

          <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
            <div style={{
              padding:'6px 10px',
              borderRadius:999,
              fontFamily:'var(--font-label)',
              fontSize:'var(--fs-micro)',
              letterSpacing:1.5,
              transform:isOpen ? 'translateY(-1px)' : 'translateY(0)',
              transition:'transform .22s ease',
              ..._badgeStyle(info.status, color)
            }}>
              {info.label}
            </div>
            <div style={{
              color:isOpen ? color : 'rgba(255,255,255,.55)',
              fontSize:'1rem',
              transform:isOpen ? 'rotate(180deg) scale(1.08)' : 'rotate(0deg) scale(1)',
              transition:'transform .26s ease, color .22s ease'
            }}>
              ▼
            </div>
          </div>
        </div>

        {!isOpen && (summary.active.length > 0 || preparedCount > 0 || hiddenCount > 0) && (
          <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:10,pointerEvents:'none',position:'relative',zIndex:1}}>
            {summary.active.slice(0, 2).map((line, i)=>(
              <div key={i} style={{
                padding:'5px 9px',
                borderRadius:999,
                background:'rgba(255,255,255,.05)',
                border:'1px solid rgba(255,255,255,.08)',
                fontFamily:'var(--font-label)',
                fontSize:'11px',
                color:'rgba(255,255,255,.62)'
              }}>
                {line}
              </div>
            ))}
            {preparedCount > 0 && (
              <div style={{
                padding:'5px 9px',
                borderRadius:999,
                background: color + '18',
                border:`1px solid ${color}33`,
                fontFamily:'var(--font-label)',
                fontSize:'11px',
                color:color
              }}>
                {preparedCount} preparado{preparedCount > 1 ? 's' : ''}
              </div>
            )}
            {hiddenCount > 0 && (
              <div style={{
                padding:'5px 9px',
                borderRadius:999,
                background:'rgba(255,255,255,.04)',
                border:'1px solid rgba(255,255,255,.08)',
                fontFamily:'var(--font-label)',
                fontSize:'11px',
                color:'rgba(255,255,255,.52)'
              }}>
                {hiddenCount} opciones avanzadas
              </div>
            )}
          </div>
        )}
      </button>

      <div style={bodyWrapStyle}>
        <div
          ref={bodyInnerRef}
          style={{
            border:`1px solid ${color}28`,
            borderTop:'none',
            borderRadius:'0 0 18px 18px',
            padding:'12px 11px 11px',
            background:'linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.018))',
            position:'relative'
          }}
        >
          <div style={{
            position:'absolute',
            top:0,
            left:16,
            right:16,
            height:1,
            background:`linear-gradient(90deg, transparent, ${color}55, transparent)`,
            opacity:.9
          }}/>

          {section.id === 'general' && (
            <EmojiInlineField
              nameValue={config.name}
              emojiValue={config.emoji}
              onChangeName={v=>onChange('name', v)}
              onChangeEmoji={v=>onChange('emoji', v)}
            />
          )}

          {visibleFields.map((field, idx)=>(
            <AnimatedFieldMount key={field.id} delay={Math.min(idx * 28, 140)}>
              <FieldRenderer
                field={field}
                value={config[field.id]}
                config={{...config, __sectionColor: color}}
                onChange={onChange}
                depth={_fieldDepth(field)}
              />
            </AnimatedFieldMount>
          ))}

          {inactiveFields.length > 0 && (
            <div style={{marginTop:10}}>
              <button
                type="button"
                className="btn btn-ghost"
                style={{
                  ..._softGhostButtonStyle(color),
                  width:'100%',
                  justifyContent:'center',
                  borderColor: showInactive ? color + '55' : _withAlpha(color,.22),
                  background: showInactive ? _withAlpha(color,.14) : _withAlpha(color,.08),
                  color: color
                }}
                onClick={()=>setShowInactive(v=>!v)}
              >
                <span style={{
                  display:'inline-block',
                  transform:showInactive ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition:'transform .24s ease',
                  marginRight:6
                }}>▼</span>
                {showInactive ? 'Ocultar opciones inactivas' : `Ver opciones inactivas (${inactiveFields.length})`}
              </button>

              {!showInactive && (
                <div style={{
                  marginTop:8,
                  padding:'10px 12px',
                  borderRadius:12,
                  background:'rgba(255,255,255,.02)',
                  border:'1px dashed rgba(255,255,255,.10)'
                }}>
                  <div style={{fontFamily:'var(--font-label)',fontSize:'11px',color:'rgba(255,255,255,.46)',lineHeight:1.45}}>
                    Esta sección tiene {inactiveFields.length} campo{inactiveFields.length > 1 ? 's' : ''} opcional{inactiveFields.length > 1 ? 'es' : ''} que no aplican con la configuración actual.
                    {preparedCount > 0 ? ` Ya tienes ${preparedCount} valor${preparedCount > 1 ? 'es' : ''} preparado${preparedCount > 1 ? 's' : ''}.` : ''}
                  </div>
                </div>
              )}

              <div style={{
                maxHeight: showInactive ? 2400 : 0,
                opacity: showInactive ? 1 : 0,
                overflow:'hidden',
                transition:'max-height 300ms cubic-bezier(.22,.9,.3,1), opacity 180ms ease',
                marginTop: showInactive ? 10 : 0
              }}>
                {inactiveFields.map((field, idx)=>(
                  <AnimatedFieldMount key={field.id} delay={Math.min(idx * 24, 120)}>
                    <FieldRenderer
                      field={field}
                      value={config[field.id]}
                      config={{...config, __sectionColor: color}}
                      onChange={onChange}
                      depth={_fieldDepth(field)}
                    />
                  </AnimatedFieldMount>
                ))}
              </div>
            </div>
          )}

          <div style={{marginTop:10}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.45)'}}>
                Avance de esta sección
              </div>
              <div style={{fontFamily:'var(--font-display)',fontSize:'0.9rem',color:color}}>
                {pct}%
              </div>
            </div>
            <div style={{height:8,borderRadius:999,background:'rgba(255,255,255,.06)',overflow:'hidden'}}>
              <div style={{
                width:`${pct}%`,
                height:'100%',
                background:`linear-gradient(90deg, ${color}, rgba(255,255,255,.8))`,
                borderRadius:999,
                transition:'width .3s ease'
              }}/>
            </div>
          </div>

          <div style={{display:'flex',gap:8,marginTop:14}}>
            <button
              type="button"
              className="btn btn-ghost"
              style={{..._gradientButtonStyle(color,{full:true}) , flex:1}}
              onClick={onComplete}
            >
              {isLast ? '✔ Terminar sección' : '✔ Terminar y seguir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupedPreview({ payload, forceOpen = false }){
  const [open, setOpen] = React.useState(false);
  React.useEffect(()=>{
    if(forceOpen) setOpen(true);
  }, [forceOpen]);
  if(!payload || !payload.grouped) return null;

  return (
    <div style={{marginBottom:16}}>
      <button type="button" className="btn btn-ghost" onClick={()=>setOpen(v=>!v)}>
        {open ? '▼' : '▶'} Ver cómo se guardará por bloques
      </button>
      {open && (
        <pre style={{
          marginTop:10,
          padding:14,
          borderRadius:12,
          background:'#090915',
          border:'1px solid rgba(255,255,255,.08)',
          color:'#D8F9FF',
          overflow:'auto',
          fontSize:12,
          lineHeight:1.45
        }}>
{JSON.stringify(payload.grouped, null, 2)}
        </pre>
      )}
    </div>
  );
}


function _filterPreviewRegisters(registers, optimization){
  const hidden = new Set(Array.isArray(optimization?.hiddenRegisters) ? optimization.hiddenRegisters : []);
  return (Array.isArray(registers) ? registers : []).filter(reg => !hidden.has(reg.id));
}

function _filterPreviewActions(actions, optimization){
  return (Array.isArray(actions) ? actions : []).filter(action => {
    if(optimization?.hideAutoWinAction && action.id === 'add_win') return false;
    if(optimization?.hideAutoDefeatAction && action.id === 'eliminate') return false;
    return true;
  });
}

function _previewResolvedList(payload, key){
  return Array.isArray(payload?.runtime?.[key]) ? payload.runtime[key] : [];
}

function _runtimeFlowSteps(payload){
  const r = payload?.runtime || {};
  const steps = [];
  steps.push({ title:'Inicio de partida', desc:`${r.minPlayers || 2}-${r.maxPlayers || 8} jugadores · modo ${r.type || 'individual'}` });
  if(r.hasRounds) steps.push({ title:'Inicio de ronda', desc:r.totalRounds ? `${r.totalRounds} rondas totales` : 'Rondas libres hasta cumplir la condición final' });
  if(r.hasTurns) steps.push({ title:'Turnos', desc:`Orden ${r.turnOrder || 'fixed'}${r.canSkip ? ' · permite saltar turno' : ''}${r.hasExtraTurns ? ' · permite turnos extra' : ''}` });
  else steps.push({ title:'Participación', desc:`Modo ${r.noTurnMode || 'simultaneous'}` });
  if(r.hasTimer) steps.push({ title:'Timer', desc:`${r.timerScope || 'turn'} · ${r.timerSecs || 60}s · expira: ${r.timerExpire || 'nothing'}` });
  const playerActions = _previewResolvedList(payload, 'playObjectsResolved');
  if(playerActions.length) steps.push({ title:'Objetos de partida', desc:playerActions.map(x=>x.label || x.id).join(' · ') });
  const questions = _previewResolvedList(payload, 'roundQuestionsResolved');
  if(questions.length) steps.push({ title:'Cierre guiado', desc:questions.map(q=>q.label).join(' · ') });
  const statuses = _previewResolvedList(payload, 'statusIndicatorsResolved');
  if(statuses.length) steps.push({ title:'Indicadores visibles', desc:statuses.map(s=>s.label).join(' · ') });
  const autos = _previewResolvedList(payload, 'autoBehaviorsResolved');
  if(autos.length) steps.push({ title:'Automatizaciones', desc:autos.map(a=>a.label || a.effect).join(' · ') });
  const phases = _previewResolvedList(payload, 'gamePhasesResolved');
  if(phases.length) steps.push({ title:'Fases asistidas', desc:phases.map(p=>p.label).join(' → ') });
  const checklist = _previewResolvedList(payload, 'phaseChecklistResolved');
  if(checklist.length) steps.push({ title:'Checklist', desc:checklist.map(c=>c.label).join(' · ') });
  const entities = _previewResolvedList(payload, 'externalEntitiesResolved');
  if(entities.length) steps.push({ title:'Entidades externas', desc:entities.map(e=>e.label).join(' · ') });
  if(r.roundClose) steps.push({ title:'Cierre de ronda', desc:`${r.roundCloseWho || 'host'} cierra la ronda · modo ${r.roundClose}` });
  if(r.primaryUnit) steps.push({ title:'Actualización de marcador', desc:`Se actualiza ${r.primaryUnit}${r.scoreCapture ? ` · captura ${r.scoreCapture}` : ''}` });
  let endDesc = 'Se revisa condición final';
  if(r.victoryMode === 'wins' && r.winsTarget) endDesc = `Fin al llegar a ${r.winsTarget} victorias`;
  if(r.victoryMode === 'points' && r.targetScore) endDesc = `Fin al llegar a ${r.targetScore} puntos`;
  if(r.victoryMode === 'elim') endDesc = 'Fin al quedar el último jugador/equipo';
  steps.push({ title:'Fin o siguiente ronda', desc:endDesc });
  return steps;
}

function _summaryLines(payload){
  const r = payload?.runtime || {};
  const playObjects = _previewResolvedList(payload, 'playObjectsResolved');
  const playerChecklist = _previewResolvedList(payload, 'phaseChecklistResolved').filter(x => ['player','all'].includes(x.visibleTo || 'host'));
  const playerEntities = _previewResolvedList(payload, 'externalEntitiesResolved').filter(x => ['player','all'].includes(x.visibleTo || 'all'));
  const registers = _previewResolvedList(payload, 'registersResolved');
  const tools = Array.isArray(r.tools) ? r.tools : [];
  const resultActions = _previewResolvedList(payload, 'resultActionsResolved');
  const captureActions = _previewResolvedList(payload, 'captureActionsResolved');
  const statusIndicators = _previewResolvedList(payload, 'statusIndicatorsResolved');
  return [
    ['Modo', r.type || 'individual'],
    ['Jugadores', `${r.minPlayers || 2} a ${r.maxPlayers || 8}`],
    ['Dificultad', payload?.summary?.difficulty || payload?.config?.difficulty || 'media'],
    ['Victoria', r.victoryMode === 'wins' ? `Victorias a ${r.winsTarget || 3}` : (r.victoryMode === 'points' ? `Puntos${r.targetScore ? ' a ' + r.targetScore : ''}` : (r.victoryMode || 'manual'))],
    ['Rondas', r.hasRounds ? (r.totalRounds ? String(r.totalRounds) : 'Libres') : 'No'],
    ['Turnos', r.hasTurns ? (r.turnOrder || 'fixed') : (r.noTurnMode || 'simultaneous')],
    ['Timer', r.hasTimer ? `${r.timerScope || 'turn'} · ${r.timerSecs || 60}s` : 'No'],
    ['Registers', registers.length ? registers.map(x=>x.id).join(', ') : 'Ninguno'],
    ['Objetos', playObjects.length ? playObjects.map(x=>x.label || x.id).join(', ') : 'Ninguno'],
    ['Resultado', resultActions.length ? resultActions.map(x=>x.label).join(', ') : 'Sin acciones custom'],
    ['Capturas', captureActions.length ? captureActions.map(x=>x.label).join(', ') : 'Sin capturas custom'],
    ['Estados', statusIndicators.length ? statusIndicators.map(x=>x.label).join(', ') : 'Sin indicadores'],
    ['Herramientas', tools.length ? tools.join(', ') : 'Sin herramientas']
  ];
}

function PreviewTabButton({ active, onClick, label, color }){
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding:'8px 12px',
        borderRadius:10,
        border:`1px solid ${active ? color + '66' : 'rgba(255,255,255,.10)'}`,
        background: active ? `linear-gradient(135deg, ${_withAlpha(color,.18)}, rgba(255,255,255,.04))` : 'rgba(255,255,255,.035)',
        color: active ? color : 'rgba(255,255,255,.66)',
        fontFamily:'var(--font-label)',
        fontSize:'12px',
        fontWeight:800,
        letterSpacing:1,
        cursor:'pointer'
      }}
    >
      {label}
    </button>
  );
}

function SummaryPreviewTab({ payload }){
  const lines = _summaryLines(payload);
  const warnings = payload?.warnings || [];
  const derivedRules = _previewResolvedList(payload, 'derivedRules');
  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:8}}>
        {lines.map(([k,v])=>(
          <div key={k} style={{padding:'10px 12px',borderRadius:12,background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.08)'}}>
            <div style={{fontFamily:'var(--font-label)',fontSize:'11px',letterSpacing:1,color:'rgba(255,255,255,.45)',marginBottom:4,textTransform:'uppercase'}}>{k}</div>
            <div style={{fontFamily:'var(--font-body)',fontSize:'13px',fontWeight:700,color:'rgba(255,255,255,.88)',lineHeight:1.35}}>{v}</div>
          </div>
        ))}
      </div>
      {(warnings.length > 0 || derivedRules.length > 0) && (
        <div style={{marginTop:10,padding:'12px',borderRadius:12,background:'rgba(255,212,71,.08)',border:'1px solid rgba(255,212,71,.24)'}}>
          <div style={{fontFamily:'var(--font-label)',fontSize:'11px',letterSpacing:1.2,color:'var(--gold)',marginBottom:6,textTransform:'uppercase'}}>Interpretación automática</div>
          {warnings.map((w, i)=><div key={'w'+i} style={{fontSize:'13px',color:'rgba(255,255,255,.8)',marginBottom:4}}>• {w}</div>)}
          {derivedRules.map((r, i)=><div key={'d'+i} style={{fontSize:'13px',color:'rgba(255,255,255,.8)',marginBottom:4}}>• Regla derivada: {r.id || r.type}</div>)}
        </div>
      )}
    </div>
  );
}

function FlowPreviewTab({ payload }){
  const steps = _runtimeFlowSteps(payload);
  return (
    <div style={{display:'grid',gap:10}}>
      {steps.map((step, idx)=>(
        <div key={idx} style={{display:'grid',gridTemplateColumns:'34px 1fr',gap:10,alignItems:'start'}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
            <div style={{width:28,height:28,borderRadius:999,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,245,255,.14)',border:'1px solid rgba(0,245,255,.28)',fontFamily:'var(--font-display)',fontSize:'12px',color:'var(--cyan)'}}>{idx+1}</div>
            {idx < steps.length - 1 && <div style={{width:2,flex:1,minHeight:26,background:'linear-gradient(180deg, rgba(0,245,255,.35), transparent)',marginTop:4}}/>}
          </div>
          <div style={{padding:'10px 12px',borderRadius:12,background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.08)'}}>
            <div style={{fontFamily:'var(--font-label)',fontSize:'12px',fontWeight:800,letterSpacing:1,color:'rgba(255,255,255,.85)',textTransform:'uppercase',marginBottom:4}}>{step.title}</div>
            <div style={{fontFamily:'var(--font-body)',fontSize:'13px',color:'rgba(255,255,255,.64)',lineHeight:1.4}}>{step.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}


function PlayerPadPreview({ payload }){
  const runtime = payload?.runtime || {};
  const optimization = runtime.optimization || {};
  const actions = _filterPreviewActions(Array.isArray(runtime.playerActions) ? runtime.playerActions : [], optimization);
  const toolbar = Array.isArray(runtime.toolbarItems) ? runtime.toolbarItems : [];
  const registers = _filterPreviewRegisters(_previewResolvedList(payload, 'registersResolved'), optimization);
  const resultActions = _previewResolvedList(payload, 'resultActionsResolved');
  const captureActions = _previewResolvedList(payload, 'captureActionsResolved');
  const statusIndicators = _previewResolvedList(payload, 'statusIndicatorsResolved');
  const roundQuestions = _previewResolvedList(payload, 'roundQuestionsResolved');
  const playObjects = _previewResolvedList(payload, 'playObjectsResolved');
  const playerChecklist = _previewResolvedList(payload, 'phaseChecklistResolved').filter(x => ['player','all'].includes(x.visibleTo || 'host'));
  const playerEntities = _previewResolvedList(payload, 'externalEntitiesResolved').filter(x => ['player','all'].includes(x.visibleTo || 'all'));
  const [calcOpen, setCalcOpen] = React.useState(false);
  const [calcTitle, setCalcTitle] = React.useState('Calculadora');
  const [calcSubtitle, setCalcSubtitle] = React.useState('');
  const [calcAllowNegative, setCalcAllowNegative] = React.useState(false);
  const [calcValue, setCalcValue] = React.useState('');
  const numericObjects = playObjects.filter(x => x.kind === 'numeric_input');
  const numericCaptures = captureActions.filter(x => x.captureType === 'number');

  function openCalculator({ title, subtitle='', allowNegative=false, initialValue='' }){
    setCalcTitle(title || 'Calculadora');
    setCalcSubtitle(subtitle || '');
    setCalcAllowNegative(!!allowNegative);
    setCalcValue(initialValue === undefined || initialValue === null ? '' : String(initialValue));
    setCalcOpen(true);
  }

  return (
    <div style={{padding:'12px',borderRadius:16,background:'linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.025))',border:'1px solid rgba(255,255,255,.08)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div>
          <div style={{fontFamily:'var(--font-display)',fontSize:'1rem',letterSpacing:1,color:'var(--cyan)'}}>Pad jugador</div>
          <div style={{fontFamily:'var(--font-label)',fontSize:'11px',color:'rgba(255,255,255,.44)',letterSpacing:1}}>Vista generada a partir del runtime</div>
        </div>
        <div style={{padding:'6px 10px',borderRadius:999,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',fontSize:'11px',fontFamily:'var(--font-label)',color:'rgba(255,255,255,.62)'}}>{runtime.canPlayerSelfRegister ? 'Auto registro' : 'Registro por host'}</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:8,marginBottom:12}}>
        {registers.map((reg)=> (
          <div key={reg.id} style={{padding:'10px',borderRadius:12,background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)'}}>
            <div style={{fontFamily:'var(--font-label)',fontSize:'11px',color:'rgba(255,255,255,.46)',letterSpacing:1,textTransform:'uppercase'}}>{reg.label || reg.id}</div>
            <div style={{fontFamily:'var(--font-display)',fontSize:'1.1rem',color:'#fff',marginTop:4}}>{reg.initialValue ?? 0}</div>
          </div>
        ))}
      </div>

      <div style={{fontFamily:'var(--font-label)',fontSize:'11px',letterSpacing:1.2,color:'rgba(255,255,255,.48)',marginBottom:8,textTransform:'uppercase'}}>Acciones del jugador al jugar</div>
      <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:12}}>
        {actions.length === 0 && <div style={{fontSize:'13px',color:'rgba(255,255,255,.48)'}}>Aún no hay acciones de jugador.</div>}
        {actions.map((action)=> (
          <div key={action.id} style={{padding:'10px 12px',borderRadius:12,background:`linear-gradient(135deg, ${_withAlpha(action.color || '#00F5FF', .16)}, rgba(255,255,255,.03))`,border:`1px solid ${_withAlpha(action.color || '#00F5FF', .32)}`,color:'#fff',fontFamily:'var(--font-label)',fontSize:'12px',fontWeight:800,letterSpacing:1}}>
            <span style={{marginRight:6}}>{action.icon || '•'}</span>{action.label || action.id}
          </div>
        ))}
      </div>

      {numericObjects.length > 0 && <>
        <div style={{fontFamily:'var(--font-label)',fontSize:'11px',letterSpacing:1.2,color:'rgba(255,255,255,.48)',marginBottom:8,textTransform:'uppercase'}}>Captura numérica rápida</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:12}}>
          {numericObjects.map((item)=>(
            <button
              key={item.id}
              type="button"
              onClick={()=>openCalculator({ title:item.label || 'Capturar', subtitle:`Target: ${item.target || 'points'}`, allowNegative: !!item.allowNegative })}
              style={{padding:'10px 12px',borderRadius:12,background:`linear-gradient(135deg, ${_withAlpha('#FFD447', .16)}, rgba(255,255,255,.03))`,border:`1px solid ${_withAlpha('#FFD447', .32)}`,color:'#fff',fontFamily:'var(--font-label)',fontSize:'12px',fontWeight:800,letterSpacing:1,cursor:'pointer'}}
            >
              🧮 {item.label || item.id}
            </button>
          ))}
        </div>
      </>}

      {resultActions.length > 0 && <>
        <div style={{fontFamily:'var(--font-label)',fontSize:'11px',letterSpacing:1.2,color:'rgba(255,255,255,.48)',marginBottom:8,textTransform:'uppercase'}}>Resultados personalizados</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:12}}>{resultActions.map((action)=><div key={action.id} style={{padding:'9px 12px',borderRadius:12,background:`linear-gradient(135deg, ${_withAlpha(action.color || '#00FF9D', .16)}, rgba(255,255,255,.03))`,border:`1px solid ${_withAlpha(action.color || '#00FF9D', .32)}`,color:'#fff',fontFamily:'var(--font-label)',fontSize:'12px',fontWeight:800,letterSpacing:1}}><span style={{marginRight:6}}>{action.icon || '•'}</span>{action.label}</div>)}</div>
      </>}

      {(captureActions.length > 0 || roundQuestions.length > 0) && <>
        <div style={{fontFamily:'var(--font-label)',fontSize:'11px',letterSpacing:1.2,color:'rgba(255,255,255,.48)',marginBottom:8,textTransform:'uppercase'}}>Datos extra que quieres guardar</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:12}}>
          {captureActions.map((action)=> action.captureType === 'number'
            ? <button key={action.id} type="button" onClick={()=>openCalculator({ title:action.label, subtitle:`Guardar en ${action.targetRegister || 'valor'}`, allowNegative:false, initialValue: action.min ?? '' })} style={{padding:'9px 12px',borderRadius:12,background:`linear-gradient(135deg, ${_withAlpha(action.color || '#FFD447', .14)}, rgba(255,255,255,.03))`,border:`1px solid ${_withAlpha(action.color || '#FFD447', .28)}`,color:'#fff',fontFamily:'var(--font-label)',fontSize:'12px',fontWeight:800,letterSpacing:1,cursor:'pointer'}}><span style={{marginRight:6}}>{action.icon || '•'}</span>🧮 {action.label}</button>
            : <div key={action.id} style={{padding:'9px 12px',borderRadius:12,background:`linear-gradient(135deg, ${_withAlpha(action.color || '#FFD447', .14)}, rgba(255,255,255,.03))`,border:`1px solid ${_withAlpha(action.color || '#FFD447', .28)}`,color:'#fff',fontFamily:'var(--font-label)',fontSize:'12px',fontWeight:800,letterSpacing:1}}><span style={{marginRight:6}}>{action.icon || '•'}</span>{action.label}</div>)}
          {roundQuestions.map((q)=><div key={q.id} style={{padding:'9px 12px',borderRadius:12,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',color:'rgba(255,255,255,.82)',fontFamily:'var(--font-label)',fontSize:'12px',fontWeight:700}}>❓ {q.label}</div>)}
        </div>
      </>}

      {statusIndicators.length > 0 && <>
        <div style={{fontFamily:'var(--font-label)',fontSize:'11px',letterSpacing:1.2,color:'rgba(255,255,255,.48)',marginBottom:8,textTransform:'uppercase'}}>Estados visibles en el marcador</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:12}}>{statusIndicators.map((item)=><div key={item.id} style={{padding:'8px 12px',borderRadius:999,background:`linear-gradient(135deg, ${_withAlpha(item.color || '#4A90FF', .16)}, rgba(255,255,255,.03))`,border:`1px solid ${_withAlpha(item.color || '#4A90FF', .28)}`,color:'#fff',fontFamily:'var(--font-label)',fontSize:'12px',fontWeight:700}}><span style={{marginRight:6}}>{item.icon || '•'}</span>{item.label}</div>)}</div>
      </>}


      {(playerChecklist.length > 0 || playerEntities.length > 0) && <>
        <div style={{fontFamily:'var(--font-label)',fontSize:'11px',letterSpacing:1.2,color:'rgba(255,255,255,.48)',marginBottom:8,textTransform:'uppercase'}}>Asistente visible para jugador</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:12}}>
          {playerChecklist.map((item)=><div key={item.id} style={{padding:'8px 12px',borderRadius:12,background:'rgba(183,255,60,.08)',border:'1px solid rgba(183,255,60,.22)',color:'rgba(255,255,255,.82)',fontFamily:'var(--font-label)',fontSize:'12px'}}>☑ {item.label}</div>)}
          {playerEntities.map((item)=><div key={item.id} style={{padding:'8px 12px',borderRadius:12,background:'rgba(74,144,255,.08)',border:'1px solid rgba(74,144,255,.22)',color:'rgba(255,255,255,.82)',fontFamily:'var(--font-label)',fontSize:'12px'}}>{item.icon || '📦'} {item.label}{item.defaultState ? `: ${item.defaultState}` : ''}</div>)}
        </div>
      </>}

      {toolbar.length > 0 && (
        <>
          <div style={{fontFamily:'var(--font-label)',fontSize:'11px',letterSpacing:1.2,color:'rgba(255,255,255,.48)',marginBottom:8,textTransform:'uppercase'}}>Toolbar</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {toolbar.map((item)=>(
              <div key={item.id} style={{padding:'9px 12px',borderRadius:999,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',fontFamily:'var(--font-label)',fontSize:'12px',fontWeight:700,color:'rgba(255,255,255,.8)'}}>
                <span style={{marginRight:6}}>{item.icon || '•'}</span>{item.label || item.id}
              </div>
            ))}
          </div>
        </>
      )}

      {calcOpen && (
        <ScoreCalculatorModal
          title={calcTitle}
          subtitle={calcSubtitle}
          initialValue={calcValue}
          allowNegative={calcAllowNegative}
          onClose={()=>setCalcOpen(false)}
          onSubmit={(val)=>{ setCalcValue(String(val)); setCalcOpen(false); }}
        />
      )}
    </div>
  );
}


function HostPadPreview({ payload }){
  const runtime = payload?.runtime || {};
  const actions = Array.isArray(runtime.hostActions) ? runtime.hostActions : [];
  const autoBehaviors = _previewResolvedList(payload, 'autoBehaviorsResolved');
  const phases = _previewResolvedList(payload, 'gamePhasesResolved');
  const checklist = _previewResolvedList(payload, 'phaseChecklistResolved');
  const entities = _previewResolvedList(payload, 'externalEntitiesResolved');
  return (
    <div style={{padding:'12px',borderRadius:16,background:'linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.025))',border:'1px solid rgba(255,255,255,.08)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div>
          <div style={{fontFamily:'var(--font-display)',fontSize:'1rem',letterSpacing:1,color:'var(--gold)'}}>Pad host</div>
          <div style={{fontFamily:'var(--font-label)',fontSize:'11px',color:'rgba(255,255,255,.44)',letterSpacing:1}}>Control operativo de la ronda y la partida</div>
        </div>
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:autoBehaviors.length ? 12 : 0}}>
        {actions.length === 0 && <div style={{fontSize:'13px',color:'rgba(255,255,255,.48)'}}>Aún no hay acciones de host.</div>}
        {actions.map((action)=>(
          <div key={action.id} style={{padding:'10px 12px',borderRadius:12,background:`linear-gradient(135deg, ${_withAlpha(action.color || '#FFD447', .16)}, rgba(255,255,255,.03))`,border:`1px solid ${_withAlpha(action.color || '#FFD447', .32)}`,color:'#fff',fontFamily:'var(--font-label)',fontSize:'12px',fontWeight:800,letterSpacing:1}}>
            <span style={{marginRight:6}}>{action.icon || '•'}</span>{action.label || action.id}
          </div>
        ))}
      </div>
      {autoBehaviors.length > 0 && <>
        <div style={{fontFamily:'var(--font-label)',fontSize:'11px',letterSpacing:1.2,color:'rgba(255,255,255,.48)',marginBottom:8,textTransform:'uppercase'}}>Reglas automáticas del sistema</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:8}}>{autoBehaviors.map((rule)=><div key={rule.id} style={{padding:'9px 12px',borderRadius:12,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',color:'rgba(255,255,255,.82)',fontFamily:'var(--font-label)',fontSize:'12px'}}>{rule.label || rule.effect}</div>)}</div>
      </>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// RUNTIME SIMULATOR — ejecuta el timeline paso a paso offline
// ═══════════════════════════════════════════════════════════════
function RuntimeSimulator({ payload }){
  const config  = payload?.config || {};
  const runtime = payload?.runtime || {};
  const timeline = (runtime.timeline || []).filter(t => t.type !== 'system' || t.id === 'game_start');
  const spec = React.useMemo(()=> typeof interpret === 'function' ? interpret(config) : {}, [config]);

  const MOCK_PLAYERS = ['🐉 Jugador 1','🦊 Jugador 2','🐺 Jugador 3'].slice(0, Math.max(2, config.minPlayers||2));

  const [players, setPlayers] = React.useState(()=>
    MOCK_PLAYERS.map((name,i)=>({
      id:'p'+i, name, emoji:name.split(' ')[0],
      points:0, wins:0, lives: spec.playerInit?.lives||3,
      eliminated:false, hasFirstPlayerToken:i===0
    }))
  );
  const [round,  setRound]  = React.useState(1);
  const [turn,   setTurn]   = React.useState(0); // index into players
  const [phase,  setPhase]  = React.useState(0); // index into timeline
  const [log,    setLog]    = React.useState([]);
  const [done,   setDone]   = React.useState(false);
  const [scoreInputs, setScoreInputs] = React.useState({});
  const logRef = React.useRef(null);

  function addLog(msg, color='var(--cyan)'){
    setLog(prev=>[...prev,{msg,color,ts:Date.now()}]);
    setTimeout(()=>{ if(logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; },50);
  }

  function reset(){
    setPlayers(MOCK_PLAYERS.map((name,i)=>({
      id:'p'+i, name, emoji:name.split(' ')[0],
      points:0, wins:0, lives:spec.playerInit?.lives||3,
      eliminated:false, hasFirstPlayerToken:i===0
    })));
    setRound(1); setTurn(0); setPhase(0); setLog([]); setDone(false); setScoreInputs({});
    addLog('▶ Partida reiniciada','var(--green)');
  }

  function nextTurn(){
    const active = players.filter(p=>!p.eliminated);
    if(!active.length){ setDone(true); return; }
    const nextIdx = (turn+1) % players.length;
    setTurn(nextIdx);
    const p = players[nextIdx];
    addLog(`↩ Turno de ${p.name}${ p.eliminated ? ' (eliminado — se salta)' : '' }`, p.eliminated?'rgba(255,255,255,.3)':'var(--gold)');
  }

  function closeRound(){
    // Check victoria al cerrar ronda
    const active = players.filter(p=>!p.eliminated);
    if(spec.victoryMode==='wins'){
      const winner = active.find(p=>p.wins>=(spec.winsTarget||3));
      if(winner){ addLog(`🏆 ¡${winner.name} gana la partida! (${winner.wins} victorias)`, 'var(--gold)'); setDone(true); return; }
    }
    if(spec.victoryMode==='points' && spec.pointsWinMode==='reach_x' && spec.targetScore){
      const winner = active.find(p=>p.points>=spec.targetScore);
      if(winner){ addLog(`🏆 ¡${winner.name} llega a ${spec.targetScore} puntos!`,'var(--gold)'); setDone(true); return; }
    }
    if(active.length===1 && players.length>1){ addLog(`🏆 ¡${active[0].name} es el último en pie!`,'var(--gold)'); setDone(true); return; }
    const newRound = round+1;
    const maxRounds = spec.totalRounds;
    if(maxRounds && newRound > maxRounds){
      const sorted=[...active].sort((a,b)=>(b.points||0)-(a.points||0));
      addLog(`🏁 Fin de partida — Ronda ${round}. Ganador: ${sorted[0].name}`,'var(--orange)');
      setDone(true); return;
    }
    setRound(newRound);
    addLog(`📋 Ronda ${round} cerrada → Ronda ${newRound}`, 'var(--purple)');
  }

  function applyPoints(pid, val){
    setPlayers(prev=>prev.map(p=>p.id===pid?{...p,points:(p.points||0)+val}:p));
    const pname = players.find(p=>p.id===pid)?.name||pid;
    addLog(`${val>=0?'+':''}${val} pts → ${pname}`, val>=0?'var(--green)':'var(--red)');
  }

  function addWin(pid){
    setPlayers(prev=>prev.map(p=>p.id===pid?{...p,wins:(p.wins||0)+1}:p));
    const pname = players.find(p=>p.id===pid)?.name||pid;
    addLog(`🏆 Victoria de ronda → ${pname}`, 'var(--gold)');
  }

  function eliminate(pid){
    setPlayers(prev=>prev.map(p=>p.id===pid?{...p,eliminated:true}:p));
    const pname = players.find(p=>p.id===pid)?.name||pid;
    addLog(`💀 ${pname} eliminado`, 'var(--red)');
    setTimeout(()=>{
      const active = players.filter(p=>!p.eliminated && p.id!==pid);
      if(active.length===1){ addLog(`🏆 ¡${active[0].name} gana!`,'var(--gold)'); setDone(true); }
    }, 100);
  }

  function loseLife(pid){
    setPlayers(prev=>prev.map(p=>{ if(p.id!==pid) return p; const l=Math.max(0,(p.lives||0)-1); return {...p,lives:l}; }));
    const p = players.find(x=>x.id===pid);
    addLog(`❤️ ${p?.name} pierde una vida (${Math.max(0,(p?.lives||1)-1)} restantes)`, 'var(--red)');
  }

  const currentPlayer = players[turn % players.length];
  const active = players.filter(p=>!p.eliminated);
  const sortedPlayers = [...players].sort((a,b)=>{
    if(!a.eliminated&&b.eliminated) return -1;
    if(a.eliminated&&!b.eliminated) return 1;
    if(spec.victoryMode==='wins') return (b.wins||0)-(a.wins||0);
    return (b.points||0)-(a.points||0);
  });

  const cellStyle = {background:'rgba(255,255,255,.04)',borderRadius:10,padding:'10px 12px',border:'1px solid rgba(255,255,255,.07)'};
  const btnBase = {borderRadius:8,border:'none',cursor:'pointer',fontFamily:'var(--font-label)',fontWeight:700,fontSize:'11px',letterSpacing:.8,padding:'7px 10px'};

  return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      {/* STATUS BAR */}
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        {[
          {label:'RONDA', val:spec.totalRounds?`${round}/${spec.totalRounds}`:round, color:'var(--cyan)'},
          {label:'ACTIVOS', val:active.length+'/'+players.length, color:'var(--green)'},
          {label:'TURNO', val:currentPlayer?.name?.split(' ')[0]||'—', color:'var(--gold)'},
          {label:'MODO', val:(spec.victoryMode||'points').toUpperCase(), color:'var(--purple)'},
        ].map(s=>(
          <div key={s.label} style={{flex:1,minWidth:60,...cellStyle,textAlign:'center'}}>
            <div style={{fontFamily:'var(--font-ui)',fontSize:'8px',letterSpacing:2,color:'rgba(255,255,255,.3)',marginBottom:2}}>{s.label}</div>
            <div style={{fontFamily:'var(--font-display)',fontSize:'.9rem',color:s.color}}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* SCOREBOARD */}
      <div style={cellStyle}>
        <div style={{fontFamily:'var(--font-ui)',fontSize:'9px',letterSpacing:2,color:'rgba(255,255,255,.3)',marginBottom:8}}>MARCADOR</div>
        {sortedPlayers.map((p,i)=>(
          <div key={p.id} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0',borderBottom:i<sortedPlayers.length-1?'1px solid rgba(255,255,255,.05)':'none',opacity:p.eliminated?.4:1}}>
            <div style={{width:22,height:22,borderRadius:6,background:`rgba(0,245,255,.${i===0?'2':'07'})`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-display)',fontSize:'11px',color:i===0?'var(--cyan)':'rgba(255,255,255,.4)'}}>{i+1}</div>
            <div style={{fontSize:'1.1rem'}}>{p.emoji}</div>
            <div style={{flex:1,fontFamily:'var(--font-label)',fontSize:'13px',fontWeight:700,color:p.eliminated?'rgba(255,255,255,.3)':'#fff'}}>{p.name.split(' ').slice(1).join(' ')}{p.eliminated?' 💀':''}</div>
            <div style={{fontFamily:'var(--font-display)',fontSize:'1rem',color:'var(--gold)',minWidth:32,textAlign:'right'}}>
              {spec.victoryMode==='wins'?p.wins:spec.victoryMode==='lives'||spec.primaryUnit==='lives'?p.lives:p.points}
            </div>
            <div style={{fontFamily:'var(--font-ui)',fontSize:'8px',color:'rgba(255,255,255,.25)'}}>
              {spec.victoryMode==='wins'?'🏆':spec.victoryMode==='lives'||spec.primaryUnit==='lives'?'❤️':'pts'}
            </div>
          </div>
        ))}
      </div>

      {/* PLAYER ACTIONS */}
      {!done && (
        <div style={cellStyle}>
          <div style={{fontFamily:'var(--font-ui)',fontSize:'9px',letterSpacing:2,color:'rgba(255,255,255,.3)',marginBottom:8}}>ACCIONES POR JUGADOR</div>
          {players.filter(p=>!p.eliminated).map(p=>(
            <div key={p.id} style={{marginBottom:10,padding:'8px 10px',borderRadius:8,background:p.id===currentPlayer?.id?'rgba(0,245,255,.05)':'rgba(255,255,255,.02)',border:`1px solid ${p.id===currentPlayer?.id?'rgba(0,245,255,.2)':'rgba(255,255,255,.05)'}`}}>
              <div style={{fontFamily:'var(--font-label)',fontSize:'12px',fontWeight:700,marginBottom:6,color:p.id===currentPlayer?.id?'var(--cyan)':'rgba(255,255,255,.7)'}}>
                {p.emoji} {p.name.split(' ').slice(1).join(' ')} {p.id===currentPlayer?.id?'← turno actual':''}
              </div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {(spec.victoryMode!=='lives'&&spec.primaryUnit!=='lives')&&[5,10,25].map(v=>(
                  <button key={v} style={{...btnBase,background:'rgba(0,255,157,.12)',color:'var(--green)'}} onClick={()=>applyPoints(p.id,v)}>+{v}</button>
                ))}
                {(spec.victoryMode!=='lives'&&spec.primaryUnit!=='lives')&&spec.modifiers?.includes('penalty')&&(
                  <button style={{...btnBase,background:'rgba(255,59,92,.12)',color:'var(--red)'}} onClick={()=>applyPoints(p.id,-5)}>-5</button>
                )}
                {(spec.victoryMode==='wins'||spec.winsTarget)&&(
                  <button style={{...btnBase,background:'rgba(255,212,71,.12)',color:'var(--gold)'}} onClick={()=>addWin(p.id)}>🏆 Ganar ronda</button>
                )}
                {(spec.primaryUnit==='lives'||spec.victoryMode==='lives')&&(
                  <button style={{...btnBase,background:'rgba(255,59,92,.12)',color:'var(--red)'}} onClick={()=>loseLife(p.id)}>❤️ Perder vida</button>
                )}
                {spec.hasElimination&&(
                  <button style={{...btnBase,background:'rgba(255,59,92,.15)',color:'var(--red)',border:'1px solid rgba(255,59,92,.3)'}} onClick={()=>eliminate(p.id)}>💀 Eliminar</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* HOST CONTROLS */}
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        {!done&&spec.hasTurns&&<button style={{...btnBase,background:'rgba(255,212,71,.12)',color:'var(--gold)',flex:1}} onClick={nextTurn}>↩ Sig. turno</button>}
        {!done&&spec.hasRounds&&<button style={{...btnBase,background:'rgba(155,93,229,.12)',color:'var(--purple)',flex:1}} onClick={closeRound}>📋 Cerrar ronda</button>}
        {!done&&!spec.hasRounds&&<button style={{...btnBase,background:'rgba(255,107,53,.15)',color:'var(--orange)',flex:1}} onClick={()=>{setDone(true);addLog('🏁 Partida terminada manualmente','var(--orange)');}}>🏁 Terminar</button>}
        <button style={{...btnBase,background:'rgba(0,245,255,.08)',color:'var(--cyan)',flex:.6}} onClick={reset}>↺ Reset</button>
      </div>

      {/* DONE STATE */}
      {done&&(
        <div style={{textAlign:'center',padding:'20px 16px',borderRadius:12,background:'linear-gradient(135deg,rgba(255,212,71,.08),rgba(0,255,157,.05))',border:'1px solid rgba(255,212,71,.2)'}}>
          <div style={{fontSize:'2rem',marginBottom:8}}>🏆</div>
          <div style={{fontFamily:'var(--font-display)',fontSize:'1.1rem',letterSpacing:2,color:'var(--gold)',marginBottom:4}}>PARTIDA SIMULADA</div>
          <div style={{fontFamily:'var(--font-label)',fontSize:'12px',color:'rgba(255,255,255,.45)'}}>Config validada. ¡Esta configuración funciona!</div>
          <button style={{...btnBase,background:'rgba(0,245,255,.1)',color:'var(--cyan)',marginTop:12}} onClick={reset}>↺ Simular otra vez</button>
        </div>
      )}

      {/* ACTIVITY LOG */}
      <div style={cellStyle}>
        <div style={{fontFamily:'var(--font-ui)',fontSize:'9px',letterSpacing:2,color:'rgba(255,255,255,.3)',marginBottom:6}}>LOG DE EVENTOS</div>
        <div ref={logRef} style={{maxHeight:140,overflowY:'auto',display:'flex',flexDirection:'column',gap:3}}>
          {log.length===0&&<div style={{fontFamily:'var(--font-label)',fontSize:'12px',color:'rgba(255,255,255,.25)'}}>Sin eventos aún. Interactúa con los controles.</div>}
          {log.map((l,i)=>(
            <div key={i} style={{fontFamily:'var(--font-label)',fontSize:'11px',color:l.color||'rgba(255,255,255,.6)',padding:'2px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
              <span style={{color:'rgba(255,255,255,.2)',marginRight:8}}>{String(i+1).padStart(2,'0')}</span>{l.msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RuntimePreviewPanel({ payload }){
  const [tab, setTab] = React.useState('summary');
  if(!payload?.runtime) return null;
  return (
    <div style={{marginBottom:16,padding:'14px',borderRadius:18,background:'linear-gradient(135deg, rgba(74,144,255,.07), rgba(0,245,255,.05))',border:'1px solid rgba(255,255,255,.08)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,marginBottom:12,flexWrap:'wrap'}}>
        <div>
          <div style={{fontFamily:'var(--font-display)',fontSize:'1rem',letterSpacing:1,color:'var(--cyan)'}}>Vista previa del juego generado</div>
          <div style={{fontFamily:'var(--font-label)',fontSize:'11px',letterSpacing:1,color:'rgba(255,255,255,.46)'}}>Resumen, flujo, pads y simulador</div>
        </div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          <PreviewTabButton active={tab==='summary'} onClick={()=>setTab('summary')} label='Resumen' color='#00F5FF' />
          <PreviewTabButton active={tab==='flow'} onClick={()=>setTab('flow')} label='Flujo' color='#4A90FF' />
          <PreviewTabButton active={tab==='player'} onClick={()=>setTab('player')} label='Pad jugador' color='#00FF9D' />
          <PreviewTabButton active={tab==='host'} onClick={()=>setTab('host')} label='Pad host' color='#FFD447' />
          <PreviewTabButton active={tab==='simulate'} onClick={()=>setTab('simulate')} label='🎮 Simular' color='#FF6B35' />
        </div>
      </div>

      {tab === 'summary'  && <SummaryPreviewTab payload={payload} />}
      {tab === 'flow'     && <FlowPreviewTab payload={payload} />}
      {tab === 'player'   && <PlayerPadPreview payload={payload} />}
      {tab === 'host'     && <HostPadPreview payload={payload} />}
      {tab === 'simulate' && <RuntimeSimulator payload={payload} />}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// MY GAMES SCREEN — lista de juegos guardados (vnext)
// Visual del legacy + estructura del nuevo schema
// ═══════════════════════════════════════════════════════════════
function MyGamesScreenVNext({ user, onBack, onBuildNew, onEditTemplate, onPlayTemplate, onSignOut }){
  const [templates, setTemplates] = React.useState([]);
  const [loading,   setLoading]   = React.useState(true);
  const [deleting,  setDeleting]  = React.useState(null);

  React.useEffect(()=>{
    if(!user) return;
    // Re-sembrar presets — incluye nuevos juegos de official-presets.js
    seedPresetTemplates(user.uid)
      .catch(()=>{})
      .finally(()=>{
        loadGameTemplates(user.uid)
          .then(t=>{ setTemplates(t); setLoading(false); })
          .catch(()=>setLoading(false));
      });
  },[user?.uid]);

  async function handleDelete(t){
    if(!window.confirm(`¿Borrar "${t.name}"?`)) return;
    if(typeof snd === 'function') snd('delete');
    setDeleting(t.id);
    await deleteGameTemplate(user.uid, t.id);
    setTemplates(prev=>prev.filter(x=>x.id!==t.id));
    setDeleting(null);
  }

  // Color por modo victoria — lee del grouped.victory o del config plano
  function modeColor(t){
    const vm = t.grouped?.victory?.victoryMode || t.config?.victoryMode || 'points';
    return vm==='points'?'var(--gold)':vm==='wins'?'var(--cyan)':vm==='elimination'?'var(--red)':'var(--purple)';
  }
  function modeLabel(t){
    const vm = t.grouped?.victory?.victoryMode || t.config?.victoryMode || 'points';
    return vm==='points'?'Puntos':vm==='wins'?'Victorias':vm==='elimination'?'Eliminación':'Manual';
  }
  function modeEmoji(t){
    const vm = t.grouped?.victory?.victoryMode || t.config?.victoryMode || 'points';
    return vm==='points'?'🏅':vm==='wins'?'🏆':vm==='elimination'?'💀':'🎯';
  }

  return(
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onBack}>← Home</button>
        <div className="os-logo" style={{fontSize:'1.1rem'}}>MIS <span>JUEGOS</span></div>
        {user&&(
          <button className="btn btn-ghost btn-sm" style={{width:'auto',fontSize:'var(--fs-micro)'}} onClick={onSignOut}>
            {user.photoURL?<img src={user.photoURL} style={{width:22,height:22,borderRadius:'50%'}} alt=""/>:'👤'}
          </button>
        )}
      </div>

      <div className="os-page" style={{paddingTop:16}}>
        {/* User chip */}
        <div style={{display:'flex',alignItems:'center',gap:10,background:'rgba(155,93,229,.06)',border:'1px solid rgba(155,93,229,.2)',borderRadius:12,padding:'10px 14px',marginBottom:16}}>
          <div style={{fontSize:'1.4rem'}}>{user?.photoURL?<img src={user.photoURL} style={{width:28,height:28,borderRadius:'50%'}} alt=""/>:'👤'}</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:'var(--font-body)',fontWeight:700,fontSize:'var(--fs-sm)',color:'var(--purple)'}}>{user?.displayName||user?.email||'Usuario'}</div>
            <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)',letterSpacing:1,marginTop:1}}>
              {templates.length} juego{templates.length!==1?'s':''} · Schema v2
            </div>
          </div>
          <div style={{background:'rgba(0,245,255,.08)',border:'1px solid rgba(0,245,255,.2)',borderRadius:8,padding:'3px 8px',fontFamily:'var(--font-ui)',fontSize:'8px',letterSpacing:2,color:'var(--cyan)'}}>VNEXT</div>
        </div>

        <button className="btn btn-purple" style={{marginBottom:20}} onClick={()=>{ if(typeof snd==='function')snd('tap'); onBuildNew(); }}>
          + Crear nuevo juego
        </button>

        {loading&&<div style={{textAlign:'center',padding:'40px 0'}}><div className="os-spin" style={{marginBottom:12}}/><div style={{fontFamily:'var(--font-label)',color:'rgba(255,255,255,.35)',letterSpacing:2}}>CARGANDO...</div></div>}

        {!loading&&templates.length===0&&(
          <div className="os-empty">
            <div style={{fontSize:'3rem',marginBottom:12}}>🎮</div>
            <div style={{fontFamily:'var(--font-display)',fontSize:'1rem',letterSpacing:1,marginBottom:6}}>Sin juegos aún</div>
            <div style={{fontSize:'var(--fs-sm)'}}>Crea tu primer juego con el builder</div>
          </div>
        )}

        {!loading&&templates.map((t,i)=>{
          const color = modeColor(t);
          // Leer datos del nuevo formato grouped, con fallback al config plano legacy
          const vm   = t.grouped?.victory?.victoryMode || t.config?.victoryMode;
          const hasRounds = t.grouped?.structure?.useRounds ?? t.config?.useRounds;
          const rounds    = t.grouped?.structure?.rounds ?? t.config?.rounds;
          const hasTurns  = t.grouped?.structure?.useTurns ?? t.config?.useTurns;
          const hasToken  = t.grouped?.structure?.useFirstPlayerToken ?? t.config?.useFirstPlayerToken;
          const hasTimer  = t.grouped?.structure?.useTimer ?? t.config?.useTimer;
          const toolsLen  = (t.grouped?.tools?.tools ?? t.config?.tools ?? []).length;
          const isNew     = !!t.schemaVersion; // marcador: guardado con vnext

          return(
            <div key={t.id} className="anim-fade" style={{background:'var(--surface)',border:`1px solid ${color}44`,borderRadius:16,padding:'14px 15px',marginBottom:10,animationDelay:i*.05+'s',position:'relative'}}>
              {isNew&&<div style={{position:'absolute',top:10,right:12,background:'rgba(0,245,255,.1)',border:'1px solid rgba(0,245,255,.25)',borderRadius:6,padding:'2px 7px',fontFamily:'var(--font-ui)',fontSize:'7px',letterSpacing:2,color:'var(--cyan)'}}>v2</div>}
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                <div style={{fontSize:'2rem',width:50,height:50,borderRadius:13,display:'flex',alignItems:'center',justifyContent:'center',background:`${color}18`,border:`1px solid ${color}33`,flexShrink:0}}>{t.emoji||'🎮'}</div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:'var(--font-display)',fontSize:'1.1rem',letterSpacing:1,color:'#fff'}}>{t.name}</div>
                  <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',fontWeight:600,color:'rgba(255,255,255,.4)',letterSpacing:1,marginTop:2}}>{t.description||t.summary||''}</div>
                </div>
              </div>
              <div className="os-tags" style={{marginBottom:12}}>
                <div className="os-tag" style={{background:`${color}18`,borderColor:`${color}44`,color}}>{modeEmoji(t)} {modeLabel(t)}</div>
                {hasRounds&&<div className="os-tag">{rounds==='libre'?'∞ Libre':`${rounds} rondas`}</div>}
                {hasTurns&&<div className="os-tag purple">↕️ Turnos</div>}
                {hasToken&&<div className="os-tag gold">👑 Token</div>}
                {hasTimer&&<div className="os-tag orange">⏱ Timer</div>}
                {toolsLen>0&&<div className="os-tag purple">🎲 {toolsLen} herr.</div>}
                <div className="os-tag" style={{fontSize:'.6rem',color:'rgba(255,255,255,.25)'}}>{typeof fmtShortDate==='function'?fmtShortDate(t.updatedAt||t.createdAt):''}</div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button className="btn btn-cyan btn-sm" style={{flex:1,marginBottom:0}} onClick={()=>{ if(typeof snd==='function')snd('tap'); onPlayTemplate(t); }}>▶ Jugar</button>
                <button className="btn btn-ghost btn-sm" style={{flex:.6,marginBottom:0}} onClick={()=>{ if(typeof snd==='function')snd('tap'); onEditTemplate(t); }}>✏️ Editar</button>
                <button style={{marginBottom:0,background:'rgba(255,59,92,.1)',border:'1px solid rgba(255,59,92,.25)',color:'var(--red)',borderRadius:9,padding:'9px 12px',cursor:'pointer',fontFamily:'var(--font-display)',fontSize:'var(--fs-xs)',opacity:deleting===t.id?.5:1}} onClick={()=>handleDelete(t)}>{deleting===t.id?'...':'🗑'}</button>
              </div>
            </div>
          );
        })}
        <div className="g16"/>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCHEMA DRIVEN BUILDER — v2 con Firebase + simulador
// ═══════════════════════════════════════════════════════════════
function SchemaDrivenBuilder({ initialConfig = {}, onSave, onBack, title='Game Builder', user, editingTemplate }){
  const schema = window.ENGINE_SCHEMA;
  const [config, setConfig] = React.useState(()=>{
    if(!schema || !window.SchemaUtils) return {};
    const base = editingTemplate?.config || initialConfig || {};
    return window.SchemaUtils.normalizeConfig(schema, base);
  });

  const [openSections,  setOpenSections]  = React.useState({});
  const [previewPayload,setPreviewPayload] = React.useState(null);
  const [previewOpen,   setPreviewOpen]    = React.useState(false);
  const [groupedOpen,   setGroupedOpen]    = React.useState(false);
  const [saving,        setSaving]         = React.useState(false);
  const [saved,         setSaved]          = React.useState(false);
  const [saveError,     setSaveError]      = React.useState('');
  const previewRef  = React.useRef(null);
  const sectionRefs = React.useRef({});

  const presets = React.useMemo(()=>{
    const map = window.OFFICIAL_PRESETS || {};
    return Object.keys(map).map(key=>({key,...map[key]})).filter(x=>x&&x.config).sort((a,b)=>(a.order||999)-(b.order||999));
  },[]);

  const [selectedPresetKey, setSelectedPresetKey] = React.useState('');
  const selectedPreset = React.useMemo(()=>{
    if(!presets.length) return null;
    return presets.find(p=>String(p.key||p.id)===String(selectedPresetKey))||presets[0];
  },[presets,selectedPresetKey]);

  const livePayload = React.useMemo(()=>{
    if(!schema||!window.SchemaUtils) return null;
    try{
      // Enriquecer payload con runtime unificado
      const base = window.SchemaUtils.exportPayload(schema, config);
      if(typeof resolveRuntime === 'function'){
        base.runtime = { ...base.runtime, ...resolveRuntime(config) };
      }
      return base;
    }catch(err){ console.error('livePayload error',err); return null; }
  },[schema,config]);

  React.useEffect(()=>{
    if(!schema) return;
    const init={};
    (schema.sections||[]).forEach((s,i)=>{ init[s.id]=i===0; });
    setOpenSections(init);
  },[schema]);

  const validation = React.useMemo(()=>{
    if(!schema||!window.SchemaUtils) return null;
    return window.SchemaUtils.validateConfig(schema,config);
  },[schema,config]);

  function updateField(id,value){ setConfig(prev=>({...prev,[id]:value})); }

  function toggleSection(id){ setOpenSections(prev=>({...prev,[id]:!prev[id]})); }

  function completeAndAdvance(index){
    const sections=schema.sections||[];
    const current=sections[index]; const next=sections[index+1];
    setOpenSections(prev=>{ const n={...prev,[current.id]:false}; if(next)n[next.id]=true; return n; });
    if(next) setTimeout(()=>{ const node=sectionRefs.current[next.id]; if(node){ node.scrollIntoView({behavior:'smooth',block:'start'}); if(window.anime){window.anime.remove(node);window.anime({targets:node,translateY:[10,0],opacity:[.86,1],duration:360,easing:'easeOutQuad'});} } },260);
  }

  function applyPreset(preset){
    if(!preset||!preset.config||!schema||!window.SchemaUtils) return;
    const normalized=window.SchemaUtils.normalizeConfig(schema,preset.config);
    setConfig(normalized); setPreviewPayload(null); setPreviewOpen(false); setGroupedOpen(false);
    const init={}; (schema.sections||[]).forEach((s,i)=>{ init[s.id]=i===0; }); setOpenSections(init);
    setTimeout(()=>{ const first=(schema.sections||[])[0]; const node=first?sectionRefs.current[first.id]:null; if(node)node.scrollIntoView({behavior:'smooth',block:'start'}); },120);
  }

  // ── GUARDAR EN FIREBASE ────────────────────────────────────────
  async function handleSave(){
    if(!config.name||!String(config.name).trim()){ alert('El juego necesita un nombre'); return; }
    setSaving(true); setSaveError(''); setSaved(false);
    if(typeof snd==='function') snd('save');
    try{
      const payload = livePayload || window.SchemaUtils.exportPayload(schema, config);
      // Enriquecer runtime si está disponible
      if(typeof resolveRuntime==='function' && payload.runtime){
        Object.assign(payload.runtime, resolveRuntime(config));
      }

      // Estructura nueva (vnext) + campo config plano para compatibilidad legacy
      const templateData = {
        id: editingTemplate?.id || undefined,
        name: String(config.name||'').trim(),
        emoji: config.emoji || '🎮',
        description: payload.summary || '',
        summary: payload.summary || '',
        schemaVersion: '2.0',
        exportedAt: payload.exportedAt,
        // Nuevo: config plano + agrupado + runtime
        config: payload.config,          // plano — compatible con legacy runtime
        grouped: payload.grouped,        // por secciones — nuevo
        runtime: payload.runtime || {},  // spec + timeline + gameState
        // Metadatos de validación
        valid: payload.valid,
        warnings: payload.warnings || [],
      };

      let saved;
      if(user){
        saved = await saveGameTemplate(user.uid, templateData);
      } else {
        // Sin auth — guardar en localStorage como demo
        const id = templateData.id || ('local_'+Date.now());
        const data = {...templateData, id, updatedAt:Date.now(), createdAt:editingTemplate?.createdAt||Date.now()};
        const key = 'bgos_local_templates';
        const existing = JSON.parse(localStorage.getItem(key)||'[]');
        const idx = existing.findIndex(x=>x.id===id);
        if(idx>=0) existing[idx]=data; else existing.push(data);
        localStorage.setItem(key, JSON.stringify(existing));
        saved = data;
      }

      setSaving(false); setSaved(true);
      if(typeof snd==='function') setTimeout(()=>snd('win'),200);
      if(onSave) setTimeout(()=>onSave(saved), 1200);
    } catch(e){
      console.error('Save error:',e);
      setSaving(false);
      setSaveError('Error al guardar: '+(e.message||'intenta de nuevo'));
    }
  }

  if(!schema){
    return(<div className="os-wrap"><div className="os-page" style={{paddingTop:80,textAlign:'center'}}><div className="os-alert alert-red">ENGINE_SCHEMA no está cargado</div></div></div>);
  }

  if(saved){
    return(
      <div className="os-wrap">
        <div className="os-page" style={{paddingTop:80,textAlign:'center'}}>
          <div style={{fontSize:'4rem',marginBottom:16}}>💾</div>
          <div style={{fontFamily:'var(--font-display)',fontSize:'1.5rem',letterSpacing:2,background:'linear-gradient(135deg,var(--purple),var(--cyan))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:8}}>¡GUARDADO!</div>
          <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-sm)',fontWeight:600,color:'rgba(255,255,255,.4)',letterSpacing:1}}>"{config.name}" listo para jugar</div>
          {user&&<div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(0,245,255,.5)',letterSpacing:2,marginTop:8}}>GUARDADO EN LA NUBE ☁️</div>}
          {!user&&<div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,212,71,.5)',letterSpacing:2,marginTop:8}}>GUARDADO LOCAL — Inicia sesión para sincronizar</div>}
        </div>
      </div>
    );
  }

  const sections = schema.sections||[];
  const completedCount = sections.filter(s=>window.SchemaUtils.sectionState(s,config).status==='complete').length;
  const progressPct = Math.round((completedCount/Math.max(sections.length,1))*100);

  return (
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onBack || (()=>history.back())}>← Atrás</button>
        <div className="os-logo" style={{fontSize:'1rem'}}>{editingTemplate?`✏️ ${editingTemplate.name}`:title}</div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {user&&<div style={{fontFamily:'var(--font-ui)',fontSize:'8px',letterSpacing:2,color:'rgba(0,245,255,.5)'}}>☁️</div>}
          <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.45)',letterSpacing:2}}>
            {completedCount}/{sections.length}
          </div>
        </div>
      </div>

      <div className="os-page" style={{paddingTop:16}}>
        <BuilderFXStyles />

        {presets.length > 0 && (
          <div style={{marginBottom:14}}>
            <div style={{fontFamily:'var(--font-label)',fontSize:'11px',letterSpacing:2,color:'rgba(255,255,255,.48)',marginBottom:8}}>
              PRESETS DE VALIDACIÓN
            </div>

            <div style={{
              padding:12,
              borderRadius:16,
              border:'1px solid rgba(255,255,255,.10)',
              background:'linear-gradient(135deg, rgba(255,255,255,.045), rgba(255,255,255,.018))'
            }}>
              <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:8,alignItems:'center'}}>
                <select
                  className="os-select"
                  value={String((selectedPreset?.key || selectedPreset?.id) || '')}
                  onChange={e=>setSelectedPresetKey(e.target.value)}
                  style={{minHeight:42, fontSize:'0.86rem', padding:'8px 10px'}}
                >
                  {[...presets].sort((a,b)=>(a.order||999)-(b.order||999)).map((preset)=>(
                    <option key={preset.id || preset.key} value={String(preset.key || preset.id)}>
                      {(preset.emoji || '🎮') + ' ' + (preset.name || preset.label || preset.key)}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={()=>applyPreset(selectedPreset)}
                  disabled={!selectedPreset}
                  style={_gradientButtonStyle((selectedPreset?.color || '#00F5FF'), {compact:true})}
                >
                  Cargar
                </button>
              </div>

              {selectedPreset && (
                <div style={{marginTop:10}}>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:8}}>
                    <span style={{
                      padding:'5px 9px',
                      borderRadius:999,
                      background:_withAlpha(selectedPreset.color || '#00F5FF', .12),
                      border:`1px solid ${_withAlpha(selectedPreset.color || '#00F5FF', .28)}`,
                      color:selectedPreset.color || '#00F5FF',
                      fontFamily:'var(--font-label)',
                      fontSize:'10px',
                      letterSpacing:1
                    }}>
                      {selectedPreset.category || 'preset'}
                    </span>
                    <span style={{
                      padding:'5px 9px',
                      borderRadius:999,
                      background:'rgba(255,255,255,.05)',
                      border:'1px solid rgba(255,255,255,.10)',
                      color:'rgba(255,255,255,.68)',
                      fontFamily:'var(--font-label)',
                      fontSize:'10px',
                      letterSpacing:1
                    }}>
                      {selectedPreset.complexity || 'medium'}
                    </span>
                  </div>

                  {Array.isArray(selectedPreset.validates) && selectedPreset.validates.length > 0 && (
                    <div style={{marginBottom:8}}>
                      <div style={{fontFamily:'var(--font-label)',fontSize:'10px',letterSpacing:1.4,color:'rgba(255,255,255,.45)',marginBottom:5,textTransform:'uppercase'}}>Valida</div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                        {selectedPreset.validates.map((v,i)=>(
                          <span key={i} style={{
                            padding:'5px 8px',
                            borderRadius:10,
                            background:'rgba(0,245,255,.07)',
                            border:'1px solid rgba(0,245,255,.16)',
                            color:'rgba(255,255,255,.76)',
                            fontFamily:'var(--font-label)',
                            fontSize:'10px'
                          }}>
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(selectedPreset.valueAdd) && selectedPreset.valueAdd.length > 0 && (
                    <div>
                      <div style={{fontFamily:'var(--font-label)',fontSize:'10px',letterSpacing:1.4,color:'rgba(255,255,255,.45)',marginBottom:5,textTransform:'uppercase'}}>Qué debería probar</div>
                      <div style={{display:'grid',gap:5}}>
                        {selectedPreset.valueAdd.map((v,i)=>(
                          <div key={i} style={{
                            fontFamily:'var(--font-label)',
                            fontSize:'11px',
                            color:'rgba(255,255,255,.64)'
                          }}>
                            • {v}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        <HumanSummary config={config} />

        <div style={{marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
            <div style={{fontFamily:'var(--font-label)',fontSize:'12px',color:'rgba(255,255,255,.55)',letterSpacing:1}}>
              Avance total del motor
            </div>
            <div style={{fontFamily:'var(--font-display)',fontSize:'0.95rem',color:'var(--cyan)'}}>
              {progressPct}%
            </div>
          </div>
          <div style={{height:10,borderRadius:999,background:'rgba(255,255,255,.06)',overflow:'hidden'}}>
            <div style={{
              width:`${progressPct}%`,
              height:'100%',
              background:'linear-gradient(90deg,var(--cyan),var(--purple))',
              borderRadius:999,
              transition:'width .25s ease'
            }}/>
          </div>
        </div>

        <ValidationPanel validation={validation} />
        {previewOpen && (
          <div ref={previewRef}>
            <RuntimePreviewPanel payload={previewPayload || livePayload} />
            <GroupedPreview payload={previewPayload || livePayload} forceOpen={groupedOpen} />
          </div>
        )}

        {sections.map((section, index)=>(
          <div key={section.id} ref={el=>{ sectionRefs.current[section.id] = el; }}>
          <SectionBlock
            section={section}
            index={index}
            config={config}
            isOpen={!!openSections[section.id]}
            onToggle={()=>toggleSection(section.id)}
            onChange={updateField}
            onComplete={()=>completeAndAdvance(index)}
            isLast={index === sections.length - 1}
          />
          </div>
        ))}

        <div className="g16" />

        {saveError&&<div style={{background:'rgba(255,59,92,.1)',border:'1px solid rgba(255,59,92,.3)',borderRadius:10,padding:'10px 14px',marginBottom:12,fontFamily:'var(--font-label)',fontSize:'12px',color:'var(--red)'}}>{saveError}</div>}

        <div style={{display:'flex',gap:8}}>
          <button
            className="btn btn-ghost"
            style={{..._softGhostButtonStyle('#4A90FF'), flex:1}}
            onClick={()=>{
              const payload = livePayload || window.SchemaUtils.exportPayload(schema, config);
              setPreviewPayload(payload);
              setPreviewOpen(true);
              setGroupedOpen(true);
              setTimeout(()=>{
                const node = previewRef.current;
                if(node){ node.scrollIntoView({behavior:'smooth',block:'start'}); if(window.anime){window.anime.remove(node);window.anime({targets:node,opacity:[.72,1],translateY:[10,0],duration:320,easing:'easeOutQuad'});} }
              }, 40);
            }}
          >
            👁️ Previsualizar
          </button>

          <button
            className="btn btn-cyan"
            style={{..._gradientButtonStyle('#00F5FF',{full:true}), flex:1, opacity:saving?.6:1}}
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? '⏳ Guardando...' : user ? '☁️ Guardar' : '💾 Guardar local'}
          </button>
        </div>

        {!user&&(
          <div style={{marginTop:10,padding:'8px 12px',borderRadius:8,background:'rgba(255,212,71,.06)',border:'1px solid rgba(255,212,71,.18)',fontFamily:'var(--font-label)',fontSize:'11px',color:'rgba(255,212,71,.7)',textAlign:'center'}}>
            💡 Inicia sesión en Mis Juegos para guardar en la nube y sincronizar entre dispositivos
          </div>
        )}
      </div>
    </div>
  );
}

window.BGOS_VNEXT = window.BGOS_VNEXT || {};
window.BGOS_VNEXT.components = Object.assign({}, window.BGOS_VNEXT.components, {
  SchemaDrivenBuilderVNext: SchemaDrivenBuilder,
  MyGamesScreenVNext: MyGamesScreenVNext,
});
window.BGOS_VNEXT.render = function renderBuilderVNext(container, props = {}){
  if(!container) return null;
  const root = ReactDOM.createRoot(container);
  root.render(React.createElement(SchemaDrivenBuilder, props));
  return root;
};
window.SchemaDrivenBuilder = SchemaDrivenBuilder;
window.MyGamesScreenVNext  = MyGamesScreenVNext;