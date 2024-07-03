export function stringifyHttpLikeParams<T extends object>(params: T): { [param: string]: string | string[] } {
    return Object.keys(params).reduce(
        (stringParams: { [param: string]: string | string[] }, key: string) => ({
            ...stringParams,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            [key]: encodeURI((params as any)[key]),
        }),
        {}
    );
}
