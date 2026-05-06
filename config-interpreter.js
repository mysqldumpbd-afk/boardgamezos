// ═══════════════════════════════════════════════════════════════
// config-interpreter.js — BOARDGAMEZ OS v1.5
// Traduce el config del builder a una especificación de runtime.
// El runtime solo lee el output de este intérprete.
// ═══════════════════════════════════════════════════════════════

/**
 * interpret(config) → RuntimeSpec
 *
 * RuntimeSpec define exactamente qué mostrar, qué botones,
 * qué automático, qué validar — sin que el runtime sepa nada
 * del motor interno.
 */
function interpret(config) {
  if (!config) return _defaultSpec();

  const victoryModeNormalized = config.victoryMode === 'elim'
    ? 'elimination'
    : (config.victoryMode || 'points');

  const spec = {
    // ── IDENTIDAD ──────────────────────────────────────────────
    type:        config.type       || 'individual',  // individual | teams | cooperative
    numTeams:    config.numTeams   || 2,
    minPlayers:  config.minPlayers || 2,
    maxPlayers:  config.maxPlayers || 8,

    // ── ESTRUCTURA ─────────────────────────────────────────────
    hasRounds:      config.useRounds    || false,
    totalRounds:    config.rounds === 'libre' ? null : (parseInt(config.rounds) || null),
    roundClose:     config.roundClose   || 'manual',   // manual | timer | all_done
    roundTimerSecs: config.roundTimerSecs || 60,
    roundReset:     config.roundReset   || 'nothing',

    hasTurns:       config.useTurns     || false,
    turnOrder:      config.turnOrder    || 'fixed',
    canSkip:        config.canSkipTurn  || false,
    hasExtraTurns:  config.hasExtraTurns || false,
    turnLimit:      config.turnLimitPerRound ? (config.turnLimitCount || 1) : null,
    noTurnMode:     config.noTurnMode   || 'simultaneous',

    hasFirstPlayerToken: config.useFirstPlayerToken || false,

    hasTimer:     config.useTimer       || false,
    timerScope:   config.timerScope     || 'turn',
    timerSecs:    config.timerSecs      || 60,
    timerVisual:  config.timerVisualAlert !== false,
    timerSound:   config.timerSoundAlert  !== false,
    timerExpire:  config.timerExpireAction || 'nothing',

    // ── VICTORIA ───────────────────────────────────────────────
    victoryMode:      victoryModeNormalized  || 'points',
    pointsWinMode:    config.pointsWinMode   || 'most',
    pointsValidation: config.pointsValidation || 'instant',
    targetScore:      config.targetScore     || null,
    winsMode:         config.winsMode        || 'most',
    winsTarget:       config.winsTarget      || 3,
    livesWinMode:     config.livesWinMode    || 'last_alive',
    elimWinMode:      config.elimWinMode     || 'last_player',
    objectiveMode:    config.objectiveWinMode || 'complete_mission',
    manualWinMode:    config.manualWinMode   || 'host_end',
    winConditions:    config.winConditions   || [],
    tiebreak:         config.tiebreak        || 'host',

    // ── DERROTA ────────────────────────────────────────────────
    hasDefeat:         config.useDefeat       || false,
    defeatType:        config.defeatType      || 'points',
    defeatConsequence: config.defeatConsequence || 'eliminated',
    defeatMoment:      config.defeatMoment    || 'round_end',

    // ── PROGRESO ───────────────────────────────────────────────
    registers:      config.registers     || (victoryModeNormalized === 'points' ? ['points'] : []),
    captureType:    config.captureType   || 'manual',
    valueNature:    config.valueNature   || 'positive',
    accumulation:   config.accumulation  || 'global',
    modifiers:      config.modifiers     || [],
    capturedBy:     config.capturedBy    || 'self',  // quien captura en el runtime
    scoreVisibility: config.scoreVisibility || 'all',

    // ── ELIMINACIÓN ────────────────────────────────────────────
    hasElimination: config.useElimination || false,
    elimStartsAt:   config.elimStartsAt  || 'round_1',
    elimStartRound: config.elimStartRound || 1,
    elimMethod:     config.elimMethod    || 'last_place',
    elimTieRule:    config.elimTieRule   || 'host',
    elimAftermath:  config.elimAftermath || 'out',

    // ── HERRAMIENTAS ───────────────────────────────────────────
    hasTools:       config.useTools      || false,
    tools:          config.tools         || [],
    toolsMode:      config.toolsMode     || 'informal',
    toolsAffect:    config.toolsAffect   || [],
    toolsRegistered:config.toolsRegistered || 'no',
    diceType:       config.diceType      || 'd6',
    diceCustomSides:config.diceCustomSides || 6,
    coinUse:        config.coinUse       || 'free',
    wheelSegments:  config.wheelSegments || 'fixed',
    rpsScope:       config.rpsScope      || 'any',

    // ── ROLES ──────────────────────────────────────────────────
    roles:          config.roles         || ['host','player'],
    scoreCapture:   config.scoreCapture  || 'host',
    toolsWho:       config.toolsWho      || 'all',
    roundCloseWho:  config.roundCloseWho || 'host',
    pauseWho:       config.pauseWho      || 'host',
    errorWho:       config.errorWho      || 'host',
    visHost:        config.visHost       || 'all',
    visPlayer:      config.visPlayer     || 'all',
    visSpectator:   config.visSpectator  || 'score',

    // ── FINALIZACIÓN ───────────────────────────────────────────
    endConditions:     config.endConditions    || ['victory'],
    showEndScreen:     config.showEndScreen    !== false,
    saveHistory:       config.saveHistory      !== false,
    exportFormat:      config.exportFormat     || [],
    rematch:           _buildRematch(config),
  };

  // ── DERIVADOS: lo que el runtime necesita saber ─────────────

  // ¿Qué unidad principal se muestra en el marcador?
  spec.primaryUnit = _primaryUnit(spec);

  // Inicialización de un jugador nuevo en runtime
  spec.playerInit = _playerInit(spec);

  // Acciones disponibles por jugador (panel de botones)
  spec.playerActions = _playerActions(spec);

  // Panel de control del host
  spec.hostActions = _hostActions(spec);

  // Validaciones automáticas que el runtime debe correr tras cada acción
  spec.autoChecks = _autoChecks(spec);

  // Toolbar de herramientas activas
  spec.toolbarItems = _toolbarItems(spec);

  // ── DERIVADOS EXTRA: compatibilidad host + jugador ───────────
  spec.hostIsAlsoPlayer = config.hostIsAlsoPlayer !== false;
  spec.canPlayerSelfRegister = spec.capturedBy === 'self' || spec.capturedBy === 'all';

  // Legado: compatibilidad con runtime antiguo (generic.jsx)
  spec.legacy = {
    mode: spec.victoryMode === 'wins' ? 'wins'
        : spec.hasElimination || spec.victoryMode === 'lives' || spec.livesWinMode ? 'survival'
        : 'points',
    useRounds: spec.hasRounds,
    rounds:    spec.totalRounds || 'libre',
    useTarget: spec.victoryMode === 'points' && spec.pointsWinMode !== 'most',
    targetScore: spec.targetScore,
    scoreSign:   spec.valueNature === 'both' || spec.valueNature === 'decimals' ? 'both' : 'positive',
    winConditions: spec.winConditions,
  };

  return spec;
}

