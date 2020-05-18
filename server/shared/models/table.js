const Bank = require('./bank.js');
const ResponseBJAction = require('../../shared/models/response/responseBlackJack');
const blackjack = require('../../modules/blackjack/blackjack');

class Table {
    constructor(id = '', name = '', nbDeck = 1, type = 'blackjack') {
      this.id = id;
      this.type = type;
      this.name = name;
      this.users = [];
      this.nbDeck = nbDeck,
      this.deck;
      this.bank = new Bank();
      this.currentPlayer = '';
      this.status = 'P';
      this.adminId = '';
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

    isStarted() {
      return this.status === 'S';
    }

    isBet() {
      return this.status === 'B';
    }

    isFinished() {
      return this.status === 'F';
    }

    isPlayersAllBet() {
      for(const user of this.users) {
        if (user.currentBet == 0) { return false }
      }
      return true
    }

    deleteUserFromTable(userId) {
      const delUserIndex = this.users.findIndex(u => u.id === userId);
      const delUser = this.users.splice(delUserIndex, 1);
      return { delUser, delUserIndex };
    }

    getNextPlayer(userId) {
      const nextPlayerIndex = this.users.findIndex(u => u.id === userId) + 1;
      const nextPlayer = this.users[nextPlayerIndex];
      return { nextPlayer, nextPlayerIndex };      
    }

    getPlayerHand(userId) {
      return this.users.find(u => u.id === userId).hand;
    }

    hasPlayer(userId) {
      if (this.users.find(u => u.id === userId)) {
        return true;
      }
      return false;
    }

    addPlayerInTable(player, isAdmin = false) {
      if (!this.hasPlayer(player.id)) {
        this.users.push(player);
        if (isAdmin) {
          this.adminId = player.userId;
        }
      }
    }

    removePlayer(player) {
      if (this.hasPlayer(player.id)) {
        if (this.adminId === player.id) {
          const { nextPlayer } = this.getNextPlayer(player.id);
          this.adminId = nextPlayer.id;
        }
        return this.users.splice(this.users.findIndex(u => u.id === player.id), 1);
      } else {
        return null;
      }
    }

    addCardToPlayer(index, card) {
      this.users[index].hand.push(card);
    }

    clean() {
      this.bank = new Bank();
      this.currentPlayer = '';

      for (const player of this.users) {
        player.clean();
      }
    }

    setScoreToPlayer(index, score) {
      this.users[index].score = score;
    }

    setCurrentPlayerTurn(pId) {
      this.currentPlayer = pId;
    }

    getCurrentPlayerTurn() {
      return this.currentPlayer;
    }
}

module.exports = Table;