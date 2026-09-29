import { signal, Signal, WritableSignal } from '@angular/core';

import { stepSideMenuHighlight, walkSideMenuItems } from './rt-side-menu.logic';
import { IRtSideMenu } from './rt-side-menu.model';

/** Что клавиатура просит у меню: открыть пункт и стереть запрос. Сама она ни того, ни другого не умеет. */
export interface IRtSubMenuKeyboardHooks {
    open: (item: IRtSideMenu.Item) => void;
    clearQuery: () => void;
}

/**
 * Ходьба по подменю с клавиатуры. Проверяется вызовом, без подъёма компонента.
 *
 * Клавиши слушает поле поиска: фокус из поля не уходит, и между стрелками работает набор текста.
 * Съедаются только клавиши ходьбы — на остальные ответ отрицательный, иначе поле перестанет
 * принимать буквы. Подсветка держится по номеру пункта: видимый список пересобирается на каждую
 * букву запроса.
 */
export class RtSubMenuKeyboard {
    readonly #highlightedId: WritableSignal<string | number | null> = signal(null);
    /**
     * Папки, раскрытые и свёрнутые стрелками. Два списка: раскрытость приходит ещё и от поиска и от
     * активного адреса, и свернуть такую папку можно, только помня об этом отдельно.
     */
    readonly #openedIds: WritableSignal<Array<string | number>> = signal([]);
    readonly #closedIds: WritableSignal<Array<string | number>> = signal([]);
    readonly #hooks: IRtSubMenuKeyboardHooks;

    public readonly highlightedId: Signal<string | number | null> = this.#highlightedId.asReadonly();
    public readonly openedIds: Signal<Array<string | number>> = this.#openedIds.asReadonly();
    public readonly closedIds: Signal<Array<string | number>> = this.#closedIds.asReadonly();

    constructor(hooks: IRtSubMenuKeyboardHooks) {
        this.#hooks = hooks;
    }

    /** Всё, что клавиатура успела наделать, снимается: набран новый запрос или подменю закрылось. */
    public reset(): void {
        this.#highlightedId.set(null);
        this.#openedIds.set([]);
        this.#closedIds.set([]);
    }

    /** Нажата клавиша в поле поиска. Отвечает, съедена ли она: только съеденная отменяет умолчание. */
    public press(key: string, items: ReadonlyArray<IRtSideMenu.Item>, expandedIds: ReadonlyArray<string | number>): boolean {
        const walk: IRtSideMenu.Item[] = walkSideMenuItems(items, expandedIds);
        const current: IRtSideMenu.Item | null = walk.find((item: IRtSideMenu.Item): boolean => item.id === this.#highlightedId()) ?? null;

        switch (key) {
            case 'ArrowDown':
            case 'ArrowUp':
                this.#highlightedId.set(stepSideMenuHighlight(walk, this.#highlightedId(), key === 'ArrowDown' ? 1 : -1));

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
    #enter(item: IRtSideMenu.Item | null): boolean {
        if (item === null) {
            return false;
        }

        if (item.link) {
            this.#hooks.open(item);

            return true;
        }

        return this.#setFolderOpen(item, true);
    }

    #setFolderOpen(item: IRtSideMenu.Item | null, open: boolean): boolean {
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