// ── HELPERS ──────────────────────────────────────────────────────

function _defaultSpec() {
  return interpret({ registers: ['points'], captureType: 'manual', victoryMode: 'points' });
}

function _buildRematch(config) {
  return {
    keepPlayers: config.rematchKeepPlayers !== false,
    keepRoom:    config.rematchKeepRoom    !== false,
    keepConfig:  config.rematchKeepConfig  !== false,
    resetScore:  config.rematchResetScore  !== false,
    resetAll:    config.rematchResetAll    || false,
  };
}

function _primaryUnit(spec) {
  if (spec.registers.includes('lives'))   return 'lives';
  if (spec.registers.includes('wins'))    return 'wins';
  if (spec.registers.includes('points'))  return 'points';
  if (spec.registers.includes('coins'))   return 'coins';
  if (spec.registers.includes('resources')) return 'resources';
  if (spec.registers.includes('objectives')) return 'objectives';
  if (spec.registers.includes('custom'))  return 'custom';
  return 'points';
}

function _playerInit(spec) {
  const init = {
    // Scores
    points:     0,
    wins:       0,
    lives:      5,        // TODO: configurable como "vidas iniciales"
    coins:      0,
    resources:  0,
    objectives: 0,
    custom:     0,
    // Estado
    eliminated:    false,
    finalPosition: null,
    survivalMs:    null,
    rounds:        [],
    // Modificadores activos
    activeShield:     false,
    activeBlock:      false,
    activeDouble:     false,
    turnSkipsRemaining: 0,
    // Token
    hasFirstPlayerToken: false,
  };

  // Si el modo no necesita ciertas métricas, las ponemos en null
  if (!spec.registers.includes('lives'))     delete init.lives;
  if (!spec.registers.includes('coins'))     delete init.coins;
  if (!spec.registers.includes('resources')) delete init.resources;
  if (!spec.registers.includes('objectives'))delete init.objectives;

  return init;
}

