import { BaseMessage } from './baseMessage';
import { ServerToClientCommand } from '../../../shared/commands/serverToClientCommand';

export class InvalidMoveMessage extends BaseMessage
{
    constructor ()
    {
        super(ServerToClientCommand.InvalidMove);
    }
}
