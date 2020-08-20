const User = require('../../../shared/models/user');

class PlayerBlackJack{
    constructor(user) {
        this.user = user;
        this.hasDouble = false;
        this.currentBet = 0;
        this.score = 0;
        this.hand = [];
        this.isWin = false;
        this.isBlackjack = false;
    }

    getUser() { return this.user };

    calculateHand() {
        const sortedCardList = this.hand.slice().sort((a, b) => { return a.value - b.value });
        for (const card of sortedCardList) {
            if (card.shortName != 'A') {
                this.score += card.value;
            } else {
                if (this.score > 10) {
                    ++this.score;
                } else if (this.score < 10 || this.score == 10) {
                    this.score += 11;
                }
            }
            if (this.score > 21) {
                this.isWin = false;
            } else if (score === 21) {
                this.isWin = true;
                this.isBlackJack = true;
            } else {
                this.isWin = true;
            }
        }
    };
    
}

module.exports = PlayerBlackJack;