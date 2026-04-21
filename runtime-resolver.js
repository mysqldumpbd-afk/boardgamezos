// ═══════════════════════════════════════════════════════════════
// runtime-resolver.js — BOARDGAMEZ OS v1.0
// Resuelve objetos de partida y registros listos para runtime/BD
// ═══════════════════════════════════════════════════════════════

window.RuntimeResolver = (function(){
  function clone(v){
    return JSON.parse(JSON.stringify(v));
  }

  function makeId(label, fallback){
    const raw = String(label || fallback || 'item')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    return raw || fallback || 'item';
  }

  function normalizeQuickValues(list){
    if(!Array.isArray(list)) return [];
    return list
      .map(v => parseInt(v, 10))
      .filter(v => Number.isFinite(v));
  }

  function normalizeCounter(counter, index){
    const label = String(counter?.label || counter?.name || `Contador ${index + 1}`).trim();
    return {
      id: String(counter?.id || makeId(label, `counter_${index + 1}`)),
      label,
      color: counter?.color || '#FFD447',
      icon: counter?.icon || '🪙',
      scope: counter?.scope || 'player',
      initialValue: Number.isFinite(+counter?.initialValue) ? +counter.initialValue : 0,
      min: counter?.min === null || counter?.min === '' || counter?.min === undefined ? 0 : +counter.min,
      max: counter?.max === null || counter?.max === '' || counter?.max === undefined ? null : +counter.max,
      resetOn: counter?.resetOn || 'never',
      visibleTo: counter?.visibleTo || 'all'
    };
  }

  function resolveRegisters(config){
    const resolved = [];
    const pushUnique = item => {
      if(!item?.id) return;
      if(resolved.some(r => r.id === item.id)) return;
      resolved.push(item);
    };

    (Array.isArray(config.registers) ? config.registers : []).forEach(reg => {
      pushUnique({
        id: String(reg),
        label: String(reg),
        kind: 'built_in_register',
        scope: 'player'
      });
    });

    (Array.isArray(config.counterSet) ? config.counterSet : []).forEach((counter, index) => {
      pushUnique({
        ...normalizeCounter(counter, index),
        kind: 'counter'
      });
    });

    const target = config.scoreInputTarget;
    if(target && target !== 'custom'){
      pushUnique({
        id: String(target),
        label: String(target),
        kind: 'derived_register',
        scope: 'player'
      });
    }

    if(config.victoryMode === 'lives'){
      pushUnique({ id:'lives', label:'lives', kind:'derived_register', scope:'player' });
    }
    if(config.victoryMode === 'wins'){
      pushUnique({ id:'wins', label:'wins', kind:'derived_register', scope:'player' });
    }
    if(config.victoryMode === 'points'){
      pushUnique({ id:'points', label:'points', kind:'derived_register', scope:'player' });
    }

    return resolved;
  }

  function resolvePlayObjects(config){
    const active = Array.isArray(config.playObjects) ? config.playObjects : [];
    const visibleTo = config.objectControlScope || 'host';
    const resolved = [];

    if(active.includes('victory_button')){
      resolved.push({
        id: 'victory_button',
        kind: 'action_button',
        label: config.victoryButtonLabel || 'Gané',
        style: 'success',
        icon: '🟢',
        scope: config.victoryButtonScope || 'round',
        visibleTo,
        action: 'mark_victory'
      });
    }

    if(active.includes('defeat_button')){
      resolved.push({
        id: 'defeat_button',
        kind: 'action_button',
        label: config.defeatButtonLabel || 'Perdí',
        style: 'danger',
        icon: '🔴',
        scope: config.defeatButtonScope || 'round',
        visibleTo,
        action: 'mark_defeat'
      });
    }

    if(active.includes('score_input')){
      resolved.push({
        id: 'score_input',
        kind: 'numeric_input',
        label: config.scoreInputLabel || 'Capturar',
        target: config.scoreInputTarget || 'points',
        allowNegative: !!config.scoreInputAllowNegative,
        quickValues: normalizeQuickValues(config.scoreInputQuickValues),
        visibleTo,
        action: 'capture_numeric'
      });
    }

    if(active.includes('counter_set')){
      resolved.push({
        id: 'counter_set',
        kind: 'counter_collection',
        counters: (Array.isArray(config.counterSet) ? config.counterSet : []).map(normalizeCounter),
        visibleTo,
        action: 'adjust_counter'
      });
    }

    if(active.includes('round_resolution_popup')){
      resolved.push({
        id: 'round_resolution_popup',
        kind: 'resolution_modal',
        fields: Array.isArray(config.roundResolutionFields) ? clone(config.roundResolutionFields) : [],
        visibleTo,
        action: 'resolve_round'
      });
    }

    return resolved;
  }

  function deriveRules(config, registersResolved){
    const rules = [];
    const ids = registersResolved.map(r => r.id);
    const active = Array.isArray(config.playObjects) ? config.playObjects : [];

    if(active.includes('score_input') && config.scoreInputTarget && config.scoreInputTarget !== 'custom' && !ids.includes(config.scoreInputTarget)){
      rules.push({
        type: 'autocreate_register',
        registerId: config.scoreInputTarget,
        reason: 'score_input_target_missing'
      });
    }

    if(active.includes('counter_set') && (!Array.isArray(config.counterSet) || config.counterSet.length === 0)){
      rules.push({
        type: 'warning',
        code: 'counter_set_empty'
      });
    }

    if(config.trackFinancials && !active.includes('round_resolution_popup')){
      rules.push({
        type: 'suggestion',
        code: 'enable_round_resolution_popup'
      });
    }

    return rules;
  }

  function resolveRuntime(config){
    const registersResolved = resolveRegisters(config);
    const playObjectsResolved = resolvePlayObjects(config);
    const derivedRules = deriveRules(config, registersResolved);

    return {
      registersResolved,
      playObjectsResolved,
      derivedRules
    };
  }

  return {
    normalizeCounter,
    resolveRegisters,
    resolvePlayObjects,
    resolveRuntime
  };
})();
