import { INullable } from '@rt-tools/utils';
import { IStorageConverter } from './storage-converter';
import { StorageType } from '../enums/storage-types.enum';

export interface IStorageConfig {
    ctx: INullable<StorageType>;
    storageRef: INullable<Storage>;
    converter: INullable<IStorageConverter>;
}
