import { ADMIN_LABELS, fill, TAdminLabelKey, TAdminText } from '@rt/message-bus-admin/common/core/util';
import { TRtKitLabelParams } from '@rt-tools/ui-kit-v2';
import { describe, expect, it } from 'vitest';

import { rightGroups, rightsLabel } from './right.labels';
import { accessOutcome, accessWordsOf, editsOfWords, roleCanDelete } from './role.logic';
import { PersonAccessMapper, RoleShortMapper } from './role.mapper';
import { EAccessWord, IPersonAccess } from './role.model';

/**
 * Словарь доводом: функции каркаса не знают, и русский набор им передаёт спека — тем же приёмом,
 * каким на экране его передаёт экран.
 */
const TEXT: TAdminText = (key: TAdminLabelKey, params?: TRtKitLabelParams): string => fill(ADMIN_LABELS[key], params);

describe('роли и доступ человека: решения экрана', () => {
    it('SC-MB-371 — права роли называются разделом и действием, а роль без прав — словами', () => {
        expect(rightsLabel(['postmortems:read', 'roles:manage'], TEXT)).toBe('Разборы происшествий — чтение, Роли — правка');
        expect(rightsLabel([], TEXT)).toBe('Ни одного права');
    });

    it('SC-MB-371 — группы прав идут по разделам в порядке шапки, чтение раньше правки', () => {
        const groups: readonly { section: string; rights: readonly { right: string }[] }[] = rightGroups(TEXT);

        expect(groups.map((group): string => group.section)).toEqual([
            'Разборы происшествий',
            'Предложения',
            'Сводки проектов',
            'Использование',
            'Чат',
            'Приглашения',
            'Пользователи',
            'Роли',
        ]);
        expect(groups[0].rights.map((one): string => one.right)).toEqual(['postmortems:read', 'postmortems:manage']);
    });

    it('SC-MB-376 — строка роли знает, можно ли её удалить', () => {
        const mapper: RoleShortMapper = new RoleShortMapper();

        expect(mapper.mapFrom({ key: 'owner', name: 'Владелец', rights: ['roles:manage'], people: 2 })).toMatchObject({
            canDelete: false,
            people: 2,
        });
        expect(mapper.mapFrom({ key: 'spare', name: 'Лишняя', rights: [], people: 0 })).toMatchObject({
            canDelete: true,
            rights: [],
        });
        expect(roleCanDelete(0)).toBe(true);
    });

    it('SC-MB-377 — слово на право: без правки решает роль, правка даёт «дано» или «отнято»', () => {
        const words: Readonly<Record<string, EAccessWord>> = accessWordsOf([
            { right: 'usage:read', granted: false },
            { right: 'invites:read', granted: true },
        ]);

        expect(words['usage:read']).toBe(EAccessWord.Revoked);
        expect(words['invites:read']).toBe(EAccessWord.Granted);
        expect(words['postmortems:read']).toBe(EAccessWord.ByRole);
        expect(Object.keys(words)).toHaveLength(12);
    });

    it('SC-MB-378 — исход считается от роли и слов вместе, а слова «по роли» правок не дают', () => {
        const words: Readonly<Record<string, EAccessWord>> = {
            ...accessWordsOf([]),
            'proposals:read': EAccessWord.Revoked,
            'usage:read': EAccessWord.Granted,
        };
        const given: ReadonlySet<string> = accessOutcome(['postmortems:read', 'proposals:read'], words);

        expect([...given]).toEqual(['postmortems:read', 'usage:read']);
        expect(editsOfWords(words)).toEqual([
            { right: 'proposals:read', granted: false },
            { right: 'usage:read', granted: true },
        ]);
        // Роли нет — права выходят из одних слов
        expect([...accessOutcome(null, words)]).toEqual(['usage:read']);
    });

    it('SC-MB-377 — перевод доступа: пустая роль остаётся пустотой, а права не из набора отбрасываются', () => {
        const state: IPersonAccess.State = new PersonAccessMapper().mapFrom({
            name: 'Вера',
            role: null,
            edits: [{ right: 'nope', granted: true }],
            rights: [],
        });

        expect(state.role).toBeNull();
        expect(state.words['postmortems:read']).toBe(EAccessWord.ByRole);
        expect(state.rights).toEqual([]);
    });
});
