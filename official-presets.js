// ═══════════════════════════════════════════════════════════════
// official-presets.js — BOARDGAMEZ OS
// Presets oficiales para validar el motor
// ═══════════════════════════════════════════════════════════════

window.OFFICIAL_PRESETS = {
  strike: {
    title: 'Strike',
    emoji: '🎳',
    description: 'Preset centrado en eliminación y último jugador en pie.',
    config: {
      name: 'Strike',
      emoji: '🎳',
      description: 'Preset oficial para Strike',
      type: 'individual',
      minPlayers: 2,
      maxPlayers: 8,
      useRounds: false,
      useTurns: false,
      victoryMode: 'elimination',
      elimWinMode: 'last_player',
      registers: ['points'],
      playMode: 'minimal',
      playObjects: ['defeat_button','counter_set'],
      defeatButtonLabel: 'Eliminado',
      defeatButtonScope: 'individual',
      counterSet: [
        {
          id: 'dice_pool',
          label: 'Dados',
          color: '#FFD447',
          icon: '🎲',
          scope: 'player',
          initialValue: 8,
          min: 0,
          max: null,
          resetOn: 'never',
          visibleTo: 'all'
        }
      ],
      objectControlScope: 'host',
      roles: ['host','player'],
      trackingLevel: 'normal',
      trackWinnerReason: true,
      trackDefeatReason: true,
      trackRoundHistory: true,
      trackFinancials: false,
      trackTimers: false
    }
  },

  cubilete: {
    title: 'Cubilete',
    emoji: '🎲',
    description: 'Preset con captura manual, popup de ronda y contadores.',
    config: {
      name: 'Cubilete',
      emoji: '🎲',
      description: 'Score tracker para cubilete',
      type: 'individual',
      minPlayers: 2,
      maxPlayers: 6,
      useRounds: true,
      rounds: 10,
      roundClose: 'manual',
      useTurns: true,
      turnOrder: 'fixed',
      useFirstPlayerToken: true,
      victoryMode: 'manual',
      manualWinMode: 'host_end',
      registers: ['points'],
      playMode: 'standard',
      playObjects: ['score_input','counter_set','round_resolution_popup','first_player_token'],
      scoreInputLabel: 'Capturar',
      scoreInputTarget: 'points',
      scoreInputAllowNegative: false,
      scoreInputQuickValues: ['1','5','10'],
      counterSet: [
        {
          id: 'chips',
          label: 'Fichas',
          color: '#FFD447',
          icon: '🪙',
          scope: 'player',
          initialValue: 5,
          min: 0,
          max: null,
          resetOn: 'never',
          visibleTo: 'all'
        }
      ],
      roundResolutionFields: ['winner','win_type','payout','notes'],
      objectControlScope: 'host',
      trackingLevel: 'deep',
      trackWinnerReason: true,
      trackDefeatReason: true,
      trackRoundHistory: true,
      trackFinancials: true,
      trackTimers: false
    }
  },

  sushiGoScoreTracker: {
    title: 'Sushi Go Score Tracker',
    emoji: '🍣',
    description: 'Preset para captura de puntos por ronda.',
    config: {
      name: 'Sushi Go Score Tracker',
      emoji: '🍣',
      description: 'Marcador por rondas para Sushi Go',
      type: 'individual',
      minPlayers: 2,
      maxPlayers: 5,
      useRounds: true,
      rounds: 3,
      roundClose: 'manual',
      useTurns: false,
      victoryMode: 'points',
      pointsWinMode: 'most',
      pointsValidation: 'end_round',
      registers: ['points'],
      playMode: 'minimal',
      playObjects: ['score_input','round_resolution_popup'],
      scoreInputLabel: 'Puntos de ronda',
      scoreInputTarget: 'points',
      scoreInputAllowNegative: false,
      scoreInputQuickValues: ['1','3','5','10'],
      roundResolutionFields: ['winner','round_points','notes'],
      objectControlScope: 'host',
      trackingLevel: 'normal',
      trackWinnerReason: true,
      trackDefeatReason: false,
      trackRoundHistory: true,
      trackFinancials: false,
      trackTimers: false
    }
  }
};
