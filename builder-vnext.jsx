if(!window.ENGINE_SCHEMA){
  console.error('ENGINE_SCHEMA no está cargado');
}
if(!window.SchemaUtils){
  console.error('SchemaUtils no está cargado');
}

function ListTextField({ label, value, onChange }){
  const [draft, setDraft] = React.useState('');

  return (
    <div style={{marginBottom:12}}>
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
        <div key={idx} style={{
          display:'flex',
          gap:8,
          marginBottom:6,
          alignItems:'center'
        }}>
          <div style={{
            flex:1,
            padding:'8px 10px',
            borderRadius:10,
            background:'rgba(255,255,255,.04)',
            border:'1px solid rgba(255,255,255,.08)'
          }}>
            {item}
          </div>
          <button
            type="button"
            onClick={()=>onChange((value || []).filter((_,i)=>i!==idx))}
            style={{
              background:'none',
              border:'none',
              color:'var(--red)',
              cursor:'pointer',
              fontSize:'1rem'
            }}
          >
            ×
          </button>
        </div>
      ))}

      <div style={{display:'flex', gap:8}}>
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
    </div>
  );
}

function SchemaField({ field, value, config, onChange }){
  if(!window.SchemaUtils.isVisible(field, config)) return null;

  const labelStyle = {
    fontFamily:'var(--font-label)',
    fontSize:'var(--fs-xs)',
    color:'rgba(255,255,255,.55)',
    letterSpacing:1,
    marginBottom:6
  };

  function set(next){
    onChange(field.id, next);
  }

  if(field.type === 'boolean'){
    return (
      <div className={`check-row ${value ? 'active' : ''}`} style={{marginBottom:8}} onClick={()=>set(!value)}>
        <div className="check-box">{value ? '✓' : ''}</div>
        <div><div className="check-label">{field.label}</div></div>
      </div>
    );
  }

  if(field.type === 'text' || field.type === 'number'){
    return (
      <div style={{marginBottom:12}}>
        <div style={labelStyle}>{field.label}</div>
        <input
          className="os-input"
          type={field.type === 'number' ? 'number' : 'text'}
          value={value ?? ''}
          onChange={e=>{
            if(field.type === 'number'){
              set(parseInt(e.target.value || '0', 10) || 0);
            } else {
              set(e.target.value);
            }
          }}
        />
      </div>
    );
  }

  if(field.type === 'textarea'){
    return (
      <div style={{marginBottom:12}}>
        <div style={labelStyle}>{field.label}</div>
        <textarea
          className="os-input"
          style={{minHeight:88, resize:'vertical'}}
          value={value ?? ''}
          onChange={e=>set(e.target.value)}
        />
      </div>
    );
  }

  if(field.type === 'select'){
    return (
      <div style={{marginBottom:12}}>
        <div style={labelStyle}>{field.label}</div>
        <select className="os-select" value={value ?? ''} onChange={e=>set(e.target.value)}>
          {(field.options || []).map(opt=>(
            <option key={String(opt.value)} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    );
  }

  if(field.type === 'multi_select'){
    const current = Array.isArray(value) ? value : [];
    return (
      <div style={{marginBottom:12}}>
        <div style={labelStyle}>{field.label}</div>
        <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
          {(field.options || []).map(opt=>{
            const active = current.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={()=>{
                  if(active) set(current.filter(v=>v!==opt.value));
                  else set([...current, opt.value]);
                }}
                style={{
                  padding:'7px 11px',
                  borderRadius:10,
                  cursor:'pointer',
                  border:`1px solid ${active ? 'rgba(0,245,255,.45)' : 'rgba(255,255,255,.12)'}`,
                  background:active ? 'rgba(0,245,255,.16)' : 'rgba(255,255,255,.04)',
                  color:active ? 'var(--cyan)' : 'rgba(255,255,255,.65)',
                  fontFamily:'var(--font-label)',
                  fontSize:'var(--fs-xs)',
                  fontWeight:700
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if(field.type === 'list_text'){
    return <ListTextField label={field.label} value={Array.isArray(value) ? value : []} onChange={set} />;
  }

  return null;
}

function ValidationPanel({ validation }){
  if(!validation) return null;
  const { errors = [], warnings = [] } = validation;
  if(errors.length === 0 && warnings.length === 0) return null;

  return (
    <div style={{marginBottom:16}}>
      {errors.length > 0 && (
        <div className="os-alert alert-red" style={{marginBottom:8, display:'block'}}>
          <div style={{fontWeight:700, marginBottom:6}}>Errores</div>
          {errors.map((msg, i)=><div key={i}>• {msg}</div>)}
        </div>
      )}
      {warnings.length > 0 && (
        <div className="os-alert alert-cyan" style={{display:'block'}}>
          <div style={{fontWeight:700, marginBottom:6}}>Warnings</div>
          {warnings.map((msg, i)=><div key={i}>• {msg}</div>)}
        </div>
      )}
    </div>
  );
}

function SchemaDrivenBuilder({ initialConfig = {}, onSave, onBack, title='Schema Builder V1' }){
  const schema = window.ENGINE_SCHEMA;
  const [config, setConfig] = React.useState(()=>{
    if(!schema || !window.SchemaUtils) return {};
    return window.SchemaUtils.normalizeConfig(schema, initialConfig || {});
  });

  const validation = React.useMemo(()=>{
    if(!schema || !window.SchemaUtils) return null;
    return window.SchemaUtils.validateConfig(schema, config);
  }, [schema, config]);

  function updateField(id, value){
    setConfig(prev => ({ ...prev, [id]: value }));
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

  return (
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onBack || (()=>history.back())}>← Atrás</button>
        <div className="os-logo" style={{fontSize:'1rem'}}>{title}</div>
        <div style={{width:70}}/>
      </div>

      <div className="os-page" style={{paddingTop:16}}>
        <ValidationPanel validation={validation} />

        {(schema.sections || []).map(section=>{
          const collapsed = window.SchemaUtils.isCollapsed(section, config);
          return (
            <div key={section.id} style={{marginBottom:18, opacity:collapsed ? 0.45 : 1}}>
              <div className="os-section">{section.icon || '•'} {section.title}</div>
              {!collapsed && (section.fields || []).map(field=>(
                <SchemaField
                  key={field.id}
                  field={field}
                  value={config[field.id]}
                  config={config}
                  onChange={updateField}
                />
              ))}
            </div>
          );
        })}

        <div className="g16" />

        <button
          className="btn btn-cyan"
          onClick={()=>{
            if(onSave) onSave(window.SchemaUtils.exportPayload(schema, config));
          }}
        >
          💾 Guardar config
        </button>
      </div>
    </div>
  );
}

window.SchemaDrivenBuilder = SchemaDrivenBuilder;
