import 'mocha';
import * as mockito from 'ts-mockito';
import { assert } from 'chai';
import { Player } from '../../../src/backend/game/player';
import { PlayerList } from '../../../src/backend/game/playerList';
import { PlayerConnection } from '../../../src/backend/server/playerConnection/playerConnection';

const connectionMock = mockito.mock(PlayerConnection);

describe('PlayerList',
    function ()
    {
        it('is empty at the beginning',
            function ()
            {
                const playerList = new PlayerList();

                assert.strictEqual(playerList.count, 0);
            }
        );

        it('can add a player',
            function ()
            {
                const playerList = new PlayerList();
                const player = new Player(mockito.instance(connectionMock), 1);

                playerList.add(player);

                assert.strictEqual(playerList.count, 1);
            }
        );

        it('can add two players',
            function ()
            {
                const playerList = new PlayerList();
                const player1 = new Player(mockito.instance(connectionMock), 1);
                const player2 = new Player(mockito.instance(connectionMock), 2);

                playerList.add(player1);
                playerList.add(player2);

                assert.strictEqual(playerList.count, 2);
            }
        );

        it('can remove a player',
            function ()
            {
                const playerList = new PlayerList();
                const player = new Player(mockito.instance(connectionMock), 1);

                playerList.add(player);
                playerList.remove(player);

                assert.strictEqual(playerList.count, 0);
            }
        );

        it('can get a player by its socket',
            function ()
            {
                const playerList = new PlayerList();
                const player = new Player(mockito.instance(connectionMock), 1);

                playerList.add(player);

                assert.strictEqual(playerList.getByConnection(player.connection), player);
            }
        );

        it('returns null if trying to get a player that is not in the list',
            function ()
            {
                const playerList = new PlayerList();
                const player = new Player(mockito.instance(connectionMock), 1);

                const returnedPlayer = playerList.getByConnection(player.connection);

                assert.isNull(returnedPlayer);
            }
        );

        it('can remove a player by its socket',
            function ()
            {
                const playerList = new PlayerList();
                const player = new Player(mockito.instance(connectionMock), 1);

                playerList.add(player);
                playerList.removeByConnection(player.connection);

                assert.strictEqual(playerList.count, 0);
            }
        );

        it('throws an error if trying to add more than two players',
            function ()
            {
                const playerList = new PlayerList();
                const player1 = new Player(mockito.instance(connectionMock), 1);
                const player2 = new Player(mockito.instance(connectionMock), 2);
                const player3 = new Player(mockito.instance(connectionMock), 3);

                playerList.add(player1);
                playerList.add(player2);

                assert.throws(
                    () => playerList.add(player3)
                );
            }
        );
    }
);
