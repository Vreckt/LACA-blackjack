const BaseResponse =  require('./base-response');

class ConnectedResponse extends BaseResponse {
    constructor (id = null, servers = null) {
        super();
        this.id = id;
        this.servers = servers;
    }
}

class NewLobbyResponse extends BaseResponse {
    constructor (roomId = '', roomName = '') {
        super();
        this.roomId = roomId;
        this.roomName = roomName;
    }
}

class NewPlayerInGame extends BaseResponse {
    constructor (userId = '', table = '') {
        super();
        this.userId = userId;
        this.table = table;
    }
}

class NewPlayerInGame extends BaseResponse {
    constructor (kickPlayer = '') {
        super();
        this.kickPlayer = kickPlayer;
    }
}


module.exports = {
    ConnectedResponse,
    NewLobbyResponse,
    NewPlayerInGame
};

