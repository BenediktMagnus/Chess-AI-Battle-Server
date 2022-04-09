import { Chess, ChessInstance, PieceType, Square as PositionNotation } from 'chess.js';
import { Colour } from './colour';
import { GameState } from './gameState';
import { MoveResult } from './moveResult';
import { Player } from './player';

export class Game
{
    private chess: ChessInstance;

    constructor ()
    {
        this.chess = new Chess();
    }

    public get board (): string
    {
        return this.chess.fen();
    }

    public get currentTurn (): Colour
    {
        const colourString = this.chess.turn();

        if (colourString === 'w')
        {
            return Colour.White;
        }
        else if (colourString === 'b')
        {
            return Colour.Black;
        }
        else
        {
            return Colour.None;
        }
    }

    public get state (): GameState
    {
        if (this.chess.game_over())
        {
            if (this.chess.insufficient_material())
            {
                return GameState.InsufficientMaterial;
            }
            else if (this.chess.in_threefold_repetition())
            {
                return GameState.ThreefoldRepetition;
            }
            else if (this.chess.in_stalemate())
            {
                return GameState.Stalemate;
            }
            else if (this.chess.in_draw())
            {
                return GameState.FiftyMoveRule;
            }
            else if (this.chess.in_checkmate())
            {
                return GameState.Checkmate;
            }

            throw new Error('Unknown game over state');
        }
        else if (this.chess.in_check())
        {
            return GameState.Check;
        }
        else
        {
            return GameState.Running;
        }
    }

    public reset (): void
    {
        this.chess.reset();
    }

    /**
     * @returns True if the move was legal and successfull, false otherwise.
     */
    public tryMove (player: Player, from: string, to: string, promotion?: string): MoveResult
    {
        if (player.colour !== this.currentTurn)
        {
            return MoveResult.NotYourTurn;
        }

        if (!this.stringIsPositionNotation(from) || !this.stringIsPositionNotation(to))
        {
            return MoveResult.InvalidNotation;
        }

        if (promotion !== undefined && !this.stringIsPromotablePiece(promotion))
        {
            return MoveResult.InvalidPromotion;
        }

        const move = this.chess.move(
            {
                from: from,
                to: to,
                promotion: promotion
            }
        );

        if (move === null)
        {
            return MoveResult.IllegalMove;
        }

        return MoveResult.Success;
    }

    private stringIsPositionNotation (aString: string): aString is PositionNotation
    {
        const positionNotationRegex = /^[a-h][1-8]$/;

        return (aString.length == 2) && positionNotationRegex.test(aString);
    }

    private stringIsPromotablePiece (aString: string): aString is Exclude<PieceType, 'p' | 'k'>
    {
        const promotablePieceRegex = /^[nbrq]$/;

        return (aString.length == 1) && promotablePieceRegex.test(aString);
    }
}
