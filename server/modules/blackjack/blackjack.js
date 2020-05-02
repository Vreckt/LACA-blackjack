const ResponseBJAction = require('../../shared/models/response/responseBlackJack');

exports.drawCard = (cardDraw) => {
    const card = {
        name: cardDraw[0].rank.shortName + cardDraw[0].suit.name,
        shortName: cardDraw[0].rank.shortName,
        visible: true,
        value: 0
    };
    if (['A', 'J', 'Q', 'K'].includes(cardDraw[0].rank.shortName)) {
        if (cardDraw[0].rank.shortName === 'A') {
            card.value = 11;
        } else {
            card.value = 10;
        }
    } else {
        card.value = +card.shortName;
    }
    return card;
};

exports.manageBlackjack = (listCards, userId) => {
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
    response.userId = userId;
    response.point = point;
    response.isWin = isWin;
    response.isBlackJack = isBlackJack;
    response.isShowDoubleButton = (listCards.length < 3);
    response.isShownDrawButton = (point < 21);

    return response;
};

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
    for(const user of table.users) {
        let tmpResponse = this.manageBlackjack(user.hand, user.id);
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

                table.users.find(u => u.id === response.userId).credits += table.users.find(u => u.id === response.userId).currentBet * (response.isBlackJack ? 2.5 : 2);
            } else if (response.point == bank.point) {
                console.log('égalité');

                if (response.isBlackJack !== bank.isBlackJack) {
                    if (response.isBlackJack) {
                        console.log('2.5');
                        table.users.find(u => u.id === response.userId).credits += table.users.find(u => u.id === response.userId).currentBet * 2.5;
                    }
                } else {
                    if (firstPlayer.isBlackJack) {
                        console.log('only bet');

                        table.users.find(u => u.id === response.userId).credits += table.users.find(u => u.id === response.userId).currentBet;
                    }
                }
            }
        }
    } else {
        for (const response of listOfResponse) {
            console.log('dealer has been defeated');

            table.users.find(u => u.id === response.userId).credits += table.users.find(u => u.id === response.userId).currentBet * (response.isBlackJack ? 2.5 : 2);
        }
    }
    
    table.status = 'F';
    console.log(table);

    return table;
}