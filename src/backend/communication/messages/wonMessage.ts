import { BaseMessage } from "./baseMessage";
import { ServerToClientCommand } from "../command/serverToClientCommand";

export class WonMessage extends BaseMessage
{
    constructor ()
    {
        super(ServerToClientCommand.Won);
    }
}
