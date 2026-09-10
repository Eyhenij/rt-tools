import {
    highlightedTitles,
    hoverFirstItem,
    installFontsStub,
    ISetup,
    menu,
    NESTED_ITEMS,
    pressKeyInSearch,
    setup,
    subItemTitles,
    typeInSearch,
} from './side-menu.harness';

beforeAll(installFontsStub);

describe('RtuiSideMenuComponent — клавиатура в подменю', () => {
    it('SC-UK-64 — стрелки ходят по отобранному списку', () => {
        const { fixture }: ISetup = setup('hover', [], false, NESTED_ITEMS);

        hoverFirstItem(fixture);
        pressKeyInSearch(fixture, 'ArrowDown');

        expect(highlightedTitles(fixture)).toEqual(['Курсы валют']);

        pressKeyInSearch(fixture, 'ArrowDown');

        expect(highlightedTitles(fixture)).toEqual(['Сохранённое']);
    });

    it('SC-UK-64 — стрелка вправо раскрывает подсвеченную папку', () => {
        const { fixture }: ISetup = setup('hover', [], false, NESTED_ITEMS);

        hoverFirstItem(fixture);
        pressKeyInSearch(fixture, 'ArrowDown');
        pressKeyInSearch(fixture, 'ArrowDown');
        pressKeyInSearch(fixture, 'ArrowRight');

        expect(subItemTitles(fixture)).toEqual(['Курсы валют', 'Сохранённое', 'Круговая диаграмма', 'Столбцы по месяцам']);
    });

    it('SC-UK-65 — Enter открывает подсвеченный пункт', () => {
        const { fixture }: ISetup = setup('hover', [], false, NESTED_ITEMS);
        const clicks: jest.Mock = jest.fn();

        hoverFirstItem(fixture);
        menu(fixture).clickSubMenuAction.subscribe(clicks);
        pressKeyInSearch(fixture, 'ArrowDown');
        pressKeyInSearch(fixture, 'Enter');

        expect(clicks).toHaveBeenCalledTimes(1);
        expect(clicks.mock.calls[0][0].item.id).toBe('rates');
    });

    it('SC-UK-65 — Escape чистит запрос', () => {
        const { fixture }: ISetup = setup('hover', [], false, NESTED_ITEMS);

        hoverFirstItem(fixture);
        typeInSearch(fixture, 'круговая');

        expect(menu(fixture).subMenuQuery()).toBe('круговая');

        pressKeyInSearch(fixture, 'Escape');

        expect(menu(fixture).subMenuQuery()).toBe('');
    });

    it('SC-UK-66 — буква уходит полю нетронутой, а стрелка съедается', () => {
        const { fixture }: ISetup = setup('hover', [], false, NESTED_ITEMS);

        hoverFirstItem(fixture);

        expect(pressKeyInSearch(fixture, 'к').defaultPrevented).toBe(false);
        expect(pressKeyInSearch(fixture, 'ArrowDown').defaultPrevented).toBe(true);
    });
});
