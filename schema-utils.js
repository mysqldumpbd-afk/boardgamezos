// ═══════════════════════════════════════════════════════════════
// SchemaUtils v2 — BOARDGAMEZ OS
// Validación + UX + export por bloques
// ═══════════════════════════════════════════════════════════════

window.SchemaUtils = (function(){

  function clone(v){
    return JSON.parse(JSON.stringify(v));
  }

  function buildDefaults(schema){
    const config = {};
    (schema.sections || []).forEach(section=>{
      (section.fields || []).forEach(field=>{
        if(field.default !== undefined){
          config[field.id] = clone(field.default);
        }
      });
    });
    return config;
  }

  function normalizeConfig(schema, incoming){
    const defaults = buildDefaults(schema);
    return { ...defaults, ...(incoming || {}) };
  }

  function matchRule(value, expected){
    if(Array.isArray(expected)) return expected.includes(value);
    return value === expected;
  }

  function isVisible(field, config){
    if(!field.visible_if) return true;
    return Object.entries(field.visible_if).every(([key, expected])=>{
      return matchRule(config[key], expected);
    });
  }

  function isCollapsed(section, config){
    if(!section.collapsed_if) return false;
    return Object.entries(section.collapsed_if).every(([key, expected])=>{
      return matchRule(config[key], expected);
    });
  }




function hasValue(field, value){
  if(field.type === 'boolean') return value === true || value === false;
  if(field.type === 'multi_select' || field.type === 'list_text' || field.type === 'counter_set_editor' || field.type === 'result_actions_editor' || field.type === 'capture_actions_editor' || field.type === 'status_indicators_editor' || field.type === 'round_questions_editor' || field.type === 'auto_behaviors_editor'){
    return Array.isArray(value) && value.length > 0;
  }
  if(field.type === 'number'){
    return value !== null && value !== undefined && value !== '';
  }
  return String(value ?? '').trim().length > 0;
}

function sectionState(section, config){
  const visibleFields = (section.fields || []).filter(f => isVisible(f, config));
  const requiredFields = visibleFields.filter(f => f.required);
  const filledRequired = requiredFields.filter(f => hasValue(f, config[f.id]));

  if(requiredFields.length === 0){
    const anyFilled = visibleFields.some(f => hasValue(f, config[f.id]));
    return {
      status: anyFilled ? 'complete' : 'idle',
      label: anyFilled ? 'LISTA' : 'OPCIONAL'
    };
  }

  if(filledRequired.length === 0){
    return { status: 'empty', label: 'PENDIENTE' };
  }

  if(filledRequired.length < requiredFields.length){
    return { status: 'partial', label: 'EN PROCESO' };
  }

  return { status: 'complete', label: 'LISTA' };
}




  // ═══════════════════════════════════════════════════════════════
  // SANITIZE
  // ═══════════════════════════════════════════════════════════════

  function sanitizeConfig(schema, incoming){
    const cfg = normalizeConfig(schema, incoming);

    cfg.name = String(cfg.name || '').trim();
    cfg.description = String(cfg.description || '').trim();

    // Emoji
    if(!cfg.emoji || String(cfg.emoji).length > 8){
      cfg.emoji = '🎮';
    }

    // Números
    cfg.minPlayers = Math.max(1, parseInt(cfg.minPlayers || 1));
    cfg.maxPlayers = Math.max(cfg.minPlayers, parseInt(cfg.maxPlayers || cfg.minPlayers));

    cfg.numTeams = Math.max(2, parseInt(cfg.numTeams || 2));
    cfg.rounds = Math.max(1, parseInt(cfg.rounds || 1));
    cfg.targetScore = Math.max(1, parseInt(cfg.targetScore || 1));
    cfg.winsTarget = Math.max(1, parseInt(cfg.winsTarget || 1));

    // Arrays seguros
	const arrays = [
	  'registers',
	  'tools',
	  'toolsAffect',
	  'roles',
	  'endConditions',
	  'exportFormat',
	  'modifiers',
	  'winConditions',
	  'customRules',
	  'specialEvents',
	  'playObjects',
	  'scoreInputQuickValues',
	  'counterSet',
	  'roundResolutionFields',
	  'roundQuestions',
	  'resultActions',
	  'captureActions',
	  'statusIndicators',
	  'autoBehaviors'
	];
	
    arrays.forEach(k=>{
      if(!Array.isArray(cfg[k])) cfg[k] = [];
    });

    // Alias + defaults inteligentes
    if(cfg.victoryMode === 'elim') cfg.victoryMode = 'elimination';

    if(cfg.registers.length === 0){
      if(cfg.victoryMode === 'points') cfg.registers = ['points'];
      else if(cfg.victoryMode === 'wins') cfg.registers = ['wins'];
      else if(cfg.victoryMode === 'lives') cfg.registers = ['lives'];
      else cfg.registers = [];
    }

    if(cfg.victoryMode === 'points' && !cfg.registers.includes('points')){
      cfg.registers.push('points');
    }

    if(cfg.victoryMode === 'wins' && !cfg.registers.includes('wins')){
      cfg.registers.push('wins');
    }

    if(cfg.victoryMode === 'lives' && !cfg.registers.includes('lives')){
      cfg.registers.push('lives');
    }

    if(cfg.victoryMode === 'elimination'){
      cfg.registers = cfg.registers.filter(id => id !== 'points' && id !== 'wins');
    }

	//-------Nuevos
	if(!cfg.playMode) cfg.playMode = 'minimal';
	if(!cfg.objectControlScope) cfg.objectControlScope = 'host';

	if(!cfg.victoryButtonLabel) cfg.victoryButtonLabel = 'Gané';
	if(!cfg.victoryButtonScope) cfg.victoryButtonScope = 'round';

	if(!cfg.defeatButtonLabel) cfg.defeatButtonLabel = 'Perdí';
	if(!cfg.defeatButtonScope) cfg.defeatButtonScope = 'round';

	if(!cfg.scoreInputLabel) cfg.scoreInputLabel = 'Capturar';
	if(!cfg.scoreInputTarget) cfg.scoreInputTarget = 'points';
	if(cfg.scoreInputAllowNegative === undefined) cfg.scoreInputAllowNegative = false;

	if(!cfg.trackingLevel) cfg.trackingLevel = 'normal';
	if(cfg.trackWinnerReason === undefined) cfg.trackWinnerReason = true;
	if(cfg.trackDefeatReason === undefined) cfg.trackDefeatReason = true;
	if(cfg.trackRoundHistory === undefined) cfg.trackRoundHistory = true;
	if(cfg.trackFinancials === undefined) cfg.trackFinancials = false;
	if(!cfg.difficulty) cfg.difficulty = 'medium';
	if(!cfg.roundResolutionMode) cfg.roundResolutionMode = 'manual';
	if(cfg.useRoundResolution === undefined) cfg.useRoundResolution = false;

	function normalizeId(str, fallback){
	  const base = String(str || fallback || 'item').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
	  return base || fallback || 'item';
	}

	cfg.counterSet = (cfg.counterSet || []).map((c, i) => {
	  if(typeof c === 'string'){
		const parts = c.split('|');
		return {
		  id: `counter_${i + 1}`,
		  label: String(parts[0] || 'Contador').trim(),
		  color: String(parts[1] || '#FFD447').trim(),
		  icon: '🪙',
		  scope: 'player',
		  initialValue: 0,
		  min: 0,
		  max: null,
		  resetOn: 'never',
		  visibleTo: 'all'
		};
	  }

	  return {
		id: c?.id || `counter_${i + 1}`,
		label: String(c?.label || 'Contador').trim(),
		color: String(c?.color || '#FFD447').trim(),
		icon: String(c?.icon || '🪙').trim(),
		scope: c?.scope || 'player',
		initialValue: Number.isFinite(+c?.initialValue) ? +c.initialValue : 0,
		min: c?.min === null || c?.min === undefined ? 0 : (+c.min || 0),
		max: c?.max === null || c?.max === undefined || c?.max === '' ? null : (+c.max || 0),
		resetOn: c?.resetOn || 'never',
		visibleTo: c?.visibleTo || 'all'
	  };
	});

	cfg.resultActions = (cfg.resultActions || []).map((a, i) => ({
	  id: a?.id || normalizeId(a?.label, `result_${i+1}`),
	  label: String(a?.label || 'Resultado').trim(),
	  icon: String(a?.icon || '🏁').trim(),
	  color: String(a?.color || '#00FF9D').trim(),
	  scope: a?.scope || 'round',
	  target: a?.target || 'self',
	  effect: a?.effect || 'record_only',
	  visibleTo: a?.visibleTo || 'all',
	  isPrimary: a?.isPrimary !== false,
	  prompt: String(a?.prompt || '').trim()
	}));

	cfg.captureActions = (cfg.captureActions || []).map((a, i) => ({
	  id: a?.id || normalizeId(a?.label, `capture_${i+1}`),
	  label: String(a?.label || 'Captura').trim(),
	  icon: String(a?.icon || '📝').trim(),
	  color: String(a?.color || '#FFD447').trim(),
	  captureType: a?.captureType || 'number',
	  targetRegister: a?.targetRegister || 'points',
	  min: a?.min === undefined || a?.min === null || a?.min === '' ? 0 : (+a.min || 0),
	  max: a?.max === undefined || a?.max === null || a?.max === '' ? null : (+a.max || 0),
	  quickValues: Array.isArray(a?.quickValues) ? a.quickValues.map(v=>+v).filter(v=>!Number.isNaN(v)) : [],
	  visibleTo: a?.visibleTo || 'host',
	  askAt: a?.askAt || 'manual',
	  options: Array.isArray(a?.options) ? a.options.map(x=>String(x)) : []
	}));

	cfg.statusIndicators = (cfg.statusIndicators || []).map((s, i) => ({
	  id: s?.id || normalizeId(s?.label, `status_${i+1}`),
	  label: String(s?.label || 'Estado').trim(),
	  icon: String(s?.icon || '✨').trim(),
	  color: String(s?.color || '#4A90FF').trim(),
	  scope: s?.scope || 'player',
	  visibility: s?.visibility || 'all',
	  mode: s?.mode || 'toggle',
	  defaultValue: !!s?.defaultValue,
	  durationMode: s?.durationMode || 'manual',
	  clearOn: s?.clearOn || 'none'
	}));

	cfg.roundQuestions = (cfg.roundQuestions || []).map((q, i) => ({
	  id: q?.id || normalizeId(q?.label, `question_${i+1}`),
	  label: String(q?.label || 'Pregunta').trim(),
	  inputType: q?.inputType || 'select',
	  options: Array.isArray(q?.options) ? q.options.map(x=>String(x)) : [],
	  required: q?.required !== false,
	  saveAs: String(q?.saveAs || normalizeId(q?.label, `answer_${i+1}`)).trim(),
	  visibleTo: q?.visibleTo || 'host',
	  min: q?.min === undefined || q?.min === null || q?.min === '' ? 0 : (+q.min || 0),
	  max: q?.max === undefined || q?.max === null || q?.max === '' ? null : (+q.max || 0)
	}));

	cfg.autoBehaviors = (cfg.autoBehaviors || []).map((b, i) => ({
	  id: b?.id || normalizeId(b?.label || b?.effect, `behavior_${i+1}`),
	  trigger: b?.trigger || 'manual',
	  condition: b?.condition || 'always',
	  effect: b?.effect || 'record_only',
	  enabled: b?.enabled !== false,
	  clearAfter: !!b?.clearAfter,
	  label: String(b?.label || '').trim()
	}));
	//-------

	cfg.phaseLifecycle = (cfg.phaseLifecycle || []).map((l, i) => ({
	  id: l?.id || normalizeId(l?.phaseId || l?.label, `lifecycle_${i+1}`),
	  phaseId: String(l?.phaseId || '').trim(),
	  label: String(l?.label || l?.phaseId || `Lifecycle ${i+1}`).trim(),
	  visibleDuring: Array.isArray(l?.visibleDuring) ? l.visibleDuring : [],
	  reset: l?.reset || 'none',
	  autoEnter: !!l?.autoEnter,
	  autoExit: !!l?.autoExit,
	  blocksAdvance: !!l?.blocksAdvance,
	  persistUntil: l?.persistUntil || ''
	}));

    return cfg;
  }

  // ═══════════════════════════════════════════════════════════════
  // VALIDACIÓN (HUMANA)
  // ═══════════════════════════════════════════════════════════════

function validateConfig(schema, incoming){
  const cfg = sanitizeConfig(schema, incoming);
  const errors = [];
  const warnings = [];
  const playObjects = Array.isArray(cfg.playObjects) ? cfg.playObjects : [];

  if(!cfg.name || cfg.name.length < 2){
    errors.push('Ponle un nombre al juego.');
  }

  if(cfg.minPlayers > cfg.maxPlayers){
    errors.push('El mínimo de jugadores no puede ser mayor que el máximo.');
  }

  if(cfg.type === 'teams' && cfg.numTeams < 2){
    errors.push('Si usas equipos, necesitas al menos 2.');
  }

  if(cfg.useRounds && cfg.rounds < 1){
    errors.push('Define al menos 1 ronda.');
  }

  if(cfg.victoryMode === 'points' && cfg.targetScore < 1){
    errors.push('Define la meta de puntos.');
  }

  if(cfg.victoryMode === 'wins' && cfg.winsTarget < 1){
    errors.push('Define la meta de victorias.');
  }

  if(String(incoming?.emoji || '').length > 8){
    warnings.push('El emoji se ajustó automáticamente.');
  }

  if(playObjects.includes('score_input')){
    if(!cfg.scoreInputLabel || String(cfg.scoreInputLabel).trim().length < 2){
      errors.push('Define el texto del botón de captura manual.');
    }
  }

  if(playObjects.includes('victory_button')){
    if(!cfg.victoryButtonLabel || String(cfg.victoryButtonLabel).trim().length < 2){
      errors.push('Define el texto del botón verde de victoria.');
    }
  }

  if(playObjects.includes('defeat_button')){
    if(!cfg.defeatButtonLabel || String(cfg.defeatButtonLabel).trim().length < 2){
      errors.push('Define el texto del botón rojo de derrota.');
    }
  }

  if(playObjects.includes('counter_set')){
    if(!Array.isArray(cfg.counterSet) || cfg.counterSet.length === 0){
      warnings.push('Activaste contadores pero no definiste ninguno todavía.');
    } else {
      cfg.counterSet.forEach((counter, idx) => {
        if(!counter.label || String(counter.label).trim().length < 2){
          errors.push(`El contador ${idx + 1} necesita nombre.`);
        }
      });
    }
  }

  if(playObjects.includes('round_resolution_popup')){
    if(!Array.isArray(cfg.roundResolutionFields) || cfg.roundResolutionFields.length === 0){
      warnings.push('El popup de resolución está activo pero aún no tiene campos definidos.');
    }
  }

  if(cfg.trackFinancials && !playObjects.includes('round_resolution_popup')){
    warnings.push('Quieres guardar pagos/saldos, pero no activaste el popup de resolución de ronda.');
  }

  if(cfg.useRoundResolution && (!Array.isArray(cfg.roundQuestions) || cfg.roundQuestions.length === 0) && !playObjects.includes('round_resolution_popup')){
    warnings.push('Activaste cierre de ronda guiado pero no definiste preguntas ni popup de resolución.');
  }

  (cfg.resultActions || []).forEach((action, idx)=>{
    if(!action.label || String(action.label).trim().length < 2) errors.push(`La acción de resultado ${idx + 1} necesita nombre.`);
  });

  (cfg.captureActions || []).forEach((action, idx)=>{
    if(!action.label || String(action.label).trim().length < 2) errors.push(`La acción de captura ${idx + 1} necesita nombre.`);
  });

  (cfg.statusIndicators || []).forEach((status, idx)=>{
    if(!status.label || String(status.label).trim().length < 2) errors.push(`El indicador ${idx + 1} necesita nombre.`);
  });

  (cfg.roundQuestions || []).forEach((question, idx)=>{
    if(!question.label || String(question.label).trim().length < 2) errors.push(`La pregunta de ronda ${idx + 1} necesita texto.`);
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sanitized: cfg
  };
}

// ═══════════════════════════════════════════════════════════════
// RESUMEN UX
  // ═══════════════════════════════════════════════════════════════

	function summarizeConfig(cfg){
	  const playObjects = Array.isArray(cfg.playObjects) ? cfg.playObjects : [];

	  return {
		title: cfg.name || 'Sin nombre',
		emoji: cfg.emoji || '🎮',
		players: `${cfg.minPlayers || 1}-${cfg.maxPlayers || 1} jugadores`,
		difficulty: cfg.difficulty || 'medium',
		mode: cfg.type === 'teams'
		  ? `Equipos (${cfg.numTeams || 2})`
		  : cfg.type === 'cooperative'
			? 'Cooperativo'
			: 'Individual',
		victory:
		  cfg.victoryMode === 'points'
			? `Puntos a ${cfg.targetScore || 0}`
			: cfg.victoryMode === 'wins'
			  ? `Victorias a ${cfg.winsTarget || 0}`
			  : cfg.victoryMode || 'No definida',
		play:
		  playObjects.length > 0
			? `${playObjects.length} objetos activos`
			: 'Sin objetos de partida',
		interactions: `${(cfg.resultActions||[]).length} resultado · ${(cfg.captureActions||[]).length} captura · ${(cfg.statusIndicators||[]).length} estado`
	  };
	}

  // ═══════════════════════════════════════════════════════════════
  // EXPORT AGRUPADO (PARA BD)
  // ═══════════════════════════════════════════════════════════════

	function groupConfigForStorage(cfg){
	  return {
		identity: {
		  name: cfg.name,
		  emoji: cfg.emoji,
		  description: cfg.description,
		  type: cfg.type,
		  numTeams: cfg.numTeams,
		  roomAccess: cfg.roomAccess,
		  difficulty: cfg.difficulty,
		  difficultyNote: cfg.difficultyNote,
		  minPlayers: cfg.minPlayers,
		  maxPlayers: cfg.maxPlayers
		},

		structure: {
		  useRounds: cfg.useRounds,
		  rounds: cfg.rounds,
		  roundClose: cfg.roundClose,
		  roundTimerSecs: cfg.roundTimerSecs,
		  roundReset: cfg.roundReset,

		  useTurns: cfg.useTurns,
		  turnOrder: cfg.turnOrder,
		  canSkipTurn: cfg.canSkipTurn,
		  hasExtraTurns: cfg.hasExtraTurns,
		  turnLimitPerRound: cfg.turnLimitPerRound,
		  turnLimitCount: cfg.turnLimitCount,
		  noTurnMode: cfg.noTurnMode,

		  useFirstPlayerToken: cfg.useFirstPlayerToken,

		  useTimer: cfg.useTimer,
		  timerScope: cfg.timerScope,
		  timerSecs: cfg.timerSecs,
		  timerVisualAlert: cfg.timerVisualAlert,
		  timerSoundAlert: cfg.timerSoundAlert,
		  timerExpireAction: cfg.timerExpireAction
		},

		victory: {
		  victoryMode: cfg.victoryMode,
		  pointsWinMode: cfg.pointsWinMode,
		  pointsValidation: cfg.pointsValidation,
		  targetScore: cfg.targetScore,

		  winsMode: cfg.winsMode,
		  winsTarget: cfg.winsTarget,

		  livesWinMode: cfg.livesWinMode,
		  elimWinMode: cfg.elimWinMode,
		  objectiveWinMode: cfg.objectiveWinMode,
		  manualWinMode: cfg.manualWinMode,

		  tiebreak: cfg.tiebreak,
		  winConditions: cfg.winConditions
		},

		defeat: {
		  useDefeat: cfg.useDefeat,
		  defeatType: cfg.defeatType,
		  defeatMoment: cfg.defeatMoment,
		  defeatConsequence: cfg.defeatConsequence
		},

		progress: {
		  registers: cfg.registers,
		  customCounterName: cfg.customCounterName,
		  captureType: cfg.captureType,
		  valueNature: cfg.valueNature,
		  accumulation: cfg.accumulation,
		  modifiers: cfg.modifiers,
		  capturedBy: cfg.capturedBy,
		  scoreVisibility: cfg.scoreVisibility
		},

		elimination: {
		  useElimination: cfg.useElimination,
		  elimStartsAt: cfg.elimStartsAt,
		  elimStartRound: cfg.elimStartRound,
		  elimMethod: cfg.elimMethod,
		  elimTieRule: cfg.elimTieRule,
		  elimAftermath: cfg.elimAftermath
		},

		tools: {
		  useTools: cfg.useTools,
		  tools: cfg.tools,
		  toolsMode: cfg.toolsMode,
		  toolsRegistered: cfg.toolsRegistered,
		  toolsAffect: cfg.toolsAffect,

		  diceType: cfg.diceType,
		  diceCustomSides: cfg.diceCustomSides,
		  coinUse: cfg.coinUse,
		  wheelSegments: cfg.wheelSegments,
		  rpsScope: cfg.rpsScope
		},

		roles: {
		  roles: cfg.roles,
		  scoreCapture: cfg.scoreCapture,
		  toolsWho: cfg.toolsWho,
		  roundCloseWho: cfg.roundCloseWho,
		  pauseWho: cfg.pauseWho,
		  errorWho: cfg.errorWho,
		  visHost: cfg.visHost,
		  visPlayer: cfg.visPlayer,
		  visSpectator: cfg.visSpectator
		},

		play: {
		  playMode: cfg.playMode,
		  playObjects: cfg.playObjects,

		  victoryButtonLabel: cfg.victoryButtonLabel,
		  victoryButtonScope: cfg.victoryButtonScope,

		  defeatButtonLabel: cfg.defeatButtonLabel,
		  defeatButtonScope: cfg.defeatButtonScope,

		  scoreInputLabel: cfg.scoreInputLabel,
		  scoreInputTarget: cfg.scoreInputTarget,
		  scoreInputAllowNegative: cfg.scoreInputAllowNegative,
		  scoreInputQuickValues: cfg.scoreInputQuickValues,

		  counterSet: cfg.counterSet,
		  roundResolutionFields: cfg.roundResolutionFields,
		  useRoundResolution: cfg.useRoundResolution,
		  roundResolutionMode: cfg.roundResolutionMode,
		  roundQuestions: cfg.roundQuestions,
		  resultActions: cfg.resultActions,
		  captureActions: cfg.captureActions,
		  statusIndicators: cfg.statusIndicators,
		  autoBehaviors: cfg.autoBehaviors,
		  objectControlScope: cfg.objectControlScope
		},

		rules: {
		  customRules: cfg.customRules,
		  specialEvents: cfg.specialEvents
		},

		history: {
		  trackingLevel: cfg.trackingLevel,
		  trackWinnerReason: cfg.trackWinnerReason,
		  trackDefeatReason: cfg.trackDefeatReason,
		  trackRoundHistory: cfg.trackRoundHistory,
		  trackFinancials: cfg.trackFinancials,
		  trackTimers: cfg.trackTimers
		},

		finish: {
		  showEndScreen: cfg.showEndScreen,
		  saveHistory: cfg.saveHistory,
		  endConditions: cfg.endConditions,
		  exportFormat: cfg.exportFormat,
		  rematchKeepPlayers: cfg.rematchKeepPlayers,
		  rematchKeepRoom: cfg.rematchKeepRoom,
		  rematchKeepConfig: cfg.rematchKeepConfig,
		  rematchResetScore: cfg.rematchResetScore,
		  rematchResetAll: cfg.rematchResetAll
		}
	  };
	}

  // ═══════════════════════════════════════════════════════════════
  // EXPORT FINAL
  // ═══════════════════════════════════════════════════════════════

  function exportPayload(schema, incoming){
    const validation = validateConfig(schema, incoming);
    const cfg = validation.sanitized;
    const grouped = groupConfigForStorage(cfg);

    const runtimeBase = typeof interpret === 'function' ? interpret(cfg) : {};
    const runtimeResolved = window.RuntimeResolver?.resolveRuntime
      ? window.RuntimeResolver.resolveRuntime(cfg)
      : { registersResolved: [], playObjectsResolved: [], derivedRules: [] };

    return {
      schemaVersion: '1.0',
      exportedAt: new Date().toISOString(),
      valid: validation.valid,
      errors: validation.errors,
      warnings: validation.warnings,
      summary: summarizeConfig(cfg),
      config: cfg,
      grouped,
      runtime: {
        ...runtimeBase,
        ...runtimeResolved
      }
    };
  }

  return {
    normalizeConfig,
    isVisible,
    isCollapsed,
    sanitizeConfig,
    validateConfig,
    exportPayload,
    summarizeConfig,
    groupConfigForStorage,
    hasValue,
    sectionState
  };

})();