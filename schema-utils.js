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
      'registers','tools','toolsAffect','roles',
      'endConditions','exportFormat','modifiers','winConditions'
    ];

    arrays.forEach(k=>{
      if(!Array.isArray(cfg[k])) cfg[k] = [];
    });

    // Defaults inteligentes
    if(cfg.registers.length === 0){
      cfg.registers = ['points'];
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

    return cfg;
  }

  // ═══════════════════════════════════════════════════════════════
  // VALIDACIÓN (HUMANA)
  // ═══════════════════════════════════════════════════════════════

  function validateConfig(schema, incoming){
    const cfg = sanitizeConfig(schema, incoming);
    const errors = [];
    const warnings = [];

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
    return {
      title: cfg.name || 'Sin nombre',
      emoji: cfg.emoji || '🎮',
      players: `${cfg.minPlayers}-${cfg.maxPlayers} jugadores`,
      mode: cfg.type === 'teams'
        ? `Equipos (${cfg.numTeams})`
        : cfg.type === 'cooperative'
          ? 'Cooperativo'
          : 'Individual',
      victory:
        cfg.victoryMode === 'points'
          ? `Puntos a ${cfg.targetScore}`
          : cfg.victoryMode === 'wins'
          ? `Victorias a ${cfg.winsTarget}`
          : cfg.victoryMode || 'No definida'
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
        minPlayers: cfg.minPlayers,
        maxPlayers: cfg.maxPlayers
      },
      structure: {
        useRounds: cfg.useRounds,
        rounds: cfg.rounds,
        useTurns: cfg.useTurns
      },
      victory: {
        victoryMode: cfg.victoryMode,
        targetScore: cfg.targetScore,
        winsTarget: cfg.winsTarget
      },
      progress: {
        registers: cfg.registers,
        capturedBy: cfg.capturedBy
      },
      tools: {
        useTools: cfg.useTools,
        tools: cfg.tools
      },
      roles: {
        roles: cfg.roles
      },
      finish: {
        saveHistory: cfg.saveHistory,
        endConditions: cfg.endConditions
      }
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // EXPORT FINAL
  // ═══════════════════════════════════════════════════════════════

  function exportPayload(schema, incoming){
    const validation = validateConfig(schema, incoming);

    return {
      schemaVersion: '1.0',
      exportedAt: new Date().toISOString(),
      valid: validation.valid,
      errors: validation.errors,
      warnings: validation.warnings,
      summary: summarizeConfig(validation.sanitized),
      config: validation.sanitized,
      grouped: groupConfigForStorage(validation.sanitized)
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
    groupConfigForStorage
  };

})();