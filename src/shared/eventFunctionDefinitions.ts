import { PlayerStatistic } from "./playerStatistic";

export type Ping = (pong: Pong) => void;
export type Pong = () => void;

export type Init = (reply: InitReply) => void;
export type InitReply = (board: string, rounds: number, playerStatistics: PlayerStatistic[]) => void;
