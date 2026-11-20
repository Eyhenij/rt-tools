import { ERtSectionSpan } from '../../../../../lib/util/section-data';
import { IRtAiChat } from '../rt-ai-chat.model';
import { blocksToPlainText, toBlockViews } from './rt-ai-chat-blocks.logic';

type TSectionView = Extract<IRtAiChat.BlockView, { kind: 'section' }>;

const PLATE: IRtAiChat.BlockView = { kind: 'unsupported', type: 'section' };

/** Вид секции; спека падает, если блок нарисован не секцией. */
function sectionOf(block: IRtAiChat.Block, renderers: readonly IRtAiChat.BlockRenderer[] = []): TSectionView {
    const view: IRtAiChat.BlockView = toBlockViews([block], renderers)[0];

    if (view.kind !== 'section') {
        throw new Error(`ожидалась секция, пришло «${view.kind}»`);
    }

    return view;
}

function spans(view: TSectionView): ERtSectionSpan[] {
    return view.cells.map((cell: IRtAiChat.SectionCell): ERtSectionSpan => cell.span);
}

function kinds(view: TSectionView): string[] {
    return view.cells.map((cell: IRtAiChat.SectionCell): string => cell.view.kind);
}

const KPI: IRtAiChat.Block = { type: 'kpi', items: [{ label: 'Ночи', value: 312 }] };
const TABLE: IRtAiChat.Block = { type: 'table', columns: [{ label: 'Объект', type: 'text' }], rows: [['Вилла']] };
const FULL: ERtSectionSpan = ERtSectionSpan.Full;
const COLUMN: ERtSectionSpan = ERtSectionSpan.Column;

describe('rt-ai-chat-blocks logic — блок section', (): void => {
    it('SC-UKV-1507 — секцию кит рисует сам, отрисовщик section из реестра не берётся', (): void => {
        const renderer: IRtAiChat.BlockRenderer = { type: 'section', component: class {}, toText: (): string => 'не кита' };
        const block: IRtAiChat.Block = { type: 'section', title: 'Обзор', blocks: [{ type: 'markdown', text: 'Итог' }] };

        expect(toBlockViews([block], [renderer])).toEqual([
            { kind: 'section', title: 'Обзор', cells: [{ span: FULL, view: { kind: 'markdown', text: 'Итог' } }] },
        ]);
        expect(blocksToPlainText([block], [renderer])).toBe('Обзор\n\nИтог');
    });

    it('SC-UKV-1511 — место по умолчанию идёт от объявленного типа, даже когда блок показан заглушкой', (): void => {
        const view: TSectionView = sectionOf(
            {
                type: 'section',
                blocks: [
                    { type: 'markdown', text: 'Итог' },
                    { type: 'notice', severity: 'info', text: 'Справка' },
                    KPI,
                    TABLE,
                    { type: 'kpi', items: [] },
                    { type: 'chart' },
                    { type: 'app-card' },
                    { type: 'никто-не-знает' },
                    { type: 'section', blocks: [{ type: 'markdown', text: 'внутри' }] },
                ],
            },
            [
                { type: 'chart', component: Object },
                { type: 'app-card', component: Object },
            ]
        );

        expect(spans(view)).toEqual([FULL, FULL, FULL, FULL, FULL, COLUMN, COLUMN, COLUMN, COLUMN]);
        expect(kinds(view)).toEqual([
            'markdown',
            'notice',
            'kpi',
            'table',
            'unsupported',
            'custom',
            'custom',
            'unsupported',
            'unsupported',
        ]);
    });

    it('SC-UKV-1512 — блок называет своё место; чужое значение span не считается', (): void => {
        const chart: IRtAiChat.Block = { type: 'chart', span: 'full', option: { series: [] } };
        const view: TSectionView = sectionOf(
            {
                type: 'section',
                blocks: [
                    chart,
                    { ...TABLE, span: 'column' },
                    { type: 'chart', span: 'wide' },
                    { type: 'chart', span: 1 },
                    { type: 'chart', span: null },
                ],
            },
            [{ type: 'chart', component: Object }]
        );

        expect(spans(view)).toEqual([FULL, COLUMN, COLUMN, COLUMN, COLUMN]);
        expect(view.cells[0].view).toEqual({ kind: 'custom', component: Object, block: chart });
    });

    it('SC-UKV-1512 — таблица ленты со span нарисована как без него', (): void => {
        expect(toBlockViews([{ ...TABLE, span: 'column' }], [])).toEqual(toBlockViews([TABLE], []));
    });

    it('SC-UKV-1515 — секция в секции показана заглушкой, сосед нарисован', (): void => {
        const view: TSectionView = sectionOf({
            type: 'section',
            blocks: [
                { type: 'section', title: 'Внутри', blocks: [{ type: 'markdown', text: 'не рисуется' }] },
                { type: 'markdown', text: 'Итог' },
            ],
        });

        expect(view.cells.map((cell: IRtAiChat.SectionCell): IRtAiChat.BlockView => cell.view)).toEqual([
            PLATE,
            { kind: 'markdown', text: 'Итог' },
        ]);
    });

    it('SC-UKV-1516 — секция без блока, который можно нарисовать, показана заглушкой', (): void => {
        const broken: readonly IRtAiChat.Block[] = [
            { type: 'section' },
            { type: 'section', blocks: 'text' },
            { type: 'section', blocks: [] },
            { type: 'section', blocks: [7, null, {}] },
        ];

        expect(toBlockViews(broken, [])).toEqual([PLATE, PLATE, PLATE, PLATE]);
        expect(blocksToPlainText(broken)).toBe('');
        expect(sectionOf({ type: 'section', blocks: [7, { type: 'markdown', text: 'Итог' }] }).cells).toEqual([
            { span: FULL, view: { kind: 'markdown', text: 'Итог' } },
        ]);
    });

    it('SC-UKV-1518 — копия даёт обрезанный заголовок и тексты вложенных блоков через пустую строку', (): void => {
        const block: IRtAiChat.Block = {
            type: 'section',
            title: '  Обзор\nноября  ',
            blocks: [
                { type: 'markdown', text: '**Месяц** закрыт.' },
                KPI,
                { type: 'chart', caption: 'Загрузка по неделям' },
                { type: 'никто-не-знает', text: 'мимо' },
                { type: 'section', title: 'Внутри', blocks: [{ type: 'markdown', text: 'мимо' }] },
            ],
        };
        const renderers: readonly IRtAiChat.BlockRenderer[] = [
            { type: 'chart', component: Object, toText: (chart: IRtAiChat.Block): string => String(Reflect.get(chart, 'caption')) },
        ];

        expect(blocksToPlainText([block, { type: 'markdown', text: 'После.' }], renderers, 'en')).toBe(
            'Обзор ноября\n\nМесяц закрыт.\n\nНочи\t312\t\t\n\nЗагрузка по неделям\n\nПосле.'
        );
    });

    it('SC-UKV-1518 — секция, чьи блоки не дали текста, не даёт и заголовка', (): void => {
        const silent: IRtAiChat.Block = { type: 'section', title: 'Обзор ноября', blocks: [{ type: 'chart' }, { type: 'section' }] };

        expect(blocksToPlainText([silent])).toBe('');
        expect(blocksToPlainText([silent, { type: 'markdown', text: 'После.' }])).toBe('После.');
    });
});
