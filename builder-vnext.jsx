if(!window.ENGINE_SCHEMA){
  console.error('ENGINE_SCHEMA no está cargado');
}
if(!window.SchemaUtils){
  console.error('SchemaUtils no está cargado');
}

function _sectionColor(section){
  return section.color || 'var(--cyan)';
}

function _sectionBadgeStyle(status, color){
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

function HumanMessageBar({ config }){
  const summary = window.SchemaUtils.summarizeConfig(config);

  return (
    <div style={{
      marginBottom:16,
      background:'linear-gradient(135deg,rgba(0,245,255,.07),rgba(155,93,229,.06))',
      border:'1px solid rgba(255,255,255,.08)',
      borderRadius:16,
      padding:'14px 16px'
    }}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
        <div style={{
          width:42,height:42,borderRadius:14,
          background:'rgba(255,255,255,.08)',
          border:'1px solid rgba(255,255,255,.10)',
          display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:'1.35rem'
        }}>
          {summary.emoji}
        </div>
        <div>
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
          `Estructura: ${summary.structure}`,
          `Turnos: ${summary.turns}`,
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

function ListTextField({ label, value, onChange, disabled }){
  const [draft, setDraft] = React.useState('');

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
            {item}
          </div>
          {!disabled && (
            <button type="button" onClick={()=>onChange((value || []).filter((_,i)=>i!==idx))}
              style={{background:'none',border:'none',color:'var(--red)',cursor:'pointer',fontSize:'1rem'}}>×</button>
          )}
        </div>
      ))}

      {!disabled && (
        <div style={{display:'flex', gap:8}}>
          <input className="os-input" style={{marginBottom:0, flex:1}} value={draft} onChange={e=>setDraft(e.target.value)} />
          <button type="button" className="btn btn-ghost" style={{width:'auto'}} onClick={()=>{
            if(!draft.trim()) return;
            onChange([...(value || []), draft.trim()]);
            setDraft('');
          }}>+</button>
        </div>
      )}
    </div>
  );
}

function SchemaFieldV3({ field, value, config, onChange }){
  const visible = window.SchemaUtils.isVisible(field, config);
  const disabled = !visible;
  const reason = _disabledReason(field, config);

  const labelStyle = {
    fontFamily:'var(--font-label)',
    fontSize:'var(--fs-xs)',
    color:'rgba(255,255,255,.55)',
    letterSpacing:1,
    marginBottom:6
  };

  function set(next){
    if(disabled) return;
    onChange(field.id, next);
  }

  const fieldWrapStyle = {
    marginBottom: 12,
    padding: '10px 12px',
    borderRadius: 12,
    border: disabled ? '1px dashed rgba(255,255,255,.10)' : '1px solid rgba(255,255,255,.07)',
    background: disabled ? 'rgba(255,255,255,.02)' : 'rgba(255,255,255,.03)',
    opacity: disabled ? .55 : 1,
    transition: 'all .18s ease'
  };

  if(field.type === 'boolean'){
    return (
      <div style={fieldWrapStyle}>
        <div className={`check-row ${value ? 'active' : ''}`} style={{marginBottom:0, cursor: disabled ? 'not-allowed' : 'pointer'}} onClick={()=>set(!value)}>
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
      <div style={fieldWrapStyle}>
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
      <div style={fieldWrapStyle}>
        <div style={labelStyle}>{field.label}</div>
        <textarea
          className="os-input"
          disabled={disabled}
          style={{minHeight:88, resize:'vertical', marginBottom: reason ? 6 : 0}}
          value={value ?? ''}
          onChange={e=>set(e.target.value)}
        />
        {reason && <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)'}}>{reason}</div>}
      </div>
    );
  }

  if(field.type === 'select'){
    return (
      <div style={fieldWrapStyle}>
        <div style={labelStyle}>{field.label}</div>
        <select className="os-select" disabled={disabled} value={value ?? ''} onChange={e=>set(e.target.value)}>
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
      <div style={fieldWrapStyle}>
        <div style={labelStyle}>{field.label}</div>
        <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
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
      <div style={fieldWrapStyle}>
        <ListTextField label={field.label} value={Array.isArray(value) ? value : []} onChange={set} disabled={disabled} />
        {reason && <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)'}}>{reason}</div>}
      </div>
    );
  }

  return null;
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

function SchemaDrivenBuilder({ initialConfig = {}, onSave, onBack, title='Schema Builder V3' }){
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
    (schema.sections || []).forEach((section, index)=>{
      init[section.id] = index < 2;
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
        <HumanMessageBar config={config} />

        <div style={{marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
            <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(255,255,255,.55)',letterSpacing:1}}>
              Avance del motor
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

        {sections.map((section, index)=>{
          const color = _sectionColor(section);
          const sectionInfo = window.SchemaUtils.sectionState(section, config);
          const isOpen = !!openSections[section.id];

          return (
            <div key={section.id} style={{marginBottom:14}}>
              <button
                type="button"
                onClick={()=>toggleSection(section.id)}
                style={{
                  width:'100%',
                  textAlign:'left',
                  background:`linear-gradient(135deg, ${color}1A, rgba(255,255,255,.03))`,
                  border:`1px solid ${color}40`,
                  borderRadius:isOpen ? '16px 16px 0 0' : '16px',
                  padding:'14px 14px',
                  cursor:'pointer'
                }}
              >
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
                  <div style={{display:'flex',alignItems:'center',gap:12,minWidth:0}}>
                    <div style={{
                      width:34,height:34,borderRadius:12,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      background: color + '22',
                      border:`1px solid ${color}55`,
                      fontSize:'1rem',
                      flexShrink:0
                    }}>
                      {section.icon || '•'}
                    </div>
                    <div style={{minWidth:0}}>
                      <div style={{fontFamily:'var(--font-display)',fontSize:'1rem',letterSpacing:1,color,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                        {index+1}. {section.title}
                      </div>
                      <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',letterSpacing:2,color:'rgba(255,255,255,.38)',marginTop:3}}>
                        {sectionInfo.label}
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
                      ..._sectionBadgeStyle(sectionInfo.status, color)
                    }}>
                      {sectionInfo.label}
                    </div>
                    <div style={{color:'rgba(255,255,255,.55)',fontSize:'1rem'}}>
                      {isOpen ? '▲' : '▼'}
                    </div>
                  </div>
                </div>
              </button>

              {isOpen && (
                <div style={{
                  border:`1px solid ${color}28`,
                  borderTop:'none',
                  borderRadius:'0 0 16px 16px',
                  padding:'14px 12px 8px',
                  background:'rgba(255,255,255,.025)'
                }}>
                  {(section.fields || []).map(field=>(
                    <SchemaFieldV3
                      key={field.id}
                      field={field}
                      value={config[field.id]}
                      config={config}
                      onChange={updateField}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

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
