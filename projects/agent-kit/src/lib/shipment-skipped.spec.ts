/**
 * Блоки, которые отправка сочла уже уехавшими.
 *
 * Поле пометки читалось по наличию, и значение ей было безразлично: поставленная рукой — а её
 * ставят, заполняя поле по привычке, — она означала «уехало», и блок не ехал никогда. Сухой прогон
 * его тоже не показывал, поэтому снаружи выглядело так, будто разборов не было вовсе.
 *
 * Обвязка — та же фикстура, что у соседней спеки отправки: двойник приёма у них один.
 */
import { IOutcomeOfCommand } from './commands.js';
import { accepting, dropTree, freshTree, proposals, said, shipping, start } from './shipment.fixture.js';

beforeEach((): void => freshTree());
afterEach((): void => dropTree());

const forPackage: string = [
    '## пакет · rules/styling-bem.md',
    '',
    '- **повод:** правило молчит про токены',
    '- **ближайшее:** нет — про это правило не говорит вовсе',
    '',
    '> Текст правки.',
].join('\n');

/** Блок с проставленной пометкой: значение задаётся пробой, форма — как её пишут в файле. */
const marked: (value: string) => string = (value: string): string =>
    [forPackage.split('\n')[0], '', `- **отправлено:** ${value}`, ...forPackage.split('\n').slice(2)].join('\n');

describe('пропущенное как отправленное', () => {
    it('SC-AK-1090 — пропущенное как отправленное называется обоими прогонами', async () => {
        start();
        proposals([marked('нет')]);

        const dry: IOutcomeOfCommand = await shipping(accepting(), true);
        expect(said(dry)).toContain('пропущено как отправленное: 1');
        expect(said(dry)).toContain('поставлена рукой');

        const outcome: IOutcomeOfCommand = await shipping();
        expect(said(outcome)).toContain('пропущено как отправленное: 1');
        expect(said(outcome)).toContain('поставлена рукой');
    });

    it('SC-AK-1090 — нуль пропущенных пишется тоже', async () => {
        start();
        proposals([forPackage]);

        expect(said(await shipping())).toContain('пропущено как отправленное: 0');
    });

    it('SC-AK-1090 — пометка своей формы рукой поставленной не называется', async () => {
        start();
        proposals([marked('приём:2026-07')]);

        const outcome: IOutcomeOfCommand = await shipping();
        expect(said(outcome)).toContain('пропущено как отправленное: 1');
        expect(said(outcome)).not.toContain('поставлена рукой');
    });
});
