
class Player {
    constructor(id, name, icon = 1, credits = 1000) {
      this.id = id;
      this.name = name;
      this.icon = icon;
      this.credits = credits;
      this.currentBet = 0;
      this.hand = [];
      this.score = 0;
      this.hasDouble = false;
    }

    clean() {
      this.currentBet = 0;
      this.hand = [];
      this.score = 0;
      this.hasDouble = false;
    }
  
}
  
  module.exports = Player;