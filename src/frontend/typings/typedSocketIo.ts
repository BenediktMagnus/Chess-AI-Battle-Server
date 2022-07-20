import type * as socketIoClient from "socket.io-client";
import type ClientToServerEvents from '../../shared/events/clientToServerEvents';
import type PlayerToServerEvents from '../../shared/events/playerToServerEvents';
import type ServerToClientEvents from '../../shared/events/serverToClientEvents';
import type ServerToPlayerEvents from '../../shared/events/serverToPlayerEvents';

export type Socket = socketIoClient.Socket<ServerToClientEvents, ClientToServerEvents>;
export type HumanPlayerSocket = socketIoClient.Socket<ServerToPlayerEvents, PlayerToServerEvents>;
