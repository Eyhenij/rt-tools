import { Nullable } from '../../interfaces';
import { StorageType } from '../enums/storage-types.enum';
import { IStorageConverter } from './storage-converter';

export interface IStorageConfig {
    ctx: Nullable<StorageType>;
    storageRef: Nullable<Storage>;
    converter: Nullable<IStorageConverter>;
}
