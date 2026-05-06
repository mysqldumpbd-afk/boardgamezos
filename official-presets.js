
window.OFFICIAL_PRESETS = {
  strike: {
    id:'strike', order:1, name:'Strike', emoji:'🎲', color:'#9B5DE5', category:'dexterity', complexity:'medium',
    validates:['elimination','rounds','manual_referee'],
    valueAdd:['Eliminación rápida','Último dado en pie','Registro opcional de dados restantes'],
    config:{ name:'Strike', emoji:'🎲', type:'individual', minPlayers:2, maxPlayers:8, useRounds:true, rounds:'libre', roundClose:'manual', useTurns:false, noTurnMode:'mixed', victoryMode:'elimination', elimWinMode:'last_player', registers:[], useElimination:false, playMode:'minimal', playObjects:[], objectControlScope:'host', resultActions:[{id:'out_action',label:'Fuera',icon:'💀',color:'#FF3B5C',scope:'round',target:'self',effect:'mark_out',visibleTo:'host',prompt:''}], captureActions:[{id:'remaining_dice',label:'Dados restantes',icon:'🎲',color:'#FFD447',captureType:'number',targetRegister:'remainingDice',min:0,max:8,quickValues:[1,2,3,4,5,6,7,8],visibleTo:'host',askAt:'round_end',options:[]}], autoBehaviors:[{id:'last_alive_wins',trigger:'player_eliminated',condition:'only_one_active_remains',effect:'declare_round_winner',enabled:true,label:'Último vivo gana'}], trackDefeatReason:true, trackRoundHistory:true }
  },
  cubilete: {
    id:'cubilete', order:2, name:'Cubilete', emoji:'🪙', color:'#FFD447', category:'dice_party', complexity:'medium',
    validates:['rounds','wins','manual_capture'],
    valueAdd:['Ganador por ronda','Registro de jugada','Resumen por victoria'],
    config:{ name:'Cubilete', emoji:'🪙', type:'individual', minPlayers:2, maxPlayers:8, useRounds:true, rounds:'libre', roundClose:'manual', useTurns:true, turnOrder:'rotative', useFirstPlayerToken:true, victoryMode:'wins', winsMode:'most', winsTarget:3, registers:['wins'], captureType:'manual', accumulation:'round', playMode:'minimal', playObjects:['first_player_token'], objectControlScope:'host', resultActions:[{id:'round_win',label:'Ganó mano',icon:'🏆',color:'#FFD447',scope:'round',target:'self',effect:'mark_victory',visibleTo:'host',prompt:''},{id:'out_action',label:'Fuera',icon:'💀',color:'#FF3B5C',scope:'round',target:'self',effect:'mark_out',visibleTo:'host',prompt:''}], roundQuestions:[{id:'hand_type',label:'Tipo de jugada',inputType:'select',options:['Carta alta','Par','Dos pares','Tercia','Full','Póker','Corrida'],required:true,saveAs:'handType',visibleTo:'host',min:0,max:null},{id:'throws_used',label:'¿En cuántas tiradas?',inputType:'select',options:[1,2,3],required:false,saveAs:'throwsUsed',visibleTo:'host',min:0,max:null}], captureActions:[{id:'remaining_dice',label:'Dados restantes',icon:'🎲',color:'#FFD447',captureType:'number',targetRegister:'remainingDice',min:0,max:5,quickValues:[1,2,3,4,5],visibleTo:'host',askAt:'round_end',options:[]}], trackRoundHistory:true, trackWinnerReason:true }
  },
  sushiGoScoreTracker: {
    id:'sushi_go', order:3, name:'Sushi Go', emoji:'🍣', color:'#FF4FA3', category:'card_scoring', complexity:'medium',
    validates:['rounds','manual_score','tiebreak'],
    valueAdd:['Captura por ronda','Total acumulado','Desempate claro'],
    config:{ name:'Sushi Go', emoji:'🍣', type:'individual', minPlayers:2, maxPlayers:5, useRounds:true, rounds:3, roundClose:'manual', useTurns:false, noTurnMode:'simultaneous', victoryMode:'points', pointsWinMode:'most', pointsValidation:'round_end', registers:['points'], captureType:'manual', accumulation:'global', capturedBy:'host', playMode:'minimal', playObjects:['score_input','round_resolution_popup'], scoreInputLabel:'Capturar puntos', scoreInputTarget:'points', roundResolutionFields:['winner','round_points','notes'], objectControlScope:'host', trackRoundHistory:true }
  },
  uno: {
    id:'uno', order:4, name:'UNO', emoji:'🟥', color:'#FF3B5C', category:'card_party', complexity:'medium',
    validates:['turns','penalties','hand_end'],
    valueAdd:['Orden de turno','Penalizaciones','Fin claro de ronda'],
    config:{ name:'UNO', emoji:'🟥', type:'individual', minPlayers:2, maxPlayers:10, useRounds:true, rounds:'libre', roundClose:'manual', useTurns:true, turnOrder:'rotative', canSkipTurn:true, victoryMode:'points', pointsWinMode:'most', pointsValidation:'round_end', targetScore:500, registers:['points'], modifiers:['penalty','bonus'], captureType:'manual', accumulation:'global', capturedBy:'host', playMode:'minimal', playObjects:['score_input'], scoreInputLabel:'Sumar puntos', scoreInputTarget:'points', objectControlScope:'host', resultActions:[{id:'uno_round_win',label:'Se quedó sin cartas',icon:'🟥',color:'#FFD447',scope:'round',target:'self',effect:'mark_victory',visibleTo:'host',prompt:''}], statusIndicators:[{id:'uno_called',label:'UNO',icon:'❗',color:'#00FF9D',scope:'player',visibility:'all',mode:'toggle',defaultValue:false,durationMode:'manual',clearOn:'none'}], captureActions:[{id:'cards_left',label:'Cartas restantes',icon:'🃏',color:'#4A90FF',captureType:'number',targetRegister:'cardsLeft',min:0,max:30,quickValues:[1,2,3,4,5],visibleTo:'host',askAt:'round_end',options:[]}], trackRoundHistory:true }
  },
  snakesAndLadders: {
    id:'snakes_ladders', order:5, name:'Serpientes y Escaleras', emoji:'🐍', color:'#00FF9D', category:'board_race', complexity:'easy',
    validates:['board_progression','dice','finish_line'],
    valueAdd:['Control de posiciones','Avance por dado','Ganador por meta'],
    config:{ name:'Serpientes y Escaleras', emoji:'🐍', type:'individual', minPlayers:2, maxPlayers:6, useRounds:false, useTurns:true, turnOrder:'fixed', useTools:true, tools:['dice'], toolsMode:'informal', toolsRegistered:false, victoryMode:'points', pointsWinMode:'target', targetScore:100, registers:['points'], captureType:'manual', accumulation:'global', playMode:'minimal', playObjects:['score_input'], scoreInputLabel:'Mover casillas', scoreInputTarget:'points', objectControlScope:'all' }
  },
  loteria: {
    id:'loteria', order:6, name:'Lotería', emoji:'🎴', color:'#B7FF3C', category:'simultaneous', complexity:'easy',
    validates:['simultaneous','manual_win','host_control'],
    valueAdd:['Declarar ganador','Control de ronda','Historial simple'],
    config:{ name:'Lotería', emoji:'🎴', type:'individual', minPlayers:2, maxPlayers:20, useRounds:true, rounds:'libre', roundClose:'manual', useTurns:false, noTurnMode:'simultaneous', victoryMode:'manual', manualWinMode:'host_end', registers:['wins'], playMode:'minimal', playObjects:['victory_button'], victoryButtonLabel:'Lotería', objectControlScope:'host', trackRoundHistory:true }
  },
  jenga: {
    id:'jenga', order:7, name:'Jenga', emoji:'🧱', color:'#FF8A3D', category:'dexterity', complexity:'easy',
    validates:['manual_defeat','elimination','timer'],
    valueAdd:['Turnos claros','Quién perdió','Ronda rápida'],
    config:{ name:'Jenga', emoji:'🧱', type:'individual', minPlayers:2, maxPlayers:8, useRounds:true, rounds:'libre', roundClose:'manual', useTurns:true, turnOrder:'rotative', useTimer:true, timerScope:'turn', timerSecs:30, victoryMode:'elim', elimWinMode:'last_player', useElimination:true, playMode:'minimal', playObjects:['defeat_button'], defeatButtonLabel:'Tiró la torre', objectControlScope:'host', trackDefeatReason:true }
  },
  kingOfTokyo: {
    id:'king_of_tokyo', order:8, name:'King of Tokyo', emoji:'👹', color:'#4A90FF', category:'multi_register', complexity:'high',
    validates:['multi_register','dice','elimination'],
    valueAdd:['Vidas/puntos/energía','Acciones visibles','Control de eliminación'],
    config:{ name:'King of Tokyo', emoji:'👹', type:'individual', minPlayers:2, maxPlayers:6, useRounds:true, rounds:'libre', roundClose:'manual', useTurns:true, turnOrder:'rotative', victoryMode:'points', pointsWinMode:'target', targetScore:20, registers:['points','custom'], customCounterName:'energía', captureType:'manual', accumulation:'global', modifiers:['bonus','penalty','shield'], useElimination:true, playMode:'enhanced', playObjects:['score_input','counter_set','victory_button','defeat_button'], scoreInputLabel:'Aplicar cambio', scoreInputTarget:'points', counterSet:[{id:'lives',label:'Vidas',color:'#FF3B5C',icon:'❤️',scope:'player',initialValue:10,min:0,max:10,resetOn:'never',visibleTo:'all'},{id:'energy',label:'Energía',color:'#00F5FF',icon:'⚡',scope:'player',initialValue:0,min:0,max:null,resetOn:'never',visibleTo:'all'}], objectControlScope:'host', useTools:true, tools:['dice'], toolsMode:'informal', toolsRegistered:true, toolsAffect:['score'] }
  },
  bang: {
    id:'bang', order:9, name:'Bang!', emoji:'🤠', color:'#9B5DE5', category:'hidden_roles', complexity:'high',
    validates:['roles','elimination','asymmetric_goals'],
    valueAdd:['Sheriff visible','Vidas y eliminaciones','Historial de roles'],
    config:{ name:'Bang!', emoji:'🤠', type:'individual', minPlayers:4, maxPlayers:7, useRounds:false, useTurns:true, turnOrder:'rotative', victoryMode:'elimination', elimWinMode:'last_player', useElimination:false, registers:[], captureType:'manual', accumulation:'global', roles:['host','player'], scoreCapture:'host', playMode:'minimal', playObjects:['counter_set'], counterSet:[{id:'life',label:'Vida',color:'#FF3B5C',icon:'❤️',scope:'player',initialValue:4,min:0,max:5,resetOn:'never',visibleTo:'all'}], statusIndicators:[{id:'sheriff',label:'Sheriff',icon:'👑',color:'#FFD447',scope:'player',visibility:'all',mode:'toggle',defaultValue:false,durationMode:'manual',clearOn:'none'}], resultActions:[{id:'out_action',label:'Fuera',icon:'💀',color:'#FF3B5C',scope:'match',target:'self',effect:'mark_out',visibleTo:'host',prompt:''}], objectControlScope:'host', trackDefeatReason:true, trackRoundHistory:true }
  },
  loveLetter: {
    id:'love_letter', order:10, name:'Love Letter', emoji:'💌', color:'#FF4FA3', category:'micro_rounds', complexity:'easy',
    validates:['short_rounds','round_points','elimination_light'],
    valueAdd:['Gana ronda','Puntos acumulados','Cambio rápido'],
    config:{ name:'Love Letter', emoji:'💌', type:'individual', minPlayers:2, maxPlayers:6, useRounds:true, rounds:'libre', roundClose:'manual', useTurns:true, turnOrder:'rotative', victoryMode:'wins', winsMode:'most', winsTarget:4, registers:['wins'], playMode:'minimal', playObjects:[], resultActions:[{id:'round_win',label:'Ganó ronda',icon:'🏆',color:'#FFD447',scope:'round',target:'self',effect:'mark_victory',visibleTo:'host',prompt:''},{id:'out_action',label:'Fuera',icon:'💀',color:'#FF3B5C',scope:'round',target:'self',effect:'mark_out',visibleTo:'host',prompt:''}], statusIndicators:[{id:'protected',label:'Protegido',icon:'🛡️',color:'#4A90FF',scope:'player',visibility:'all',mode:'toggle',defaultValue:false,durationMode:'round',clearOn:'round_end'}], objectControlScope:'host', trackRoundHistory:true }
  },
  coup: {
    id:'coup', order:11, name:'Coup', emoji:'🕶️', color:'#B7FF3C', category:'bluff_roles', complexity:'medium',
    validates:['coins','influence','elimination'],
    valueAdd:['Monedas e influencia','Eliminación clara','Turnos limpios'],
    config:{ name:'Coup', emoji:'🕶️', type:'individual', minPlayers:2, maxPlayers:6, useRounds:false, useTurns:true, turnOrder:'rotative', victoryMode:'elim', elimWinMode:'last_player', useElimination:true, registers:['custom'], customCounterName:'monedas', captureType:'manual', accumulation:'global', modifiers:['steal','block'], playMode:'enhanced', playObjects:['score_input','counter_set','defeat_button'], scoreInputLabel:'Ajustar monedas', scoreInputTarget:'custom', counterSet:[{id:'influence',label:'Influencia',color:'#FFD447',icon:'🎭',scope:'player',initialValue:2,min:0,max:2,resetOn:'never',visibleTo:'all'}], objectControlScope:'host' }
  },
  yahtzee: {
    id:'yahtzee', order:12, name:'Yahtzee', emoji:'🎯', color:'#FF8A3D', category:'score_sheet', complexity:'high',
    validates:['score_sheet','dice','category_capture'],
    valueAdd:['Hoja de puntaje','Totales claros','Rondas por categoría'],
    config:{ name:'Yahtzee', emoji:'🎯', type:'individual', minPlayers:1, maxPlayers:6, useRounds:true, rounds:13, roundClose:'manual', useTurns:true, turnOrder:'rotative', victoryMode:'points', pointsWinMode:'most', pointsValidation:'round_end', registers:['points'], captureType:'manual', accumulation:'global', playMode:'enhanced', playObjects:['score_input','round_resolution_popup'], scoreInputLabel:'Capturar categoría', scoreInputTarget:'points', roundResolutionFields:['round_points','notes'], objectControlScope:'self', useTools:true, tools:['dice'], toolsMode:'informal' }
  },
  blackjack: {
    id:'blackjack', order:13, name:'Blackjack', emoji:'🂡', color:'#4A90FF', category:'dealer_flow', complexity:'medium',
    validates:['dealer_control','manual_points','round_winner'],
    valueAdd:['Ganador por mano','Control del dealer','Historial por mano'],
    config:{ name:'Blackjack', emoji:'🂡', type:'individual', minPlayers:2, maxPlayers:7, useRounds:true, rounds:'libre', roundClose:'manual', useTurns:true, turnOrder:'fixed', victoryMode:'wins', winsMode:'most', winsTarget:5, registers:['wins','points'], captureType:'manual', accumulation:'round', capturedBy:'host', playMode:'minimal', playObjects:['victory_button','score_input','round_resolution_popup'], victoryButtonLabel:'Ganó la mano', scoreInputLabel:'Capturar mano', scoreInputTarget:'points', roundResolutionFields:['winner','round_points','notes'], objectControlScope:'host', trackRoundHistory:true }
  },
nemesisAssist: {
    id:'nemesis_assist', order:17, name:'Nemesis Assist', emoji:'👾', color:'#9B5DE5', category:'survival_assist', complexity:'high',
    validates:['phases','events','entities','hidden_objectives'],
    valueAdd:['Fases de evento','Amenaza activa','Checklist de ruido/intruso'],
    config:{ name:'Nemesis Assist', emoji:'👾', type:'individual', minPlayers:1, maxPlayers:5, useRounds:true, rounds:'libre', roundClose:'manual', useTurns:true, turnOrder:'rotative', victoryMode:'objective', objectiveWinMode:'complete_mission', registers:[], playMode:'enhanced', playObjects:['dice_tool'], objectControlScope:'host', useTools:true, tools:['dice'], useFlowAssistance:true, gamePhases:[{id:'player_action',label:'Acciones del jugador',order:1,scope:'turn',owner:'player',trigger:'turn_start',description:'Ejecutar acciones'},{id:'event_phase',label:'Fase de evento',order:2,scope:'round',owner:'host',trigger:'round_end',description:'Resolver evento y bolsa'}], phaseChecklist:[{id:'noise_roll',label:'Tirar ruido si aplica',phaseId:'player_action',visibleTo:'host',required:false,autoReset:'turn'},{id:'event_card',label:'Resolver carta de evento',phaseId:'event_phase',visibleTo:'host',required:true,autoReset:'round'}], externalEntities:[{id:'active_intruder',label:'Intruso activo',icon:'👾',entityType:'enemy',stateType:'status',defaultState:'ninguno',visibleTo:'all',description:'Amenaza activa'},{id:'ship_status',label:'Estado de nave',icon:'🚀',entityType:'board',stateType:'status',defaultState:'manual',visibleTo:'all',description:'Estado general'}], phaseLifecycle:[{id:'event_phase_life',phaseId:'event_phase',label:'Fase de evento',reset:'round',autoEnter:false,autoExit:false,blocksAdvance:true}], trackRoundHistory:true }
  },
  deadOfWinterAssist: {
    id:'dead_of_winter_assist', order:18, name:'Dead of Winter Assist', emoji:'❄️', color:'#4A90FF', category:'coop_crisis_assist', complexity:'high',
    validates:['coop','crisis','phases','entities'],
    valueAdd:['Crisis visible','Moral/rondas','Checklist de mantenimiento'],
    config:{ name:'Dead of Winter Assist', emoji:'❄️', type:'cooperative', minPlayers:2, maxPlayers:5, useRounds:true, rounds:'libre', roundClose:'manual', useTurns:true, turnOrder:'rotative', victoryMode:'objective', objectiveWinMode:'complete_mission', registers:['resources'], playMode:'enhanced', playObjects:['counter_set','dice_tool'], counterSet:[{id:'morale',label:'Moral',color:'#4A90FF',icon:'🧊',scope:'global',initialValue:6,min:0,max:null,resetOn:'never',visibleTo:'all'}], useTools:true, tools:['dice'], useFlowAssistance:true, gamePhases:[{id:'player_turns',label:'Turnos de supervivientes',order:1,scope:'round',owner:'player',trigger:'manual',description:'Acciones de jugadores'},{id:'colony_phase',label:'Fase de colonia',order:2,scope:'round',owner:'host',trigger:'round_end',description:'Comida, basura, crisis, zombis'}], phaseChecklist:[{id:'feed_colony',label:'Alimentar colonia',phaseId:'colony_phase',visibleTo:'host',required:true,autoReset:'round'},{id:'resolve_crisis',label:'Resolver crisis',phaseId:'colony_phase',visibleTo:'all',required:true,autoReset:'round'}], externalEntities:[{id:'active_crisis',label:'Crisis activa',icon:'⚠️',entityType:'event',stateType:'status',defaultState:'pendiente',visibleTo:'all',description:'Crisis de la ronda'}], trackRoundHistory:true }
  },
  clankAssist: {
    id:'clank_assist', order:19, name:'Clank! Assist', emoji:'🐉', color:'#FF3B5C', category:'deck_dungeon_assist', complexity:'high',
    validates:['market','dragon','entities','checklist'],
    valueAdd:['Mercado/dungeon','Bolsa de dragón','Recordatorios de ruido'],
    config:{ name:'Clank! Assist', emoji:'🐉', type:'individual', minPlayers:2, maxPlayers:4, useRounds:true, rounds:'libre', roundClose:'manual', useTurns:true, turnOrder:'rotative', victoryMode:'points', pointsWinMode:'most', pointsValidation:'round_end', registers:['points'], playMode:'enhanced', playObjects:['score_input'], scoreInputLabel:'Ajustar puntos', scoreInputTarget:'points', useFlowAssistance:true, gamePhases:[{id:'play_cards',label:'Jugar cartas',order:1,scope:'turn',owner:'player',trigger:'turn_start',description:'Generar recursos'},{id:'dragon_attack',label:'Ataque del dragón',order:2,scope:'turn',owner:'host',trigger:'manual',description:'Resolver bolsa'}], phaseChecklist:[{id:'add_clank',label:'Agregar cubos de Clank!',phaseId:'play_cards',visibleTo:'all',required:false,autoReset:'turn'},{id:'draw_dragon_bag',label:'Robar de la bolsa del dragón',phaseId:'dragon_attack',visibleTo:'host',required:false,autoReset:'turn'}], externalEntities:[{id:'dragon_bag',label:'Bolsa del dragón',icon:'🐉',entityType:'deck',stateType:'count',defaultState:'manual',visibleTo:'host',description:'Bolsa del dragón'}], trackRoundHistory:true }
  },

  azul: {
    id:'azul', order:15, name:'Azul', emoji:'🟦', color:'#4A90FF', category:'tile_scoring', complexity:'medium',
    validates:['rounds','first_player','manual_score','end_condition','flow_assistance'],
    valueAdd:['Checklist de cierre','Primer jugador','Puntuación por ronda y bonus final','Entidades: ficha primer jugador y bolsa'],
    config:{
      name:'Azul', emoji:'🟦', type:'individual', minPlayers:2, maxPlayers:4,
      useRounds:true, rounds:'libre', roundClose:'manual',
      useTurns:true, turnOrder:'rotative', useFirstPlayerToken:true,
      victoryMode:'points', pointsWinMode:'most', pointsValidation:'round_end',
      registers:['points'],
      playMode:'minimal',
      playObjects:['score_input','round_resolution_popup','first_player_token'],
      scoreInputLabel:'Capturar puntos de ronda',
      scoreInputTarget:'points',
      roundResolutionFields:['winner','round_points','notes'],
      objectControlScope:'host',
      useFlowAssistance:true,
      gamePhases:[
        {id:'factory_offer',label:'Oferta de fábricas',order:1,scope:'round',owner:'player',trigger:'manual',description:'Tomar azulejos de fábrica o centro'},
        {id:'wall_tiling',label:'Mosaico / pared',order:2,scope:'round',owner:'host',trigger:'round_end',description:'Mover azulejos y puntuar'},
        {id:'cleanup',label:'Limpieza y primer jugador',order:3,scope:'round',owner:'host',trigger:'round_end',description:'Revisar ficha de primer jugador y preparar bolsa'}
      ],
      phaseChecklist:[
        {id:'floor_penalty',label:'Aplicar penalización del piso',phaseId:'wall_tiling',visibleTo:'host',required:true,autoReset:'round'},
        {id:'check_horizontal_row',label:'¿Alguien completó fila horizontal?',phaseId:'wall_tiling',visibleTo:'host',required:true,autoReset:'round'},
        {id:'final_bonus',label:'Si terminó partida, aplicar bonus final',phaseId:'cleanup',visibleTo:'host',required:false,autoReset:'never'}
      ],
      externalEntities:[
        {id:'first_player_tile',label:'Ficha primer jugador',icon:'🔹',entityType:'token',stateType:'holder',defaultState:'centro',visibleTo:'all',description:'Determina quién inicia la siguiente ronda'},
        {id:'tile_bag',label:'Bolsa de azulejos',icon:'👜',entityType:'deck',stateType:'count',defaultState:'manual',visibleTo:'host',description:'Control manual si se desea'}
      ],
      phaseLifecycle:[
        {id:'wall_tiling_life',phaseId:'wall_tiling',label:'Mosaico / pared',reset:'round',autoEnter:false,autoExit:false,blocksAdvance:true}
      ],
      trackRoundHistory:true
    }
  },

  falloutShelter: {
    id:'fallout_shelter', order:16, name:'Fallout Shelter', emoji:'☢️', color:'#B7FF3C', category:'worker_placement_assist', complexity:'high',
    validates:['turns','phases','entities','checklist','dice_reminders'],
    valueAdd:['Recordatorio de amenazas','Fases de turno','Entidades como habitación/evento/enemigo','Dados como herramienta de apoyo'],
    config:{
      name:'Fallout Shelter', emoji:'☢️', type:'individual', minPlayers:2, maxPlayers:4,
      useRounds:true, rounds:'libre', roundClose:'manual',
      useTurns:true, turnOrder:'rotative', useFirstPlayerToken:true,
      victoryMode:'points', pointsWinMode:'most', pointsValidation:'round_end',
      registers:['points'],
      playMode:'enhanced',
      playObjects:['score_input','first_player_token','dice_tool'],
      scoreInputLabel:'Ajustar felicidad / puntos',
      scoreInputTarget:'points',
      objectControlScope:'host',
      useTools:true, tools:['dice'],
      useFlowAssistance:true,
      gamePhases:[
        {id:'assign_dwellers',label:'Asignar moradores',order:1,scope:'turn',owner:'player',trigger:'turn_start',description:'Colocar o activar moradores'},
        {id:'resolve_room',label:'Resolver habitación',order:2,scope:'turn',owner:'player',trigger:'manual',description:'Aplicar producción o efecto'},
        {id:'resolve_threat',label:'Resolver amenaza',order:3,scope:'turn',owner:'host',trigger:'manual',description:'Si hay enemigo/evento, tirar dados y aplicar daño'},
        {id:'end_turn',label:'Cierre de turno',order:4,scope:'turn',owner:'host',trigger:'manual',description:'Revisar mano, recursos y siguiente jugador'}
      ],
      phaseChecklist:[
        {id:'monster_dice',label:'Tirar dados de monstruo si hay amenaza',phaseId:'resolve_threat',visibleTo:'host',required:false,autoReset:'turn'},
        {id:'apply_damage',label:'Aplicar daño / recompensa',phaseId:'resolve_threat',visibleTo:'host',required:false,autoReset:'turn'},
        {id:'pass_first_player',label:'Pasar ficha de primer jugador cuando aplique',phaseId:'end_turn',visibleTo:'host',required:false,autoReset:'round'}
      ],
      externalEntities:[
        {id:'first_player_token',label:'Primer jugador',icon:'🎯',entityType:'token',stateType:'holder',defaultState:'manual',visibleTo:'all',description:'Control de iniciativa'},
        {id:'active_threat',label:'Amenaza activa',icon:'👾',entityType:'enemy',stateType:'status',defaultState:'ninguna',visibleTo:'all',description:'Enemigo o evento pendiente'},
        {id:'active_room',label:'Habitación activa',icon:'🏠',entityType:'room',stateType:'status',defaultState:'manual',visibleTo:'host',description:'Habitación que se resolvió o está pendiente'}
      ],
      phaseLifecycle:[
        {id:'resolve_threat_life',phaseId:'resolve_threat',label:'Resolver amenaza',reset:'turn',autoEnter:false,autoExit:false,blocksAdvance:true}
      ],
      trackRoundHistory:true
    }
  },
  misionCumplida: {
    id:'mision_cumplida', order:17, name:'Misión Cumplida', emoji:'🎯',
    color:'#00FF9D', category:'card_game', complexity:'low',
    validates:['turns','flow_assistance','turn_timer'],
    valueAdd:['Un botón: terminé mi turno','Recordatorio informativo de tomar carta','Reloj de ajedrez por jugador'],
    config:{
      name:'Misión Cumplida', emoji:'🎯', type:'individual',
      minPlayers:2, maxPlayers:6,
      // Sin rondas — solo turnos hasta que alguien complete su misión
      useRounds:false,
      useTurns:true, turnOrder:'rotative', useFirstPlayerToken:false,
      // Victoria manual — el host declara ganador cuando alguien cumple la misión
      victoryMode:'manual', manualWinMode:'host_end',
      registers:[],  // sin puntos — el objetivo es medir tiempo
      playMode:'minimal',
      playObjects:[],
      objectControlScope:'all',
      useFlowAssistance:true,
      // Modo ágil: un solo botón de fin de turno
      turnAssistMode:'agile',

      gamePhases:[
        {id:'play_card', label:'Juega una carta', order:1, scope:'turn', owner:'player',
          trigger:'turn_start', description:'Juega una carta de tu mano'},
        {id:'draw_card', label:'Toma una carta',  order:2, scope:'turn', owner:'player',
          trigger:'manual', description:'Toma una carta del mazo (mano de 4)'},
        {id:'end_turn',  label:'Fin de turno',    order:3, scope:'turn', owner:'player',
          trigger:'manual', description:''},
      ],

      phaseChecklist:[
        // required:false = recordatorio informativo, NO bloquea
        {id:'draw_reminder', label:'Recuerda tomar tu carta del mazo', phaseId:'draw_card',
          visibleTo:'all', required:false, autoReset:'turn'},
      ],

      phaseLifecycle:[
        // blocksAdvance:false = solo recuerda, no bloquea
        {id:'draw_card_life', phaseId:'draw_card', label:'Tomar carta',
          reset:'turn', autoEnter:true, autoExit:false, blocksAdvance:false}
      ],

      useTimer:false,
      trackTurnDuration:true,
      trackRoundHistory:false,
    }
  },

};
