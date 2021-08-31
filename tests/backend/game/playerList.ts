import 'mocha';
import * as mockito from 'ts-mockito';
import { assert } from 'chai';
import net from 'net';
import { Player } from '../../../src/backend/game/player';
import { PlayerList } from '../../../src/backend/game/playerList';

const socketMock = mockito.mock(net.Socket);

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
                const player = new Player(mockito.instance(socketMock), 1);

                playerList.add(player);

                assert.strictEqual(playerList.count, 1);
            }
        );

        it('can add two players',
            function ()
            {
                const playerList = new PlayerList();
                const player1 = new Player(mockito.instance(socketMock), 1);
                const player2 = new Player(mockito.instance(socketMock), 2);

                playerList.add(player1);
                playerList.add(player2);

                assert.strictEqual(playerList.count, 2);
            }
        );

        it('can remove a player',
            function ()
            {
                const playerList = new PlayerList();
                const player = new Player(mockito.instance(socketMock), 1);

                playerList.add(player);
                playerList.remove(player);

                assert.strictEqual(playerList.count, 0);
            }
        );

        it('can get a player by its socket',
            function ()
            {
                const playerList = new PlayerList();
                const player = new Player(mockito.instance(socketMock), 1);

                playerList.add(player);

                assert.strictEqual(playerList.getBySocket(player.socket), player);
            }
        );

        it('returns null if trying to get a player that is not in the list',
            function ()
            {
                const playerList = new PlayerList();
                const player = new Player(mockito.instance(socketMock), 1);

                const returnedPlayer = playerList.getBySocket(player.socket);

                assert.isNull(returnedPlayer);
            }
        );

        it('can remove a player by its socket',
            function ()
            {
                const playerList = new PlayerList();
                const player = new Player(mockito.instance(socketMock), 1);

                playerList.add(player);
                playerList.removeBySocket(player.socket);

                assert.strictEqual(playerList.count, 0);
            }
        );

        it('throws an error if trying to add more than two players',
            function ()
            {
                const playerList = new PlayerList();
                const player1 = new Player(mockito.instance(socketMock), 1);
                const player2 = new Player(mockito.instance(socketMock), 2);
                const player3 = new Player(mockito.instance(socketMock), 3);

                playerList.add(player1);
                playerList.add(player2);

                assert.throws(
                    () => playerList.add(player3)
                );
            }
        );
    }
);
