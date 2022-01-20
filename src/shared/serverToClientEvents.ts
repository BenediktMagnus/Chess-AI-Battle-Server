import * as EventFunctionDefinitions from './eventFunctionDefinitions';

export default interface ServerToClientEvents
{
    /** Initiate board and statistics. */
    initiate: EventFunctionDefinitions.Initiate;
    /** Make a player move. */
    move: EventFunctionDefinitions.Move;
    /** Start the next game/round. */
    startNextGame: EventFunctionDefinitions.StartNextGame;
    /** End the battle. */
    end: EventFunctionDefinitions.End;
}
