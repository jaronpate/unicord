export const isNil = (value: any): value is null | undefined => value === null || value === undefined;
export const exists = <T>(value: T | null | undefined): value is T => !isNil(value);
export const isObject = (value: any): value is Record<string, any> => typeof value === 'object' && !Array.isArray(value);
export const log = (...args: any[]) => console.log('\x1b[35m[discord.ts]\x1b[0m', ...args);