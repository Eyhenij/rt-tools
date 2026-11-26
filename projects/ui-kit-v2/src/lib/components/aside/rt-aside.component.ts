import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
    afterRenderEffect,
    booleanAttribute,
    computed,
    contentChild,
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
    contentChildren,
    TemplateRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { IRtIcon, RT_KIT_LABELS, rtKitLabel, RtSlotOutletDirective, TRtKitLabelMap } from '@rt-tools/ui-kit-v2/core';
import { RtEmptyStateComponent } from '@rt-tools/ui-kit-v2/empty-state';
import {
    IRtSheetConfirmLabels,
    IRtSheetTemplateContext,
    RtBottomSheetComponent,
    TRtSheetCloseReason,
} from '@rt-tools/ui-kit-v2/bottom-sheet';
import { RtSpinnerComponent } from '@rt-tools/ui-kit-v2/spinner';
import { RtAsideErrorBoxComponent } from './error-box/rt-aside-error-box.component';
import { RtAsideFooterComponent } from './footer/rt-aside-footer.component';
import { RtAsideHeaderComponent } from './header/rt-aside-header.component';
import { RtAsideEmptyDirective } from './rt-aside-empty.directive';
import { RtAsideContentDirective } from './rt-aside-content.directive';
import { RtAsideMainAction } from './rt-aside-main-action';
import { RtAsideNodePlace } from './rt-aside-node-place';
import { RT_ASIDE_SHEET, RtAsideSheet, TRtAsideSheetGesture } from './rt-aside-sheet';
import { RtAsideSheetTabs } from './rt-aside-sheet-tabs';
import { ERtAsideUnsavedOutcome } from './unsaved-dialog/rt-aside-unsaved.logic';

const BEM_BLOCK: string = 'rt-aside';

/**
 * Жест шторки — жест закрытия панели: свайп слушается выключателя нажатия по затемнению, кнопка
 * закрытия своего шаблона идёт как «×» шапки.
 */
