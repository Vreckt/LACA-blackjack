class ServerManager {

    constructor() {
        this.serverList = new Map();
        this.userList = [];
        this.started = new Date(Date.now());
        this.countConnectedUser = 0;
    }

    createServerId(length = 64, playerId) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result + playerId;
    }

    addTable(roomId, table) {
        this.serverList.set(roomId, table);
    }

    removeTable(table) {
        this.serverList = [];
    }

    get servers() {
        return Array.from(this.serverList.values());
    }

    addUser(user) {
        this.countConnectedUser++;
        this.userList.push(user);
    }
    userInitConnection(user, socket) {
        if (this.userList.find(p => p.id === socket.handshake.query.oldSocket)) {
            socket.conn.id = socket.handshake.query.oldSocket;
            user.id = socket.handshake.query.oldSocket;
            this.userList.find(u => u.id === socket.handshake.query.oldSocket && u.name === socket.handshake.query.username).id = user.id;
        } else {
            this.addUser(user);
        }
    }

    removeUser(user) {
        this.countConnectedUser--;
        // this.addUser.push(user);
    }

    get users() {
        return this.userList.slice();
    }

    generateAdminPage(process) {
        return `
            <html><head></head><body>
            UPTIME: ${Math.round(process.uptime())} secondes <br/>
            UserConnected: ${this.countConnectedUser} <br/>
            RoomCreated: ${this.servers.length}
            </body></html>
        `
    }
}

module.exports = ServerManager;