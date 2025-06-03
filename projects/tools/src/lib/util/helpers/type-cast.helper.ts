import { format, parse, parseISO } from 'date-fns';
import { isNil } from '../functions';

export class TypeCastHelper {
    public getAsString(data: unknown, defaultValue: string = ''): string {
        return !isNil(data) && !Number.isNaN(data) ? String(data) : defaultValue;
    }

    public getAsNumber(data: unknown, defaultValue?: number): number {
        const result: number = Number(data);

        return data === null || Number.isNaN(result) ? (defaultValue ?? NaN) : result;
    }

    public getAsBoolean(data: unknown): boolean {
        const stringExceptions: string[] = ['false', '0', 'null'];

        if (typeof data === 'string' && stringExceptions.includes(data)) {
            return false;
        }

        return Boolean(data);
    }

    public getAsNull(data: unknown, handler?: (data: unknown) => unknown): unknown {
        if (!isNil(data) && !Number.isNaN(data)) {
            return handler ? handler(data) : data;
        }

        return null;
    }

    // eslint-disable-next-line
    public getAsType(value: unknown, type: NonNullable<unknown>): any {
        if (!!value && !Object.values(type).includes(value)) {
            // eslint-disable-next-line no-console
            console.error(`getAsTyped: the value "${value}" was not found in the specified type`);
            return 'unknown';
        }

        return value;
    }

    public getAsTypedArray<T>(data: unknown[], cb: (item: unknown) => T, showError: boolean = true): T[] {
        if (!Array.isArray(data)) {
            if (showError) {
                // eslint-disable-next-line no-console
                console.error(
                    'getAsTypedArray: Given data must be an array (now it is ' +
                        typeof data +
                        '). Incorrect data will be defined as array of data (data => [data]).'
                );
            }

            data = [data];
        }

        return data.map(cb);
    }

    public getAsDate(date: string | number | Date, asString?: boolean, parseFormatOptions?: string, formatOptions?: string): Date | string {
        formatOptions = formatOptions ?? 'dd.MM.yyyy';
        asString = asString ?? true;

        const type: string | number | object = typeof date;

        switch (type) {
            case 'number':
                date = new Date(date);
                break;
            case 'string':
                date = !!parseFormatOptions ? parse(date as string, parseFormatOptions, new Date()) : parseISO(date as string);
                break;
        }

        if (!date || (date instanceof Date && !date.getTime())) return '';

        return asString ? format(date, formatOptions) : (date as Date);
    }
}