const SHEET_GESTURES: Readonly<Record<TRtSheetCloseReason, TRtAsideSheetGesture>> = {
    backdrop: 'backdrop',
    swipe: 'backdrop',
    escape: 'escape',
    close: 'dismiss',
};

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
 * На телефоне (окно до 480 точек) панель, открытая службой кита или правой панелью
 * `rt-container`, рисуется шторкой кита во всю высоту: вид приходит токеном `RT_ASIDE_SHEET` от
 * открывшего, шапка панели встаёт в шапку шторки, главная кнопка подвала — справа в шапку,
 * подвал — в подвал шторки. Шторка объявлена модальным диалогом по имени панели или её заголовку.
 *
 * Семантика — `role="complementary"` (mirror rt-dialog имеет `role="dialog"`,
 * aside — другая роль, side-sheet не обязательно блокирующий). Панель, которая блокирует
 * страницу и держит фокус, включает вход `modal`: рамка объявлена `role="dialog"` с `aria-modal`.
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
    imports: [
        RtSlotOutletDirective,
        NgTemplateOutlet,
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtAsideErrorBoxComponent,
        RtBottomSheetComponent,
        RtEmptyStateComponent,
        RtSpinnerComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtAsideComponent {
    /** Шаблоны тела: рисуются, только пока панель не пуста. */
    protected readonly contents: Signal<readonly RtAsideContentDirective[]> = contentChildren(RtAsideContentDirective);

    readonly #focusTrapFactory: FocusTrapFactory = inject(FocusTrapFactory);
    readonly #doc: Document = inject(DOCUMENT);
    readonly #host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    /** Вид открытия: есть у панели, открытой службой или правой панелью `rt-container`. */
    readonly #sheet: RtAsideSheet | null = inject(RT_ASIDE_SHEET, { optional: true });
    readonly #mainAction: RtAsideMainAction = new RtAsideMainAction();
    readonly #sheetTabs: RtAsideSheetTabs = new RtAsideSheetTabs();
    /** Рамка, шапка и подвал панели в шторке: их места в шторке и возврат в рамку вне её. */
    readonly #sheetFrame: RtAsideNodePlace = new RtAsideNodePlace();
    readonly #sheetHeader: RtAsideNodePlace = new RtAsideNodePlace();
    readonly #sheetFooter: RtAsideNodePlace = new RtAsideNodePlace();

    readonly #t_uiEmptyTitle: Signal<string> = rtKitLabel('uiEmptyTitle');
    readonly #t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    #focusTrap: FocusTrap | null = null;
    #restoreFocusTo: HTMLElement | null = null;
    /** Фокус этого подъёма шторки уже поставлен. */
    #sheetFocused: boolean = false;

    protected readonly bottomSheet: Signal<RtBottomSheetComponent | undefined> = viewChild(RtBottomSheetComponent);
    protected readonly bottomSheetHost: Signal<ElementRef<HTMLElement> | undefined> = viewChild(RtBottomSheetComponent, {
        read: ElementRef,
    });

    /** Ответы вопроса шторки — имена для шаблона. */
    protected readonly outcomes: typeof ERtAsideUnsavedOutcome = ERtAsideUnsavedOutcome;

    protected readonly header: Signal<RtAsideHeaderComponent | undefined> = contentChild(RtAsideHeaderComponent, { descendants: true });
    protected readonly footer: Signal<RtAsideFooterComponent | undefined> = contentChild(RtAsideFooterComponent, { descendants: true });
    protected readonly headerHost: Signal<ElementRef<HTMLElement> | undefined> = contentChild(RtAsideHeaderComponent, {
        descendants: true,
        read: ElementRef,
    });
    protected readonly footerHost: Signal<ElementRef<HTMLElement> | undefined> = contentChild(RtAsideFooterComponent, {
        descendants: true,
        read: ElementRef,
    });
    /** Пустой шаблон шапки и подвала шторки: шторка оставляет под ним место, панель ставит туда свои узлы. */
    protected readonly sheetSlot: Signal<TemplateRef<IRtSheetTemplateContext>> = viewChild.required('sheetSlot', { read: TemplateRef });

    /** Панель — шторка телефона: так решил открывший её при открытии. */
    protected readonly sheetMode: Signal<boolean> = computed((): boolean => this.#sheet?.active() ?? false);
    protected readonly sheetShown: Signal<boolean> = computed((): boolean => this.#sheet?.shown() ?? false);

    /**
     * Рамка у края окна — дополнительная панель или модальный диалог своего размера и имени; в шторке
     * роль, имя и размер у самой шторки, а у рамки — только вид содержимого.
     */
    protected readonly frameRole: Signal<string | null> = computed((): string | null => {
        if (this.sheetMode()) {
            return null;
        }
        return this.modal() ? 'dialog' : 'complementary';
    });
    protected readonly frameModal: Signal<true | null> = computed((): true | null => (!this.sheetMode() && this.modal()) || null);
    protected readonly frameLabel: Signal<string | null> = computed((): string | null => (this.sheetMode() ? null : this.ariaLabel()));
    protected readonly frameWidth: Signal<string | null> = computed((): string | null => (this.sheetMode() ? null : this.width()));
    protected readonly frameMods: Signal<Record<string, string | boolean>> = computed((): Record<string, string | boolean> =>
        this.sheetMode() ? { sheet: true, content: this.contentLayout() } : { size: this.size(), content: this.contentLayout() }
    );

    /** Имя диалога шторки: имя панели, а без него — её заголовок. */
    protected readonly sheetName: Signal<string | null> = computed((): string | null => this.ariaLabel() || this.header()?.title() || null);

    /**
     * Слова вопроса шторки: о несохранённых правках — слова панели, в порядке шторки; о
     * неприменённых отборах — слова самой шторки.
     */
    protected readonly sheetConfirm: Signal<IRtSheetConfirmLabels | null> = computed((): IRtSheetConfirmLabels | null =>
        this.#sheet?.question() === 'apply'
            ? null
            : {
                  title: this.#t().uiUnsavedTitle,
                  message: this.#t().uiUnsavedMessage,
                  apply: this.#t().uiUnsavedSave,
                  discard: this.#t().uiUnsavedDiscard,
                  stay: this.#t().uiUnsavedStay,
              }
    );

    /** Подвал шторки: только когда в подвале панели осталась кнопка, иначе шторка без подвала. */
    protected readonly sheetFooter: Signal<TemplateRef<IRtSheetTemplateContext> | null> = computed(
        (): TemplateRef<IRtSheetTemplateContext> | null => (this.footer()?.sheetFilled() === true ? this.sheetSlot() : null)
    );

    protected readonly frame: Signal<ElementRef<HTMLElement>> = viewChild.required<ElementRef<HTMLElement>>('frame');

    /** Своя заглушка, если приложение дало `<ng-template rtAsideEmpty>`. */
    protected readonly emptyTemplate: Signal<RtAsideEmptyDirective | undefined> = contentChild(RtAsideEmptyDirective);

    /** Заголовок заглушки: свой, а пустой или `null` — подпись кита `uiEmptyTitle`. */
    protected readonly emptyTitleText: Signal<string> = computed((): string => this.emptyTitle()?.trim() || this.#t_uiEmptyTitle());

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

    /** Панель блокирует страницу: рамка объявлена скринридеру модальным диалогом. */
    public readonly modal: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Идёт запрос: панель накрыта слоем с крутилкой и помечена занятой. */
    public readonly pending: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /**
     * Показать нечего: тело панели вместо содержимого показывает заглушку. Шапка, блок ошибки и
     * подвал остаются на месте. Признак ставит приложение: по спроецированному содержимому панель
     * пустоту не угадывает — пустой список всё равно проецирует свою разметку.
     */
    public readonly empty: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Значок заглушки; `null` убирает его. */
    public readonly emptyIcon: InputSignal<IRtIcon.Name | null> = input<IRtIcon.Name | null>('inbox');

    /** Заголовок заглушки; `null` и пустая строка оставляют подпись кита `uiEmptyTitle`. */
    public readonly emptyTitle: InputSignal<string | null> = input<string | null>(null);

    /** Пояснение под заголовком заглушки; `null` — без него. */
    public readonly emptyDescription: InputSignal<string | null> = input<string | null>(null);

    constructor() {
        // Шторка поднята — рамка встаёт в её тело, шапка в её шапку, подвал в её подвал, а без кнопок
        // подвал снят со страницы. Вне шторки всё возвращается в рамку. Перенос идёт первым: фокус и
        // главная кнопка ниже ищут узлы уже на местах шторки.
        afterRenderEffect((): void => {
            const sheet: HTMLElement | null = this.bottomSheetHost()?.nativeElement ?? null;
            const frame: HTMLElement = this.frame().nativeElement;
            const header: HTMLElement | null = this.headerHost()?.nativeElement ?? null;
            const footer: HTMLElement | null = this.footerHost()?.nativeElement ?? null;
            const footerShown: boolean = this.sheetFooter() !== null;
            untracked((): void => this.#placeSheetParts(sheet, frame, header, footer, footerShown));
        });
        // После отрисовки: до неё у рамки нет ни полей, ни кнопок, и ловить фокус не на чем.
        // Шторка держит Tab во всей своей панели — с шапкой и подвалом, и ловит его, когда поднята:
        // опущенная шторка `inert`, и фокус в неё не встаёт.
        afterRenderEffect((): void => {
            const enabled: boolean = this.trapFocus() && (!this.sheetMode() || this.sheetShown());
            const frame: HTMLElement = this.frame().nativeElement;
            untracked((): void => (enabled ? this.#holdFocus(this.#sheetPanel() ?? frame) : this.#releaseFocus()));
        });
        // Главная кнопка подвала встаёт справа в шапку шторки и возвращается в подвал вне шторки.
        // Выбор идёт заново с каждой сменой кнопок подвала: и с новой кнопкой на месте прежней.
        afterRenderEffect((): void => {
            const slot: HTMLElement | null = this.header()?.sheetMainSlot()?.nativeElement ?? null;
            const footer: RtAsideFooterComponent | undefined = this.footer();
            footer?.slotNodes();
            untracked((): void => this.#mainAction.place(slot, (): HTMLElement | null => footer?.mainActionNode() ?? null));
        });
        // Поднятая шторка ставит фокус на «×» — или на узел, который панель отметила для первого
        // фокуса. Панель, держащая Tab, ставит его ловушкой: первый узел под Tab в шторке — «×».
        afterRenderEffect((): void => {
            const shown: boolean = this.sheetMode() && this.sheetShown();
            untracked((): void => this.#focusSheet(shown));
        });
        // Вкладки панели-шторки — карусель, как чипы периода: ряд по кругу, выбранная по центру.
        afterRenderEffect((): void => {
            const carousel: boolean = this.sheetMode() && this.sheetShown() && this.contentLayout() === 'tabs';
            untracked((): void =>
                this.#sheetTabs.attach(carousel ? this.#host.querySelector<HTMLElement>('.rt-aside__content .rt-tabs__tab-list') : null)
            );
        });
        // Шапка панели узнаёт, что шторка — второй экран, от самой шторки.
        this.#sheet?.followScreen(computed((): boolean => this.bottomSheet()?.templateContext.nested() ?? false));
        // Вопрос открывшего — о несохранённом при просьбе закрыться — задаётся вопросом шторки.
        this.#sheet
            ?.asks()
            .pipe(takeUntilDestroyed())
            .subscribe((): void => this.bottomSheet()?.ask());
        inject(DestroyRef).onDestroy((): void => {
            this.#mainAction.restore();
            this.#sheetTabs.detach();
            this.#releaseFocus();
        });
    }

    /** Ответ на вопрос шторки уходит открывшему: он записывает, закрывает или оставляет панель. */
    protected onSheetAnswer(outcome: ERtAsideUnsavedOutcome): void {
        this.#sheet?.answer(outcome);
    }

    /**
     * Шторка просит закрыться и называет жест: решает открывший панель — служба кита или правая
     * панель рамки. Закрытие ответом на вопрос сюда не приходит: его решает сам ответ.
     */
    protected onSheetClose(reason: TRtSheetCloseReason): void {
        this.#sheet?.requestClose(SHEET_GESTURES[reason]);
    }

    /** Узлы панели на местах шторки; шторки нет — на своих местах в рамке. */
    #placeSheetParts(
        sheet: HTMLElement | null,
        frame: HTMLElement,
        header: HTMLElement | null,
        footer: HTMLElement | null,
        footerShown: boolean
    ): void {
        const part: (name: string) => HTMLElement | null = (name: string): HTMLElement | null =>
            sheet?.querySelector<HTMLElement>(`:scope > .rt-bottom-sheet__panel > .rt-bottom-sheet__${name}`) ?? null;
        const body: HTMLElement | null = part('body');
        if (body === null) {
            this.#sheetFooter.restore();
            this.#sheetHeader.restore();
            this.#sheetFrame.restore();
            return;
        }
        this.#sheetFrame.move([frame], body);
        this.#sheetHeader.move(header === null ? [] : [header], part('header'));
        this.#sheetFooter.move(footer === null ? [] : [footer], footerShown ? part('footer') : null);
    }

    /** Фокус подъёма шторки: один раз на подъём; держащая Tab панель ставит его ловушкой сама. */
    #focusSheet(shown: boolean): void {
        if (!shown) {
            this.#sheetFocused = false;
            return;
        }
        if (this.#sheetFocused) {
            return;
        }
        this.#sheetFocused = true;
        if (this.trapFocus()) {
            return;
        }
        const panel: HTMLElement | null = this.#sheetPanel();
        const target: HTMLElement | null =
            panel?.querySelector<HTMLElement>('[cdkFocusInitial]') ??
            panel?.querySelector<HTMLElement>('[qa-dataid="aside-sheet-close"] button, [qa-dataid="bottom-sheet-back"] button') ??
            null;
        target?.focus();
    }

    #sheetPanel(): HTMLElement | null {
        return this.sheetMode() ? this.#host.querySelector<HTMLElement>('[qa-dataid="bottom-sheet-panel"]') : null;
    }

    #holdFocus(frame: HTMLElement): void {
        if (this.#focusTrap !== null) {
            return;
        }
        const focused: Element | null = this.#doc.activeElement;
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
