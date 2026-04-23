function interpret(config){
  return {
    registers: config.registers || [],
    victoryMode: config.victoryMode || 'points'
  };
}