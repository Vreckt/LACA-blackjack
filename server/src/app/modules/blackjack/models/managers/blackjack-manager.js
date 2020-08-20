class BlackjackManager {
    // constructor(table) { this.table = table; }

    static log(log) {
        console.log(log);
    }

    static callMe(table) {
        console.log(this.callMe2(table));
    }

    static callMe2(table) {
        return table+'1';
    }

    /* MANAGER */
   static createResponseByCalculatedHand(player) {
    // ATTENTION PAS bank mais USER!!
    this.bank.calculateHand();
    const response = new ResponseBlackjack();
    response.playerId = this.bank.user.id;
    response.score = this.bank.score;
    response.isWin = this.bank.isWin;
    response.isBlackJack = this.bank.isBlackJack;
    return response;
  }
}

module.exports = BlackjackManager;