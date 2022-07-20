import * as socketIo from 'socket.io';
import ClientToServerEvents from '../../shared/events/clientToServerEvents';
import PlayerToServerEvents from '../../shared/events/playerToServerEvents';
import ServerToClientEvents from '../../shared/events/serverToClientEvents';
import ServerToPlayerEvents from '../../shared/events/serverToPlayerEvents';

export class Server extends socketIo.Server<ClientToServerEvents, ServerToClientEvents> {}
export class Socket extends socketIo.Socket<ClientToServerEvents, ServerToClientEvents> {}

export class HumanPlayerNamespace extends socketIo.Namespace<PlayerToServerEvents, ServerToPlayerEvents> {}
export class HumanPlayerSocket extends socketIo.Socket<PlayerToServerEvents, ServerToPlayerEvents> {}
