import * as EventFunctionDefinitions from '../../shared/eventFunctionDefinitions';
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
        socket.on('init', this.onInit.bind(this));
    };

    private onInit (reply: EventFunctionDefinitions.InitReply): void
    {
        const statistics = this.convertScoresToStatistics(this.statistician.playerScores);

        reply(this.game.board, this.statistician.rounds, statistics);
    }

    private convertScoresToStatistics (scores: ReadonlyArray<Readonly<PlayerScore>>): PlayerStatistic[]
    {
        const statistics = [];

        for (const score of scores)
        {
            const statistic = {
                playerName: score.player.name,
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
}
