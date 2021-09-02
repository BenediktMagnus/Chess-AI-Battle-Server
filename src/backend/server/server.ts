import * as http from 'http';
import * as TypedSocketIo from './typedSocketIo';
import compression from 'compression';
import EventHandler from '../utility/eventHandler';
import express from 'express';
import net from 'net';

export class Server
{
    public static readonly defaultHttpPort = 8080;
    public static readonly defaultTcpPort = 2409;

    private readonly express: express.Express;
    private readonly http: http.Server;

    private readonly io: TypedSocketIo.Server;

    private readonly tcp: net.Server;

    private socketToDataBuffer: Map<net.Socket, string>;

    public httpPort: number;
    public tcpPort: number;

    /** Fired when a new socket connected. */
    public readonly onConnect: EventHandler<(socket: net.Socket) => void>;
    /** Fired when a socket disconnected. */
    public readonly onDisconnect: EventHandler<(socket: net.Socket) => void>;
    /** Fired when a socket received a message (every line of data is a message). */
    public readonly onMessage: EventHandler<(socket: net.Socket, message: string) => void>;
    public readonly onError: EventHandler<(error: Error) => void>;

    constructor ()
    {
        this.express = express();

        // Do not send the "x-powered-by: express" header entry:
        this.express.disable('x-powered-by');

        // Middleware for gzip compression:
        this.express.use(compression());

        // Favicon:
        this.express.use('/favicon.svg', express.static('./files/favicon.svg'));

        // Map and source files:
        if (process.argv.includes('--serveMapFiles'))
        {
            // If explicitely stated in command line (probably by the debugger) serve map and Typescript
            // source files for the Javascript scripts, making debugging in the browser easier:
            this.express.use('/scripts', express.static('./bin/frontend', {extensions: ['js', 'js.map']}));
            this.express.use(
                '/src/frontend',
                express.static('./src/frontend', {extensions: ['ts']})
            );
        }
        else
        {
            // If not stated in command line, only serve script files from the bin directory.
            // We do not want map and source files in a production environment!
            this.express.use('/scripts', express.static('./bin/frontend', {extensions: ['js']}));
        }

        // Serving of html files on root level without extension:
        this.express.use('/', express.static('./files/html', {extensions: ['html']}));
        // Serving of static ressources:
        this.express.use('/css', express.static('./files/css', {extensions: ['css']}));
        this.express.use('/images', express.static('./files/images'));
        // Serving of localisation files:
        this.express.use('/local', express.static('./files/local', {extensions: ['json']}));

        // Serving of the cm-chessboard assets:
        this.express.use('/cm-chessboard/assets', express.static('./node_modules/cm-chessboard/assets'));
        // Serving of the cm-chessboard sources:
        this.express.use('/cm-chessboard/src', express.static('./node_modules/cm-chessboard/src/cm-chessboard'));

        this.httpPort = Server.defaultHttpPort;

        this.http = new http.Server(this.express);

        this.io = new TypedSocketIo.Server(this.http);

        this.tcpPort = Server.defaultTcpPort;

        this.tcp = new net.Server();

        this.tcp.maxConnections = 2; // A chess server only needs two players.

        this.socketToDataBuffer = new Map();

        this.onConnect = new EventHandler();
        this.onDisconnect = new EventHandler();
        this.onMessage = new EventHandler();
        this.onError = new EventHandler();
    }

    public get socketIo (): TypedSocketIo.Server
    {
        return this.io;
    }

    private onTcpConnection (socket: net.Socket): void
    {
        socket.setEncoding('utf8');

        this.onConnect.dispatchEvent(socket);
    }

    private onTcpDisconnection (socket: net.Socket): void
    {
        this.socketToDataBuffer.delete(socket);

        this.onDisconnect.dispatchEvent(socket);
    }

    /**
     * Splits the incoming data into lines and fires the onReceive event.
     * Data without a line break is buffered until data with a line break is received.
     */
    private onTcpReceive (socket: net.Socket, data: string): void
    {
        let remainingData = (this.socketToDataBuffer.get(socket) ?? '') + data;

        let lineEndingIndex = remainingData.indexOf('\n');

        while (lineEndingIndex !== -1)
        {
            const line = remainingData.substring(0, lineEndingIndex);
            remainingData = remainingData.substring(lineEndingIndex + 1);

            this.onMessage.dispatchEvent(socket, line);

            lineEndingIndex = remainingData.indexOf('\n');
        }

        if (remainingData.length > 0)
        {
            this.socketToDataBuffer.set(socket, remainingData);
        }
        else
        {
            this.socketToDataBuffer.delete(socket);
        }
    }

    private onTcpError (error: Error): void
    {
        console.error(error);

        this.onError.dispatchEvent(error);
    }

    public start (): void
    {
        this.tcp.on('connection', this.onTcpConnection.bind(this));
        this.tcp.on('close', this.onTcpDisconnection.bind(this));
        this.tcp.on('data', this.onTcpReceive.bind(this));
        this.tcp.on('error', this.onTcpError.bind(this));

        this.tcp.listen(this.tcpPort);

        this.http.listen(this.httpPort);
    }

    public async stop (): Promise<void>
    {
        const socketIoPromise = new Promise<void>(
            (resolve, reject) =>
            {
                this.socketIo.close(
                    error =>
                    {
                        if (error)
                        {
                            reject(error);
                        }
                        else
                        {
                            resolve();
                        }
                    }
                );
            }
        );

        const tcpPromise = new Promise<void>(
            (resolve, reject) =>
            {
                this.tcp.close(
                    error =>
                    {
                        if (error)
                        {
                            reject(error);
                        }
                        else
                        {
                            resolve();
                        }
                    }
                );
            }
        );

        await Promise.all([socketIoPromise, tcpPromise]);
    }
}
