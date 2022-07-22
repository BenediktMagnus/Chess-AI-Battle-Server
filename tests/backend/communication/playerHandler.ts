import 'mocha';
import * as mockito from 'ts-mockito';
import * as TypedSocketIo from '../../../src/backend/server/typedSocketIo';
import { assert } from 'chai';
import { ClientToServerCommand } from '../../../src/backend/communication/command/clientToServerCommand';
import { Colour } from '../../../src/shared/colour';
import EventHandler from '../../../src/backend/utility/eventHandler';
import { Game } from '../../../src/backend/game/game';
import { PlayerConnection } from '../../../src/backend/server/playerConnection/playerConnection';
import { PlayerHandler } from '../../../src/backend/communication/playerHandler';
import { Server } from '../../../src/backend/server/server';
import { ServerToClientCommand } from '../../../src/backend/communication/command/serverToClientCommand';
import { Statistician } from '../../../src/backend/statistic/statistician';

let serverMock: Server;
let socketIoMock: TypedSocketIo.Server;
let player1ConnectionMock: PlayerConnection;
let player2ConnectionMock: PlayerConnection;

let connectEventHandler: EventHandler<(playerConnection: PlayerConnection) => void>;
let disconnectEventHandler: EventHandler<(playerConnection: PlayerConnection) => void>;
let messageEventHandler: EventHandler<(playerConnection: PlayerConnection, message: string) => void>;

let playerHandler: PlayerHandler;

resetTestEnvironment();

function resetTestEnvironment (): void
{
    serverMock = mockito.mock(Server);
    socketIoMock = mockito.mock(TypedSocketIo.Server);
    player1ConnectionMock = mockito.mock<PlayerConnection>();
    player2ConnectionMock = mockito.mock<PlayerConnection>();

    connectEventHandler = new EventHandler();
    disconnectEventHandler = new EventHandler();
    messageEventHandler = new EventHandler();

    mockito.when(serverMock.onPlayerConnect).thenReturn(connectEventHandler);
    mockito.when(serverMock.onPlayerDisconnect).thenReturn(disconnectEventHandler);
    mockito.when(serverMock.onPlayerMessage).thenReturn(messageEventHandler);
    mockito.when(serverMock.socketIo).thenReturn(socketIoMock);

    mockito.when(player1ConnectionMock.close()).thenReturn();
    mockito.when(player1ConnectionMock.end()).thenReturn();
    mockito.when(player1ConnectionMock.write(mockito.anyString())).thenReturn();
    mockito.when(player2ConnectionMock.close()).thenReturn();
    mockito.when(player2ConnectionMock.end()).thenReturn();
    mockito.when(player2ConnectionMock.write(mockito.anyString())).thenReturn();

    const game = new Game();
    const statistician = new Statistician();

    playerHandler = new PlayerHandler(mockito.instance(serverMock), game, statistician, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
}

describe('PlayerHandler',
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
                connectEventHandler.dispatchEvent(mockito.instance(player1ConnectionMock));
                mockito.verify(player1ConnectionMock.close()).never();

                connectEventHandler.dispatchEvent(mockito.instance(player2ConnectionMock));
                mockito.verify(player2ConnectionMock.close()).never();

                const player3ConnectionMock = mockito.mock<PlayerConnection>();

                connectEventHandler.dispatchEvent(mockito.instance(player3ConnectionMock));
                mockito.verify(player3ConnectionMock.close()).once();
            }
        );

        it('can play a turn for every player.',
            function ()
            {
                const onMessageEventHandler = new EventHandler<(playerConnection: PlayerConnection, message: string) => void>();

                mockito.when(serverMock.onPlayerMessage).thenReturn(onMessageEventHandler);

                const player1Connection = mockito.instance(player1ConnectionMock);
                const player2Connection = mockito.instance(player2ConnectionMock);

                let whitePlayer = player1Connection;
                let blackPlayer = player2Connection;

                mockito.when(player2ConnectionMock.write(mockito.anyString()))
                    .thenCall(
                        (message: string) =>
                        {
                            if (message == ServerToClientCommand.NewGame + Colour.White + '\n')
                            {
                                whitePlayer = player2Connection;
                                blackPlayer = player1Connection;
                            }
                        }
                    );

                connectEventHandler.dispatchEvent(player1Connection);
                connectEventHandler.dispatchEvent(player2Connection);

                mockito.verify(player1ConnectionMock.write(mockito.anyString())).once();
                mockito.resetCalls(player1ConnectionMock);

                mockito.verify(player2ConnectionMock.write(mockito.anyString())).once();
                mockito.resetCalls(player2ConnectionMock);

                const assertTurnCall = (message: string): void =>
                {
                    assert.isTrue(message.startsWith(ServerToClientCommand.Turn));
                };

                mockito.when(player1ConnectionMock.write(mockito.anyString())).thenCall(assertTurnCall);
                mockito.when(player2ConnectionMock.write(mockito.anyString())).thenCall(assertTurnCall);

                messageEventHandler.dispatchEvent(whitePlayer, ClientToServerCommand.Turn + 'a2a3');
                messageEventHandler.dispatchEvent(blackPlayer, ClientToServerCommand.Turn + 'a7a6');
                mockito.verify(player1ConnectionMock.write(mockito.anyString())).once();
                mockito.verify(player2ConnectionMock.write(mockito.anyString())).once();
            }
        );
    }
);
