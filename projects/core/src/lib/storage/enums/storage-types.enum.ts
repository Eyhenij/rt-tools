export enum EStorageTypes {
    LOCAL = 'local',
    SESSION = 'session',
    IN_MEMORY = 'inMemory',
    CUSTOM = 'custom',
}

export type TStorageType = EStorageTypes.LOCAL | EStorageTypes.SESSION | EStorageTypes.IN_MEMORY | EStorageTypes.CUSTOM;
