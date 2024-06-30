import { IStorageConverter } from '../../storage/interfaces/storage-converter';
import { Nullable } from '../../util/interfaces/nullable.type';
import { StorageType } from '../enums/storage-types.enum';

export interface IStorageConfig {
    ctx: Nullable<StorageType>;
    storageRef: Nullable<Storage>;
    converter: Nullable<IStorageConverter>;
}
