import { Nullable } from '../util/interfaces/nullable.type';
import { IStorageConverter } from './interfaces/storage-converter';

export class JsonConverter implements IStorageConverter {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public convertTo(data: Nullable<any>): string {
        let parsedData: string;

        try {
            parsedData = JSON.stringify(data);
        } catch (e) {
            parsedData = 'null';
        }

        return parsedData;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
