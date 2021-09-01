import { Translator } from './localisation/translator';
//import { Utils } from '../shared/utils';

class Main
{
    private translator: Translator;

    constructor ()
    {
        this.translator = new Translator();

        const catchedOnDocumentLoaded = this.catchVoidPromise(this.onDocumentLoaded.bind(this));

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

    private catchVoidPromise (promiseReturner: (...args: any[]) => Promise<void>): (...args: any[]) => void
    {
        const arrowFunction = (...args: any[]): void =>
        {
            promiseReturner(...args).catch(
                (error) =>
                {
                    console.error(error);
                }
            );
        };

        return arrowFunction;
    }
}

const main = new Main();
main.run();
