import { PlayerStatistic } from "./playerStatistic";

export type Register = () => void;
export type Initiate = (board: string, rounds: number, playerStatistics: PlayerStatistic[]) => void;
export type Move = (move: string) => void;
export type StartNextGame = (statistics: PlayerStatistic[]) => void;
export type End = () => void;

export type RegisterPlayer = () => void;
export type Play = (command: string) => void; // TODO: Give a better name...
