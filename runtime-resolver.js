window.RuntimeResolver = (function(){
  function normalizeVictoryMode(config){
    return config?.victoryMode === 'elim'
      ? 'elimination'
      : (config?.victoryMode || 'points');
  }

  function resolveOptimization(config, runtime){
    const victoryMode = normalizeVictoryMode(config);
    const optimization = {
      hiddenRegisters: [],
      hideAutoWinAction: false,
      hideAutoDefeatAction: false
    };

    if(victoryMode === 'elimination'){
      optimization.hiddenRegisters.push('points','wins');
      optimization.hideAutoWinAction = true;
    }

    const hasCustomOut = (runtime.resultActionsResolved || [])
      .some(a => a.effect === 'mark_out');

    if(hasCustomOut){
      optimization.hideAutoDefeatAction = true;
    }

    return optimization;
  }

  function resolveRuntime(config){
    const runtime = {
      registersResolved: (config.registers || []).map(id => ({id,label:id.toUpperCase()})),
      playerActions: [],
      resultActionsResolved: config.resultActions || [],
      captureActionsResolved: config.captureActions || [],
      statusIndicatorsResolved: config.statusIndicators || [],
      roundQuestionsResolved: config.roundQuestions || [],
      autoBehaviorsResolved: config.autoBehaviors || []
    };

    runtime.optimization = resolveOptimization(config, runtime);
    return runtime;
  }

  return { resolveRuntime };
})();