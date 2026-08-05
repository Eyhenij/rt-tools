import { BooleanInput } from '@angular/cdk/coercion';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
    afterNextRender,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChildren,
    DestroyRef,
    ElementRef,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    Signal,
    signal,
    viewChild,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { debounceTime, fromEvent } from 'rxjs';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtIconComponent } from '../icon/rt-icon.component';
import { RtTooltipDirective } from '../tooltip/rt-tooltip.directive';
import { RtTabDirective } from './rt-tab.directive';
import { RtTabsControlDirective } from './rt-tabs-control.directive';
import { IRtTabs } from './rt-tabs.model';

/** Шаг ручной прокрутки полосы вкладок за один тик удержания стрелки (px). */
const SCROLL_STEP: number = 12;

/** Интервал тика прокрутки при зажатой стрелке (мс). */
const SCROLL_TICK_MS: number = 15;

/** Дебаунс пересчёта видимости стрелок прокрутки на resize/scroll (мс). */
const REST_DEBOUNCE_MS: number = 50;

const BEM_BLOCK: string = 'rt-tabs';

type IScrollDirection = 'before' | 'after';

/**
 * Полоса вкладок с проекцией контента. Вкладки декларируются через
 * `<ng-template rtTab="id" label="…">…</ng-template>` (см. {@link RtTabDirective}),
 * собираются `contentChildren` и рендерятся как header-кнопки + активная панель.
 * Опциональные header-контролы — через `[rtTabsControl]`.
 *
 * Компонент "controlled-ish": активная вкладка берётся из `activeId` (если
 * задан), иначе — из внутреннего выбора, иначе — первая доступная. Клик/клавиша
 * эмиттят `activeIdChange`; синхронизацию `activeId` оставляем потребителю.
 *
 * Горизонтальная полоса при переполнении прячет вкладки под скролл и показывает
 * стрелки-«хвосты» (`__rest`) с прокруткой по удержанию. Вертикальная ориентация
 * раскладывает вкладки в колонку без стрелок.
 *
 * Доступность: `role="tablist"`/`role="tab"`/`role="tabpanel"`, `aria-selected`,
 * roving `tabindex`, навигация стрелками + Home/End.
 */
@Component({
    selector: 'rt-tabs',
    templateUrl: './rt-tabs.component.html',
    styleUrl: './rt-tabs.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // angular
        NgTemplateOutlet,

        // standalone components / directives
        RtIconComponent,
        RtTooltipDirective,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-tabs--direction--horizontal]': "direction() === 'horizontal'",
        '[class.rt-tabs--direction--vertical]': "direction() === 'vertical'",
    },
})
export class RtTabsComponent {
    /** `Window` через `DOCUMENT` (SSR-safe: `defaultView` может быть `null`). */
    readonly #win: Window | null = inject(DOCUMENT).defaultView;

    /** Все задекларированные вкладки (включая скрытые). */
    protected readonly tabs: Signal<readonly RtTabDirective[]> = contentChildren(RtTabDirective);

    /** Все header-контролы. */
    protected readonly controls: Signal<readonly RtTabsControlDirective[]> = contentChildren(RtTabsControlDirective);

    /** Видимые вкладки (без `hidden`). */
    protected readonly visibleTabs: Signal<readonly RtTabDirective[]> = computed((): readonly RtTabDirective[] =>
        this.tabs().filter((tab: RtTabDirective): boolean => !tab.hidden())
    );

    protected readonly leftControls: Signal<readonly RtTabsControlDirective[]> = computed((): readonly RtTabsControlDirective[] =>
        this.controls().filter((c: RtTabsControlDirective): boolean => c.side() === 'left')
    );

    protected readonly rightControls: Signal<readonly RtTabsControlDirective[]> = computed((): readonly RtTabsControlDirective[] =>
        this.controls().filter((c: RtTabsControlDirective): boolean => c.side() === 'right')
    );

