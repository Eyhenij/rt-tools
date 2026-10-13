import { IRtHybridTree } from '../../rt-hybrid-tree.model';

/** Придуманные поля отчёта: группировки берутся сколько угодно, показатели года — по одному. */
export const HYBRID_TREE_STORY_NODES: ReadonlyArray<IRtHybridTree.Node<string>> = [
    {
        label: 'Группировки',
        value: 'grouping',
        children: [
            { label: 'Гостиница', value: 'hotel' },
            { label: 'Сегмент', value: 'segment' },
            { label: 'Канал продаж', value: 'channel', description: 'Сайт, агентства, телефон' },
        ],
    },
    {
        label: 'Этот год',
        value: 'ty',
        single: true,
        children: [
            { label: 'Выручка', value: 'ty-revenue' },
            { label: 'Проданные номера', value: 'ty-rooms' },
            { label: 'Средняя цена', value: 'ty-adr', description: 'Нет данных за период', disabled: true },
        ],
    },
    {
        label: 'Прошлый год',
        value: 'ly',
        single: true,
        children: [
            { label: 'Выручка', value: 'ly-revenue' },
            { label: 'Проданные номера', value: 'ly-rooms' },
        ],
    },
];
