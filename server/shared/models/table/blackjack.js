const Table = require('./table');
const tableType = require('../../enum/tableType')
const Bank = require('../bank.js');
const ResponseBJAction = require('../../../shared/models/response/responseBlackJack');
const Card = require('../../../shared/models/card');


class BlackjackTable extends Table {

    constructor(id, name, difficulty) {
        super(id, name, tableType.Blackjack),
        this.difficulty = difficulty,
        this.bank = new Bank();
    }

    drawCard(playerIndex, isBank = false) {
        const cardDraw = this.deck.draw(1);
        const card = new Card(cardDraw[0].rank.shortName + cardDraw[0].suit.name, cardDraw[0].rank.shortName, true, 0);
        if (['A', 'J', 'Q', 'K'].includes(cardDraw[0].rank.shortName)) {
            card.value = cardDraw[0].rank.shortName === 'A' ? 11 : 10;
        } else {
            card.value = +card.shortName;
        }
        if (isBank) {
            this.bank.hand.push(card);
            return this.createResponse(this.bank);
        } else {
            this.addCardToPlayer(playerIndex, card);
            return this.createResponse(this.players[playerIndex]);
        }
    }

    bankDrawCard() {
        const cardDraw = this.deck.draw(1);
        const card = new Card(cardDraw[0].rank.shortName + cardDraw[0].suit.name, cardDraw[0].rank.shortName, true, 0);
        if (['A', 'J', 'Q', 'K'].includes(cardDraw[0].rank.shortName)) {
            card.value = cardDraw[0].rank.shortName === 'A' ? 11 : 10;
        } else {
            card.value = +card.shortName;
        }
        this.bank.hand.push(card);
        return card;
    }

    calculateHand(player) {
        console.log(player)
        const listCards = player.hand;
        let point = 0;
        let isBlackJack = false;
        let isWin = false;
        const sortedCardList = listCards.slice().sort((a, b) => { return a.value - b.value });
        for (const card of sortedCardList) {
            if (card.shortName != 'A') {
                point += card.value;
            } else {
                if (point > 10) {
                    ++point;
                } else if (point < 10 || point == 10) {
                    point += 11;
                }
            }
            if (point > 21) {
                isWin = false;
            } else if (point === 21) {
                isWin = true;
                isBlackJack = true;
            } else {
                isWin = true;
            }
        }
        const response = new ResponseBJAction();
        response.userId = player ? player.id : null;
        response.point = point;
        response.isWin = isWin;
        response.isBlackJack = isBlackJack;
        response.isShownDrawButton = player ? (point < 21) && !player.hasDouble : false;
        response.isShownDoubleButton = (listCards.length < 3) && response.isShownDrawButton;
        return response;
    };
    
    createResponse(player) {
        const response = this.calculateHand(player);
        response.table = this;
        response.drawCard = player.hand[player.hand.length - 1];
     
        return response
    }

    clean() {
        this.bank = new Bank();
        this.currentPlayer = '';
        for (const player of this.players) {
          player.clean();
        }
      }

    manageBet(playerId) {
        const response = new ResponseBJAction();
        response.table = this;
        response.userId = playerId;
        return response;
    }
    
    manageEndGame() {
        let bank = this.bank;
        var listOfResponse = [];
        console.log(bank);
        // Check if users win
        for(const user of this.players) {
            let tmpResponse = this.calculateHand(user);
            if (tmpResponse.isWin) {
                listOfResponse.push(tmpResponse);
            }
        }
    
        if (bank.isWin) {
            console.log('isWin');
            for (const response of listOfResponse) {
                console.log('listOfResponse');
                console.log(response);
    
                if (response.point > bank.point) {
                    console.log('gagné a plat de couture');
    
                    this.players.find(u => u.id === response.userId).credits += this.players.find(u => u.id === response.userId).currentBet * (response.isBlackJack ? 2.5 : 2);
                } else if (response.point == bank.point) {
                    console.log('égalité');
    
                    if (response.isBlackJack !== bank.isBlackJack) {
                        if (response.isBlackJack) {
                            console.log('2.5');
                            this.players.find(u => u.id === response.userId).credits += this.players.find(u => u.id === response.userId).currentBet * 2.5;
                        }
                    } else {
                        if (response.isBlackJack) {
                            console.log('only bet');
    
                            this.players.find(u => u.id === response.userId).credits += this.players.find(u => u.id === response.userId).currentBet;
                        }
                    }
                }
            }
        } else {
            for (const response of listOfResponse) {
                console.log('dealer has been defeated');
    
                this.players.find(u => u.id === response.userId).credits += this.players.find(u => u.id === response.userId).currentBet * (response.isBlackJack ? 2.5 : 2);
            }
        }
        
        this.status = 'F';
        console.log(this);
    
        return this;
    }
    
}



module.exports = BlackjackTable;