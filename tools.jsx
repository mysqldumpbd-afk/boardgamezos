// ═══════════════════════════════════════════════════════════════
// tools.jsx — BOARDGAMEZ OS v1.4
// Herramientas: Moneda, Dados, Ruleta, PPS
// ═══════════════════════════════════════════════════════════════

// ── COIN FLIP ────────────────────────────────────────────────────
function CoinTool({ onBack }){
  const [result,setResult]=React.useState(null);
  const [flipping,setFlipping]=React.useState(false);
  const [history,setHistory]=React.useState([]);

  function flip(){
    if(flipping) return;
    snd('round');
    setFlipping(true);
    setResult(null);
    setTimeout(()=>{
      const r=Math.random()>.5?'CARA':'CRUZ';
      setResult(r);
      setFlipping(false);
      setHistory(h=>[{r,ts:Date.now()},...h].slice(0,10));
      snd(r==='CARA'?'up':'down');
    },900);
  }

  return(
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onBack}>← Herramientas</button>
        <div className="os-logo" style={{fontSize:'1.1rem'}}>🪙 <span>MONEDA</span></div>
        <div style={{width:80}}/>
      </div>
      <div className="os-page" style={{paddingTop:20,textAlign:'center'}}>

        {/* Coin display */}
        <div style={{
          width:160,height:160,borderRadius:'50%',margin:'0 auto 24px',
          background: result==='CARA'
            ? 'linear-gradient(135deg,#FFD447,#FFA500)'
            : result==='CRUZ'
            ? 'linear-gradient(135deg,#aaa,#777)'
            : 'linear-gradient(135deg,#FFD447,#FFA500)',
          border:'4px solid rgba(255,255,255,.2)',
          display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:'5rem',
          boxShadow: result?'0 0 40px rgba(255,212,71,.5)':'0 0 20px rgba(255,212,71,.2)',
          animation: flipping?'coinSpin .9s linear':'none',
          transition:'all .3s'
        }}>
          {flipping ? '🌀' : result==='CARA' ? '👑' : result==='CRUZ' ? '⚡' : '🪙'}
        </div>

        <style>{`@keyframes coinSpin{0%{transform:rotateY(0)}100%{transform:rotateY(1440deg)}}`}</style>

        {result&&(
          <div style={{
            fontFamily:'var(--font-display)',fontSize:'3rem',letterSpacing:4,
            color:result==='CARA'?'var(--gold)':'rgba(200,200,200,.9)',
            marginBottom:8,animation:'popIn .3s ease'
          }}>{result}</div>
        )}
        {!result&&!flipping&&(
          <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-sm)',color:'rgba(255,255,255,.35)',letterSpacing:2,marginBottom:8}}>
            TOCA PARA LANZAR
          </div>
        )}
        {flipping&&(
          <div style={{fontFamily:'var(--font-display)',fontSize:'1.5rem',color:'var(--cyan)',marginBottom:8,letterSpacing:2}}>
            LANZANDO...
          </div>
        )}

        <div className="g16"/>
        <button className="btn btn-gold" onClick={flip} disabled={flipping}>
          🪙 {flipping?'Lanzando...':'Lanzar moneda'}
        </button>

        {history.length>0&&(
          <>
            <div className="os-section" style={{marginTop:24}}>HISTORIAL</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'center'}}>
              {history.map((h,i)=>(
                <div key={i} style={{
                  padding:'4px 12px',borderRadius:20,
                  background:h.r==='CARA'?'rgba(255,212,71,.15)':'rgba(255,255,255,.08)',
                  border:`1px solid ${h.r==='CARA'?'rgba(255,212,71,.4)':'rgba(255,255,255,.15)'}`,
                  fontFamily:'var(--font-display)',fontSize:'var(--fs-xs)',
                  color:h.r==='CARA'?'var(--gold)':'rgba(255,255,255,.5)',
                  letterSpacing:1
                }}>{h.r}</div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── DICE ROLLER ──────────────────────────────────────────────────
function DiceTool({ onBack }){
  const [diceType,setDiceType]=React.useState('d6');
  const [result,setResult]=React.useState(null);
  const [rolling,setRolling]=React.useState(false);
  const [history,setHistory]=React.useState([]);
  const [numDice,setNumDice]=React.useState(1);

  const DICE_FACES={'d4':4,'d6':6,'d8':8,'d10':10,'d12':12,'d20':20};
  const DICE_EMOJI={'d4':'🔺','d6':'🎲','d8':'🔷','d10':'🔟','d12':'💠','d20':'⚔️'};

  function roll(){
    if(rolling) return;
    snd('round');
    setRolling(true);
    setResult(null);
    setTimeout(()=>{
      const max=DICE_FACES[diceType];
      const rolls=Array.from({length:numDice},()=>Math.floor(Math.random()*max)+1);
      const total=rolls.reduce((a,b)=>a+b,0);
      setResult({rolls,total,type:diceType});
      setRolling(false);
      setHistory(h=>[{rolls,total,type:diceType,ts:Date.now()},...h].slice(0,8));
      snd('score');
    },700);
  }

  return(
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onBack}>← Herramientas</button>
        <div className="os-logo" style={{fontSize:'1.1rem'}}>🎲 <span>DADOS</span></div>
        <div style={{width:80}}/>
      </div>
      <div className="os-page" style={{paddingTop:16,textAlign:'center'}}>

        {/* Tipo de dado */}
        <div className="os-section">TIPO DE DADO</div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'center',marginBottom:16}}>
          {Object.keys(DICE_FACES).map(d=>(
            <button key={d} onClick={()=>{snd('tap');setDiceType(d);setResult(null);}}
              style={{
                padding:'8px 14px',borderRadius:10,border:'none',cursor:'pointer',
                fontFamily:'var(--font-display)',fontSize:'var(--fs-sm)',letterSpacing:1,
                background:diceType===d?'var(--cyan)':'rgba(255,255,255,.08)',
                color:diceType===d?'var(--bg)':'rgba(255,255,255,.6)',
                transition:'all .15s'
              }}>
              {d}
            </button>
          ))}
        </div>

        {/* Número de dados */}
        <div className="os-section">CANTIDAD</div>
        <div style={{display:'flex',gap:6,justifyContent:'center',marginBottom:20}}>
          {[1,2,3,4].map(n=>(
            <button key={n} onClick={()=>{snd('tap');setNumDice(n);setResult(null);}}
              style={{
                width:50,height:50,borderRadius:12,border:'none',cursor:'pointer',
                fontFamily:'var(--font-display)',fontSize:'1.1rem',
                background:numDice===n?'var(--orange)':'rgba(255,255,255,.08)',
                color:numDice===n?'white':'rgba(255,255,255,.6)',
                transition:'all .15s'
              }}>
              {n}
            </button>
          ))}
        </div>

        {/* Resultado */}
        <div style={{
          width:160,height:160,borderRadius:32,margin:'0 auto 20px',
          background:'linear-gradient(135deg,rgba(0,245,255,.1),rgba(155,93,229,.1))',
          border:'2px solid rgba(0,245,255,.3)',
          display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
          fontSize:rolling?'3rem':'4rem',
          boxShadow:result?'0 0 40px rgba(0,245,255,.3)':'none',
          animation:rolling?'diceRoll .7s linear':'none',
          transition:'all .3s'
        }}>
          <style>{`@keyframes diceRoll{0%,100%{transform:rotate(0)}25%{transform:rotate(-15deg)}75%{transform:rotate(15deg)}}`}</style>
          {rolling ? DICE_EMOJI[diceType] : result ? (
            <div>
              {numDice>1&&<div style={{fontFamily:'var(--font-display)',fontSize:'3.5rem',color:'var(--cyan)'}}>{result.total}</div>}
              {numDice===1&&<div style={{fontFamily:'var(--font-display)',fontSize:'4rem',color:'var(--cyan)'}}>{result.rolls[0]}</div>}
              {numDice>1&&<div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.4)',letterSpacing:1}}>
                [{result.rolls.join('+')}]
              </div>}
            </div>
          ) : DICE_EMOJI[diceType]}
        </div>

        {result&&(
          <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-sm)',color:'rgba(255,255,255,.5)',marginBottom:8,letterSpacing:1}}>
            {numDice>1?`${numDice}×${diceType} = ${result.total}`:diceType}
          </div>
        )}

        <button className="btn btn-cyan" onClick={roll} disabled={rolling}>
          🎲 {rolling?'Lanzando...':'Tirar dado'}
        </button>

        {history.length>0&&(
          <>
            <div className="os-section" style={{marginTop:20}}>ÚLTIMAS TIRADAS</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'center'}}>
              {history.map((h,i)=>(
                <div key={i} style={{
                  padding:'5px 12px',borderRadius:10,
                  background:'rgba(0,245,255,.08)',border:'1px solid rgba(0,245,255,.2)',
                  fontFamily:'var(--font-display)',fontSize:'var(--fs-sm)',color:'var(--cyan)',letterSpacing:1
                }}>
                  {h.total} <span style={{fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.3)'}}>{h.type}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── SPIN WHEEL ───────────────────────────────────────────────────
function SpinWheelTool({ onBack, players }){
  const [spinning,setSpinning]=React.useState(false);
  const [result,setResult]=React.useState(null);
  const [rotation,setRotation]=React.useState(0);
  const [segments,setSegments]=React.useState(
    players&&players.length>0
      ? players.map(p=>({label:p.name,color:p.color||'#00F5FF',emoji:p.emoji||'🎯'}))
      : [
          {label:'Jugador 1',color:'#00F5FF',emoji:'🐉'},
          {label:'Jugador 2',color:'#FF6B35',emoji:'🦁'},
          {label:'Jugador 3',color:'#FFD447',emoji:'🐻'},
          {label:'Jugador 4',color:'#9B5DE5',emoji:'🦊'},
        ]
  );
  const [newLabel,setNewLabel]=React.useState('');

  const canvasRef=React.useRef(null);

  React.useEffect(()=>{ drawWheel(); },[segments,rotation]);

  function drawWheel(){
    const canvas=canvasRef.current;
    if(!canvas) return;
    const ctx=canvas.getContext('2d');
    const W=canvas.width,H=canvas.height;
    const cx=W/2,cy=H/2,r=W/2-8;
    const n=segments.length;
    const arc=(2*Math.PI)/n;
    ctx.clearRect(0,0,W,H);

    segments.forEach((seg,i)=>{
      const start=rotation+(i*arc)-(Math.PI/2);
      const end=start+arc;
      // Slice
      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.arc(cx,cy,r,start,end);
      ctx.closePath();
      ctx.fillStyle=seg.color||'#00F5FF';
      ctx.globalAlpha=.85;
      ctx.fill();
      ctx.globalAlpha=1;
      ctx.strokeStyle='rgba(0,0,0,.3)';
      ctx.lineWidth=2;
      ctx.stroke();

      // Label
      ctx.save();
      ctx.translate(cx,cy);
      ctx.rotate(start+arc/2);
      ctx.textAlign='right';
      ctx.fillStyle='#fff';
      ctx.font='bold 13px "Exo 2",sans-serif';
      ctx.shadowColor='rgba(0,0,0,.8)';
      ctx.shadowBlur=4;
      ctx.fillText(seg.emoji+' '+seg.label, r-10, 5);
      ctx.restore();
    });

    // Center
    ctx.beginPath();
    ctx.arc(cx,cy,18,0,2*Math.PI);
    ctx.fillStyle='#080810';
    ctx.fill();
    ctx.strokeStyle='rgba(0,245,255,.5)';
    ctx.lineWidth=3;
    ctx.stroke();

    // Pointer (triangle at top)
    ctx.beginPath();
    ctx.moveTo(cx,cy-r+2);
    ctx.lineTo(cx-12,cy-r-18);
    ctx.lineTo(cx+12,cy-r-18);
    ctx.closePath();
    ctx.fillStyle='#FF3B5C';
    ctx.fill();
  }

  function spin(){
    if(spinning||segments.length<2) return;
    snd('round');
    setSpinning(true);
    setResult(null);
    const extra=Math.PI*2*5+Math.random()*Math.PI*2;
    const duration=3000;
    const start=Date.now();
    const startRot=rotation;
    const tick=()=>{
      const elapsed=Date.now()-start;
      if(elapsed>=duration){
        const finalRot=startRot+extra;
        setRotation(finalRot);
        // Calcular segmento ganador
        const n=segments.length;
        const arc=(2*Math.PI)/n;
        const norm=(((-(finalRot-(Math.PI/2)))%(2*Math.PI))+2*Math.PI)%(2*Math.PI);
        const idx=Math.floor(norm/arc)%n;
        setResult(segments[idx]);
        setSpinning(false);
        snd('winner');
        return;
      }
      const progress=elapsed/duration;
      const ease=1-Math.pow(1-progress,4);
      setRotation(startRot+extra*ease);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function addSegment(){
    if(!newLabel.trim()) return;
    snd('join');
    const colors=['#00F5FF','#FF6B35','#FFD447','#9B5DE5','#00FF9D','#FF3B5C'];
    setSegments(s=>[...s,{label:newLabel.trim(),color:colors[s.length%colors.length],emoji:'🎯'}]);
    setNewLabel('');
  }

  return(
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onBack}>← Herramientas</button>
        <div className="os-logo" style={{fontSize:'1.1rem'}}>🎡 <span>RULETA</span></div>
        <div style={{width:80}}/>
      </div>
      <div className="os-page" style={{paddingTop:16,textAlign:'center'}}>

        {/* Canvas ruleta */}
        <div style={{position:'relative',margin:'0 auto 16px',width:280,height:280}}>
          <canvas ref={canvasRef} width={280} height={280} style={{borderRadius:'50%',border:'3px solid rgba(0,245,255,.3)',boxShadow:'0 0 30px rgba(0,245,255,.2)'}}/>
        </div>

        {result&&(
          <div className="anim-pop" style={{
            background:'linear-gradient(135deg,rgba(0,245,255,.1),rgba(155,93,229,.05))',
            border:'1px solid rgba(0,245,255,.3)',borderRadius:14,padding:'12px 20px',marginBottom:16,
            fontFamily:'var(--font-display)',fontSize:'1.3rem',letterSpacing:1,color:'var(--cyan)'
          }}>
            {result.emoji} {result.label}!
          </div>
        )}

        <button className="btn btn-cyan" onClick={spin} disabled={spinning||segments.length<2}>
          🎡 {spinning?'Girando...':'Girar ruleta'}
        </button>

        {/* Editar segmentos */}
        <div className="os-section" style={{marginTop:20}}>SEGMENTOS · {segments.length}</div>
        {segments.map((s,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
            <div style={{width:14,height:14,borderRadius:'50%',background:s.color,flexShrink:0}}/>
            <div style={{flex:1,fontFamily:'var(--font-body)',fontSize:'var(--fs-sm)',fontWeight:700,textAlign:'left',color:s.color}}>{s.emoji} {s.label}</div>
            <button style={{background:'none',border:'none',color:'rgba(255,59,92,.5)',cursor:'pointer',fontSize:'1.1rem'}}
              onClick={()=>{snd('tap');setSegments(seg=>seg.filter((_,j)=>j!==i));}}>×</button>
          </div>
        ))}
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <input className="os-input" style={{marginBottom:0,flex:1}} placeholder="Añadir segmento..."
            value={newLabel} onChange={e=>setNewLabel(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&addSegment()} maxLength={20}/>
          <button style={{background:'rgba(0,245,255,.1)',border:'1px solid rgba(0,245,255,.3)',color:'var(--cyan)',borderRadius:11,padding:'0 16px',cursor:'pointer',fontFamily:'var(--font-display)',fontSize:'1.1rem',flexShrink:0}}
            onClick={addSegment}>+</button>
        </div>
      </div>
    </div>
  );
}

// ── ROCK PAPER SCISSORS ──────────────────────────────────────────
function RPSTool({ onBack }){
  const [p1,setP1]=React.useState(null);
  const [p2,setP2]=React.useState(null);
  const [result,setResult]=React.useState(null);
  const [history,setHistory]=React.useState([]);
  const OPTIONS=[{id:'rock',label:'Piedra',emoji:'✊'},{id:'paper',label:'Papel',emoji:'🖐️'},{id:'scissors',label:'Tijera',emoji:'✌️'}];

  function resolve(a,b){
    if(a===b) return 'empate';
    if((a==='rock'&&b==='scissors')||(a==='paper'&&b==='rock')||(a==='scissors'&&b==='paper')) return 'p1';
    return 'p2';
  }

  function play(side,choice){
    if(side==='p1') setP1(choice);
    if(side==='p2') setP2(choice);
    const newP1=side==='p1'?choice:p1;
    const newP2=side==='p2'?choice:p2;
    if(newP1&&newP2){
      const r=resolve(newP1,newP2);
      setResult(r);
      setHistory(h=>[{p1:newP1,p2:newP2,result:r},...h].slice(0,6));
      snd(r==='empate'?'tap':r==='p1'?'up':'down');
    }
  }

  function reset(){ setP1(null);setP2(null);setResult(null); }

  const resultLabel=result==='empate'?'🤝 EMPATE':result==='p1'?'🏆 JUGADOR 1':'🏆 JUGADOR 2';
  const resultColor=result==='empate'?'var(--cyan)':result==='p1'?'var(--gold)':'var(--orange)';

  return(
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onBack}>← Herramientas</button>
        <div className="os-logo" style={{fontSize:'1.1rem'}}>✊ <span>PPS</span></div>
        <div style={{width:80}}/>
      </div>
      <div className="os-page" style={{paddingTop:16}}>

        {/* Resultado central */}
        {result&&(
          <div className="anim-pop" style={{
            textAlign:'center',background:`${resultColor}18`,
            border:`2px solid ${resultColor}44`,borderRadius:16,padding:'16px',marginBottom:20
          }}>
            <div style={{fontFamily:'var(--font-display)',fontSize:'2rem',letterSpacing:2,color:resultColor}}>{resultLabel}</div>
            <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-sm)',color:'rgba(255,255,255,.5)',marginTop:6}}>
              {OPTIONS.find(o=>o.id===p1)?.emoji} vs {OPTIONS.find(o=>o.id===p2)?.emoji}
            </div>
          </div>
        )}

        {/* Jugador 1 */}
        <div className="os-section">JUGADOR 1</div>
        <div style={{display:'flex',gap:8,marginBottom:16}}>
          {OPTIONS.map(o=>(
            <button key={o.id} onClick={()=>{snd('tap');play('p1',o.id);}}
              style={{
                flex:1,padding:'16px 8px',borderRadius:14,border:'none',cursor:'pointer',
                background:p1===o.id?'var(--cyan)':'rgba(255,255,255,.06)',
                color:p1===o.id?'var(--bg)':'rgba(255,255,255,.6)',
                fontFamily:'var(--font-body)',fontSize:'1.8rem',transition:'all .15s',
                boxShadow:p1===o.id?'var(--glow-c)':'none'
              }}>
              {o.emoji}
              <div style={{fontFamily:'var(--font-label)',fontSize:'.6rem',fontWeight:700,letterSpacing:1,marginTop:4}}>{o.label}</div>
            </button>
          ))}
        </div>

        {/* Jugador 2 */}
        <div className="os-section">JUGADOR 2</div>
        <div style={{display:'flex',gap:8,marginBottom:20}}>
          {OPTIONS.map(o=>(
            <button key={o.id} onClick={()=>{snd('tap');play('p2',o.id);}}
              style={{
                flex:1,padding:'16px 8px',borderRadius:14,border:'none',cursor:'pointer',
                background:p2===o.id?'var(--orange)':'rgba(255,255,255,.06)',
                color:p2===o.id?'white':'rgba(255,255,255,.6)',
                fontFamily:'var(--font-body)',fontSize:'1.8rem',transition:'all .15s',
                boxShadow:p2===o.id?'var(--glow-o)':'none'
              }}>
              {o.emoji}
              <div style={{fontFamily:'var(--font-label)',fontSize:'.6rem',fontWeight:700,letterSpacing:1,marginTop:4}}>{o.label}</div>
            </button>
          ))}
        </div>

        {result&&(
          <button className="btn btn-ghost" onClick={reset}>🔄 Nueva ronda</button>
        )}

        {history.length>0&&(
          <>
            <div className="os-section" style={{marginTop:16}}>HISTORIAL</div>
            {history.map((h,i)=>(
              <div key={i} style={{
                display:'flex',alignItems:'center',gap:10,
                background:'var(--surface)',border:'1px solid var(--border)',
                borderRadius:10,padding:'8px 12px',marginBottom:6
              }}>
                <div style={{fontFamily:'var(--font-body)',fontSize:'1.2rem'}}>{OPTIONS.find(o=>o.id===h.p1)?.emoji}</div>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.4)',flex:1,letterSpacing:1}}>vs</div>
                <div style={{fontFamily:'var(--font-body)',fontSize:'1.2rem'}}>{OPTIONS.find(o=>o.id===h.p2)?.emoji}</div>
                <div style={{fontFamily:'var(--font-display)',fontSize:'var(--fs-xs)',
                  color:h.result==='empate'?'var(--cyan)':h.result==='p1'?'var(--gold)':'var(--orange)',letterSpacing:1}}>
                  {h.result==='empate'?'EMPATE':h.result==='p1'?'J1':'J2'}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ── TOOLS HUB — menú de herramientas ────────────────────────────
function ToolsHub({ onBack, players }){
  const [activeTool,setActiveTool]=React.useState(null);

  if(activeTool==='coin')  return <CoinTool onBack={()=>setActiveTool(null)}/>;
  if(activeTool==='dice')  return <DiceTool onBack={()=>setActiveTool(null)}/>;
  if(activeTool==='wheel') return <SpinWheelTool onBack={()=>setActiveTool(null)} players={players}/>;
  if(activeTool==='rps')   return <RPSTool onBack={()=>setActiveTool(null)}/>;

  const tools=[
    {id:'coin',  emoji:'🪙',title:'Moneda',     desc:'Cara o cruz animado',              color:'var(--gold)'},
    {id:'dice',  emoji:'🎲',title:'Dados',       desc:'d4 · d6 · d8 · d10 · d12 · d20', color:'var(--cyan)'},
    {id:'wheel', emoji:'🎡',title:'Ruleta',      desc:'Spin wheel con segmentos custom',  color:'var(--orange)'},
    {id:'rps',   emoji:'✊',title:'Piedra Papel Tijera', desc:'Dos jugadores cara a cara', color:'var(--purple)'},
  ];

  return(
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onBack}>← Home</button>
        <div className="os-logo" style={{fontSize:'1.1rem'}}>🧰 <span>HERRAMIENTAS</span></div>
        <div style={{width:80}}/>
      </div>
      <div className="os-page" style={{paddingTop:16}}>
        <div style={{
          textAlign:'center',padding:'16px 0 20px',
          fontFamily:'var(--font-label)',fontSize:'var(--fs-sm)',fontWeight:600,
          color:'rgba(255,255,255,.4)',letterSpacing:1
        }}>
          Herramientas de apoyo para tus partidas
        </div>

        {tools.map((t,i)=>(
          <div key={t.id} className="os-card anim-fade" style={{
            animationDelay:i*.06+'s',
            borderColor:`${t.color}33`,
            background:`${t.color}0A`,
            cursor:'pointer'
          }} onClick={()=>{snd('tap');setActiveTool(t.id);}}>
            <div style={{display:'flex',alignItems:'center',gap:16}}>
              <div style={{
                fontSize:'2.5rem',width:64,height:64,borderRadius:16,
                display:'flex',alignItems:'center',justifyContent:'center',
                background:`${t.color}18`,border:`1px solid ${t.color}33`,flexShrink:0
              }}>{t.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:'var(--font-display)',fontSize:'1.2rem',letterSpacing:1,color:t.color}}>{t.title}</div>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.4)',letterSpacing:1,marginTop:3}}>{t.desc}</div>
              </div>
              <div style={{color:`${t.color}88`,fontSize:'1.5rem'}}>›</div>
            </div>
          </div>
        ))}

        {/* Juez IA - próximamente */}
        <div className="os-card" style={{opacity:.4,cursor:'default',borderColor:'rgba(255,255,255,.08)'}}>
          <div style={{display:'flex',alignItems:'center',gap:16}}>
            <div style={{fontSize:'2.5rem',width:64,height:64,borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',flexShrink:0}}>🤖</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:'var(--font-display)',fontSize:'1.2rem',letterSpacing:1,color:'rgba(255,255,255,.4)'}}>Juez IA</div>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.25)',letterSpacing:1,marginTop:3}}>Próximamente · Árbitro con IA</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
