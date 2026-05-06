// ═══════════════════════════════════════════════════════════════
// components.jsx — BOARDGAMEZ OS v2.0
// Incluye AuthScreen (extraído de builder.jsx legacy)
// ═══════════════════════════════════════════════════════════════
if(window._splashStep) window._splashStep(6);
const{useState,useEffect,useRef,useCallback}=React;

// ── AUTH SCREEN — extraído de builder.jsx para no depender de él ─
function AuthScreen({ onAuth, onSkip }){
  const [mode,setMode]=React.useState('choose');
  const [email,setEmail]=React.useState('');
  const [password,setPassword]=React.useState('');
  const [loading,setLoading]=React.useState(false);
  const [error,setError]=React.useState('');

  async function handleGoogle(){
    setLoading(true); setError('');
    try{ const r=await authSignInGoogle(); onAuth(r.user); }
    catch(e){ setError('Error con Google: '+(e.message||'intenta de nuevo')); setLoading(false); }
  }
  async function handleEmail(isSignUp){
    if(!email.trim()||!password.trim()){ setError('Completa email y contraseña'); return; }
    if(password.length<6){ setError('La contraseña debe tener al menos 6 caracteres'); return; }
    setLoading(true); setError('');
    try{
      const r=isSignUp ? await authSignUpEmail(email.trim(),password) : await authSignInEmail(email.trim(),password);
      onAuth(r.user);
    } catch(e){
      const msg=e.code==='auth/user-not-found'?'Usuario no encontrado':e.code==='auth/wrong-password'?'Contraseña incorrecta':e.code==='auth/email-already-in-use'?'Email ya registrado':e.code==='auth/invalid-email'?'Email inválido':(e.message||'Error de autenticación');
      setError(msg); setLoading(false);
    }
  }

  return(
    <div className="os-wrap">
      <div className="os-header">
        <div><div className="os-logo">BOARD<span>GAMEZ</span></div><div className="os-logo-sub">OS · GAME BUILDER</div></div>
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onSkip}>Después →</button>
      </div>
      <div className="os-page" style={{paddingTop:16}}>
        <div style={{textAlign:'center',background:'linear-gradient(135deg,rgba(155,93,229,.08),rgba(0,245,255,.04))',border:'1px solid rgba(155,93,229,.25)',borderRadius:18,padding:'24px 20px',marginBottom:24}}>
          <div style={{fontSize:'3rem',marginBottom:10}}>🎮</div>
          <div style={{fontFamily:'var(--font-display)',fontSize:'1.5rem',letterSpacing:2,background:'linear-gradient(135deg,var(--purple),var(--cyan))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:6}}>GAME BUILDER</div>
          <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-sm)',fontWeight:600,color:'rgba(255,255,255,.45)',letterSpacing:1,lineHeight:1.5}}>Crea y guarda la configuración de tus juegos.<br/>La próxima vez solo la cargas y juegas.</div>
        </div>
        {mode==='choose'&&(
          <div className="anim-fade">
            <div className="os-section">INICIAR SESIÓN</div>
            <button className="btn" style={{background:'#fff',color:'#333',marginBottom:12,border:'none',fontFamily:'var(--font-body)',fontWeight:700,fontSize:'var(--fs-sm)'}} onClick={handleGoogle} disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continuar con Google
            </button>
            <div style={{display:'flex',alignItems:'center',gap:10,margin:'16px 0'}}><div style={{flex:1,height:1,background:'rgba(255,255,255,.1)'}}/><div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.3)',letterSpacing:2}}>O CON EMAIL</div><div style={{flex:1,height:1,background:'rgba(255,255,255,.1)'}}/></div>
            <button className="btn btn-ghost" onClick={()=>setMode('email-in')}>📧 Iniciar sesión con email</button>
            <button className="btn btn-ghost" onClick={()=>setMode('email-up')}>✨ Crear cuenta nueva</button>
            {error&&<div className="os-alert alert-red" style={{marginTop:12}}>{error}</div>}
          </div>
        )}
        {(mode==='email-in'||mode==='email-up')&&(
          <div className="anim-fade">
            <div className="os-section">{mode==='email-up'?'CREAR CUENTA':'INICIAR SESIÓN'}</div>
            <input className="os-input" type="email" placeholder="tu@email.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleEmail(mode==='email-up')}/>
            <input className="os-input" type="password" placeholder={mode==='email-up'?'Contraseña (mín. 6 caracteres)':'Contraseña'} value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleEmail(mode==='email-up')}/>
            {error&&<div className="os-alert alert-red">{error}</div>}
            <button className="btn btn-cyan" disabled={loading} onClick={()=>handleEmail(mode==='email-up')}>{loading?'⏳ ...':mode==='email-up'?'✨ Crear cuenta':'🔑 Iniciar sesión'}</button>
            <button className="btn btn-ghost" onClick={()=>{setMode('choose');setError('');}}>← Atrás</button>
          </div>
        )}
        <div className="g16"/>
        <div style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',borderRadius:12,padding:'12px 14px',fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.3)',letterSpacing:1,lineHeight:1.6}}>
          🔒 Tu cuenta solo se usa para guardar tus juegos en la nube. Puedes jugar sin cuenta.
        </div>
      </div>
    </div>
  );
}

// ── PROFILE SETUP — se pide al crear la primera sala ────────────
// ── PROFILE SETUP — rediseñado con anime.js ──────────────────────
function ProfileSetup({ onDone, onSkip, context }){
  const existingProfile = getProfile();
  const [step, setStep]     = useState(existingProfile ? 'confirm' : 'create');
  const [name, setName]     = useState(existingProfile?.name||'');
  const [emoji, setEmoji]   = useState(existingProfile?.emoji||'🐉');
  const [color, setColor]   = useState(existingProfile?.color||'#00F5FF');
  const [pickMode, setPickMode] = useState(null);
  const [animDone, setAnimDone] = useState(false);
  const containerRef = useRef(null);

  const contextLabel = context==='strike' ? 'Strike 🎳'
    : context==='generic' ? 'tu partida'
    : 'BoardGamez OS';

  // Anime.js intro animation on mount
  useEffect(()=>{
    if(!window.anime) return;
    const els = containerRef.current?.querySelectorAll('.ps-anim');
    if(!els?.length) return;
    window.anime({
      targets: els,
      opacity: [0, 1],
      translateY: [32, 0],
      delay: window.anime.stagger(70),
      duration: 550,
      easing: 'easeOutExpo',
      complete: ()=>setAnimDone(true),
    });
  }, [step]);

  function handleDone(){
    if(!name.trim()) return;
    snd('save');
    // Anime confirm burst
    if(window.anime && containerRef.current){
      window.anime({
        targets: containerRef.current.querySelector('.ps-avatar'),
        scale: [1, 1.25, 1],
        duration: 400,
        easing: 'easeOutBack',
      });
    }
    const profile={id:existingProfile?.id||uid(),name:name.trim(),emoji,color,createdAt:Date.now()};
    saveProfile(profile);
    setTimeout(()=>onDone(profile), 150);
  }

  function useExisting(){
    snd('tap');
    if(window.anime && containerRef.current){
      window.anime({
        targets: containerRef.current.querySelector('.ps-avatar-big'),
        scale: [1, 1.2, 1],
        rotate: [0, -5, 5, 0],
        duration: 500,
        easing: 'easeOutElastic(1,.6)',
        complete: ()=>onDone(existingProfile),
      });
    } else {
      onDone(existingProfile);
    }
  }

  if(pickMode) return(
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={()=>setPickMode(null)}>← Listo</button>
        <div style={{fontFamily:'var(--font-label)',fontSize:'.75rem',fontWeight:700,color:'rgba(255,255,255,.5)',letterSpacing:3}}>TU AVATAR</div>
        <div style={{width:70}}/>
      </div>
      <div className="os-page" style={{paddingTop:16}}>
        <div style={{display:'flex',gap:6,marginBottom:16}}>
          {['emoji','color'].map(m=>(
            <button key={m} className="btn btn-ghost btn-sm"
              style={{flex:1,background:pickMode===m?'var(--cyan)':undefined,color:pickMode===m?'var(--bg)':undefined,border:pickMode===m?'none':undefined}}
              onClick={()=>setPickMode(m)}>
              {m==='emoji'?'🎭 Emoji':'🎨 Color'}
            </button>
          ))}
        </div>
        {pickMode==='emoji'&&<div className="picker-grid">{EMOJIS.map((e,i)=><div key={i} className={`picker-item ${emoji===e?'sel':''}`} onClick={()=>{snd('tap');setEmoji(e);}}>{e}</div>)}</div>}
        {pickMode==='color'&&<div style={{display:'flex',flexWrap:'wrap',gap:10,padding:'8px 0'}}>{COLORS.map((col,i)=><div key={i} className={`color-dot ${color===col?'sel':''}`} style={{background:col}} onClick={()=>{snd('tap');setColor(col);}}/>)}</div>}
      </div>
    </div>
  );

  // ── STEP: CONFIRM EXISTING PROFILE ──────────────────────────────
  if(step==='confirm') return(
    <div className="os-wrap">
      <div className="os-header">
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div className="os-logo">BOARD<span>GAMEZ</span></div>
        </div>
        {onSkip&&<button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onSkip}>Ahora no</button>}
      </div>
      <div className="os-page" style={{paddingTop:0}} ref={containerRef}>

        {/* Hero */}
        <div className="ps-anim" style={{
          textAlign:'center',padding:'32px 0 24px',
          background:'radial-gradient(ellipse at 50% 0%,rgba(0,245,255,.08),transparent 60%)',
          opacity:0,
        }}>
          <div style={{
            fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',
            letterSpacing:4,color:'rgba(0,245,255,.5)',marginBottom:16,
          }}>BIENVENIDO DE VUELTA</div>

          {/* Avatar grande con glow */}
          <div className="ps-avatar-big" style={{
            width:100,height:100,borderRadius:26,margin:'0 auto 12px',
            background:`${existingProfile.color||'rgba(0,245,255,.1)'}22`,
            border:`2px solid ${existingProfile.color||'rgba(0,245,255,.3)'}66`,
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:'3.8rem',cursor:'pointer',
            boxShadow:`0 0 32px ${existingProfile.color||'rgba(0,245,255,.4)'}44`,
            transition:'all .3s',
          }} onClick={useExisting}>
            {existingProfile.emoji}
          </div>

          <div style={{
            fontFamily:'var(--font-display)',fontSize:'1.9rem',letterSpacing:2,
            color:existingProfile.color||'#fff',marginBottom:4,
          }}>{existingProfile.name}</div>
          <div style={{
            fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',
            color:'rgba(255,255,255,.3)',letterSpacing:1,
          }}>Jugando en {contextLabel}</div>
        </div>

        {/* CTA principal */}
        <div className="ps-anim" style={{padding:'0 4px',opacity:0}}>
          <button className="btn btn-cyan" style={{
            padding:'18px',fontSize:'1.1rem',
            boxShadow:'0 8px 32px rgba(0,245,255,.35)',
          }} onClick={useExisting}>
            ✓ Jugar como {existingProfile.name}
          </button>

          <div style={{
            display:'flex',alignItems:'center',gap:10,margin:'14px 0',
          }}>
            <div style={{flex:1,height:1,background:'rgba(255,255,255,.08)'}}/>
            <span style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.25)',letterSpacing:2}}>O</span>
            <div style={{flex:1,height:1,background:'rgba(255,255,255,.08)'}}/>
          </div>

          <button className="btn btn-ghost" onClick={()=>{snd('tap');setStep('create');}}>
            ✏️ Cambiar perfil
          </button>
        </div>
      </div>
    </div>
  );

  // ── STEP: CREATE / EDIT PROFILE ──────────────────────────────────
  return(
    <div className="os-wrap">
      <div className="os-header">
        <div><div className="os-logo">BOARD<span>GAMEZ</span></div><div className="os-logo-sub">OS · PERFIL</div></div>
        {onSkip&&<button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onSkip}>Ahora no</button>}
      </div>
      <div className="os-page" style={{paddingTop:20}} ref={containerRef}>

        {/* Avatar hero — toca para personalizar */}
        <div className="ps-anim" style={{textAlign:'center',marginBottom:20,opacity:0}}>
          <div style={{
            fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',
            color:'rgba(255,255,255,.3)',letterSpacing:3,marginBottom:16,
          }}>
            {existingProfile ? 'EDITAR PERFIL' : 'NUEVO JUGADOR'}
          </div>

          {/* Avatar con anillo de color */}
          <div style={{position:'relative',display:'inline-block',marginBottom:8}}>
            <div className="ps-avatar profile-avatar" onClick={()=>setPickMode('emoji')}
              style={{
                width:90,height:90,borderRadius:22,fontSize:'3.2rem',
                border:`3px solid ${color}88`,
                boxShadow:`0 0 28px ${color}55, 0 0 0 6px ${color}18`,
                transition:'all .3s',
              }}>
              {emoji}
            </div>
            {/* Color dot */}
            <div onClick={()=>setPickMode('color')} style={{
              position:'absolute',bottom:-4,right:-4,
              width:28,height:28,borderRadius:'50%',
              background:color,border:'3px solid #07070F',
              cursor:'pointer',boxShadow:`0 0 12px ${color}88`,
              transition:'all .2s',
            }}/>
          </div>

          <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:`${color}99`,letterSpacing:2,marginTop:4}}>
            TOCA PARA PERSONALIZAR
          </div>
        </div>

        {/* Preview del nombre */}
        <div className="ps-anim" style={{
          textAlign:'center',marginBottom:16,opacity:0,
          fontFamily:'var(--font-display)',fontSize:'1.5rem',
          letterSpacing:2,color:name?color:'rgba(255,255,255,.15)',
          minHeight:'2rem',transition:'color .3s',
        }}>
          {name||'Tu nombre aquí'}
        </div>

        {/* Input */}
        <div className="ps-anim" style={{opacity:0}}>
          <input className="os-input" placeholder="Tu nombre de jugador..."
            value={name} onChange={e=>setName(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&name.trim()&&handleDone()}
            autoFocus maxLength={20}
            style={{
              textAlign:'center',fontSize:'1.2rem',
              borderColor:`${color}44`,
              boxShadow:name?`0 0 0 2px ${color}22`:'none',
              transition:'all .3s',
            }}/>

          <div style={{
            display:'flex',alignItems:'center',gap:8,
            fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',
            color:'rgba(255,255,255,.25)',letterSpacing:1,
            marginBottom:8,paddingLeft:2,
          }}>
            <span style={{color:name.length>15?'var(--orange)':'rgba(255,255,255,.2)'}}>{name.length}/20</span>
          </div>

          <button className="btn btn-cyan"
            disabled={!name.trim()}
            style={{padding:'16px',fontSize:'1rem',
              boxShadow:name.trim()?`0 6px 28px ${color}44`:'none',
              transition:'all .3s'}}
            onClick={handleDone}>
            ✓ {existingProfile ? 'Guardar cambios' : contextLabel ? `Listo, jugar` : 'Crear perfil'}
          </button>

          {existingProfile&&(
            <button className="btn btn-ghost" style={{marginTop:4}} onClick={()=>setStep('confirm')}>
              ← Usar perfil anterior
            </button>
          )}

          <div style={{marginTop:10,fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.2)',textAlign:'center',letterSpacing:1}}>
            Puedes editarlo después desde el menú
          </div>
        </div>
      </div>
    </div>
  );
}


