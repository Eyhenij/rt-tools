import { isString, Nullable } from '../util';
import { IStorageConverter } from './interfaces/storage-converter';

export class JsonConverter implements IStorageConverter {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public convertTo(data: Nullable<any>): string {
        let parsedData: string;

        try {
            parsedData = JSON.stringify(data);
            // eslint-disable-next-line
        } catch (e: unknown) {
            parsedData = 'null';
        }

        return parsedData;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public convertFrom<T>(data: any): Nullable<T> {
        if (isString(data)) {
            try {
                return JSON.parse(data) as T;
                // eslint-disable-next-line
            } catch (e: unknown) {
                return null;
            }
        }

        return null;
    }
}
