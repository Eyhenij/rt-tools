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

function withBadges(node: IRtTree.Node<string>): IRtTree.Node<string> {
    const badges: ReadonlyArray<IRtTree.Badge> = node.children ? [] : [{ text: node.value.toUpperCase(), severity: 'info' }];
    return { ...node, badges, children: node.children?.map(withBadges) };
}

/** Те же регионы с метками-кодами: по ним поиск без отбора показывает найденное и в метках. */
export const TREE_STORY_BADGE_NODES: ReadonlyArray<IRtTree.Node<string>> = TREE_STORY_NODES.map(withBadges);
