import net from 'net';
import { Player } from './player';

export class PlayerList
{
    private players: Set<Player>;

    constructor ()
    {
        this.players = new Set();
    }

    /**
     * The player count.
     */
    public get count (): number
    {
        return this.players.size;
    }

    /**
     * Add a player to the list.
     * @param player The player to add.
     * @throws If the list already contains two players.
     */
    public add (player: Player): void
    {
        if (this.players.size >= 2)
        {
            throw new Error('The player list is full.');
        }

        this.players.add(player);
    }

    /**
     * Remove a player from the list.
     * Do nothing if the player is already in the list.
     * @param player The player to remove.
     */
    public remove (player: Player): void
    {
        this.players.delete(player);
    }

    /**
     * Look for the given socket and remove the corresponding player.
     * Do nothing if the socket is not found.
     * @param socket The socket to look for.
     */
    public removeBySocket (socket: net.Socket): void
    {
        const player = this.getBySocket(socket);

        if (player !== null)
        {
            this.remove(player);
        }
    }

    public getAll (): Player[]
    {
        return Array.from(this.players);
    }

    /**
     * Look for the given socket and return the corresponding player.
     * @param socket The socket to search for.
     * @returns The player if found, otherwise null.
     */
    public getBySocket (socket: net.Socket): Player|null
    {
        for (const player of this.players)
        {
            if (player.socket === socket)
            {
                return player;
            }
        }

        return null;
    }

    /**
     * Get the player that is not the given one, i.e. the other player.
     * @returns The other player if there is one, otherwise null.
     */
    public getOther (player: Player): Player|null
    {
        for (const otherPlayer of this.players)
        {
            if (otherPlayer !== player)
            {
                return otherPlayer;
            }
        }

        return null;
    }
}
