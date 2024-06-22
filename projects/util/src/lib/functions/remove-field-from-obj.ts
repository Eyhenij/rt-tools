/** Makes shallow copy of passed object */
export function removeFieldFromObject<T extends object, K extends string>(obj: T, key: K): Omit<T, K> {
    const result: T = { ...obj };

    if (key in obj) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (result as any)[key];
    }

    return result;
}
