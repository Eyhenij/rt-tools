import { computed, signal, Signal, WritableSignal } from '@angular/core';

import { rtScrollActiveOptionIntoView } from './rt-active-option';

/** Клавиши, которыми открывается закрытый выбор из списка. */
const OPEN_KEYS: ReadonlySet<string> = new Set<string>(['ArrowDown', 'ArrowUp', 'Enter', ' ']);

/** Что делать по клавише в открытом списке. `none` — клавиша не списка, её не трогают. */
export type TRtOptionListAction = 'next' | 'previous' | 'choose' | 'close' | 'side' | 'none';

/** Чем поле отличается от соседних: число опций, отключённые, клавиши выбора, боковые стрелки. */
export interface IRtOptionListConfig {
    /** Идентификатор панели: из него собирается id опции для `aria-activedescendant`. */
    readonly panelId: () => string;
    readonly isOpen: () => boolean;
    readonly count: () => number;
    /** Отключённую опцию стрелки проходят. Без функции отключённых нет. */
    readonly isDisabled?: (index: number) => boolean;
    /** Клавиши выбора подсвеченной опции. Пробел выбирает там, где он не печатает. */
    readonly chooseKeys: ReadonlySet<string>;
    /** Работают ли боковые стрелки: у дерева вариантов да. */
    readonly sideKeys: boolean;
}

/**
 * Клавиатура списка вариантов — общая для выбора из списка, множественного выбора и
 * автодополнения. Фокус остаётся на поле, клавиши двигают подсветку, а читалка экрана узнаёт её
 * по `aria-activedescendant`.
 *
 * Создаётся в контексте внедрения — полем семьи: прокрутка к подсвеченной опции живёт эффектом
 * отрисовки. Что делать по выбору, закрытию и боковой стрелке, решает семья.
 */
export class RtOptionList {
    readonly #config: IRtOptionListConfig;

    /** Подсвеченная опция; `-1` — подсветки нет. */
    public readonly activeIndex: WritableSignal<number> = signal<number>(-1);

    /** Идентификатор подсвеченной опции — тот же, что уходит в `aria-activedescendant`. */
    public readonly activeOptionId: Signal<string | null>;

    constructor(config: IRtOptionListConfig) {
        this.#config = config;
        this.activeOptionId = computed((): string | null =>
            config.isOpen() && this.activeIndex() >= 0 ? `${config.panelId()}-opt-${this.activeIndex()}` : null
        );
        rtScrollActiveOptionIntoView(this.activeOptionId);
    }

    /** Открывает ли клавиша закрытый список. */
    public opensBy(key: string): boolean {
        return OPEN_KEYS.has(key);
    }

    /** Что делать по клавише в открытом списке. */
    public actionOf(key: string): TRtOptionListAction {
        if (key === 'ArrowDown') {
            return 'next';
        }
        if (key === 'ArrowUp') {
            return 'previous';
        }
        if (this.#config.chooseKeys.has(key)) {
            return 'choose';
        }
        if (key === 'Escape') {
            return 'close';
        }
        return this.#config.sideKeys && (key === 'ArrowRight' || key === 'ArrowLeft') ? 'side' : 'none';
    }

    /** Ведёт подсветку на шаг вперёд или назад по кругу, мимо отключённых опций. */
    public move(delta: number): void {
        const count: number = this.#config.count();
        if (count === 0) {
            this.activeIndex.set(-1);
            return;
        }
        let index: number = this.activeIndex();
        for (let step: number = 0; step < count; step += 1) {
            index = (index + delta + count) % count;
            if (!this.#config.isDisabled?.(index)) {
                this.activeIndex.set(index);
                return;
            }
        }
    }

    /** Снимает подсветку: список закрыт или набор опций сменился. */
    public reset(): void {
        this.activeIndex.set(-1);
    }
}