/**
 * _playerActions — genera los botones del panel de cada jugador
 * Cada acción tiene: id, label, icon, color, type, visible, requires
 */
function _playerActions(spec) {
  const actions = [];
  const isHost = true; // el runtime pasa `isHost` para filtrar

  // ── 1. PUNTOS ──
  if (spec.registers.includes('points') && spec.victoryMode !== 'elimination') {
    actions.push({
      id: 'add_points',
      label: '+ Puntos',
      icon: '➕',
      color: '#00F5FF',
      type: 'numeric_modal',   // abre calculadora
      category: 'score',
      affectsScore: true,
      quickValues: [1, 5, 10, 50, -1, -5, -10],
      allowNegative: spec.valueNature === 'both',
      decimals: spec.valueNature === 'decimals',
      visibleTo: _who(spec.scoreCapture),
      requires: { notEliminated: true },
    });
  }

  // ── 2. VICTORIAS ──
  if ((spec.registers.includes('wins') || spec.victoryMode === 'wins') && spec.victoryMode !== 'elimination') {
    actions.push({
      id: 'add_win',
      label: 'Ganó ronda',
      icon: '🏆',
      color: '#FFD447',
      type: 'direct',          // 1 clic
      category: 'score',
      affectsScore: true,
      visibleTo: _who(spec.roundCloseWho),
      requires: { notEliminated: true },
    });
  }

  // ── 3. VIDAS ──
  if (spec.registers.includes('lives')) {
    actions.push({
      id: 'lose_life',
      label: '- Vida',
      icon: '❤️',
      color: '#FF3B5C',
      type: 'direct',
      category: 'lives',
      affectsScore: true,
      autoTrigger: 'check_zero_lives', // si llega a 0 → eliminar
      visibleTo: _who(spec.scoreCapture),
      requires: { notEliminated: true, livesAboveZero: true },
    });
    actions.push({
      id: 'add_life',
      label: '+ Vida',
      icon: '💚',
      color: '#00FF9D',
      type: 'direct',
      category: 'lives',
      affectsScore: true,
      visibleTo: _who(spec.scoreCapture),
      requires: { notEliminated: true },
      secondary: true,  // en panel secundario
    });
  }

  // ── 4. RECURSOS / MONEDAS ──
  if (spec.registers.includes('resources')) {
    actions.push({
      id: 'add_resource', label: '+ Recurso', icon: '📦', color: '#FF6B35',
      type: 'numeric_modal', category: 'resource', affectsScore: false,
      quickValues: [1, 2, 3, 5, -1], visibleTo: _who(spec.scoreCapture),
      requires: { notEliminated: true }, secondary: true,
    });
  }
  if (spec.registers.includes('coins')) {
    actions.push({
      id: 'add_coin', label: '+ Moneda', icon: '🪙', color: '#FFD447',
      type: 'numeric_modal', category: 'coin', affectsScore: false,
      quickValues: [1, 5, 10, -1, -5], visibleTo: _who(spec.scoreCapture),
      requires: { notEliminated: true }, secondary: true,
    });
  }
  if (spec.registers.includes('objectives')) {
    actions.push({
      id: 'complete_objective', label: 'Objetivo', icon: '🎯', color: '#9B5DE5',
      type: 'direct', category: 'objective', affectsScore: false,
      visibleTo: _who(spec.scoreCapture),
      requires: { notEliminated: true }, secondary: true,
    });
  }
  if (spec.registers.includes('custom')) {
    actions.push({
      id: 'add_custom', label: '+ Custom', icon: '🔢', color: '#06D6A0',
      type: 'numeric_modal', category: 'custom', affectsScore: false,
      quickValues: [1, 5, -1], visibleTo: _who(spec.scoreCapture),
      requires: { notEliminated: true }, secondary: true,
    });
  }

  // ── 5. ELIMINACIÓN ──
  if (spec.hasElimination || spec.victoryMode === 'elimination' || spec.victoryMode === 'lives') {
    actions.push({
      id: 'eliminate',
      label: 'Eliminar',
      icon: '💀',
      color: '#FF3B5C',
      type: 'confirm_action',  // requiere confirmación
      category: 'elimination',
      affectsScore: false,
      dangerous: true,
      confirmLabel: '¿Confirmar eliminación?',
      visibleTo: ['host', 'judge'],
      requires: { notEliminated: true },
      aftermath: spec.elimAftermath,
    });
  }

  // ── 6. MODIFICADORES ──
  if (spec.modifiers.includes('bonus')) {
    actions.push({
      id: 'apply_bonus', label: 'Bonus', icon: '⬆️', color: '#00FF9D',
      type: 'numeric_modal', category: 'modifier',
      quickValues: [1, 2, 3, 5, 10],
      visibleTo: ['host'], secondary: true,
    });
  }
  if (spec.modifiers.includes('penalty')) {
    actions.push({
      id: 'apply_penalty', label: 'Penalizar', icon: '⬇️', color: '#FF6B35',
      type: 'numeric_modal', category: 'modifier',
      quickValues: [1, 2, 3, 5, 10],
      visibleTo: ['host'], secondary: true,
    });
  }
  if (spec.modifiers.includes('multiplier')) {
    actions.push({
      id: 'apply_multiplier', label: '×Mult.', icon: '✖️', color: '#FFD447',
      type: 'option_selector', category: 'modifier',
      options: ['×2', '×3', '×0.5'],
      visibleTo: ['host'], secondary: true,
    });
  }
  if (spec.modifiers.includes('steal')) {
    actions.push({
      id: 'apply_steal', label: 'Robar pts', icon: '🦹', color: '#9B5DE5',
      type: 'player_selector_numeric', category: 'modifier',
      visibleTo: ['host'], secondary: true,
    });
  }
  if (spec.modifiers.includes('shield')) {
    actions.push({
      id: 'apply_shield', label: 'Escudo', icon: '🛡️', color: '#4A90FF',
      type: 'direct', category: 'modifier',
      visibleTo: ['host'], secondary: true,
      toggleState: 'activeShield',
    });
  }
  if (spec.modifiers.includes('block')) {
    actions.push({
      id: 'apply_block', label: 'Bloqueo', icon: '🚫', color: '#FF3B5C',
      type: 'direct', category: 'modifier',
      visibleTo: ['host'], secondary: true,
      toggleState: 'activeBlock',
    });
  }
  if (spec.modifiers.includes('double_next')) {
    actions.push({
      id: 'apply_double', label: 'Doble ×2', icon: '2️⃣', color: '#FFD447',
      type: 'direct', category: 'modifier',
      visibleTo: ['host'], secondary: true,
      toggleState: 'activeDouble',
    });
  }

  // ── 7. CONDICIÓN PERSONALIZADA ──
  if (spec.winConditions && spec.winConditions.length > 0) {
    actions.push({
      id: 'select_win_condition',
      label: 'Tipo de jugada',
      icon: '⭐',
      color: '#FFD447',
      type: 'option_selector',
      category: 'custom_condition',
      options: spec.winConditions,
      visibleTo: ['host', 'player'],
      secondary: false,  // es parte del flujo principal
    });
  }

  // ── 8. TOKEN PRIMER JUGADOR ──
  if (spec.hasFirstPlayerToken) {
    actions.push({
      id: 'take_token',
      label: 'Tomar 👑',
      icon: '👑',
      color: '#FFD447',
      type: 'direct',
      category: 'token',
      visibleTo: ['all'],
      secondary: true,
    });
  }

  // ── 9. DESHACER ──
  actions.push({
    id: 'undo',
    label: 'Deshacer',
    icon: '↩️',
    color: 'rgba(255,255,255,.4)',
    type: 'undo',
    category: 'system',
    visibleTo: ['host'],
    secondary: true,
  });

  return actions;
}

