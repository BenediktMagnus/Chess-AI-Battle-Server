import * as EventFunctionDefinitions from '../shared/eventFunctionDefinitions';
import * as TypedSocketIo from './server/typedSocketIo';
import { Game } from './game/game';
import { PlayerHandler } from './communication/playerHandler';
import { Server } from './server/server';

const httpPort = 8032;
const tcpPort = 2409;
const maxTurnTimeMs = 1000;
const rounds = 100;

export class ChessAiBattleServer
{
    private readonly server: Server;
    private readonly playerHandler: PlayerHandler;

    constructor (server: Server)
    {
        this.server = server;

        this.server.httpPort = httpPort;
        this.server.tcpPort = tcpPort;

        const game = new Game();

        this.playerHandler = new PlayerHandler(this.server, game, maxTurnTimeMs, rounds);

        this.server.socketIo.on('connection', this.onViewerConnect.bind(this));
    }

    public run (): void
    {
        this.server.start();
    }

    public async terminate (): Promise<void>
    {
        this.playerHandler.terminate();

        await this.server.stop();
    }

    private onViewerConnect (socket: TypedSocketIo.Socket): void
    {
        socket.on('init', this.onViewerInit.bind(this));
    }

    private onViewerInit (_reply: EventFunctionDefinitions.InitReply): void
    {
        throw new Error('Method not implemented.');
    }
}
