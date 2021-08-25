import * as EventFunctionDefinitions from '../shared/eventFunctionDefinitions';
import * as TypedSocketIo from './server/typedSocketIo';
import net from 'net';
import { Player } from './game/player';
import { PlayerList } from './game/playerList';
import Server from "./server/server";

const httpPort = 8032;
const tcpPort = 2409;

export class ChessAiBattleServer
{
    private readonly server: Server;
    private readonly players: PlayerList;

    constructor ()
    {
        this.players = new PlayerList();

        this.server = new Server();

        this.server.httpPort = httpPort;
        this.server.tcpPort = tcpPort;

        this.server.onConnect.addEventListener(this.onPlayerConnect.bind(this));
        this.server.onDisconnect.addEventListener(this.onPlayerDisconnect.bind(this));
        this.server.onMessage.addEventListener(this.onPlayerMessage.bind(this));
    }

    public run (): void
    {
        this.server.start();
    }

    public async terminate (): Promise<void>
    {
        await this.server.stop();
    }

    /**
     * Fired when a new player has connected..
     */
    private onPlayerConnect (socket: net.Socket): void
    {
        const player = new Player(socket, this.players.count + 1);

        this.players.add(player);
    }

    /**
     * Fired when a player connection is closed.
     */
    private onPlayerDisconnect (socket: net.Socket): void
    {
        this.players.removeBySocket(socket);
    }

    /**
     * Fired when a message from a player is received.
     */
    private onPlayerMessage (socket: net.Socket, message: string): void
    {
        const player = this.players.getBySocket(socket);
    }

    private onViewerConnect (socket: TypedSocketIo.Socket): void
    {
        socket.on('init', this.onViewerInit.bind(this));
    }

    private onViewerInit (reply: EventFunctionDefinitions.InitReply): void
    {
    }
}
