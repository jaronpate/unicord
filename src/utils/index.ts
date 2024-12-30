export const isNil = (value: any): value is null | undefined => value === null || value === undefined;
export const exists = <T>(value: T | null | undefined): value is NonNullable<T> => !isNil(value);
export const isObject = (value: any): value is Record<string, any> => typeof value === 'object' && !Array.isArray(value);
export const log = (...args: any[]) => {
    const LOG_LEVEL = process.env.DISCORD_TS_LOG_LEVEL?.toLocaleLowerCase();
    
    if (LOG_LEVEL === 'debug') {
        const timestamp = `\x1b[37m[${new Date().toLocaleString()}]\x1b[0m`;
        const prefix = `\x1b[35m[discord.ts]`;
        console.log(`${timestamp} ${prefix} \x1b[0m`, ...args);
    }
};