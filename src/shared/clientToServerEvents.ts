import * as EventFunctionDefinitions from './eventFunctionDefinitions';

export default interface ClientToServerEvents
{
    /** Register at the server. The server will answer with an initialisation and start to send updates. */
    register: EventFunctionDefinitions.Register; // TODO: Rename to something like "registerViewer".
    /** Register a human player. */
    registerPlayer: EventFunctionDefinitions.RegisterPlayer;
    /** Send a play command. */
    play: EventFunctionDefinitions.Play;
}
