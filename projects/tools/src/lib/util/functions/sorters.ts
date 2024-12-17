import { isString } from './is-string';

export const sortByAlphabet: <T extends object>(a: T, b: T, field: keyof T) => number = <T extends object>(
    a: T,
    b: T,
    field: keyof T
): number => {
    if (a[field] && isString(a[field]) && b[field] && isString(b[field])) {
        if ((a[field] as string).toLowerCase() < (b[field] as string).toLowerCase()) {
            return -1;
        }
        if ((a[field] as string).toLowerCase() > (b[field] as string).toLowerCase()) {
            return 1;
        }
    }

    return 0;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sortByDate: (a: { [field: string]: any }, b: { [field: string]: any }, field: string) => number = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    a: { [field: string]: any },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    b: { [field: string]: any },
    field: string
) => new Date(a[field]).getTime() - new Date(b[field]).getTime();
