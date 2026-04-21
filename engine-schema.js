window.ENGINE_SCHEMA = {
  schemaVersion: "1.5",
  sections: [

    // ──────────────────────────────────────────────────────────
    // 1. INFORMACIÓN GENERAL
    // ──────────────────────────────────────────────────────────
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
            { value: "👾", label: "👾" },
            { value: "🐉", label: "🐉" },
            { value: "🎯", label: "🎯" }
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

        {
          id: "roomAccess",
          type: "select",
          label: "Acceso",
          default: "code",
          options: [
            { value: "public", label: "Pública" },
            { value: "private", label: "Privada" },
            { value: "code", label: "Código" },
            { value: "link", label: "Link" }
          ]
        },

        { id: "minPlayers", type: "number", label: "Mínimo de jugadores", default: 2, required: true },
        { id: "maxPlayers", type: "number", label: "Máximo de jugadores", default: 8, required: true }
      ]
    },

    // ──────────────────────────────────────────────────────────
    // 2. ESTRUCTURA
    // ──────────────────────────────────────────────────────────
    {
      id: "structure",
      title: "Estructura de partida",
      icon: "🏗️",
      color: "#00F5FF",
      fields: [
        { id: "useRounds", type: "boolean", label: "Usar rondas", default: true },

        {
          id: "rounds",
          type: "select",
          label: "Número de rondas",
          default: 3,
          visible_if: { useRounds: true },
          required: true,
          options: [
            { value: 1, label: "1" },
            { value: 2, label: "2" },
            { value: 3, label: "3" },
            { value: 4, label: "4" },
            { value: 5, label: "5" },
            { value: 6, label: "6" },
            { value: 7, label: "7" },
            { value: 8, label: "8" },
            { value: 9, label: "9" },
            { value: 10, label: "10" },
            { value: "libre", label: "∞ Libre" }
          ]
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
            { value: "all_done", label: "Auto" }
          ]
        },

        {
          id: "roundTimerSecs",
          type: "number",
          label: "Segundos por ronda",
          default: 60,
          visible_if: { useRounds: true, roundClose: "timer" }
        },

        {
          id: "roundReset",
          type: "select",
          label: "Reinicio al cerrar",
          default: "nothing",
          visible_if: { useRounds: true },
          options: [
            { value: "nothing", label: "Nada" },
            { value: "round_points", label: "Pts ronda" },
            { value: "turns", label: "Turnos" },
            { value: "tools", label: "Herramientas" }
          ]
        },

        { id: "useTurns", type: "boolean", label: "Usar turnos", default: false },

        {
          id: "turnOrder",
          type: "select",
          label: "Orden de turnos",
          default: "fixed",
          visible_if: { useTurns: true },
          options: [
            { value: "fixed", label: "Fijo" },
            { value: "random", label: "Aleatorio" },
            { value: "rotative", label: "Rotativo" },
            { value: "score", label: "Por puntaje" }
          ]
        },

        {
          id: "canSkipTurn",
          type: "boolean",
          label: "Permitir saltar turno",
          default: false,
          visible_if: { useTurns: true }
        },

        {
          id: "hasExtraTurns",
          type: "boolean",
          label: "Permitir turnos extra",
          default: false,
          visible_if: { useTurns: true }
        },

        {
          id: "turnLimitPerRound",
          type: "boolean",
          label: "Limitar turnos por ronda",
          default: false,
          visible_if: { useTurns: true }
        },

        {
          id: "turnLimitCount",
          type: "number",
          label: "Turnos por ronda",
          default: 1,
          visible_if: { useTurns: true, turnLimitPerRound: true }
        },

        {
          id: "noTurnMode",
          type: "select",
          label: "Modo sin turnos",
          default: "simultaneous",
          visible_if: { useTurns: false },
          options: [
            { value: "simultaneous", label: "Simultáneo" },
            { value: "mixed", label: "Mixto" }
          ]
        },

        {
          id: "useFirstPlayerToken",
          type: "boolean",
          label: "Token primer jugador",
          default: false
        },

        { id: "useTimer", type: "boolean", label: "Temporizador general", default: false },

        {
          id: "timerScope",
          type: "select",
          label: "Temporizador por",
          default: "turn",
          visible_if: { useTimer: true },
          options: [
            { value: "turn", label: "Turno" },
            { value: "round", label: "Ronda" },
            { value: "match", label: "Partida" }
          ]
        },

        {
          id: "timerSecs",
          type: "number",
          label: "Segundos del temporizador",
          default: 60,
          visible_if: { useTimer: true }
        },

        {
          id: "timerVisualAlert",
          type: "boolean",
          label: "Alerta visual",
          default: true,
          visible_if: { useTimer: true }
        },

        {
          id: "timerSoundAlert",
          type: "boolean",
          label: "Alerta sonora",
          default: true,
          visible_if: { useTimer: true }
        },

        {
          id: "timerExpireAction",
          type: "select",
          label: "Al expirar",
          default: "nothing",
          visible_if: { useTimer: true },
          options: [
            { value: "nothing", label: "Nada" },
            { value: "skip", label: "Saltar turno" },
            { value: "zero", label: "0 puntos" },
            { value: "penalty", label: "Penalización" },
            { value: "auto", label: "Automático" }
          ]
        }
      ]
    },

    // ──────────────────────────────────────────────────────────
    // 3. VICTORIA
    // ──────────────────────────────────────────────────────────
    {
      id: "victory",
      title: "Condición de victoria",
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
            { value: "elimination", label: "Eliminación" },
            { value: "objective", label: "Objetivo / evento" },
            { value: "time", label: "Tiempo" },
            { value: "manual", label: "Manual" }
          ]
        },

        {
          id: "pointsWinMode",
          type: "select",
          label: "Victoria por puntos",
          default: "most",
          visible_if: { victoryMode: "points" },
          options: [
            { value: "most", label: "Más puntos" },
            { value: "target", label: "Llegar a X" },
            { value: "exact", label: "Exacto X" }
          ]
        },

        {
          id: "pointsValidation",
          type: "select",
          label: "Validación de puntos",
          default: "instant",
          visible_if: { victoryMode: "points" },
          options: [
            { value: "instant", label: "Al instante" },
            { value: "round_end", label: "Fin de ronda" }
          ]
        },

        {
          id: "targetScore",
          type: "number",
          label: "Meta de puntos",
          default: 100,
          visible_if: { victoryMode: "points", pointsWinMode: ["target", "exact"] },
          required: true
        },

        {
          id: "winsMode",
          type: "select",
          label: "Victoria por victorias",
          default: "most",
          visible_if: { victoryMode: "wins" },
          options: [
            { value: "most", label: "Más rondas" },
            { value: "target", label: "Meta N" },
            { value: "last_round", label: "Última ronda decisiva" }
          ]
        },

        {
          id: "winsTarget",
          type: "number",
          label: "Meta de victorias",
          default: 3,
          visible_if: { victoryMode: "wins" },
          required: true
        },

        {
          id: "livesWinMode",
          type: "select",
          label: "Victoria por vidas",
          default: "last_alive",
          visible_if: { victoryMode: "lives" },
          options: [
            { value: "last_alive", label: "Último con vida" },
            { value: "most_lives", label: "Más vidas" }
          ]
        },

        {
          id: "elimWinMode",
          type: "select",
          label: "Victoria por eliminación",
          default: "last_player",
          visible_if: { victoryMode: "elimination" },
          options: [
            { value: "last_player", label: "Último jugador" },
            { value: "last_team", label: "Último equipo" },
            { value: "eliminate_all", label: "Eliminar todos" }
          ]
        },

        {
          id: "objectiveWinMode",
          type: "select",
          label: "Victoria por objetivo",
          default: "complete_mission",
          visible_if: { victoryMode: "objective" },
          options: [
            { value: "complete_mission", label: "Completar misión" },
            { value: "resource_goal", label: "Meta de recurso" },
            { value: "special_event", label: "Evento único" }
          ]
        },

        {
          id: "manualWinMode",
          type: "select",
          label: "Victoria manual",
          default: "host_end",
          visible_if: { victoryMode: "manual" },
          options: [
            { value: "host_end", label: "Host decide cuándo" },
            { value: "host_pick", label: "Host define ganador" }
          ]
        },

        {
          id: "tiebreak",
          type: "select",
          label: "Desempate",
          default: "host",
          options: [
            { value: "share", label: "Compartir" },
            { value: "tool", label: "Herramienta" },
            { value: "host", label: "Host" }
          ]
        },

        {
          id: "winConditions",
          type: "list_text",
          label: "Condiciones especiales de victoria",
          default: []
        }
      ]
    },

    // ──────────────────────────────────────────────────────────
    // 4. DERROTA
    // ──────────────────────────────────────────────────────────
    {
      id: "defeat",
      title: "Condición de derrota",
      icon: "💀",
      color: "#FF3B5C",
      fields: [
        { id: "useDefeat", type: "boolean", label: "Usar derrota explícita", default: false },

        {
          id: "defeatType",
          type: "select",
          label: "Tipo de derrota",
          default: "points",
          visible_if: { useDefeat: true },
          options: [
            { value: "points", label: "Por puntos" },
            { value: "wins", label: "Por victorias" },
            { value: "lives", label: "Por vidas" },
            { value: "elimination", label: "Por eliminación" },
            { value: "time", label: "Por tiempo" },
            { value: "objective", label: "Por objetivo fallido" },
            { value: "external", label: "Por evento externo" }
          ]
        },

        {
          id: "defeatMoment",
          type: "select",
          label: "Momento de evaluación",
          default: "round_end",
          visible_if: { useDefeat: true },
          options: [
            { value: "instant", label: "Inmediato" },
            { value: "turn_end", label: "Fin turno" },
            { value: "round_end", label: "Fin ronda" },
            { value: "phase_end", label: "Fin fase" },
            { value: "match_end", label: "Fin partida" }
          ]
        },

        {
          id: "defeatConsequence",
          type: "select",
          label: "Consecuencia",
          default: "eliminated",
          visible_if: { useDefeat: true },
          options: [
            { value: "eliminated", label: "Eliminado" },
            { value: "spectator", label: "Espectador" },
            { value: "skip_turn", label: "Pierde turno" },
            { value: "lose_points", label: "Pierde puntos" },
            { value: "weakened", label: "Debilitado" },
            { value: "record_only", label: "Solo registro" }
          ]
        }
      ]
    },

    // ──────────────────────────────────────────────────────────
    // 5. PROGRESO
    // ──────────────────────────────────────────────────────────
    {
      id: "progress",
      title: "Sistema de progreso",
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
            { value: "objectives", label: "Objetivos" },
            { value: "custom", label: "Custom" }
          ]
        },

        {
          id: "customCounterName",
          type: "text",
          label: "Nombre del contador custom",
          default: "",
          visible_if: { registers: ["custom"] }
        },

        {
          id: "captureType",
          type: "select",
          label: "Tipo de captura",
          default: "manual",
          options: [
            { value: "manual", label: "Manual" },
            { value: "automatic", label: "Automática" },
            { value: "tool", label: "Con herramienta" },
            { value: "camera", label: "Con cámara" },
            { value: "ai", label: "Con IA" }
          ]
        },

        {
          id: "valueNature",
          type: "select",
          label: "Naturaleza del valor",
          default: "positive",
          options: [
            { value: "positive", label: "Solo positivos" },
            { value: "signed", label: "Positivos y negativos" },
            { value: "integer", label: "Enteros" },
            { value: "decimal", label: "Decimales" }
          ]
        },

        {
          id: "accumulation",
          type: "select",
          label: "Acumulación",
          default: "global",
          options: [
            { value: "global", label: "Global" },
            { value: "round", label: "Por ronda" },
            { value: "reset_round", label: "Reinicia c/ronda" },
            { value: "persistent", label: "Siempre conserva" }
          ]
        },

        {
          id: "modifiers",
          type: "multi_select",
          label: "Modificadores",
          default: [],
          options: [
            { value: "bonus", label: "Bonus" },
            { value: "penalty", label: "Penalización" },
            { value: "multiplier", label: "Multiplicador" },
            { value: "steal", label: "Robo" },
            { value: "shield", label: "Escudo" },
            { value: "block", label: "Bloqueo" }
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
        },

        {
          id: "scoreVisibility",
          type: "select",
          label: "Visibilidad",
          default: "all",
          options: [
            { value: "all", label: "Todos ven todo" },
            { value: "partial", label: "Parcial" },
            { value: "hidden", label: "Oculto" }
          ]
        }
      ]
    },

    // ──────────────────────────────────────────────────────────
    // 6. ELIMINACIÓN
    // ──────────────────────────────────────────────────────────
    {
      id: "elimination",
      title: "Sistema de eliminación",
      icon: "☠️",
      color: "#FF3B5C",
      fields: [
        { id: "useElimination", type: "boolean", label: "Usar eliminación", default: false },

        {
          id: "elimStartsAt",
          type: "select",
          label: "Empieza en",
          default: "round_1",
          visible_if: { useElimination: true },
          options: [
            { value: "round_1", label: "Ronda 1" },
            { value: "custom_round", label: "Ronda específica" }
          ]
        },

        {
          id: "elimStartRound",
          type: "number",
          label: "Ronda de inicio",
          default: 1,
          visible_if: { useElimination: true, elimStartsAt: "custom_round" }
        },

        {
          id: "elimMethod",
          type: "select",
          label: "Método de eliminación",
          default: "last_place",
          visible_if: { useElimination: true },
          options: [
            { value: "last_place", label: "Último lugar" },
            { value: "manual", label: "Manual" },
            { value: "threshold", label: "Por umbral" }
          ]
        },

        {
          id: "elimTieRule",
          type: "select",
          label: "Empates en eliminación",
          default: "nobody",
          visible_if: { useElimination: true },
          options: [
            { value: "nobody", label: "Nadie" },
            { value: "all", label: "Todos" },
            { value: "host", label: "Host decide" }
          ]
        },

        {
          id: "elimAftermath",
          type: "select",
          label: "Después de eliminar",
          default: "out",
          visible_if: { useElimination: true },
          options: [
            { value: "out", label: "Sale del juego" },
            { value: "spectator", label: "Pasa a espectador" },
            { value: "can_watch", label: "Puede observar" }
          ]
        }
      ]
    },

    // ──────────────────────────────────────────────────────────
    // 7. HERRAMIENTAS
    // ──────────────────────────────────────────────────────────
    {
      id: "tools",
      title: "Herramientas integradas",
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
            { value: "coin", label: "Moneda" },
            { value: "dice", label: "Dados" },
            { value: "wheel", label: "Ruleta" },
            { value: "rps", label: "Piedra/Papel/Tijera" },
            { value: "counter", label: "Contador manual" },
            { value: "ai_judge", label: "Juez IA" }
          ]
        },

        {
          id: "toolsMode",
          type: "select",
          label: "Modo herramientas",
          default: "informal",
          visible_if: { useTools: true },
          options: [
            { value: "informal", label: "Libre" },
            { value: "formal", label: "Formal" }
          ]
        },

        {
          id: "toolsRegistered",
          type: "boolean",
          label: "Registrar herramientas en historial",
          default: false,
          visible_if: { useTools: true }
        },

        {
          id: "toolsAffect",
          type: "multi_select",
          label: "Qué afectan",
          default: [],
          visible_if: { useTools: true },
          options: [
            { value: "score", label: "Puntaje" },
            { value: "turn", label: "Turno" },
            { value: "elimination", label: "Eliminación" },
            { value: "events", label: "Eventos" },
            { value: "rules", label: "Reglas" }
          ]
        },

        {
          id: "diceType",
          type: "select",
          label: "Tipo de dado",
          default: "d6",
          visible_if: { useTools: true, tools: ["dice"] },
          options: [
            { value: "d4", label: "D4" },
            { value: "d6", label: "D6" },
            { value: "d8", label: "D8" },
            { value: "d10", label: "D10" },
            { value: "d12", label: "D12" },
            { value: "d20", label: "D20" },
            { value: "custom", label: "Custom" }
          ]
        },

        {
          id: "diceCustomSides",
          type: "number",
          label: "Lados custom",
          default: 6,
          visible_if: { useTools: true, tools: ["dice"], diceType: "custom" }
        },

        {
          id: "coinUse",
          type: "select",
          label: "Uso de moneda",
          default: "free",
          visible_if: { useTools: true, tools: ["coin"] },
          options: [
            { value: "free", label: "Libre" },
            { value: "official", label: "Oficial" }
          ]
        },

        {
          id: "wheelSegments",
          type: "select",
          label: "Segmentos ruleta",
          default: "fixed",
          visible_if: { useTools: true, tools: ["wheel"] },
          options: [
            { value: "fixed", label: "Fijos" },
            { value: "custom", label: "Custom" }
          ]
        },

        {
          id: "rpsScope",
          type: "select",
          label: "Alcance de PPS",
          default: "any",
          visible_if: { useTools: true, tools: ["rps"] },
          options: [
            { value: "any", label: "Cualquiera" },
            { value: "host_only", label: "Solo host" }
          ]
        }
      ]
    },
	
	//-----------------------------------------------------------
	// PLAY (Funcion para registrar objetos)
	//-----------------------------------------------------------
	{
	  id: "play",
	  title: "Objetos de partida",
	  icon: "🕹️",
	  color: "#00F5FF",
	  fields: [
		{
		  id: "playMode",
		  type: "select",
		  label: "Modo de interacción",
		  default: "minimal",
		  options: [
			{ value: "minimal", label: "Mínimo" },
			{ value: "standard", label: "Normal" },
			{ value: "detailed", label: "Detallado" }
		  ]
		},

		{
		  id: "playObjects",
		  type: "multi_select",
		  label: "Objetos disponibles en partida",
		  default: [],
		  options: [
			{ value: "victory_button", label: "Botón verde de victoria" },
			{ value: "defeat_button", label: "Botón rojo de derrota" },
			{ value: "score_input", label: "Calculadora / captura manual" },
			{ value: "counter_set", label: "Contadores" },
			{ value: "first_player_token", label: "Token primer jugador" },
			{ value: "coin_tool", label: "Moneda" },
			{ value: "dice_tool", label: "Dados" },
			{ value: "wheel_tool", label: "Ruleta" },
			{ value: "timer_match", label: "Cronómetro de partida" },
			{ value: "timer_round", label: "Cronómetro de ronda" },
			{ value: "timer_turn", label: "Cronómetro de turno" },
			{ value: "round_resolution_popup", label: "Popup resolución de ronda" }
		  ]
		},

		{
		  id: "victoryButtonLabel",
		  type: "text",
		  label: "Texto del botón verde",
		  default: "Gané",
		  visible_if: { playObjects: ["victory_button"] }
		},

		{
		  id: "victoryButtonScope",
		  type: "select",
		  label: "Qué resuelve el botón verde",
		  default: "round",
		  visible_if: { playObjects: ["victory_button"] },
		  options: [
			{ value: "round", label: "Victoria de ronda" },
			{ value: "match", label: "Victoria de partida" },
			{ value: "individual", label: "Jugador individual" },
			{ value: "team", label: "Equipo" }
		  ]
		},

		{
		  id: "defeatButtonLabel",
		  type: "text",
		  label: "Texto del botón rojo",
		  default: "Perdí",
		  visible_if: { playObjects: ["defeat_button"] }
		},

		{
		  id: "defeatButtonScope",
		  type: "select",
		  label: "Qué resuelve el botón rojo",
		  default: "round",
		  visible_if: { playObjects: ["defeat_button"] },
		  options: [
			{ value: "round", label: "Derrota de ronda" },
			{ value: "match", label: "Derrota de partida" },
			{ value: "individual", label: "Jugador individual" },
			{ value: "team", label: "Equipo" }
		  ]
		},

		{
		  id: "scoreInputLabel",
		  type: "text",
		  label: "Texto del botón de captura",
		  default: "Capturar puntos",
		  visible_if: { playObjects: ["score_input"] }
		},

		{
		  id: "scoreInputTarget",
		  type: "select",
		  label: "Qué captura la calculadora",
		  default: "points",
		  visible_if: { playObjects: ["score_input"] },
		  options: [
			{ value: "points", label: "Puntos" },
			{ value: "wins", label: "Victorias" },
			{ value: "lives", label: "Vidas" },
			{ value: "coins", label: "Monedas" },
			{ value: "resources", label: "Recursos" },
			{ value: "custom", label: "Custom" }
		  ]
		},

		{
		  id: "scoreInputAllowNegative",
		  type: "boolean",
		  label: "Permitir negativos",
		  default: false,
		  visible_if: { playObjects: ["score_input"] }
		},

		{
		  id: "scoreInputQuickValues",
		  type: "list_text",
		  label: "Valores rápidos (+1, +5, -1...)",
		  default: [],
		  visible_if: { playObjects: ["score_input"] }
		},

		{
		  id: "counterSet",
		  type: "list_text",
		  label: "Contadores definidos (nombre|color)",
		  default: [],
		  visible_if: { playObjects: ["counter_set"] }
		},

		{
		  id: "roundResolutionFields",
		  type: "multi_select",
		  label: "Campos del popup de resolución",
		  default: [],
		  visible_if: { playObjects: ["round_resolution_popup"] },
		  options: [
			{ value: "winner", label: "Ganador" },
			{ value: "win_type", label: "Tipo de victoria" },
			{ value: "shots_used", label: "Tiros usados" },
			{ value: "round_points", label: "Puntos de ronda" },
			{ value: "payout", label: "Pago / pozo" },
			{ value: "notes", label: "Notas" }
		  ]
		},

		{
		  id: "objectControlScope",
		  type: "select",
		  label: "Quién puede usar los objetos",
		  default: "host",
		  options: [
			{ value: "host", label: "Host" },
			{ value: "player", label: "Jugador" },
			{ value: "all", label: "Todos" }
		  ]
		}
	  ]
	}
	

    // ──────────────────────────────────────────────────────────
    // 8. ROLES
    // ──────────────────────────────────────────────────────────
    {
      id: "roles",
      title: "Roles y permisos",
      icon: "👥",
      color: "#4A90FF",
      fields: [
        {
          id: "roles",
          type: "multi_select",
          label: "Roles activos",
          default: ["host", "player"],
          options: [
            { value: "host", label: "Host" },
            { value: "player", label: "Jugador" },
            { value: "spectator", label: "Espectador" },
            { value: "judge", label: "Juez" },
            { value: "scorer", label: "Anotador" }
          ]
        },

        {
          id: "scoreCapture",
          type: "select",
          label: "Quién captura puntajes",
          default: "host",
          options: [
            { value: "host", label: "Host" },
            { value: "player", label: "Jugador" },
            { value: "all", label: "Todos" },
            { value: "judge", label: "Juez" }
          ]
        },

        {
          id: "toolsWho",
          type: "select",
          label: "Quién puede usar herramientas",
          default: "all",
          options: [
            { value: "host", label: "Host" },
            { value: "player", label: "Jugadores" },
            { value: "all", label: "Todos" }
          ]
        },

        {
          id: "roundCloseWho",
          type: "select",
          label: "Quién cierra rondas",
          default: "host",
          options: [
            { value: "host", label: "Host" },
            { value: "all", label: "Todos" }
          ]
        },

        {
          id: "pauseWho",
          type: "select",
          label: "Quién puede pausar",
          default: "host",
          options: [
            { value: "host", label: "Host" },
            { value: "all", label: "Todos" }
          ]
        },

        {
          id: "errorWho",
          type: "select",
          label: "Quién corrige errores",
          default: "host",
          options: [
            { value: "host", label: "Host" },
            { value: "judge", label: "Juez" },
            { value: "all", label: "Todos" }
          ]
        },

        {
          id: "visHost",
          type: "select",
          label: "Host ve",
          default: "all",
          options: [
            { value: "all", label: "Todo" },
            { value: "partial", label: "Parcial" }
          ]
        },

        {
          id: "visPlayer",
          type: "select",
          label: "Jugador ve",
          default: "partial",
          options: [
            { value: "all", label: "Todo" },
            { value: "partial", label: "Parcial" },
            { value: "own", label: "Solo lo suyo" }
          ]
        },

        {
          id: "visSpectator",
          type: "select",
          label: "Espectador ve",
          default: "score",
          options: [
            { value: "none", label: "Nada" },
            { value: "score", label: "Marcador" },
            { value: "all", label: "Todo" }
          ]
        }
      ]
    },

    // ──────────────────────────────────────────────────────────
    // 9. REGLAS / EVENTOS
    // ──────────────────────────────────────────────────────────
    {
      id: "rules",
      title: "Reglas / eventos",
      icon: "🧠",
      color: "#FF6B35",
      fields: [
        {
          id: "customRules",
          type: "list_text",
          label: "Triggers o reglas del juego",
          default: []
        },
        {
          id: "specialEvents",
          type: "list_text",
          label: "Eventos especiales",
          default: []
        }
      ]
    },

	// ----------------------------------------------------------
	// 10.5 LA HISTORIA
	// ----------------------------------------------------------
	{
	  id: "history",
	  title: "Histórico",
	  icon: "📚",
	  color: "#4A90FF",
	  fields: [
		{
		  id: "trackingLevel",
		  type: "select",
		  label: "Nivel de histórico",
		  default: "normal",
		  options: [
			{ value: "minimal", label: "Mínimo" },
			{ value: "normal", label: "Normal" },
			{ value: "detailed", label: "Detallado" }
		  ]
		},

		{
		  id: "trackWinnerReason",
		  type: "boolean",
		  label: "Guardar cómo ganó",
		  default: true
		},

		{
		  id: "trackDefeatReason",
		  type: "boolean",
		  label: "Guardar cómo perdió",
		  default: true
		},

		{
		  id: "trackRoundHistory",
		  type: "boolean",
		  label: "Guardar historial por ronda",
		  default: true
		},

		{
		  id: "trackFinancials",
		  type: "boolean",
		  label: "Guardar entrada / salida / pagos",
		  default: false
		},

		{
		  id: "trackTimers",
		  type: "boolean",
		  label: "Guardar tiempos",
		  default: false
		}
	  ]
	}

    // ──────────────────────────────────────────────────────────
    // 10. FINALIZACIÓN
    // ──────────────────────────────────────────────────────────
    {
      id: "finish",
      title: "Finalización",
      icon: "🏁",
      color: "#4A90FF",
      fields: [
        {
          id: "showEndScreen",
          type: "boolean",
          label: "Mostrar pantalla final",
          default: true
        },

        {
          id: "saveHistory",
          type: "boolean",
          label: "Guardar historial",
          default: true
        },

        {
          id: "endConditions",
          type: "multi_select",
          label: "Cómo termina",
          default: ["victory"],
          options: [
            { value: "victory", label: "Victoria" },
            { value: "end_rounds", label: "Fin de rondas" },
            { value: "time_over", label: "Tiempo agotado" },
            { value: "last_elimination", label: "Última eliminación" },
            { value: "manual", label: "Manual" }
          ]
        },

        {
          id: "exportFormat",
          type: "multi_select",
          label: "Formatos de exportación",
          default: [],
          options: [
            { value: "json", label: "JSON" },
            { value: "summary", label: "Resumen" },
            { value: "history", label: "Historial" }
          ]
        },

        {
          id: "rematchKeepPlayers",
          type: "boolean",
          label: "Revancha conserva jugadores",
          default: true
        },

        {
          id: "rematchKeepRoom",
          type: "boolean",
          label: "Revancha conserva sala",
          default: true
        },

        {
          id: "rematchKeepConfig",
          type: "boolean",
          label: "Revancha conserva configuración",
          default: true
        },

        {
          id: "rematchResetScore",
          type: "boolean",
          label: "Reiniciar puntajes",
          default: true
        },

        {
          id: "rematchResetAll",
          type: "boolean",
          label: "Reiniciar todo",
          default: false
        }
      ]
    }
  ]
};