/**
 * _hostActions — panel de control del host (acciones globales)
 */
function _hostActions(spec) {
  const actions = [];

  if (spec.hasRounds) {
    actions.push({ id: 'close_round',   label: 'Cerrar ronda',    icon: '✓', color: '#00FF9D', primary: true });
    actions.push({ id: 'restart_round', label: 'Reiniciar ronda', icon: '🔄', color: '#FF6B35' });
  }

  actions.push({ id: 'end_match',   label: 'Terminar partida', icon: '🏁', color: '#FF3B5C', dangerous: true });
  actions.push({ id: 'edit_score',  label: 'Editar puntaje',   icon: '✏️', color: '#4A90FF' });
  actions.push({ id: 'undo_last',   label: 'Deshacer último',  icon: '↩️', color: 'rgba(255,255,255,.4)' });

  if (spec.pauseWho === 'host') {
    actions.push({ id: 'pause', label: 'Pausar', icon: '⏸', color: '#FFD447' });
  }

  if (spec.hasTurns) {
    actions.push({ id: 'next_turn', label: 'Siguiente turno', icon: '⏭', color: '#9B5DE5' });
    if (spec.canSkip) {
      actions.push({ id: 'skip_turn', label: 'Saltar turno', icon: '⏩', color: '#FF6B35' });
    }
  }

  return actions;
}

