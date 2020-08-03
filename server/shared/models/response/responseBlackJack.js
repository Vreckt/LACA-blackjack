const ServerResponse = require('./server-Response');

class ResponseBJAction extends ServerResponse {
    cardDraw = null;
    point = null;
    isWin = null;
    isBlackJack = false;
    isShownDrawButton = false;

    constructor(playerId = null, table = null) {
        super(table, playerId, null);
    }
}
module.exports = ResponseBJAction;
