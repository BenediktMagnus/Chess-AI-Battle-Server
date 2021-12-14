import { Chessboard as ChessboardType } from './types/chessboard';
// @ts-expect-error Workaround/Hack for imports of ESM modules from paths relative to the base URL in Typescript:
import { Chessboard as RawChessboard } from '/cm-chessboard/src/Chessboard.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Chessboard = RawChessboard as ChessboardType;
