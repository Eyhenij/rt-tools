/**
 * Объявления к проверке клиента хранилища. Сама проверка написана на языке конфига сборки —
 * тот зовёт её напрямую, а типы нужны спеке, которая проверяет её вызовом.
 */

export declare const STORAGE_CLIENT_DIR: string;
export declare const STORAGE_CLIENT_ENTRY: string;
export declare const GENERATE_COMMAND: string;

export declare function storageClientFailure(exists: (path: string) => boolean): string | null;
