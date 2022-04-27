import * as TypedSocketIo from '../typings/typedSocketIo';
import { io } from 'socket.io-client';
import { Translator } from '../localisation/translator';
import { Utils } from '../utility/utils';

class AdminPage
{
    private translator: Translator;
    private socket: TypedSocketIo.Socket;

    constructor ()
    {
        this.translator = new Translator();
        this.socket = io();

        this.socket.connect();

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
    }
}

const adminPage = new AdminPage();
adminPage.run();
