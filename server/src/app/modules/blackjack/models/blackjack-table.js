const Table = require('../../../shared/models/table');
const Bank = require('./playerBlackJack');
const Card = require('../../../shared/models/card');
const ResponseBlackjack = require('./responses/blackjack-response');

class BlackjackTable extends Table {
    constructor(id, name, password, adminId, difficulty,user) {
        super(id, name, password, adminId, difficulty),
        this.deck = [];
        this.currentPlayer = '';
        this.bank = new Bank(user);
    }

    drawCard(playerIndex) {
        const card = this.drawCardFromDeck(1)[0];
        this.addCardToPlayer(playerIndex, card);
        return card;
    }
    
    addPlayer(isAdmin = false) {
      let player = this.bank.getUser();
      if (!this.hasPlayer(player.id)) {
        this.players.push(player);
        if (isAdmin) {
          this.adminId = player.id;
        }
      }
    }

    hasPlayer(playerId) {
      if (this.players.find(p => p.id === playerId)) {
        return true;
      }
      return false;
    }

    addCardToPlayer(index, card) {
        this.players[index].hand.push(card);
    }

    clean() {
        this.bank = new Bank('');
        this.currentPlayer = '';
        this.deck = [];
        for (const player of this.players) {
          player.clean();
        }
    }

    isPlayersAllBet() {
        for (const player of this.players) {
          if (player.currentBet == 0) { return false }
        }
        return true
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

    doubleBet(playerIndex, currentPlayer) {
      if (currentPlayer.currentBet * 2 <= currentPlayer.credits) {
          this.players[playerIndex].credits -= currentPlayer.currentBet;
          this.players[playerIndex].currentBet = currentPlayer.currentBet * 2;
          this.players[playerIndex].hasDouble = true;
          return this.drawCard(playerIndex);
      } else {
          return `info-playerdonthavemoney`;
      }
    }

    playerBet(betMoney, playerIndex) {
      this.players[playerIndex].credits -= betMoney;
      this.players[playerIndex].currentBet = betMoney;
      const response = new ResponseBlackjack();
      response.table = this;
      response.playerId = this.players[playerIndex].id;
      return response;
    }

    bankEndDraw(point) {
      let cardsDraw = this.bank.hand.slice();
      while (point < 17) {
          cardsDraw.push(this.bankDrawCard());
          point = this.createResponseByCalculatedHand();
      }
      return cardsDraw;
    }

    bankDrawCard() {
      return this.drawCardFromDeck(1)[0];
    }

    createResponseByCalculatedHand() {
      this.bank.calculateHand();
      const response = new ResponseBlackjack();
      response.playerId = this.bank.user.id;
      response.score = this.bank.score;
      response.isWin = this.bank.isWin;
      response.isBlackJack = this.bank.isBlackJack;
      return response;
    }

}

module.exports = BlackjackTable;