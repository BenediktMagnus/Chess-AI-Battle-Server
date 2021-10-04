import { Player } from "../game/player";
import { PlayerList } from "../game/playerList";
import { PlayerScore } from "./playerScore";

export class Statistician
{
    private players: PlayerList;
    private scores: Map<Player, PlayerScore>;
    private moves: string[][];

    public get playerScores (): ReadonlyArray<Readonly<PlayerScore>>
    {
        return Array.from(this.scores.values());
    }

    public get history (): ReadonlyArray<ReadonlyArray<string>>
    {
        return this.moves;
    }

    constructor ()
    {
        this.players = new PlayerList();
        this.scores = new Map();
        this.moves = [];
    }

    public addPlayer (player: Player): void
    {
        this.scores.set(player, new PlayerScore(player));
        this.players.add(player);
    }

    public removePlayer (player: Player): void
    {
        this.players.remove(player);
        this.scores.delete(player);
    }

    public recordMove (move: string): void
    {
        this.moves[this.moves.length - 1].push(move);
    }

    public recordNewGame (): void
    {
        this.moves.push([]);
    }

    public recordCheck (player: Player): void
    {
        const playerScore = this.scores.get(player);

        if (playerScore !== undefined)
        {
            playerScore.checks += 1;
        }
    }

    public recordStalemate (player: Player): void
    {
        const playerScore = this.scores.get(player);

        if (playerScore !== undefined)
        {
            playerScore.stalemates += 1;
        }
    }

    public recordDraw (player: Player): void
    {
        const playerScore = this.scores.get(player);

        if (playerScore !== undefined)
        {
            playerScore.draws += 1;
        }
    }

    public recordWin (player: Player): void
    {
        const playerScore = this.scores.get(player);

        if (playerScore !== undefined)
        {
            playerScore.wins += 1;
        }

        const otherPlayer = this.players.getOther(player);

        if (otherPlayer !== null)
        {
            const otherPlayerScore = this.scores.get(otherPlayer);

            if (otherPlayerScore !== undefined)
            {
                otherPlayerScore.losses += 1;
            }
        }
    }
}
