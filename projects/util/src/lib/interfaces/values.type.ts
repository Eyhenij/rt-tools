/** Get the union type of all the values in an object, array or array-like type */
export type ValuesType<T extends ReadonlyArray<unknown> | ArrayLike<unknown> | Record<string | number | symbol, unknown>> =
    T extends ReadonlyArray<unknown>
        ? T[number]
        : T extends ArrayLike<unknown>
            ? T[number]
            : T extends object
                ? T[keyof T]
                : never;
