export abstract class Utils
{
    public static catchVoidPromise (promiseReturner: (...args: any[]) => Promise<void>): (...args: any[]) => void
    {
        const arrowFunction = (...args: any[]): void =>
        {
            promiseReturner(...args).catch(
                (error) =>
                {
                    console.error(error);
                }
            );
        };

        return arrowFunction;
    }
}
