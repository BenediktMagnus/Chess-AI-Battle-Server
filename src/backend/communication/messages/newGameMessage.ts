import { BaseMessage } from './baseMessage';
import { Colour } from '../../../shared/colour';
import { ServerToClientCommand } from '../../../shared/commands/serverToClientCommand';

export class NewGameMessage extends BaseMessage
{
    private readonly colour: Colour;

    constructor (colour: Colour)
    {
        super(ServerToClientCommand.NewGame);

        this.colour = colour;
    }

    public override compose (): string
    {
        return this.command + this.colour;
    }
}
