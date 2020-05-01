class Table {
    constructor(id = '', name = '', nbDeck = 1, type = 1) {
      this.id = id;
      this.type = 'blackjack';
      this.name = name;
      this.users = [];
      this.nbDeck = nbDeck,
      this.deck;
      this.bank = {
        hand: [],
        discardCard: []
      };
      this.currentPlayer = '';
      this.status = 'P';
    }

    getUser() {
       return this.users.slice();
    }
    
    betTable() {
      this.status = 'B';
    }

    startedTable() {
      this.status = 'S';
    }

    finishedTable() {
      this.status = 'F';
    }

    isPlayersAllBet() {
      for(const user of this.users) {
        if (user.currentBet == 0) { return false }
      }
      return true
    }
}

module.exports = Table;