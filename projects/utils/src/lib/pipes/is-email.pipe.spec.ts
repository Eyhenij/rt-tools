import { IsEmailPipe } from './is-email.pipe';

describe(IsEmailPipe.name, () => {
    const pipe: IsEmailPipe = new IsEmailPipe();

    it('should return true if value is email-address', () => {
        const value: string = 'test@test.com';
        expect(pipe.transform(value)).toBe(true);
    });
    it('should return false if value is not email-address', () => {
        const value: string = 'some string';
        expect(pipe.transform(value)).toBe(false);
    });
    it('should not return true if value is not email-address', () => {
        const value: string = 'some string';
        expect(pipe.transform(value)).not.toBe(true);
    });
});
