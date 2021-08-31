import { BaseMessage } from './baseMessage';
import { Colour } from '../../game/colour';
import { ServerToClientCommand } from '../command/serverToClientCommand';

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
