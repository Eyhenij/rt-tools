import { TNullable } from '@rt-tools/utils';
import { IStorageConverter } from './storage-converter';
import { TStorageType } from '../enums/storage-types.enum';

export interface IStorageConfig {
    ctx: TNullable<TStorageType>;
    storageRef: TNullable<Storage>;
    converter: TNullable<IStorageConverter>;
}
