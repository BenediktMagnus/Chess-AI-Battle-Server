import * as TypedSocketIo from './dependency/typedSocketIo';
import { Chessboard, PIECE as Piece, Square } from 'cm-chessboard';
import { io } from './dependency/socketIoClient';
import { PlayerStatistic } from '../shared/playerStatistic';
import { Translator } from './localisation/translator';
import { Ui } from './ui/ui';
import { Utils } from './utility/utils';

class Main
{
    private translator: Translator;
    private socket: TypedSocketIo.Socket;
    private ui: Ui|null;
    private chessboard: Chessboard|null;

    constructor ()
    {
        this.translator = new Translator();
        this.socket = io();

        this.socket.on('initiate', Utils.catchVoidPromise(this.onInitiate.bind(this)));
        this.socket.on('move', Utils.catchVoidPromise(this.onMove.bind(this)));
        this.socket.on('startNextGame', Utils.catchVoidPromise(this.onStartNextGame.bind(this)));
        this.socket.on('end', Utils.catchVoidPromise(this.onEnd.bind(this)));

        this.socket.connect();

        this.ui = null;
        this.chessboard = null;

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

        this.ui = new Ui();

        this.chessboard = new Chessboard(
            document.getElementById('board'),
            {
                position: 'start',
                animationDuration: 20,
                sprite: {
                    url: '/cm-chessboard/assets/images/chessboard-sprite-staunty.svg',
                },
            }
        );

        this.socket.emit('register');
    }

    private async onInitiate (board: string, rounds: number, playerStatistics: PlayerStatistic[]): Promise<void>
    {
        if ((this.ui === null) || (this.chessboard === null))
        {
            throw new Error('Server sent an initiate event while the UI is not fully initialised.');
        }

        this.ui.setRounds(rounds);

        if (playerStatistics.length > 0)
        {
            this.ui.setStatistics(playerStatistics);
        }

        await this.chessboard.setPosition(board);
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
        }
    }

    private async onStartNextGame (playerStatistics: PlayerStatistic[]): Promise<void>
    {
        if ((this.ui === null) || (this.chessboard === null))
        {
            throw new Error('Server sent an start next game event while the UI is not fully initialised.');
        }

        this.ui.increaseRounds();
        this.ui.setStatistics(playerStatistics);

        await this.chessboard.setPosition('start');
    }

    private async onEnd (): Promise<void>
    {
        if (this.chessboard === null)
        {
            throw new Error('Server sent a end event while chessboard is not initialised.');
        }

        await this.chessboard.setPosition('empty');
    }
}

const main = new Main();
main.run();
