// ═══════════════════════════════════════════════════════════════
// ENGINE SCHEMA — BOARDGAMEZ OS
// Fuente única de verdad para builder + diagrama + config
// ═══════════════════════════════════════════════════════════════

window.ENGINE_SCHEMA = {
  sections: [

    // ──────────────────────────────────────────────────────────
    // GENERAL
    // ──────────────────────────────────────────────────────────
    {
      id: "general",
      title: "Información general",
      icon: "🎮",
      fields: [
        { id: "name", type: "text", label: "Nombre", default: "" },
        { id: "emoji", type: "text", label: "Emoji", default: "🎮" },
        { id: "description", type: "textarea", label: "Descripción", default: "" },

        {
          id: "type",
          type: "select",
          label: "Tipo de partida",
          default: "individual",
          options: [
            { value: "individual", label: "Individual" },
            { value: "teams", label: "Equipos" },
            { value: "cooperative", label: "Cooperativo" }
          ]
        },

        {
          id: "numTeams",
          type: "number",
          label: "Número de equipos",
          default: 2,
          visible_if: { type: "teams" }
        },

        { id: "minPlayers", type: "number", label: "Mínimo", default: 2 },
        { id: "maxPlayers", type: "number", label: "Máximo", default: 8 }
      ]
    },

    // ──────────────────────────────────────────────────────────
    // ESTRUCTURA
    // ──────────────────────────────────────────────────────────
    {
      id: "structure",
      title: "Estructura",
      icon: "🏗️",
      fields: [
        { id: "useRounds", type: "boolean", label: "Usar rondas", default: true },

        {
          id: "rounds",
          type: "number",
          label: "Rondas",
          default: 3,
          visible_if: { useRounds: true }
        },

        {
          id: "roundClose",
          type: "select",
          label: "Cierre de ronda",
          default: "manual",
          visible_if: { useRounds: true },
          options: [
            { value: "manual", label: "Manual" },
            { value: "timer", label: "Timer" },
            { value: "auto", label: "Auto" }
          ]
        },

        { id: "useTurns", type: "boolean", label: "Usar turnos", default: false }
      ]
    },

    // ──────────────────────────────────────────────────────────
    // VICTORIA
    // ──────────────────────────────────────────────────────────
    {
      id: "victory",
      title: "Victoria",
      icon: "🏆",
      fields: [
        {
          id: "victoryMode",
          type: "select",
          label: "Modo de victoria",
          default: "points",
          options: [
            { value: "points", label: "Puntos" },
            { value: "wins", label: "Victorias" },
            { value: "lives", label: "Vidas" }
          ]
        },

        {
          id: "targetScore",
          type: "number",
          label: "Meta de puntos",
          default: 100,
          visible_if: { victoryMode: "points" }
        },

        {
          id: "winsTarget",
          type: "number",
          label: "Meta de victorias",
          default: 3,
          visible_if: { victoryMode: "wins" }
        }
      ]
    },

    // ──────────────────────────────────────────────────────────
    // PROGRESO
    // ──────────────────────────────────────────────────────────
    {
      id: "progress",
      title: "Progreso",
      icon: "📊",
      fields: [
        {
          id: "registers",
          type: "multi_select",
          label: "Qué se registra",
          default: ["points"],
          options: [
            { value: "points", label: "Puntos" },
            { value: "wins", label: "Victorias" },
            { value: "lives", label: "Vidas" }
          ]
        },

        {
          id: "capturedBy",
          type: "select",
          label: "Quién captura",
          default: "self",
          options: [
            { value: "self", label: "Jugador" },
            { value: "host", label: "Host" },
            { value: "all", label: "Todos" }
          ]
        }
      ]
    }

  ]
};