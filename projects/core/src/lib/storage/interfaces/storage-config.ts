import { Nullable } from '../../types';
import { IStorageConverter } from './storage-converter';
import { StorageType } from '../enums/storage-types.enum';

export interface IStorageConfig {
    ctx: Nullable<StorageType>;
    storageRef: Nullable<Storage>;
    converter: Nullable<IStorageConverter>;
}
