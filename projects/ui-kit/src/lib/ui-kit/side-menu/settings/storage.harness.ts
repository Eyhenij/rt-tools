/** Хранилище в памяти: ведёт себя как настоящее, и запись видна тому, кто читает тем же ключом. */
export class MemoryStorage implements Storage {
    readonly #values: Map<string, string> = new Map();

    public get length(): number {
        return this.#values.size;
    }

    public clear(): void {
        this.#values.clear();
    }

    public getItem(key: string): string | null {
        return this.#values.get(key) ?? null;
    }

    public key(index: number): string | null {
        return [...this.#values.keys()][index] ?? null;
    }

    public removeItem(key: string): void {
        this.#values.delete(key);
    }

    public setItem(key: string, value: string): void {
        this.#values.set(key, value);
    }
}

export class ClosedStorage extends MemoryStorage {
    public override getItem(): string | null {
        throw new Error('closed');
    }

    public override setItem(): void {
        throw new Error('closed');
    }
}

/** Хранилище, которое читает, но не принимает запись: переполнено. */
export class FullStorage extends MemoryStorage {
    public override setItem(): void {
        throw new DOMException('full', 'QuotaExceededError');
    }
}
