/**
 * Замок файлом. Живёт на диске, потому что держат его разные процессы одной машины.
 */
import { closeSync, existsSync, openSync, rmSync, statSync } from 'node:fs';

/** Замок мёртвого процесса: живой столько не держит, а файл не должен закрыть работу навсегда. */
const LOCK_STALE_MS: number = 10 * 60 * 1000;

/** Берёт замок. `false`: его держит другой. */
export function takeFileLock(path: string, now: number): boolean {
    if (existsSync(path) && now - statSync(path).mtimeMs > LOCK_STALE_MS) {
        rmSync(path, { force: true });
    }
    try {
        closeSync(openSync(path, 'wx'));

        return true;
    } catch {
        return false;
    }
}

export function dropFileLock(path: string): void {
    rmSync(path, { force: true });
}