/**
 * _autoChecks — validaciones que el runtime corre automáticamente
 * tras cada acción, sin input del usuario
 */
function _autoChecks(spec) {
  const checks = [];

  // Verificar si alguien ganó por puntos
  if (spec.victoryMode === 'points' && spec.pointsWinMode !== 'most') {
    checks.push({
      id: 'check_points_victory',
      trigger: 'after_score_change',
      when: spec.pointsValidation === 'instant' ? 'always' : 'round_end',
      condition: (player, spec) => {
        if (spec.pointsWinMode === 'reach_x') return player.points >= spec.targetScore;
        if (spec.pointsWinMode === 'exact_x')  return player.points === spec.targetScore;
        return false;
      },
      effect: 'trigger_victory',
      winner: 'triggering_player',
    });
  }

  // Verificar si alguien ganó por victorias
  if (spec.victoryMode === 'wins' && spec.winsMode === 'target') {
    checks.push({
      id: 'check_wins_victory',
      trigger: 'after_win_added',
      when: 'always',
      condition: (player, spec) => player.wins >= spec.winsTarget,
      effect: 'trigger_victory',
      winner: 'triggering_player',
    });
  }

  // Verificar eliminación por 0 vidas
  if (spec.registers.includes('lives')) {
    checks.push({
      id: 'check_zero_lives',
      trigger: 'after_life_lost',
      when: 'always',
      condition: (player) => (player.lives || 0) <= 0,
      effect: spec.hasElimination ? 'eliminate_player' : 'trigger_defeat',
      consequence: spec.defeatConsequence,
    });
  }

  // Verificar victoria por supervivencia
  if (spec.victoryMode === 'lives' && spec.livesWinMode === 'last_alive') {
    checks.push({
      id: 'check_last_alive',
      trigger: 'after_elimination',
      when: 'always',
      condition: (players) => players.filter(p => !p.eliminated).length === 1,
      effect: 'trigger_victory',
      winner: 'last_active',
    });
  }

  // Verificar victoria por eliminación
  if (spec.victoryMode === 'elimination' && spec.elimWinMode === 'last_player') {
    checks.push({
      id: 'check_last_player',
      trigger: 'after_elimination',
      when: 'always',
      condition: (players) => players.filter(p => !p.eliminated).length === 1,
      effect: 'trigger_victory',
      winner: 'last_active',
    });
  }

  // Verificar fin de rondas
  if (spec.hasRounds && spec.totalRounds) {
    checks.push({
      id: 'check_rounds_done',
      trigger: 'after_round_close',
      when: 'always',
      condition: (state) => state.currentRound >= spec.totalRounds,
      effect: 'trigger_end_by_rounds',
    });
  }

  // Auto-cerrar ronda si todos terminaron
  if (spec.roundClose === 'all_done') {
    checks.push({
      id: 'auto_close_round',
      trigger: 'after_player_action',
      when: 'always',
      condition: (state) => state.activePlayers.every(p => p.roundDone),
      effect: 'close_round',
    });
  }

  // Aplicar modificador "doble siguiente ronda"
  if (spec.modifiers.includes('double_next')) {
    checks.push({
      id: 'apply_double_modifier',
      trigger: 'before_score_apply',
      when: 'player_has_double',
      condition: (player) => player.activeDouble,
      effect: 'multiply_score',
      multiplier: 2,
      clearAfter: true,
    });
  }

  // Verificar escudo antes de penalización
  if (spec.modifiers.includes('shield')) {
    checks.push({
      id: 'apply_shield',
      trigger: 'before_penalty_apply',
      when: 'player_has_shield',
      condition: (player) => player.activeShield,
      effect: 'block_penalty',
      clearAfter: true,
    });
  }

  return checks;
}

