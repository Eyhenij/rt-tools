export function stringifyHttpLikeParams<T extends {}>(params: T): { [param: string]: string | string[] } {
    return Object.keys(params).reduce(
        (stringParams: { [param: string]: string | string[] }, key: string) => ({
            ...stringParams,
            [key]: encodeURI((params as any)[key])
        }),
        {}
    );
}
