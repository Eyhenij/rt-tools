import { BooleanInput } from '@angular/cdk/coercion';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
    afterNextRender,
    afterRenderEffect,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChildren,
    DestroyRef,
    ElementRef,
    inject,
    Injector,
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

import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
import { RtTooltipDirective } from '@rt-tools/ui-kit-v2/tooltip';
import { RtTabDirective } from './rt-tab.directive';
import { RtTabsArrowPress, TRtTabsScrollDirection } from './rt-tabs.arrow-press';
import { RtTabsFollow } from './rt-tabs.follow';
import { RtTabsControlDirective } from './rt-tabs-control.directive';
import { IRtTabs } from './rt-tabs.model';
import { RtTabsInk, RtTabsPanels } from './rt-tabs.motion';
import { rtTabsIntoViewTarget, RtTabsScroller } from './rt-tabs.scroll';

/** Дебаунс пересчёта видимости стрелок прокрутки на resize/scroll (мс). */
const REST_DEBOUNCE_MS: number = 50;

const BEM_BLOCK: string = 'rt-tabs';

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
 * стрелки-«хвосты» (`__rest`): нажатие сдвигает полосу на шаг `scrollStep`, удержание
 * прокручивает непрерывно. Стрелки стоят поверх вкладок или, при `scrollArrows="inline"`, в своих
 * местах по краям. Вертикальная ориентация раскладывает вкладки в колонку без стрелок.
 *
 * Смена вкладки движется: полоса выбранной вкладки — один элемент полосы, он переезжает на новую
 * вкладку; панель прежней вкладки уходит в сторону, обратную переходу, новая въезжает следом.
 * Длительности — токены `--rt-tabs-indicator-duration` и `--rt-tabs-panel-duration` или вход
 * `animationDuration`; `prefers-reduced-motion` снимает движение целиком.
 *
 * Доступность: `role="tablist"`/`role="tab"`/`role="tabpanel"`, `aria-selected`,
 * roving `tabindex`, навигация стрелками + Home/End; при `activation="manual"` они только
 * переводят фокус, а вкладку открывают Enter и Space.
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
        '[class.rt-tabs--animating]': 'panels.shift() !== null',
        '[style]': 'panels.durations()',
    },
})
export class RtTabsComponent {
    /** `Window` через `DOCUMENT` (SSR-safe: `defaultView` может быть `null`). */
    readonly #win: Window | null = inject(DOCUMENT).defaultView;

    readonly #host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

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

    /**
     * Вкладка в таб-порядке: та, на которую стрелками перевели фокус в ручном режиме, иначе
     * активная. Фокус на вкладке, которой больше нет или которая отключилась, не держится.
     */
    protected readonly focusId: Signal<IRtTabs.Id | null> = computed((): IRtTabs.Id | null => {
        const focused: IRtTabs.Id | null = this.#focusedId();
        const valid: boolean =
            focused !== null && this.visibleTabs().some((tab: RtTabDirective): boolean => tab.id() === focused && !tab.disabled());

        return valid ? focused : this.selectedId();
    });

    /** Видны ли стрелки прокрутки слева/справа (только горизонтальная полоса). */
    protected readonly restBeforeVisible: WritableSignal<boolean> = signal(false);
    protected readonly restAfterVisible: WritableSignal<boolean> = signal(false);

    /** Полоса шире своего места: в раскладке `inline` по этому признаку встают обе стрелки. */
    protected readonly overflowing: Signal<boolean> = computed((): boolean => this.restBeforeVisible() || this.restAfterVisible());

    protected readonly tabListRef: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>('tabList');

