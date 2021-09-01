import 'mocha';
import * as mockito from 'ts-mockito';
import { assert } from 'chai';
import { Colour } from '../../../src/backend/game/colour';
import { Game } from '../../../src/backend/game/game';
import { GameState } from '../../../src/backend/game/gameState';
import { MoveResult } from '../../../src/backend/game/moveResult';
import net from 'net';
import { Player } from '../../../src/backend/game/player';

const socketMock = mockito.mock(net.Socket);

describe('Game',
    function ()
    {
        const whitePlayer = new Player(mockito.instance(socketMock), 0);
        whitePlayer.colour = Colour.White;
        const blackPlayer = new Player(mockito.instance(socketMock), 1);
        blackPlayer.colour = Colour.Black;

        it('is in running state at the beginning.',
            function ()
            {
                const game = new Game();

                assert.equal(game.state, GameState.Running);
            }
        );

        it('returns the correct starting fen.',
            function ()
            {
                const game = new Game();

                assert.equal(game.board, 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
            }
        );

        it('has white on first turn.',
            function ()
            {
                const game = new Game();

                assert.equal(game.currentTurn, Colour.White);
            }
        );

        it('can make a move.',
            function ()
            {
                const game = new Game();

                const move = game.tryMove(whitePlayer, 'a2', 'a3');

                assert.equal(move, MoveResult.Success);
            }
        );

        it('can promote a pawn',
            function ()
            {
                const game = new Game();

                game.tryMove(whitePlayer, 'b2', 'b4');
                game.tryMove(blackPlayer, 'a7', 'a5');
                game.tryMove(whitePlayer, 'b4', 'a5');
                game.tryMove(blackPlayer, 'a8', 'a6');
                game.tryMove(whitePlayer, 'a2', 'a3');
                game.tryMove(blackPlayer, 'a6', 'b6');
                game.tryMove(whitePlayer, 'a5', 'a6');
                game.tryMove(blackPlayer, 'b6', 'c6');
                game.tryMove(whitePlayer, 'a6', 'a7');
                game.tryMove(blackPlayer, 'c6', 'd6');

                const move = game.tryMove(whitePlayer, 'a7', 'a8', 'q');
                assert.equal(move, MoveResult.Success);

                const board = game.board;
                assert.equal(board[0], 'Q');
            }
        );

        it('has black on second turn.',
            function ()
            {
                const game = new Game();

                game.tryMove(whitePlayer, 'a2', 'a3');

                assert.equal(game.currentTurn, Colour.Black);
            }
        );

        it('detects check state correctly.',
            function ()
            {
                const game = new Game();

                // Simple check:
                game.tryMove(whitePlayer, 'e2', 'e3');
                game.tryMove(blackPlayer, 'd7', 'd6');
                game.tryMove(whitePlayer, 'f1', 'b5');

                assert.equal(game.state, GameState.Check);
            }
        );

        it('detects checkmate state correctly.',
            function ()
            {
                const game = new Game();

                // Fool's mate:
                game.tryMove(whitePlayer, 'f2', 'f3');
                game.tryMove(blackPlayer, 'e7', 'e5');
                game.tryMove(whitePlayer, 'g2', 'g4');
                game.tryMove(blackPlayer, 'd8', 'h4');

                assert.equal(game.state, GameState.Checkmate);
            }
        );

        it('detects stalemate state correctly.',
            function ()
            {
                const game = new Game();

                // Samuel Loyd's shortest stalemate:
                game.tryMove(whitePlayer, 'e2', 'e3');
                game.tryMove(blackPlayer, 'a7', 'a5');
                game.tryMove(whitePlayer, 'd1', 'h5');
                game.tryMove(blackPlayer, 'a8', 'a6');
                game.tryMove(whitePlayer, 'h5', 'a5');
                game.tryMove(blackPlayer, 'h7', 'h5');
                game.tryMove(whitePlayer, 'a5', 'c7');
                game.tryMove(blackPlayer, 'a6', 'h6');
                game.tryMove(whitePlayer, 'h2', 'h4');
                game.tryMove(blackPlayer, 'f7', 'f6');
                game.tryMove(whitePlayer, 'c7', 'd7');
                game.tryMove(blackPlayer, 'e8', 'f7');
                game.tryMove(whitePlayer, 'd7', 'b7');
                game.tryMove(blackPlayer, 'd8', 'd3');
                game.tryMove(whitePlayer, 'b7', 'b8');
                game.tryMove(blackPlayer, 'd3', 'h7');
                game.tryMove(whitePlayer, 'b8', 'c8');
                game.tryMove(blackPlayer, 'f7', 'g6');
                game.tryMove(whitePlayer, 'c8', 'e6');

                assert.equal(game.state, GameState.Stalemate);
            }
        );

        it('detects fifty move rule state correctly.',
            function ()
            {
                const game = new Game();

                // Fifty moves without a pawn moving, a capture or the first move of a tower:
                game.tryMove(whitePlayer, 'a2', 'a4');
                game.tryMove(blackPlayer, 'a7', 'a5');
                game.tryMove(whitePlayer, 'b2', 'b4');
                game.tryMove(blackPlayer, 'b7', 'b5');
                game.tryMove(whitePlayer, 'c2', 'c4');
                game.tryMove(blackPlayer, 'c7', 'c5');
                game.tryMove(whitePlayer, 'd2', 'd4');
                game.tryMove(blackPlayer, 'd7', 'd5');
                game.tryMove(whitePlayer, 'e2', 'e4');
                game.tryMove(blackPlayer, 'e7', 'e5');
                game.tryMove(whitePlayer, 'f2', 'f4');
                game.tryMove(blackPlayer, 'f7', 'f5');
                game.tryMove(whitePlayer, 'g2', 'g4');
                game.tryMove(blackPlayer, 'g7', 'g5');
                game.tryMove(whitePlayer, 'h2', 'h4');
                game.tryMove(blackPlayer, 'h7', 'h5');
                game.tryMove(whitePlayer, 'h1', 'h2');
                game.tryMove(blackPlayer, 'h8', 'h7');
                game.tryMove(whitePlayer, 'a1', 'a2');
                game.tryMove(blackPlayer, 'a8', 'a7');
                game.tryMove(whitePlayer, 'a2', 'a1');
                game.tryMove(blackPlayer, 'a7', 'a8');
                game.tryMove(whitePlayer, 'h2', 'g2');
                game.tryMove(blackPlayer, 'h7', 'g7');
                game.tryMove(whitePlayer, 'g2', 'f2');
                game.tryMove(blackPlayer, 'g7', 'f7');
                game.tryMove(whitePlayer, 'f2', 'e2');
                game.tryMove(blackPlayer, 'f7', 'e7');
                game.tryMove(whitePlayer, 'e2', 'd2');
                game.tryMove(blackPlayer, 'e7', 'd7');
                game.tryMove(whitePlayer, 'd2', 'c2');
                game.tryMove(blackPlayer, 'd7', 'c7');
                game.tryMove(whitePlayer, 'c2', 'b2');
                game.tryMove(blackPlayer, 'c7', 'b7');
                game.tryMove(whitePlayer, 'b2', 'a2');
                game.tryMove(blackPlayer, 'b7', 'a7');
                game.tryMove(whitePlayer, 'a2', 'a3');
                game.tryMove(blackPlayer, 'a7', 'a6');
                game.tryMove(whitePlayer, 'a3', 'b3');
                game.tryMove(blackPlayer, 'a6', 'b6');
                game.tryMove(whitePlayer, 'b3', 'c3');
                game.tryMove(blackPlayer, 'b6', 'c6');
                game.tryMove(whitePlayer, 'c3', 'd3');
                game.tryMove(blackPlayer, 'c6', 'd6');
                game.tryMove(whitePlayer, 'd3', 'e3');
                game.tryMove(blackPlayer, 'd6', 'e6');
                game.tryMove(whitePlayer, 'e3', 'f3');
                game.tryMove(blackPlayer, 'e6', 'f6');
                game.tryMove(whitePlayer, 'f3', 'g3');
                game.tryMove(blackPlayer, 'f6', 'g6');
                game.tryMove(whitePlayer, 'g3', 'h3');
                game.tryMove(blackPlayer, 'g6', 'h6');
                game.tryMove(whitePlayer, 'h3', 'h2');
                game.tryMove(blackPlayer, 'h6', 'g6');
                game.tryMove(whitePlayer, 'h2', 'g2');
                game.tryMove(blackPlayer, 'g6', 'g7');
                game.tryMove(whitePlayer, 'g2', 'f2');
                game.tryMove(blackPlayer, 'g7', 'f7');
                game.tryMove(whitePlayer, 'f2', 'e2');
                game.tryMove(blackPlayer, 'f7', 'e7');
                game.tryMove(whitePlayer, 'e2', 'd2');
                game.tryMove(blackPlayer, 'e7', 'd7');
                game.tryMove(whitePlayer, 'd2', 'c2');
                game.tryMove(blackPlayer, 'd7', 'c7');
                game.tryMove(whitePlayer, 'c2', 'b2');
                game.tryMove(blackPlayer, 'c7', 'b7');
                game.tryMove(whitePlayer, 'b2', 'a2');
                game.tryMove(blackPlayer, 'b7', 'a7');
                game.tryMove(whitePlayer, 'a2', 'a3');
                game.tryMove(blackPlayer, 'a7', 'a6');
                game.tryMove(whitePlayer, 'a3', 'b3');
                game.tryMove(blackPlayer, 'a6', 'b6');
                game.tryMove(whitePlayer, 'b3', 'c3');
                game.tryMove(blackPlayer, 'b6', 'c6');
                game.tryMove(whitePlayer, 'c3', 'd3');
                game.tryMove(blackPlayer, 'c6', 'd6');
                game.tryMove(whitePlayer, 'd3', 'e3');
                game.tryMove(blackPlayer, 'd6', 'e6');
                game.tryMove(whitePlayer, 'e3', 'f3');
                game.tryMove(blackPlayer, 'e6', 'f6');
                game.tryMove(whitePlayer, 'f3', 'g3');
                game.tryMove(blackPlayer, 'f6', 'g6');
                game.tryMove(whitePlayer, 'g3', 'h3');
                game.tryMove(blackPlayer, 'g6', 'h6');
                game.tryMove(whitePlayer, 'h3', 'h2');
                game.tryMove(blackPlayer, 'h6', 'h8');
                game.tryMove(whitePlayer, 'a1', 'a2');
                game.tryMove(blackPlayer, 'a8', 'a6');
                game.tryMove(whitePlayer, 'h2', 'h1');
                game.tryMove(blackPlayer, 'a6', 'b6');
                game.tryMove(whitePlayer, 'a2', 'b2');
                game.tryMove(blackPlayer, 'b6', 'c6');
                game.tryMove(whitePlayer, 'b2', 'c2');
                game.tryMove(blackPlayer, 'c6', 'd6');
                game.tryMove(whitePlayer, 'c2', 'd2');
                game.tryMove(blackPlayer, 'd6', 'e6');
                game.tryMove(whitePlayer, 'd2', 'e2');
                game.tryMove(blackPlayer, 'e6', 'f6');
                game.tryMove(whitePlayer, 'e2', 'f2');
                game.tryMove(blackPlayer, 'f6', 'g6');
                game.tryMove(whitePlayer, 'f2', 'g2');
                game.tryMove(blackPlayer, 'g6', 'h6');
                game.tryMove(whitePlayer, 'g2', 'h2');
                game.tryMove(blackPlayer, 'h6', 'h7');
                game.tryMove(whitePlayer, 'h2', 'h3');
                game.tryMove(blackPlayer, 'h7', 'g7');
                game.tryMove(whitePlayer, 'h3', 'g3');
                game.tryMove(blackPlayer, 'g7', 'f7');
                game.tryMove(whitePlayer, 'g3', 'f3');
                game.tryMove(blackPlayer, 'f7', 'e7');
                game.tryMove(whitePlayer, 'f3', 'e3');
                game.tryMove(blackPlayer, 'e7', 'd7');
                game.tryMove(whitePlayer, 'e3', 'd3');
                game.tryMove(blackPlayer, 'd7', 'c7');
                game.tryMove(whitePlayer, 'd3', 'c3');
                game.tryMove(blackPlayer, 'c7', 'b7');

                assert.equal(game.state, GameState.FiftyMoveRule);
            }
        );

        it('detects threefold repetition state',
            function ()
            {
                const game = new Game();

                // Three times the same position:
                game.tryMove(whitePlayer, 'a2', 'a3');
                game.tryMove(blackPlayer, 'a7', 'a6');
                game.tryMove(whitePlayer, 'a1', 'a2');
                game.tryMove(blackPlayer, 'a8', 'a7');
                game.tryMove(whitePlayer, 'a2', 'a1');
                game.tryMove(blackPlayer, 'a7', 'a8');
                game.tryMove(whitePlayer, 'a1', 'a2');
                game.tryMove(blackPlayer, 'a8', 'a7');
                game.tryMove(whitePlayer, 'a2', 'a1');
                game.tryMove(blackPlayer, 'a7', 'a8');
                game.tryMove(whitePlayer, 'a1', 'a2');
                game.tryMove(blackPlayer, 'a8', 'a7');

                assert.equal(game.state, GameState.ThreefoldRepetition);
            }
        );

        it('detects insufficient material state',
            function ()
            {
                const game = new Game();

                // @ts-expect-error ts(2341): Access of a private field for easy constellation mocking.
                const chessJs = game.chess;

                // Nearly insufficient material with capture opportunity for the current player for quick insufficient material:
                chessJs.load('4k3/8/8/p7/8/1N6/8/4K3 w - - 0 1');

                game.tryMove(whitePlayer, 'b3', 'a5');

                assert.equal(game.state, GameState.InsufficientMaterial);
            }
        );

        it('cannot make and illegal move',
            function ()
            {
                const game = new Game();

                const move = game.tryMove(whitePlayer, 'a1', 'a2');

                assert.equal(move, MoveResult.IllegalMove);
            }
        );

        it('cannot make a move for a player that is not the current player',
            function ()
            {
                const game = new Game();

                const move = game.tryMove(blackPlayer, 'a7', 'a6');

                assert.equal(move, MoveResult.NotYourTurn);
            }
        );
    }
);
