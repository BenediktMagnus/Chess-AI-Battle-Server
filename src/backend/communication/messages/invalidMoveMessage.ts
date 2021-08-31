import { BaseMessage } from './baseMessage';
import { ServerToClientCommand } from '../command/serverToClientCommand';

export class InvalidMoveMessage extends BaseMessage
{
    constructor ()
    {
        super(ServerToClientCommand.InvalidMove);
    }
}
