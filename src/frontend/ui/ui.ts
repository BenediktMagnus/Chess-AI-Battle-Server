import type { PlayerStatistic } from '../../shared/playerStatistic';

type PlayerStatisticKeys = keyof PlayerStatistic;
type PlayerStatisticsCells = { [key in PlayerStatisticKeys]: HTMLTableCellElement };

const playerStatisticKeys: PlayerStatisticKeys[] = [
    'wins',
    'losses',
    'stalemates',
    'draws',
    'checks',
];

export class Ui
{
    private rounds: number;

    private roundsSpan: HTMLSpanElement;
    private playerOneName: HTMLSpanElement;
    private playerTwoName: HTMLSpanElement;
    private playersStatisticCells: PlayerStatisticsCells[];

    constructor ()
    {
        this.rounds = 0;

        const roundsSpan = document.getElementById('rounds') as HTMLSpanElement;
        if (roundsSpan === null)
        {
            throw new Error('Could not find element with id "rounds".');
        }
        this.roundsSpan = roundsSpan;

        const player1NameTableCell = document.getElementById('namePlayer1') as HTMLTableCellElement;
        if (player1NameTableCell === null)
        {
            throw new Error('Could not find element with id "namePlayer1".');
        }
        const player2NameTableCell = document.getElementById('namePlayer2') as HTMLTableCellElement;
        if (player2NameTableCell === null)
        {
            throw new Error('Could not find element with id "namePlayer2".');
        }

        this.playerOneName = document.getElementById('playerOneName') as HTMLSpanElement;
        if (this.playerOneName === null)
        {
            throw new Error('Could not find element with id "playerOneName".');
        }
        this.playerTwoName = document.getElementById('playerTwoName') as HTMLSpanElement;
        if (this.playerTwoName === null)
        {
            throw new Error('Could not find element with id "playerTwoName".');
        }

        const playersStatisticCells: Partial<PlayerStatisticsCells>[] = [
            {
                playerName: player1NameTableCell,
            },
            {
                playerName: player2NameTableCell,
            }
        ];

        // TODO: This is somewhat ugly and not type safe. This could definitely be improved.

        for (const playerStatisticKey of playerStatisticKeys)
        {
            const playerStatisticRow = document.getElementById(playerStatisticKey) as HTMLTableRowElement;
            if (playerStatisticRow === null)
            {
                throw new Error(`Could not find element with id "${playerStatisticKey}".`);
            }

            const playerStatisticCells = playerStatisticRow.getElementsByTagName('td');
            if (playerStatisticCells.length !== 2)
            {
                throw new Error(`Could not find both value cells for the statistics row "${playerStatisticKey}".`);
            }

            playersStatisticCells[0][playerStatisticKey] = playerStatisticCells[0];
            playersStatisticCells[1][playerStatisticKey] = playerStatisticCells[1];
        }

        this.playersStatisticCells = playersStatisticCells as PlayerStatisticsCells[];
    }

    public setRounds (rounds: number): void
    {
        this.rounds = rounds;
        this.roundsSpan.innerText = `${rounds}`;
    }

    public increaseRounds (): void
    {
        this.setRounds(this.rounds + 1);
    }

    public setStatistics (playerStatistics: PlayerStatistic[]): void
    {
        if (playerStatistics.length !== this.playersStatisticCells.length)
        {
            throw new Error(`Expected ${this.playersStatisticCells.length} player statistics, but got ${playerStatistics.length}.`);
        }

        for (let i = 0; i < playerStatistics.length; i++)
        {
            const playerStatistic = playerStatistics[i];

            // TODO: This concatenation is ugly. Could it be improved?
            for (const playerStatisticKey of playerStatisticKeys.concat(['playerName']))
            {
                const playerStatisticCell = this.playersStatisticCells[i][playerStatisticKey];
                playerStatisticCell.innerText = `${playerStatistic[playerStatisticKey]}`;
            }
        }

        this.playerOneName.innerText = playerStatistics[0].playerName;
        this.playerTwoName.innerText = playerStatistics[1].playerName;
    }
}
