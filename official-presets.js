// ═══════════════════════════════════════════════════════════════
// official-presets.js — BOARDGAMEZ OS v1.0
// Presets oficiales iniciales para validar producto
// ═══════════════════════════════════════════════════════════════

window.OFFICIAL_PRESETS = [
  {
    id: 'strike',
    label: 'Strike',
    emoji: '🎲',
    description: 'Último jugador con dados activos. Config minimalista para eliminación.',
    config: {
      name: 'Strike',
      emoji: '🎲',
      description: 'Preset oficial Strike',
      type: 'individual',
      minPlayers: 2,
      maxPlayers: 5,
      useRounds: false,
      useTurns: true,
      turnOrder: 'fixed',
      victoryMode: 'elimination',
      useElimination: true,
      elimMethod: 'manual',
      registers: ['wins'],
      playMode: 'minimal',
      playObjects: ['defeat_button', 'round_resolution_popup'],
      defeatButtonLabel: 'Eliminado',
      defeatButtonScope: 'individual',
      roundResolutionFields: ['winner', 'notes'],
      objectControlScope: 'host',
      trackingLevel: 'normal',
      trackWinnerReason: true,
      trackDefeatReason: true,
      trackRoundHistory: true
    }
  },
  {
    id: 'cubilete',
    label: 'Cubilete',
    emoji: '🎲',
    description: 'Seguimiento de fichas/vidas y resolución manual por ronda.',
    config: {
      name: 'Cubilete',
      emoji: '🎲',
      description: 'Preset oficial Cubilete',
      type: 'individual',
      minPlayers: 2,
      maxPlayers: 6,
      useRounds: true,
      rounds: 10,
      roundClose: 'manual',
      useTurns: true,
      turnOrder: 'fixed',
      useFirstPlayerToken: true,
      victoryMode: 'lives',
      useElimination: true,
      elimMethod: 'manual',
      registers: ['lives', 'wins'],
      playMode: 'guided',
      playObjects: ['score_input', 'counter_set', 'round_resolution_popup'],
      scoreInputLabel: 'Ajustar fichas',
      scoreInputTarget: 'lives',
      scoreInputAllowNegative: true,
      scoreInputQuickValues: ['-1', '-2', '+1'],
      counterSet: [
        { id:'fichas', label:'Fichas', color:'#FFD447', icon:'🪙', scope:'player', initialValue:5, min:0, max:null, resetOn:'never', visibleTo:'all' }
      ],
      roundResolutionFields: ['winner', 'win_type', 'payout', 'notes'],
      objectControlScope: 'host',
      trackingLevel: 'detailed',
      trackWinnerReason: true,
      trackFinancials: true,
      trackRoundHistory: true,
      winConditions: ['Par', 'Dos pares', 'Tercia', 'Full', 'Póker', 'Quintilla']
    }
  },
  {
    id: 'sushi_go_score_tracker',
    label: 'Sushi Go Score Tracker',
    emoji: '🍣',
    description: 'Captura de puntos por ronda, historial y desempate manual.',
    config: {
      name: 'Sushi Go Score Tracker',
      emoji: '🍣',
      description: 'Preset oficial Sushi Go',
      type: 'individual',
      minPlayers: 2,
      maxPlayers: 5,
      useRounds: true,
      rounds: 3,
      roundClose: 'manual',
      useTurns: false,
      victoryMode: 'points',
      targetScore: 20,
      registers: ['points', 'wins'],
      playMode: 'guided',
      playObjects: ['score_input', 'round_resolution_popup'],
      scoreInputLabel: 'Capturar puntos de ronda',
      scoreInputTarget: 'points',
      scoreInputAllowNegative: false,
      scoreInputQuickValues: ['1', '5', '10'],
      roundResolutionFields: ['winner', 'round_points', 'notes'],
      objectControlScope: 'host',
      trackingLevel: 'detailed',
      trackWinnerReason: true,
      trackRoundHistory: true,
      tiebreak: 'host'
    }
  }
];
