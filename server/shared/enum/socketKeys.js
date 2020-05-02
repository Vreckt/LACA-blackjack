const socketKeys = {
    // Lobby
    NewLobby: 'n-lobby',
    UpdateLobby: 'u-lobby',
  
    // Table
    JoinTable: 'j-table',
    LeaveTable: 'l-table',
  
    // Player Action
    PlayerJoin: 'p-join',
    PlayerLeave: 'p-leave',
    PlayerTurn: 'p-turn',
    PlayerEnd: 'p-end',
    PlayerKick: 'p-kick',
    PlayerBet: 'p-bet',

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
    Error: 'Error'
}


module.exports = socketKeys;
