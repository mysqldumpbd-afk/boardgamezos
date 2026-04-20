// ═══════════════════════════════════════════════════════════════
// config-interpreter.js — FIXED (host + player compatible)
// ═══════════════════════════════════════════════════════════════

function interpret(config) {
  if (!config) return _defaultSpec();

  const spec = {
    type:        config.type       || 'individual',
    numTeams:    config.numTeams   || 2,
    minPlayers:  config.minPlayers || 2,
    maxPlayers:  config.maxPlayers || 8,

    hasRounds:      config.useRounds    || false,
    totalRounds:    config.rounds === 'libre' ? null : (parseInt(config.rounds) || null),
    roundClose:     config.roundClose   || 'manual',
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

    victoryMode:      config.victoryMode     || 'points',
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

    hasDefeat:         config.useDefeat       || false,
    defeatType:        config.defeatType      || 'points',
    defeatConsequence: config.defeatConsequence || 'eliminated',
    defeatMoment:      config.defeatMoment    || 'round_end',

    registers:      config.registers     || ['points'],
    captureType:    config.captureType   || 'manual',

    // FIX CLAVE
    capturedBy:     config.capturedBy    || 'self',

    valueNature:    config.valueNature   || 'positive',
    accumulation:   config.accumulation  || 'global',
    modifiers:      config.modifiers     || [],
    scoreVisibility: config.scoreVisibility || 'all',

    hasElimination: config.useElimination || false,
    elimStartsAt:   config.elimStartsAt  || 'round_1',
    elimStartRound: config.elimStartRound || 1,
    elimMethod:     config.elimMethod    || 'last_place',
    elimTieRule:    config.elimTieRule   || 'host',
    elimAftermath:  config.elimAftermath || 'out',

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

    roles: {
      hostControlsGame: true,
      hostIsAlsoPlayer: true
    }
  };

  return spec;
}

function _defaultSpec() {
  return {
    type: 'individual',
    minPlayers: 2,
    maxPlayers: 8,
    hasRounds: false,
    hasTurns: false,
    victoryMode: 'points',
    registers: ['points'],
    capturedBy: 'self',
    roles: {
      hostControlsGame: true,
      hostIsAlsoPlayer: true
    }
  };
}
