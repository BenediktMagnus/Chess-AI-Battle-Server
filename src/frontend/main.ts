import * as TypedSocketIo from './typedSocketIo';
import { Chessboard } from 'cm-chessboard';
import { io } from './dependency/socketIoClient';
import { Translator } from './localisation/translator';
import { Utils } from './utility/utils';

class Main
{
    private translator: Translator;
    private socket: TypedSocketIo.Socket;

    constructor ()
    {
        this.translator = new Translator();
        this.socket = io();

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

        this.socket.connect();
    }

    public run (): void
    {
        //
    }

    private async onDocumentLoaded (): Promise<void>
    {
        await this.translator.run();

        new Chessboard(
            document.getElementById('board'),
            {
                position: 'start',
                animationDuration: 20,
                sprite: {
                    url: '/cm-chessboard/assets/images/chessboard-sprite-staunty.svg',
                },
            }
        );
    }
}

const main = new Main();
main.run();
