import type { Colour } from '../frontend/ui/colour';

export interface PlayerStatistic
{
    playerName: string;
    /** The colour the player has currently (in the next game). */
    currentColour: Colour;
    /** Times the player has won. */
    wins: number;
    /** Times the player has lost. */
    losses: number;
    /** Times the game ended in stalemate at this player's turn. */
    stalemates: number;
    /** Times the game ended in draw at this player's turn. */
    draws: number;
    /** Times the player has been in check. */
    checks: number;
}
