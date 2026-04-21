if(!window.ENGINE_SCHEMA){
  console.error('ENGINE_SCHEMA no está cargado');
}
if(!window.SchemaUtils){
  console.error('SchemaUtils no está cargado');
}

function _sectionColor(section){
  return section.color || 'var(--cyan)';
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
          <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(255,255,255,.45)'}}>
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
    </div>
  );
}

function EmojiInlineField({ nameValue, emojiValue, onChangeName, onChangeEmoji }){
  const options = (window.ENGINE_SCHEMA.sections || [])
    .find(s => s.id === 'general')
    ?.fields?.find(f => f.id === 'emoji')?.options || [];

  return (
    <div style={{
      marginBottom:12,
      padding:'12px',
      borderRadius:12,
      border:'1px solid rgba(255,255,255,.07)',
      background:'rgba(255,255,255,.03)'
    }}>
      <div style={{
        fontFamily:'var(--font-label)',
        fontSize:'var(--fs-xs)',
        color:'rgba(255,255,255,.55)',
        letterSpacing:1,
        marginBottom:8
      }}>
        Nombre del juego
      </div>

      <div style={{display:'flex',gap:10,alignItems:'stretch'}}>
        <div style={{
          width:76,
          minWidth:76,
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          borderRadius:14,
          border:'1px solid rgba(255,255,255,.10)',
          background:'rgba(255,255,255,.04)',
          flexDirection:'column',
          gap:6,
          padding:'8px 6px'
        }}>
          <div style={{fontSize:'1.5rem'}}>{emojiValue || '🎮'}</div>
          <select
            className="os-select"
            value={emojiValue ?? '🎮'}
            onChange={e=>onChangeEmoji(e.target.value)}
            style={{padding:'6px 8px', fontSize:'12px'}}
          >
            {options.map(opt=>(
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <input
          className="os-input"
          style={{flex:1, marginBottom:0}}
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
        fontSize:'var(--fs-xs)',
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
            border:'1px solid rgba(255,255,255,.08)'
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
            style={{marginBottom:0, flex:1}}
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

function FieldRenderer({ field, value, config, onChange }){
  const visible = window.SchemaUtils.isVisible(field, config);
  const disabled = !visible;
  const reason = _disabledReason(field, config);

  function set(next){
    if(disabled) return;
    onChange(field.id, next);
  }

  const wrapStyle = {
    marginBottom: 12,
    padding: '10px 12px',
    borderRadius: 12,
    border: disabled ? '1px dashed rgba(255,255,255,.10)' : '1px solid rgba(255,255,255,.07)',
    background: disabled ? 'rgba(255,255,255,.02)' : 'rgba(255,255,255,.03)',
    opacity: disabled ? .55 : 1
  };

  const labelStyle = {
    fontFamily:'var(--font-label)',
    fontSize:'var(--fs-xs)',
    color:'rgba(255,255,255,.55)',
    letterSpacing:1,
    marginBottom:6
  };

  if(field.id === 'name' || field.id === 'emoji') return null;

  if(field.type === 'boolean'){
    return (
      <div style={wrapStyle}>
        <div
          className={`check-row ${value ? 'active' : ''}`}
          style={{marginBottom:0, cursor: disabled ? 'not-allowed' : 'pointer'}}
          onClick={()=>set(!value)}
        >
          <div className="check-box">{value ? '✓' : ''}</div>
          <div>
            <div className="check-label">{field.label}</div>
            {reason && <div className="check-sub">{reason}</div>}
          </div>
        </div>
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
          style={{marginBottom: reason ? 6 : 0}}
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
          style={{minHeight:88, resize:'vertical', marginBottom: reason ? 6 : 0}}
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
                  padding:'7px 11px',
                  borderRadius:10,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  border:`1px solid ${active ? 'rgba(0,245,255,.45)' : 'rgba(255,255,255,.12)'}`,
                  background:active ? 'rgba(0,245,255,.16)' : 'rgba(255,255,255,.04)',
                  color:active ? 'var(--cyan)' : 'rgba(255,255,255,.65)',
                  fontFamily:'var(--font-label)',
                  fontSize:'var(--fs-xs)',
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

  if(field.type === 'list_text'){
    return (
      <div style={wrapStyle}>
        <ListTextField label={field.label} value={Array.isArray(value) ? value : []} onChange={set} disabled={disabled} />
        {reason && <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)'}}>{reason}</div>}
      </div>
    );
  }

  return null;
}

function _fieldHasStoredValue(field, value){
  if(value === null || value === undefined) return false;
  if(field.type === 'boolean') return value === true;
  if(field.type === 'multi_select' || field.type === 'list_text' || field.type === 'counter_set_editor'){
    return Array.isArray(value) && value.length > 0;
  }
  if(field.type === 'number') return value !== '' && !Number.isNaN(Number(value));
  return String(value).trim().length > 0;
}

function _compactValueText(field, value){
  if(value === null || value === undefined || value === '') return null;
  if(field.type === 'boolean') return value ? 'Sí' : 'No';
  if(field.type === 'multi_select' || field.type === 'list_text' || field.type === 'counter_set_editor'){
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
  const color = _sectionColor(section);
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
    padding:'14px',
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
              <div style={{fontFamily:'var(--font-display)',fontSize:'1rem',letterSpacing:1,color,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
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
            padding:'14px 12px 12px',
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

          {visibleFields.map(field=>(
            <FieldRenderer
              key={field.id}
              field={field}
              value={config[field.id]}
              config={config}
              onChange={onChange}
            />
          ))}

          {inactiveFields.length > 0 && (
            <div style={{marginTop:10}}>
              <button
                type="button"
                className="btn btn-ghost"
                style={{
                  width:'100%',
                  justifyContent:'center',
                  borderColor: showInactive ? color + '55' : undefined,
                  background: showInactive ? color + '14' : undefined,
                  color: showInactive ? color : undefined
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
                  <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.46)',lineHeight:1.45}}>
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
                {inactiveFields.map(field=>(
                  <FieldRenderer
                    key={field.id}
                    field={field}
                    value={config[field.id]}
                    config={config}
                    onChange={onChange}
                  />
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
              style={{flex:1}}
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

function GroupedPreview({ payload }){
  const [open, setOpen] = React.useState(false);
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

function SchemaDrivenBuilder({ initialConfig = {}, onSave, onBack, title='Schema Builder V4' }){
  const schema = window.ENGINE_SCHEMA;
  const [config, setConfig] = React.useState(()=>{
    if(!schema || !window.SchemaUtils) return {};
    return window.SchemaUtils.normalizeConfig(schema, initialConfig || {});
  });

  const [openSections, setOpenSections] = React.useState({});
  const [previewPayload, setPreviewPayload] = React.useState(null);

  React.useEffect(()=>{
    if(!schema) return;
    const init = {};
    (schema.sections || []).forEach(section=>{
      init[section.id] = false;
    });
    setOpenSections(init);
  }, [schema]);

  const validation = React.useMemo(()=>{
    if(!schema || !window.SchemaUtils) return null;
    return window.SchemaUtils.validateConfig(schema, config);
  }, [schema, config]);

  function updateField(id, value){
    setConfig(prev => ({ ...prev, [id]: value }));
  }

  function toggleSection(id){
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function completeAndAdvance(index){
    const sections = schema.sections || [];
    const current = sections[index];
    const next = sections[index + 1];

    setOpenSections(prev => {
      const nextState = { ...prev, [current.id]: false };
      if(next) nextState[next.id] = true;
      return nextState;
    });
  }

  if(!schema){
    return (
      <div className="os-wrap">
        <div className="os-page" style={{paddingTop:80,textAlign:'center'}}>
          <div className="os-alert alert-red">ENGINE_SCHEMA no está cargado</div>
        </div>
      </div>
    );
  }

  const sections = schema.sections || [];
  const completedCount = sections.filter(s => window.SchemaUtils.sectionState(s, config).status === 'complete').length;
  const progressPct = Math.round((completedCount / Math.max(sections.length, 1)) * 100);

  return (
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onBack || (()=>history.back())}>← Atrás</button>
        <div className="os-logo" style={{fontSize:'1rem'}}>{title}</div>
        <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.45)',letterSpacing:2}}>
          {completedCount}/{sections.length}
        </div>
      </div>

      <div className="os-page" style={{paddingTop:16}}>
        <HumanSummary config={config} />

        <div style={{marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
            <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(255,255,255,.55)',letterSpacing:1}}>
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
        <GroupedPreview payload={previewPayload} />

        {sections.map((section, index)=>(
          <SectionBlock
            key={section.id}
            section={section}
            index={index}
            config={config}
            isOpen={!!openSections[section.id]}
            onToggle={()=>toggleSection(section.id)}
            onChange={updateField}
            onComplete={()=>completeAndAdvance(index)}
            isLast={index === sections.length - 1}
          />
        ))}

        <div className="g16" />

        <div style={{display:'flex',gap:8}}>
          <button
            className="btn btn-ghost"
            style={{flex:1}}
            onClick={()=>{
              const payload = window.SchemaUtils.exportPayload(schema, config);
              setPreviewPayload(payload);
            }}
          >
            👁️ Previsualizar
          </button>

          <button
            className="btn btn-cyan"
            style={{flex:1}}
            onClick={()=>{
              const payload = window.SchemaUtils.exportPayload(schema, config);
              setPreviewPayload(payload);
              if(onSave) onSave(payload);
            }}
          >
            💾 Guardar config
          </button>
        </div>
      </div>
    </div>
  );
}

window.SchemaDrivenBuilder = SchemaDrivenBuilder;
