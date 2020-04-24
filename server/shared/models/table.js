

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
    
    startedTable() {
        this.status = 'S';
    }

    finishedTable() {
        this.status = 'F';
    }
  
}

  module.exports = Table;