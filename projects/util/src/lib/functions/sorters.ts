export const sortByAlphabet: <T extends object>(
    a: T,
    b: T,
    field: keyof T
) => number = <T extends object>(a: T, b: T, field: keyof T): number => {
    if (a[field] && typeof a[field] === 'string' && b[field] && typeof b[field] === 'string') {
        if ((a[field] as string).toLowerCase() < (b[field] as string).toLowerCase()) {
            return -1;
        }
        if ((a[field] as string).toLowerCase() > (b[field] as string).toLowerCase()) {
            return 1;
        }
    }

    return 0;
};

export const sortByDate: (
    a: { [field: string]: any },
    b: { [field: string]: any },
    field: string
) => number = (a: { [field: string]: any }, b: { [field: string]: any }, field: string) =>
    new Date(a[field]).getTime() - new Date(b[field]).getTime();
