import { ServerToClientCommand } from "../command/serverToClientCommand";
import { TurnMessage } from "./turnMessage";

export class LostMessage extends TurnMessage
{
    constructor (from: string, to: string, promotion?: string)
    {
        super(from, to, promotion);

        this.command = ServerToClientCommand.Lost;
    }
}
