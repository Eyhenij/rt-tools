import { Nullable } from '@rt-tools/utils';

export interface IStorageConverter {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    convertTo(data: any): string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    convertFrom<T>(data: any): Nullable<T>;
}
