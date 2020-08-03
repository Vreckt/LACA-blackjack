const Table = require('./table');
const tableType = require('../../enum/tableType')
const Bank = require('../bank.js');
const ResponseBJAction = require('../../../shared/models/response/responseBlackJack');
const Card = require('../../../shared/models/card');
const { response } = require('express');


class BlackjackTable extends Table {

    constructor(id, name, password, difficulty, player) {
        super(id, name, password, tableType.Blackjack),
            this.difficulty = difficulty,
            this.bank = new Bank();
            this.joined = false;
        this.addPlayerInTable(player, true);
    }

    drawCard(playerIndex, isBank = false) {
        const card = this.drawCardFromDeck(1)[0];
        if (isBank) {
            this.bank.hand.push(card);
            return this.createResponse(this.bank);
        } else {
            this.addCardToPlayer(playerIndex, card);
            return this.createResponse(this.players[playerIndex]);
        }
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
        return this.manageBet(this.players[playerIndex].id);
    }

    /**
     * In DEV
     */
    drawAllCards() {
        for (let i = 0; i < 2; i++) {
            for (let p = 0; p < table.players.length; p++) {
                const response = table.drawCard(p);
                table.setScoreToPlayer(p, response.point);
                io.in(data.roomId).emit(socketKeys.DrawCard, response);
            }
        }
    }

    playerEnds(response) {
        this.bank.hand[1].visible = true;
        this.bank.point = response.point;
        this.bank.isBlackjack = response.isBlackJack;
        this.bank.isWin = response.isWin;
        response.table = this;
        return response;
    }

    bankEndDraw(point) {
        let cardsDraw = this.bank.hand.slice();
        while (point < 17) {
            cardsDraw.push(this.bankDrawCard());
            point = this.calculateHand({ hand: cardsDraw });
        }
        return cardsDraw;
    }

    bankDrawCard(cardToAdd) {
        this.bank.hand.push(cardToAdd);
        response = this.calculateHand(this.bank);
        this.bank.point = response.point;
        this.bank.isBlackjack = response.isBlackJack;
        this.bank.isWin = response.isWin;
        response.table = this;
        response.cardDraw = cardToAdd;
        return response;
    }

    playerEnd() {

    }

    bankDrawCard() {
        return this.drawCardFromDeck(1)[0];
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
        response.playerId = player ? player.id : null;
        response.point = point;
        response.isWin = isWin;
        response.isBlackJack = isBlackJack;
        response.isShownDrawButton = player ? (point < 21) && !player.hasDouble : false;
        response.isShownDoubleButton = (listCards.length < 3) && response.isShownDrawButton;
        return response;
    };

    createResponse(player) {
        let response = new ResponseBJAction();
        if (this.isStarted()) {
            response = this.calculateHand(player);
            response.drawCard = player.hand[player.hand.length - 1];
        }
        response.table = this;
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
        response.playerId = playerId;
        return response;
    }

    manageEndGame() {
        let bank = this.bank;
        var listOfResponse = [];
        console.log(bank);
        // Check if players win
        for (const player of this.players) {
            let tmpResponse = this.calculateHand(player);
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

                    this.players.find(p => p.id === response.playerId).credits += this.players.find(p => p.id === response.playerId).currentBet * (response.isBlackJack ? 2.5 : 2);
                } else if (response.point == bank.point) {
                    console.log('égalité');

                    if (response.isBlackJack !== bank.isBlackJack) {
                        if (response.isBlackJack) {
                            console.log('2.5');
                            this.players.find(p => p.id === response.playerId).credits += this.players.find(p => p.id === response.playerId).currentBet * 2.5;
                        }
                    } else {
                        if (response.isBlackJack) {
                            console.log('only bet');

                            this.players.find(p => p.id === response.playerId).credits += this.players.find(p => p.id === response.playerId).currentBet;
                        }
                    }
                }
            }
        } else {
            for (const response of listOfResponse) {
                console.log('dealer has been defeated');

                this.players.find(p => p.id === response.playerId).credits += this.players.find(p => p.id === response.playerId).currentBet * (response.isBlackJack ? 2.5 : 2);
            }
        }

        this.status = 'F';
        console.log(this);

        return this;
    }
}



module.exports = BlackjackTable;