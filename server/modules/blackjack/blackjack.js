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