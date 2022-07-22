import { BaseMessage } from "./baseMessage";
import { ServerToClientCommand } from "../../../shared/commands/serverToClientCommand";

export class WonMessage extends BaseMessage
{
    constructor ()
    {
        super(ServerToClientCommand.Won);
    }
}
