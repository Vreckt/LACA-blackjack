const Table = require('../../../shared/models/table');
const PlayerBlackJack = require('./player-blackJack');
const Card = require('../../../shared/models/card');
const ResponseBlackjack = require('./responses/blackjack-response');
const User = require('../../../shared/models/user');
const BlackjackManager = require('./managers/blackjack-manager');

class BlackjackTable extends Table {
  
    constructor(id, name, password, adminId, difficulty) {
        super(id, name, password, adminId, difficulty),
        this.deck = [];
        this.currentPlayer = '';
        this.bank = new PlayerBlackJack(new User(0, 'BANK', 0, 0));
    }

    drawCard(playerId) {
      // TODO => create response in manager (card ; playerId ; table ; calculateHand())
        const card = this.drawCardFromDeck(1)[0];
        this.players.find(p => p.id === playerId).hand.push(card);
        let response = BlackjackManager.createResponse(this,player);
        return response;
    }

    callMe(call) {
      return 'call moi pas fdp' + ' ' + call;
    }
    
    addPlayer(user) {
      const pBJ = new PlayerBlackJack();
      pBJ.user = user;
      // TODO => A vérifier si la référence du user est bien copiée... (normalement c'est bon)
      if (!this.hasUser(pBJ.user.id)) {
        this.players.push(pBJ);
      }
    }

    clean() {
        this.bank = new PlayerBlackJack(new User(0, 'BANK', 0, 0));
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

    drawCardsFromDeck(nbCardsToDraw) {
        const cards = this.deck.draw(nbCardsToDraw);
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
    

    

    //#region check before clean
    addCardToPlayer(playerId, card) {
      this.players.find(p => p.id === playerId).hand.push(card);
    }
    hasPlayer(playerId) {
      if (this.players.find(p => p.id === playerId)) {
        return true;
      }
      return false;
    }
    bankDrawCard() {
      return this.drawCardFromDeck(1)[0];
    }
    //#endregion check before clean
}

module.exports = BlackjackTable;