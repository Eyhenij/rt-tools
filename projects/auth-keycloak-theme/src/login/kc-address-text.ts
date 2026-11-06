/** A sentence cut around the address it names: the text before it, the address, the text after it. */
export interface IAddressText {
    readonly before: string;
    /** The pieces of the address, each kept whole on a line: the name with its `@`, then the domain. */
    readonly address: readonly string[];
    readonly after: string;
}

/**
 * The sentence with the address standing in it as pieces of its own.
 *
 * A browser breaks a line at a hyphen, and an address like `name@example-company.com` came apart
 * as `example-` / `company.com`. Kept whole, the pieces move to the next line together and break
 * only at the `@`, where a reader expects it. A sentence that does not name the address stays whole.
 */
export function addressTextOf(sentence: string, address: string): IAddressText {
    const at: number = address === '' ? -1 : sentence.indexOf(address);
    if (at === -1) {
        return { before: sentence, address: [], after: '' };
    }
    const sign: number = address.lastIndexOf('@');
    const pieces: string[] = sign > 0 ? [address.slice(0, sign + 1), address.slice(sign + 1)] : [address];

    return { before: sentence.slice(0, at), address: pieces, after: sentence.slice(at + address.length) };
}
