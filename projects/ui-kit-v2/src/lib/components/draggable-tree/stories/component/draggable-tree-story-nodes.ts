import { IRtTree } from '../../../tree/rt-tree.model';

/** Придуманные разделы отчётов для витрины: две папки, пустая папка, закреплённый раздел. */
export const DRAGGABLE_TREE_STORY_NODES: ReadonlyArray<IRtTree.Node<string>> = [
    { label: 'Сводка за день', value: 'daily', disabled: true },
    {
        label: 'Продажи',
        value: 'sales',
        children: [
            { label: 'По каналам', value: 'channels' },
            { label: 'По тарифам', value: 'rates' },
            {
                label: 'Прогнозы',
                value: 'forecasts',
                children: [{ label: 'Прогноз загрузки на квартал вперёд с учётом групп', value: 'quarter' }],
            },
        ],
    },
    { label: 'Черновики', value: 'drafts', children: [] },
    { label: 'Финансы', value: 'finance' },
];
