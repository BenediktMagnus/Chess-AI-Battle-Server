import * as EventFunctionDefinitions from '../../shared/eventFunctionDefinitions';
import * as TypedSocketIo from '../server/typedSocketIo';
import { Server } from '../server/server';
import { Statistician } from '../statistic/statistician';

export class ViewerHandler
{
    private server: Server;
    private statistician: Statistician;

    private viewers: Set<TypedSocketIo.Socket>;

    constructor (server: Server, statistician: Statistician)
    {
        this.server = server;
        this.statistician = statistician;

        this.viewers = new Set();

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
