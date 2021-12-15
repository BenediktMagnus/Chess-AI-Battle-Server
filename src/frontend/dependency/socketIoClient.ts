import type { io as ioType } from 'socket.io-client';
// @ts-expect-error Workaround/Hack for imports of ESM modules from paths relative to the base URL in Typescript:
import { io as rawIo } from '/socket.io/socket.io.esm.min.js';

export const io = rawIo as typeof ioType;
