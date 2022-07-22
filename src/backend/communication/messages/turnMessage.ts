import { BaseMessage } from './baseMessage';
import { ServerToClientCommand } from '../../../shared/commands/serverToClientCommand';

export class TurnMessage extends BaseMessage
{
    private readonly from: string;
    private readonly to: string;
    private readonly promotion: string;

    constructor (from: string, to: string, promotion?: string)
    {
        super(ServerToClientCommand.Turn);

        this.from = from;
        this.to = to;
        this.promotion = promotion ?? '';
    }

    public override compose (): string
    {
        return this.command + this.from + this.to + this.promotion;
    }
}
