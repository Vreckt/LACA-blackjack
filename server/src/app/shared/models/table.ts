import { DifficultyEnum } from '../enums/difficulty-enum';
import { StatusEnum } from '../enums/status-enum';

export class Table {
    id: string;
    name: string;
    password: string;
    adminId: string;
    difficulty: DifficultyEnum;

    players: any[];/*  */
    status: StatusEnum;

    constructor(id: string, name: string, password: string, adminId: string, difficulty: DifficultyEnum) {
        this.id = id;
        this.name = name;
        this.password = password;
        this.adminId = adminId;
        this.difficulty = difficulty;
        this.players = [];/*  */
        this.status = StatusEnum.NOTSTART;
    }

    get getPlayers() { return this.players.slice() }

    // set status(status) { this.status = status }

    updateConfig() { }

    hasUser(id: string) {
        if (this.players.find(p => p.user.id === id)) {
            return true;
        }
        return false;
    }

    removeUser(id: string) {
        if (this.hasUser(id)) {
            if (this.adminId === id) {
                const { nextPlayer } = this.getNextPlayer(this.adminId);
                this.adminId = nextPlayer.user.id;
            }

            return this.players.splice(this.players.findIndex(p => p.user.id === id), 1);
        } else {
            return null;
        }
    }

    getNextPlayer(playerId: string) {
        const nextPlayerIndex = this.players.findIndex(p => p.user.id === playerId) + 1;
        const nextPlayer = this.players[nextPlayerIndex]; // Check if needed later
        return { nextPlayer ,nextPlayerIndex};
    }

    clean() { }

}