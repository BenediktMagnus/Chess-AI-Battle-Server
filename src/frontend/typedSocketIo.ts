import type * as socketIoClient from "socket.io-client";
import type ClientToServerEvents from '../shared/clientToServerEvents';
import type ServerToClientEvents from '../shared/serverToClientEvents';

export type Socket = socketIoClient.Socket<ServerToClientEvents, ClientToServerEvents>;
