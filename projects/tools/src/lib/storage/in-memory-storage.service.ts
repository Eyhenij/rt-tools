import { Injectable } from '@angular/core';

@Injectable()
export class InMemoryStorageService implements Storage {
    readonly #storage: Map<string, string> = new Map<string, string>();

    public get length(): number {
        return this.#storage.size;
    }

    public getItem(key: string): string | null {
        return this.#storage.get(key) || null;
    }

    public setItem(key: string, data: string): void {
        this.#storage.set(key, data);
    }

    public key(index: number): string | null {
        return Array.from(this.#storage.keys())[index] || null;
    }

    public removeItem(key: string): void {
        this.#storage.delete(key);
    }

    public clear(): void {
        this.#storage.clear();
    }
}
