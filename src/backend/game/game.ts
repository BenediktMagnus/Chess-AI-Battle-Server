import { Chess, ChessInstance, PieceType, Square as PositionNotation } from 'chess.js';
import { Colour } from './colour';
import { GameState } from './gameState';
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
        return Colour[this.chess.turn() as keyof typeof Colour];
    }

    public get state (): GameState
    {
        if (this.chess.insufficient_material())
        {
            return GameState.InsufficientMaterial;
        }
        else if (this.chess.in_threefold_repetition())
        {
            return GameState.ThreefoldRepetition;
        }
        else if (this.chess.in_draw())
        {
            return GameState.FiftyMoveRule;
        }
        else if (this.chess.in_stalemate())
        {
            return GameState.Stalemate;
        }
        else if (this.chess.in_checkmate())
        {
            return GameState.Checkmate;
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

    public tryMove (player: Player, from: string, to: string, promotion?: string): boolean
    {
        if (player.colour !== this.currentTurn)
        {
            return false;
        }

        if (!this.stringIsPositionNotation(from) || !this.stringIsPositionNotation(to))
        {
            return false;
        }

        if (promotion !== undefined && !this.stringIsPromotablePiece(promotion))
        {
            return false;
        }

        const move = this.chess.move(
            {
                from: from,
                to: to,
                promotion: promotion
            }
        );

        return move !== null;
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
