/**
 * Свойства дерева и требования ресурсов. Проверяется главным образом одно: требование
 * отличимо и от вида, и от обычной части имени — иначе `git-workflow.github.md` прочитался бы
 * требованием, а `observability.needs-db.md` легло бы всякому дереву.
 */
import { answersRequirement, ITrait, requirementOf, unknownTraits, withoutRequirement } from './traits.js';

const TRAITS: readonly ITrait[] = [
    { value: 'db', title: 'хранилище' },
    { value: 'admin', title: 'админка' },
];

describe('requirementOf', () => {
    it('SC-AK-175 — читает требование по приставке', (): void => {
        expect(requirementOf('observability.needs-db.md')).toBe('db');
    });

    it('SC-AK-175 — вид оси требованием не считает', (): void => {
        expect(requirementOf('git-workflow.github.md')).toBeNull();
    });

    it('имя без второй точки требованием не считает', (): void => {
        expect(requirementOf('observability.md')).toBeNull();
    });

    it('пустое имя свойства требованием не считает', (): void => {
        expect(requirementOf('observability.needs-.md')).toBeNull();
    });
});

describe('withoutRequirement', () => {
    it('SC-AK-169 — снимает требование с имени', (): void => {
        expect(withoutRequirement('observability.needs-db.md', 'db')).toBe('observability.md');
    });

    it('имя без требования оставляет как есть', (): void => {
        expect(withoutRequirement('delivery.md', null)).toBe('delivery.md');
    });
});

describe('answersRequirement', () => {
    it('SC-AK-169 — названное деревом свойство отвечает требованию', (): void => {
        expect(answersRequirement('db', ['db', 'app'])).toBe(true);
    });

    it('SC-AK-168 — неназванное свойство требованию не отвечает', (): void => {
        expect(answersRequirement('db', ['packages', 'app'])).toBe(false);
    });

    it('SC-AK-170 — молчание дерева о себе требованию не отвечает', (): void => {
        expect(answersRequirement('db', [])).toBe(false);
    });

    it('SC-AK-171 — ресурс без требования берётся и молчащим деревом', (): void => {
        expect(answersRequirement(null, [])).toBe(true);
    });
});

describe('unknownTraits', () => {
    it('SC-AK-174 — необъявленное свойство называет по имени', (): void => {
        expect(unknownTraits(['db', 'storage'], TRAITS)).toEqual(['storage']);
    });

    it('объявленные свойства пропускает', (): void => {
        expect(unknownTraits(['db', 'admin'], TRAITS)).toEqual([]);
    });
});
