/** Make shallow copy of passed object */
export function removeFieldFromObject<T extends object, K extends string>(obj: T, key: K): Omit<T, K> {
    const result: T = { ...obj };

    if (key in obj) {
        // delete result[key as string];
        delete (result as any)[key];
    }

    return result;
}
