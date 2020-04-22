

class Table {
    constructor(id = '', name = '', { nbDeck = 1, type = 1}) {
      this.id = id;
      this.type = 'blackjack';
      this.name = name;
      this.users = [];
      this.configs = {
          nbDeck: nbDeck,
      },
      this.deck = [];
      this.bank = [];
      this.status = 'P';
    }

    getUser() {
        return this.users.slice();
    }

    getDeck() {
        return this.deck.slice();
    }
    
    startedTable() {
        this.status = 'S';
    }

    finishedTable() {
        this.status = 'F';
    }
  
}

  module.exports = Table;