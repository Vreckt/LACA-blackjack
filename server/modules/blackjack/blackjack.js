const ResponseBJAction = require('../../shared/models/response/responseBlackJack');
const Card = require('../../shared/models/card');

exports.drawCard = (cardDraw, player) => {
    const card = new Card(cardDraw[0].rank.shortName + cardDraw[0].suit.name, cardDraw[0].rank.shortName, true, 0);
    if (['A', 'J', 'Q', 'K'].includes(cardDraw[0].rank.shortName)) {
        card.value = cardDraw[0].rank.shortName === 'A' ? 11 : 10;
    } else {
        card.value = +card.shortName;
    }
    return card;
};

exports.calculateHand = (listCards, player) => {
    let point = 0;
    let isBlackJack = false;
    let isWin = false;
    const sortedCardList = listCards.slice().sort((a, b) => { return a.value - b.value });
    for (const card of sortedCardList) {
        if (card.shortName != 'A') {
            point += card.value;
        } else {
            if (point > 10) {
                ++point;
            } else if (point < 10 || point == 10) {
                point += 11;
            }
        }
        if (point > 21) {
            isWin = false;
        } else if (point === 21) {
            isWin = true;
            isBlackJack = true;
        } else {
            isWin = true;
        }
    }
    const response = new ResponseBJAction();
    response.userId = player ? player.id : null;
    response.point = point;
    response.isWin = isWin;
    response.isBlackJack = isBlackJack;
    response.isShownDrawButton = player ? (point < 21) && !player.hasDouble : false;
    response.isShownDoubleButton = (listCards.length < 3) && response.isShownDrawButton;
    return response;
};

exports.createResponse = (player, table) => {
    const response = this.calculateHand(player.hand, player);
    response.table = table;
    response.drawCard = player.hand[player.hand.length - 1];
    return response
}

exports.manageBet = (table, playerId) => {
    const response = new ResponseBJAction();
    response.table = table;
    console.log(table);
    response.userId = playerId;
    return response;
}

exports.manageEndGame = (table) => {
    let bank = table.bank;
    var listOfResponse = [];
    console.log(bank);
    // Check if users win
    for(const user of table.players) {
        let tmpResponse = this.calculateHand(user.hand, user);
        if (tmpResponse.isWin) {
            listOfResponse.push(tmpResponse);
        }
    }

    if (bank.isWin) {
        console.log('isWin');
        for (const response of listOfResponse) {
            console.log('listOfResponse');
            console.log(response);

            if (response.point > bank.point) {
                console.log('gagné a plat de couture');

                table.players.find(u => u.id === response.userId).credits += table.players.find(u => u.id === response.userId).currentBet * (response.isBlackJack ? 2.5 : 2);
            } else if (response.point == bank.point) {
                console.log('égalité');

                if (response.isBlackJack !== bank.isBlackJack) {
                    if (response.isBlackJack) {
                        console.log('2.5');
                        table.players.find(u => u.id === response.userId).credits += table.players.find(u => u.id === response.userId).currentBet * 2.5;
                    }
                } else {
                    if (response.isBlackJack) {
                        console.log('only bet');

                        table.players.find(u => u.id === response.userId).credits += table.players.find(u => u.id === response.userId).currentBet;
                    }
                }
            }
        }
    } else {
        for (const response of listOfResponse) {
            console.log('dealer has been defeated');

            table.players.find(u => u.id === response.userId).credits += table.players.find(u => u.id === response.userId).currentBet * (response.isBlackJack ? 2.5 : 2);
        }
    }
    
    table.status = 'F';
    console.log(table);

    return table;
}