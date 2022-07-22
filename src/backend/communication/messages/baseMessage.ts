import { Message } from './message';
import { ServerToClientCommand } from '../../../shared/commands/serverToClientCommand';

export abstract class BaseMessage implements Message
{
    private _command: ServerToClientCommand;

    public get command (): ServerToClientCommand
    {
        return this._command;
    }

    protected set command (newCommand: ServerToClientCommand)
    {
        this._command = newCommand;
    }

    constructor (command: ServerToClientCommand)
    {
        this._command = command;
    }

    public compose (): string
    {
        return this.command;
    }
}
