import { rtTreeOpenFor, rtTreeRows } from '../select/rt-select-tree';
import { rtTreeChoose, rtTreeChooseAlone, rtTreeLabelParts, rtTreeMark, rtTreeSelectAll, rtTreeSelectAllMark } from './rt-tree.logic';
import { IRtTree } from './rt-tree.model';

const MOSCOW: IRtTree.Node<string> = { label: 'Москва', value: 'msk' };
const CENTRE: IRtTree.Node<string> = { label: 'Центр', value: 'ru-c', children: [MOSCOW, { label: 'Тверь', value: 'tvr' }] };
const SOCHI: IRtTree.Node<string> = { label: 'Сочи', value: 'aer', disabled: true };
const RUSSIA: IRtTree.Node<string> = { label: 'Россия', value: 'ru', children: [CENTRE, { label: 'Казань', value: 'kzn' }, SOCHI] };
const MINSK: IRtTree.Node<string> = { label: 'Минск', value: 'msq', description: 'Столица' };
const TREE: ReadonlyArray<IRtTree.Node<string>> = [RUSSIA, MINSK];

function rowsOf(open: ReadonlyArray<string>, term: string = ''): ReadonlyArray<IRtTree.Row<string>> {
    return rtTreeRows<string>(TREE, new Set<string>(open), term);
}

function valuesOf(rows: ReadonlyArray<IRtTree.Row<string>>): string[] {
    return rows.map((row: IRtTree.Row<string>): string => row.option.value);
}

describe('rt-tree logic', (): void => {
    it('SC-UKV-672 — клик по листу даёт новый массив, а узлы остаются прежними', (): void => {
        const before: string = JSON.stringify(TREE);
        const value: ReadonlyArray<string> = [];

        const next: ReadonlyArray<string> = rtTreeChoose(MOSCOW, value, 'multiple', true);

        expect(next).toEqual(['msk']);
        expect(next).not.toBe(value);
        expect(value).toEqual([]);
        expect(JSON.stringify(TREE)).toBe(before);
    });

    it('SC-UKV-673 — клик по ветке выбирает её включённые листья, повторный снимает', (): void => {
        const first: ReadonlyArray<string> = rtTreeChoose(RUSSIA, [], 'multiple', true);

        expect([...first].sort()).toEqual(['kzn', 'msk', 'tvr']);
        expect(rtTreeChoose(RUSSIA, first, 'multiple', true)).toEqual([]);
    });

    it('SC-UKV-674 — ветка с частью выбранных листьев отмечена частично', (): void => {
        expect(rtTreeMark(CENTRE, ['msk'], true)).toBe('some');
        expect(rtTreeMark(CENTRE, ['msk', 'tvr'], true)).toBe('all');
        expect(rtTreeMark(CENTRE, [], true)).toBe('none');
    });

    it('SC-UKV-675 — без каскада клик меняет только сам узел', (): void => {
        const next: ReadonlyArray<string> = rtTreeChoose(CENTRE, [], 'multiple', false);

        expect(next).toEqual(['ru-c']);
        expect(rtTreeMark(CENTRE, next, false)).toBe('all');
        expect(rtTreeMark(MOSCOW, next, false)).toBe('none');
    });

    it('SC-UKV-676 — одиночный режим держит один узел и не снимает его повторным кликом', (): void => {
        expect(rtTreeChoose(MINSK, ['msk'], 'single', true)).toEqual(['msq']);
        expect(rtTreeChoose(MINSK, ['msq'], 'single', true)).toEqual(['msq']);
    });

    it('SC-UKV-644 — в режиме без отметок клик выбор не меняет', (): void => {
        expect(rtTreeChoose(MOSCOW, [], 'none', true)).toEqual([]);
    });

    it('SC-UKV-645 — «выбрать всё» не трогает выключенный лист', (): void => {
        const rows: ReadonlyArray<IRtTree.Row<string>> = rowsOf([]);
        const all: ReadonlyArray<string> = rtTreeSelectAll(rows, []);

        expect([...all].sort()).toEqual(['kzn', 'msk', 'msq', 'tvr']);
        expect(rtTreeSelectAllMark(rows, all)).toBe('all');
        expect(rtTreeSelectAll(rows, [...all, 'aer'])).toEqual(['aer']);
        expect(rtTreeChoose(SOCHI, [], 'multiple', true)).toEqual([]);
    });

    it('SC-UKV-646 — открыты ветки, под которыми лежит выбранное', (): void => {
        expect([...rtTreeOpenFor<string>(TREE, ['msk'])].sort()).toEqual(['ru', 'ru-c']);
    });

    it('SC-UKV-647 — поиск держит путь к совпадению открытым и режет подпись по совпадению', (): void => {
        expect(valuesOf(rowsOf([], 'мин'))).toEqual(['msq']);
        expect(valuesOf(rowsOf([], 'моск'))).toEqual(['ru', 'ru-c', 'msk']);
        expect(rtTreeLabelParts(MINSK, 'мин').label).toEqual([
            { text: 'Мин', matched: true },
            { text: 'ск', matched: false },
        ]);
    });

    it('SC-UKV-665 — клик без Ctrl и Cmd оставляет в выборе только кликнутый узел и выключенные', (): void => {
        const value: ReadonlyArray<string> = ['msk', 'msq', 'aer'];

        const first: ReadonlyArray<string> = rtTreeChooseAlone(TREE, { label: 'Казань', value: 'kzn' }, value, true);
        expect([...first].sort()).toEqual(['aer', 'kzn']);

        const second: ReadonlyArray<string> = rtTreeChooseAlone(TREE, { label: 'Казань', value: 'kzn' }, first, true);
        expect(second).toEqual(['aer']);

        expect([...rtTreeChooseAlone(TREE, CENTRE, value, true)].sort()).toEqual(['aer', 'msk', 'tvr']);
    });

    it('SC-UKV-666 — каждое слово запроса отмечено в подписи, описании и метках', (): void => {
        const node: IRtTree.Node<string> = { ...MINSK, badges: [{ text: 'MSQ' }] };

        const parts: IRtTree.LabelParts = rtTreeLabelParts(node, 'мин сто msq');

        expect(parts.label).toEqual([
            { text: 'Мин', matched: true },
            { text: 'ск', matched: false },
        ]);
        expect(parts.description).toEqual([
            { text: 'Сто', matched: true },
            { text: 'лица', matched: false },
        ]);
        expect(parts.badges).toEqual([[{ text: 'MSQ', matched: true }]]);
    });
});
