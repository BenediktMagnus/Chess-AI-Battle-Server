import * as EventFunctionDefinitions from '../../shared/eventFunctionDefinitions';
import * as TypedSocketIo from '../server/typedSocketIo';
import { Server } from '../server/server';

export class ViewerHandler
{
    private viewers: Set<TypedSocketIo.Socket>;
    private server: Server;

    constructor (server: Server)
    {
        this.viewers = new Set();

        this.server = server;

        this.server.socketIo.on('connection', this.onConnection);
    }

    public terminate (): void
    {
        this.server.socketIo.off('connection', this.onConnection);

        for (const viewer of this.viewers)
        {
            viewer.disconnect();

            this.viewers.delete(viewer);
        }
    }

    private onConnection = (socket: TypedSocketIo.Socket): void =>
    {
        socket.on('init', this.onInit.bind(this));
    };

    private onInit (_reply: EventFunctionDefinitions.InitReply): void
    {
        throw new Error('Method not implemented.');
    }
}
