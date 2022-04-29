export abstract class PlayerConnection
{
    /** End the connection and ensure that no further data is sent through it. */
    public abstract close (): void;
    /** End the connection gracefully. */
    public abstract end (): void;
    /** Write data to the connection. Multiple data segments can form a message when concluded with a line end. */
    public abstract write (data: string): void;

    /** Write a full message to the connection. */
    public writeMessage (message: string): void
    {
        this.write(`${message}\n`);
    }
}
