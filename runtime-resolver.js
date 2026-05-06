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


  function resolvePhaseLifecycle(config){
    const phases = Array.isArray(config?.gamePhases) ? config.gamePhases : [];
    const explicit = Array.isArray(config?.phaseLifecycle) ? config.phaseLifecycle : [];
    const byPhase = new Map();

    explicit.forEach((item, idx)=>{
      const id = item.phaseId || item.id || `phase_${idx+1}`;
      byPhase.set(id, {
        id: item.id || `lifecycle_${idx+1}`,
        phaseId: id,
        label: item.label || id,
        visibleDuring: Array.isArray(item.visibleDuring) ? item.visibleDuring : [],
        reset: item.reset || 'none',
        autoEnter: !!item.autoEnter,
        autoExit: !!item.autoExit,
        blocksAdvance: !!item.blocksAdvance,
        persistUntil: item.persistUntil || ''
      });
    });

    phases.forEach((phase, idx)=>{
      if(!byPhase.has(phase.id)){
        byPhase.set(phase.id, {
          id: `lifecycle_${phase.id || idx+1}`,
          phaseId: phase.id,
          label: phase.label || phase.id || `Fase ${idx+1}`,
          visibleDuring: [phase.id],
          reset: phase.scope === 'turn' ? 'turn' : (phase.scope === 'round' ? 'round' : 'none'),
          autoEnter: phase.trigger !== 'manual',
          autoExit: false,
          blocksAdvance: false,
          persistUntil: ''
        });
      }
    });

    return Array.from(byPhase.values());
  }

  function buildRuntimeTimeline(config, resolved){
    const timeline = [];
    const phases = resolved.gamePhasesResolved || [];
    const checklist = resolved.phaseChecklistResolved || [];
    const entities = resolved.externalEntitiesResolved || [];
    const playObjects = resolved.playObjectsResolved || [];
    const captures = resolved.captureActionsResolved || [];
    const results = resolved.resultActionsResolved || [];
    const autos = resolved.autoBehaviorsResolved || [];

    timeline.push({ id:'game_start', type:'system', label:'Inicio de partida', phaseId:'setup', order:0, visibleTo:'all', lifecycle:{ reset:'game', autoEnter:true, autoExit:true } });

    phases.forEach((phase, idx)=>{
      timeline.push({
        id:`phase_${phase.id || idx+1}`, type:'phase', label:phase.label, phaseId:phase.id,
        order:phase.order ?? idx+1, scope:phase.scope || 'round', owner:phase.owner || 'host',
        trigger:phase.trigger || 'manual', visibleTo:phase.owner === 'player' ? 'all' : 'host',
        description:phase.description || '',
        lifecycle:{ reset:phase.scope === 'turn' ? 'turn' : (phase.scope === 'round' ? 'round' : 'none'), autoEnter:phase.trigger !== 'manual', autoExit:false }
      });
    });

    checklist.forEach((item, idx)=>{
      timeline.push({
        id:`check_${item.id || idx+1}`, type:'checklist', label:item.label, phaseId:item.phaseId || 'manual',
        order:100+idx, visibleTo:item.visibleTo || 'host', required:item.required !== false,
        lifecycle:{ reset:item.autoReset || 'round', autoEnter:false, autoExit:false, blocksAdvance:item.required === true }
      });
    });

    entities.forEach((item, idx)=>{
      timeline.push({
        id:`entity_${item.id || idx+1}`, type:'entity', label:item.label, phaseId:'persistent',
        order:200+idx, visibleTo:item.visibleTo || 'all', entityType:item.entityType || 'global',
        stateType:item.stateType || 'status', defaultState:item.defaultState ?? '',
        lifecycle:{ reset:'none', persistUntil:'game_end' }
      });
    });

    playObjects.forEach((item, idx)=>{
      timeline.push({
        id:`object_${item.id || idx+1}`, type:'play_object', label:item.label || item.id,
        phaseId:item.kind === 'numeric_input' ? 'score_capture' : 'manual',
        order:300+idx, visibleTo:item.visibleTo || 'host', kind:item.kind, lifecycle:{ reset:'none' }
      });
    });

    captures.forEach((item, idx)=>{
      timeline.push({
        id:`capture_${item.id || idx+1}`, type:'capture', label:item.label,
        phaseId:item.askAt === 'round_end' ? 'round_end' : 'manual',
        order:400+idx, visibleTo:item.visibleTo || 'host', captureType:item.captureType || 'number',
        targetRegister:item.targetRegister || '', lifecycle:{ reset:item.askAt === 'round_end' ? 'round' : 'none' }
      });
    });

    results.forEach((item, idx)=>{
      timeline.push({
        id:`result_${item.id || idx+1}`, type:'result', label:item.label,
        phaseId:item.scope || 'manual', order:500+idx, visibleTo:item.visibleTo || 'all',
        effect:item.effect || 'record_only', lifecycle:{ reset:item.scope === 'round' ? 'round' : 'none' }
      });
    });

    autos.forEach((item, idx)=>{
      timeline.push({
        id:`auto_${item.id || idx+1}`, type:'automation', label:item.label || item.effect || `Regla ${idx+1}`,
        phaseId:item.trigger || 'event', order:600+idx, visibleTo:'host',
        trigger:item.trigger || '', condition:item.condition || '', effect:item.effect || '',
        lifecycle:{ reset:item.clearAfter ? 'after_trigger' : 'none' }
      });
    });

    timeline.push({ id:'game_end_check', type:'system', label:'Revisar condición final', phaseId:'end_check', order:999, visibleTo:'host', lifecycle:{ reset:'none' } });
    return timeline.sort((a,b)=>(a.order||0)-(b.order||0));
  }

  function buildInitialGameState(config, resolved){
    const phases = resolved.gamePhasesResolved || [];
    const checklist = resolved.phaseChecklistResolved || [];
    const entities = resolved.externalEntitiesResolved || [];
    const firstPhase = phases[0]?.id || 'setup';

    const checklistState = {};
    checklist.forEach(item=>{
      checklistState[item.id] = { done:!!item.defaultDone, required:item.required !== false, phaseId:item.phaseId || '', reset:item.autoReset || 'round' };
    });

    const entityState = {};
    entities.forEach(item=>{
      entityState[item.id] = { label:item.label, type:item.entityType || 'global', stateType:item.stateType || 'status', value:item.defaultState ?? '', visibleTo:item.visibleTo || 'all' };
    });

    return { currentRound:1, currentTurn:1, currentPhase:firstPhase, activePlayerId:null, firstPlayerId:null, checklist:checklistState, entities:entityState, status:{}, scores:{}, eliminations:{}, history:[] };
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

    const withRuntime = {
      ...base,
      optimization: resolveOptimization(config, base)
    };
    withRuntime.timeline = buildRuntimeTimeline(config, withRuntime);
    withRuntime.gameState = buildInitialGameState(config, withRuntime);
    return withRuntime;
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
