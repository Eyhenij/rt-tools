/**
 * Indicates if the arguments are equal
 *
 * @param f first parameter to compare
 * @param s second parameter to compare
 */
export function isEqual<T>(f: T, s: T): boolean {
    const s1: string = JSON.stringify(f).split('').sort().join('');
    const s2: string = JSON.stringify(s).split('').sort().join('');
    return s1 === s2;
}

/**
 * Indicates if the content of two arrays is identical
 *
 * @param f first array
 * @param s second array
 */
export function areArraysEqual<T>(f: T[], s: T[]): boolean {
    if (!Array.isArray(f) || !Array.isArray(s)) {
        return false;
    }

    if (f.length !== s.length) {
        return false;
    }

    for (let i: number = 0; i < f.length; i++) {
        const valueF: T = f[i];
        const valueS: T = s[i];

        if (Array.isArray(valueF) && Array.isArray(valueS)) {
            if (!areArraysEqual(valueF, valueS)) {
                return false;
            }
        }

        if (typeof valueF === 'object' && valueF != null && typeof valueS === 'object' && valueS != null) {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            if (!areObjectsEqual(valueF, valueS)) {
                return false;
            }
        } else if (valueF !== valueS) {
            return false;
        }
    }

    return true;
}

/**
 * Indicates if the content of two objects is identical
 *
 * @param f first object
 * @param s second object
 */
export function areObjectsEqual<T>(f: T, s: T): boolean {
    /** If it's just the same object - no need to compare */
    if (f === s) {
        return true;
    }

    if (Array.isArray(f) && Array.isArray(s)) {
        return areArraysEqual(f, s);
    }

    /** If one of the objects is null or undefined - no need to compare */
    if (typeof f === 'object' && f != null && typeof s === 'object' && s != null) {
        const keysF: string[] = Object.keys(f);
        const keysS: string[] = Object.keys(s);

        if (keysF.length != keysS.length) {
            return false;
        }

        for (const key in f) {
            if (!areObjectsEqual(f[key], s[key])) {
                return false;
            }
        }

        return true;
    }

    return false;
}

/**
 * Checks whether two arrays are equal regardless of the order of their elements.
 * Supports deep comparison of nested arrays and objects.
 *
 * @template T The type of elements in the arrays
 * @param f first array
 * @param s second array
 * @returns True if the arrays contain the same elements in any order, false otherwise
 */
export function areArraysEqualUnordered<T>(f: T[], s: T[]): boolean {
    if (!Array.isArray(f) || !Array.isArray(s)) {
        return false;
    }

    if (f.length !== s.length) {
        return false;
    }

    const used: boolean[] = new Array<boolean>(s.length).fill(false);

    for (const valueF of f) {
        let found: boolean = false;

        for (let i: number = 0; i < s.length; i++) {
            if (used[i]) {
                continue;
            }

            const valueS: T = s[i];

            if (Array.isArray(valueF) && Array.isArray(valueS)) {
                if (areArraysEqualUnordered(valueF, valueS)) {
                    used[i] = true;
                    found = true;
                    break;
                }
            } else if (typeof valueF === 'object' && valueF != null && typeof valueS === 'object' && valueS != null) {
                if (areObjectsEqual(valueF, valueS)) {
                    used[i] = true;
                    found = true;
                    break;
                }
            } else if (valueF === valueS) {
                used[i] = true;
                found = true;
                break;
            }
        }

        if (!found) {
            return false;
        }
    }

    return true;
}
