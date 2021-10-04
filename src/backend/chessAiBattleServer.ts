import { Game } from './game/game';
import { PlayerHandler } from './communication/playerHandler';
import { Server } from './server/server';
import { Statistician } from './statistic/statistician';
import { ViewerHandler } from './communication/viewerHandler';

const httpPort = 8032;
const tcpPort = 2409;
const maxTurnTimeMs = 1000;
const rounds = 100;

export class ChessAiBattleServer
{
    private readonly server: Server;
    private readonly playerHandler: PlayerHandler;
    private readonly viewerHandler: ViewerHandler;

    constructor (server: Server)
    {
        this.server = server;

        this.server.httpPort = httpPort;
        this.server.tcpPort = tcpPort;

        const game = new Game();
        const statistician = new Statistician();

        this.playerHandler = new PlayerHandler(this.server, game, statistician, maxTurnTimeMs, rounds);
        this.viewerHandler = new ViewerHandler(this.server, statistician);
    }

    public run (): void
    {
        this.server.start();
    }

    public async terminate (): Promise<void>
    {
        this.viewerHandler.terminate();
        this.playerHandler.terminate();

        await this.server.stop();
    }
}
