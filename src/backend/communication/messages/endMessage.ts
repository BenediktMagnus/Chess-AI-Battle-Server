import { BaseMessage } from './baseMessage';
import { ServerToClientCommand } from '../command/serverToClientCommand';

export class EndMessage extends BaseMessage
{
    constructor ()
    {
        super(ServerToClientCommand.End);
    }
}
