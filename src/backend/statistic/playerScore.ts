import { Player } from "../game/player";

export class PlayerScore
{
    public player: Player;
    /** Times the player has won. */
    public wins: number;
    /** Times the player has lost. */
    public losses: number;
    /** Times the game ended in stalemate at this player's turn. */
    public stalemates: number;
    /** Times the game ended in draw at this player's turn. */
    public draws: number;
    /** Times the player has been in check. */
    public checks: number;

    constructor (player: Player)
    {
        this.player = player;

        this.wins = 0;
        this.losses = 0;
        this.stalemates = 0;
        this.draws = 0;
        this.checks = 0;
    }
}
