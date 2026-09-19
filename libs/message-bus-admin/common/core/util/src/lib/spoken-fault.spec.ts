import { ERefusal, refusalBody } from '@rt/message-bus-common';
import { describe, expect, it } from 'vitest';

import { ADMIN_LABELS, fill, TAdminLabelKey } from './admin-labels';
import { TAdminText } from './admin-text.service';
import { EReadFault } from './read-fault';
import { spokenFaultOf, spokenFaultText } from './spoken-fault';

/** Словарь вызовом: чистая логика берёт его доводом, и для проверки хватает русского набора. */
const TEXT: TAdminText = (key: TAdminLabelKey, params?: Readonly<Record<string, string | number>>): string =>
    fill(ADMIN_LABELS[key], params);

describe('отказ правки с кодом приёмника', (): void => {
    it('SC-MB-362 — отклонённое обращение несёт код причины и подстановки', (): void => {
        expect(spokenFaultOf(409, refusalBody(ERefusal.AccountNameTaken, { name: 'Пётр' }))).toEqual({
            kind: EReadFault.Service,
            refusal: { code: ERefusal.AccountNameTaken, params: { name: 'Пётр' } },
        });
        expect(spokenFaultOf(400, refusalBody(ERefusal.RoleNameEmpty))).toEqual({
            kind: EReadFault.Service,
            refusal: { code: ERefusal.RoleNameEmpty },
        });
        expect(spokenFaultOf(404, refusalBody(ERefusal.RoleNotFound, { key: 'watcher' })).kind).toBe(EReadFault.Missing);
    });

    it('SC-MB-362 — поломка службы и кончившийся вход кода не несут', (): void => {
        expect(spokenFaultOf(500, { message: 'обращение 1a2b' }).refusal).toBeNull();
        expect(spokenFaultOf(401, refusalBody(ERefusal.SignInRequired))).toEqual({ kind: EReadFault.Session, refusal: null });
        expect(spokenFaultOf(0, null)).toEqual({ kind: EReadFault.Timeout, refusal: null });
    });

    it('SC-MB-411 — показывается текст словаря по коду, а слово приёмника из тела ответа не берётся', (): void => {
        const fault: unknown = spokenFaultOf(409, refusalBody(ERefusal.AccountNameTaken, { name: 'Пётр' }));

        expect(spokenFaultText(fault, 'не удалось', TEXT)).toBe('Пользователь «Пётр» уже заведён: имя занято');
        expect(spokenFaultText(fault, 'не удалось', TEXT)).not.toContain('пользователь «Пётр» уже заведён');
    });

    it('SC-MB-362 — без кода отвечает строка экрана', (): void => {
        expect(spokenFaultText({ kind: EReadFault.Service, refusal: null }, 'не удалось', TEXT)).toBe('не удалось');
        expect(spokenFaultText(new Error('чужая'), 'не удалось', TEXT)).toBe('не удалось');
        expect(spokenFaultText({ kind: 'nothing', refusal: { code: ERefusal.RoleNameEmpty } }, 'не удалось', TEXT)).toBe('не удалось');
    });
});
