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
     * Does nothing if the player is already in the list.
     * @param player The player to remove.
     */
    public remove (player: Player): void
    {
        this.players.delete(player);
    }

    /**
     * Look for the given socket and remove the corresponding player.
     * @param socket The socket to look for.
     * @throws If no player in the list has the given socket.
     */
    public removeBySocket (socket: net.Socket): void
    {
        const player = this.getBySocket(socket);

        this.remove(player);
    }

    /**
     * Look for the given socket and return the corresponding player.
     * @param socket The socket to search for.
     * @returns The player if found.
     * @throws If the player is not in the list.
     */
    public getBySocket (socket: net.Socket): Player
    {
        for (const player of this.players)
        {
            if (player.socket === socket)
            {
                return player;
            }
        }

        throw new Error('The player is not in the list.');
    }
}
