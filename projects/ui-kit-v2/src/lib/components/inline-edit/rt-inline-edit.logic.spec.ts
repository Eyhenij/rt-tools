import { inlineEditLeaves, inlineEditMiddle, inlineEditOutcome } from './rt-inline-edit.logic';

describe('Правка на месте — разбор', (): void => {
    it('SC-UKV-787 — изменённый черновик уходит обрезанным, равный значению закрывает поле', (): void => {
        expect(inlineEditOutcome('Отчёт', '  Отчёт за май ', false)).toEqual({ kind: 'save', value: 'Отчёт за май' });
        expect(inlineEditOutcome('Отчёт', ' Отчёт  ', false)).toEqual({ kind: 'close' });
    });

    it('SC-UKV-789 — пустой черновик не уходит, пока пустое не разрешено', (): void => {
        expect(inlineEditOutcome('Отчёт', '   ', false)).toEqual({ kind: 'refuse' });
        expect(inlineEditOutcome('Отчёт', '   ', true)).toEqual({ kind: 'save', value: '' });
        expect(inlineEditOutcome('', '', true)).toEqual({ kind: 'close' });
    });

    it('SC-UKV-791 — переход на свои кнопки уходом не считается, пустая цель — уход', (): void => {
        const host: HTMLElement = document.createElement('div');
        const own: HTMLElement = host.appendChild(document.createElement('button'));
        const outside: HTMLElement = document.createElement('button');

        expect(inlineEditLeaves(host, own)).toBe(false);
        expect(inlineEditLeaves(host, outside)).toBe(true);
        expect(inlineEditLeaves(host, null)).toBe(true);
    });

    it('SC-UKV-848 — длинный текст режется так, что последние десять знаков видны всегда', (): void => {
        expect(inlineEditMiddle('Отчёт по продажам за второй квартал')).toEqual({
            head: 'Отчёт по продажам за втор',
            tail: 'ой квартал',
        });
        expect(inlineEditMiddle('Короткий отчёт')).toEqual({ head: 'Короткий отчёт', tail: '' });
        expect(inlineEditMiddle('😀'.repeat(25)).tail).toBe('😀'.repeat(10));
    });
});
