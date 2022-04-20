import { Colour } from "../../shared/colour";
import { Player } from "../game/player";
import { PlayerStatistic } from "../../shared/playerStatistic";

export class PlayerScore implements Omit<PlayerStatistic, 'playerName'>
{
    public player: Player;
    public currentColour: Colour;
    public wins: number;
    public losses: number;
    public stalemates: number;
    public draws: number;
    public checks: number;

    constructor (player: Player)
    {
        this.player = player;
        this.currentColour = player.colour;

        this.wins = 0;
        this.losses = 0;
        this.stalemates = 0;
        this.draws = 0;
        this.checks = 0;
    }
}
