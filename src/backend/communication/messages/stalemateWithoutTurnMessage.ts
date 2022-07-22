import { BaseMessage } from "./baseMessage";
import { ServerToClientCommand } from "../../../shared/commands/serverToClientCommand";

export class StalemateWithoutTurnMessage extends BaseMessage
{
    constructor ()
    {
        super(ServerToClientCommand.Stalemate);
    }
}