    /** Смена панелей: прежняя уходит в сторону, обратную переходу, новая въезжает следом. */
    protected readonly panels: RtTabsPanels = new RtTabsPanels(
        this.#host,
        this.#win,
        { all: this.tabs, visible: this.visibleTabs, selectedId: this.selectedId },
        {
            active: computed((): RtTabDirective | null => (this.headerOnly() ? null : this.activeTab())),
            // Входы объявлены ниже: на этой строке их ещё нет, и они читаются при каждом обращении.
            duration: (): IRtTabs.AnimationDuration => this.animationDuration(),
            preserve: (): boolean => this.preserveContent(),
        }
    );

    /** Полоса выбранной вкладки: одна на всю полосу, переезжает при смене выбора. */
    protected readonly ink: RtTabsInk = new RtTabsInk(this.#win, this.tabListRef, { visible: this.visibleTabs, active: this.activeTab });

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

    /**
     * Только полоса, без панели: вкладки служат навигацией, а содержимое живёт в другом месте —
     * например, полоса стоит в середине `rt-toolbar`. Панель `role="tabpanel"` не рисуется, и
     * вкладки не ссылаются на неё.
     */
    public readonly headerOnly: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /**
     * Тело вкладки создаётся при первом открытии и дальше живёт скрытым, как у `mat-tab-group` с
     * `preserveContent`: введённое на вкладке переживает уход с неё. Неоткрытая вкладка не создаётся.
     */
    public readonly preserveContent: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Стрелки и Home/End открывают вкладку сразу (`auto`) или только переводят фокус (`manual`). */
    public readonly activation: InputSignal<IRtTabs.Activation> = input<IRtTabs.Activation>('auto');

    /** Стрелки прокрутки поверх вкладок (`overlay`) или в своих местах по краям полосы (`inline`). */
    public readonly scrollArrows: InputSignal<IRtTabs.ScrollArrows> = input<IRtTabs.ScrollArrows>('overlay');

    /** Шаг нажатия на стрелку: 80 px (`fixed`), видимая ширина полосы (`page`) или её треть (`third`), как у Material. */
    public readonly scrollStep: InputSignal<IRtTabs.ScrollStep> = input<IRtTabs.ScrollStep>('fixed');

    /**
     * Длительность движения при смене вкладки — и полосы, и панели, как у `mat-tab-group`: `500`,
     * `'500ms'`, `'0.5s'`; `0` выключает движение. Без входа длительности берутся из токенов.
     */
    public readonly animationDuration: InputSignal<IRtTabs.AnimationDuration> = input<IRtTabs.AnimationDuration>(null);

    /** Таб-стоп открытой панели, как `contentTabIndex` у `mat-tab-group`: `null` — Tab идёт с полосы прямо в поля панели. */
    public readonly contentTabIndex: InputSignal<number | null> = input<number | null>(0);

    /** Эмиттит id вкладки при её выборе (клик/клавиатура). */
    public readonly activeIdChange: OutputEmitterRef<IRtTabs.Id> = output<IRtTabs.Id>();

    /**
     * Просьба закрыть вкладку с `closable`: крестик или Delete на вкладке в фокусе. Набор вкладок
     * держит потребитель — он и убирает вкладку; закрытая активная откатывается на первую доступную.
     */
    public readonly tabClose: OutputEmitterRef<IRtTabs.Id> = output<IRtTabs.Id>();

    readonly #injector: Injector = inject(Injector);

    /** Плавная прокрутка полосы: стрелки и вкладка, встающая в видимую область. */
    readonly #scroller: RtTabsScroller = new RtTabsScroller(this.#win, this.#host, (): ElementRef<HTMLElement> | undefined =>
        this.tabListRef()
    );

    /** Внутренний выбор (uncontrolled-ветка). */
    readonly #internalId: WritableSignal<IRtTabs.Id | null> = signal<IRtTabs.Id | null>(null);

    /** Вкладка, на которую перевели фокус стрелками в ручном режиме; сбрасывается выбором. */
    readonly #focusedId: WritableSignal<IRtTabs.Id | null> = signal<IRtTabs.Id | null>(null);

