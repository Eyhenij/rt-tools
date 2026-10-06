import { IRtTree } from '../../../tree/rt-tree.model';

/** Придуманные гостиницы по странам и городам: два уровня групп, метки-категории, выключенный лист. */
export const TREE_SELECTOR_STORY_NODES: ReadonlyArray<IRtTree.Node<string>> = [
    {
        label: 'Армения',
        value: 'am',
        children: [
            {
                label: 'Ереван',
                value: 'am-evn',
                children: [
                    { label: 'Гостиница Арарат', value: 'ararat', badges: [{ text: '4*', severity: 'info' }] },
                    { label: 'Гостиница Каскад', value: 'kaskad', badges: [{ text: '5*', severity: 'success' }] },
                ],
            },
            {
                label: 'Дилижан',
                value: 'am-dlj',
                children: [{ label: 'Лесной дом', value: 'les', description: 'Закрыт на сезон', disabled: true }],
            },
        ],
    },
    {
        label: 'Грузия',
        value: 'ge',
        children: [
            {
                label: 'Тбилиси',
                value: 'ge-tbs',
                children: [
                    { label: 'Гостиница Мтацминда', value: 'mtac', badges: [{ text: '4*', severity: 'info' }] },
                    { label: 'Старый город', value: 'stary', badges: [{ text: '3*', severity: 'neutral' }] },
                ],
            },
        ],
    },
];
