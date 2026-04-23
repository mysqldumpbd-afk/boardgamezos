window.SchemaUtils = {
  sanitizeConfig(cfg){
    cfg.registers = cfg.registers || [];

    if(cfg.registers.length === 0){
      if(cfg.victoryMode === 'points') cfg.registers = ['points'];
      else if(cfg.victoryMode === 'wins') cfg.registers = ['wins'];
      else cfg.registers = [];
    }

    if(cfg.victoryMode === 'elimination'){
      cfg.registers = cfg.registers.filter(r => r !== 'points' && r !== 'wins');
    }

    return cfg;
  }
};