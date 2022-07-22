import { BaseMessage } from "./baseMessage";
import { ServerToClientCommand } from "../../../shared/commands/serverToClientCommand";

export class TimeoutMessage extends BaseMessage
{
    constructor ()
    {
        super(ServerToClientCommand.Timeout);
    }
}
