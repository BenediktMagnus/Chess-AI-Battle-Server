import 'mocha';
import * as mockito from 'ts-mockito';
import * as TypedSocketIo from '../../src/backend/server/typedSocketIo';
import { assert } from 'chai';
import { ChessAiBattleServer } from '../../src/backend/chessAiBattleServer';
import { ClientToServerCommand } from '../../src/backend/communication/command/clientToServerCommand';
import { Colour } from '../../src/backend/game/colour';
import EventHandler from '../../src/backend/utility/eventHandler';
import net from 'net';
import { Server } from '../../src/backend/server/server';
import { ServerToClientCommand } from '../../src/backend/communication/command/serverToClientCommand';

let serverMock: Server;
let socketIoMock: TypedSocketIo.Server;
let player1SocketMock: net.Socket;
let player2SocketMock: net.Socket;

let connectEventHandler: EventHandler<(socket: net.Socket) => void>;
let disconnectEventHandler: EventHandler<(socket: net.Socket) => void>;
let messageEventHandler: EventHandler<(socket: net.Socket, message: string) => void>;

let chessAiBattleServer: ChessAiBattleServer;

resetTestEnvironment();

function resetTestEnvironment (): void
{
    serverMock = mockito.mock(Server);
    socketIoMock = mockito.mock(TypedSocketIo.Server);
    player1SocketMock = mockito.mock(net.Socket);
    player2SocketMock = mockito.mock(net.Socket);

    connectEventHandler = new EventHandler();
    disconnectEventHandler = new EventHandler();
    messageEventHandler = new EventHandler();

    mockito.when(serverMock.onConnect).thenReturn(connectEventHandler);
    mockito.when(serverMock.onDisconnect).thenReturn(disconnectEventHandler);
    mockito.when(serverMock.onMessage).thenReturn(messageEventHandler);
    mockito.when(serverMock.socketIo).thenReturn(socketIoMock);

    chessAiBattleServer = new ChessAiBattleServer(mockito.instance(serverMock));
    chessAiBattleServer.maxTurnTimeMs = Number.MAX_SAFE_INTEGER;
    chessAiBattleServer.maxRounds = Number.MAX_SAFE_INTEGER;
}

describe('ChessAiBattleServer',
    function ()
    {
        beforeEach(
            function ()
            {
                resetTestEnvironment();
            }
        );

        it('allows only two connections.',
            function ()
            {
                connectEventHandler.dispatchEvent(mockito.instance(player1SocketMock));
                mockito.verify(player1SocketMock.destroy()).never();

                connectEventHandler.dispatchEvent(mockito.instance(player2SocketMock));
                mockito.verify(player2SocketMock.destroy()).never();

                const player3SocketMock = mockito.mock(net.Socket);

                connectEventHandler.dispatchEvent(mockito.instance(player3SocketMock));
                mockito.verify(player3SocketMock.destroy()).once();
            }
        );

        it('can play a turn for every player.',
            function ()
            {
                const onMessageEventHandler = new EventHandler<(socket: net.Socket, message: string) => void>();

                mockito.when(serverMock.onMessage).thenReturn(onMessageEventHandler);

                const player1Socket = mockito.instance(player1SocketMock);
                const player2Socket = mockito.instance(player2SocketMock);

                let whitePlayer = player1Socket;
                let blackPlayer = player2Socket;

                mockito.when(
                    player2SocketMock.write(mockito.anyString()))
                    .thenCall(
                        (message: string) =>
                        {
                            if (message.endsWith(Colour.White))
                            {
                                whitePlayer = player2Socket;
                                blackPlayer = player1Socket;
                            }

                            return true;
                        }
                    );

                connectEventHandler.dispatchEvent(player1Socket);
                connectEventHandler.dispatchEvent(player2Socket);

                mockito.verify(player1SocketMock.write(mockito.anyString())).once();
                mockito.resetCalls(player1SocketMock);

                mockito.verify(player2SocketMock.write(mockito.anyString())).once();
                mockito.resetCalls(player2SocketMock);

                mockito.when(player2SocketMock.write(mockito.anyString())).thenReturn(true);

                const assertTurnCall = (message: string): void => { assert.isTrue(message.startsWith(ServerToClientCommand.Turn)); };

                mockito.when(player1SocketMock.write(mockito.anyString())).thenCall(assertTurnCall);
                mockito.when(player2SocketMock.write(mockito.anyString())).thenCall(assertTurnCall);

                messageEventHandler.dispatchEvent(whitePlayer, ClientToServerCommand.Turn + 'a2a3');
                messageEventHandler.dispatchEvent(blackPlayer, ClientToServerCommand.Turn + 'a7a6');
                mockito.verify(player2SocketMock.write(mockito.anyString())).once();
                mockito.verify(player1SocketMock.write(mockito.anyString())).once();
            }
        );
    }
);
