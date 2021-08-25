import { Colour } from './colour';
import net from 'net';

export class Player
{
    public name: string;
    public colour: Colour;
    public socket: net.Socket;

    constructor (socket: net.Socket, clientNumber: number)
    {
        this.name = `Player ${clientNumber}`;
        this.colour = Colour.None;
        this.socket = socket;
    }
}
