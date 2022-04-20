import { Colour } from '../../shared/colour';
import net from 'net';

export class Player
{
    public name: string;
    public colour: Colour;
    public socket: net.Socket;
    public stopWatchTime: number;

    constructor (socket: net.Socket, clientNumber: number)
    {
        this.name = `Player ${clientNumber}`;
        this.colour = Colour.None;
        this.socket = socket;
        this.stopWatchTime = 0;
    }
}
