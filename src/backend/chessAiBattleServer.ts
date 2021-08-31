import * as EventFunctionDefinitions from '../shared/eventFunctionDefinitions';
import * as Messages from './communication/messages/index';
import * as TypedSocketIo from './server/typedSocketIo';
import { ClientToServerCommand } from './communication/command/clientToServerCommand';
import { Colour } from './game/colour';
import { Game } from './game/game';
import { GameState } from './game/gameState';
import { MoveResult } from './game/moveResult';
import net from 'net';
import { Player } from './game/player';
import { PlayerList } from './game/playerList';
import Server from "./server/server";

const httpPort = 8032;
const tcpPort = 2409;
const defaultMaxTurnTimeMs = 1000;
const defaultRounds = 100;

export class ChessAiBattleServer
{
    private readonly game: Game;
    private readonly players: PlayerList;
    private readonly server: Server;
    private roundsDone: number;
    /** The maximum time a turn is allowed to take, in milliseconds. Set to max integer for (practically) no time limit. */
    public maxTurnTimeMs: number;
    /** The maximum number of rounds (game restarts) until the battle is stopped. Set to max integer for a (practically) endless battle. */
    public maxRounds: number;

    constructor ()
    {
        this.maxTurnTimeMs = defaultMaxTurnTimeMs;
        this.maxRounds = defaultRounds;
        this.roundsDone = 0;

        this.game = new Game();

        this.players = new PlayerList();

        this.server = new Server();

        this.server.httpPort = httpPort;
        this.server.tcpPort = tcpPort;

        this.server.onConnect.addEventListener(this.onPlayerConnect.bind(this));
        this.server.onDisconnect.addEventListener(this.onPlayerDisconnect.bind(this));
        this.server.onMessage.addEventListener(this.onPlayerMessage.bind(this));

        this.server.socketIo.on('connection', this.onViewerConnect.bind(this));
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
        if (this.players.count >= 2)
        {
            socket.destroy();

            return;
        }

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
            case ClientToServerCommand.Turn:
                this.doTurn(player, data);
                break;
            case ClientToServerCommand.Name:
                player.name = data;
                break;
            default:
                console.error(`Received unknown command "${command}" with data "${data}" from player "${player.name}".`);
        }
    }

    private doTurn (player: Player, moveData: string): void
    {
        if ((moveData.length < 4) || (moveData.length > 5))
        {
            console.error(`Received a turn message with invalid length "${moveData}" from player "${player.name}".`);

            return;
        }

        const otherPlayer = this.players.getOther(player);

        if (otherPlayer === null)
        {
            console.error(`The game has no other player.`);

            return;
        }

        const neededTurnTime = player.stopWatchTime - Date.now();
        const isTimeout = neededTurnTime > this.maxTurnTimeMs;
        if (isTimeout)
        {
            console.error(`Player "${player.name}" exceeded max turn time.`);

            const timeoutMessage = new Messages.TimeoutMessage();
            this.sendMessage(player, timeoutMessage);

            const wonMessage = new Messages.WonMessage();
            this.sendMessage(otherPlayer, wonMessage);
        }
        else
        {
            this.doMove(player, otherPlayer, moveData);
        }

        if (isTimeout || ((this.game.state !== GameState.Running) && (this.game.state !== GameState.Check)))
        {
            this.roundsDone++;
            this.game.reset();

            if (this.roundsDone >= this.maxRounds)
            {
                const endMessage = new Messages.EndMessage();
                this.sendMessage(player, endMessage);
                this.sendMessage(otherPlayer, endMessage);
            }
            else
            {
                // Switch the colours and start the next round.

                const playerColour = player.colour;
                player.colour = otherPlayer.colour;
                otherPlayer.colour = playerColour;

                if (player.colour === Colour.White)
                {
                    player.stopWatchTime = Date.now();
                }
                else
                {
                    otherPlayer.stopWatchTime = Date.now();
                }

                const newGameMessagePlayer = new Messages.NewGameMessage(player.colour);
                this.sendMessage(player, newGameMessagePlayer);

                const newGameMessageOtherPlayer = new Messages.NewGameMessage(otherPlayer.colour);
                this.sendMessage(otherPlayer, newGameMessageOtherPlayer);
            }
        }
    }

    private doMove (player: Player, otherPlayer: Player, moveData: string): void
    {
        const from = moveData.substr(0, 2);
        const to = moveData.substr(2, 2);
        const promotion = moveData.length > 4 ? moveData[4] : undefined;

        const moveResult = this.game.tryMove(player, from, to, promotion);

        if (moveResult === MoveResult.Success)
        {
            const gameState = this.game.state;

            switch (gameState)
            {
                case GameState.Running:
                {
                    const turnMessage = new Messages.TurnMessage(from, to, promotion);
                    this.sendMessage(otherPlayer, turnMessage);
                    break;
                }
                case GameState.Check:
                {
                    const checkMessage = new Messages.CheckMessage(from, to, promotion);
                    this.sendMessage(otherPlayer, checkMessage);
                    break;
                }
                case GameState.Checkmate:
                {
                    const wonMessage = new Messages.WonMessage();
                    this.sendMessage(player, wonMessage);

                    const lostMessage = new Messages.LostMessage(from, to, promotion);
                    this.sendMessage(otherPlayer, lostMessage);
                    break;
                }
                case GameState.Stalemate:
                case GameState.FiftyMoveRule:
                case GameState.ThreefoldRepetition:
                case GameState.InsufficientMaterial:
                {
                    const drawWithoutTurnMessage = new Messages.DrawWithoutTurnMessage();
                    this.sendMessage(player, drawWithoutTurnMessage);

                    const drawWithTurnMessage = new Messages.DrawWithTurnMessage(from, to, promotion);
                    this.sendMessage(otherPlayer, drawWithTurnMessage);

                    break;
                }
            }

            otherPlayer.stopWatchTime = Date.now();
        }
        else
        {
            console.error(
                `Player "${player.name}" (${player.colour}) tried to move with the invalid move ${from}-${to} (board: ${this.game.board}).`
            );

            const invalidMoveMessage = new Messages.InvalidMoveMessage();
            this.sendMessage(player, invalidMoveMessage);

            const wonMessage = new Messages.WonMessage();
            this.sendMessage(otherPlayer, wonMessage);
        }
    }

    private sendMessage (player: Player, message: Messages.Message): void
    {
        const messageString = message.compose();

        player.socket.write(messageString);
    }

    private onViewerConnect (socket: TypedSocketIo.Socket): void
    {
        socket.on('init', this.onViewerInit.bind(this));
    }

    private onViewerInit (reply: EventFunctionDefinitions.InitReply): void
    {
    }
}
