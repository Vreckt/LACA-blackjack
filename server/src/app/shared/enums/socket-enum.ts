export enum SocketEnum {
    INIT = 'init',

    // Lobby
    CREATENEWGAME = 'c-lobby',
    UPDATEGAME = 'u-lobby',
  
    // Table
    JOINGAME = 'j-table',
    LEAVEGAME = 'l-table',
  
    // Player Action
    PLAYERJOIN = 'p-join',
    PLAYERLEAVE = 'p-leave',
    KICKPLAYER = 'p-kick',
    PlayerTurn = 'p-turn',
    PlayerEnd = 'p-end',
    PlayerBet = 'p-bet',
    PlayerDouble = 'p-double',

    // Status
    CONNECTED = 'connected',

    //Game
    STARTGAME = 's-game',
    DRAWCARD = 'd-card',
    BANKSHOWCARD = 'b-showCard',
    BANKDRAWCARD = 'b-drawCard',
    FINICHGAME = 'f-game',

    // Simple Action
    CONNECTION = 'connection',
    DISCONNECT = 'disconnect',
    
    // Others
    TRIGGER = 'Trigger',
    ERROR = 'Error',
    ACTION = 'Action'
}
