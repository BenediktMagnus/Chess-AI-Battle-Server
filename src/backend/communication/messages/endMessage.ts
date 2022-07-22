import { BaseMessage } from './baseMessage';
import { ServerToClientCommand } from '../../../shared/commands/serverToClientCommand';

export class EndMessage extends BaseMessage
{
    constructor ()
    {
        super(ServerToClientCommand.End);
    }
}