/**
 * _toolbarItems — herramientas visibles en el toolbar
 */
function _toolbarItems(spec) {
  if (!spec.hasTools) return [];
  const items = [];
  const all = spec.tools;

  if (all.includes('coin'))    items.push({ id: 'coin',    icon: '🪙', label: 'Moneda',  color: '#FFD447' });
  if (all.includes('dice'))    items.push({ id: 'dice',    icon: '🎲', label: spec.diceType === 'custom' ? `d${spec.diceCustomSides}` : spec.diceType, color: '#00F5FF' });
  if (all.includes('wheel'))   items.push({ id: 'wheel',   icon: '🎡', label: 'Ruleta',  color: '#FF6B35' });
  if (all.includes('rps'))     items.push({ id: 'rps',     icon: '✊', label: 'PPS',     color: '#9B5DE5' });
  if (all.includes('counter')) items.push({ id: 'counter', icon: '🔢', label: 'Contador',color: '#00FF9D' });

  return items;
}

// Quién puede ver/usar una acción según scoreCapture
function _who(capturedBy) {
  switch (capturedBy) {
    case 'host':   return ['host'];
    case 'self':   return ['host', 'self'];   // host o el mismo jugador
    case 'all':    return ['host', 'player']; // todos
    case 'judge':  return ['host', 'judge'];
    default:       return ['host'];
  }
}

/**
 * applyAction — ejecuta una acción sobre el estado del juego
 * Retorna el nuevo estado de players + events
 */
