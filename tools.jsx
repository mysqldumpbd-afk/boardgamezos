// ═══════════════════════════════════════════════════════════════
// tools.jsx — BOARDGAMEZ OS v1.5
// Moneda 3D, dados con puntos reales, ruleta con reveal central,
// PPS modo batalla simultánea
// ═══════════════════════════════════════════════════════════════

// ── COIN FLIP 3D ─────────────────────────────────────────────────
function CoinTool({onBack}){
  const [result,setResult]=React.useState(null);
  const [flipping,setFlipping]=React.useState(false);
  const [history,setHistory]=React.useState([]);
  const [flipClass,setFlipClass]=React.useState('');

  function flip(){
    if(flipping) return;
    snd('round');
    setFlipping(true);
    setResult(null);
    setFlipClass('coin-flipping');
    setTimeout(()=>{
      const r=Math.random()>.5?'CARA':'CRUZ';
      setResult(r);
      setFlipClass(r==='CARA'?'coin-heads':'coin-tails');
      setFlipping(false);
      setHistory(h=>[{r,ts:Date.now()},...h].slice(0,12));
      snd(r==='CARA'?'up':'down');
    },1000);
  }

  const headsCount=history.filter(h=>h.r==='CARA').length;
  const tailsCount=history.filter(h=>h.r==='CRUZ').length;

  return(
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onBack}>← Herramientas</button>
        <div className="os-logo" style={{fontSize:'1.1rem'}}>🪙 <span>MONEDA</span></div>
        <div style={{width:80}}/>
      </div>
      <div className="os-page" style={{paddingTop:20,textAlign:'center'}}>

        <style>{`
          .coin-scene{width:160px;height:160px;perspective:600px;margin:0 auto 24px;cursor:pointer}
          .coin-body{width:100%;height:100%;position:relative;transform-style:preserve-3d;transition:transform 0s;border-radius:50%}
          .coin-flipping .coin-body{animation:coinSpin3D 1s cubic-bezier(.4,0,.2,1) forwards}
          .coin-heads .coin-body{transform:rotateY(0deg)}
          .coin-tails .coin-body{transform:rotateY(180deg)}
          .coin-face,.coin-back{position:absolute;inset:0;border-radius:50%;backface-visibility:hidden;display:flex;align-items:center;justify-content:center;font-size:4.5rem;box-shadow:0 8px 32px rgba(0,0,0,.5),inset 0 2px 4px rgba(255,255,255,.3)}
          .coin-face{background:radial-gradient(circle at 35% 35%,#FFE066,#FFC200,#CC9500);border:4px solid #FFD700}
          .coin-back{background:radial-gradient(circle at 35% 35%,#ddd,#bbb,#888);border:4px solid #aaa;transform:rotateY(180deg)}
          @keyframes coinSpin3D{
            0%{transform:rotateY(0)}
            25%{transform:rotateY(720deg) rotateX(15deg)}
            60%{transform:rotateY(1440deg) rotateX(-8deg)}
            80%{transform:rotateY(1800deg) rotateX(4deg)}
            100%{transform:rotateY(${Math.random()>.5?'0':'180'}deg)}
          }
        `}</style>

        <div className={`coin-scene ${flipClass}`} onClick={()=>!flipping&&flip()}>
          <div className="coin-body">
            <div className="coin-face">👑</div>
            <div className="coin-back">⚡</div>
          </div>
        </div>

        {result&&!flipping&&(
          <div style={{
            fontFamily:'var(--font-display)',fontSize:'2.8rem',letterSpacing:4,
            color:result==='CARA'?'var(--gold)':'rgba(200,200,210,.9)',
            marginBottom:6,animation:'popIn .3s ease'
          }}>{result}</div>
        )}
        {flipping&&(
          <div style={{fontFamily:'var(--font-display)',fontSize:'1.5rem',color:'var(--cyan)',marginBottom:8,letterSpacing:2}}>
            LANZANDO...
          </div>
        )}
        {!result&&!flipping&&(
          <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-sm)',color:'rgba(255,255,255,.35)',letterSpacing:2,marginBottom:8}}>
            TOCA LA MONEDA O EL BOTÓN
          </div>
        )}

        <div className="g8"/>
        <button className="btn btn-gold" onClick={flip} disabled={flipping}>
          🪙 {flipping?'Lanzando...':'Lanzar moneda'}
        </button>

        {history.length>0&&(
          <>
            <div className="os-section" style={{marginTop:20}}>
              HISTORIAL · 👑 {headsCount} CARA / ⚡ {tailsCount} CRUZ
            </div>
            <div style={{display:'flex',gap:5,flexWrap:'wrap',justifyContent:'center'}}>
              {history.map((h,i)=>(
                <div key={i} style={{
                  width:36,height:36,borderRadius:'50%',
                  background:h.r==='CARA'?'radial-gradient(#FFE066,#FFC200)':'radial-gradient(#ddd,#999)',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:'.9rem',border:`2px solid ${h.r==='CARA'?'#FFD700':'#aaa'}`,
                  boxShadow:i===0?'0 0 12px rgba(255,212,0,.5)':'none'
                }}>
                  {h.r==='CARA'?'👑':'⚡'}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── DICE WITH REAL DOTS ──────────────────────────────────────────
function DiceDots({value,size=80,color='#fff',bg='transparent'}){
  // Posiciones de puntos para d6 estilo Google
  const DOT_LAYOUTS={
    1:[[50,50]],
    2:[[25,25],[75,75]],
    3:[[25,25],[50,50],[75,75]],
    4:[[25,25],[75,25],[25,75],[75,75]],
    5:[[25,25],[75,25],[50,50],[25,75],[75,75]],
    6:[[25,22],[75,22],[25,50],[75,50],[25,78],[75,78]],
  };
  const dots=DOT_LAYOUTS[value]||[];
  const dotR=size*.09;
  return(
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="4" y="4" width="92" height="92" rx="18" ry="18"
        fill={bg||'#1a1a2e'} stroke="rgba(255,255,255,.2)" strokeWidth="2"/>
      {dots.map((d,i)=>(
        <circle key={i} cx={d[0]} cy={d[1]} r={dotR*100/size} fill={color}/>
      ))}
    </svg>
  );
}

function DiceTool({onBack}){
  const [diceType,setDiceType]=React.useState('d6');
  const [result,setResult]=React.useState(null);
  const [rolling,setRolling]=React.useState(false);
  const [history,setHistory]=React.useState([]);
  const [numDice,setNumDice]=React.useState(1);
  const [shaking,setShaking]=React.useState(false);

  const DICE_FACES={'d4':4,'d6':6,'d8':8,'d10':10,'d12':12,'d20':20};

  function roll(){
    if(rolling) return;
    snd('round');
    setRolling(true);
    setShaking(true);
    setResult(null);
    setTimeout(()=>setShaking(false),600);
    setTimeout(()=>{
      const max=DICE_FACES[diceType];
      const rolls=Array.from({length:numDice},()=>Math.floor(Math.random()*max)+1);
      const total=rolls.reduce((a,b)=>a+b,0);
      setResult({rolls,total,type:diceType});
      setRolling(false);
      setHistory(h=>[{rolls,total,type:diceType},...h].slice(0,8));
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
        <style>{`
          @keyframes diceShake{
            0%,100%{transform:translate(0,0) rotate(0)}
            20%{transform:translate(-8px,4px) rotate(-12deg)}
            40%{transform:translate(8px,-4px) rotate(12deg)}
            60%{transform:translate(-6px,6px) rotate(-8deg)}
            80%{transform:translate(6px,-2px) rotate(8deg)}
          }
          .dice-shaking{animation:diceShake .6s ease}
        `}</style>

        <div className="os-section">TIPO</div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'center',marginBottom:16}}>
          {Object.keys(DICE_FACES).map(d=>(
            <button key={d} onClick={()=>{snd('tap');setDiceType(d);setResult(null);}}
              style={{
                padding:'8px 14px',borderRadius:10,border:'none',cursor:'pointer',
                fontFamily:'var(--font-display)',fontSize:'var(--fs-sm)',letterSpacing:1,
                background:diceType===d?'var(--cyan)':'rgba(255,255,255,.08)',
                color:diceType===d?'var(--bg)':'rgba(255,255,255,.6)',transition:'all .15s'
              }}>{d}</button>
          ))}
        </div>

        <div className="os-section">CANTIDAD</div>
        <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:24}}>
          {[1,2,3,4].map(n=>(
            <button key={n} onClick={()=>{snd('tap');setNumDice(n);setResult(null);}}
              style={{
                width:52,height:52,borderRadius:12,border:'none',cursor:'pointer',
                fontFamily:'var(--font-display)',fontSize:'1.2rem',
                background:numDice===n?'var(--orange)':'rgba(255,255,255,.08)',
                color:numDice===n?'white':'rgba(255,255,255,.6)',transition:'all .15s'
              }}>{n}</button>
          ))}
        </div>

        {/* Dados visuales */}
        <div style={{display:'flex',gap:12,justifyContent:'center',marginBottom:20,minHeight:100,alignItems:'center'}}>
          {rolling?(
            Array.from({length:numDice}).map((_,i)=>(
              <div key={i} className="dice-shaking" style={{animationDelay:i*.1+'s'}}>
                <DiceDots value={Math.floor(Math.random()*6)+1} size={80} color='rgba(0,245,255,.5)'/>
              </div>
            ))
          ):result?(
            result.rolls.map((r,i)=>(
              <div key={i} className="anim-pop" style={{animationDelay:i*.08+'s',
                filter:i===0&&result.rolls[i]===DICE_FACES[diceType]?'drop-shadow(0 0 12px gold)':'none'}}>
                {diceType==='d6'?(
                  <DiceDots value={r} size={80} color='var(--cyan)'/>
                ):(
                  <div style={{
                    width:80,height:80,borderRadius:16,
                    background:'#1a1a2e',border:'2px solid rgba(255,255,255,.2)',
                    display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'
                  }}>
                    <div style={{fontFamily:'var(--font-display)',fontSize:'2.2rem',color:'var(--cyan)'}}>{r}</div>
                    <div style={{fontFamily:'var(--font-label)',fontSize:'.55rem',color:'rgba(255,255,255,.4)',letterSpacing:1}}>{diceType}</div>
                  </div>
                )}
              </div>
            ))
          ):(
            <div style={{opacity:.3}}>
              <DiceDots value={6} size={80} color='rgba(255,255,255,.5)'/>
            </div>
          )}
        </div>

        {result&&(
          <div style={{marginBottom:16}}>
            {numDice>1&&(
              <div style={{fontFamily:'var(--font-display)',fontSize:'2.5rem',color:'var(--gold)',marginBottom:4}}>
                {result.total} total
              </div>
            )}
            <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-sm)',color:'rgba(255,255,255,.5)',letterSpacing:1}}>
              {numDice>1?`[${result.rolls.join(' + ')}]`:diceType}
            </div>
          </div>
        )}

        <button className="btn btn-cyan" onClick={roll} disabled={rolling}>
          🎲 {rolling?'Lanzando...':'Tirar dado'}
        </button>

        {history.length>0&&(
          <>
            <div className="os-section" style={{marginTop:20}}>ÚLTIMAS TIRADAS</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center'}}>
              {history.map((h,i)=>(
                <div key={i} style={{
                  padding:'6px 12px',borderRadius:10,
                  background:'rgba(0,245,255,.08)',border:'1px solid rgba(0,245,255,.2)',
                  fontFamily:'var(--font-display)',fontSize:'var(--fs-sm)',color:'var(--cyan)',letterSpacing:1
                }}>
                  {h.total}<span style={{fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.3)',marginLeft:4}}>{h.type}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── SPIN WHEEL with center reveal ────────────────────────────────
function SpinWheelTool({onBack,players}){
  const [spinning,setSpinning]=React.useState(false);
  const [result,setResult]=React.useState(null);
  const [showResult,setShowResult]=React.useState(false);
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

  React.useEffect(()=>{drawWheel();},[segments,rotation]);

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
      ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,start,end);ctx.closePath();
      ctx.fillStyle=seg.color||'#00F5FF';ctx.globalAlpha=.9;ctx.fill();
      ctx.globalAlpha=1;ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=2;ctx.stroke();
      ctx.save();ctx.translate(cx,cy);ctx.rotate(start+arc/2);
      ctx.textAlign='right';ctx.fillStyle='rgba(0,0,0,.8)';
      ctx.font=`bold ${Math.max(11,Math.min(14,200/n))}px "Exo 2",sans-serif`;
      ctx.fillText(seg.emoji+' '+seg.label,r-10,5);ctx.restore();
    });
    // Center ring
    ctx.beginPath();ctx.arc(cx,cy,22,0,2*Math.PI);
    ctx.fillStyle='#080810';ctx.fill();
    ctx.strokeStyle='rgba(0,245,255,.6)';ctx.lineWidth=3;ctx.stroke();
    // Pointer
    ctx.beginPath();ctx.moveTo(cx,cy-r+2);ctx.lineTo(cx-13,cy-r-20);ctx.lineTo(cx+13,cy-r-20);
    ctx.closePath();ctx.fillStyle='#FF3B5C';ctx.shadowColor='rgba(255,59,92,.8)';ctx.shadowBlur=8;ctx.fill();
    ctx.shadowBlur=0;
  }

  function spin(){
    if(spinning||segments.length<2) return;
    snd('round');
    setSpinning(true);setResult(null);setShowResult(false);
    const extra=Math.PI*2*(6+Math.random()*4);
    const duration=3500;
    const start=Date.now();
    const startRot=rotation;
    const tick=()=>{
      const elapsed=Date.now()-start;
      if(elapsed>=duration){
        const finalRot=startRot+extra;
        setRotation(finalRot);
        const n=segments.length,arc=(2*Math.PI)/n;
        const norm=(((-(finalRot-(Math.PI/2)))%(2*Math.PI))+2*Math.PI)%(2*Math.PI);
        const idx=Math.floor(norm/arc)%n;
        setResult(segments[idx]);
        setSpinning(false);
        snd('winner');
        setTimeout(()=>setShowResult(true),200);
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
    const colors=['#00F5FF','#FF6B35','#FFD447','#9B5DE5','#00FF9D','#FF3B5C','#4A90FF','#FFD447'];
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

        {/* Resultado al centro — overlay dramático */}
        {showResult&&result&&(
          <div style={{
            position:'fixed',inset:0,zIndex:999,
            background:'rgba(0,0,0,.85)',backdropFilter:'blur(8px)',
            display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
            cursor:'pointer'
          }} onClick={()=>setShowResult(false)}>
            <div className="anim-pop" style={{textAlign:'center',padding:40}}>
              <div style={{fontSize:'6rem',marginBottom:16,animation:'trophyFloat 1.5s ease infinite'}}>{result.emoji}</div>
              <div style={{
                fontFamily:'var(--font-display)',fontSize:'2.5rem',letterSpacing:3,
                color:result.color||'var(--cyan)',marginBottom:8,
                textShadow:`0 0 30px ${result.color||'var(--cyan)'}`
              }}>{result.label}!</div>
              <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-sm)',color:'rgba(255,255,255,.4)',letterSpacing:2}}>
                TOCA PARA CONTINUAR
              </div>
            </div>
          </div>
        )}

        <div style={{position:'relative',margin:'0 auto 16px',width:280,height:280}}>
          <canvas ref={canvasRef} width={280} height={280}
            style={{borderRadius:'50%',border:'3px solid rgba(0,245,255,.3)',
              boxShadow:'0 0 40px rgba(0,245,255,.15)',cursor:spinning?'default':'pointer'}}
            onClick={()=>!spinning&&spin()}/>
        </div>

        <button className="btn btn-cyan" onClick={spin} disabled={spinning||segments.length<2}>
          🎡 {spinning?'Girando...':'Girar ruleta'}
        </button>

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

// ── ROCK PAPER SCISSORS — Batalla simultánea ─────────────────────
function RPSTool({onBack}){
  const [p1,setP1]=React.useState(null);
  const [p2,setP2]=React.useState(null);
  const [phase,setPhase]=React.useState('choose'); // choose | reveal | result
  const [countdown,setCountdown]=React.useState(null);
  const [history,setHistory]=React.useState([]);

  const OPTIONS=[
    {id:'rock',    label:'Piedra', emoji:'✊', beats:'scissors'},
    {id:'paper',   label:'Papel',  emoji:'🖐️',beats:'rock'},
    {id:'scissors',label:'Tijera', emoji:'✌️', beats:'paper'},
  ];

  function choose(side,choice){
    if(phase!=='choose') return;
    snd('tap');
    if(side==='p1') setP1(choice);
    if(side==='p2') setP2(choice);
  }

  React.useEffect(()=>{
    if(p1&&p2&&phase==='choose'){
      // Countdown 3-2-1
      setPhase('reveal');
      let count=3;
      setCountdown(count);
      const iv=setInterval(()=>{
        count--;
        if(count>0){ setCountdown(count); snd('tap'); }
        else{
          clearInterval(iv);
          setCountdown(null);
          setPhase('result');
          const res=resolve(p1,p2);
          setHistory(h=>[{p1,p2,result:res},...h].slice(0,6));
          snd(res==='tie'?'tap':res==='p1'?'up':'down');
        }
      },700);
    }
  },[p1,p2]);

  function resolve(a,b){
    if(a===b) return 'tie';
    const ao=OPTIONS.find(o=>o.id===a);
    return ao.beats===b?'p1':'p2';
  }

  function reset(){ setP1(null);setP2(null);setPhase('choose');setCountdown(null); }

  const result=phase==='result'?resolve(p1,p2):null;
  const resultLabel=result==='tie'?'🤝 EMPATE':result==='p1'?'🏆 JUGADOR 1 GANA':'🏆 JUGADOR 2 GANA';
  const resultColor=result==='tie'?'var(--cyan)':result==='p1'?'var(--gold)':'var(--orange)';

  return(
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onBack}>← Herramientas</button>
        <div className="os-logo" style={{fontSize:'1.1rem'}}>✊ <span>PPS</span></div>
        <div style={{width:80}}/>
      </div>
      <div className="os-page" style={{paddingTop:16}}>

        {/* Countdown overlay */}
        {phase==='reveal'&&countdown&&(
          <div style={{
            position:'fixed',inset:0,zIndex:900,background:'rgba(0,0,0,.9)',
            display:'flex',alignItems:'center',justifyContent:'center'
          }}>
            <div style={{
              fontFamily:'var(--font-display)',fontSize:'10rem',color:'var(--cyan)',
              animation:'counterPop .4s cubic-bezier(.34,1.56,.64,1)',
              textShadow:'0 0 60px rgba(0,245,255,.8)'
            }}>{countdown}</div>
          </div>
        )}

        {/* Resultado */}
        {phase==='result'&&(
          <div className="anim-pop" style={{
            textAlign:'center',
            background:`${resultColor}15`,
            border:`2px solid ${resultColor}44`,
            borderRadius:18,padding:'20px 16px',marginBottom:20
          }}>
            <div style={{
              fontFamily:'var(--font-display)',fontSize:'2.2rem',letterSpacing:2,
              color:resultColor,marginBottom:12
            }}>{resultLabel}</div>

            {/* Reveal lado a lado */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:20,marginBottom:12}}>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:'4rem',marginBottom:4}}>{OPTIONS.find(o=>o.id===p1)?.emoji}</div>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'var(--cyan)',letterSpacing:1}}>J1</div>
              </div>
              <div style={{fontFamily:'var(--font-display)',fontSize:'1.5rem',color:'rgba(255,255,255,.3)'}}>VS</div>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:'4rem',marginBottom:4}}>{OPTIONS.find(o=>o.id===p2)?.emoji}</div>
                <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'var(--orange)',letterSpacing:1}}>J2</div>
              </div>
            </div>

            <button className="btn btn-ghost btn-sm" style={{margin:'0 auto',display:'block'}} onClick={reset}>
              🔄 Nueva ronda
            </button>
          </div>
        )}

        {/* Instrucción */}
        {phase==='choose'&&(
          <div style={{
            fontFamily:'var(--font-label)',fontSize:'var(--fs-sm)',fontWeight:700,
            color:'rgba(255,255,255,.4)',textAlign:'center',letterSpacing:2,marginBottom:16
          }}>
            {!p1&&!p2?'AMBOS ELIGEN AL MISMO TIEMPO':
             p1&&!p2?'J1 LISTO · ESPERANDO J2...':
             !p1&&p2?'J2 LISTO · ESPERANDO J1...':
             'LISTOS...'}
          </div>
        )}

        {/* Jugador 1 */}
        {(phase==='choose'||(!p1&&phase==='choose'))&&(
          <>
            <div className="os-section" style={{color:'var(--cyan)'}}>
              JUGADOR 1 {p1&&phase==='choose'?'✓ LISTO':''}
            </div>
            <div style={{display:'flex',gap:8,marginBottom:20}}>
              {OPTIONS.map(o=>(
                <button key={o.id} onClick={()=>choose('p1',o.id)}
                  disabled={!!p1||phase!=='choose'}
                  style={{
                    flex:1,padding:'18px 6px',borderRadius:14,border:'none',cursor:p1?'default':'pointer',
                    background:p1===o.id?'rgba(0,245,255,.3)':p1?'rgba(255,255,255,.04)':'rgba(255,255,255,.07)',
                    color:p1===o.id?'var(--cyan)':'rgba(255,255,255,.6)',
                    fontFamily:'var(--font-body)',fontSize:'2rem',transition:'all .15s',
                    filter:p1&&p1!==o.id?'blur(8px)':'none'
                  }}>
                  {p1===o.id?o.emoji:'?'}
                  <div style={{fontFamily:'var(--font-label)',fontSize:'.6rem',fontWeight:700,letterSpacing:1,marginTop:4,filter:'none'}}>
                    {p1===o.id?o.label:'???'}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Jugador 2 */}
        <div className="os-section" style={{color:'var(--orange)'}}>
          JUGADOR 2 {p2&&phase==='choose'?'✓ LISTO':''}
        </div>
        <div style={{display:'flex',gap:8,marginBottom:24}}>
          {OPTIONS.map(o=>(
            <button key={o.id} onClick={()=>choose('p2',o.id)}
              disabled={!!p2||phase!=='choose'}
              style={{
                flex:1,padding:'18px 6px',borderRadius:14,border:'none',cursor:p2?'default':'pointer',
                background:p2===o.id?'rgba(255,107,53,.3)':p2?'rgba(255,255,255,.04)':'rgba(255,255,255,.07)',
                color:p2===o.id?'var(--orange)':'rgba(255,255,255,.6)',
                fontFamily:'var(--font-body)',fontSize:'2rem',transition:'all .15s',
                filter:p2&&p2!==o.id?'blur(8px)':'none'
              }}>
              {p2===o.id?o.emoji:'?'}
              <div style={{fontFamily:'var(--font-label)',fontSize:'.6rem',fontWeight:700,letterSpacing:1,marginTop:4,filter:'none'}}>
                {p2===o.id?o.label:'???'}
              </div>
            </button>
          ))}
        </div>

        {/* Historial */}
        {history.length>0&&(
          <>
            <div className="os-section">HISTORIAL</div>
            {history.map((h,i)=>(
              <div key={i} style={{
                display:'flex',alignItems:'center',gap:10,
                background:'var(--surface)',border:'1px solid var(--border)',
                borderRadius:10,padding:'8px 12px',marginBottom:6
              }}>
                <div style={{fontSize:'1.3rem'}}>{OPTIONS.find(o=>o.id===h.p1)?.emoji}</div>
                <div style={{flex:1,fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:'rgba(255,255,255,.4)',letterSpacing:1,textAlign:'center'}}>vs</div>
                <div style={{fontSize:'1.3rem'}}>{OPTIONS.find(o=>o.id===h.p2)?.emoji}</div>
                <div style={{fontFamily:'var(--font-display)',fontSize:'var(--fs-xs)',
                  color:h.result==='tie'?'var(--cyan)':h.result==='p1'?'var(--gold)':'var(--orange)',letterSpacing:1,minWidth:32,textAlign:'right'}}>
                  {h.result==='tie'?'TIE':h.result==='p1'?'J1':'J2'}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ── COUNTER TOOL ─────────────────────────────────────────────────
function CounterTool({onBack}){
  const [counters,setCounters]=React.useState([
    {id:'c1',label:'Contador 1',value:0,color:'var(--green)'},
  ]);
  const [newLabel,setNewLabel]=React.useState('');

  function change(id,delta){
    snd('tap');
    setCounters(cs=>cs.map(c=>c.id===id?{...c,value:c.value+delta}:c));
  }
  function reset(id){
    snd('tap');
    setCounters(cs=>cs.map(c=>c.id===id?{...c,value:0}:c));
  }
  function addCounter(){
    if(!newLabel.trim()) return;
    snd('join');
    const colors=['var(--green)','var(--cyan)','var(--gold)','var(--purple)','var(--orange)','var(--red)'];
    setCounters(cs=>[...cs,{id:'c'+Date.now(),label:newLabel.trim(),value:0,color:colors[cs.length%colors.length]}]);
    setNewLabel('');
  }

  return(
    <div className="os-wrap">
      <div className="os-header">
        <button className="btn btn-ghost btn-sm" style={{width:'auto'}} onClick={onBack}>← Herramientas</button>
        <div className="os-logo" style={{fontSize:'1.1rem'}}>🔢 <span>CONTADOR</span></div>
        <div style={{width:80}}/>
      </div>
      <div className="os-page" style={{paddingTop:16}}>
        <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-xs)',color:'rgba(255,255,255,.4)',marginBottom:16,textAlign:'center'}}>
          Contador de apoyo · Vidas, maná, recursos, monedas...
        </div>

        {counters.map(c=>(
          <div key={c.id} style={{
            background:`${c.color}08`,border:`1px solid ${c.color}33`,
            borderRadius:16,padding:'16px',marginBottom:12,textAlign:'center'
          }}>
            <div style={{fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',color:c.color,letterSpacing:2,marginBottom:8}}>
              {c.label.toUpperCase()}
            </div>
            <div style={{fontFamily:'var(--font-display)',fontSize:'4rem',color:c.color,
              textShadow:`0 0 20px ${c.color}66`,margin:'8px 0',lineHeight:1}}>
              {c.value}
            </div>
            <div style={{display:'flex',gap:10,justifyContent:'center',marginTop:12}}>
              <button onClick={()=>change(c.id,-1)}
                style={{width:56,height:56,borderRadius:14,border:`1px solid ${c.color}44`,
                  background:`${c.color}15`,color:c.color,cursor:'pointer',
                  fontFamily:'var(--font-display)',fontSize:'1.8rem',transition:'all .15s'}}>
                −
              </button>
              <button onClick={()=>reset(c.id)}
                style={{width:56,height:56,borderRadius:14,border:'1px solid rgba(255,255,255,.1)',
                  background:'rgba(255,255,255,.05)',color:'rgba(255,255,255,.4)',cursor:'pointer',
                  fontFamily:'var(--font-label)',fontSize:'var(--fs-micro)',fontWeight:700,letterSpacing:1}}>
                RST
              </button>
              <button onClick={()=>change(c.id,1)}
                style={{width:56,height:56,borderRadius:14,border:`1px solid ${c.color}44`,
                  background:`${c.color}15`,color:c.color,cursor:'pointer',
                  fontFamily:'var(--font-display)',fontSize:'1.8rem',transition:'all .15s'}}>
                +
              </button>
            </div>
          </div>
        ))}

        {counters.length<5&&(
          <div style={{display:'flex',gap:8,marginTop:4}}>
            <input className="os-input" style={{marginBottom:0,flex:1}}
              placeholder="Nombre del contador..." value={newLabel}
              onChange={e=>setNewLabel(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&addCounter()} maxLength={20}/>
            <button style={{background:'rgba(0,255,157,.1)',border:'1px solid rgba(0,255,157,.3)',
              color:'var(--green)',borderRadius:11,padding:'0 16px',cursor:'pointer',
              fontFamily:'var(--font-display)',fontSize:'1.1rem',flexShrink:0}}
              onClick={addCounter}>+</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── TOOLS HUB ────────────────────────────────────────────────────
function ToolsHub({onBack,players}){
  const [activeTool,setActiveTool]=React.useState(null);
  if(activeTool==='coin')    return <CoinTool onBack={()=>setActiveTool(null)}/>;
  if(activeTool==='dice')    return <DiceTool onBack={()=>setActiveTool(null)}/>;
  if(activeTool==='wheel')   return <SpinWheelTool onBack={()=>setActiveTool(null)} players={players}/>;
  if(activeTool==='rps')     return <RPSTool onBack={()=>setActiveTool(null)}/>;
  if(activeTool==='counter') return <CounterTool onBack={()=>setActiveTool(null)}/>;

  const tools=[
    {id:'coin',    emoji:'🪙',title:'Moneda',             desc:'Cara o cruz animado',                color:'var(--gold)'},
    {id:'dice',    emoji:'🎲',title:'Dados',               desc:'d4 · d6 · d8 · d10 · d12 · d20',   color:'var(--cyan)'},
    {id:'wheel',   emoji:'🎡',title:'Ruleta',              desc:'Spin wheel con segmentos custom',    color:'var(--orange)'},
    {id:'rps',     emoji:'✊',title:'Piedra Papel Tijera', desc:'Batalla simultánea · 3-2-1',         color:'var(--purple)'},
    {id:'counter', emoji:'🔢',title:'Contador',            desc:'Vidas · Maná · Recursos · Fichas',  color:'var(--green)'},
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
            borderColor:`${t.color}33`,background:`${t.color}0A`,cursor:'pointer'
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

