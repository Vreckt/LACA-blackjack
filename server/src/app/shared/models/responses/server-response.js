class ConnectedResponse {
    constructor (id = null, servers = null){
        this.id = id;
        this.servers = servers;
    }
}

class NewLobbyResponse {
    constructor (roomId = '', roomName = ''){
        this.roomId = roomId;
        this.roomName = roomName;
    }
}
module.exports = {
    ConnectedResponse,
    NewLobbyResponse
};