function applyAction(action, targetPlayerId, payload, roomState, spec) {
  const now = Date.now();
  const players = [...(roomState.players || [])];
  const events = [...(roomState.events || [])];
  const pidx = players.findIndex(p => p.id === targetPlayerId);
  if (pidx < 0 && action.id !== 'close_round' && action.id !== 'end_match') return null;

  const player = pidx >= 0 ? { ...players[pidx] } : null;
  let updates = { players, events };
  let victoryResult = null;

  switch (action.id) {

    case 'add_points': {
      const raw = parseInt(payload.value) || 0;
      const mult = player.activeDouble ? 2 : 1;
      const val = raw * mult;
      if (player.activeShield && val < 0) { /* blocked */ break; }
      player.points = (player.points || 0) + val;
      if (player.activeDouble) { player.activeDouble = false; }
      if (spec.accumulation === 'per_round') {
        player.rounds = [...(player.rounds || []), { round: roomState.currentRound || 1, score: val, ts: now }];
      }
      events.push({ type: 'add_points', player: targetPlayerId, value: val, condition: payload.condition || null, ts: now });
      players[pidx] = player;
      // Auto-check victoria
      victoryResult = _checkVictory(players, spec);
      break;
    }

    case 'add_win': {
      player.wins = (player.wins || 0) + 1;
      player.rounds = [...(player.rounds || []), { round: roomState.currentRound || 1, won: true, ts: now }];
      events.push({ type: 'add_win', player: targetPlayerId, ts: now });
      players[pidx] = player;
      victoryResult = _checkVictory(players, spec);
      break;
    }

    case 'lose_life': {
      const prev = player.lives || 0;
      player.lives = Math.max(0, prev - 1);
      events.push({ type: 'lose_life', player: targetPlayerId, lives: player.lives, ts: now });
      players[pidx] = player;
      // Auto-eliminación si llega a 0
      if (player.lives === 0 && (spec.hasElimination || spec.victoryMode === 'lives')) {
        return applyAction({ id: 'eliminate' }, targetPlayerId, {}, { ...roomState, players }, spec);
      }
      victoryResult = _checkVictory(players, spec);
      break;
    }

    case 'add_life': {
      player.lives = (player.lives || 0) + 1;
      events.push({ type: 'add_life', player: targetPlayerId, lives: player.lives, ts: now });
      players[pidx] = player;
      break;
    }

    case 'eliminate': {
      const active = players.filter(p => !p.eliminated);
      const elimOrder = players.filter(p => p.eliminated).length + 1;
      player.eliminated = true;
      player.eliminatedAt = now;
      player.eliminatedOrder = elimOrder;
      player.survivalMs = now - (roomState.startedAt || now);
      player.survivalLabel = fmtDuration(player.survivalMs);
      player.finalPosition = players.length - (elimOrder - 1);
      player.elimReason = payload.reason || null;
      if (spec.elimAftermath === 'spectator') player.isSpectator = true;
      if (spec.elimAftermath === 'keep_score') player.keepScore = true;
      events.push({ type: 'eliminate', player: targetPlayerId, position: player.finalPosition, ts: now });
      players[pidx] = player;
      victoryResult = _checkVictory(players, spec);
      break;
    }

    case 'apply_bonus': {
      const bonus = parseInt(payload.value) || 0;
      player.points = (player.points || 0) + bonus;
      events.push({ type: 'modifier_bonus', player: targetPlayerId, value: bonus, ts: now });
      players[pidx] = player;
      break;
    }

    case 'apply_penalty': {
      if (player.activeShield) {
        player.activeShield = false;
        events.push({ type: 'shield_blocked', player: targetPlayerId, ts: now });
        players[pidx] = player;
        break;
      }
      const penalty = parseInt(payload.value) || 0;
      player.points = (player.points || 0) - penalty;
      events.push({ type: 'modifier_penalty', player: targetPlayerId, value: penalty, ts: now });
      players[pidx] = player;
      break;
    }

    case 'apply_multiplier': {
      const factor = parseFloat((payload.value || '×2').replace('×','')) || 2;
      player.points = Math.round((player.points || 0) * factor * 10) / 10;
      events.push({ type: 'modifier_multiplier', player: targetPlayerId, factor, ts: now });
      players[pidx] = player;
      break;
    }

    case 'apply_steal': {
      const amount = parseInt(payload.value) || 0;
      const fromIdx = players.findIndex(p => p.id === payload.fromPlayer);
      if (fromIdx >= 0) {
        player.points = (player.points || 0) + amount;
        const from = { ...players[fromIdx] };
        from.points = (from.points || 0) - amount;
        players[fromIdx] = from;
      }
      players[pidx] = player;
      events.push({ type: 'modifier_steal', player: targetPlayerId, from: payload.fromPlayer, value: amount, ts: now });
      break;
    }

    case 'apply_shield': {
      player.activeShield = !player.activeShield;
      players[pidx] = player;
      events.push({ type: 'modifier_shield', player: targetPlayerId, active: player.activeShield, ts: now });
      break;
    }

    case 'apply_block': {
      player.activeBlock = !player.activeBlock;
      players[pidx] = player;
      events.push({ type: 'modifier_block', player: targetPlayerId, active: player.activeBlock, ts: now });
      break;
    }

    case 'apply_double': {
      player.activeDouble = !player.activeDouble;
      players[pidx] = player;
      events.push({ type: 'modifier_double', player: targetPlayerId, active: player.activeDouble, ts: now });
      break;
    }

    case 'take_token': {
      // Quitar el token de quien lo tenga
      const newPlayers = players.map(p => ({ ...p, hasFirstPlayerToken: p.id === targetPlayerId }));
      events.push({ type: 'token_taken', player: targetPlayerId, ts: now });
      return { players: newPlayers, events, victoryResult: null };
    }

    case 'select_win_condition': {
      // Solo registra la condición, no cambia puntaje
      events.push({ type: 'win_condition', player: targetPlayerId, condition: payload.condition, ts: now });
      player.lastCondition = payload.condition;
      players[pidx] = player;
      break;
    }

    case 'undo': {
      // Reverter el último evento que afecta a este jugador
      const lastEvtIdx = events.map((e,i)=>({...e,_i:i})).reverse()
        .find(e => e.player === targetPlayerId && ['add_points','add_win','lose_life','eliminate'].includes(e.type));
      if (lastEvtIdx) {
        const evt = lastEvtIdx;
        events.splice(lastEvtIdx._i, 1);
        // Invertir el efecto
        if (evt.type === 'add_points') player.points = (player.points||0) - evt.value;
        if (evt.type === 'add_win')    player.wins   = Math.max(0, (player.wins||0) - 1);
        if (evt.type === 'lose_life')  player.lives  = (player.lives||0) + 1;
        if (evt.type === 'eliminate')  { player.eliminated = false; player.finalPosition = null; }
        players[pidx] = player;
      }
      break;
    }

    default:
      break;
  }

  return { players, events, victoryResult };
}

