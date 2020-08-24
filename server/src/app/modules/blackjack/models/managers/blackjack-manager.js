'use strict';
const { DrawCardResponse, calculatedHandResponse, PlayerBetResponse } = require("../responses/blackjack-response");

class BlackjackManager {
    // constructor(table) { this.table = table; }

    static log(log) {
        console.log(log);
    }

    static callMe(table) {
        console.log(this.callMe2(table));
    }

    static callMe2(table) {
        return table+'1';
    }

  static createResponse(table,player) {
      let response = new DrawCardResponse();
      response.playerId = player.playerId;
      response.card = player.hand[player.hand.length - 1];
      response.table = table; //this
      response.calculatedHand = this.createResponseByCalculatedHand(table,player);
      return response;
  }

  static createResponseByCalculatedHand(table,player) {
    // ATTENTION PAS bank mais USER!!
    table.bank.calculateHand(); //this.bank
    const response = new calculatedHandResponse();
    response.playerId = player.playerId;
    response.score = player.score;
    response.isWin = player.isWin;
    response.isBlackJack = player.isBlackJack;
    return response;
  }

  static doubleBet(table,index, player) {
    if (player.currentBet * 2 <= player.credits) {
        this.players[index].user.credits -= player.user.currentBet;
        this.players[index].currentBet = player.currentBet * 2;
        this.players[index].hasDouble = true;
        return table.drawCard(this.players[index].user.id);
    } else {
        return `info-playerdonthavemoney`;
    }
  }

  static playerBet(table,betMoney, playerIndex) {
    this.players[playerIndex].user.credits -= betMoney;
    this.players[playerIndex].currentBet = betMoney;
    const response = new PlayerBetResponse();
    response.table = table; //this;
    response.playerId = this.players[playerIndex].user.id;
    return response;
  }

  static bankEndDraw(table,point,player) {
    let cardsDraw = table.bank.hand.slice();//this.bank
    while (point < 17) {
        cardsDraw.push(table.drawCardFromDeck(1)[0]);
        point = this.createResponseByCalculatedHand(table,player);
    }
    return cardsDraw;
  }


}

module.exports = BlackjackManager;