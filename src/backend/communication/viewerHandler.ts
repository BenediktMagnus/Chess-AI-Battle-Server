import * as TypedSocketIo from '../server/typedSocketIo';
import { Game } from '../game/game';
import { PlayerScore } from '../statistic/playerScore';
import { PlayerStatistic } from '../../shared/playerStatistic';
import { Server } from '../server/server';
import { Statistician } from '../statistic/statistician';

export class ViewerHandler
{
    private server: Server;
    private game: Game;
    private statistician: Statistician;

    private viewers: Set<TypedSocketIo.Socket>;

    constructor (server: Server, game: Game, statistician: Statistician)
    {
        this.server = server;
        this.game = game;
        this.statistician = statistician;

        this.viewers = new Set();

        this.statistician.onMove.addEventListener(this.onMove);
        this.statistician.onNewGame.addEventListener(this.onNewGame);
        this.statistician.onEnd.addEventListener(this.onEnd);
        // TODO: Should we listen to player add/remove events?

        this.server.socketIo.on('connection', this.onConnection);
    }

    public terminate (): void
    {
        this.server.socketIo.off('connection', this.onConnection);

        for (const viewer of this.viewers)
        {
            viewer.disconnect();

            this.viewers.delete(viewer);
        }
    }

    private onConnection = (socket: TypedSocketIo.Socket): void =>
    {
        socket.on('register', this.onInit.bind(this, socket));
        socket.on('registerPlayer', this.onRegisterPlayer.bind(this, socket));
        socket.on('play', this.onPlay.bind(this, socket));
        // TODO:Listen to disconnect for players.
    };

    private onInit (socket: TypedSocketIo.Socket): void
    {
        const statistics = this.convertScoresToStatistics(this.statistician.playerScores);

        socket.emit('initiate', this.game.board, this.statistician.rounds, statistics);
    }

    private convertScoresToStatistics (scores: ReadonlyArray<Readonly<PlayerScore>>): PlayerStatistic[]
    {
        const statistics: PlayerStatistic[] = [];

        for (const score of scores)
        {
            const statistic = {
                playerName: score.player.name,
                currentColour: score.player.colour,
                wins: score.wins,
                losses: score.losses,
                stalemates: score.stalemates,
                draws: score.draws,
                checks: score.checks
            };

            statistics.push(statistic);
        }

        return statistics;
    }

    private onMove = (move: string): void =>
    {
        this.server.socketIo.emit('move', move);
    };

    private onNewGame = (): void =>
    {
        const statistics = this.convertScoresToStatistics(this.statistician.playerScores);

        this.server.socketIo.emit('startNextGame', statistics);
    };

    private onEnd = (): void =>
    {
        this.server.socketIo.emit('end');
    };

    private onRegisterPlayer (): void
    {
        // TODO: Implement
    }

    private onPlay (): void
    {
        // TODO: Implement
    }
}
