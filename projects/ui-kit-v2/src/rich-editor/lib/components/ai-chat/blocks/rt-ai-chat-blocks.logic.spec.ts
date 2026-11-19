import { IRtAiChat } from '../rt-ai-chat.model';
import {
    blocksToPlainText,
    isMarkdownBlock,
    isNoticeBlock,
    kpiBlockItems,
    rtAiChatPointsWriter,
    tableBlockData,
    toBlockViews,
    TRtAiChatPointsWriter,
} from './rt-ai-chat-blocks.logic';

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

            expect(views).toEqual([{ kind: 'table', data: tableBlockData(TABLE), title: null }]);
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

            expect(text).toBe('Итоги месяца\n\nОбъект\tВыручка\nВилла\t€4,200\nИтого\t€4,200');
        });

        it('SC-UKV-1435 — заголовок таблицы открывает её в копии ответа отдельной строкой', (): void => {
            const titled: IRtAiChat.TableBlock = { ...TABLE, title: 'Выручка по типам номеров' };

            expect(toBlockViews([titled], [])).toEqual([
                { kind: 'table', data: tableBlockData(titled), title: 'Выручка по типам номеров' },
            ]);
            expect(blocksToPlainText([titled], [], 'en')).toBe('Выручка по типам номеров\nОбъект\tВыручка\nВилла\t€4,200\nИтого\t€4,200');
            expect(toBlockViews([{ ...TABLE, title: '  ' }], [])).toEqual([{ kind: 'table', data: tableBlockData(TABLE), title: null }]);
        });

        it('SC-UKV-1423 — копия ответа пишет значения таблицы в языке, переданном на минуту копии', (): void => {
            const table: IRtAiChat.TableBlock = { type: 'table', columns: [{ label: 'N', type: 'number' }], rows: [[1234.5]] };

            expect(blocksToPlainText([table], [], 'en')).toBe('N\n1,234.5');
            expect(blocksToPlainText([table], [], 'de')).toBe('N\n1.234,5');
        });
    });

    describe('блок kpi', (): void => {
        const KPI: IRtAiChat.KpiBlock = {
            type: 'kpi',
            items: [
                {
                    label: 'Выручка',
                    value: 1240000,
                    format: 'currency',
                    currency: 'EUR',
                    delta: 12.5,
                    base: 'vs LY',
                    period: 'November 2026',
                },
                { label: 'Загрузка', value: 0.78, format: 'percent', delta: 3, deltaUnit: 'points' },
                { label: 'Ночи', value: 312 },
            ],
        };

        it('SC-UKV-1436 — KPI кит рисует сам, отрисовщик kpi из реестра не берётся', (): void => {
            const renderer: IRtAiChat.BlockRenderer = { type: 'kpi', component: class {} };

            expect(toBlockViews([KPI], [renderer])).toEqual([{ kind: 'kpi', items: kpiBlockItems(KPI) }]);
        });

        it('SC-UKV-1447, SC-UKV-1482 — items не списком, пустой или без уцелевших карточек — заглушка, соседи на месте', (): void => {
            const blocks: IRtAiChat.Block[] = [
                { type: 'markdown', text: 'до' },
                { type: 'kpi', items: 'карточки' },
                { type: 'kpi', items: [] },
                { type: 'kpi', items: [{ label: 'Без значения' }] },
                { type: 'markdown', text: 'после' },
            ];

            expect(toBlockViews(blocks, [])).toEqual([
                { kind: 'markdown', text: 'до' },
                { kind: 'unsupported', type: 'kpi' },
                { kind: 'unsupported', type: 'kpi' },
                { kind: 'unsupported', type: 'kpi' },
                { kind: 'markdown', text: 'после' },
            ]);
        });

        it('SC-UKV-1457 — копия ответа даёт строку на карточку: название, значение, дельта с базой, период', (): void => {
            expect(blocksToPlainText([KPI], [], 'en')).toBe(
                ['Выручка\t€1.24M\t+12.5% vs LY\tNovember 2026', 'Загрузка\t78.0%\t+3 pp\t', 'Ночи\t312\t\t'].join('\n')
            );
        });

        it('SC-UKV-1457 — копия в ru: «1,24 млн ₽» и «+12,5 % vs LY»', (): void => {
            const block: IRtAiChat.Block = {
                type: 'kpi',
                items: [
                    {
                        label: 'Выручка',
                        value: 1240000,
                        format: 'currency',
                        currency: 'RUB',
                        delta: 12.5,
                        base: 'vs LY',
                        period: 'ноябрь 2026',
                    },
                ],
            };

            expect(blocksToPlainText([block], [], 'ru').split(String.fromCharCode(0xa0)).join(' ')).toBe(
                'Выручка\t1,24 млн ₽\t+12,5 % vs LY\tноябрь 2026'
            );
        });

        it('SC-UKV-1457 — пункты в копии пишутся подписью кита', (): void => {
            const points: TRtAiChatPointsWriter = rtAiChatPointsWriter((key: string, params?: object): string =>
                key === 'uiPercentagePoints' ? `${String(Reflect.get(params ?? {}, 'value'))} п.п.` : ''
            );

            expect(blocksToPlainText([{ type: 'kpi', items: [KPI.items[1]] }], [], 'ru', points)).toBe('Загрузка\t78,0\u00a0%\t+3 п.п.\t');
        });

        it('SC-UKV-1458 — выпавшая карточка не даёт строки', (): void => {
            const block: IRtAiChat.Block = { type: 'kpi', items: ['строка', { label: 'Ночи', value: 312 }, { label: '', value: 1 }] };

            expect(blocksToPlainText([block], [], 'en')).toBe('Ночи\t312\t\t');
        });

        it('SC-UKV-1480 — табуляция и перевод строки внутри текста становятся пробелом', (): void => {
            const block: IRtAiChat.Block = { type: 'kpi', items: [{ label: 'Ночи\tвсего', value: 312, period: 'ноябрь\n2026' }] };

            expect(blocksToPlainText([block], [], 'en')).toBe('Ночи всего\t312\t\tноябрь 2026');
        });

        it('SC-UKV-1481 — несколько блоков KPI идут в копии блок за блоком', (): void => {
            const two: IRtAiChat.KpiBlock = { type: 'kpi', items: [KPI.items[2], KPI.items[2]] };

            expect(
                blocksToPlainText([two, KPI], [], 'en')
                    .split('\n\n')
                    .map((part: string): number => part.split('\n').length)
            ).toEqual([2, 3]);
        });
    });
});
