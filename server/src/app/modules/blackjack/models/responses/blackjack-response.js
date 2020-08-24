const BaseResponse = require("../../../../shared/models/responses/base-response");

class calculatedHandResponse extends BaseResponse {
    constructor (playerId = null, score = null, isWin = null, isBlackJack = null) {
        super();
        this.playerId = playerId;
        this.score = score;
        this.isWin = isWin;
        this.isBlackJack = isBlackJack;
    }
}

class DrawCardResponse extends BaseResponse {
    constructor (card = null, playerId = null, table = null, calculatedHand = null) {
        super();
        this.card = card;
        this.playerId = playerId;
        this.table = table;
        this.calculatedHand = calculatedHand;
    }
}

class PlayerBetResponse extends BaseResponse {
    constructor (table = null, playerId = null) {
        super();
        this.table = table;
        this.playerId = playerId;
    }
}

module.exports = {
    calculatedHandResponse,
    DrawCardResponse,
    PlayerBetResponse
};