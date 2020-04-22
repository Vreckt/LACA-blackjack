
class Player {
    constructor(id, name, avatar = null, credits = 0) {
      this.id = id;
      this.name = name;
      this.avatar = avatar,
      this.credits = credits
      this.hand = []
    }
  
}
  
  module.exports = Player;