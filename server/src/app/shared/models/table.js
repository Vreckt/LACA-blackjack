const difficultyEnum = require('../enums/difficulty-enum');
const statusEnum = require('../enums/status-enum');

class Table {
    constructor(id, name, password, adminId, difficulty) {
        this.id = id;
        this.name = name;
        this.password = password;
        this.adminId = adminId;
        this.difficulty = difficulty;
        this.players = [];
        this.status = statusEnum.NotStart;
    }

    getPlayers() { return this.players.slice(); }

    updateStatus(status) { this.status = status }

    updateConfig() { }
    
    hasUser(id) {
        if (this.players.find(p => p.user.id === id)) {
            return true;
        }
        return false;
    }

    addUserInTable(player) {
        if(!this.hasPlayer(player.user.id)) {
            this.players.push(player);
        }
    }

    removePlayer(id) {
        if(this.hasPlayer(id)) {
            if(this.adminId === id) {
                const { nextPlayer } = this.getNextPlayer(player.user.id);
                this.adminId + nextPlayer.user.id;
            }

            return this.players.splice(this.players.findIndex(p => p.user.id === id), 1);
        } else {
            return null;
        }
    }

    clean() { }

}

module.exports = Table;