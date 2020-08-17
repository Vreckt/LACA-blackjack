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

    get getPlayers() { return this.players.slice() } 

    set status(status) { this.status = status }

    updateConfig() { }
    
    hasUser(id) {
        if (this.players.find(p => p.user.id === id)) {
            return true;
        }
        return false;
    }

    removeUser(id) {
        if(this.hasUser(id)) {
            if(this.adminId === id) {
                const { nextPlayer } = this.getNextPlayer(player.user.id);
                this.adminId + nextPlayer.user.id;
            }

            return this.players.splice(this.players.findIndex(p => p.user.id === id), 1);
        } else {
            return null;
        }
    }

    getNextPlayer(playerId) {
        const nextPlayerIndex = this.players.findIndex(p => p.user.id === playerId) + 1;
        // const nextPlayer = this.players[nextPlayerIndex]; // Check if needed later
        return nextPlayerIndex;
      }

    clean() { }

}

module.exports = Table;