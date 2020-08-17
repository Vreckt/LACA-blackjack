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

class NewPlayerInGameResponse extends BaseResponse {
    constructor (userId = '', table = '') {
        super();
        this.userId = userId;
        this.table = table;
    }
}

class KickedPlayerResponse extends BaseResponse {
    constructor (kickPlayer = '') {
        super();
        this.kickPlayer = kickPlayer;
    }
}

class ListServerResponse extends BaseResponse {
    constructor (serverList = '') {
        super();
        this.servers = serverList;
    }
}


module.exports = {
    ConnectedResponse,
    NewLobbyResponse,
    NewPlayerInGameResponse,
    KickedPlayerResponse,
    ListServerResponse
};