    /** Нажатие и удержание стрелок прокрутки. */
    readonly #press: RtTabsArrowPress = new RtTabsArrowPress(
        this.#win,
        this.#scroller,
        (): HTMLElement | undefined => this.tabListRef()?.nativeElement,
        (): IRtTabs.ScrollStep => this.scrollStep(),
        (): void => this.#updateRestVisibility()
    );

    /** Вкладки стали шире или уже — полоса снова встаёт к выбранной, пока её не прокрутили рукой. */
    readonly #follow: RtTabsFollow = new RtTabsFollow((): void => this.#scrollToSelected(true));

    /** Вкладка, к которой полоса прокручена последней: второй прокрутки к ней не нужно. */
    #scrolledId: IRtTabs.Id | null = null;

    constructor() {
        if (this.#win) {
            fromEvent(this.#win, 'resize')
                .pipe(debounceTime(REST_DEBOUNCE_MS), takeUntilDestroyed())
                .subscribe((): void => this.#updateRestVisibility());
        }

        afterNextRender((): void => {
            this.#scrollToSelected();
            this.#updateRestVisibility();
        });

        // Смена вкладки извне — входом `activeId` или новым набором вкладок. После клика
        // полоса уже прокручена из `selectTab`, и `#scrolledId` пропускает вторую прокрутку.
        afterRenderEffect((): void => this.#scrollToSelected());

        // Новый набор вкладок — наблюдение за их размерами ставится заново.
        afterRenderEffect((): void => this.#follow.watch(this.tabListRef()?.nativeElement, this.visibleTabs().length));

        // Снимаем hold-scroll интервал при уничтожении: если компонент разрушить
        // с зажатой стрелкой (pointerdown без pointerup), интервал остался бы жив.
        inject(DestroyRef).onDestroy((): void => {
            this.#press.stop();
            this.#follow.stop();
            this.#scroller.stop();
        });
    }

    protected selectTab(id: IRtTabs.Id): void {
        const target: RtTabDirective | undefined = this.visibleTabs().find((tab: RtTabDirective): boolean => tab.id() === id);

        if (!target || target.disabled()) {
            return;
        }

        this.#internalId.set(id);
        this.#focusedId.set(null);
        this.activeIdChange.emit(id);
        this.#follow.follow();
        this.#scrollTabIntoView(id);
    }

    /** Крестик: нажатие не выбирает вкладку; фокус с крестика после закрытия уходит на вкладку, не на страницу. */
    protected onCloseClick(event: MouseEvent, tab: RtTabDirective): void {
        event.stopPropagation();
        this.#close(tab, event.currentTarget instanceof HTMLElement && event.currentTarget.matches(':focus'));
    }

    /**
     * Навигация по вкладкам с клавиатуры. Шаг считается от вкладки в фокусе: в ручном режиме она
     * не совпадает с активной. Enter и Space ловит сама кнопка — они дают click и выбор.
     */
    protected onTabKeydown(event: KeyboardEvent, tab: RtTabDirective): void {
        if (event.key === 'Delete') {
            this.#closeByKey(event, tab);
            return;
        }

        const enabled: readonly RtTabDirective[] = this.visibleTabs().filter((item: RtTabDirective): boolean => !item.disabled());

        if (!enabled.length) {
            return;
        }

        const isVertical: boolean = this.direction() === 'vertical';
        const nextKey: string = isVertical ? 'ArrowDown' : 'ArrowRight';
        const prevKey: string = isVertical ? 'ArrowUp' : 'ArrowLeft';
        const currentIndex: number = enabled.findIndex((item: RtTabDirective): boolean => item.id() === tab.id());

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

        if (this.activation() === 'manual') {
            this.#focusedId.set(targetId);
            this.#scrollTabIntoView(targetId);
        } else {
            this.selectTab(targetId);
        }
        this.#focusTab(targetId);
    }

    /** Нажатие ЛКМ на стрелку: шаг или прокрутка по удержанию — {@link RtTabsArrowPress}. */
    protected onRestPointerDown(direction: TRtTabsScrollDirection, event: MouseEvent): void {
        if (event.button === 0) {
            this.#follow.manual();
            this.#press.down(direction);
        }
    }

    protected onRestPointerUp(): void {
        this.#press.up();
    }

    /** Указатель ушёл со стрелки: прокрутка останавливается, шага нет. */
    protected onRestPointerLeave(): void {
        this.#press.stop();
    }

    protected onTabListScroll(): void {
        this.#updateRestVisibility();
    }

    /**
     * Delete на закрываемой вкладке. Фокус после перерисовки встаёт на активную вкладку: закрытая
     * пропадёт из шапки, и фокус иначе упал бы на страницу.
     */
    #closeByKey(event: KeyboardEvent, tab: RtTabDirective): void {
        if (!tab.showClose()) {
            return;
        }

        event.preventDefault();
        this.#close(tab, true);
    }

    /**
     * Просьба закрыть вкладку. Владелец убирает её из набора; если она была активной, выбор после
     * перерисовки переходит на первую доступную, и об этом сообщает `activeIdChange` — иначе владелец,
     * держащий `activeId`, хранил бы id закрытой вкладки и показывал её содержимое снаружи.
     */
    #close(tab: RtTabDirective, focus: boolean): void {
        const closedId: IRtTabs.Id = tab.id();
        const wasActive: boolean = this.selectedId() === closedId;
        this.tabClose.emit(closedId);

        afterNextRender(
            (): void => {
                const id: IRtTabs.Id | null = this.selectedId();
                if (id === null) {
                    return;
                }
                if (wasActive && id !== closedId) {
                    this.#internalId.set(id);
                    this.activeIdChange.emit(id);
                }
                if (focus) {
                    this.#focusTab(id);
                }
            },
            { injector: this.#injector }
        );
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

    /** `again` — вкладки сменили размер: та же вкладка встаёт на место ещё раз. */
    #scrollToSelected(again: boolean = false): void {
        const id: IRtTabs.Id | null = this.selectedId();

        if (id !== null && (again || id !== this.#scrolledId)) {
            this.#follow.follow();
            this.#scrollTabIntoView(id);
        }
    }

    /**
     * Ставит вкладку в полосу целиком. Стрелки поверх полосы закрывают её края, поэтому вкладка
     * отступает от края на ширину стрелки. Первая прокрутка — сразу: открытая страница не едет.
     */
    #scrollTabIntoView(id: IRtTabs.Id): void {
        const list: HTMLElement | undefined = this.tabListRef()?.nativeElement;
        const tab: HTMLElement | null | undefined = list?.querySelector<HTMLElement>(`[data-tabitem="${id}"]`);

        if (!list || !tab) {
            return;
        }

        const first: boolean = this.#scrolledId === null;
        const rest: HTMLElement | null | undefined = list.parentElement?.querySelector<HTMLElement>('.rt-tabs__rest');
        const inset: number = this.scrollArrows() === 'overlay' ? (rest?.offsetWidth ?? 0) : 0;
        const target: number | null = rtTabsIntoViewTarget(list, tab, inset);
        this.#scrolledId = id;

        if (target !== null && first) {
            this.#scroller.stop();
            list.scrollLeft = target;
        } else if (target !== null) {
            this.#scroller.to(target);
        } else {
            // вкладка целиком в зоне видимости — прокрутка не нужна
        }

        // Сразу — для прокрутки без движения; плавную ведут события прокрутки самой полосы.
        this.#updateRestVisibility();
    }

    #focusTab(id: IRtTabs.Id): void {
        const list: HTMLElement | undefined = this.tabListRef()?.nativeElement;
        // Без прокрутки фокусом: вкладку в видимую область ведёт плавная прокрутка полосы.
        list?.querySelector<HTMLElement>(`[data-tabid="${id}"]`)?.focus({ preventScroll: true });
    }
}
