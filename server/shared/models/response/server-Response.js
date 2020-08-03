const ErrorCode = require('../../enum/error-code');

class ServerResponse {
    isSuccess;
    errorMessage;

    constructor(table, playerId, message = '') {
        this.table = table;
        this.playerId = playerId;
        this.message = message;
    }

    isInError(errorCode = 99, action = null) {
        this.isSuccess = false;
        this.errorMessage = this.getError(errorCode, action);
    }

    getError(errorCode, action) {
        switch (errorCode) {
            case ErrorCode.TableNotFound:
                return 'Error - The table was not found!';
            case ErrorCode.CreateTable:
                return 'An Error occurred during the creation of the table';
            case ErrorCode.JoinTable:
                return 'An Error occurred during the creation of the table';
            case ErrorCode.KickPlayer:
                return 'An Error occurred during the creation of the table';
            case ErrorCode.Action:
                return `Error with the action: ${action}`;
            case ErrorCode.NoCardsLeft:
                return `Error no card left in the deck`;
            default:
                return 'Unknown Error';
        }
    }
}

module.exports = ServerResponse;