// ═══════════════════════════════════════════════════════════════
// runtime-resolver.js — BOARDGAMEZ OS
// Resuelve objetos de partida, registros y optimizaciones por tipo
// ═══════════════════════════════════════════════════════════════

window.RuntimeResolver = (function(){

  function _playObjects(config){
    return Array.isArray(config?.playObjects) ? config.playObjects : [];
  }

  function _normalizedVictoryMode(config){
    return config?.victoryMode === 'elim'
      ? 'elimination'
      : (config?.victoryMode || 'points');
  }

  function resolveRegisters(config){
    const out = [];
    const seen = new Set();
    const victoryMode = _normalizedVictoryMode(config);

    function pushRegister(reg){
      if(!reg || !reg.id || seen.has(reg.id)) return;
      seen.add(reg.id);
      out.push(reg);
    }

    let registers = Array.isArray(config?.registers) ? [...config.registers] : [];
    if(victoryMode === 'elimination'){
      registers = registers.filter(id => id !== 'points' && id !== 'wins');
    }

    registers.forEach(id=>{
      pushRegister({
        id,
        label: String(id).toUpperCase(),
        kind: 'core_register',
        scope: 'player',
        initialValue: 0
      });
    });

    (Array.isArray(config?.counterSet) ? config.counterSet : []).forEach(counter=>{
      pushRegister({
        id: counter.id,
        label: counter.label,
        icon: counter.icon,
        color: counter.color,
        kind: 'counter',
        scope: counter.scope || 'player',
        initialValue: counter.initialValue ?? 0,
        min: counter.min ?? 0,
        max: counter.max ?? null,
        resetOn: counter.resetOn || 'never',
        visibleTo: counter.visibleTo || 'all'
      });
    });

    const target = config?.scoreInputTarget;
    if(target && target !== 'custom' && !seen.has(target) && victoryMode !== 'elimination'){
      pushRegister({
        id: target,
        label: String(target).toUpperCase(),
        kind: 'derived_register',
        scope: 'player',
        initialValue: 0
      });
    }

    return out;
  }

  function resolvePlayObjects(config){
    const playObjects = _playObjects(config);
    const visibleTo = config?.objectControlScope || 'host';
    const out = [];

    if(playObjects.includes('victory_button')){
      out.push({
        id: 'victory_button',
        kind: 'action_button',
        label: config?.victoryButtonLabel || 'Gané',
        scope: config?.victoryButtonScope || 'round',
        visibleTo,
        action: 'mark_victory'
      });
    }

    if(playObjects.includes('defeat_button')){
      out.push({
        id: 'defeat_button',
        kind: 'action_button',
        label: config?.defeatButtonLabel || 'Perdí',
        scope: config?.defeatButtonScope || 'round',
        visibleTo,
        action: 'mark_defeat'
      });
    }

    if(playObjects.includes('score_input')){
      out.push({
        id: 'score_input',
        kind: 'numeric_input',
        label: config?.scoreInputLabel || 'Capturar',
        target: config?.scoreInputTarget || 'points',
        allowNegative: !!config?.scoreInputAllowNegative,
        quickValues: Array.isArray(config?.scoreInputQuickValues) ? config.scoreInputQuickValues : [],
        visibleTo
      });
    }

    if(playObjects.includes('counter_set')){
      out.push({
        id: 'counter_set',
        kind: 'counter_panel',
        counters: Array.isArray(config?.counterSet) ? config.counterSet : [],
        visibleTo
      });
    }

    if(playObjects.includes('round_resolution_popup')){
      out.push({
        id: 'round_resolution_popup',
        kind: 'resolution_popup',
        fields: Array.isArray(config?.roundResolutionFields) ? config.roundResolutionFields : [],
        visibleTo
      });
    }

    ['first_player_token','coin_tool','dice_tool','wheel_tool','timer_match','timer_round','timer_turn']
      .forEach(id=>{
        if(playObjects.includes(id)){
          out.push({
            id,
            kind: 'utility',
            visibleTo
          });
        }
      });

    return out;
  }

  function resolveResultActions(config){
    return (Array.isArray(config?.resultActions) ? config.resultActions : []).map((item, idx)=>({
      id: item.id || `result_${idx+1}`,
      label: item.label || `Resultado ${idx+1}`,
      icon: item.icon || '🏁',
      color: item.color || '#00FF9D',
      scope: item.scope || 'round',
      target: item.target || 'self',
      effect: item.effect || 'record_only',
      visibleTo: item.visibleTo || 'all',
      prompt: item.prompt || ''
    }));
  }

  function resolveCaptureActions(config){
    return (Array.isArray(config?.captureActions) ? config.captureActions : []).map((item, idx)=>({
      id: item.id || `capture_${idx+1}`,
      label: item.label || `Captura ${idx+1}`,
      icon: item.icon || '📝',
      color: item.color || '#FFD447',
      captureType: item.captureType || 'number',
      targetRegister: item.targetRegister || 'points',
      min: item.min ?? 0,
      max: item.max ?? null,
      quickValues: Array.isArray(item.quickValues) ? item.quickValues : [],
      visibleTo: item.visibleTo || 'host',
      askAt: item.askAt || 'manual',
      options: Array.isArray(item.options) ? item.options : []
    }));
  }

  function resolveStatusIndicators(config){
    return (Array.isArray(config?.statusIndicators) ? config.statusIndicators : []).map((item, idx)=>({
      id: item.id || `status_${idx+1}`,
      label: item.label || `Estado ${idx+1}`,
      icon: item.icon || '🛡️',
      color: item.color || '#4A90FF',
      scope: item.scope || 'player',
      visibility: item.visibility || 'all',
      mode: item.mode || 'toggle',
      defaultValue: !!item.defaultValue,
      durationMode: item.durationMode || 'manual',
      clearOn: item.clearOn || 'none'
    }));
  }

  function resolveRoundQuestions(config){
    return (Array.isArray(config?.roundQuestions) ? config.roundQuestions : []).map((item, idx)=>({
      id: item.id || `question_${idx+1}`,
      label: item.label || `Pregunta ${idx+1}`,
      inputType: item.inputType || 'select',
      options: Array.isArray(item.options) ? item.options : [],
      required: item.required !== false,
      saveAs: item.saveAs || `question_${idx+1}`,
      visibleTo: item.visibleTo || 'host',
      min: item.min ?? 0,
      max: item.max ?? null
    }));
  }

  function resolveAutoBehaviors(config){
    return (Array.isArray(config?.autoBehaviors) ? config.autoBehaviors : []).map((item, idx)=>({
      id: item.id || `behavior_${idx+1}`,
      trigger: item.trigger || '',
      condition: item.condition || '',
      effect: item.effect || '',
      enabled: item.enabled !== false,
      clearAfter: !!item.clearAfter,
      label: item.label || item.effect || `Regla ${idx+1}`
    }));
  }

  function resolveDerivedRules(config){
    const rules = [];
    const playObjects = _playObjects(config);

    if(config?.trackFinancials && !playObjects.includes('round_resolution_popup') && !config?.useRoundResolution){
      rules.push({
        type: 'warning_rule',
        id: 'financials_requires_round_popup'
      });
    }

    if((config?.scoreInputTarget === 'lives' || _normalizedVictoryMode(config) === 'lives') && !(Array.isArray(config?.counterSet) && config.counterSet.length)){
      rules.push({
        type: 'suggestion_rule',
        id: 'lives_counter_missing'
      });
    }

    return rules;
  }

  function _hasCustomEffect(actions, effects){
    return actions.some(a => effects.includes(a.effect));
  }

  function resolveOptimization(config, resolved){
    const victoryMode = _normalizedVictoryMode(config);
    const resultActions = resolved.resultActionsResolved || [];
    const roundQuestions = resolved.roundQuestionsResolved || [];
    const captureActions = resolved.captureActionsResolved || [];
    const hiddenRegisters = [];
    const warnings = [];

    const hideAutoWinAction = victoryMode === 'elimination' || _hasCustomEffect(resultActions, ['mark_victory']);
    const hideAutoDefeatAction = _hasCustomEffect(resultActions, ['mark_out', 'mark_defeat']);

    if(victoryMode === 'elimination'){
      hiddenRegisters.push('points', 'wins');
    }

    const roundQuestionKeys = new Set(roundQuestions.map(q => String(q.saveAs || '').toLowerCase()));
    captureActions.forEach(c=>{
      const target = String(c.targetRegister || '').toLowerCase();
      if(target && roundQuestionKeys.has(target)){
        warnings.push(`La captura "${c.label}" puede estar duplicada por una pregunta de cierre.`);
      }
    });

    return {
      hideAutoWinAction,
      hideAutoDefeatAction,
      hiddenRegisters: Array.from(new Set(hiddenRegisters)),
      warnings
    };
  }

  function resolveRuntime(config){
    const base = {
      registersResolved: resolveRegisters(config),
      playObjectsResolved: resolvePlayObjects(config),
      resultActionsResolved: resolveResultActions(config),
      captureActionsResolved: resolveCaptureActions(config),
      statusIndicatorsResolved: resolveStatusIndicators(config),
      roundQuestionsResolved: resolveRoundQuestions(config),
      autoBehaviorsResolved: resolveAutoBehaviors(config),
      derivedRules: resolveDerivedRules(config)
    };

    return {
      ...base,
      optimization: resolveOptimization(config, base)
    };
  }

  return {
    resolveRegisters,
    resolvePlayObjects,
    resolveResultActions,
    resolveCaptureActions,
    resolveStatusIndicators,
    resolveRoundQuestions,
    resolveAutoBehaviors,
    resolveDerivedRules,
    resolveRuntime
  };
})();