/**
 * _checkVictory — evalúa si alguien ganó tras cada acción
 */
function _checkVictory(players, spec) {
  const active = players.filter(p => !p.eliminated);

  // Solo queda 1 → gana
  if (active.length === 1 && players.length > 1) {
    return { winner: active[0], reason: 'last_active' };
  }

  // Victoria por puntos instantánea
  if (spec.victoryMode === 'points' && spec.pointsValidation === 'instant') {
    if (spec.pointsWinMode === 'reach_x' && spec.targetScore) {
      const winner = active.find(p => (p.points || 0) >= spec.targetScore);
      if (winner) return { winner, reason: 'reached_target' };
    }
    if (spec.pointsWinMode === 'exact_x' && spec.targetScore) {
      const winner = active.find(p => (p.points || 0) === spec.targetScore);
      if (winner) return { winner, reason: 'exact_target' };
    }
  }

  // Victoria por victorias de ronda
  if (spec.victoryMode === 'wins' && spec.winsMode === 'target') {
    const winner = active.find(p => (p.wins || 0) >= spec.winsTarget);
    if (winner) return { winner, reason: 'wins_target' };
  }

  return null;
}

/**
 * sortPlayers — ordena el marcador según el modo de victoria
 */
function sortPlayers(players, spec) {
  return [...players].sort((a, b) => {
    // Eliminados siempre al final
    if (!a.eliminated && b.eliminated) return -1;
    if (a.eliminated && !b.eliminated) return 1;

    switch (spec.victoryMode) {
      case 'wins':   return (b.wins  || 0) - (a.wins  || 0);
      case 'lives':  return (b.lives || 0) - (a.lives || 0);
      case 'points':
      default:       return (b.points || 0) - (a.points || 0);
    }
  });
}

/**
 * getScoreDisplay — qué mostrar en el marcador de cada jugador
 */
function getScoreDisplay(player, spec) {
  switch (spec.primaryUnit) {
    case 'lives':
      return {
        main:  player.lives !== undefined ? player.lives : '—',
        unit:  '❤️',
        sub:   `${player.wins || 0} 🏆`,
        label: 'vidas',
      };
    case 'wins':
      return {
        main:  player.wins || 0,
        unit:  '🏆',
        sub:   `${player.points || 0} pts`,
        label: 'victorias',
      };
    case 'points':
    default:
      return {
        main:  player.points || 0,
        unit:  'pts',
        sub:   player.wins > 0 ? `${player.wins} 🏆` : null,
        label: 'puntos',
        delta: player.lastDelta,  // para mostrar +N animado
      };
  }
}

/**
 * buildInitialPlayers — inicializa los jugadores con los campos del spec
 */
function buildInitialPlayers(rawPlayers, spec) {
  return rawPlayers.map(p => ({
    ...spec.playerInit,
    id:    p.id,
    name:  p.name,
    emoji: p.emoji,
    color: p.color,
    isHost: p.isHost || false,
    // Dar token al primer jugador
    hasFirstPlayerToken: spec.hasFirstPlayerToken && rawPlayers.indexOf(p) === 0,
  }));
}
