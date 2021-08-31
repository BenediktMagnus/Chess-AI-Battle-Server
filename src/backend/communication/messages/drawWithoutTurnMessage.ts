import { BaseMessage } from "./baseMessage";
import { ServerToClientCommand } from "../command/serverToClientCommand";

export class DrawWithoutTurnMessage extends BaseMessage
{
    constructor ()
    {
        super(ServerToClientCommand.Draw);
    }
}