// ── LIVE SCOREBOARD — marcador + historial de rondas ─────────────
function LiveScoreboard({ code, onBack, db }){
  const [room,setRoom]=useState(null);
  const [elapsed,setElapsed]=useState(0);
  const [prevScores,setPrevScores]=useState({});
  const [changedIds,setChangedIds]=useState([]);
  const [myEmoji,setMyEmoji]=useState(()=>getProfile()?.emoji||'🎉');
  const [showEmojiPicker,setShowEmojiPicker]=useState(false);
  const [spamEmojis,setSpamEmojis]=useState([]); // [{id,emoji,x,y}]
  const [roomEmojis,setRoomEmojis]=useState([]);  // from Firebase
  const [showFinishAnim,setShowFinishAnim]=useState(false);
  const timerRef=useRef(null);
  const spamRef=useRef(null);

  useEffect(()=>{
    const unsub=db.listen(`rooms/${code}`,data=>{
      if(!data) return;
      if(data.players){
        const changed=[];
        data.players.forEach(p=>{
          const prev=prevScores[p.id];
          const cur=(p.total||p.points||0);
          if(prev!==undefined&&cur!==prev) changed.push(p.id);
        });
        if(changed.length){ setChangedIds(changed); setTimeout(()=>setChangedIds([]),800); }
        const ns={};
        data.players.forEach(p=>ns[p.id]=(p.total||p.points||0));
        setPrevScores(ns);
      }
      setRoom(prev=>{
        // Detectar fin de partida para animación
        if(prev?.status!=='finished'&&data.status==='finished'){
          setShowFinishAnim(true);
          snd('victory');
        }
        return data;
      });
    });
    return()=>unsub&&unsub();
  },[code]);

  // Escuchar emojis spam de otros
  useEffect(()=>{
    const unsub=db.listen(`rooms/${code}/emojiSpam`,data=>{
      if(!data) return;
      const entries=Object.values(data).filter(e=>Date.now()-e.ts<4000);
      setRoomEmojis(entries);
    });
    return()=>unsub&&unsub();
  },[code]);

  useEffect(()=>{
    if(!room||room.status!=='active') return;
    const start=room.startedAt;
    timerRef.current=setInterval(()=>setElapsed(Date.now()-start),1000);
    return()=>clearInterval(timerRef.current);
  },[room?.status,room?.startedAt]);

  // Spam emoji — local + broadcast
  function sendSpam(){
    snd('tap');
    const id=Date.now()+Math.random();
    const x=10+Math.random()*80;
    const y=20+Math.random()*60;
    setSpamEmojis(prev=>[...prev,{id,emoji:myEmoji,x,y}]);
    setTimeout(()=>setSpamEmojis(prev=>prev.filter(e=>e.id!==id)),2200);
    // Broadcast a Firebase
    const spamId=uid4()+Math.random().toString(36).slice(2,5);
    const prof=getProfile();
    db.set(`rooms/${code}/emojiSpam/${spamId}`,{
      emoji:myEmoji, ts:Date.now(), by:prof?.name||'?',
      x,y
    }).catch(()=>{});
    // Limpiar spam viejo
    setTimeout(()=>db.set(`rooms/${code}/emojiSpam/${spamId}`,null).catch(()=>{}),4000);
  }

  if(!room) return(
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onBack}>← Atrás</button>
        <div className="room-code-badge">{code}</div>
        <div style={{width:70}}/>
      </div>
      <div className="os-page" style={{paddingTop:60,textAlign:'center'}}>
        <div className="os-spin" style={{marginBottom:16}}/>
        <div style={{fontFamily:'var(--font-label)',color:'rgba(255,255,255,.35)',letterSpacing:2}}>BUSCANDO SALA...</div>
      </div>
    </div>
  );

  const cfg=room.config||{};
  const players=[...(room.players||[])];
  const isStrike=room.gameType==='preset:strike';
  const rounds=room.rounds||[];
  const isActive=room.status==='active';
  const isFinished=room.status==='finished';
  const isLives=cfg.victoryMode==='lives'||cfg.accumulates==='lives'||isStrike;

  const sorted=isStrike
    ? [...players].sort((a,b)=>{
        if(!a.eliminated&&b.eliminated) return -1;
        if(a.eliminated&&!b.eliminated) return 1;
        if(a.eliminated&&b.eliminated) return (b.eliminatedOrder||0)-(a.eliminatedOrder||0);
        return 0;
      })
    : [...players].sort((a,b)=>
        cfg.mode==='wins'?(b.wins||0)-(a.wins||0):((b.total||b.points||0)-(a.total||a.points||0))
      );

  const maxScore=Math.max(1,...players.map(p=>p.total||p.points||0));
  const target=cfg.useTarget&&cfg.targetScore?parseInt(cfg.targetScore):null;
  const barMax=target||maxScore||1;
  const statusColor=isActive?'var(--green)':isFinished?'var(--gold)':'var(--gold)';
  const winner=room.winner||(isFinished?sorted[0]:null);

  if(showEmojiPicker) return(
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={()=>setShowEmojiPicker(false)}>← Listo</button>
        <div style={{fontFamily:'var(--font-display)',fontSize:'1rem',letterSpacing:2,color:'var(--cyan)'}}>MI EMOJI</div>
        <div style={{fontSize:'2rem'}}>{myEmoji}</div>
      </div>
      <div className="os-page" style={{paddingTop:16}}>
        <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(255,255,255,.4)',marginBottom:14,textAlign:'center'}}>
          Este emoji se spamea a todas las pantallas
        </div>
        <div className="picker-grid">
          {[...EMOJIS,'🔥','💥','⚡','🎉','🎊','🏆','💀','👑','🚀','🌟','💎','🎯','❤️','🤝','👏','🙌','😈','🤡','👻','💩'].map((e,i)=>(
            <div key={i} className={`picker-item ${myEmoji===e?'sel':''}`}
              onClick={()=>{snd('tap');setMyEmoji(e);}}>
              {e}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return(
    <div className="os-wrap" style={{overflow:'hidden',position:'relative'}}>

      {/* Emoji spam overlay — local */}
      {[...spamEmojis,...roomEmojis].map(e=>(
        <div key={e.id||e.ts} style={{
          position:'fixed',left:`${e.x}%`,top:`${e.y}%`,
          zIndex:9998,pointerEvents:'none',
          fontSize:'2.8rem',
          animation:'emojiFloat 2s ease-out forwards',
          textShadow:'0 2px 8px rgba(0,0,0,.5)',
        }}>
          {e.emoji}
        </div>
      ))}

      {/* Fin animado */}
      {showFinishAnim&&(
        <div style={{position:'fixed',inset:0,zIndex:9990,
          background:'radial-gradient(circle at 50% 30%,#120800 0%,#07070F 65%)',
          display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
          padding:28,animation:'popIn .4s ease',overflow:'hidden',
        }} onClick={()=>setShowFinishAnim(false)}>
          <div style={{position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden'}}>
            {Array.from({length:20},(_,i)=>({
              c:['#FFD447','#FF6B35','#00F5FF','#00FF9D','#9B5DE5'][i%5],
              l:Math.round(i/20*100)+'%',dl:(i*.1)+'s',dr:(2.5+i*.05)+'s',sz:(6+i%6)+'px'
            })).map((d,i)=>(
              <div key={i} style={{position:'absolute',background:d.c,width:d.sz,height:d.sz,
                left:d.l,top:-20,borderRadius:i%2?'50%':'3px',
                animation:`confettiFall ${d.dr} ${d.dl} linear infinite`}}/>
            ))}
          </div>
          <div style={{fontSize:'5.5rem',animation:'trophyFloat 2.2s ease-in-out infinite',marginBottom:8,filter:'drop-shadow(0 0 24px rgba(255,212,71,.6))',position:'relative',zIndex:1}}>🏆</div>
          <div style={{fontFamily:'var(--font-ui)',fontSize:'.72rem',letterSpacing:5,color:'var(--cyan)',marginBottom:4,position:'relative',zIndex:1}}>CAMPEÓN</div>
          {winner&&(<>
            <div style={{fontFamily:'var(--font-display)',fontSize:'2rem',letterSpacing:2,
              background:'linear-gradient(135deg,var(--gold),#FFAA00,var(--orange))',
              WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
              filter:'drop-shadow(0 0 20px rgba(255,212,71,.5))',
              lineHeight:1,marginBottom:10,position:'relative',zIndex:1}}>
              {room.customTitle||'PARTIDA'}
            </div>
            <div style={{fontSize:'3rem',marginBottom:6,position:'relative',zIndex:1}}>{winner.emoji}</div>
            <div style={{fontFamily:'Exo 2',fontWeight:900,fontSize:'1.8rem',color:winner.color||'#fff',letterSpacing:1,marginBottom:4,position:'relative',zIndex:1}}>{winner.name}</div>
          </>)}
          <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)',letterSpacing:2,marginTop:20,position:'relative',zIndex:1}}>
            TOCA PARA VER MARCADOR
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        position:'sticky',top:0,zIndex:100,
        background:'linear-gradient(180deg,rgba(8,8,16,.98) 85%,transparent)',
        borderBottom:'1px solid rgba(0,245,255,.15)',
        padding:'8px 14px'
      }}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
          <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onBack}>← Salir</button>
          <div style={{textAlign:'center'}}>
            <div style={{fontFamily:'var(--font-display)',fontSize:'1.1rem',letterSpacing:2,
              background:'linear-gradient(135deg,var(--cyan),var(--orange))',
              WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
              {room.customTitle||'MARCADOR EN VIVO'}
            </div>
          </div>
          <div className="room-code-badge">{code}</div>
        </div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:statusColor,
              boxShadow:`0 0 8px ${statusColor}`,
              animation:isActive?'osBlink 1.2s ease-in-out infinite':'none'}}/>
            <span style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:statusColor,letterSpacing:2,fontWeight:700}}>
              {isActive?'EN VIVO':isFinished?'TERMINADA':'LOBBY'}
              {isActive&&` · ${players.filter(p=>!p.eliminated).length} activos`}
            </span>
          </div>
          {isActive&&(
            <div style={{fontFamily:'var(--font-display)',fontSize:'1.1rem',color:'var(--gold)',textShadow:'var(--glow-g)'}}>
              {fmtDuration(elapsed)}
            </div>
          )}
        </div>
      </div>

      <div className="os-page" style={{paddingTop:12,paddingBottom:120}}>

        {/* Marcador principal */}
        {sorted.map((p,i)=>{
          const isFirst=i===0&&!p.eliminated;
          const isElim=p.eliminated;
          const score=cfg.mode==='wins'?(p.wins||0):(p.total||p.points||0);
          const barW=isLives?0:Math.round((score/barMax)*100);
          const isChanged=changedIds.includes(p.id);

          return(
            <div key={p.id}
              className={`live-score-card ${isFirst&&!isElim?'pos-1':''} ${isElim?'elim':''} ${isChanged?'score-changed':''} anim-fade`}
              style={{animationDelay:i*.05+'s',transition:'all .5s cubic-bezier(.34,1.56,.64,1)'}}>

              <div style={{fontFamily:'var(--font-display)',fontSize:'1.4rem',width:32,textAlign:'center',flexShrink:0,
                color:isFirst?'var(--gold)':isElim?'rgba(255,59,92,.5)':'rgba(255,255,255,.25)'}}>
                {isElim?'💀':i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`}
              </div>
              <div style={{fontSize:'1.9rem',flexShrink:0}}>{p.emoji}</div>

              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginBottom:4}}>
                  <div style={{fontFamily:'var(--font-body)',fontWeight:700,fontSize:'var(--fs-base)',
                    color:isElim?'rgba(255,255,255,.3)':p.color||'#fff',
                    overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                    {p.name}
                  </div>
                  <div style={{fontFamily:'var(--font-display)',fontSize:'1.2rem',flexShrink:0,marginLeft:8,
                    color:isFirst?'var(--gold)':isElim?'rgba(255,59,92,.5)':'rgba(255,255,255,.6)',
                    animation:isChanged?'scoreUp .4s cubic-bezier(.34,1.56,.64,1)':'none'}}>
                    {isStrike
                      ? (isElim?`#${p.finalPosition}`:('❤️'.repeat(Math.max(0,p.lives||0))))
                      : isLives
                        ? ('❤️'.repeat(Math.max(0,p.lives||0))+'🖤'.repeat(Math.max(0,(cfg.initLives||5)-(p.lives||0))))
                        : (cfg.mode==='wins'?(score+'🏆'):(score+' pts'))
                    }
                  </div>
                </div>

                {/* Barra progreso */}
                {!isLives&&!isElim&&(
                  <div style={{height:5,borderRadius:3,background:'rgba(255,255,255,.08)',overflow:'hidden',marginBottom:3}}>
                    <div style={{height:'100%',borderRadius:3,
                      background:isFirst?`linear-gradient(90deg,${p.color||'var(--gold)'},var(--gold))`:(p.color||'rgba(0,245,255,.5)'),
                      width:`${Math.min(100,barW)}%`,
                      transition:'width .7s cubic-bezier(.34,1.56,.64,1)',
                      boxShadow:isFirst?`0 0 8px ${p.color||'var(--gold)'}88`:'none'}}/>
                  </div>
                )}

                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.3)',letterSpacing:1}}>
                  {isStrike
                    ? (isElim?`💀 duró ${p.survivalLabel||'—'}`:'⏱ En pie')
                    : (isLives
                        ? `${p.lives||0} vidas`
                        : (target?`${score}/${target} · ${Math.min(100,Math.round(score/target*100))}%`
                          :`${p.wins||0} rondas ganadas`))
                  }
                </div>
              </div>
            </div>
          );
        })}

        {/* Rondas en horizontal — siempre al fondo */}
        {rounds.length>0&&(
          <div style={{marginTop:16}}>
            <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.3)',
              letterSpacing:2,marginBottom:8}}>
              RONDAS JUGADAS
            </div>
            <div style={{overflowX:'auto',WebkitOverflowScrolling:'touch',paddingBottom:6}}>
              <div style={{display:'flex',gap:6,minWidth:'max-content'}}>
                {rounds.map((r,ri)=>{
                  const rw=players.find(p=>p.id===r.winner);
                  const isLast=ri===rounds.length-1;
                  return(
                    <div key={ri} style={{
                      minWidth:80,borderRadius:10,padding:'8px 10px',flexShrink:0,
                      background:isLast?'rgba(0,245,255,.1)':'rgba(255,255,255,.04)',
                      border:`1px solid ${isLast?'rgba(0,245,255,.3)':'rgba(255,255,255,.08)'}`,
                    }}>
                      <div style={{fontFamily:'var(--font-display)',fontSize:'.7rem',letterSpacing:2,
                        color:isLast?'var(--cyan)':'rgba(255,255,255,.3)',marginBottom:4}}>
                        R{r.number||ri+1}
                      </div>
                      {rw&&<div style={{fontSize:'1.3rem'}}>{rw.emoji}</div>}
                      {r.condition&&(
                        <div style={{fontFamily:'var(--font-label)',fontSize:'.55rem',color:'var(--gold)',letterSpacing:1,marginTop:3}}>{r.condition}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Barra inferior: solo salir */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,maxWidth:480,margin:'0 auto',zIndex:200,
        background:'linear-gradient(0deg,rgba(8,8,16,.99) 70%,transparent)',
        padding:'10px 16px 20px',display:'flex',gap:8}}>
        <button onClick={onBack} style={{flex:1,height:48,borderRadius:12,border:'1px solid rgba(255,255,255,.1)',
          background:'rgba(255,255,255,.04)',cursor:'pointer',
          fontFamily:'var(--font-label)',fontSize:'var(--fs-sm)',fontWeight:700,color:'rgba(255,255,255,.5)',
          display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
          ← Salir del marcador
        </button>
      </div>
    </div>
  );
}


// ── APP SHELL ────────────────────────────────────────────────────
function App(){
  const [screen,setScreen]=useState('loading');
  const [profile,setProfile]=useState(null);
  const [session,setSession]=useState(null);
  const [isHost,setIsHost]=useState(false);
  const [authUser,setAuthUser]=useState(null);
  const [editingTemplate,setEditingTemplate]=useState(null);
  const [playTemplate,setPlayTemplate]=useState(null);
  const [spectateCode,setSpectateCode]=useState(null);
  const db=makeDB(false);

  // ── INIT: restaurar sesión, perfil, presencia ──────────────────
  useEffect(()=>{
    authOnChange(u=>setAuthUser(u||null));

    // 1. Cargar perfil
    const p=getProfile();
    if(p&&p.name) setProfile(p);

    // 2. Intentar restaurar sesión activa (sobrevive recargas)
    const saved=getActiveSession();
    if(saved && saved.code){
      // Verificar que la sala sigue viva
      const db2=makeDB(false);
      db2.get(`rooms/${saved.code}`).then(room=>{
        if(room && room.status!=='finished' && room.status!=='dissolved'){
          setSession({code:saved.code,demo:false,date:room.createdAt});
          setIsHost(saved.isHost||false);
          // Always load template config from room (most up-to-date)
          if(room.config && (room.gameType==='generic:template'||saved.templateConfig)){
            setPlayTemplate({config:room.config,name:room.customTitle||''});
          }
          // Derive correct screen from actual room gameType (avoids stale saved.screen)
          const gt=room.gameType||'';
          let targetScreen=saved.screen||'home';
          if(room.status==='active'){
            if(gt==='preset:strike') targetScreen='strike-game';
            else if(gt==='generic:template') targetScreen='universal-game';
            else if(gt==='generic') targetScreen='generic-game';
          } else if(room.status==='lobby'){
            if(gt==='preset:strike') targetScreen='strike-lobby';
            else if(gt==='generic:template') targetScreen='universal-lobby';
            else if(gt==='generic') targetScreen='generic-lobby';
          }
          setScreen(targetScreen);
          // Reactivar presencia
          const profile2=getProfile();
          if(profile2?.id) setupPresence(saved.code,profile2.id);
        } else {
          clearActiveSession();
          _restoreNormal(p);
        }
      }).catch(()=>{ clearActiveSession(); _restoreNormal(p); });
    } else {
      _restoreNormal(p);
    }

    function _restoreNormal(prof){
      const rematchCode=localStorage.getItem('bgos_rematch_code');
      if(rematchCode){
        localStorage.removeItem('bgos_rematch_code');
        const db2=makeDB(false);

        // Helper: determine correct screen and isHost from room data
        function applyRematch(code, room){
          if(!room){ setScreen('home'); return; }
          const currentId = prof?.id || getProfile()?.id;
          const iAmHost   = !!(currentId && room.hostId && room.hostId === currentId);
          const gt        = room.gameType || '';
          let targetScreen;
          if(room.status==='active'){
            if(gt==='preset:strike')           targetScreen='strike-game';
            else if(gt==='generic:template')   targetScreen='universal-game';
            else                               targetScreen='generic-game';
          } else {
            if(gt==='preset:strike')           targetScreen='strike-lobby';
            else if(gt==='generic:template')   targetScreen='universal-lobby';
            else                               targetScreen='generic-lobby';
          }
          setSession({code,demo:false,date:room.createdAt||Date.now()});
          setIsHost(iAmHost);
          if(room.config && gt==='generic:template'){
            setPlayTemplate({config:room.config,name:room.customTitle||''});
          }
          setScreen(targetScreen);
        }

        // Extract code from any prefix format
        let code = rematchCode;
        for(const prefix of ['rematch:','strike:','template:','generic:']){
          if(rematchCode.startsWith(prefix)){ code=rematchCode.replace(prefix,''); break; }
        }

        if(rematchCode.startsWith('rematch:') || rematchCode.startsWith('strike:') || rematchCode.startsWith('template:') || rematchCode.startsWith('generic:')){
          // Fetch room to determine runtime and isHost correctly
          db2.get(`rooms/${code}`).then(room=>{
            applyRematch(code, room);
          }).catch(()=>{
            // Fallback: assume player (not host), go to home
            setSession({code,demo:false,date:Date.now()});
            setIsHost(false);
            setScreen('home');
          });
        } else {
          // Plain code = live scoreboard spectator
          setSpectateCode(rematchCode);
          setScreen('live-scoreboard');
        }
      } else {
        setScreen('home');
      }
    }  },[]);

  // Pendiente de crear sala tras configurar perfil
  const [pendingAction,setPendingAction]=useState(null); // 'strike' | 'generic'

  // El myId viene del perfil guardado
  const myId=profile?.id||null;

  function goHome(){
    setScreen('home'); setSession(null); setIsHost(false); setPlayTemplate(null);
    clearActiveSession(); teardownPresence();
  }

  function updateProfile(p){
    saveProfile(p);
    setProfile(p);
  }

  const hostPlayer=profile
    ? {id:profile.id,name:profile.name,emoji:profile.emoji,color:profile.color}
    : {id:'host',name:'Host',emoji:'🐉',color:'#00F5FF'};

  async function createRoom(gameType,customTitle,players,config){
    const code=uid4();
    const cfg=config||{};

    // Generar spec del motor v2 para inicializar jugadores correctamente
    let spec = null;
    try{ if(typeof interpret==='function') spec = interpret(cfg); }catch(e){}

    // Inicializar jugadores usando buildInitialPlayers si está disponible
    let initPlayers;
    if(spec && typeof buildInitialPlayers==='function'){
      initPlayers = buildInitialPlayers(players.map((p,i)=>({...p,id:p.id||uid()})), spec);
    } else {
      // Fallback legacy
      const initLives = cfg.registers?.includes('lives')||cfg.accumulates==='lives'||cfg.victoryMode==='lives'||gameType==='preset:strike' ? 5 : null;
      initPlayers = players.map((p,i)=>({
        ...p, id:p.id||uid(), total:0, wins:0, rounds:[],
        ...(initLives!==null?{lives:initLives}:{}),
        ...(cfg.registers?.includes('coins')?{coins:0}:{}),
        ...(cfg.registers?.includes('custom')?{custom:0}:{}),
        eliminated:false, finalPosition:null,
        hasFirstPlayerToken: cfg.useFirstPlayerToken===true && i===0,
      }));
    }

    // Runtime pre-calculado para guardar en room (lo usa UniversalRuntime v2)
    let runtimeSpec = null;
    try{
      if(typeof resolveRuntime==='function'){
        const raw = resolveRuntime(cfg);
        // Limpiar NaN antes de Firebase
        runtimeSpec = typeof _stripNaNForFirebase==='function' ? _stripNaNForFirebase(raw) : raw;
      }
    }catch(e){ console.warn('createRoom runtimeSpec:', e.message); }

    await db.set(`rooms/${code}`,{
      code, gameType, customTitle, status:'lobby', hostId:myId,
      createdAt:Date.now(), config:cfg||null,
      ...(runtimeSpec ? {runtimeSpec} : {}),
      players: initPlayers,
      events:[]
    });
    setSession({code,demo:false,date:Date.now()});
    setIsHost(true);
    // Save all players as contacts
    players.forEach(p=>{ if(p&&p.name) saveContact(p); });
    // Persistir sesión para sobrevivir recargas
    const prof=getProfile();
    // Choose correct lobby screen based on gameType
    const lobbyScreen = gameType==='preset:strike' ? 'strike-lobby'
      : gameType==='generic:template' ? 'universal-lobby'
      : 'generic-lobby';
    saveActiveSession({code,isHost:true,gameType,screen:lobbyScreen,myId:prof?.id});
    // Activar presencia
    if(prof?.id) setupPresence(code,prof.id);
    return code;
  }

  async function joinRoom(code, playerId, playerName, playerEmoji, playerColor){
    const existing = await db.get(`rooms/${code}`);
    if(!existing) return {error:'Sala no encontrada'};
    if(existing.status==='finished'||existing.status==='dissolved')
      return {error:'Esta partida ya terminó'};

    const players = [...(existing.players || [])];
    const profile = getProfile();

    const selectedSlot =
      playerId && playerId !== 'new'
        ? players.find(p => p.id === playerId)
        : null;

    let resolvedProfile = profile || null;
    let resolvedId = myId || profile?.id || null;

    // Si eligió un slot existente y no hay perfil local,
    // adoptamos ese slot como perfil local automáticamente.
    if (selectedSlot && !resolvedId) {
      resolvedProfile = {
        id: selectedSlot.id,
        name: selectedSlot.name || playerName || 'Jugador',
        emoji: playerEmoji || selectedSlot.emoji || '🎮',
        color: playerColor || selectedSlot.color || '#00F5FF',
        createdAt: Date.now(),
      };

      saveProfile(resolvedProfile);
      setProfile(resolvedProfile);
      resolvedId = resolvedProfile.id;
    }

    if (!resolvedId) {
      return { error:'Configura tu perfil primero' };
    }

    const alreadyIn = players.find(p => p.id === resolvedId);

    if (!alreadyIn) {
      if (selectedSlot) {
        // Toma el slot existente SIN cambiarle el id
        const adoptedProfile = {
          id: selectedSlot.id,
          name: playerName || resolvedProfile?.name || selectedSlot.name || 'Jugador',
          emoji: playerEmoji || resolvedProfile?.emoji || selectedSlot.emoji || '🎮',
          color: playerColor || resolvedProfile?.color || selectedSlot.color || '#00F5FF',
          createdAt: resolvedProfile?.createdAt || Date.now(),
        };

        saveProfile(adoptedProfile);
        setProfile(adoptedProfile);
        resolvedProfile = adoptedProfile;
        resolvedId = adoptedProfile.id;

        const updated = players.map(p =>
          p.id === selectedSlot.id
            ? {
                ...p,
                name: adoptedProfile.name,
                emoji: adoptedProfile.emoji,
                color: adoptedProfile.color,
              }
            : p
        );

        await db.set(`rooms/${code}/players`, updated);
      } else {
        // Jugador nuevo
        const newP = {
          id: resolvedId,
          name: playerName || resolvedProfile?.name || 'Jugador',
          emoji: playerEmoji || resolvedProfile?.emoji || '🎮',
          color: playerColor || resolvedProfile?.color || '#00F5FF',
          isHost: false,
          total: 0,
          wins: 0,
          rounds: [],
          lives: 5,
          eliminated: false,
          finalPosition: null,
        };

        await db.set(`rooms/${code}/players`, [...players, newP]);
      }
    } else if (selectedSlot && resolvedProfile && resolvedProfile.id !== selectedSlot.id) {
      // Si ya había perfil local pero eligió otro slot, cambia el perfil local
      const switchedProfile = {
        id: selectedSlot.id,
        name: playerName || selectedSlot.name || resolvedProfile.name || 'Jugador',
        emoji: playerEmoji || selectedSlot.emoji || resolvedProfile.emoji || '🎮',
        color: playerColor || selectedSlot.color || resolvedProfile.color || '#00F5FF',
        createdAt: resolvedProfile.createdAt || Date.now(),
      };

      saveProfile(switchedProfile);
      setProfile(switchedProfile);
      resolvedProfile = switchedProfile;
      resolvedId = switchedProfile.id;
    }

    setupPresence(code, resolvedId);

    const gt = existing.gameType || '';
    const iAmHost = resolvedId === existing.hostId;

    let targetScreen;
    if (existing.status === 'active') {
      targetScreen = gt === 'preset:strike'
        ? 'strike-game'
        : gt === 'generic:template'
          ? 'universal-game'
          : 'generic-game';
    } else {
      targetScreen = gt === 'preset:strike'
        ? 'strike-lobby'
        : gt === 'generic:template'
          ? 'universal-lobby'
          : 'generic-lobby';
    }

    saveActiveSession({
      code,
      isHost: iAmHost,
      gameType: gt,
      screen: targetScreen,
      myId: resolvedId,
      templateConfig: gt === 'generic:template' ? existing.config : null
    });

    setIsHost(iAmHost);
    setSession({ code, demo:false, date: existing.createdAt || Date.now() });

    if (gt === 'generic:template' && existing.config) {
      setPlayTemplate({
        config: existing.config,
        name: existing.customTitle || ''
      });
    }

    setScreen(targetScreen);
    return null;
  }


  // isHost se guarda en state pero también se puede derivar del room
  // Pasamos ambos para que el runtime lo resuelva
  const screenProps={session,onBack:goHome,isHost,myId,db,hostId:session?.hostId};

  if(screen==='loading') return(
    <div className="os-wrap">
      <div className="os-page" style={{paddingTop:80,textAlign:'center'}}>
        <div className="os-spin" style={{marginBottom:16}}/>
      </div>
    </div>
  );

  return(
    <div>
      {/* Perfil se pide inline al crear sala — también accesible desde home */}
      {screen==='profile-setup' && (
        <ProfileSetup
          context={pendingAction}
          onDone={p=>{
            setProfile(p);
            updateProfile(p);
            // Si venía de intentar crear sala, continuar
            if(pendingAction==='strike')  { setPendingAction(null); setScreen('strike-host-setup'); }
            else if(pendingAction==='generic') { setPendingAction(null); setScreen('generic-setup'); }
            else { setPendingAction(null); setScreen('home'); }
          }}
          onSkip={()=>{ setPendingAction(null); setScreen('home'); }}
        />
      )}

      {screen==='home' && (
        <MainMenu
          profile={profile}
          onGoStrike={()=>setScreen('strike-host-setup')}
          onGoGeneric={()=>setScreen('generic-setup')}
          onGoJoin={()=>setScreen('join')}
          onGoStats={()=>setScreen('stats')}
          onGoMyGames={()=>setScreen('my-games')}
          onGoProfile={()=>setScreen('profile-edit')}
          onGoTools={()=>setScreen('tools')}
          onGoDiagram={()=>setScreen('diagram')}
          onGoSchemaBuilder={()=>setScreen('schema-builder')}
          myId={myId} db={db} authUser={authUser}
        />
      )}

      {screen==='profile-edit' && (
        <ProfileEditScreen
          profile={profile}
          onBack={goHome}
          onSave={p=>{ updateProfile(p); goHome(); }}
        />
      )}

      {/* MARCADOR EN VIVO */}
      {screen==='live-scoreboard' && spectateCode && (
        <LiveScoreboard code={spectateCode} onBack={goHome} db={db}/>
      )}

      {/* AUTH */}
      {screen==='auth' && (
        <AuthScreen
          onAuth={u=>{ setAuthUser(u); setScreen('my-games'); }}
          onSkip={()=>setScreen('home')}
        />
      )}

      {/* MIS JUEGOS */}
      {screen==='my-games' && !authUser && (
        <AuthScreen
          onAuth={u=>{ setAuthUser(u); setScreen('my-games'); }}
          onSkip={()=>{
            // Sin auth: ir al builder con guardado local
            setEditingTemplate(null); setScreen('game-builder');
          }}
        />
      )}
      {screen==='my-games' && authUser && (
        <MyGamesScreenVNext
          user={authUser}
          onBack={goHome}
          onBuildNew={()=>{ setEditingTemplate(null); setScreen('game-builder'); }}
          onEditTemplate={t=>{ setEditingTemplate(t); setScreen('game-builder'); }}
          onPlayTemplate={t=>{ setPlayTemplate(t); setScreen('generic-setup-from-template'); }}
          onSignOut={async()=>{ await authSignOut(); setAuthUser(null); goHome(); }}
        />
      )}

      {screen==='game-builder' && (
        <SchemaDrivenBuilder
          user={authUser}
          editingTemplate={editingTemplate}
          initialConfig={editingTemplate?.config || {}}
          onBack={()=>authUser ? setScreen('my-games') : goHome()}
          onSave={(saved)=>{ setEditingTemplate(null); authUser ? setScreen('my-games') : goHome(); }}
          title="Game Builder"
        />
      )}

      {screen==='generic-setup-from-template' && playTemplate && (
        <GenericSetupFromTemplate
          template={playTemplate}
          hostPlayer={hostPlayer}
          onBack={()=>setScreen('my-games')}
          onCreateRoom={async(templateOrObj, playersArg)=>{
            // Support both call signatures: (template, players) and ({players})
            const players = playersArg || (templateOrObj && templateOrObj.players) || [];
            await createRoom('generic:template',playTemplate.name,players,playTemplate.config||{});
            setScreen('universal-lobby');
          }}
        />
      )}

      {/* UNIVERSAL RUNTIME — para templates del builder */}
      {screen==='universal-lobby' && session && (
        <GenericLobby
          {...{session,onBack:goHome,isHost,myId,db}}
          onStart={()=>setScreen('universal-game')}
        />
      )}
      {screen==='universal-game' && session && (
        <UniversalRuntime
          session={session}
          onBack={goHome}
          isHost={isHost}
          myId={myId}
          db={db}
          templateConfig={playTemplate?.config||null}
        />
      )}

      {/* STRIKE — si no hay perfil, pedir primero */}
      {screen==='strike-host-setup' && !hasProfile() && (
        <ProfileSetup
          context="strike"
          onDone={p=>{ setProfile(p); updateProfile(p); setScreen('strike-host-setup'); }}
          onSkip={()=>setScreen('home')}
        />
      )}
      {screen==='strike-host-setup' && hasProfile() && (
        <StrikeHostSetup onBack={goHome} hostPlayer={hostPlayer}
          onUpdateProfile={updateProfile}
          onCreateRoom={async({title,players})=>{
            await createRoom('preset:strike',title,players,GAME_PRESETS.strike.config);
            setScreen('strike-lobby');
          }}/>
      )}
      {screen==='strike-lobby' && session && <StrikeLobby {...screenProps} onStart={()=>setScreen('strike-game')}/>}
      {screen==='strike-game'  && session && <StrikeGame  {...screenProps}/>}

      {/* GENÉRICA — si no hay perfil, pedir primero */}
      {screen==='generic-setup' && !hasProfile() && (
        <ProfileSetup
          context="generic"
          onDone={p=>{ setProfile(p); updateProfile(p); setScreen('generic-setup'); }}
          onSkip={()=>setScreen('home')}
        />
      )}
      {screen==='generic-setup' && hasProfile() && (
        <GenericSetup onBack={goHome} hostPlayer={hostPlayer}
          onCreateRoom={async({title,players,config})=>{
            await createRoom('generic',title,players,config);
            setScreen('generic-lobby');
          }}/>
      )}
      {screen==='generic-lobby' && session && <GenericLobby {...screenProps} onStart={()=>setScreen('generic-game')}/>}
      {screen==='generic-game'  && session && <GenericRuntime {...screenProps}/>}

      {/* JOIN — con opción de marcador en vivo */}
      {screen==='join' && (
        <JoinRoom
          onBack={goHome}
          onJoin={joinRoom}
          myId={myId}
          profile={profile}
          db={db}
          onSpectate={code=>{ setSpectateCode(code); setScreen('live-scoreboard'); }}
        />
      )}

      {screen==='schema-builder' && (
        <SchemaDrivenBuilder
          user={authUser}
          editingTemplate={null}
          initialConfig={{}}
          onBack={goHome}
          onSave={()=>goHome()}
          title="Schema Builder"
        />
      )}

            {screen==='stats' && <StatsScreen onBack={goHome} db={db}/>}

      {/* HERRAMIENTAS */}
      {screen==='tools' && <ToolsHub onBack={goHome}/>}
      {screen==='diagram' && (
        <div style={{position:'relative'}}>
          <div style={{position:'fixed',top:10,left:10,zIndex:9999}}>
            <button className="btn btn-ghost btn-sm" style={{width:'auto',background:'rgba(0,0,0,.7)',backdropFilter:'blur(6px)'}}
              onClick={goHome}>← Volver</button>
          </div>
          <MotorDiagrama/>
        </div>
      )}
    </div>
  );
}

// ── PROFILE EDIT ─────────────────────────────────────────────────
function ProfileEditScreen({ profile, onBack, onSave }){
  const [name,setName]=useState(profile?.name||'');
  const [emoji,setEmoji]=useState(profile?.emoji||'🐉');
  const [color,setColor]=useState(profile?.color||'#00F5FF');
  const [pickMode,setPickMode]=useState(null);

  if(pickMode){
    return(
      <div className="os-wrap">
        <div className="os-header">
          <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={()=>setPickMode(null)}>← Listo</button>
          <div style={{fontFamily:'var(--font-label)',fontSize:'.75rem',fontWeight:700,color:'rgba(255,255,255,.5)',letterSpacing:3}}>TU AVATAR</div>
          <div style={{width:70}}/>
        </div>
        <div className="os-page" style={{paddingTop:16}}>
          <div style={{display:'flex',gap:6,marginBottom:16}}>
            {['emoji','color'].map(m=>(
              <button key={m} className="btn btn-ghost btn-sm" style={{flex:1,background:pickMode===m?'var(--cyan)':undefined,color:pickMode===m?'var(--bg)':undefined,border:pickMode===m?'none':undefined}}
                onClick={()=>setPickMode(m)}>
                {m==='emoji'?'🐉 Emoji':'🎨 Color'}
              </button>
            ))}
          </div>
          {pickMode==='emoji'&&<div className="picker-grid">{EMOJIS.map((e,i)=><div key={i} className={`picker-item ${emoji===e?'sel':''}`} onClick={()=>{snd('tap');setEmoji(e);}}>{e}</div>)}</div>}
          {pickMode==='color'&&<div style={{display:'flex',flexWrap:'wrap',gap:10,padding:'8px 0'}}>{COLORS.map((c,i)=><div key={i} className={`color-dot ${color===c?'sel':''}`} style={{background:c}} onClick={()=>{snd('tap');setColor(c);}}/>)}</div>}
        </div>
      </div>
    );
  }

  return(
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onBack}>← Home</button>
        <div className="os-logo" style={{fontSize:'1.1rem'}}>MI <span>PERFIL</span></div>
        <div style={{width:70}}/>
      </div>
      <div className="os-page" style={{paddingTop:20}}>
        <div style={{textAlign:'center',marginBottom:24}}>
          <div className="profile-avatar" onClick={()=>setPickMode('emoji')}>{emoji}</div>
          <div style={{width:18,height:18,borderRadius:'50%',background:color,border:'3px solid rgba(255,255,255,.3)',margin:'0 auto 8px',cursor:'pointer'}}
            onClick={()=>setPickMode('color')}/>
          <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(0,245,255,.5)',letterSpacing:2}}>TOCA PARA CAMBIAR</div>
        </div>
        <div className="os-section">TU NOMBRE</div>
        <input className="os-input" placeholder="Tu nombre..." value={name}
          onChange={e=>setName(e.target.value)} maxLength={20} autoFocus/>
        <div className="g8"/>
        <button className="btn btn-cyan" disabled={!name.trim()}
          onClick={()=>{ snd('save'); onSave({...profile,name:name.trim(),emoji,color}); }}>
          💾 Guardar perfil
        </button>
        <button className="btn btn-back" onClick={onBack}>← Cancelar</button>
      </div>
    </div>
  );
}

// ── PLAYER PICKER (compartido) ────────────────────────────────────
function PlayerPicker({player,onUpdate,onClose}){
  const [mode,setMode]=React.useState('emoji');
  return(
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onClose}>← Listo</button>
        <div style={{fontFamily:'var(--font-label)',fontSize:'.75rem',fontWeight:700,color:'rgba(255,255,255,.5)',letterSpacing:3}}>{player.name.toUpperCase()}</div>
        <div style={{width:70}}/>
      </div>
      <div className="os-page" style={{paddingTop:16}}>
        <div style={{display:'flex',gap:6,marginBottom:16}}>
          {['emoji','color'].map(m=>(
            <button key={m} className="btn btn-ghost btn-sm" style={{flex:1,background:mode===m?'var(--cyan)':undefined,color:mode===m?'var(--bg)':undefined,border:mode===m?'none':undefined}}
              onClick={()=>setMode(m)}>
              {m==='emoji'?'🐉 Emoji':'🎨 Color'}
            </button>
          ))}
        </div>
        {mode==='emoji'&&<div className="picker-grid">{EMOJIS.map((e,i)=><div key={i} className={`picker-item ${player.emoji===e?'sel':''}`} onClick={()=>{snd('tap');onUpdate('emoji',e);}}>{e}</div>)}</div>}
        {mode==='color'&&<div style={{display:'flex',flexWrap:'wrap',gap:10,padding:'8px 0'}}>{COLORS.map((c,i)=><div key={i} className={`color-dot ${player.color===c?'sel':''}`} style={{background:c}} onClick={()=>{snd('tap');onUpdate('color',c);}}/>)}</div>}
      </div>
    </div>
  );
}

// ── MAIN MENU v1.3 ────────────────────────────────────────────────
function MainMenu({profile,onGoStrike,onGoGeneric,onGoJoin,onGoStats,onGoMyGames,onGoProfile,onGoTools,onGoDiagram,onGoSchemaBuilder,myId,db,authUser}){
  const [recentSessions,setRecentSessions]=useState([]);
  useEffect(()=>{loadRecentSessions(3).then(setRecentSessions).catch(()=>{});},[]);

  // Card component for consistent sizing
  function MenuCard({color,glow,icon,iconBg,title,sub,desc,tags,onClick,badge}){
    return(
      <div onClick={()=>{snd('tap');onClick();}} style={{
        borderRadius:18,border:`1.5px solid ${color}44`,
        background:`linear-gradient(135deg,${color}0D 0%,${color}05 100%)`,
        padding:'18px 17px',marginBottom:10,cursor:'pointer',
        transition:'all .22s',position:'relative',overflow:'hidden',
      }}
        onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 6px 32px ${color}30`;e.currentTarget.style.borderColor=`${color}88`;}}
        onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.borderColor=`${color}44`;}}>
        {/* Top shimmer */}
        <div style={{position:'absolute',top:0,left:0,right:0,height:1,
          background:`linear-gradient(90deg,transparent,${color}55,transparent)`,pointerEvents:'none'}}/>
        {badge&&<div style={{position:'absolute',top:12,right:14,background:color,color:'#07070F',
          fontFamily:'var(--font-ui)',fontSize:'.5rem',fontWeight:700,letterSpacing:2,
          padding:'3px 8px',borderRadius:20}}>{badge}</div>}
        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:desc?10:0}}>
          <div style={{width:56,height:56,borderRadius:14,
            background:iconBg||`${color}18`,border:`1.5px solid ${color}33`,
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:'1.9rem',flexShrink:0}}>
            {icon}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:'var(--font-display)',fontSize:'1.15rem',letterSpacing:1,color:'#fff',marginBottom:2}}>{title}</div>
            <div style={{fontFamily:'var(--font-ui)',fontSize:'.55rem',fontWeight:700,
              color:`${color}BB`,letterSpacing:3}}>{sub}</div>
          </div>
        </div>
        {desc&&<div style={{fontFamily:'var(--font-body)',fontSize:'var(--fs-sm)',color:'rgba(255,255,255,.42)',lineHeight:1.55,marginBottom:tags?10:0}}>{desc}</div>}
        {tags&&<div style={{display:'flex',flexWrap:'wrap',gap:5}}>{tags.map((t,i)=>(
          <span key={i} style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',fontWeight:700,
            letterSpacing:.8,padding:'3px 9px',borderRadius:20,
            background:`${color}18`,border:`1px solid ${color}33`,color:`${color}CC`}}>{t}</span>
        ))}</div>}
      </div>
    );
  }

  return(
    <div className="os-wrap">
      <div className="os-header">
        <div>
          <div className="os-logo">BOARD<span>GAMEZ</span></div>
          <div className="os-logo-sub">OS · v2.0</div>
        </div>
        <div onClick={()=>{snd('tap');onGoProfile();}} style={{
          width:42,height:42,borderRadius:12,fontSize:'1.6rem',cursor:'pointer',
          background:'rgba(0,245,255,.08)',border:'1.5px solid rgba(0,245,255,.2)',
          display:'flex',alignItems:'center',justifyContent:'center',
          transition:'all .2s',
        }}>
          {profile?.emoji||'👤'}
        </div>
      </div>

      <div className="os-page" style={{paddingTop:0}}>
        {/* Greeting */}
        <div style={{padding:'18px 0 6px',display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:48,height:48,borderRadius:14,fontSize:'2rem',
            background:`${profile?.color||'rgba(0,245,255,.1)'}22`,
            border:`1.5px solid ${profile?.color||'rgba(0,245,255,.25)'}44`,
            display:'flex',alignItems:'center',justifyContent:'center',
            boxShadow:`0 0 20px ${profile?.color||'rgba(0,245,255,.3)'}33`,
          }}>
            {profile?.emoji||'👤'}
          </div>
          <div>
            <div style={{fontFamily:'var(--font-display)',fontSize:'1rem',letterSpacing:1,color:'#fff'}}>
              Hola, <span style={{color:profile?.color||'var(--cyan)'}}>{profile?.name||'Jugador'}</span>
            </div>
            <div style={{fontFamily:'var(--font-ui)',fontSize:'.52rem',color:'rgba(255,255,255,.3)',letterSpacing:2,marginTop:2}}>
              BOARDGAMEZ OS · LISTO PARA JUGAR
            </div>
          </div>
        </div>

        {/* GAME BUILDER */}
        <div className="os-section">GAME BUILDER</div>
        <MenuCard
          color="#9B5DE5" icon="🎮"
          title="Mis Juegos"
          sub={authUser?`SESIÓN: ${authUser.displayName||authUser.email||'Usuario'}`:'CREA · GUARDA · REUTILIZA'}
          desc="Diseña la configuración de tus juegos y guárdalos. La próxima vez solo los cargas."
          tags={['9 secciones','Nube','Reutilizable']}
          onClick={onGoMyGames}/>

        {/* JUEGOS ESPECIALIZADOS */}
        <div className="os-section">JUEGOS ESPECIALIZADOS</div>
        <MenuCard
          color="#FF6B35" icon="🎳"
          title="Strike"
          sub="SUPERVIVENCIA · ÚLTIMO EN PIE GANA"
          desc="Auto-eliminación por rondas. Estadísticas automáticas. Perfecto para grupos."
          tags={['Preconfigured','Survival','Stats']}
          badge="HOT"
          onClick={onGoStrike}/>

        {/* PARTIDA RÁPIDA */}
        <div className="os-section">PARTIDA RÁPIDA</div>
        <MenuCard
          color="#00F5FF" icon="⚔️"
          title="Crear partida"
          sub="SIN TEMPLATE · CONFIGURA AL MOMENTO"
          desc="Configura rápido sin necesidad de un juego guardado. Ideal para improvisar."
          onClick={onGoGeneric}/>
        <MenuCard
          color="#FF6B35" icon="🚪"
          title="Unirse / Ver marcador"
          sub="CÓDIGO DE 4 LETRAS"
          desc="Únete como jugador o mira el marcador en vivo como espectador."
          onClick={onGoJoin}/>

        {/* PLATAFORMA */}
        <div className="os-section">PLATAFORMA</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
          {[
            {color:'#00FF9D',icon:'📊',title:'Stats',sub:'RANKING',onClick:onGoStats},
            {color:'#00FF9D',icon:'🧰',title:'Herramientas',sub:'MONEDA · DADOS',onClick:onGoTools},
            {color:'#FF6B35',icon:'🗺️',title:'Motor',sub:'DIAGRAMA TÉCNICO',onClick:onGoDiagram},
            {color:'#9B5DE5',icon:'🧩',title:'Schema Builder',sub:'EXPERIMENTAL',onClick:onGoSchemaBuilder},
          ].map(card=>(
            <div key={card.title} onClick={()=>{snd('tap');card.onClick();}} style={{
              borderRadius:16,border:`1.5px solid ${card.color}33`,
              background:`${card.color}09`,
              padding:'16px 14px',cursor:'pointer',transition:'all .22s',
              position:'relative',overflow:'hidden',
            }}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:1,
                background:`linear-gradient(90deg,transparent,${card.color}44,transparent)`,pointerEvents:'none'}}/>
              <div style={{fontSize:'2rem',marginBottom:8}}>{card.icon}</div>
              <div style={{fontFamily:'var(--font-display)',fontSize:'.95rem',letterSpacing:1,color:'#fff',marginBottom:2}}>{card.title}</div>
              <div style={{fontFamily:'var(--font-ui)',fontSize:'.5rem',color:`${card.color}99`,letterSpacing:2}}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Recientes */}
        {recentSessions.length>0&&(
          <>
            <div className="os-section">RECIENTES</div>
            {recentSessions.map((s,i)=>(
              <div key={s.sessionId||i} style={{
                background:'var(--surface)',border:'1px solid var(--border)',
                borderRadius:12,padding:'11px 14px',marginBottom:7,
                display:'flex',alignItems:'center',gap:10,
              }}>
                <div style={{fontSize:'1.5rem',width:34,textAlign:'center',flexShrink:0}}>
                  {s.gameType==='preset:strike'?'🎳':s.gameType?.includes('template')?'🎮':'⚔️'}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:'var(--font-body)',fontWeight:700,fontSize:'var(--fs-sm)',
                    overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                    {s.customTitle||s.gameTitle}
                  </div>
                  <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',
                    color:'rgba(255,255,255,.32)',letterSpacing:1,marginTop:1}}>
                    {fmtShortDate(s.startedAt)} · {s.playerCount} jug. · {fmtDuration(s.durationMs)}
                  </div>
                </div>
                <div style={{fontFamily:'var(--font-display)',fontSize:'1.1rem',color:'var(--gold)',flexShrink:0}}>
                  {s.players?.[0]?.emoji||'🏆'}
                </div>
              </div>
            ))}
          </>
        )}
        <div style={{height:20}}/>
      </div>
    </div>
  );
}



// ── GENERIC SETUP FROM TEMPLATE ───────────────────────────────────
function GenericSetupFromTemplate({template,hostPlayer,onBack,onCreateRoom}){
  const [players,setPlayers]=useState([]);
  const [newName,setNewName]=useState('');

  useEffect(()=>{
    const init=[];
    if(hostPlayer&&hostPlayer.name&&hostPlayer.name!=='Host'){
      init.push({...hostPlayer,isHost:true});
    }
    setPlayers(init);
  },[]);

  function addPlayer(){
    if(!newName.trim()) return;
    snd('join');
    const idx=players.length%EMOJIS.length;
    const cidx=players.length%COLORS.length;
    setPlayers(prev=>[...prev,{id:uid(),name:newName.trim(),emoji:EMOJIS[idx],color:COLORS[cidx]}]);
    setNewName('');
  }

  const cfg=template.config||{};
  const minP=cfg.minPlayers||2;

  return(
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onBack}>← Atrás</button>
        <div className="os-logo" style={{fontSize:'1rem'}}>{template.emoji||'🎮'} <span>{template.name}</span></div>
        <div style={{width:70}}/>
      </div>
      <div className="os-page" style={{paddingTop:16}}>
        <div style={{background:'rgba(155,93,229,.06)',border:'1px solid rgba(155,93,229,.2)',
          borderRadius:14,padding:'12px 14px',marginBottom:16}}>
          <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(155,93,229,.7)',letterSpacing:2,marginBottom:4}}>
            CONFIGURACIÓN CARGADA
          </div>
          <div style={{fontFamily:'var(--font-display)',fontSize:'1rem',letterSpacing:1,color:'#fff'}}>
            {template.name}
          </div>
          {template.description&&<div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.4)',letterSpacing:1,marginTop:3}}>{template.description}</div>}
        </div>

        <div className="os-section">JUGADORES · {players.length}</div>
        {players.map((p,i)=>(
          <div key={p.id} className="player-row" style={{marginBottom:8}}>
            <div className="player-emoji">{p.emoji}</div>
            <div className="player-name" style={{color:p.color}}>{p.name}{p.isHost&&<span style={{fontFamily:'var(--font-ui)',fontSize:'.5rem',color:'var(--gold)',letterSpacing:2,marginLeft:6}}>HOST</span>}</div>
            {!p.isHost&&<button style={{background:'none',border:'none',color:'rgba(255,59,92,.5)',fontSize:'1.2rem',cursor:'pointer'}} onClick={()=>setPlayers(prev=>prev.filter(pl=>pl.id!==p.id))}>×</button>}
          </div>
        ))}
        <div style={{display:'flex',gap:8,marginBottom:8}}>
          <input className="os-input" style={{marginBottom:0,flex:1}} placeholder="Agregar jugador..."
            value={newName} onChange={e=>setNewName(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&addPlayer()} maxLength={20}/>
          <button style={{background:'rgba(155,93,229,.15)',border:'1px solid rgba(155,93,229,.4)',
            color:'var(--purple)',borderRadius:11,padding:'0 18px',cursor:'pointer',
            fontFamily:'var(--font-display)',fontSize:'1.2rem',flexShrink:0}}
            onClick={addPlayer}>+</button>
        </div>

        {/* Jugadores habituales */}
        {(()=>{
          const contacts=getSavedPlayers();
          const used=players.map(p=>p.name.toLowerCase());
          const avail=contacts.filter(c=>!used.includes(c.name.toLowerCase()));
          if(!avail.length) return null;
          return(
            <div style={{marginBottom:12}}>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)',letterSpacing:2,marginBottom:7}}>⭐ HABITUALES</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {avail.slice(0,10).map(p=>(
                  <button key={p.id||p.name} onClick={()=>{
                    snd('join');
                    setPlayers(prev=>[...prev,{id:uid(),name:p.name,emoji:p.emoji||EMOJIS[prev.length%EMOJIS.length],color:p.color||COLORS[prev.length%COLORS.length]}]);
                  }} style={{display:'flex',alignItems:'center',gap:5,padding:'6px 10px',borderRadius:10,border:'none',cursor:'pointer',background:'rgba(255,255,255,.08)'}}>
                    <span style={{fontSize:'1rem'}}>{p.emoji}</span>
                    <span style={{fontFamily:'var(--font-body)',fontWeight:700,fontSize:'var(--fs-sm)',color:p.color||'#fff'}}>{p.name}</span>
                    <span style={{color:'rgba(0,255,157,.6)',fontSize:'.85rem'}}>+</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {players.length>=minP&&(
          <div className="os-alert alert-green" style={{marginBottom:12}}>
            ✓ {players.length} jugadores listos
          </div>
        )}
        {players.length<minP&&(
          <div className="os-alert alert-cyan" style={{marginBottom:12}}>
            Mínimo {minP} jugadores
          </div>
        )}
        <button className="btn btn-purple" disabled={players.length<minP}
          onClick={()=>{snd('round');onCreateRoom(template,players);}}>
          🎮 CREAR SALA — {template.name}
        </button>
        <button className="btn btn-back" onClick={onBack}>← Cancelar</button>
      </div>
    </div>
  );
}

// ── JOIN ROOM ─────────────────────────────────────────────────────
function JoinRoom({onBack,onJoin,myId,profile,db,onSpectate}){
  const [code,setCode]=useState('');
  const [step,setStep]=useState('code'); // 'code' | 'name' | 'pick'
  const [roomData,setRoomData]=useState(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [name,setName]=useState(profile?.name||'');
  const codeRef=React.useRef(null);
  const contacts=getSavedPlayers();

  // Auto-focus code input
  React.useEffect(()=>{ if(step==='code') codeRef.current?.focus(); },[step]);

  async function lookupRoom(){
    if(code.length<4) return;
    setBusy(true); setError('');
    const data=await db.get(`rooms/${code.toUpperCase()}`);
    setBusy(false);
    if(!data){ setError('Sala no encontrada'); return; }
    if(data.status==='finished'||data.status==='dissolved'){ setError('Esta partida ya terminó'); return; }
    setRoomData(data);

    // If I already have a profile, go straight to name confirm
    // If not, go to name entry
    setStep(profile?.name ? 'name' : 'name');
  }

  async function doJoin(slotId=null){
    if(!name.trim()&&!slotId){ setError('Escribe tu nombre'); return; }
    setBusy(true); setError('');
    const err=await onJoin(
      code.toUpperCase(),
      slotId||null,
      name.trim()||profile?.name||'',
      profile?.emoji||'🎮',
      profile?.color||'#00F5FF'
    );
    setBusy(false);
    if(err?.error) setError(err.error);
  }

  function pickSlot(player){ doJoin(player.id); }
  function joinAsNew(){ doJoin(null); }

  // ── STEP: CODE ──────────────────────────────────────────────
  if(step==='code') return(
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onBack}>← Volver</button>
        <div className="os-logo" style={{fontSize:'1.1rem'}}>UNIRSE <span>A SALA</span></div>
        <div style={{width:70}}/>
      </div>
      <div className="os-page" style={{paddingTop:32}}>

        {/* Code entry */}
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontFamily:'var(--font-display)',fontSize:'1rem',
            color:'rgba(255,255,255,.4)',letterSpacing:3,marginBottom:16}}>
            CÓDIGO DE SALA
          </div>
          <input
            ref={codeRef}
            className="os-input"
            placeholder="Ej: AB3X"
            value={code}
            onChange={e=>setCode(e.target.value.toUpperCase().slice(0,4))}
            onKeyDown={e=>e.key==='Enter'&&code.length>=4&&lookupRoom()}
            maxLength={4}
            style={{
              textAlign:'center',fontSize:'2.2rem',letterSpacing:12,
              fontFamily:'var(--font-display)',height:72,
              borderColor:code.length===4?'var(--cyan)':'rgba(255,255,255,.15)',
              boxShadow:code.length===4?'0 0 0 2px rgba(0,245,255,.2)':'none',
              transition:'all .2s',
            }}
          />
          {error&&<div style={{color:'var(--red)',fontFamily:'var(--font-label)',
            fontSize:'var(--fs-xs)',marginTop:10,letterSpacing:1}}>{error}</div>}
        </div>

        <button className="btn btn-cyan" disabled={code.length<4||busy}
          onClick={lookupRoom} style={{fontSize:'1rem',padding:'18px'}}>
          {busy?'⏳ Buscando...':`🔍 Buscar sala ${code||'____'}`}
        </button>

        {/* Spectator option */}
        {code.length>=4&&(
          <button className="btn btn-ghost" style={{marginTop:8,opacity:.7}}
            onClick={()=>onSpectate&&onSpectate(code.toUpperCase())}>
            👁 Entrar como espectador
          </button>
        )}

        {/* Habituales quick-join */}
        {contacts.length>0&&(
          <div style={{marginTop:24}}>
            <div className="os-section">SALAS RECIENTES DE HABITUALES</div>
            <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',
              color:'rgba(255,255,255,.3)',letterSpacing:1,marginBottom:4}}>
              Ingresa el código para unirte
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ── STEP: NAME / PICK ────────────────────────────────────────
  const activePlayers=roomData?.players?.filter(p=>!p.eliminated)||[];
  const mySlot=activePlayers.find(p=>p.name.toLowerCase()===(profile?.name||name).toLowerCase());

  return(
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}}
          onClick={()=>{setStep('code');setError('');}}>← Atrás</button>
        <div className="os-logo" style={{fontSize:'1.1rem'}}>
          <span style={{color:'var(--cyan)'}}>{code.toUpperCase()}</span>
        </div>
        <div style={{width:70}}/>
      </div>
      <div className="os-page" style={{paddingTop:16}}>

        {/* Room info */}
        <div style={{
          background:'rgba(0,245,255,.05)',border:'1px solid rgba(0,245,255,.15)',
          borderRadius:14,padding:'14px 16px',marginBottom:20,
        }}>
          <div style={{fontFamily:'var(--font-display)',color:'var(--cyan)',
            fontSize:'1rem',letterSpacing:2,marginBottom:4}}>
            {roomData?.customTitle||roomData?.gameType||'Partida'}
          </div>
          <div style={{fontFamily:'var(--font-label)',color:'rgba(255,255,255,.4)',
            fontSize:'var(--fs-xs)',letterSpacing:1}}>
            {activePlayers.length} jugadores · {
              roomData?.status==='active'?'⚡ En partida':'🏠 En lobby'
            }
          </div>
        </div>

        {/* If my name matches a slot, offer quick reconnect */}
        {mySlot&&(
          <div style={{
            background:'rgba(0,255,157,.06)',border:'1px solid rgba(0,255,157,.2)',
            borderRadius:14,padding:'16px',marginBottom:16,
          }}>
            <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',
              color:'rgba(0,255,157,.6)',letterSpacing:2,marginBottom:10}}>
              ⚡ TU LUGAR EN ESTA PARTIDA
            </div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
              <div style={{fontSize:'2rem'}}>{mySlot.emoji}</div>
              <div style={{fontFamily:'var(--font-display)',fontSize:'1.1rem',
                color:mySlot.color||'#fff',letterSpacing:1}}>
                {mySlot.name}
              </div>
            </div>
            <button className="btn btn-cyan" disabled={busy}
              onClick={()=>doJoin(mySlot.id)} style={{padding:'14px'}}>
              {busy?'⏳ Conectando...':'✓ Reconectarme como '+mySlot.name}
            </button>
          </div>
        )}

        {/* Name input for new join */}
        {!mySlot&&(
          <>
            <div className="os-section">TU NOMBRE</div>
            <input className="os-input" placeholder="Tu nombre en la partida..."
              value={name} onChange={e=>setName(e.target.value)} maxLength={20}
              autoFocus
              onKeyDown={e=>e.key==='Enter'&&name.trim()&&doJoin(null)}
              style={{
                borderColor:name.trim()?'var(--cyan)':'rgba(255,255,255,.15)',
                transition:'all .2s',
              }}/>
            <button className="btn btn-cyan" disabled={!name.trim()||busy}
              onClick={()=>doJoin(null)} style={{marginTop:8,padding:'16px'}}>
              {busy?'⏳ Uniéndome...':'🎮 Unirme a la partida'}
            </button>
          </>
        )}

        {error&&<div style={{color:'var(--red)',fontFamily:'var(--font-label)',
          fontSize:'var(--fs-xs)',marginTop:10,textAlign:'center',letterSpacing:1}}>{error}</div>}

        {/* Pick a slot from existing players */}
        {activePlayers.length>0&&!mySlot&&(
          <div style={{marginTop:20}}>
            <div className="os-section">O TOMAR EL LUGAR DE UN JUGADOR</div>
            <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',
              color:'rgba(255,255,255,.3)',letterSpacing:1,marginBottom:8}}>
              Si estás reemplazando a alguien desconectado
            </div>
            {activePlayers.map(p=>{
              const isRoomHost = p.id === roomData?.hostId;
              const isOnline   = true; // presencia futura
              const blocked    = isRoomHost; // host no es tomable
              return(
                <div key={p.id} className="os-card" style={{
                  cursor: blocked ? 'not-allowed' : 'pointer',
                  marginBottom:6,
                  opacity: blocked ? 0.45 : busy ? 0.7 : 1,
                  border: isRoomHost ? '1px solid rgba(255,212,71,.35)' : undefined,
                  background: isRoomHost ? 'rgba(255,212,71,.04)' : undefined,
                }} onClick={()=>!busy&&!blocked&&pickSlot(p)}>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{fontSize:'1.6rem'}}>{p.emoji}</div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:'var(--font-body)',fontWeight:700,
                        fontSize:'var(--fs-sm)',color:p.color||'#fff',display:'flex',alignItems:'center',gap:6}}>
                        {p.name}
                        {isRoomHost&&(
                          <span style={{fontFamily:'var(--font-ui)',fontSize:'.5rem',
                            color:'var(--gold)',letterSpacing:2,
                            background:'rgba(255,212,71,.12)',border:'1px solid rgba(255,212,71,.3)',
                            borderRadius:4,padding:'1px 5px'}}>
                            👑 HOST
                          </span>
                        )}
                      </div>
                      {isRoomHost&&(
                        <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',
                          color:'rgba(255,212,71,.5)',letterSpacing:1,marginTop:2}}>
                          Lugar reservado — no disponible
                        </div>
                      )}
                    </div>
                    {!isRoomHost&&(
                      <div style={{fontFamily:'var(--font-display)',fontSize:'var(--fs-sm)',
                        color:'rgba(255,255,255,.5)'}}>
                        {p.total||0} pts →
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Habituales */}
        {getSavedPlayers().length>0&&!mySlot&&(
          <div style={{marginTop:16}}>
            <div className="os-section">⭐ HABITUALES</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {getSavedPlayers().filter(c=>
                !activePlayers.some(p=>p.name.toLowerCase()===c.name.toLowerCase())
              ).slice(0,8).map(c=>(
                <button key={c.id} onClick={()=>{snd('tap');setName(c.name);}}
                  style={{
                    padding:'7px 12px',borderRadius:10,
                    border:`1px solid ${name===c.name?'var(--cyan)':'rgba(255,255,255,.1)'}`,
                    background:name===c.name?'rgba(0,245,255,.12)':'rgba(255,255,255,.04)',
                    cursor:'pointer',display:'flex',alignItems:'center',gap:6,
                    fontFamily:'var(--font-body)',fontWeight:700,fontSize:'var(--fs-xs)',
                    color:name===c.name?'var(--cyan)':'rgba(255,255,255,.65)',
                    transition:'all .15s',
                  }}>
                  {c.emoji} {c.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// ── STATS SCREEN ─────────────────────────────────────────────────
function StatsScreen({onBack,db}){
  const [tab,setTab]=useState('overview');
  const [players,setPlayers]=useState([]);
  const [sessions,setSessions]=useState([]);
  const [loading,setLoading]=useState(true);
  const [selectedPlayer,setSelectedPlayer]=useState(null);

  useEffect(()=>{
    async function load(){
      setLoading(true);
      try{
        const [lb,sess]=await Promise.all([loadLeaderboard(false),loadRecentSessions(50,false)]);
        setPlayers(lb);setSessions(sess);
      }catch(e){console.error(e);}finally{setLoading(false);}
    }
    load();
  },[]);

  const globalStats=React.useMemo(()=>{
    if(!sessions.length) return null;
    const totalTime=sessions.reduce((s,x)=>s+(x.durationMs||0),0);
    const avgTime=sessions.length?totalTime/sessions.length:0;
    const sorted=[...sessions].sort((a,b)=>(b.durationMs||0)-(a.durationMs||0));
    const longest=sorted[0];
    const shortest=sorted[sorted.length-1];
    const gameCounts={};
    sessions.forEach(s=>{gameCounts[s.customTitle||s.gameTitle]=(gameCounts[s.customTitle||s.gameTitle]||0)+1;});
    const mostPlayed=Object.entries(gameCounts).sort((a,b)=>b[1]-a[1])[0];
    const allPlayers=sessions.flatMap(s=>(s.players||[]).map(p=>({...p,game:s.customTitle||s.gameTitle})));
    const withSurvival=allPlayers.filter(p=>p.survivalMs>0).sort((a,b)=>b.survivalMs-a.survivalMs);
    return{totalTime,avgTime,longest,shortest,mostPlayed,slowest:withSurvival[0],fastest:withSurvival[withSurvival.length-1]};
  },[sessions]);

  if(selectedPlayer){
    const p=selectedPlayer;
    const wr=p.games>0?Math.round((p.wins/p.games)*100):0;
    const pSessions=sessions.filter(s=>(s.players||[]).some(sp=>sp.name===p.name));
    const totalMs=pSessions.reduce((acc,s)=>acc+(s.durationMs||0),0);
    return(
      <div className="os-wrap">
        <div className="os-header">
          <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={()=>setSelectedPlayer(null)}>← Stats</button>
          <div style={{fontFamily:'var(--font-label)',fontSize:'.75rem',fontWeight:700,color:'rgba(255,255,255,.4)',letterSpacing:3}}>JUGADOR</div>
          <div style={{width:70}}/>
        </div>
        <div className="os-page" style={{paddingTop:20}}>
          <div style={{textAlign:'center',marginBottom:20}}>
            <div style={{fontSize:'4rem',marginBottom:6}}>{p.emoji}</div>
            <div style={{fontFamily:'var(--font-display)',fontSize:'1.7rem',letterSpacing:2,color:p.color||'#fff'}}>{p.name}</div>
          </div>
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:14,padding:'16px',marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.4)',letterSpacing:2}}>WIN RATE</div>
              <div style={{fontFamily:'var(--font-display)',fontSize:'1.1rem',color:'var(--gold)'}}>{wr}%</div>
            </div>
            <div style={{height:8,background:'rgba(255,255,255,.08)',borderRadius:4,overflow:'hidden'}}>
              <div style={{height:'100%',width:wr+'%',background:'linear-gradient(90deg,var(--cyan),var(--gold))',borderRadius:4}}/>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
            {[{label:'PARTIDAS',value:p.games||0,color:'var(--cyan)',icon:'🎮'},{label:'VICTORIAS',value:p.wins||0,color:'var(--gold)',icon:'🏆'},{label:'TIEMPO TOTAL',value:fmtDuration(totalMs),color:'var(--green)',icon:'⏱'},{label:'MEJOR POS.',value:'#'+(p.bestPosition||'—'),color:'var(--orange)',icon:'🥇'}].map(s=>(
              <div key={s.label} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:'14px',textAlign:'center'}}>
                <div style={{fontSize:'1.4rem',marginBottom:4}}>{s.icon}</div>
                <div style={{fontFamily:'var(--font-display)',fontSize:'1.5rem',color:s.color,marginBottom:3}}>{s.value}</div>
                <div style={{fontFamily:'var(--font-ui)',fontSize:'.5rem',fontWeight:700,color:'rgba(255,255,255,.3)',letterSpacing:2}}>{s.label}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-ghost" onClick={()=>setSelectedPlayer(null)}>← Volver</button>
        </div>
      </div>
    );
  }

  const TABS=[['overview','📊 Overview'],['ranking','🏆 Ranking'],['sessions','🎮 Partidas']];
  return(
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onBack}>← Home</button>
        <div className="os-logo" style={{fontSize:'1.1rem'}}>STATS <span>OS</span></div>
        <div style={{width:70}}/>
      </div>
      <div className="os-page" style={{paddingTop:16}}>
        <div style={{display:'flex',gap:5,marginBottom:16}}>
          {TABS.map(([id,lbl])=>(
            <button key={id} onClick={()=>{snd('tap');setTab(id);}}
              style={{flex:1,border:'none',borderRadius:10,padding:'9px 4px',cursor:'pointer',fontFamily:'var(--font-ui)',fontSize:'var(--fs-micro)',letterSpacing:1,transition:'all .18s',background:tab===id?'linear-gradient(135deg,var(--cyan),#00B8CC)':'rgba(255,255,255,.06)',color:tab===id?'var(--bg)':'rgba(255,255,255,.4)'}}>
              {lbl}
            </button>
          ))}
        </div>
        {loading&&<div style={{textAlign:'center',paddingTop:40}}><div className="os-spin" style={{marginBottom:14}}/></div>}
        {!loading&&tab==='overview'&&(
          <div className="anim-fade">
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:14}}>
              {[{label:'PARTIDAS',value:sessions.length,color:'var(--cyan)',icon:'🎮'},{label:'JUGADORES',value:players.length,color:'var(--purple)',icon:'👥'},{label:'TIEMPO',value:fmtDuration(globalStats?.totalTime||0),color:'var(--green)',icon:'⏱'}].map(s=>(
                <div key={s.label} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:14,padding:'14px 10px',textAlign:'center'}}>
                  <div style={{fontSize:'1.3rem',marginBottom:4}}>{s.icon}</div>
                  <div style={{fontFamily:'var(--font-display)',fontSize:'1.3rem',color:s.color,marginBottom:3}}>{s.value}</div>
                  <div style={{fontFamily:'var(--font-ui)',fontSize:'.48rem',fontWeight:700,color:'rgba(255,255,255,.3)',letterSpacing:2}}>{s.label}</div>
                </div>
              ))}
            </div>
            {globalStats&&(
              <>{[{label:'Partida más larga',icon:'🐢',value:globalStats.longest?`${fmtDuration(globalStats.longest.durationMs)} — ${globalStats.longest.customTitle||globalStats.longest.gameTitle}`:'—'},{label:'Partida más corta',icon:'⚡',value:globalStats.shortest?`${fmtDuration(globalStats.shortest.durationMs)} — ${globalStats.shortest.customTitle||globalStats.shortest.gameTitle}`:'—'},{label:'Juego más jugado',icon:'🎮',value:globalStats.mostPlayed?`${globalStats.mostPlayed[0]} (${globalStats.mostPlayed[1]}×)`:'—'},{label:'Jugador más lento',icon:'🐌',value:globalStats.slowest?`${globalStats.slowest.emoji} ${globalStats.slowest.name} — ${fmtDuration(globalStats.slowest.survivalMs)}`:'—'},{label:'Jugador más rápido',icon:'🚀',value:globalStats.fastest?`${globalStats.fastest.emoji} ${globalStats.fastest.name} — ${fmtDuration(globalStats.fastest.survivalMs)}`:'—'}].map((r,i)=>(
                <div key={i} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:'12px 14px',marginBottom:7,display:'flex',alignItems:'flex-start',gap:12}}>
                  <div style={{fontSize:'1.4rem',flexShrink:0}}>{r.icon}</div>
                  <div>
                    <div style={{fontFamily:'var(--font-ui)',fontSize:'.52rem',letterSpacing:2,color:'rgba(255,255,255,.3)',marginBottom:3}}>{r.label.toUpperCase()}</div>
                    <div style={{fontFamily:'var(--font-body)',fontWeight:700,fontSize:'var(--fs-sm)',color:'rgba(255,255,255,.8)',lineHeight:1.4}}>{r.value}</div>
                  </div>
                </div>
              ))}</>
            )}
            {!globalStats&&<div className="os-empty"><div style={{fontSize:'2.5rem',marginBottom:10}}>📊</div><div>Completa partidas para ver estadísticas</div></div>}
          </div>
        )}
        {!loading&&tab==='ranking'&&(
          <div className="anim-fade">
            {players.length===0&&<div className="os-empty"><div style={{fontSize:'2.5rem',marginBottom:10}}>🏆</div><div>Sin jugadores aún</div></div>}
            {players.map((p,i)=>{
              const wr=p.games>0?Math.round((p.wins/p.games)*100):0;
              return(
                <div key={p.pKey||i} className={`stat-card ${i===0?'gold-border':''}`} onClick={()=>{snd('tap');setSelectedPlayer(p);}}>
                  <div className="stat-rank">{i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}</div>
                  <div style={{fontSize:'1.7rem'}}>{p.emoji}</div>
                  <div style={{flex:1}}>
                    <div className="stat-name" style={{color:p.color||'#fff'}}>{p.name}</div>
                    <div className="stat-meta">{p.games||0} partidas · {wr}% WR</div>
                    <div style={{height:3,background:'rgba(255,255,255,.08)',borderRadius:2,marginTop:5,overflow:'hidden'}}>
                      <div style={{height:'100%',width:wr+'%',background:i===0?'var(--gold)':'var(--cyan)',borderRadius:2}}/>
                    </div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div className="stat-value" style={{color:i===0?'var(--gold)':'rgba(255,255,255,.5)'}}>{p.wins||0}</div>
                    <div style={{fontFamily:'var(--font-ui)',fontSize:'.45rem',color:'rgba(255,255,255,.25)',letterSpacing:1}}>🏆</div>
                  </div>
                  <div style={{color:'rgba(255,255,255,.2)',fontSize:'.95rem'}}>›</div>
                </div>
              );
            })}
          </div>
        )}
        {!loading&&tab==='sessions'&&(
          <div className="anim-fade">
            {sessions.length===0&&<div className="os-empty"><div style={{fontSize:'2.5rem',marginBottom:10}}>🎮</div><div>Sin partidas registradas</div></div>}
            {sessions.map((s,i)=>(
              <div key={s.sessionId||i} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:13,padding:'13px 15px',marginBottom:8}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:'var(--fs-sm)',display:'flex',alignItems:'center',gap:6}}>
                      <span>{s.gameType==='preset:strike'?'🎳':'⚔️'}</span>{s.customTitle||s.gameTitle}
                    </div>
                    <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.35)',letterSpacing:1,marginTop:2}}>{fmtDate(s.startedAt)} · {fmtDuration(s.durationMs)}</div>
                  </div>
                  <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',fontWeight:700,color:'rgba(255,255,255,.3)',background:'rgba(255,255,255,.06)',padding:'3px 9px',borderRadius:20}}>{s.playerCount||0} jug.</div>
                </div>
                {(s.players||[]).slice(0,3).map((p,pi)=>(
                  <div key={p.id||pi} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0',borderBottom:'1px solid rgba(255,255,255,.04)'}}>
                    <div style={{fontFamily:'var(--font-display)',fontSize:'.95rem',width:22,color:'rgba(255,255,255,.25)'}}>{pi===0?'🥇':pi===1?'🥈':'🥉'}</div>
                    <div style={{fontSize:'1.05rem'}}>{p.emoji}</div>
                    <div style={{fontWeight:800,flex:1,fontSize:'var(--fs-sm)',color:p.color||'#fff'}}>{p.name}</div>
                    <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.4)'}}>
                      {p.survivalMs?`⏱ ${fmtDuration(p.survivalMs)}`:''}{p.points?` · ${p.points}pts`:''}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── MOUNT APP ────────────────────────────────────────────────────
const _root = ReactDOM.createRoot(document.getElementById('root'));
_root.render(React.createElement(App));
