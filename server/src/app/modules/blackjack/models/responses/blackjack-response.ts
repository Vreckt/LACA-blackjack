import { BaseResponse } from "../../../../shared/models/responses/base-response";

export class calculatedHandResponse extends BaseResponse{
    playerId: number;
    score: number;
    isWin: boolean;
    isBlackJack: boolean;

    constructor(playerId:number, score:number, isWin: boolean, isBlackJack: boolean){
        super();
        this.playerId = playerId;
        this.score = score;
        this.isWin = isWin;
        this.isBlackJack = isBlackJack;
    }
}

export class DrawCardResponse extends BaseResponse {
    card : [];
    playerId: number;
    table: any;
    calculatedHand: calculatedHandResponse;

    constructor( card:[], playerId: number, table: any, calculatedHand: calculatedHandResponse) {
        super();
        this.card = card;
        this.playerId = playerId;
        this.table = table;
        this.calculatedHand = calculatedHand;
    }
}

export class PlayerBetResponse extends BaseResponse{
    table: any;
    playerId: number;

    constructor(table: any, playerId: number) {
        super();
        this.table = table;
        this.playerId = playerId;
    }
}