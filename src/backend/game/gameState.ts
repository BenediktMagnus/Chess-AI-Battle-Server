export enum GameState
{
    /** The game is running. */
    Running = 'r',
    /** The current player is in check. */
    Check = 'c',
    /** The current player is checkmate, thus the other player has won. */
    Checkmate = 'm',
    /** Draw because the current player is in stalemate. */
    Stalemate = 's',
    /** Draw because of the fifty-move rule. */
    FiftyMoveRule = 'f',
    /** Draw because of threefold repetition. */
    ThreefoldRepetition = 't',
    /** Draw because of insufficient material. */
    InsufficientMaterial = 'i',
}
