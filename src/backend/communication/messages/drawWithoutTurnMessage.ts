import { BaseMessage } from "./baseMessage";
import { ServerToClientCommand } from "../../../shared/commands/serverToClientCommand";

export class DrawWithoutTurnMessage extends BaseMessage
{
    constructor ()
    {
        super(ServerToClientCommand.Draw);
    }
}
