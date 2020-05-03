
class Player {
    constructor(id, name, avatar = null, credits = 1000) {
      this.id = id;
      this.name = name;
      this.avatar = avatar;
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