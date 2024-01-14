import { Nullable } from '../../interfaces';


export interface IStorageConverter {
    convertTo(data: any): string;
    convertFrom<T>(data: any): Nullable<T>;
}
