import { ServerToClientCommand } from "../../../shared/commands/serverToClientCommand";

export interface Message
{
    readonly command: ServerToClientCommand;

    /** Get the message as a single composed string. */
    compose (): string;
}
