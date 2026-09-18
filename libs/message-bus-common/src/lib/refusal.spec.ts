import { describe, expect, it } from 'vitest';

import { ERefusal, IRefusal, IRefusalBody, refusalBody, refusalOf, refusalSaid } from './refusal';

describe('refusalSaid', () => {
    it('SC-MB-413 — подстановки отказа встают в текст по имени', () => {
        const said: string = refusalSaid(ERefusal.RoleHeld, { name: 'Аналитика', people: 'Пётр, Анна' });

        expect(said).toBe('роль «Аналитика» держат записи: Пётр, Анна; сначала дайте им другую');
        expect(said).not.toContain('{{');
    });

    it('место, для которого значения не дали, остаётся видимым, а не пустым', () => {
        expect(refusalSaid(ERefusal.RoleNotFound)).toContain('{{key}}');
    });

    it('у каждого кода набора есть своё предложение', () => {
        const codes: readonly ERefusal[] = Object.values(ERefusal);

        expect(codes.length).toBeGreaterThan(0);
        expect(codes.filter((code: ERefusal): boolean => refusalSaid(code).length === 0)).toEqual([]);
    });
});

describe('refusalBody', () => {
    it('тело отказа несёт код, подстановки и собранное по ним предложение', () => {
        const body: IRefusalBody = refusalBody(ERefusal.AccountNameTaken, { name: 'Пётр' });

        expect(body.code).toBe(ERefusal.AccountNameTaken);
        expect(body.params).toEqual({ name: 'Пётр' });
        expect(body.message).toBe('пользователь «Пётр» уже заведён: имя занято');
    });

    it('у причины без значений подстановок в теле нет вовсе', () => {
        expect(refusalBody(ERefusal.RoleNameEmpty)).toEqual({ code: ERefusal.RoleNameEmpty, message: 'роль ждёт имя' });
    });
});

describe('refusalOf', () => {
    it('разбор возвращает код и подстановки того же отказа', () => {
        const refusal: IRefusal | null = refusalOf(refusalBody(ERefusal.TreeUnknown, { slug: 'rt-tools' }));

        expect(refusal).toEqual({ code: ERefusal.TreeUnknown, params: { slug: 'rt-tools' } });
    });

    it('код вне набора не отбрасывается: показывающая сторона увидит его именем', () => {
        expect(refusalOf({ code: ERefusal.RoleNameEmpty })).not.toBeNull();
        expect(refusalOf({ code: 'выдуманный', message: 'что-то' })).toEqual({ code: 'выдуманный' });
    });

    it('тело без кода отказом не считается: рисовать по нему нечего', () => {
        expect(refusalOf({ message: 'что-то' })).toBeNull();
        expect(refusalOf({ code: '' })).toBeNull();
        expect(refusalOf('строка')).toBeNull();
        expect(refusalOf(null)).toBeNull();
    });

    it('подстановки не набором значений отбрасываются, а код остаётся', () => {
        expect(refusalOf({ code: ERefusal.RoleNameEmpty, params: { at: { deep: 1 } } })).toEqual({ code: ERefusal.RoleNameEmpty });
    });
});
