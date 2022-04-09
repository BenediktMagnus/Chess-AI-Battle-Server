import EventHandler from "../utility/eventHandler";
import { Player } from "../game/player";
import { PlayerList } from "../game/playerList";
import { PlayerScore } from "./playerScore";

export class Statistician
{
    private players: PlayerList;
    private scores: Map<Player, PlayerScore>;
    private moves: string[][];

    // TODO: The statistician must inform about player (name) changes.
    // TODO: The statistician must inform about checks (or statistic changes).

    public readonly onPlayerAdd: EventHandler<(player: Player) => void>;
    public readonly onPlayerRemove: EventHandler<(player: Player) => void>;
    public readonly onMove: EventHandler<(move: string) => void>;
    public readonly onNewGame: EventHandler<() => void>;
    public readonly onEnd: EventHandler<() => void>;

    /** The number of rounds done. */
    public get rounds (): number
    {
        return this.moves.length;
    }

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

        this.onPlayerAdd = new EventHandler();
        this.onPlayerRemove = new EventHandler();
        this.onMove = new EventHandler();
        this.onNewGame = new EventHandler();
        this.onEnd = new EventHandler();
    }

    public addPlayer (player: Player): void
    {
        this.scores.set(player, new PlayerScore(player));
        this.players.add(player);

        this.onPlayerAdd.dispatchEvent(player);
    }

    public removePlayer (player: Player): void
    {
        this.players.remove(player);
        this.scores.delete(player);

        this.onPlayerRemove.dispatchEvent(player);
    }

    public recordMove (move: string): void
    {
        this.moves[this.moves.length - 1].push(move);

        this.onMove.dispatchEvent(move);
    }

    /**
     * NOTE: Must be called after the player colours for the coming round have been set.
     */
    public recordNewGame (): void
    {
        this.moves.push([]);

        this.onNewGame.dispatchEvent();
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

    public recordEnd (): void
    {
        this.onEnd.dispatchEvent();
    }
}
