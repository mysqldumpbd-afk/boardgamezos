window.ENGINE_SCHEMA = {
  schemaVersion: "1.0",
  sections: [
    {
      id: "general",
      title: "Información general",
      icon: "🎮",
      color: "#9B5DE5",
      fields: [
        { id: "name", type: "text", label: "Nombre", default: "", required: true },
        {
          id: "emoji",
          type: "select",
          label: "Emoji",
          default: "🎮",
          options: [
            { value: "🎮", label: "🎮" },
            { value: "🎲", label: "🎲" },
            { value: "🏆", label: "🏆" },
            { value: "⚔️", label: "⚔️" },
            { value: "🃏", label: "🃏" },
            { value: "🪙", label: "🪙" },
            { value: "🔥", label: "🔥" },
            { value: "👾", label: "👾" }
          ]
        },
        { id: "description", type: "textarea", label: "Descripción", default: "" },
        {
          id: "type",
          type: "select",
          label: "Tipo de partida",
          default: "individual",
          required: true,
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
        { id: "minPlayers", type: "number", label: "Mínimo de jugadores", default: 2, required: true },
        { id: "maxPlayers", type: "number", label: "Máximo de jugadores", default: 8, required: true }
      ]
    },
    {
      id: "structure",
      title: "Estructura",
      icon: "🏗️",
      color: "#00F5FF",
      fields: [
        { id: "useRounds", type: "boolean", label: "Usar rondas", default: true },
        {
          id: "rounds",
          type: "number",
          label: "Rondas",
          default: 3,
          visible_if: { useRounds: true },
          required: true
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
    {
      id: "victory",
      title: "Victoria",
      icon: "🏆",
      color: "#FFD447",
      fields: [
        {
          id: "victoryMode",
          type: "select",
          label: "Modo de victoria",
          default: "points",
          required: true,
          options: [
            { value: "points", label: "Puntos" },
            { value: "wins", label: "Victorias" },
            { value: "lives", label: "Vidas" },
            { value: "manual", label: "Manual" }
          ]
        },
        {
          id: "targetScore",
          type: "number",
          label: "Meta de puntos",
          default: 100,
          visible_if: { victoryMode: "points" },
          required: true
        },
        {
          id: "winsTarget",
          type: "number",
          label: "Meta de victorias",
          default: 3,
          visible_if: { victoryMode: "wins" },
          required: true
        }
      ]
    },
    {
      id: "progress",
      title: "Progreso",
      icon: "📊",
      color: "#00FF9D",
      fields: [
        {
          id: "registers",
          type: "multi_select",
          label: "Qué se registra",
          default: ["points"],
          required: true,
          options: [
            { value: "points", label: "Puntos" },
            { value: "wins", label: "Victorias" },
            { value: "lives", label: "Vidas" },
            { value: "resources", label: "Recursos" },
            { value: "coins", label: "Monedas" },
            { value: "custom", label: "Custom" }
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
    },
    {
      id: "tools",
      title: "Herramientas",
      icon: "🧰",
      color: "#9B5DE5",
      fields: [
        { id: "useTools", type: "boolean", label: "Usar herramientas", default: false },
        {
          id: "tools",
          type: "multi_select",
          label: "Herramientas activas",
          default: [],
          visible_if: { useTools: true },
          options: [
            { value: "dice", label: "Dados" },
            { value: "coin", label: "Moneda" },
            { value: "wheel", label: "Ruleta" },
            { value: "counter", label: "Contador" }
          ]
        }
      ]
    },
    {
      id: "rules",
      title: "Reglas / eventos",
      icon: "🧠",
      color: "#FF6B35",
      fields: [
        {
          id: "winConditions",
          type: "list_text",
          label: "Condiciones especiales",
          default: []
        },
        {
          id: "customRules",
          type: "list_text",
          label: "Triggers o reglas del juego",
          default: []
        }
      ]
    },
    {
      id: "finish",
      title: "Finalización",
      icon: "🏁",
      color: "#4A90FF",
      fields: [
        { id: "saveHistory", type: "boolean", label: "Guardar historial", default: true },
        {
          id: "endConditions",
          type: "multi_select",
          label: "Cómo termina",
          default: ["victory"],
          options: [
            { value: "victory", label: "Victoria" },
            { value: "manual", label: "Manual" },
            { value: "time_over", label: "Tiempo agotado" }
          ]
        }
      ]
    }
  ]
};