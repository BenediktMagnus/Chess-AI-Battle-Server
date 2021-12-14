export enum ServerToClientCommand
{
    InvalidMove = 'i',
    Timeout = 'o',
    Turn = 't',
    Check = 'c',
    Won = 'w',
    Lost = 'l',
    Draw = 'd',
    Stalemate = 's',
    NewGame = 'n',
    End = 'e',
}
