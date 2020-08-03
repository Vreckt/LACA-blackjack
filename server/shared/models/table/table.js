const Card = require('../card');
const ServerResponse = require('../response/server-Response');


class Table {
  constructor(id, name, password, type = 0) {
    this.id = id;
    this.name = name;
    this.password = password;
    this.type = type;
    this.players = [];
    this.deck;
    this.currentPlayer = '';
    this.status = 'P';
    this.adminId = '';
  }

  getPlayers() { return this.players.slice(); }

  betTable() { this.status = 'B'; }
  startedTable() {
    this.status = 'S';
  }
  finishedTable() { this.status = 'F'; }
  isStarted() { return this.status === 'S'; }
  isBet() { return this.status === 'B'; }
  isFinished() { return this.status === 'F'; }

  isPlayersAllBet() {
    for (const player of this.players) {
      if (player.currentBet == 0) { return false }
    }
    return true
  }

  getNextPlayer(playerId) {
    const nextPlayerIndex = this.players.findIndex(p => p.id === playerId) + 1;
    const nextPlayer = this.players[nextPlayerIndex];
    return { nextPlayer, nextPlayerIndex };
  }

  getPlayerHand(playerId) {
    return this.players.find(p => p.id === playerId).hand;
  }

  hasPlayer(playerId) {
    if (this.players.find(p => p.id === playerId)) {
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
      return `${player.name} à rejoint la partie !`;
    }
  }

  removePlayer(player) {
    if (this.hasPlayer(player.id)) {
      if (this.adminId === player.id) {
        const { nextPlayer } = this.getNextPlayer(player.id);
        this.adminId = nextPlayer.id;
      }
      this.players.splice(this.players.findIndex(p => p.id === player.id), 1);
      return this;
    }
  }

  addCardToPlayer(index, card) {
    this.players[index].hand.push(card);
  }

  setScoreToPlayer(index, score) {
    this.players[index].score = score;
  }

  setCurrentPlayerTurn(playerId) {
    this.currentPlayer = playerId;
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

  joinTable(player, message = '') {
    let response = new ServerResponse();
    response.table = this;
    response.message = `${player.name} à rejoint la partie !`;
    return response
  }

  leaveTable(player, message = '') {
    let response = new ServerResponse();
    response.table = this;
    response.message = `${player.name} à quitté la partie !`;
    return response
  }
}

module.exports = Table;