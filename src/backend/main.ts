import { ChessAiBattleServer } from "./chessAiBattleServer";
import { Server } from "./server/server";

class Main
{
    private chessAiBattleServer: ChessAiBattleServer|null;
    private applicationIsRunning;

    constructor ()
    {
        this.chessAiBattleServer = null;
        this.applicationIsRunning = false;

        const terminateFunction = (): void => this.terminate();

        process.on('exit', terminateFunction);
        process.on('SIGINT', terminateFunction); // Ctrl + C
        process.on('SIGHUP', terminateFunction); // Terminal closed
        process.on('SIGTERM', terminateFunction); // "kill pid" / "killall"
        process.on('SIGUSR1', terminateFunction); // "kill -SIGUSR1 pid" / "killall -SIGUSR1"
        process.on('SIGUSR2', terminateFunction); // "kill -SIGUSR2 pid" / "killall -SIGUSR2"
    }

    /**
     * Terminate all running connections and report about the closing programme.
     */
    public terminate (): void
    {
        if (this.applicationIsRunning)
        {
            console.log("Chess AI Battle Server is closing...");

            this.applicationIsRunning = false;

            if (this.chessAiBattleServer !== null)
            {
                void this.chessAiBattleServer.terminate();
            }

            console.log("Chess AI Battle Server closed.");
        }
    }

    public run (): void
    {
        console.log('Chess AI Battle Server is starting...');

        this.applicationIsRunning = true;

        const server = new Server();

        this.chessAiBattleServer = new ChessAiBattleServer(server);

        this.chessAiBattleServer.run();

        console.log('Chess AI Battle Server started.');
    }
}

const main = new Main();
main.run();
