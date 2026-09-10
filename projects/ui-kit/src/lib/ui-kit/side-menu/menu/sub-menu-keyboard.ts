import { signal, Signal, WritableSignal } from '@angular/core';

import { stepSubMenuHighlight, walkSubMenuItems } from '../side-menu.logic';
import { ISideMenu } from '../side-menu.types';

/** Что клавиатура просит у меню: открыть пункт и стереть запрос. Сама она ни того, ни другого не умеет. */
export interface ISubMenuKeyboardHooks {
    open: (item: ISideMenu.Item) => void;
    clearQuery: () => void;
}

/**
 * Ходьба по подменю с клавиатуры.
 *
 * Лежит отдельно от меню по двум причинам. Проверяется вызовом, без подъёма компонента: решение о
 * том, куда уходит подсветка и что делает клавиша, — чистый расчёт. И файл меню уже почти упёрся в
 * предел длины, а состояния здесь три.
 *
 * Клавиши слушает поле поиска, а не список: фокус из поля не уходит, поэтому между нажатиями
 * стрелок продолжает работать набор текста. Съедаются только те клавиши, по которым идёт ходьба, —
 * на остальные ответ отрицательный и без отмены умолчания, иначе поле перестанет принимать буквы.
 *
 * Подсветка держится по номеру пункта, а не по ссылке на него и не по месту в списке: видимый
 * список пересобирается на каждую букву запроса, и всё, что лежит вне модели пункта, такой
 * пересборки не переживает.
 */
export class SubMenuKeyboard {
    readonly #highlightedId: WritableSignal<string | number | null> = signal(null);
    /**
     * Папки, раскрытые и свёрнутые стрелками. Два списка, а не один: раскрытость приходит ещё и от
     * поиска, и от активного адреса — свернуть такую папку можно, только помня об этом отдельно.
     */
    readonly #openedIds: WritableSignal<Array<string | number>> = signal([]);
    readonly #closedIds: WritableSignal<Array<string | number>> = signal([]);
    readonly #hooks: ISubMenuKeyboardHooks;

    public readonly highlightedId: Signal<string | number | null> = this.#highlightedId.asReadonly();
    public readonly openedIds: Signal<Array<string | number>> = this.#openedIds.asReadonly();
    public readonly closedIds: Signal<Array<string | number>> = this.#closedIds.asReadonly();

    constructor(hooks: ISubMenuKeyboardHooks) {
        this.#hooks = hooks;
    }

    /** Всё, что клавиатура успела наделать, снимается: набран новый запрос или подменю закрылось. */
    public reset(): void {
        this.#highlightedId.set(null);
        this.#openedIds.set([]);
        this.#closedIds.set([]);
    }

    /** Нажата клавиша в поле поиска. Отвечает, съедена ли она: только съеденная отменяет умолчание. */
    public press(key: string, items: ReadonlyArray<ISideMenu.Item>, expandedIds: ReadonlyArray<string | number>): boolean {
        const walk: ISideMenu.Item[] = walkSubMenuItems(items, expandedIds);
        const current: ISideMenu.Item | null = walk.find((item: ISideMenu.Item): boolean => item.id === this.#highlightedId()) ?? null;

        switch (key) {
            case 'ArrowDown':
            case 'ArrowUp':
                this.#highlightedId.set(stepSubMenuHighlight(walk, this.#highlightedId(), key === 'ArrowDown' ? 1 : -1));

                return true;
            case 'ArrowRight':
                return this.#setFolderOpen(current, true);
            case 'ArrowLeft':
                return this.#setFolderOpen(current, false);
            case 'Enter':
                return this.#enter(current);
            case 'Escape':
                this.reset();
                this.#hooks.clearQuery();

                return true;
            default:
                return false;
        }
    }

    /** Enter открывает подсвеченное: у пункта со ссылкой это переход, у папки — раскрытие. */
    #enter(item: ISideMenu.Item | null): boolean {
        if (item === null) {
            return false;
        }

        if (item.link) {
            this.#hooks.open(item);

            return true;
        }

        return this.#setFolderOpen(item, true);
    }

    #setFolderOpen(item: ISideMenu.Item | null, open: boolean): boolean {
        if (item === null || !item.submenu?.length) {
            return false;
        }

        const without: (ids: Array<string | number>) => Array<string | number> = (ids: Array<string | number>): Array<string | number> =>
            ids.filter((id: string | number): boolean => id !== item.id);

        this.#openedIds.update((ids: Array<string | number>): Array<string | number> => (open ? [...without(ids), item.id] : without(ids)));
        this.#closedIds.update((ids: Array<string | number>): Array<string | number> => (open ? without(ids) : [...without(ids), item.id]));

        return true;
    }
}

/**
 * Нажатие строки пункта подменю — того самого узла, который нажимает мышь.
 *
 * Собранное в коде нажатие прошло бы мимо всего, что висит на настоящем: закрытия подменю, ухода
 * просьбы наружу, перехода по адресу. Строка ищется по номеру среди строк панели.
 */
export function pressSubMenuRow(panel: HTMLElement | null, item: ISideMenu.Item): void {
    const rows: HTMLElement[] = Array.from(panel?.querySelectorAll<HTMLElement>('.rtui-side-menu-sub-item') ?? []);

    rows.find((row: HTMLElement): boolean => row.id === String(item.id))?.click();
}
