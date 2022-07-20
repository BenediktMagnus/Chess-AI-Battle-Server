import net from 'net';
import { PlayerConnection } from './playerConnection';

export class TcpPlayerConnection extends PlayerConnection
{
    private socket: net.Socket;

    constructor (socket: net.Socket)
    {
        super();

        this.socket = socket;

        socket.setEncoding('utf8');
        socket.setNoDelay(true);

        /* NOTE: Instead of implementing all methods by calling the corresponding methods of the socket, one could bind them here like that:
            public close: () => void;
            this.close = socket.close.bind(socket);
            That seems to be more efficient at first, but the bound statement is nothing else than we do manually now. And doing it manually
            is much more flexible if, in the future, the interface changes and adjustments have to be made inside these methods.
        */
    }

    public close (): void
    {
        this.socket.destroy();
    }

    public end (): void
    {
        this.socket.end();
    }

    public write (data: string): void
    {
        this.socket.write(data);
    }
}
