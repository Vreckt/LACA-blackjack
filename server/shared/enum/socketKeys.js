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

    TurnPlayer: 't-player',


    PlayerKick: 'p-kick',

    // Status
    Connected: 'connected',

    //Game
    StartGame: 's-game',
    DrawCard: 'd-card',

    // Simple Action
    Connection: 'connection',
    Disconnect: 'disconnect',
    
    // Others
    Trigger: 'Trigger',
    Error: 'Error'
}


module.exports = socketKeys;
