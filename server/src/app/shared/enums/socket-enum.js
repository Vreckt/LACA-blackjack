module.exports = {
    INIT: 'init',

    // Lobby
    CREATENEWGAME: 'c-lobby',
    UPDATEGAME: 'u-lobby',
  
    // Table
    JOINGAME: 'j-table',
    LEAVEGAME: 'l-table',
  
    // Player Action
    PLAYERJOIN: 'p-join',
    PLAYERLEAVE: 'p-leave',
    PlayerTurn: 'p-turn',
    PlayerEnd: 'p-end',
    PlayerKick: 'p-kick',
    PlayerBet: 'p-bet',
    PlayerDouble: 'p-double',

    // Status
    Connected: 'connected',

    //Game
    StartGame: 's-game',
    DrawCard: 'd-card',
    BankShowCard: 'b-showCard',
    BankDrawCard: 'b-drawCard',
    FinishGame: 'f-game',

    // Simple Action
    Connection: 'connection',
    Disconnect: 'disconnect',
    
    // Others
    Trigger: 'Trigger',
    Error: 'Error',
    Action: 'Action'
}
