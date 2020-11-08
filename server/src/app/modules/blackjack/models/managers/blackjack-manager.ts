import {  calculatedHandResponse, DrawCardResponse, PlayerBetResponse } from '../responses/blackjack-response';

export class BlackjackManager {
    static players: any[];
    
    static log(log:string) {
        console.log(log);
    }

    static callMe(table:any) {
        console.log(this.callMe2(table));
    }

    static callMe2(table:any) {
        return table+'1';
    }

    static createResponse(table: any,player:any) {
        let playerId = player.playerId;
        let card = player.hand[player.hand.length - 1];
        let calculatedHand = this.createResponseByCalculatedHand(table,player);
        let response = new DrawCardResponse(card, playerId, table, calculatedHand);
        return response;
    }

    static createResponseByCalculatedHand(table: any,player:any) {
        let playerId = player.playerId;
        let score = player.score;
        let isWin = player.isWin;
        let isBlackJack = player.isBlackJack;
        table.bank.calculateHand(); //this.bank
        const response = new calculatedHandResponse(playerId, score, isWin, isBlackJack);
        return response;
    }

    static doubleBet(table: any, index: number, player:any) {
        if (player.currentBet * 2 <= player.credits) {
            this.players[index].user.credits -= player.user.currentBet;
            this.players[index].currentBet = player.currentBet * 2;
            this.players[index].hasDouble = true;
            return table.drawCard(this.players[index].user.id);
        } else {
            return `info-playerdonthavemoney`;
        }
    }

    static playerBet(table:any, betMoney:number, playerIndex:number) {
        this.players[playerIndex].user.credits -= betMoney;
        this.players[playerIndex].currentBet = betMoney;
        const response = new PlayerBetResponse(table, playerIndex);
        return response;
    }

    static bankEndDraw(table: any, point: number,player:any) {
        
        let cardsDraw = table.bank.hand.slice();//this.bank
        while (point < 17) {
            cardsDraw.push(table.drawCardFromDeck(1)[0]);
            let calculatedHand = this.createResponseByCalculatedHand(table,player);
            point = calculatedHand.score;
        }
        return cardsDraw;
    }
}