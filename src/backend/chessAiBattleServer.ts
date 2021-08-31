import * as EventFunctionDefinitions from '../shared/eventFunctionDefinitions';
import * as TypedSocketIo from './server/typedSocketIo';
import { Command } from './server/command';
import { Game } from './game/game';
import { MoveResult } from './game/moveResult';
import net from 'net';
import { Player } from './game/player';
import { PlayerList } from './game/playerList';
import Server from "./server/server";

const httpPort = 8032;
const tcpPort = 2409;

export class ChessAiBattleServer
{
    private readonly game: Game;
    private readonly players: PlayerList;
    private readonly server: Server;
    public maxTurnTime: number;

    constructor (maxTurnTime = Number.MAX_SAFE_INTEGER)
    {
        this.game = new Game();

        this.players = new PlayerList();

        this.server = new Server();

        this.server.httpPort = httpPort;
        this.server.tcpPort = tcpPort;

        this.server.onConnect.addEventListener(this.onPlayerConnect.bind(this));
        this.server.onDisconnect.addEventListener(this.onPlayerDisconnect.bind(this));
        this.server.onMessage.addEventListener(this.onPlayerMessage.bind(this));

        this.maxTurnTime = maxTurnTime;
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

        if (player === null)
        {
            console.error(`Received message "${message}" from unknown player.`);

            return;
        }

        if (message.length < 2)
        {
            console.error(`Received too short message "${message}" from player "${player.name}".`);

            return;
        }

        const command = message[0];
        const data = message.substr(1);

        switch (command)
        {
            case Command.Turn:
                this.doTurn(player, data);
                break;
            case Command.Name:
                player.name = data;
                break;
            default:
                console.error(`Received unknown command "${command}" with data "${data}" from player "${player.name}".`);
        }
    }

    private doTurn (player: Player, data: string): void
    {
        if (data.length < 4)
        {
            console.error(`Received too short turn message "${data}" from player "${player.name}".`);

            return;
        }

        const neededTurnTime = player.stopWatchTime - Date.now();
        if (neededTurnTime > this.maxTurnTime)
        {
            console.error(`Player "${player.name}" exceeded max turn time.`);

            // TODO: Record this indicent and restart the game.

            return;
        }

        const from = data.substr(0, 2);
        const to = data.substr(2, 2);
        const promotion = data.length > 4 ? data[4] : undefined;

        const moveResult = this.game.tryMove(player, from, to, promotion);

        if (moveResult === MoveResult.Success)
        {
            // TODO: Check for game state.
            // TODO: If game continues, send turn to other player.
            // TODO: Otherwise restart the game and contact the next player that begins.
        }
        else
        {
            // TODO: Inform player.
            // TODO: Where applicable, restart the game and contact the next player that begins.

            console.error(
                `Player "${player.name}" (${player.colour}) tried to move with the invalid move ${from}-${to} (board: ${this.game.board}).`
            );
        }
    }

    private onViewerConnect (socket: TypedSocketIo.Socket): void
    {
        socket.on('init', this.onViewerInit.bind(this));
    }

    private onViewerInit (reply: EventFunctionDefinitions.InitReply): void
    {
    }
}
