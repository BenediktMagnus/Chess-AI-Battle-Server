import * as EventFunctionDefinitions from './eventFunctionDefinitions';

export default interface ServerToPlayerEvents
{
    /** Send a message. */
    message: EventFunctionDefinitions.HumanPlayerMessage;
}
