import { IRtTree } from '../../rt-tree.model';

/** Придуманные регионы для витрины: три уровня, выключенный лист и описание у листа. */
export const TREE_STORY_NODES: ReadonlyArray<IRtTree.Node<string>> = [
    {
        label: 'Россия',
        value: 'ru',
        children: [
            {
                label: 'Центр',
                value: 'ru-c',
                children: [
                    { label: 'Москва', value: 'msk', description: 'Столица' },
                    { label: 'Тверь', value: 'tvr' },
                ],
            },
            { label: 'Казань', value: 'kzn' },
            { label: 'Сочи', value: 'aer', description: 'Недоступен для выбора', disabled: true },
        ],
    },
    {
        label: 'Беларусь',
        value: 'by',
        children: [
            { label: 'Минск', value: 'msq' },
            { label: 'Гродно', value: 'gna' },
        ],
    },
    { label: 'Ереван', value: 'evn' },
];
