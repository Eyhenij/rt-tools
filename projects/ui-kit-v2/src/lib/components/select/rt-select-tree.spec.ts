import {
    rtTreeBranchState,
    rtTreeFind,
    rtTreeIsTree,
    rtTreeLeaves,
    rtTreeOpenFor,
    rtTreeRows,
    rtTreeSideKey,
    rtTreeToggle,
} from './rt-select-tree';
import { IRtSelect } from './rt-select.model';

const TREE: ReadonlyArray<IRtSelect.Option<string>> = [
    {
        label: 'Россия',
        value: 'ru',
        children: [
            {
                label: 'Центр',
                value: 'ru-c',
                children: [
                    { label: 'Москва', value: 'msk' },
                    { label: 'Тверь', value: 'tvr' },
                ],
            },
            { label: 'Казань', value: 'kzn' },
            { label: 'Сочи', value: 'aer', disabled: true },
        ],
    },
    { label: 'Минск', value: 'msq' },
];

function shape(rows: ReadonlyArray<IRtSelect.Row<string>>): string[] {
    return rows.map((row: IRtSelect.Row<string>): string => `${row.level}:${row.option.value}${row.branch ? (row.open ? 'v' : '>') : ''}`);
}

describe('rt-select-tree', (): void => {
    it('SC-UKV-408 — плоский список деревом не считается', (): void => {
        expect(rtTreeIsTree([{ label: 'Минск', value: 'msq' }])).toBe(false);
        expect(rtTreeIsTree(TREE)).toBe(true);
    });

    it('SC-UKV-409 — видимые строки идут по уровням, свёрнутая ветка детей не показывает', (): void => {
        expect(shape(rtTreeRows(TREE, new Set<string>()))).toEqual(['0:ru>', '0:msq']);
        expect(shape(rtTreeRows(TREE, new Set<string>(['ru'])))).toEqual(['0:ruv', '1:ru-c>', '1:kzn', '1:aer', '0:msq']);
        expect(shape(rtTreeRows(TREE, new Set<string>(['ru', 'ru-c'])))).toEqual([
            '0:ruv',
            '1:ru-cv',
            '2:msk',
            '2:tvr',
            '1:kzn',
            '1:aer',
            '0:msq',
        ]);
    });

    it('опция находится на любой глубине', (): void => {
        expect(rtTreeFind(TREE, 'tvr')?.label).toBe('Тверь');
        expect(rtTreeFind(TREE, 'nope')).toBeUndefined();
    });

    it('листья ветки — только включённые, лист отдаёт сам себя', (): void => {
        expect(rtTreeLeaves(TREE[0])).toEqual(['msk', 'tvr', 'kzn']);
        expect(rtTreeLeaves(TREE[1])).toEqual(['msq']);
    });

    it('SC-UKV-413 — состояние ветки выводится из её включённых листьев', (): void => {
        const centre: IRtSelect.Option<string> = TREE[0].children?.[0] as IRtSelect.Option<string>;

        expect(rtTreeBranchState(centre, [])).toBe('none');
        expect(rtTreeBranchState(centre, ['msk'])).toBe('some');
        expect(rtTreeBranchState(centre, ['msk', 'tvr'])).toBe('all');
        expect(rtTreeBranchState(TREE[0], ['msk', 'tvr', 'kzn'])).toBe('all');
    });

    it('SC-UKV-414 — при открытии раскрыты ветки над выбранным', (): void => {
        expect([...rtTreeOpenFor(TREE, ['tvr'])].sort()).toEqual(['ru', 'ru-c']);
        expect(rtTreeOpenFor(TREE, ['msq']).size).toBe(0);
    });

    it('SC-UKV-415 — поиск держит путь к совпадению раскрытым и убирает несовпавшее', (): void => {
        expect(shape(rtTreeRows(TREE, new Set<string>(), 'твер'))).toEqual(['0:ruv', '1:ru-cv', '2:tvr']);
        expect(shape(rtTreeRows(TREE, new Set<string>(), 'центр'))).toEqual(['0:ruv', '1:ru-c>']);
    });

    it('SC-UKV-416 — боковые стрелки раскрывают, спускаются к ребёнку, поднимаются к родителю и сворачивают', (): void => {
        let open: ReadonlySet<string> = new Set<string>();
        let rows: ReadonlyArray<IRtSelect.Row<string>> = rtTreeRows(TREE, open);

        let answer: IRtSelect.SideKeyAnswer<string> = rtTreeSideKey(rows, 0, 'ArrowRight');
        expect(answer).toEqual({ toggle: 'ru', index: 0 });
        open = rtTreeToggle(open, 'ru');
        rows = rtTreeRows(TREE, open);

        answer = rtTreeSideKey(rows, 0, 'ArrowRight');
        expect(answer).toEqual({ toggle: null, index: 1 });

        answer = rtTreeSideKey(rows, 1, 'ArrowLeft');
        expect(answer).toEqual({ toggle: null, index: 0 });

        answer = rtTreeSideKey(rows, 0, 'ArrowLeft');
        expect(answer).toEqual({ toggle: 'ru', index: 0 });
    });
});
