export enum STORAGE_TYPES_ENUM {
    LOCAL = 'local',
    SESSION = 'session',
    IN_MEMORY = 'inMemory',
    CUSTOM = 'custom',
}

export type StorageType =
    | STORAGE_TYPES_ENUM.LOCAL
    | STORAGE_TYPES_ENUM.SESSION
    | STORAGE_TYPES_ENUM.IN_MEMORY
    | STORAGE_TYPES_ENUM.CUSTOM;
