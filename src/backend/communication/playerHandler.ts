import * as Messages from '../communication/messages/index';
import { ClientToServerCommand } from '../communication/command/clientToServerCommand';
import { Colour } from '../game/colour';
import { Game } from '../game/game';
import { GameState } from '../game/gameState';
import { MoveResult } from '../game/moveResult';
import net from 'net';
import { Player } from '../game/player';
import { PlayerList } from '../game/playerList';
import { Server } from '../server/server';

export class PlayerHandler
{
    private readonly server: Server;
    private readonly game: Game;
    private readonly players: PlayerList;

    private roundsDone: number;
    /** The maximum time a turn is allowed to take, in milliseconds. Set to max integer for (practically) no time limit. */
    public maxTurnTimeMs: number;
    /** The maximum number of rounds (game restarts) until the battle is stopped. Set to max integer for a (practically) endless battle. */
    public maxRounds: number;

    constructor (server: Server, game: Game, maxTurnTimeMs: number, maxRounds: number)
    {
        this.maxTurnTimeMs = maxTurnTimeMs;
        this.maxRounds = maxRounds;
        this.roundsDone = 0;

        this.game = game;

        this.players = new PlayerList();

        this.server = server;

        this.server.onConnect.addEventListener(this.onConnect);
        this.server.onDisconnect.addEventListener(this.onDisconnect);
        this.server.onMessage.addEventListener(this.onMessage);
    }

    /** End the player handling. */
    public terminate (): void
    {
        // This is done by removing all event listeners from the server and disconnecting all players.

        this.server.onConnect.removeEventListener(this.onConnect);
        this.server.onDisconnect.removeEventListener(this.onDisconnect);
        this.server.onMessage.removeEventListener(this.onMessage);

        for (const player of this.players.getAll())
        {
            player.socket.end();

            this.players.remove(player);
        }
    }

    /**
     * Fired when a new player has connected..
     */
    private onConnect = (socket: net.Socket): void =>
    {
        if (this.players.count >= 2)
        {
            socket.destroy();

            return;
        }

        const player = new Player(socket, this.players.count + 1);

        this.players.add(player);

        const otherPlayer = this.players.getOther(player);

        if (otherPlayer !== null)
        {
            // Start the game.

            this.game.reset();
            this.roundsDone = 0;

            const playerIsWhite = Math.random() < 0.5;

            player.colour = playerIsWhite ? Colour.White : Colour.Black;
            otherPlayer.colour = playerIsWhite ? Colour.Black : Colour.White;

            const newGameMessagePlayer = new Messages.NewGameMessage(player.colour);
            this.sendMessage(player, newGameMessagePlayer);

            const newGameMessageOtherPlayer = new Messages.NewGameMessage(otherPlayer.colour);
            this.sendMessage(otherPlayer, newGameMessageOtherPlayer);
        }
    };

    /**
     * Fired when a player connection is closed.
     */
    private onDisconnect = (socket: net.Socket): void =>
    {
        this.players.removeBySocket(socket);
    };

    /**
     * Fired when a message from a player is received.
     */
    private onMessage = (socket: net.Socket, message: string): void =>
    {
        const player = this.players.getBySocket(socket);

        if (player === null)
        {
            console.error(`Received message "${message}" from unknown player.`);

            // TODO: What happens here for the statistics?

            return;
        }

        if (message.length < 2)
        {
            console.error(`Received too short message "${message}" from player "${player.name}".`);

            // TODO: What happens here for the statistics?

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
    };

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
                    {
                        const stalemateWithoutTurnMessage = new Messages.StalemateWithoutTurnMessage();
                        this.sendMessage(player, stalemateWithoutTurnMessage);

                        const stalemateWithTurnMessage = new Messages.StalemateWithTurnMessage(from, to, promotion);
                        this.sendMessage(otherPlayer, stalemateWithTurnMessage);

                        break;
                    }
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
}
