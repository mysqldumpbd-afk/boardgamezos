
window.OFFICIAL_PRESETS = {
  strike: {
    id:'strike', order:1, name:'Strike', emoji:'🎲', color:'#9B5DE5', category:'dexterity', complexity:'medium',
    validates:['elimination','rounds','manual_referee'],
    valueAdd:['Eliminación rápida','Control de rondas','Historial de derrota'],
    config:{ name:'Strike', emoji:'🎲', type:'individual', minPlayers:2, maxPlayers:8, useRounds:true, rounds:'libre', roundClose:'manual', useTurns:false, noTurnMode:'mixed', victoryMode:'elim', elimWinMode:'last_player', registers:['wins'], useElimination:true, playMode:'minimal', playObjects:['defeat_button'], defeatButtonLabel:'Fuera', defeatButtonScope:'round', objectControlScope:'host', trackDefeatReason:true, trackRoundHistory:true, autoBehaviors:[{id:'last_alive_wins', trigger:'player_eliminated', condition:'only_one_active_remains', effect:'declare_round_winner', enabled:true, label:'Último vivo gana'}], captureActions:[{id:'remaining_dice', label:'Dados restantes', icon:'🎲', color:'#FFD447', captureType:'number', targetRegister:'wins', min:0, max:8, quickValues:[1,2,3,4,5,6,7,8], visibleTo:'host', askAt:'match_end'}] }
  },
  cubilete: {
    id:'cubilete', order:2, name:'Cubilete', emoji:'🪙', color:'#FFD447', category:'dice_party', complexity:'medium',
    validates:['rounds','wins','manual_capture'],
    valueAdd:['Ganador por ronda','Registro de jugada','Resumen por victoria'],
    config:{ name:'Cubilete', emoji:'🪙', type:'individual', minPlayers:2, maxPlayers:8, useRounds:true, rounds:'libre', roundClose:'manual', useTurns:true, turnOrder:'rotative', useFirstPlayerToken:true, victoryMode:'wins', winsMode:'most', winsTarget:3, registers:['wins'], captureType:'manual', accumulation:'round', playMode:'minimal', playObjects:['victory_button','defeat_button','first_player_token'], victoryButtonLabel:'Gané', defeatButtonLabel:'Fuera', objectControlScope:'host', winConditions:['Carta alta','Par','Dos pares','Tercia','Full','Poker'], trackRoundHistory:true, trackWinnerReason:true, useRoundResolution:true, roundResolutionMode:'guided', roundQuestions:[{id:'hand_type', label:'Tipo de jugada', inputType:'select', options:['Carta alta','Par','Dos pares','Tercia','Full','Poker'], required:true, saveAs:'handType', visibleTo:'host'},{id:'throws_used', label:'¿En cuántas tiradas?', inputType:'select', options:['1','2','3'], required:false, saveAs:'throwsUsed', visibleTo:'host'}], resultActions:[{id:'out_action', label:'Fuera', icon:'💀', color:'#FF3B5C', scope:'round', effect:'mark_out', visibleTo:'all', isPrimary:true}] }
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
    config:{ name:'UNO', emoji:'🟥', type:'individual', minPlayers:2, maxPlayers:10, useRounds:true, rounds:'libre', roundClose:'manual', useTurns:true, turnOrder:'rotative', canSkipTurn:true, victoryMode:'points', pointsWinMode:'most', pointsValidation:'round_end', targetScore:500, registers:['points'], modifiers:['penalty','bonus'], captureType:'manual', accumulation:'global', capturedBy:'host', playMode:'minimal', playObjects:['score_input','victory_button'], scoreInputLabel:'Sumar puntos', scoreInputTarget:'points', victoryButtonLabel:'Se quedó sin cartas', objectControlScope:'host', trackRoundHistory:true }
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
    config:{ name:'Bang!', emoji:'🤠', type:'individual', minPlayers:4, maxPlayers:7, useRounds:false, useTurns:true, turnOrder:'rotative', victoryMode:'elim', elimWinMode:'last_player', useElimination:true, registers:['custom'], customCounterName:'vidas', captureType:'manual', accumulation:'global', roles:['host','player'], scoreCapture:'host', playMode:'minimal', playObjects:['counter_set','defeat_button'], counterSet:[{id:'life',label:'Vida',color:'#FF3B5C',icon:'❤️',scope:'player',initialValue:4,min:0,max:5,resetOn:'never',visibleTo:'all'}], objectControlScope:'host', trackDefeatReason:true, trackRoundHistory:true, statusIndicators:[{id:'sheriff',label:'Sheriff',icon:'⭐',color:'#FFD447',scope:'player',visibility:'all',mode:'toggle',defaultValue:false,durationMode:'manual',clearOn:'none'}] }
  },
  loveLetter: {
    id:'love_letter', order:10, name:'Love Letter', emoji:'💌', color:'#FF4FA3', category:'micro_rounds', complexity:'easy',
    validates:['short_rounds','round_points','elimination_light','status_indicator'],
    valueAdd:['Gana ronda','Puntos acumulados','Cambio rápido'],
    config:{ name:'Love Letter', emoji:'💌', type:'individual', minPlayers:2, maxPlayers:6, useRounds:true, rounds:'libre', roundClose:'manual', useTurns:true, turnOrder:'rotative', victoryMode:'wins', winsMode:'most', winsTarget:4, registers:['wins'], playMode:'minimal', playObjects:['victory_button','defeat_button'], victoryButtonLabel:'Ganó ronda', defeatButtonLabel:'Fuera', objectControlScope:'host', trackRoundHistory:true, statusIndicators:[{id:'protected',label:'Protegido',icon:'🛡️',color:'#4A90FF',scope:'player',visibility:'all',mode:'toggle',defaultValue:false,durationMode:'turn',clearOn:'turn_end'}] }
  },
  coup: {
    id:'coup', order:11, name:'Coup', emoji:'🕶️', color:'#B7FF3C', category:'bluff_roles', complexity:'medium',
    validates:['coins','influence','elimination'],
    valueAdd:['Monedas e influencia','Eliminación clara','Turnos limpios'],
    config:{ name:'Coup', emoji:'🕶️', type:'individual', minPlayers:2, maxPlayers:6, useRounds:false, useTurns:true, turnOrder:'rotative', victoryMode:'elim', elimWinMode:'last_player', useElimination:true, registers:['custom'], customCounterName:'monedas', captureType:'manual', accumulation:'global', modifiers:['steal','block'], playMode:'enhanced', playObjects:['score_input','counter_set','defeat_button'], scoreInputLabel:'Ajustar monedas', scoreInputTarget:'custom', counterSet:[{id:'influence',label:'Influencia',color:'#FFD447',icon:'🎭',scope:'player',initialValue:2,min:0,max:2,resetOn:'never',visibleTo:'all'}], objectControlScope:'host' }
  },
  familyFeudMx: {
    id:'family_feud_mx', order:12, name:'100 Mexicanos Dijeron', emoji:'💯', color:'#FF8A3D', category:'party_points', complexity:'easy',
    validates:['points','manual_capture','round_closure'],
    valueAdd:['Captura de puntos por respuesta','Cierre claro de ronda','Resumen rápido de equipos'],
    config:{ name:'100 Mexicanos Dijeron', emoji:'💯', type:'teams', numTeams:2, minPlayers:2, maxPlayers:10, useRounds:true, rounds:'libre', roundClose:'manual', useTurns:false, noTurnMode:'mixed', victoryMode:'points', pointsWinMode:'most', pointsValidation:'round_end', registers:['points'], captureType:'manual', accumulation:'global', capturedBy:'host', playMode:'minimal', playObjects:['score_input','round_resolution_popup'], scoreInputLabel:'Sumar puntos', scoreInputTarget:'points', objectControlScope:'host', useRoundResolution:true, roundResolutionMode:'guided', roundQuestions:[{ id:'answer_points', label:'Puntos logrados en la respuesta', inputType:'number', required:true, saveAs:'answerPoints', visibleTo:'host', min:0, max:100 },{ id:'board_clean', label:'¿Se limpió el tablero?', inputType:'select', options:['Sí','No'], required:false, saveAs:'boardClean', visibleTo:'host' }], trackRoundHistory:true, trackWinnerReason:true }
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
  }
};
