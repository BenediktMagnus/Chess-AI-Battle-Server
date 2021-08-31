export enum MoveResult
{
    /** The move has been successfull. */
    Success = 's',
    /** It is not the player's turn. */
    NotYourTurn = 't',
    /** The given move notation is invalid. */
    InvalidNotation = 'n',
    /** The given promotion piece is invalid. */
    InvalidPromotion = 'p',
    /** The given move is not legal. */
    IllegalMove = 'm',
}
