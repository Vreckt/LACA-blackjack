const Card = require('../card');


class Table {
  constructor(id, name, type = 0) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.players = [];
    this.deck;
    this.currentPlayer = '';
    this.status = 'P';
    this.adminId = '';
  }

  getUser() { return this.players.slice();}

  betTable() { this.status = 'B';}
  startedTable() { this.status = 'S'; }
  finishedTable() { this.status = 'F'; }
  isStarted() { return this.status === 'S'; }
  isBet() { return this.status === 'B'; }
  isFinished() { return this.status === 'F'; }

  isPlayersAllBet() {
    for (const user of this.players) {
      if (user.currentBet == 0) { return false }
    }
    return true
  }

  getNextPlayer(userId) {
    const nextPlayerIndex = this.players.findIndex(u => u.id === userId) + 1;
    const nextPlayer = this.players[nextPlayerIndex];
    return { nextPlayer, nextPlayerIndex };
  }

  getPlayerHand(userId) {
    return this.players.find(u => u.id === userId).hand;
  }

  hasPlayer(userId) {
    if (this.players.find(u => u.id === userId)) {
      return true;
    }
    return false;
  }

  addPlayerInTable(player, isAdmin = false) {
    if (!this.hasPlayer(player.id)) {
      this.players.push(player);
      if (isAdmin) {
        this.adminId = player.id;
      }
    }
  }

  removePlayerByUserId(userId) {
    const delUserIndex = this.players.findIndex(u => u.id === userId);
    const delUser = this.players.splice(delUserIndex, 1);
    return { delUser, delUserIndex };
  }

  removePlayer(player) {
    if (this.hasPlayer(player.id)) {
      if (this.adminId === player.id) {
        const { nextPlayer } = this.getNextPlayer(player.id);
        this.adminId = nextPlayer.id;
      }
      return this.players.splice(this.players.findIndex(u => u.id === player.id), 1);
    } else {
      return null;
    }
  }

  addCardToPlayer(index, card) {
    this.players[index].hand.push(card);
  }

  setScoreToPlayer(index, score) {
    this.players[index].score = score;
  }

  setCurrentPlayerTurn(pId) {
    this.currentPlayer = pId;
  }

  getCurrentPlayerTurn() {
    return this.currentPlayer;
  }

  drawCardFromDeck(nbCards) {
    const cards = this.deck.draw(nbCards);
    let cardList = [];
    for (const cardDraw of cards) {
      const card = new Card(cardDraw.rank.shortName + cardDraw.suit.name, cardDraw.rank.shortName, true, 0);
      if (['A', 'J', 'Q', 'K'].includes(cardDraw.rank.shortName)) {
        card.value = cardDraw.rank.shortName === 'A' ? 11 : 10;
      } else {
          card.value = +card.shortName;
      }
      cardList.push(card);
    }
    return cardList;
  }
}

module.exports = Table;