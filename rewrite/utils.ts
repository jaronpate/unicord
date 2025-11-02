/**
 * Sets top level properties when undefined on the original object — cretates a new object, does not modify the original
 * @param original original object
 * @param defaults defailts to set on the object
 * @returns a new object with top level defaults set
 */
export function setDefaults<T>(original: Record<string, any>, defaults: Record<string, any>): T {
    const final: Record<string, any> = {};

    for (const prop of Object.keys(defaults)) {
        final[prop] = defaults[prop];
    }

    for (const prop of Object.keys(original)) {
        final[prop] = original[prop];
    }

    return final as T;
}
export const isNil = (value: any): value is null | undefined => value === null || value === undefined;
export const exists = <T>(value: T | null | undefined): value is NonNullable<T> => !isNil(value);
export const isObject = (value: any): value is Record<string, any> =>
    typeof value === 'object' && !Array.isArray(value);
export const log = (...args: any[]) => {
    const LOG_LEVEL = process.env.UNICORD_LOG_LEVEL?.toLocaleLowerCase();

    if (LOG_LEVEL === 'debug') {
        const timestamp = `\x1b[37m[${new Date().toLocaleTimeString()}]\x1b[0m`;
        const prefix = `\x1b[35m[unicord]`;
        console.log(`${timestamp} ${prefix} \x1b[0m`, ...args);
    }
};
