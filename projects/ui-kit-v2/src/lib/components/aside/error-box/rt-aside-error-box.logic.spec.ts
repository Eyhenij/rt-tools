import { rtAsideErrorCopyText } from './rt-aside-error-box.logic';

describe('rtAsideErrorCopyText', (): void => {
    const now: Date = new Date(2026, 8, 29, 14, 5, 7);

    it('SC-UKV-464: копия держит момент и ошибку в JSON', (): void => {
        const error: Record<string, unknown> = { status: 500, message: 'Internal' };

        expect(rtAsideErrorCopyText(error, now)).toBe(
            `Error time: ${now.toDateString()}_${now.toTimeString()};Error info: {"status":500,"message":"Internal"}`
        );
    });

    it('SC-UKV-465: ошибка с петлёй внутри копируется строкой и не бросает', (): void => {
        const error: Record<string, unknown> = { status: 500 };
        error['self'] = error;

        expect((): string => rtAsideErrorCopyText(error, now)).not.toThrow();
        expect(rtAsideErrorCopyText(error, now)).toContain('Error info: [object Object]');
    });

    it('строка ошибки копируется в кавычках JSON', (): void => {
        expect(rtAsideErrorCopyText('Timeout', now)).toContain('Error info: "Timeout"');
    });

    it('значение, которого нет в JSON, копируется строкой', (): void => {
        expect(rtAsideErrorCopyText(Symbol('x'), now)).toContain('Error info: Symbol(x)');
    });
});
