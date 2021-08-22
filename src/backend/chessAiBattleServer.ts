import Server from "./server/server";

const httpPort = 8032;

export class ChessAiBattleServer
{
    private readonly server: Server;

    constructor ()
    {
        this.server = new Server();

        this.server.httpPort = httpPort;
    }

    public run (): void
    {
        this.server.start();
    }

    public async terminate (): Promise<void>
    {
        await this.server.stop();
    }
}
