// ═══════════════════════════════════════════════════════════════
// SchemaUtils — BOARDGAMEZ OS
// Validación + sanitización + normalización para Schema Builder
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

  // 🧼 SANITIZE
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
    const arrays = ['registers','tools','roles','modifiers','winConditions'];
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

    return cfg;
  }

  // ✅ VALIDACIÓN
  function validateConfig(schema, incoming){
    const cfg = sanitizeConfig(schema, incoming);
    const errors = [];
    const warnings = [];

    if(!cfg.name || cfg.name.length < 2){
      errors.push('Nombre inválido');
    }

    if(cfg.minPlayers > cfg.maxPlayers){
      errors.push('minPlayers no puede ser mayor que maxPlayers');
    }

    if(cfg.type === 'teams' && cfg.numTeams < 2){
      errors.push('Debe haber mínimo 2 equipos');
    }

    if(cfg.useRounds && cfg.rounds < 1){
      errors.push('Rondas inválidas');
    }

    if(cfg.victoryMode === 'points' && cfg.targetScore < 1){
      errors.push('Meta de puntos inválida');
    }

    if(String(incoming?.emoji || '').length > 8){
      warnings.push('Emoji inválido, se ajustó automáticamente');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      sanitized: cfg
    };
  }

  // 📦 EXPORT FINAL
  function exportPayload(schema, incoming){
    const validation = validateConfig(schema, incoming);

    return {
      schemaVersion: '1.0',
      exportedAt: new Date().toISOString(),
      valid: validation.valid,
      errors: validation.errors,
      warnings: validation.warnings,
      config: validation.sanitized
    };
  }

  return {
    normalizeConfig,
    isVisible,
    isCollapsed,
    sanitizeConfig,
    validateConfig,
    exportPayload
  };

})();