import { Language } from "./language";

export class Translator
{
    private _language: Language;
    private translations: {[key: string]: string}|null;

    public get language (): Language
    {
        return this._language;
    }

    constructor (language?: Language)
    {
        this.translations = null;

        if (language !== undefined)
        {
            this._language = language;
        }
        else
        {
            this._language = this.getBrowserLanguage();
        }
    }

    /** Runs the translation process. Should be called as soon as the DOM is fully loaded but not earlier. */
    public async run (): Promise<void>
    {
        await this.loadLanguage();

        this.translate();
    }

    private getBrowserLanguage (): Language
    {
        const localisationString = navigator.language;
        const languageString = localisationString.substring(0, 2);

        switch (languageString)
        {
            case 'de':
                return Language.German;
            default:
                return Language.English;
        }
    }

    private async loadLanguage (): Promise<void>
    {
        const response = await fetch(`/local/${this._language}.json`);

        if (response.ok)
        {
            this.translations = await response.json() as {[key: string]: string};
        }
        else
        {
            this.translations = null;

            console.error(
                `Could not load language file for language "${this._language}", response: ${response.status} "${response.statusText}".`
            );
        }
    }

    private translate (): void
    {
        if (this.translations === null)
        {
            console.error(`Could not translate because the language file could not be loaded.`);

            return;
        }

        const elements = document.querySelectorAll('[localId]');

        for (const element of elements)
        {
            const localId = element.getAttribute('localId');

            if ((localId !== null) && (localId in this.translations))
            {
                element.textContent = this.translations[localId];
            }
        }
    }
}
