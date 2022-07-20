import * as TypedSocketIo from '../typings/typedSocketIo';
import { Chess, ChessInstance, Move } from 'chess.js';
import { Chessboard, COLOR as ChessboardColour, INPUT_EVENT_TYPE, MARKER_TYPE, MoveInputEventHandlerParameters, PIECE as Piece, Square } from 'cm-chessboard';
import { Colour } from '../../shared/colour';
import { io } from 'socket.io-client';
import { PlayerStatistic } from '../../shared/playerStatistic';
import { Translator } from '../localisation/translator';
import { Utils } from '../utility/utils';

class Main
{
    private translator: Translator;
    private socket: TypedSocketIo.Socket;
    private chessboard: Chessboard|null;
    private chess: ChessInstance|null;

    constructor ()
    {
        this.translator = new Translator();
        this.socket = io();

        this.socket.on('initiate', Utils.catchVoidPromise(this.onInitiate.bind(this)));
        this.socket.on('move', Utils.catchVoidPromise(this.onMove.bind(this)));
        this.socket.on('startNextGame', Utils.catchVoidPromise(this.onStartNextGame.bind(this)));
        this.socket.on('end', Utils.catchVoidPromise(this.onEnd.bind(this)));

        this.socket.connect();

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
    }

    private async onInitiate (board: string): Promise<void>
    {
        if (this.chessboard === null)
        {
            throw new Error('Server sent an initiate event while the UI is not fully initialised.');
        }

        await this.chessboard.setPosition(board);
        //FIXME: set chess
        this.chessboard.disableMoveInput();
        this.chessboard.enableMoveInput(this.humanInputHandler.bind(this), ChessboardColour.white);
    }

    private async onMove (move: string): Promise<void>
    {
        if (this.chessboard === null)
        {
            throw new Error('Server sent a move event while chessboard is not initialised.');
        }

        const from = move.substring(0, 2) as Square;
        const to = move.substring(2, 4) as Square;

        await this.chessboard.movePiece(from, to);

        if (move.length > 4)
        {
            const promotion = move.substring(4, 5);

            const oldPiece = this.chessboard.getPiece(to);

            const newPiece = (oldPiece.charAt(0) + promotion) as Piece; // Convert old piece to new piece of the same colour.

            this.chessboard.setPiece(to, newPiece);
            //FIXME: set chess
        }
    }

    private humanInputHandler (event: MoveInputEventHandlerParameters): Move | null | boolean
    {
        console.log('event', event);

        event.chessboard.removeMarkers(undefined, MARKER_TYPE.dot);
        event.chessboard.removeMarkers(undefined, MARKER_TYPE.square);

        if (this.chess === null)
        {
            throw new Error('Chess not initialised');
        }

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
                event.chessboard.addMarker(move.to, MARKER_TYPE.dot);
            }

            return moves.length > 0;
        }
        else if (event.type === INPUT_EVENT_TYPE.moveDone)
        {
            const move = {
                from: event.squareFrom,
                to: event.squareTo
            };
            const result = this.chess.move(move);

            if (result !== null)
            {
                event.chessboard.removeMarkers(undefined, MARKER_TYPE.square);
                event.chessboard.disableMoveInput();
                void event.chessboard.setPosition(this.chess.fen());
                //TODO: promotion
                this.socket.emit('play', 't'+move.from+move.to);
            }
            else
            {
                console.warn('Invalid move', move);
            }

            return result;
        }
        else
        {
            // Cancelled move
            return false;
        }
    }

    private async onStartNextGame (playerStatistics: PlayerStatistic[]): Promise<void>
    {
        if (this.chessboard === null)
        {
            throw new Error('Server sent an start next game event while the UI is not fully initialised.');
        }

        await this.chessboard.setPosition('start');
        this.chess?.reset();

        this.chessboard.disableMoveInput();
        this.chessboard.enableMoveInput(this.humanInputHandler.bind(this), ChessboardColour.white);

        switch (playerStatistics[0].currentColour)
        {
            case Colour.Black:
                this.chessboard.setOrientation(ChessboardColour.black);
                break;
            case Colour.White:
                this.chessboard.setOrientation(ChessboardColour.white);
                break;
            case Colour.None:
                // Do nothing.
                break;
        }
    }

    private async onEnd (): Promise<void>
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

