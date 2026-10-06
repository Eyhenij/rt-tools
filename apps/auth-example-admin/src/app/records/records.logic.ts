/** A record as the example server gives it out. */
export interface IRecordLine {
    readonly id: number;
    readonly title: string;
    readonly author: string | null;
}

/** The words of the page about a refusal of the server, by the status of the answer. */
export const REFUSAL_WORDS: Readonly<Record<'forbidden' | 'invalid' | 'unavailable', string>> = {
    forbidden: 'The server refused: you have no right to do this',
    invalid: 'The server refused: a record needs a title',
    unavailable: 'The server did not answer, try again',
};

/** HTTP statuses the page tells apart. */
const FORBIDDEN: number = 403;
const BAD_REQUEST: number = 400;

/**
 * The line the page shows above the list for a refused call.
 *
 * A 401 never reaches here: the interceptor of the entry module refreshes the token and repeats
 * the request, and a second 401 sends the person to the entry.
 */
export function refusalText(status: number): string {
    if (status === FORBIDDEN) {
        return REFUSAL_WORDS.forbidden;
    }
    return status === BAD_REQUEST ? REFUSAL_WORDS.invalid : REFUSAL_WORDS.unavailable;
}