    /**
     * Эффективный id активной вкладки. Приоритет: контролируемый `activeId` →
     * внутренний выбор → первая доступная. Кандидат валидируется по множеству
     * видимых незаблокированных вкладок, поэтому корректно реагирует на
     * асинхронную загрузку/смену набора вкладок.
     */
    protected readonly selectedId: Signal<IRtTabs.Id | null> = computed((): IRtTabs.Id | null => {
        const enabled: readonly RtTabDirective[] = this.visibleTabs().filter((tab: RtTabDirective): boolean => !tab.disabled());
        const candidate: IRtTabs.Id | null = this.activeId() ?? this.#internalId();
        const candidateValid: boolean = candidate !== null && enabled.some((tab: RtTabDirective): boolean => tab.id() === candidate);

        let result: IRtTabs.Id | null;
        if (candidateValid) {
            result = candidate;
        } else if (enabled.length) {
            result = enabled[0].id();
        } else {
            result = null;
        }

        return result;
    });

    /** Активная вкладка целиком (для рендера панели). */
    protected readonly activeTab: Signal<RtTabDirective | null> = computed(
        (): RtTabDirective | null => this.visibleTabs().find((tab: RtTabDirective): boolean => tab.id() === this.selectedId()) ?? null
    );

    /** Видны ли стрелки прокрутки слева/справа (только горизонтальная полоса). */
    protected readonly restBeforeVisible: WritableSignal<boolean> = signal(false);
    protected readonly restAfterVisible: WritableSignal<boolean> = signal(false);

    protected readonly tabListRef: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>('tabList');

    /** Контролируемый активный id. `null` — компонент сам выбирает первую вкладку. */
    public readonly activeId: InputSignal<IRtTabs.Id | null> = input<IRtTabs.Id | null>(null);

    /** Ориентация полосы. */
    public readonly direction: InputSignal<IRtTabs.Direction> = input<IRtTabs.Direction>('horizontal');

