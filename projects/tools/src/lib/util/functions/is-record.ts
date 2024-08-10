export function isRecord(value: unknown): value is Record<string, unknown> {
    return value?.constructor === Object;
}
