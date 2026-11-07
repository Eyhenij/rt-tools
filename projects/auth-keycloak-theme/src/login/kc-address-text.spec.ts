import { addressTextOf, IAddressText } from './kc-address-text';

describe('addressTextOf', (): void => {
    it('SC-AUTH-101 — the address stands as its name with the @ and its domain, the sentence around it', (): void => {
        const text: IAddressText = addressTextOf('Sent to your address a.b@example-company.com.', 'a.b@example-company.com');

        expect(text).toEqual({ before: 'Sent to your address ', address: ['a.b@', 'example-company.com'], after: '.' });
    });

    it('SC-AUTH-101 — a sentence that does not name the address stays whole', (): void => {
        expect(addressTextOf('Sent to your address.', 'a.b@example.com')).toEqual({
            before: 'Sent to your address.',
            address: [],
            after: '',
        });
        expect(addressTextOf('Sent to your address.', '')).toEqual({ before: 'Sent to your address.', address: [], after: '' });
    });

    it('SC-AUTH-101 — an address without @ stays one piece', (): void => {
        expect(addressTextOf('Sent to local-user now', 'local-user').address).toEqual(['local-user']);
    });
});
