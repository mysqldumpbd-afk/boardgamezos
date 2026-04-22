// ═══════════════════════════════════════════════════════════════
// runtime-resolver.js — BOARDGAMEZ OS
// Resuelve objetos de partida y registros derivados desde config
// ═══════════════════════════════════════════════════════════════

window.RuntimeResolver = (function(){

  function _playObjects(config){
    return Array.isArray(config?.playObjects) ? config.playObjects : [];
  }

  function resolveRegisters(config){
    const out = [];
    const seen = new Set();

    function pushRegister(reg){
      if(!reg || !reg.id || seen.has(reg.id)) return;
      seen.add(reg.id);
      out.push(reg);
    }

    (Array.isArray(config?.registers) ? config.registers : []).forEach(id=>{
      pushRegister({
        id,
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
    if(target && target !== 'custom' && !seen.has(target)){
      pushRegister({
        id: target,
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
    const visibleTo = config?.objectControlScope || 'host';
    return (Array.isArray(config?.resultActions) ? config.resultActions : []).map(action => ({
      id: action.id,
      kind: 'result_action',
      label: action.label,
      icon: action.icon,
      color: action.color,
      scope: action.scope || 'round',
      target: action.target || 'self',
      effect: action.effect || 'record_only',
      visibleTo: action.visibleTo || visibleTo,
      isPrimary: action.isPrimary !== false,
      prompt: action.prompt || ''
    }));
  }

  function resolveCaptureActions(config){
    const visibleTo = config?.objectControlScope || 'host';
    return (Array.isArray(config?.captureActions) ? config.captureActions : []).map(action => ({
      id: action.id,
      kind: 'capture_action',
      label: action.label,
      icon: action.icon,
      color: action.color,
      captureType: action.captureType || 'number',
      targetRegister: action.targetRegister || 'points',
      min: action.min ?? 0,
      max: action.max ?? null,
      quickValues: Array.isArray(action.quickValues) ? action.quickValues : [],
      visibleTo: action.visibleTo || visibleTo,
      askAt: action.askAt || 'manual',
      options: Array.isArray(action.options) ? action.options : []
    }));
  }

  function resolveStatusIndicators(config){
    return (Array.isArray(config?.statusIndicators) ? config.statusIndicators : []).map(status => ({
      id: status.id,
      kind: 'status_indicator',
      label: status.label,
      icon: status.icon,
      color: status.color,
      scope: status.scope || 'player',
      visibility: status.visibility || 'all',
      mode: status.mode || 'toggle',
      defaultValue: !!status.defaultValue,
      durationMode: status.durationMode || 'manual',
      clearOn: status.clearOn || 'none'
    }));
  }

  function resolveRoundQuestions(config){
    return (Array.isArray(config?.roundQuestions) ? config.roundQuestions : []).map(question => ({
      id: question.id,
      kind: 'round_question',
      label: question.label,
      inputType: question.inputType || 'select',
      options: Array.isArray(question.options) ? question.options : [],
      required: question.required !== false,
      saveAs: question.saveAs || question.id,
      visibleTo: question.visibleTo || 'host',
      min: question.min ?? 0,
      max: question.max ?? null
    }));
  }

  function resolveAutoBehaviors(config){
    return (Array.isArray(config?.autoBehaviors) ? config.autoBehaviors : []).filter(x => x?.enabled !== false).map(behavior => ({
      id: behavior.id,
      kind: 'auto_behavior',
      trigger: behavior.trigger || 'manual',
      condition: behavior.condition || 'always',
      effect: behavior.effect || 'record_only',
      enabled: behavior.enabled !== false,
      clearAfter: !!behavior.clearAfter,
      label: behavior.label || ''
    }));
  }

  function resolveDerivedRules(config){
    const rules = [];
    const playObjects = _playObjects(config);

    if(config?.trackFinancials && !playObjects.includes('round_resolution_popup')){
      rules.push({
        type: 'warning_rule',
        id: 'financials_requires_round_popup'
      });
    }

    if((config?.scoreInputTarget === 'lives' || config?.victoryMode === 'lives') && !(Array.isArray(config?.counterSet) && config.counterSet.length)){
      rules.push({
        type: 'suggestion_rule',
        id: 'lives_counter_missing'
      });
    }

    if(config?.useRoundResolution && !(Array.isArray(config?.roundQuestions) && config.roundQuestions.length) && !_playObjects(config).includes('round_resolution_popup')){
      rules.push({ type: 'warning_rule', id: 'round_resolution_missing_questions' });
    }

    return rules;
  }

  function resolveRuntime(config){
    return {
      registersResolved: resolveRegisters(config),
      playObjectsResolved: resolvePlayObjects(config),
      resultActionsResolved: resolveResultActions(config),
      captureActionsResolved: resolveCaptureActions(config),
      statusIndicatorsResolved: resolveStatusIndicators(config),
      roundQuestionsResolved: resolveRoundQuestions(config),
      autoBehaviorsResolved: resolveAutoBehaviors(config),
      derivedRules: resolveDerivedRules(config)
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
