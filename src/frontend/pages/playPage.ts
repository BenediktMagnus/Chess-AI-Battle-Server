import * as Constants from '../../shared/constants';
import * as TypedSocketIo from '../typings/typedSocketIo';
import { Chess, ChessInstance, Move, PieceType, ShortMove } from 'chess.js';
import {
    Chessboard,
    COLOR as ChessboardColour,
    INPUT_EVENT_TYPE,
    MARKER_TYPE,
    MoveInputEventHandlerParameters,
    PIECE as Piece,
    Square
} from 'cm-chessboard';
import { ClientToServerCommand } from '../../shared/commands/clientToServerCommand';
import { Colour } from '../../shared/colour';
import { io } from 'socket.io-client';
import { PlayerStatistic } from '../../shared/playerStatistic';
import { ServerToClientCommand } from '../../shared/commands/serverToClientCommand';
import { Translator } from '../localisation/translator';
import { Utils } from '../utility/utils';

class Main
{
    private translator: Translator;

    private viewSocket: TypedSocketIo.Socket;
    private playerSocket: TypedSocketIo.HumanPlayerSocket;

    private chessboard: Chessboard|null;
    private chess: ChessInstance|null;

    constructor ()
    {
        this.translator = new Translator();

        this.viewSocket = io({ autoConnect: false });
        this.playerSocket = io(Constants.humanPlayerNamespace, { autoConnect: false });

        this.viewSocket.on('initiate', Utils.catchVoidPromise(this.onInitiate.bind(this)));
        this.viewSocket.on('startNextGame', Utils.catchVoidPromise(this.onStartNextGame.bind(this)));

        this.playerSocket.on('message', Utils.catchVoidPromise(this.onPlayMessage.bind(this)));

        this.viewSocket.connect();

        this.chessboard = null;
        this.chess = null;

        const catchedOnDocumentLoaded = Utils.catchVoidPromise(this.onDocumentLoaded.bind(this));

        // DOM events:
        if (document.readyState === 'loading')
        {
            document.addEventListener('DOMContentLoaded', catchedOnDocumentLoaded);
        }
        else
        {
            catchedOnDocumentLoaded();
        }
    }

    public run (): void
    {
        //
    }

    private async onDocumentLoaded (): Promise<void>
    {
        await this.translator.run();

        this.chess = new Chess();

        this.chess.reset();

        this.chessboard = new Chessboard(
            document.getElementById('board'),
            {
                position: 'start',
                animationDuration: 67, // 67 ms is about 4 frames at 60 FPS.
                sprite: {
                    url: '/cm-chessboard/assets/images/chessboard-sprite-staunty.svg',
                },
            }
        );

        this.chessboard.disableMoveInput();

        this.viewSocket.emit('register');
        this.playerSocket.connect();
    }

    private async onInitiate (_board: string, _rounds: number, playerStatistics: PlayerStatistic[]): Promise<void>
    {
        await this.setStatistics(playerStatistics);
    }

    private async onStartNextGame (playerStatistics: PlayerStatistic[]): Promise<void>
    {
        await this.setStatistics(playerStatistics);
    }

    private async setStatistics (_playerStatistics: PlayerStatistic[]): Promise<void>
    {
        // TODO: Implement.
    }

    private async onPlayMessage (command: string): Promise<void>
    {
        const line = command.trimEnd(); // Remove trailing line break.

        // TODO: This is not fully protocol compliant as there could be multiple lines in a message.

        switch (line[0] as ServerToClientCommand)
        {
            case ServerToClientCommand.InvalidMove:
                // TODO: Do something.
                break;
            case ServerToClientCommand.Timeout:
                // TODO: Do something.
                break;
            case ServerToClientCommand.Turn:
            case ServerToClientCommand.Check:
                await this.doTurn(line.slice(1));
                break;
            case ServerToClientCommand.Won:
            case ServerToClientCommand.Lost:
            case ServerToClientCommand.Draw:
            case ServerToClientCommand.Stalemate:
                // TODO: Do something.
                break;
            case ServerToClientCommand.NewGame:
            {
                const colour = line[1] == Colour.White ? Colour.White : Colour.Black;

                await this.startNextGame(colour);

                break;
            }
            case ServerToClientCommand.End:
                await this.end();
                break;
        }
    }

