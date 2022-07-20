import * as EventFunctionDefinitions from './eventFunctionDefinitions';

export default interface PlayerToServerEvents
{
    /** Send a message. */
    message: EventFunctionDefinitions.HumanPlayerMessage;
}
