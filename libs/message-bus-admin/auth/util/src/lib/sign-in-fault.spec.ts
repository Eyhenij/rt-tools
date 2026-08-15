import { ESignInFault, signInFault } from './sign-in-fault';

describe('signInFault', () => {
    it('пара не принята — отказ по паре', () => {
        expect(signInFault(401)).toBe(ESignInFault.Pair);
    });

    it('тело без имени или без пароля — отказ по форме', () => {
        expect(signInFault(400)).toBe(ESignInFault.Form);
    });

    it('отказ приёмника — отказ службы', () => {
        expect(signInFault(500)).toBe(ESignInFault.Service);
    });

    it('обрыв связи приходит нулём и читается отказом службы', () => {
        expect(signInFault(0)).toBe(ESignInFault.Service);
    });
});
