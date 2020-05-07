const Bank = require('./bank.js');

class Table {
    constructor(id = '', name = '', nbDeck = 1, type = 1) {
      this.id = id;
      this.type = 'blackjack';
      this.name = name;
      this.users = [];
      this.nbDeck = nbDeck,
      this.deck;
      this.bank = new Bank();
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

    clean() {
      this.bank = new Bank();
      this.currentPlayer = '';

      for (const player of this.users) {
        player.clean();
      }
    }
    setCurrentPlayerTurn(pId) {
      this.currentPlayer = pId;
    }

    getCurrentPlayerTurn() {
      return this.currentPlayer;
    }
}

module.exports = Table;