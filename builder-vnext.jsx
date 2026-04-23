function PlayerPadPreview({ payload }){
  const runtime = payload?.runtime || {};
  const optimization = runtime.optimization || {};

  const actions = (runtime.playerActions || []).filter(a=>{
    if(optimization.hideAutoWinAction && a.id === 'add_win') return false;
    if(optimization.hideAutoDefeatAction && a.id === 'eliminate') return false;
    return true;
  });

  const registers = (runtime.registersResolved || [])
    .filter(r => !(optimization.hiddenRegisters || []).includes(r.id));

  return (
    <div>
      <h3>Pad jugador</h3>
      <div>
        {registers.map(r=> <div key={r.id}>{r.label}</div>)}
      </div>
      <div>
        {actions.map(a=> <button key={a.id}>{a.label}</button>)}
      </div>
    </div>
  );
}