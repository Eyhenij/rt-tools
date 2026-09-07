/**
 * Отбой предложений при отправке: блок, не назвавший ближайшего утверждения ресурса, наружу не
 * едет.
 *
 * Стоит отдельной спекой от отправки груза: предмет другой — не что уезжает, а что не уезжает и
 * почему. Обвязка у обеих одна и лежит рядом фикстурой.
 *
 * Ресурс, с которым сверяется цитата, берётся из дерева пакета, и цитата английская, как сам
 * ресурс: выдуманный набор сказал бы, что
 * проверка работает, и промолчал бы о том, что она читает настоящий текст.
 */
import { IProposalsCargo } from './cargo.js';
import { IOutcomeOfCommand } from './commands.js';
import {
    accepting,
    dropTree,
    freshTree,
    get,
    operationsSent,
    proposals,
    PROPOSALS_FILE,
    said,
    sent,
    shipping,
    start,
} from './shipment.fixture.js';

/** Блок с настоящей цитатой ресурса: такую проверка находит и блок пропускает. */
const withQuote: string = [
    '## пакет · rules/styling-bem.md',
    '',
    '- **повод:** статья о токенах не говорит про составные значения',
    '- **ближайшее:** «A class is set by a directive, not by a string in an attribute.» — про имя, не про значение',
    '',
    '> Текст правки.',
].join('\n');

/** Блок с цитатой, которой в ресурсе нет: либо не читали, либо утверждение с тех пор переписано. */
const withWrongQuote: string = [
    '## пакет · rules/styling-bem.md',
    '',
    '- **повод:** правило молчит про токены',
    '- **ближайшее:** «Токены объявляются один раз и живут в общем слое.»',
    '',
    '> Текст правки.',
].join('\n');

/** Блок без поля вовсе: ресурс не читали. */
const withoutField: string = ['## пакет · rules/styling-bem.md', '', '- **повод:** правило молчит про токены', '', '> Текст правки.'].join(
    '\n'
);

beforeEach((): void => freshTree());
afterEach((): void => dropTree());

describe('отбой предложений', () => {
    it('SC-AK-545 — блок без поля ближайшего утверждения не уезжает', async () => {
        start();
        proposals([withoutField]);

        const outcome: IOutcomeOfCommand = await shipping();

        expect(outcome.code).toBe(0);
        // Уехала одна сводка: предложений в грузе нет вовсе.
        expect(operationsSent()).toEqual(['summary']);
        expect(said(outcome)).toContain('поля «ближайшее» нет');
    });

    it('SC-AK-545 — блок с цитатой, которой в ресурсе нет, не уезжает', async () => {
        start();
        proposals([withWrongQuote]);

        const outcome: IOutcomeOfCommand = await shipping();

        expect(operationsSent()).toEqual(['summary']);
        expect(said(outcome)).toContain('цитаты нет в «rules/styling-bem.md»');
    });

    it('SC-AK-546 — блок с настоящей цитатой уезжает', async () => {
        start();
        proposals([withQuote]);

        expect((await shipping()).code).toBe(0);

        const cargo: IProposalsCargo = sent[1].body as IProposalsCargo;
        expect(operationsSent()).toEqual(['summary', 'proposals']);
        expect(cargo.items).toHaveLength(1);
    });

    it('SC-AK-546 — соседний блок отбоем не задерживается', async () => {
        start();
        proposals([withoutField, withQuote]);

        await shipping();

        const cargo: IProposalsCargo = sent[1].body as IProposalsCargo;
        expect(cargo.items).toHaveLength(1);
        expect(cargo.items[0].text).toContain('не говорит про составные значения');
    });

    it('SC-AK-547 — отбитый блок остаётся на диске с причиной', async () => {
        start();
        proposals([withWrongQuote]);

        await shipping();
        const marked: string = get(PROPOSALS_FILE);

        expect(marked).toContain('- **отбито:** цитаты нет');
        // Блок никуда не делся: причина дописана, а текст правки лежит как лежал.
        expect(marked).toContain('> Текст правки.');
    });

    it('SC-AK-548 — сухой прогон называет отбитое и отметок не ставит', async () => {
        start();
        proposals([withWrongQuote]);

        const outcome: IOutcomeOfCommand = await shipping(accepting(), true);

        expect(said(outcome)).toContain('отбито');
        expect(sent).toHaveLength(0);
        expect(get(PROPOSALS_FILE)).not.toContain('отбито:');
    });
});
