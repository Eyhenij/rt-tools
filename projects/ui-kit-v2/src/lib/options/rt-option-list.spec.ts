import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { IRtOptionListConfig, RtOptionList } from './rt-option-list';

interface IListHarness {
    readonly list: RtOptionList;
    readonly open: WritableSignal<boolean>;
}

/** Контроллер без компонента: три опции, вторая отключена, список открыт. */
function createList(overrides: Partial<IRtOptionListConfig> = {}): IListHarness {
    const open: WritableSignal<boolean> = signal<boolean>(true);
    const config: IRtOptionListConfig = {
        panelId: (): string => 'panel',
        isOpen: (): boolean => open(),
        count: (): number => 3,
        isDisabled: (index: number): boolean => index === 1,
        chooseKeys: new Set<string>(['Enter', ' ']),
        sideKeys: true,
        edgeKeys: true,
        ...overrides,
    };
    const list: RtOptionList = TestBed.runInInjectionContext((): RtOptionList => new RtOptionList(config));
    return { list, open };
}

describe('RtOptionList', (): void => {
    it('SC-UKV-895 — a closed select opens by an arrow, Enter or Space', (): void => {
        const { list } = createList();

        expect(['ArrowDown', 'ArrowUp', 'Enter', ' '].every((key: string): boolean => list.opensBy(key))).toBe(true);
        expect(list.opensBy('a')).toBe(false);
        expect(list.opensBy('Escape')).toBe(false);
    });

    it('SC-UKV-896 — the arrows wrap and pass over disabled options', (): void => {
        const { list } = createList();

        list.move(1);
        expect(list.activeIndex()).toBe(0);
        list.move(1);
        expect(list.activeIndex()).toBe(2);
        list.move(1);
        expect(list.activeIndex()).toBe(0);
        list.move(-1);
        expect(list.activeIndex()).toBe(2);
    });

    it('SC-UKV-896 — an empty list holds no highlight', (): void => {
        const { list } = createList({ count: (): number => 0 });

        list.move(1);
        expect(list.activeIndex()).toBe(-1);
    });

    it('SC-UKV-897 — Enter chooses, and Space chooses only where it does not type', (): void => {
        const select: RtOptionList = createList().list;
        const autocomplete: RtOptionList = createList({ chooseKeys: new Set<string>(['Enter']), sideKeys: false }).list;

        expect(select.actionOf('Enter')).toBe('choose');
        expect(select.actionOf(' ')).toBe('choose');
        expect(autocomplete.actionOf('Enter')).toBe('choose');
        expect(autocomplete.actionOf(' ')).toBe('none');
    });

    it('SC-UKV-898 — Escape closes the list', (): void => {
        expect(createList().list.actionOf('Escape')).toBe('close');
    });

    it('the arrows of an open list move, and the side arrows reach only a tree', (): void => {
        const select: RtOptionList = createList().list;
        const autocomplete: RtOptionList = createList({ sideKeys: false }).list;

        expect(select.actionOf('ArrowDown')).toBe('next');
        expect(select.actionOf('ArrowUp')).toBe('previous');
        expect(select.actionOf('ArrowRight')).toBe('side');
        expect(autocomplete.actionOf('ArrowLeft')).toBe('none');
        expect(select.actionOf('Tab')).toBe('none');
    });

    it('SC-UKV-899 — the highlighted option is named while the list is open', (): void => {
        const { list, open } = createList({ isDisabled: (): boolean => false });

        list.move(1);
        list.move(1);
        expect(list.activeOptionId()).toBe('panel-opt-1');

        open.set(false);
        expect(list.activeOptionId()).toBeNull();

        open.set(true);
        list.reset();
        expect(list.activeOptionId()).toBeNull();
    });

    it('SC-UKV-900 — Home and End go to the first and the last enabled option', (): void => {
        const { list } = createList({ count: (): number => 4, isDisabled: (index: number): boolean => index === 0 });
        const autocomplete: RtOptionList = createList({ edgeKeys: false }).list;

        expect(list.actionOf('End')).toBe('last');
        expect(list.actionOf('Home')).toBe('first');
        list.last();
        expect(list.activeIndex()).toBe(3);
        list.first();
        expect(list.activeIndex()).toBe(1);
        expect(autocomplete.actionOf('Home')).toBe('none');
        expect(autocomplete.actionOf('End')).toBe('none');
    });
});
