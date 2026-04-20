// ═══════════════════════════════════════════════════════════════
// SchemaUtils — BOARDGAMEZ OS
// Helpers para manejar ENGINE_SCHEMA de forma declarativa
// ═══════════════════════════════════════════════════════════════

window.SchemaUtils = (function(){

  // ── CLONE ────────────────────────────────────────────────────
  function clone(v){
    return JSON.parse(JSON.stringify(v));
  }

  // ── BUILD DEFAULT CONFIG ─────────────────────────────────────
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

  // ── NORMALIZE CONFIG (IMPORTANTE) ─────────────────────────────
  function normalizeConfig(schema, incoming){
    const defaults = buildDefaults(schema);
    return {
      ...defaults,
      ...(incoming || {})
    };
  }

  // ── MATCH RULE ───────────────────────────────────────────────
  function matchRule(value, expected){
    if(Array.isArray(expected)){
      return expected.includes(value);
    }
    return value === expected;
  }

  // ── VISIBILITY ENGINE ────────────────────────────────────────
  function isVisible(field, config){
    if(!field.visible_if) return true;

    return Object.entries(field.visible_if).every(([key, expected])=>{
      return matchRule(config[key], expected);
    });
  }

  // ── COLLAPSE ENGINE (para futuro) ────────────────────────────
  function isCollapsed(section, config){
    if(!section.collapsed_if) return false;

    return Object.entries(section.collapsed_if).every(([key, expected])=>{
      return matchRule(config[key], expected);
    });
  }

  // ── EXPORT ───────────────────────────────────────────────────
  return {
    clone,
    buildDefaults,
    normalizeConfig,
    isVisible,
    isCollapsed
  };

})();