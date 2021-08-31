import { BaseMessage } from "./baseMessage";
import { ServerToClientCommand } from "../command/serverToClientCommand";

export class TimeoutMessage extends BaseMessage
{
    constructor ()
    {
        super(ServerToClientCommand.Timeout);
    }
}