    private async doTurn (move: string): Promise<void>
    {
        if ((this.chessboard === null) || (this.chess === null))
        {
            throw new Error('Server sent a move event while the chessboard is not initialised.');
        }

        const from = move.substring(0, 2) as Square;
        const to = move.substring(2, 4) as Square;

        await this.chessboard.movePiece(from, to, true);

        const chessMove: ShortMove = {
            from: from,
            to: to,
        };

        if (move.length > 4)
        {
            const promotion = move.substring(4, 5);

            const oldPiece = this.chessboard.getPiece(to);

            const newPiece = (oldPiece.charAt(0) + promotion) as Piece; // Convert old piece to new piece of the same colour.

            this.chessboard.setPiece(to, newPiece, true);

            chessMove.promotion = promotion as Exclude<PieceType, 'p' | 'k'>;
        }

        this.chess.move(chessMove);

        this.chessboard.enableMoveInput(this.handleHumanInput.bind(this), this.chessboard.getOrientation());
    }

    private handleHumanInput (event: MoveInputEventHandlerParameters): Move | null | boolean
    {
        if (this.chess === null)
        {
            throw new Error('Cannot handle human input. Chess is not initialised.');
        }

        event.chessboard.removeMarkers(undefined, MARKER_TYPE.circle);
        event.chessboard.removeMarkers(undefined, MARKER_TYPE.square);

        if (event.type === INPUT_EVENT_TYPE.moveStart)
        {
            const moves = this.chess.moves(
                {
                    square: event.square,
                    verbose: true
                }
            );
            event.chessboard.addMarker(event.square, MARKER_TYPE.square);

            for (const move of moves)
            {
                event.chessboard.addMarker(move.to, MARKER_TYPE.circle);
            }

            return moves.length > 0;
        }
        else if (event.type === INPUT_EVENT_TYPE.moveDone)
        {
            const move: ShortMove = {
                from: event.squareFrom,
                to: event.squareTo
            };

            if ( ((move.to[1] == '1') || (move.to[1] == '8')) && (this.chess.get(move.from)?.type == 'p') )
            {
                // TODO: Ask for the piece type to promote to via a dialog.

                move.promotion = 'q';
            }
            const result = this.chess.move(move);

            if (result !== null)
            {
                event.chessboard.disableMoveInput();
                event.chessboard.removeMarkers(undefined, MARKER_TYPE.square);

                const moveString = move.from + move.to + (move.promotion || '');
                this.playerSocket.emit('message', ClientToServerCommand.Turn + moveString + '\n');
            }
            else
            {
                console.warn('Invalid move', move);
            }

            return result;
        }
        else
        {
            // Cancelled move:
            return null;
        }
    }

    private async startNextGame (colour: Colour): Promise<void>
    {
        if (this.chessboard === null)
        {
            throw new Error('Server sent a start next game event while the UI is not fully initialised.');
        }

        await this.chessboard.setPosition('start');
        this.chess?.reset();

        this.chessboard.disableMoveInput();

        switch (colour)
        {
            case Colour.Black:
                this.chessboard.setOrientation(ChessboardColour.black);
                break;
            case Colour.White:
                this.chessboard.setOrientation(ChessboardColour.white);
                this.chessboard.enableMoveInput(this.handleHumanInput.bind(this), ChessboardColour.white);
                break;
            case Colour.None:
                // Do nothing.
                break;
        }
    }

    private async end (): Promise<void>
    {
        if (this.chessboard === null)
        {
            throw new Error('Server sent a end event while chessboard is not initialised.');
        }

        this.chessboard.disableMoveInput();
        await this.chessboard.setPosition('empty');
    }
}

const main = new Main();
main.run();

