/**
 * Черновик компаньона: что пакет заполняет за проект и чего не заполняет никогда.
 *
 * Статьи правила переносятся заранее не ради удобства: их текст — ключ связи со спутником, и
 * переписанный руками он расходится с правилом молча, а проверка спеков видит это как «правило
 * обещает то, чего в дереве нет».
 */
import { COMPANION_MARK, debtLine, draftOf, IUnaddressed, unaddressedOf } from './companion.js';

const TEMPLATE: string = [
    '# <имя-правила> — что здесь своё',
    '',
    '## Где исполняются статьи',
    '',
    '| Статья            | Где исполняется                             |',
    '| ----------------- | ------------------------------------------- |',
    `| <статья дословно> | \`<путь>:<символ>\` ${COMPANION_MARK} |`,
    '',
].join('\n');

const RULE: string = [
    '# Проверяемость — каким приёмом',
    '',
    '## Как закон применяется здесь',
    '',
    '- **Первая статья.** Довод к ней.',
    '- **Вторая статья.** Довод к ней.',
    '',
    '## Ловушки',
    '',
    '- **Это не статья.** Ловушки в таблицу не идут.',
].join('\n');

describe('draftOf', (): void => {
    it('имя правила подставляется в шапку', (): void => {
        expect(draftOf(TEMPLATE, 'testing')).toContain('# testing — что здесь своё');
    });

    it('SC-AK-10 — компаньоны заводятся черновиками, а не с чистого листа', (): void => {
        const draft: string = draftOf(TEMPLATE, 'testing', RULE);

        expect(draft).toContain('| Первая статья. |');
        expect(draft).toContain('| Вторая статья. |');
    });

    // Ловушки и прочие разделы статьями не являются: попав в таблицу, они стали бы обещанием,
    // которому в коде нечего сопоставить, и проверка спеков потребовала бы им привязку.
    it('жирные фразы из других разделов в таблицу не идут', (): void => {
        expect(draftOf(TEMPLATE, 'testing', RULE)).not.toContain('Это не статья');
    });

    it('место под путь остаётся за проектом', (): void => {
        expect(draftOf(TEMPLATE, 'testing', RULE)).toContain(COMPANION_MARK);
    });

    it('без текста правила черновик остаётся как в шаблоне', (): void => {
        expect(draftOf(TEMPLATE, 'testing')).toContain('| <статья дословно> |');
    });

    it('правило без раздела статей ничего не добавляет', (): void => {
        expect(draftOf(TEMPLATE, 'testing', '# Правило\n\n## Ловушки\n\n- **Раз.** Два.\n')).toContain('| <статья дословно> |');
    });
});

/**
 * Долг, добавленный обновлением: статьи, у которых в компаньоне дерева нет адреса.
 *
 * Считается он отдельно от записи файлов — раскладка кладёт их на диск, а решение о том, что
 * назвать долгом, к записи не привязано: иначе оно проверялось бы только настоящим деревом.
 */
describe('добавленный долг', (): void => {
    const RULE_TEXT: string = [
        '# Правило',
        '',
        '## Как закон применяется здесь',
        '',
        '- **Первая статья.** Пояснение.',
        '- **Вторая статья.** Пояснение.',
        '',
    ].join('\n');

    it('SC-AK-156 — статья без адреса попадает в счёт', (): void => {
        const found: IUnaddressed = unaddressedOf('testing', RULE_TEXT, '| Первая статья. | `a.ts:b` |');

        expect(found.missing).toEqual(['Вторая статья.']);
        expect(found.total).toBe(2);
    });

    it('SC-AK-157 — статья с адресом в счёт не идёт', (): void => {
        const filled: string = '| Первая статья. | `a.ts:b` |\n| Вторая статья. | `c.ts:d` |';

        expect(unaddressedOf('testing', RULE_TEXT, filled).missing).toEqual([]);
    });

    it('SC-AK-158 — отсутствующий компаньон называется отдельно', (): void => {
        const found: IUnaddressed = unaddressedOf('testing', RULE_TEXT, null);

        expect(found.absent).toBe(true);
        expect(found.missing).toHaveLength(2);
    });

    it('строка о долге молчит, когда долга нет', (): void => {
        expect(debtLine([unaddressedOf('testing', RULE_TEXT, '| Первая статья. | x |\n| Вторая статья. | y |')])).toBeNull();
    });

    it('строка о долге называет число статей и компаньонов', (): void => {
        const line: string | null = debtLine([unaddressedOf('testing', RULE_TEXT, null)]);

        expect(line).toContain('статей без адреса: 2 в 1 компаньонах');
        expect(line).toContain('без компаньона вовсе');
    });
});
