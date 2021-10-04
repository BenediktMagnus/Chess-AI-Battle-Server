import { BaseMessage } from "./baseMessage";
import { ServerToClientCommand } from "../command/serverToClientCommand";

export class StalemateWithoutTurnMessage extends BaseMessage
{
    constructor ()
    {
        super(ServerToClientCommand.Stalemate);
    }
}
