import { Translator } from './localisation/translator';
import { Utils } from './utility/utils';

class Main
{
    private translator: Translator;

    constructor ()
    {
        this.translator = new Translator();

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

const main = new Main();
main.run();
