import { Colour } from '../../shared/colour';
import { PlayerConnection } from '../server/playerConnection/playerConnection';

export class Player
{
    public name: string;
    public colour: Colour;
    public connection: PlayerConnection;
    public stopWatchTime: number;

    constructor (connection: PlayerConnection, clientNumber: number)
    {
        this.name = `Player ${clientNumber}`;
        this.colour = Colour.None;
        this.connection = connection;
        this.stopWatchTime = 0;
    }
}
