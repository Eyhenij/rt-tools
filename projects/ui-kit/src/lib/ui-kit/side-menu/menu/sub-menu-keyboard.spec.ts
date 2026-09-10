import { ISideMenu } from '../side-menu.types';
import { SubMenuKeyboard } from './sub-menu-keyboard';

const ITEMS: ISideMenu.Item[] = [
    { id: 'rates', name: 'Курсы валют', link: '/rates' },
    {
        id: 'saved',
        name: 'Сохранённое',
        submenu: [
            { id: 'pie', name: 'Круговая диаграмма', link: '/saved/pie' },
            { id: 'bars', name: 'Столбцы по месяцам', link: '/saved/bars' },
        ],
    },
];

interface ISetup {
    keyboard: SubMenuKeyboard;
    opened: jest.Mock;
    cleared: jest.Mock;
}

function setup(): ISetup {
    const opened: jest.Mock = jest.fn();
    const cleared: jest.Mock = jest.fn();

    return { keyboard: new SubMenuKeyboard({ open: opened, clearQuery: cleared }), opened, cleared };
}

/** Раскрытость, какой её собирает меню: своё раскрытое плюс то, что пришло со стороны. */
function expanded(keyboard: SubMenuKeyboard, outside: Array<string | number> = []): Array<string | number> {
    const closed: Array<string | number> = keyboard.closedIds();

    return [...outside, ...keyboard.openedIds()].filter((id: string | number): boolean => !closed.includes(id));
}

describe('SubMenuKeyboard — ходьба стрелками', (): void => {
    it('SC-UK-64 — стрелка вниз берёт первый пункт, следующая — второй', (): void => {
        const { keyboard }: ISetup = setup();

        expect(keyboard.press('ArrowDown', ITEMS, [])).toBe(true);
        expect(keyboard.highlightedId()).toBe('rates');

        keyboard.press('ArrowDown', ITEMS, []);

        expect(keyboard.highlightedId()).toBe('saved');
    });

    it('SC-UK-64 — стрелка вправо раскрывает подсвеченную папку, влево сворачивает', (): void => {
        const { keyboard }: ISetup = setup();

        keyboard.press('ArrowDown', ITEMS, []);
        keyboard.press('ArrowDown', ITEMS, []);

        expect(keyboard.press('ArrowRight', ITEMS, expanded(keyboard))).toBe(true);
        expect(expanded(keyboard)).toEqual(['saved']);

        keyboard.press('ArrowLeft', ITEMS, expanded(keyboard));

        expect(expanded(keyboard)).toEqual([]);
    });

    it('SC-UK-64 — стрелка влево сворачивает и папку, раскрытую не клавиатурой', (): void => {
        // Раскрытость приходит ещё от поиска и от активного адреса: свёрнутое помнится отдельно.
        const { keyboard }: ISetup = setup();

        keyboard.press('ArrowDown', ITEMS, ['saved']);
        keyboard.press('ArrowDown', ITEMS, ['saved']);

        expect(expanded(keyboard, ['saved'])).toEqual(['saved']);

        keyboard.press('ArrowLeft', ITEMS, expanded(keyboard, ['saved']));

        expect(expanded(keyboard, ['saved'])).toEqual([]);
    });

    it('SC-UK-64 — стрелка вправо на пункте со ссылкой ничего не раскрывает', (): void => {
        const { keyboard }: ISetup = setup();

        keyboard.press('ArrowDown', ITEMS, []);

        expect(keyboard.press('ArrowRight', ITEMS, [])).toBe(false);
        expect(expanded(keyboard)).toEqual([]);
    });
});

describe('SubMenuKeyboard — Enter, Escape и всё остальное', (): void => {
    it('SC-UK-65 — Enter открывает подсвеченный пункт со ссылкой', (): void => {
        const { keyboard, opened }: ISetup = setup();

        keyboard.press('ArrowDown', ITEMS, []);

        expect(keyboard.press('Enter', ITEMS, [])).toBe(true);
        expect(opened).toHaveBeenCalledTimes(1);
        expect(opened.mock.calls[0][0].id).toBe('rates');
    });

    it('SC-UK-65 — Enter на папке раскрывает её, а не просит открыть', (): void => {
        const { keyboard, opened }: ISetup = setup();

        keyboard.press('ArrowDown', ITEMS, []);
        keyboard.press('ArrowDown', ITEMS, []);

        expect(keyboard.press('Enter', ITEMS, [])).toBe(true);
        expect(expanded(keyboard)).toEqual(['saved']);
        expect(opened).not.toHaveBeenCalled();
    });

    it('SC-UK-65 — Enter без подсветки не открывает ничего', (): void => {
        // Утверждение об отсутствии идёт в паре с положительным: с подсветкой Enter открывает.
        const { keyboard, opened }: ISetup = setup();

        expect(keyboard.press('Enter', ITEMS, [])).toBe(false);
        expect(opened).not.toHaveBeenCalled();

        keyboard.press('ArrowDown', ITEMS, []);
        keyboard.press('Enter', ITEMS, []);

        expect(opened).toHaveBeenCalledTimes(1);
    });

    it('SC-UK-65 — Escape просит стереть запрос и снимает всё, что наделала клавиатура', (): void => {
        const { keyboard, cleared }: ISetup = setup();

        keyboard.press('ArrowDown', ITEMS, []);
        keyboard.press('ArrowDown', ITEMS, []);
        keyboard.press('ArrowRight', ITEMS, []);

        expect(keyboard.press('Escape', ITEMS, [])).toBe(true);
        expect(cleared).toHaveBeenCalledTimes(1);
        expect(keyboard.highlightedId()).toBeNull();
        expect(expanded(keyboard)).toEqual([]);
    });

    it('SC-UK-66 — буква полю не мешает: клавиша не съедена', (): void => {
        // Съеденная клавиша отменяет умолчание, и поле перестало бы принимать набор.
        const { keyboard }: ISetup = setup();

        expect(keyboard.press('а', ITEMS, [])).toBe(false);
        expect(keyboard.press(' ', ITEMS, [])).toBe(false);
        expect(keyboard.press('Backspace', ITEMS, [])).toBe(false);
    });

    it('SC-UK-66 — стрелки между буквами подсветку не теряют', (): void => {
        const { keyboard }: ISetup = setup();

        keyboard.press('ArrowDown', ITEMS, []);
        keyboard.press('к', ITEMS, []);

        expect(keyboard.highlightedId()).toBe('rates');
    });
});
