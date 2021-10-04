import { ServerToClientCommand } from "../command/serverToClientCommand";
import { TurnMessage } from "./turnMessage";

export class StalemateWithTurnMessage extends TurnMessage
{
    constructor (from: string, to: string, promotion?: string)
    {
        super(from, to, promotion);

        this.command = ServerToClientCommand.Stalemate;
    }
}
