import { Nullable } from '../interfaces';
import { IStorageConverter } from './interfaces/storage-converter';


export class JsonConverter implements IStorageConverter {
    public convertTo(data: Nullable<any>): string {
        let parsedData: string;

        try {
            parsedData = JSON.stringify(data);
        } catch (e) {
            parsedData = 'null';
        }

        return parsedData;
    }

    public convertFrom<T>(data: any): Nullable<T> {
        if (typeof data === 'string') {
            try {
                return JSON.parse(data) as T;
            } catch (e) {
                return null;
            }
        }

        return null;
    }
}
