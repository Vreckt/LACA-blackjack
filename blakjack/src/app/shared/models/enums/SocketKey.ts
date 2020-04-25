export enum SocketKey {
    // Lobby
    NewLobby = 'n-lobby',
    UpdateLobby = 'u-lobby',

    // Table
    JoinTable = 'j-table',
    LeaveTable = 'l-table',

    // Player Action
    PlayerJoin = 'p-join',
    PlayerLeave = 'p-leave',
    PlayerKick = 'p-kick',

    // Status
    Connected = 'connected',

    // Game
    StartGame = 's-game',

    // Simple Action
    Connection = 'connection',
    Disconnect = 'disconnect',

    // Others
    Trigger = 'Trigger',
}
