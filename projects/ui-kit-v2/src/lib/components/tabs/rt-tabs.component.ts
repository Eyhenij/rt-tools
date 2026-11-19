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
    numberAttribute,
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
import { RtTabsClose } from './rt-tabs.close';
import { RtTabsFollow } from './rt-tabs.follow';
import { rtTabsKeyTargetId, rtTabsSelectedId } from './rt-tabs.keys';
import { rtTabsEnabledIds } from './rt-tabs.logic';
import { RtTabsControlDirective } from './rt-tabs-control.directive';
import { RtTabsContextMenuComponent } from './rt-tabs-context-menu.component';
import { RtTabsMoreComponent } from './rt-tabs-more.component';
import { IRtTabs } from './rt-tabs.model';
import { RT_TABS_MORE_LIMIT, RtTabsMoreRow } from './rt-tabs.more-row';
import { RtTabsInk, RtTabsPanels } from './rt-tabs.motion';
import { RtTabsReveal } from './rt-tabs.reveal';
import { RtTabsScroller } from './rt-tabs.scroll';

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
    // Панель меню рисуется в CDK Overlay и нужна и меню «Ещё», и меню вкладки: свой файл, а не их.
    styleUrls: ['./rt-tabs.component.scss', './rt-tabs-arrows.scss', './rt-tabs-more-menu.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // angular
        NgTemplateOutlet,

        // standalone components / directives
        RtIconComponent,
        RtTabsContextMenuComponent,
        RtTabsMoreComponent,
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
        '[class.rt-tabs--dense]': 'dense()',
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
    protected readonly selectedId: Signal<IRtTabs.Id | null> = computed((): IRtTabs.Id | null =>
        rtTabsSelectedId(rtTabsEnabledIds(this.visibleTabs()), this.activeId() ?? this.#internalId())
    );

    /** Режим «Ещё» работает только в горизонтальной полосе. */
    protected readonly moreMode: Signal<boolean> = computed((): boolean => this.overflow() === 'more' && this.direction() === 'horizontal');

    /** Активная вкладка целиком (для рендера панели). */
    protected readonly activeTab: Signal<RtTabDirective | null> = computed(
        (): RtTabDirective | null => this.visibleTabs().find((tab: RtTabDirective): boolean => tab.id() === this.selectedId()) ?? null
    );

    /**
     * Вкладка в таб-порядке: та, на которую стрелками перевели фокус в ручном режиме, иначе
     * активная. Фокус на вкладке, которой больше нет, которая отключилась или ушла в меню, не держится.
     */
    protected readonly focusId: Signal<IRtTabs.Id | null> = computed((): IRtTabs.Id | null => {
        const focused: IRtTabs.Id | null = this.#focusedId();
        const valid: boolean =
            focused !== null && this.more.rowTabs().some((tab: RtTabDirective): boolean => tab.id() === focused && !tab.disabled());

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

    /** Ряд и меню режима «Ещё». */
    protected readonly more: RtTabsMoreRow = new RtTabsMoreRow(this.#win, this.tabListRef, {
        enabled: this.moreMode,
        visible: this.visibleTabs,
        selectedId: this.selectedId,
        limit: computed((): number => this.moreLimit()),
    });

    /** Полоса выбранной вкладки: одна на всю полосу, переезжает при смене выбора. */
    protected readonly ink: RtTabsInk = new RtTabsInk(this.#win, this.tabListRef, { visible: this.more.rowTabs, active: this.activeTab });

    /** Контролируемый активный id. `null` — компонент сам выбирает первую вкладку. */
    public readonly activeId: InputSignal<IRtTabs.Id | null> = input<IRtTabs.Id | null>(null);

    /** Ориентация полосы. */
    public readonly direction: InputSignal<IRtTabs.Direction> = input<IRtTabs.Direction>('horizontal');

    /** Растягивать вкладки на всю ширину полосы. */
    public readonly stretch: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Плотные вкладки: отступ 8 по бокам, чтобы в узкую панель влезло больше вкладок */
    public readonly dense: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** У каких вкладок ряда виден крестик. Строки меню «Ещё» его показывают всегда. */
    public readonly closeOn: InputSignal<IRtTabs.CloseOn> = input<IRtTabs.CloseOn>('all');

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

    /** Вкладки не встают: полоса прокручивается (`scroll`) или лишние уходят в меню «Ещё» (`more`). */
    public readonly overflow: InputSignal<IRtTabs.Overflow> = input<IRtTabs.Overflow>('scroll');

    /** Предел вкладок в ряду «Ещё» вместе с закреплёнными; выбранная из меню встаёт на место последней. */
    public readonly moreLimit: InputSignalWithTransform<number, unknown> = input<number, unknown>(RT_TABS_MORE_LIMIT, {
        transform: (value: unknown): number => numberAttribute(value, RT_TABS_MORE_LIMIT),
    });

    /**
     * Нижняя шторка на телефоне: панель «Ещё» и меню вкладки открываются в ней. Включена по умолчанию;
     * `false` оставляет их у вкладок на любой ширине.
     */
    public readonly sheet: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });

    /** Стрелки прокрутки поверх вкладок (`overlay`) или в своих местах по краям полосы (`inline`). */
    public readonly scrollArrows: InputSignal<IRtTabs.ScrollArrows> = input<IRtTabs.ScrollArrows>('overlay');

    /** Вид стрелки: квадрат во всю высоту полосы (`block`) или компактная кнопка 24 (`compact`). */
    public readonly arrowLook: InputSignal<IRtTabs.ArrowLook> = input<IRtTabs.ArrowLook>('block');

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

    /** Плавная прокрутка полосы: стрелки и вкладка, встающая в видимую область. */
    readonly #scroller: RtTabsScroller = new RtTabsScroller(this.#win, this.#host, (): ElementRef<HTMLElement> | undefined =>
        this.tabListRef()
    );

    /** Внутренний выбор (uncontrolled-ветка). */
    readonly #internalId: WritableSignal<IRtTabs.Id | null> = signal<IRtTabs.Id | null>(null);

    /** Вкладка, на которую перевели фокус стрелками в ручном режиме; сбрасывается выбором. */
    readonly #focusedId: WritableSignal<IRtTabs.Id | null> = signal<IRtTabs.Id | null>(null);

    /** Закрытие вкладки: крестик и Delete; куда уходят выбор и фокус — {@link RtTabsClose}. */
    readonly #closer: RtTabsClose = new RtTabsClose({
        injector: inject(Injector),
        selectedId: (): IRtTabs.Id | null => this.selectedId(),
        closeOn: (): IRtTabs.CloseOn => this.closeOn(),
        request: (id: IRtTabs.Id): void => this.tabClose.emit(id),
        adopt: (id: IRtTabs.Id): void => {
            this.#internalId.set(id);
            this.activeIdChange.emit(id);
        },
        focus: (id: IRtTabs.Id): void => this.#focusTab(id),
    });

    /** Нажатие и удержание стрелок прокрутки. */
    readonly #press: RtTabsArrowPress = new RtTabsArrowPress(
        this.#win,
        this.#scroller,
        (): HTMLElement | undefined => this.tabListRef()?.nativeElement,
        (): IRtTabs.ScrollStep => this.scrollStep(),
        (): void => this.#reveal.updateRest()
    );

    /** Вкладки стали шире или уже — полоса снова встаёт к выбранной, пока её не прокрутили рукой. */
    readonly #follow: RtTabsFollow = new RtTabsFollow((): void => this.#reveal.toSelected(true));

    /** Показ выбранной вкладки в полосе и видимость стрелок прокрутки — {@link RtTabsReveal}. */
    readonly #reveal: RtTabsReveal = new RtTabsReveal({
        scroller: this.#scroller,
        follow: this.#follow,
        list: (): HTMLElement | undefined => this.tabListRef()?.nativeElement,
        selectedId: (): IRtTabs.Id | null => this.selectedId(),
        moreMode: (): boolean => this.moreMode(),
        horizontal: (): boolean => this.direction() === 'horizontal',
        overlayArrows: (): boolean => this.scrollArrows() === 'overlay',
        shown: (shown: IRtTabs.RestShown): void => {
            this.restBeforeVisible.set(shown.before);
            this.restAfterVisible.set(shown.after);
        },
    });

    constructor() {
        if (this.#win) {
            fromEvent(this.#win, 'resize')
                .pipe(debounceTime(REST_DEBOUNCE_MS), takeUntilDestroyed())
                .subscribe((): void => this.#reveal.updateRest());
        }

        afterNextRender((): void => {
            this.#reveal.toSelected();
            this.#reveal.updateRest();
        });

        // Смена вкладки извне — входом `activeId` или новым набором вкладок. После клика
        // полоса уже прокручена из `selectTab`, и `RtTabsReveal` пропускает вторую прокрутку.
        afterRenderEffect((): void => this.#reveal.toSelected());

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
        this.#reveal.intoView(id);
    }

    /** Крестик: нажатие не выбирает вкладку; фокус с крестика после закрытия уходит на вкладку, не на страницу. */
    protected onCloseClick(event: MouseEvent, tab: RtTabDirective): void {
        event.stopPropagation();
        this.#closer.close(tab, event.currentTarget instanceof HTMLElement && event.currentTarget.matches(':focus'));
    }

    /** Крестик строки меню: фокус остаётся на месте, выбор не меняется. */
    protected onMoreClose(tab: RtTabDirective): void {
        this.#closer.close(tab, false);
    }

    /**
     * Навигация по вкладкам с клавиатуры. Шаг считается от вкладки в фокусе: в ручном режиме она
     * не совпадает с активной. Enter и Space ловит сама кнопка — они дают click и выбор.
     */
    protected onTabKeydown(event: KeyboardEvent, tab: RtTabDirective): void {
        if (event.key === 'Delete') {
            this.#closer.byKey(event, tab);
            return;
        }

        const enabled: readonly IRtTabs.Id[] = rtTabsEnabledIds(this.more.rowTabs());
        const targetId: IRtTabs.Id | undefined = rtTabsKeyTargetId(enabled, tab.id(), event.key, this.direction());

        if (targetId === undefined) {
            return;
        }

        event.preventDefault();

        if (this.activation() === 'manual') {
            this.#focusedId.set(targetId);
            this.#reveal.intoView(targetId);
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
        this.#reveal.updateRest();
    }

    #focusTab(id: IRtTabs.Id): void {
        const list: HTMLElement | undefined = this.tabListRef()?.nativeElement;
        // Без прокрутки фокусом: вкладку в видимую область ведёт плавная прокрутка полосы.
        list?.querySelector<HTMLElement>(`[data-tabid="${id}"]`)?.focus({ preventScroll: true });
    }
}
