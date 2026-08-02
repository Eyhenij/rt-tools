export function isNil<T>(entity: T | null | undefined): entity is null | undefined {
    return entity === null || entity === undefined;
}
