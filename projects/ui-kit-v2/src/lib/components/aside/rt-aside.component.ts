import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import { DOCUMENT } from '@angular/common';
import {
    afterRenderEffect,
    booleanAttribute,
    computed,
    inject,
    input,
    untracked,
    viewChild,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    InputSignal,
    InputSignalWithTransform,
    Signal,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtSpinnerComponent } from '../spinner/rt-spinner.component';
import { RtAsideErrorBoxComponent } from './error-box/rt-aside-error-box.component';

const BEM_BLOCK: string = 'rt-aside';

/**
 * Варианты ширины side-sheet:
 * - `sm` — 400px (`--rt-aside-width-sm`)
 * - `md` — 540px (`--rt-aside-width-md`, дефолт)
 * - `lg` — 720px (`--rt-aside-width-lg`)
 */
export type TRtAsideSize = 'sm' | 'md' | 'lg';

/**
 * Раскладка контентной зоны side-sheet:
 * - `default` — контентная зона сама скроллится при overflow (штатный режим);
 * - `tabs` — контент — это `rt-tabs`: внешняя зона перестаёт быть скроллером,
 *   полоса вкладок прибита, скроллится только контент активной вкладки
 *   (`rt-tabs__content`).
 */
export type TRtAsideContentLayout = 'default' | 'tabs';

/**
 * Презентационный styled-frame для side-sheet.
 *
 * Видимость / backdrop / scroll-block / ESC / slide-in анимация — НЕ внутренняя
 * ответственность компонента. Это обеспечивает CDK Overlay через
 * `RtAsideService.open()`. rt-aside здесь — стилизованная "рамка" с size-вариантами
 * и тремя слотами: `rt-aside-header`, содержимое и `rt-aside-footer`.
 *
 * Содержимое лежит в одной зоне `.rt-aside__content` — она и держит инсет панели,
 * и прокручивается. Пока зоны не было, каждый корневой узел содержимого получал
 * инсет и прокрутку сам по себе: разделы делили высоту панели между собой, а
 * обводка фокуса поля срезалась краем такого мини-скроллера.
 *
 * Семантика — `role="complementary"` (mirror rt-dialog имеет `role="dialog"`,
 * aside — другая роль, side-sheet не обязательно блокирующий).
 *
 * `ViewEncapsulation.None` — стили префиксованы `.rt-aside`, чтобы соседние
 * rt-aside-header / rt-aside-footer работали с одним BEM-блоком без
 * cross-encapsulation хака.
 */
@Component({
    selector: 'rt-aside',
    templateUrl: './rt-aside.component.html',
    styleUrl: './rt-aside.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [BlockDirective, ElemDirective, ModDirective, RtAsideErrorBoxComponent, RtSpinnerComponent],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtAsideComponent {
    readonly #focusTrapFactory: FocusTrapFactory = inject(FocusTrapFactory);
    readonly #document: Document = inject(DOCUMENT);

    #focusTrap: FocusTrap | null = null;
    #restoreFocusTo: HTMLElement | null = null;

    protected readonly frame: Signal<ElementRef<HTMLElement>> = viewChild.required<ElementRef<HTMLElement>>('frame');

    protected readonly hasRequestError: Signal<boolean> = computed(
        (): boolean => this.requestError() !== null && this.requestError() !== undefined
    );

    public readonly size: InputSignal<TRtAsideSize> = input<TRtAsideSize>('md');
    public readonly contentLayout: InputSignal<TRtAsideContentLayout> = input<TRtAsideContentLayout>('default');
    public readonly width: InputSignal<string | null> = input<string | null>(null);
    public readonly ariaLabel: InputSignal<string | null> = input<string | null>(null);

    /**
     * Ошибка неудавшегося запроса. Пока она есть, между шапкой и содержимым стоит блок ошибки с
     * кнопкой копирования; `null` и `undefined` — ошибки нет, любое другое значение её показывает.
     */
    public readonly requestError: InputSignal<unknown> = input<unknown>(null);

    /**
     * Держать Tab внутри панели. При включении фокус уходит на `[cdkFocusInitial]` или первый
     * элемент под Tab, а когда панель уходит или вход гаснет, возвращается туда, где стоял.
     */
    public readonly trapFocus: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Идёт запрос: панель накрыта слоем с крутилкой и помечена занятой. */
    public readonly pending: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    constructor() {
        // После отрисовки: до неё у рамки нет ни полей, ни кнопок, и ловить фокус не на чем.
        afterRenderEffect((): void => {
            const enabled: boolean = this.trapFocus();
            const frame: HTMLElement = this.frame().nativeElement;
            untracked((): void => (enabled ? this.#holdFocus(frame) : this.#releaseFocus()));
        });
        inject(DestroyRef).onDestroy((): void => this.#releaseFocus());
    }

    #holdFocus(frame: HTMLElement): void {
        if (this.#focusTrap !== null) {
            return;
        }
        const focused: Element | null = this.#document.activeElement;
        this.#restoreFocusTo = focused instanceof HTMLElement ? focused : null;
        this.#focusTrap = this.#focusTrapFactory.create(frame);
        void this.#focusTrap.focusInitialElementWhenReady();
    }

    #releaseFocus(): void {
        if (this.#focusTrap === null) {
            return;
        }
        this.#focusTrap.destroy();
        this.#focusTrap = null;
        const restoreTo: HTMLElement | null = this.#restoreFocusTo;
        this.#restoreFocusTo = null;
        if (restoreTo?.isConnected === true) {
            restoreTo.focus();
        }
    }
}