    /** Растягивать вкладки на всю ширину полосы. */
    public readonly stretch: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Скроллить область контента при переполнении. */
    public readonly contentScrollable: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });

    /** Эмиттит id вкладки при её выборе (клик/клавиатура). */
    public readonly activeIdChange: OutputEmitterRef<IRtTabs.Id> = output<IRtTabs.Id>();

    /** Внутренний выбор (uncontrolled-ветка). */
    readonly #internalId: WritableSignal<IRtTabs.Id | null> = signal<IRtTabs.Id | null>(null);

    /** Хэндл интервала прокрутки по удержанию стрелки. */
    #scrollIntervalId: number | null = null;

    constructor() {
        if (this.#win) {
            fromEvent(this.#win, 'resize')
                .pipe(debounceTime(REST_DEBOUNCE_MS), takeUntilDestroyed())
                .subscribe((): void => this.#updateRestVisibility());
        }

        afterNextRender((): void => this.#updateRestVisibility());

        // Снимаем hold-scroll интервал при уничтожении: если компонент разрушить
        // с зажатой стрелкой (pointerdown без pointerup), интервал остался бы жив.
        inject(DestroyRef).onDestroy((): void => this.#clearScrollInterval());
    }

    protected selectTab(id: IRtTabs.Id): void {
        const target: RtTabDirective | undefined = this.visibleTabs().find((tab: RtTabDirective): boolean => tab.id() === id);

        if (!target || target.disabled()) {
            return;
        }

        this.#internalId.set(id);
        this.activeIdChange.emit(id);
        this.#scrollTabIntoView(id);
    }

    /** Навигация по вкладкам с клавиатуры (automatic activation). */
    protected onTabKeydown(event: KeyboardEvent): void {
        const enabled: readonly RtTabDirective[] = this.visibleTabs().filter((tab: RtTabDirective): boolean => !tab.disabled());

        if (!enabled.length) {
            return;
        }

        const isVertical: boolean = this.direction() === 'vertical';
        const nextKey: string = isVertical ? 'ArrowDown' : 'ArrowRight';
        const prevKey: string = isVertical ? 'ArrowUp' : 'ArrowLeft';
        const currentIndex: number = enabled.findIndex((tab: RtTabDirective): boolean => tab.id() === this.selectedId());

        // Карта клавиша → целевой индекс (без if/else-if цепочки).
        const moveByKey: ReadonlyMap<string, number> = new Map<string, number>([
            [nextKey, (currentIndex + 1) % enabled.length],
            [prevKey, (currentIndex - 1 + enabled.length) % enabled.length],
            ['Home', 0],
            ['End', enabled.length - 1],
        ]);

        const targetIndex: number | undefined = moveByKey.get(event.key);

        if (targetIndex === undefined) {
            return;
        }

        event.preventDefault();
        const targetId: IRtTabs.Id = enabled[targetIndex].id();
        this.selectTab(targetId);
        this.#focusTab(targetId);
    }

    /** Старт прокрутки полосы по удержанию ЛКМ на стрелке. */
    protected onRestPointerDown(direction: IScrollDirection, event: MouseEvent): void {
        if (event.button !== 0 || this.#scrollIntervalId !== null || !this.#win) {
            return;
        }

        this.#scrollIntervalId = this.#win.setInterval((): void => {
            this.#scrollStep(direction);
            this.#updateRestVisibility();
        }, SCROLL_TICK_MS);
    }

    protected onRestPointerUp(): void {
        this.#clearScrollInterval();
    }

    protected onTabListScroll(): void {
        this.#updateRestVisibility();
    }

    #clearScrollInterval(): void {
        if (this.#win && this.#scrollIntervalId !== null) {
            this.#win.clearInterval(this.#scrollIntervalId);
            this.#scrollIntervalId = null;
        }
    }

    #scrollStep(direction: IScrollDirection): void {
        const list: HTMLElement | undefined = this.tabListRef()?.nativeElement;
        if (!list) {
            return;
        }

        const scrolledLeft: number = list.scrollLeft;
        const scrolledRight: number = list.scrollWidth - list.scrollLeft - list.clientWidth;
        const remaining: number = direction === 'before' ? scrolledLeft : scrolledRight;

        if (remaining > 0) {
            list.scrollBy(direction === 'before' ? -SCROLL_STEP : SCROLL_STEP, 0);
        }

        if (remaining - SCROLL_STEP <= 0) {
            this.#clearScrollInterval();
        }
    }

    #updateRestVisibility(): void {
        const list: HTMLElement | undefined = this.tabListRef()?.nativeElement;

        if (!list || this.direction() !== 'horizontal') {
            this.restBeforeVisible.set(false);
            this.restAfterVisible.set(false);
            return;
        }

        const scrolledRight: number = list.scrollWidth - list.scrollLeft - list.clientWidth;

        this.restBeforeVisible.set(list.scrollLeft > 0);
        // 1px — погрешность субпиксельного scrollWidth
        this.restAfterVisible.set(scrolledRight > 1);
    }

    #scrollTabIntoView(id: IRtTabs.Id): void {
        const list: HTMLElement | undefined = this.tabListRef()?.nativeElement;
        const tab: HTMLElement | null | undefined = list?.querySelector<HTMLElement>(`[data-tabid="${id}"]`);

        if (!list || !tab) {
            return;
        }

        const viewLeft: number = list.scrollLeft;
        const viewRight: number = list.scrollLeft + list.clientWidth;

        if (tab.offsetLeft < viewLeft) {
            list.scrollTo({ left: tab.offsetLeft });
        } else if (tab.offsetLeft + tab.offsetWidth > viewRight) {
            list.scrollTo({ left: tab.offsetLeft + tab.offsetWidth - list.clientWidth });
        } else {
            // вкладка целиком в зоне видимости — прокрутка не нужна
        }
    }

    #focusTab(id: IRtTabs.Id): void {
        const list: HTMLElement | undefined = this.tabListRef()?.nativeElement;
        list?.querySelector<HTMLElement>(`[data-tabid="${id}"]`)?.focus();
    }
}
