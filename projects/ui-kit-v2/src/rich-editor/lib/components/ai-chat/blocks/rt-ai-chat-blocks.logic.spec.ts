import { IRtAiChat } from '../rt-ai-chat.model';
import { blocksToPlainText, isMarkdownBlock, isNoticeBlock, tableBlockData, toBlockViews } from './rt-ai-chat-blocks.logic';

describe('rt-ai-chat-blocks logic', (): void => {
    it('SC-UKV-1321 — копия ответа склеивает тексты блоков по порядку, без знаков markdown', (): void => {
        const blocks: readonly IRtAiChat.Block[] = [
            { type: 'markdown', text: '**Итоги октября.** Подтверждено 42 брони.' },
            { type: 'notice', severity: 'warning', text: 'Данные за 31 октября ещё не закрыты.' },
            { type: 'markdown', text: 'Чаще всего — `апартаменты`.' },
        ];

        expect(blocksToPlainText(blocks)).toBe(
            'Итоги октября. Подтверждено 42 брони.\n\nДанные за 31 октября ещё не закрыты.\n\nЧаще всего — апартаменты.'
        );
    });

    it('SC-UKV-1322 — блок, которого кит не знает, в копию не попадает', (): void => {
        const blocks: readonly IRtAiChat.Block[] = [
            { type: 'markdown', text: 'До графика.' },
            { type: 'chart', option: { series: [] }, text: 'подпись графика' },
            { type: 'markdown', text: 'После графика.' },
        ];

        expect(blocksToPlainText(blocks)).toBe('До графика.\n\nПосле графика.');
    });

    it('SC-UKV-1322 — пустой ответ и ответ из одних неизвестных блоков дают пустую строку', (): void => {
        const one: readonly IRtAiChat.Block[] = [{ type: 'markdown', text: 'есть' }];
        expect(blocksToPlainText(one)).toBe('есть');
        expect(blocksToPlainText([])).toBe('');
        expect(blocksToPlainText([{ type: 'chart' }])).toBe('');
    });

    it('SC-UKV-1322 — блок известного типа без строки text кит своим не считает', (): void => {
        const markdown: IRtAiChat.Block = { type: 'markdown', text: '' };
        const notice: IRtAiChat.Block = { type: 'notice', severity: 'info', text: 'x' };
        expect(isMarkdownBlock(markdown)).toBe(true);
        expect(isNoticeBlock(notice)).toBe(true);
        expect(isMarkdownBlock({ type: 'markdown' })).toBe(false);
        expect(isNoticeBlock({ type: 'notice' })).toBe(false);
    });

    it('SC-UKV-1326 — блок из реестра попадает в копию текстом функции toText своего отрисовщика', (): void => {
        const blocks: readonly IRtAiChat.Block[] = [
            { type: 'markdown', text: 'До графика.' },
            { type: 'chart', caption: 'Загрузка по неделям' },
            { type: 'table' },
        ];
        const renderers: readonly IRtAiChat.BlockRenderer[] = [
            { type: 'chart', component: Object, toText: (): string => 'старый текст' },
            {
                type: 'chart',
                component: Object,
                toText: (block: IRtAiChat.Block): string => `  ${String(Reflect.get(block, 'caption'))}  `,
            },
            { type: 'table', component: Object },
            { type: 'markdown', component: Object, toText: (): string => 'не кита' },
        ];

        expect(blocksToPlainText(blocks, renderers)).toBe('До графика.\n\nЗагрузка по неделям');
        expect(blocksToPlainText(blocks)).toBe('До графика.');
    });

    it('SC-UKV-1326 — регистрация без toText заменяет прежнюю вместе с её текстом, сломанная функция даёт пусто', (): void => {
        const blocks: readonly IRtAiChat.Block[] = [{ type: 'markdown', text: 'Текст.' }, { type: 'chart' }, { type: 'table' }];
        const renderers: readonly IRtAiChat.BlockRenderer[] = [
            { type: 'chart', component: Object, toText: (): string => 'текст прежнего отрисовщика' },
            { type: 'chart', component: Function },
            {
                type: 'table',
                component: Object,
                toText: (): string => {
                    throw new Error('поле не заполнено');
                },
            },
        ];

        expect(blocksToPlainText(blocks, renderers)).toBe('Текст.');
        expect(toBlockViews(blocks, renderers)[1]).toEqual({ kind: 'custom', component: Function, block: blocks[1] });
    });

    it('SC-UKV-1328 — плашка с оттенком, которого нет у rt-message, своей не считается и идёт в заглушку', (): void => {
        const noSeverity: IRtAiChat.Block = { type: 'notice', text: 'x' };
        const foreign: IRtAiChat.Block = { type: 'notice', severity: 'critical', text: 'x' };
        const known: IRtAiChat.Block = { type: 'notice', severity: 'danger', text: 'x' };
        const inherited: IRtAiChat.Block = { type: 'notice', severity: 'toString', text: 'x' };

        expect(isNoticeBlock(known)).toBe(true);
        expect(isNoticeBlock(noSeverity)).toBe(false);
        expect(isNoticeBlock(foreign)).toBe(false);
        expect(isNoticeBlock(inherited)).toBe(false);
        expect(
            toBlockViews(
                [known, noSeverity, foreign, { type: 'markdown' }],
                [
                    { type: 'notice', component: Object },
                    { type: 'markdown', component: Object },
                ]
            )
        ).toEqual([
            { kind: 'notice', severity: 'danger', text: 'x' },
            { kind: 'unsupported', type: 'notice' },
            { kind: 'unsupported', type: 'notice' },
            { kind: 'unsupported', type: 'markdown' },
        ]);
    });
    describe('блок table', (): void => {
        const TABLE: IRtAiChat.TableBlock = {
            type: 'table',
            columns: [
                { label: 'Объект', type: 'text' },
                { label: 'Выручка', type: 'currency', currency: 'EUR' },
            ],
            rows: [['Вилла', 4200]],
            total: ['Итого', 4200],
        };

        it('SC-UKV-1396 — таблицу кит рисует сам, отрисовщик table из реестра не берётся', (): void => {
            const renderer: IRtAiChat.BlockRenderer = { type: 'table', component: class {} };
            const views: readonly IRtAiChat.BlockView[] = toBlockViews([TABLE], [renderer]);

            expect(views).toEqual([{ kind: 'table', data: tableBlockData(TABLE) }]);
        });

        it('SC-UKV-1405 — таблица без столбцов или со строками не списком показана заглушкой', (): void => {
            const broken: IRtAiChat.Block[] = [
                { type: 'table', columns: [], rows: [] },
                { type: 'table', columns: [{ label: 'A', type: 'text' }], rows: 'строки' },
            ];

            expect(toBlockViews(broken, [])).toEqual([
                { kind: 'unsupported', type: 'table' },
                { kind: 'unsupported', type: 'table' },
            ]);
        });

        it('SC-UKV-1414 — копия ответа даёт таблицу строками через табуляцию со значениями как в таблице', (): void => {
            const text: string = blocksToPlainText([{ type: 'markdown', text: 'Итоги **месяца**' }, TABLE], [], 'en');

            expect(text).toBe('Итоги месяца\n\nОбъект\tВыручка\nВилла\t€4,200.00\nИтого\t€4,200.00');
        });

        it('SC-UKV-1423 — копия ответа пишет значения таблицы в языке, переданном на минуту копии', (): void => {
            const table: IRtAiChat.TableBlock = { type: 'table', columns: [{ label: 'N', type: 'number' }], rows: [[1234.5]] };

            expect(blocksToPlainText([table], [], 'en')).toBe('N\n1,234.5');
            expect(blocksToPlainText([table], [], 'de')).toBe('N\n1.234,5');
        });
    });
});
