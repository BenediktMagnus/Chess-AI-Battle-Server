/* eslint-disable @typescript-eslint/naming-convention */

declare module 'cm-chessboard'
{
    type ChessboardState = unknown; // TODO: Define.
    type ChessboardView = unknown; // TODO: Define.
    type MOVE_CANCELED_REASON = string; // TODO: Fully define.

    type RecursivePartial<T> =
    {
        [P in keyof T]?:
            T[P] extends (infer U)[] ? RecursivePartial<U>[] :
            T[P] extends object ? RecursivePartial<T[P]> :
            T[P];
    };

    export enum COLOR
    {
        white = 'w',
        black = 'b',
    }

    export enum INPUT_EVENT_TYPE
    {
        moveStart = 'moveStart',
        moveDone = 'moveDone',
        moveCanceled = 'moveCanceled',
    }

    export enum SQUARE_SELECT_TYPE
    {
        primary = 'primary',
        secondary = 'secondary',
    }

    export enum BORDER_TYPE
    {
        /** No border */
        none = 'none',
        /** Thin border */
        thin = 'thin',
        /** Wide border with coordinates in it */
        frame = 'frame',
    }

    export enum PIECE
    {
        wp = 'wp',
        wb = 'wb',
        wn = 'wn',
        wr = 'wr',
        wq = 'wq',
        wk = 'wk',
        bp = 'bp',
        bb = 'bb',
        bn = 'bn',
        br = 'br',
        bq = 'bq',
        bk = 'bk',
    }

    type MarkerTypeFrame = { class: 'marker-frame', slice: 'markerFrame' };
    type MarkerTypeSquare = { class: 'marker-square', slice: 'markerSquare' };
    type MarkerTypeDot = { class: 'marker-dot', slice: 'markerDot' };
    type MarkerTypeCircle = { class: 'marker-circle', slice: 'markerCircle' };

    export const MARKER_TYPE:
    {
        frame: MarkerTypeFrame,
        square: MarkerTypeSquare,
        dot: MarkerTypeDot,
        circle: MarkerTypeCircle,
    };

    export const FEN_START_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    export const FEN_EMPTY_POSITION = '8/8/8/8/8/8/8/8';

    type Position = 'empty' | 'start'; // TODO: FEN string is allowed, too!
    type BorderType = { class: string, slice: string };
    type MarkerType = MarkerTypeFrame | MarkerTypeSquare | MarkerTypeDot | MarkerTypeCircle;

    type BoardConfiguration =
    {
        position: Position,
        orientation: COLOR,
        style: {
            cssClass: string,
            /** Show ranks and files */
            showCoordinates: boolean,
            borderType: BORDER_TYPE,
            /** Height/width. Set to `undefined` if you want to define it only in the css. */
            aspectRatio: number | undefined,
            /** The marker used to mark the start square. */
            moveFromMarker: MarkerType,
            /** The marker used to mark the square where the figure is moving to. */
            moveToMarker: MarkerType,
            /** @deprecated Use "moveFromMarker" instead. */
            moveMarker: MarkerType, //
            /** @deprecated Use "moveToMarker" instead. */
            hoverMarker: MarkerType
        },
        /** Resizes the board based on element size. */
        responsive: boolean,
        /** Pieces animation duration in milliseconds */
        animationDuration: number,
        sprite: {
            /** Pieces and markers are stored as svg sprite */
            url: string,
            /** The sprite size, defaults to 40x40px */
            size: number,
            /** Cache the sprite inline, in the HTML */
            cache: boolean,
        }
    };

    type Row = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
    type Column = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
    type Square = `${Row}${Column}`;

    type SquareSelectEventHandler = (chessboard: Chessboard, type: SQUARE_SELECT_TYPE, square: Square) => void;

    type MoveInputEventHandlerParameters = {
        chessboard: Chessboard,
        type: INPUT_EVENT_TYPE.moveStart,
        square: Square,
    } | {
        chessboard: Chessboard,
        type: INPUT_EVENT_TYPE.moveDone,
        squareFrom: Square,
        squareTo: Square,
    } | {
        chessboard: Chessboard,
        type: INPUT_EVENT_TYPE.moveCanceled,
        reason: MOVE_CANCELED_REASON,
        squareFrom: Square,
        squareTo: Square | undefined,
    };

    type MoveInputEventHandler = (eventData: MoveInputEventHandlerParameters) => void;

    export class Chessboard
    {
        private element: HTMLElement;
        private props: BoardConfiguration;
        private state: ChessboardState;
        private view: ChessboardView;

        constructor (element?: HTMLElement|null, props?: RecursivePartial<BoardConfiguration>);

        /**
         * @param animated When set to true, setting the piece will be animated.
         */
        public setPiece (square: Square, piece: PIECE, animated?: boolean): void;
        public getPiece (square: Square): PIECE;

        /**
         * @param animated When set to true, the piece movement to the new position will be animated.
         */
        public movePiece (squareFrom: Square, squareTo: Square, animated?: boolean): Promise<void>;

        /**
         * @param fen The FEN string, special values are "start" to set the chess start position and "empty" to set an empty board.
         * @param animated When set to true, setting the new position will be animated.
         */
        public setPosition (fen: string, animated?: boolean): Promise<void>;
        public getPosition (): string;

        public addMarker (square: Square, type: MarkerType): void;
        public getMarkers (square?: Square, type?: MarkerType): { square: Square, type: MarkerType }[];
        public removeMarkers (square?: Square, type?: MarkerType): void;

        public setOrientation (color: COLOR): void;
        public getOrientation (): COLOR;

        public destroy (): void;

        public enableMoveInput (eventHandler: MoveInputEventHandler, color?: COLOR): void;
        public disableMoveInput (): void;

        /** @deprecated Use "enableSquareSelect" instead. */
        public enableContextInput (eventHandler: SquareSelectEventHandler): void;
        /** @deprecated Use "disableSquareSelect" instead. */
        public disableContextInput (): void;

        public enableSquareSelect (eventHandler: SquareSelectEventHandler): void;
        public disableSquareSelect (): void;
    }
}
