import { BooleanInput } from '@angular/cdk/coercion';
import { OverlayContainer, ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    DestroyRef,
    effect,
    EffectCleanupRegisterFn,
    ElementRef,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    linkedSignal,
    output,
    OutputEmitterRef,
    signal,
    Signal,
    TemplateRef,
    untracked,
    viewChild,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

// rt-tools
import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, TRtKitLabelMap } from '@rt-tools/ui-kit-v2/core';
import { RtIconButtonComponent } from '@rt-tools/ui-kit-v2/icon-button';
import { RtRadiusDirective } from '@rt-tools/ui-kit-v2/radius';
import { IRtSheetKeyboardBox, rtWatchSheetKeyboard } from './rt-bottom-sheet-keyboard';
import { RtBottomSheetStackService } from './rt-bottom-sheet-stack.service';
import { clampDragDelta, focusLeftBehind, innerFocus, isTypingTarget, outerFocus, shouldDismissDrag } from './rt-bottom-sheet.logic';
import { IRtSheetConfirmLabels, IRtSheetTemplateContext, TRtSheetCloseReason } from './rt-bottom-sheet.model';
import { RtSheetFooterDirective } from './rt-sheet-footer.directive';
import { RtSheetHeaderDirective } from './rt-sheet-header.directive';

const BEM_BLOCK: string = 'rt-bottom-sheet';

let nextConfirmId: number = 0;

function takeConfirmId(): string {
    nextConfirmId += 1;

    return `rt-bottom-sheet-confirm-${nextConfirmId}`;
}

@Component({
    selector: 'rt-bottom-sheet',
    templateUrl: './rt-bottom-sheet.component.html',
    styleUrl: './rt-bottom-sheet.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // @angular
        NgTemplateOutlet,

        // rt-tools
        BlockDirective,
        ElemDirective,
        ModDirective,

        // kit
        RtIconButtonComponent,
    ],
    hostDirectives: [{ directive: RtRadiusDirective, inputs: ['radius'] }],
    host: {
        class: BEM_BLOCK,
        '[class.rt-bottom-sheet--open]': 'open()',
        '[class.rt-bottom-sheet--covered]': 'covered()',
        '[class.rt-bottom-sheet--nested]': 'nested()',
        '[style.--rt-bottom-sheet-nested-height.px]': 'nestedHeight()',
        // Закрытый лист остаётся в разметке ради анимации, и спрятан он только
        // стилями — а `opacity`/`pointer-events` не убирают узел ни из порядка
        // табуляции, ни из дерева доступности. Без `inert` страница с закрытым
        // листом держала бы в табуляции невидимую кнопку «Закрыть», а
        // скринридер объявлял бы модальный диалог, которого не видно.
        // Шторка, подменённая открытой из неё, `inert` не получает: в ней стоит указатель поля,
        // открывшего верхнюю, и его клавиши ведут список верхней. С `inert` фокус падал на страницу.
        '[attr.inert]': 'open() ? null : ""',
        '[class.rt-bottom-sheet--keyboard]': 'keyboardBox() !== null',
        '[style.--rt-bottom-sheet-keyboard-top.px]': 'keyboardBox()?.top',
        '[style.--rt-bottom-sheet-keyboard-height.px]': 'keyboardBox()?.height',
        '(keydown.escape)': 'onHostEscape($event)',
        '(document:keydown.escape)': 'onEscape($event)',
    },
})
export class RtBottomSheetComponent {
    readonly #doc: Document = inject(DOCUMENT);
    readonly #stack: RtBottomSheetStackService = inject(RtBottomSheetStackService);
    readonly #host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    /** Блокировка прокрутки страницы — та же, что держит оверлей у шторки панели выбора. */
    readonly #scrollLock: ScrollStrategy = inject(ScrollStrategyOptions).block();
    readonly #overlayContainer: OverlayContainer = inject(OverlayContainer);
    readonly #onDragMove: (event: PointerEvent) => void = (event: PointerEvent): void => this.#handleDragMove(event);
    readonly #onDragEnd: () => void = (): void => this.#handleDragEnd();
    readonly #requestClose: () => void = (): void => this.dismiss('close');
    readonly #onResize: () => void = (): void => this.#followUnder();
    readonly #requestApply: () => void = (): void => this.applyRequest.emit();
    readonly #onKeyboardBox: (box: IRtSheetKeyboardBox | null) => void = (box: IRtSheetKeyboardBox | null): void =>
        this.keyboardBox.set(box);

    #dragStartY: number = 0;
    #locked: boolean = false;
    /** Узел, с которого шторку открыли: ему возвращается фокус, оставшийся в закрытой шторке. */
    #openedFrom: HTMLElement | null = null;
    /** Узел шторки, с которого её просили закрыть: ему возвращается фокус после ответа «Остаться». */
    #askedFrom: HTMLElement | null = null;
    /** Шторка, вторым экраном которой открыта эта; `null` — шторка не вложена. */
    #under: RtBottomSheetComponent | null = null;

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly dragDeltaY: WritableSignal<number> = signal<number>(0);
    protected readonly dragging: WritableSignal<boolean> = signal<boolean>(false);

    /**
     * В шторке начали печатать: фокус побывал в поле ввода. С этого момента и до закрытия шторка
     * следит за экранной клавиатурой; сама высота от фокуса не меняется — её меняет показанная
     * клавиатура (`raised`).
     */
    protected readonly typing: WritableSignal<boolean> = linkedSignal<boolean>((): boolean => this.#closedWith(false));

    /**
     * Место над экранной клавиатурой, пока в шторке печатают; без клавиатуры пусто. Клавиатура
     * телефона ложится поверх окна, и шторка во весь экран ушла бы низом под неё: с этим местом она
     * встаёт ровно над клавиатурой. Стили читают его только там, где указатель — палец.
     */
    protected readonly keyboardBox: WritableSignal<IRtSheetKeyboardBox | null> = linkedSignal<IRtSheetKeyboardBox | null>(
        (): IRtSheetKeyboardBox | null => this.#typedWith(null)
    );

    /**
     * Экранная клавиатура показана: шторка во всю высоту стоит над ней. Клавиатура убрана — шторка
     * снова по высоте содержимого. От одного нажатия в поле, пока клавиатура не появилась, шторка не
     * поднимается.
     */
    protected readonly raised: Signal<boolean> = computed((): boolean => this.keyboardBox() !== null);

    /**
     * Вопрос перед закрытием показан: шторку просили закрыть при неприменённом выборе. Закрытая
     * шторка вопроса за собой не оставляет: со сменой открытости он снят.
     */
    protected readonly confirming: WritableSignal<boolean> = linkedSignal<boolean>((): boolean => this.#closedWith(false));
    protected readonly confirmTitleId: string = takeConfirmId();

    /** Открыта, но поверх неё открыта шторка из неё самой: эта спрятана до закрытия верхней. */
    protected readonly covered: Signal<boolean> = computed((): boolean => this.open() && this.#stack.top() !== this);

    /**
     * Шторка открыта из другой шторки: она — второй экран той же шторки. Встаёт без выезда на место и
     * высоту нижней, слева в шапке у неё шеврон «назад». Признак держится и на закрытии: второй экран
     * уходит так же без выезда, и нижняя видна сразу.
     */
    protected readonly nested: WritableSignal<boolean> = signal<boolean>(false);

    /**
     * Высота панели нижней шторки: второй экран встаёт той же высоты и идёт за ней, когда окно меняет
     * размер. `null` — шторка не вложена.
     */
    protected readonly nestedHeight: WritableSignal<number | null> = signal<number | null>(null);

    protected readonly ownHeader: Signal<RtSheetHeaderDirective | undefined> = contentChild(RtSheetHeaderDirective);
    protected readonly ownFooter: Signal<RtSheetFooterDirective | undefined> = contentChild(RtSheetFooterDirective);

    /** Своя шапка: шаблон из входа сильнее шаблона директивы в содержимом. Пусто — шапка шторки. */
    protected readonly headerTpl: Signal<TemplateRef<IRtSheetTemplateContext> | null> = computed(
        (): TemplateRef<IRtSheetTemplateContext> | null => this.headerTemplate() ?? this.ownHeader()?.template ?? null
    );

    /** Свой подвал: шаблон из входа сильнее шаблона директивы в содержимом. Пусто — узлы `sheetFooter`. */
    protected readonly footerTpl: Signal<TemplateRef<IRtSheetTemplateContext> | null> = computed(
        (): TemplateRef<IRtSheetTemplateContext> | null => this.footerTemplate() ?? this.ownFooter()?.template ?? null
    );

    /** Своему шаблону шторка отдаёт просьбу закрыть — ту же, что зовёт её кнопка «×», — и просьбу применить. */
    protected readonly templateContext: IRtSheetTemplateContext = {
        $implicit: this.#requestClose,
        close: this.#requestClose,
        apply: this.#requestApply,
    };

    /** Слова вопроса: свои из входа, без них — вопрос о неприменённом выборе. */
    protected readonly confirmText: Signal<IRtSheetConfirmLabels> = computed(
        (): IRtSheetConfirmLabels =>
            this.confirmLabels() ?? {
                title: this.t().bottomSheetUnsavedTitle,
                message: this.t().bottomSheetUnsavedMessage,
                apply: this.t().uiApply,
                discard: this.t().bottomSheetUnsavedDiscard,
                stay: this.t().uiCancel,
            }
    );

    /** Первый ответ вопроса: фокус встаёт на него, как только вопрос нарисован. */
    protected readonly confirmFirst: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>('confirmFirst');

    public readonly open: InputSignalWithTransform<boolean, BooleanInput> = input.required<boolean, BooleanInput>({
        transform: booleanAttribute,
    });

    /** Идентификатор узла с названием диалога: без него `role="dialog"` читается без имени. */
    public readonly ariaLabelledby: InputSignal<string | null> = input<string | null>(null);

    /** Название диалога строкой — для шторки, у которой узла с названием в разметке нет: со своей шапкой. */
    public readonly ariaLabel: InputSignal<string | null> = input<string | null>(null);

    /**
     * Шторка во всю высоту экрана: для содержимого, в котором человек печатает. По умолчанию
     * панель растёт по содержимому до своего предела.
     */
    public readonly fullHeight: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /**
     * Выбор в шторке изменён и не применён. Шторка с таким выбором на просьбу закрыть — кнопкой,
     * подложкой, свайпом или Escape — сначала спрашивает: применить, не применять или остаться.
     * Ставит его тот, у кого выбор уходит в приложение только по кнопке.
     */
    public readonly unsaved: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /**
     * Своя шапка шаблоном: встаёт на место кнопки закрытия, заголовка и действия. Тот же шаблон
     * в разметке задаёт `<ng-template rtSheetHeader>`; вход нужен тому, кто открывает шторку кодом.
     */
    public readonly headerTemplate: InputSignal<TemplateRef<IRtSheetTemplateContext> | null> =
        input<TemplateRef<IRtSheetTemplateContext> | null>(null);

    /** Свой подвал шаблоном; в разметке его задаёт `<ng-template rtSheetFooter>`. */
    public readonly footerTemplate: InputSignal<TemplateRef<IRtSheetTemplateContext> | null> =
        input<TemplateRef<IRtSheetTemplateContext> | null>(null);

    /**
     * Свои слова вопроса перед закрытием — у панели, которая спрашивает о правках записи, а не о
     * выборе. Пусто — слова шторки о неприменённом выборе.
     */
    public readonly confirmLabels: InputSignal<IRtSheetConfirmLabels | null> = input<IRtSheetConfirmLabels | null>(null);

    /**
     * Ответ «Применить» закрывает шторку. `false` — ответ только сообщает о себе, и шторка остаётся
     * открытой: её закроет хозяин, когда применённое запишется.
     */
    public readonly closeOnApply: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });

    public readonly openChange: OutputEmitterRef<boolean> = output<boolean>();

    /**
     * Шторку просят закрыть, и вопроса нет: чем просят — подложкой, свайпом, Escape или кнопкой
     * закрытия. Приходит перед `openChange(false)` того же жеста; закрытие ответом на вопрос его не даёт.
     */
    public readonly closeRequest: OutputEmitterRef<TRtSheetCloseReason> = output<TRtSheetCloseReason>();

    /** Человек ответил на вопрос «Применить»: выбор нужно применить, следом придёт просьба закрыть. */
    public readonly applyRequest: OutputEmitterRef<void> = output<void>();

    /** Человек ответил на вопрос «Не применять»: неприменённое нужно отбросить, следом придёт просьба закрыть. */
    public readonly discardRequest: OutputEmitterRef<void> = output<void>();

    /** Человек остался: ответил на вопрос третьей кнопкой или снял его Escape. */
    public readonly stayRequest: OutputEmitterRef<void> = output<void>();

    constructor() {
        // Порядок открытия — общий для всех шторок страницы; шторка встаёт в него с открытием.
        effect((): void => {
            if (this.open()) {
                untracked((): void => this.#nestOver(this.#stack.top()));
                this.#stack.push(this);
            } else {
                this.#stack.remove(this);
            }
        });
        // Прокрутку страницы шторка держит сама, пока открыта. Шторке панели выбора это не нужно:
        // её оверлей уже держит прокрутку и слушает Escape, и второй раз они сработать не должны.
        effect((): void => {
            this.#setScrollLock(this.open() && !this.#inPopoverSheet());
        });
        // Фокус, оставшийся в закрытой шторке, уходит туда, откуда её открыли. Вопрос и высоту под
        // клавиатуру закрытая шторка снимает сама: их сигналы связаны с открытостью.
        effect((): void => {
            const open: boolean = this.open();
            untracked((): void => {
                if (open) {
                    // Шторке панели выбора фокус возвращает её мост: он знает, какой узел триггера его берёт.
                    this.#openedFrom = this.#inPopoverSheet() ? null : outerFocus(this.#doc, this.#host);
                } else {
                    this.#returnFocus();
                }
            });
        });
        // Второй экран идёт за высотой нижней шторки: окно, сменившее размер или повёрнутое, меняет
        // её высоту, и шеврон второго экрана без этого уходил за край.
        effect((onCleanup: EffectCleanupRegisterFn): void => {
            const view: Window | null = this.#doc.defaultView;
            if (this.open() && this.nested() && view !== null) {
                view.addEventListener('resize', this.#onResize);
                onCleanup((): void => view.removeEventListener('resize', this.#onResize));
            }
        });
        // Пока в шторке печатают, она следит за местом над экранной клавиатурой и встаёт в него;
        // место снимается само, когда печатать перестали.
        effect((onCleanup: EffectCleanupRegisterFn): void => {
            if (this.typing()) {
                onCleanup(rtWatchSheetKeyboard(this.#doc.defaultView, this.#onKeyboardBox));
            }
        });
        // Вопрос нарисован — фокус встаёт на первый ответ: иначе он остаётся под вопросом, на кнопке
        // закрытия, и скринридер вопроса не объявляет.
        // Вопрос стоит внизу экрана сам: фокус на его ответе страницу под шторкой не прокручивает.
        effect((): void => this.confirmFirst()?.nativeElement.focus({ preventScroll: true }));
        inject(DestroyRef).onDestroy((): void => {
            this.#stack.remove(this);
            this.#setScrollLock(false);
            this.#returnFocus();
        });
    }

    /** Высота панели шторки: по ней второй экран встаёт той же высоты. */
    public panelHeight(): number {
        return this.#host.querySelector<HTMLElement>(':scope > .rt-bottom-sheet__panel')?.getBoundingClientRect().height ?? 0;
    }

    /**
     * Escape: открытый вопрос он снимает, иначе просит закрыть шторку — с неприменённым выбором через
     * вопрос. Шторке в оверлее клавишу отдаёт её оверлей, остальным — слушатель документа.
     */
    public closeByEscape(): void {
        if (this.confirming()) {
            this.onConfirmCancel();
        } else {
            this.dismiss('escape');
        }
    }

    /**
     * Задать вопрос перед закрытием, не дожидаясь жеста: так спрашивает хозяин, которого просят
     * закрыться в обход шторки. Показанный вопрос второй раз не задаётся.
     */
    public ask(): void {
        if (!this.confirming()) {
            this.#askedFrom = innerFocus(this.#doc, this.#host);
            this.confirming.set(true);
        }
    }

    /**
     * Escape с фокусом в самой шторке: дальше клавиша не идёт. Шторка может стоять в боковой панели
     * или диалоге, и их оверлей закрыл бы по той же клавише себя, а не её.
     */
    protected onHostEscape(event: Event): void {
        if (!event.defaultPrevented && this.#ownsEscape()) {
            event.preventDefault();
            event.stopPropagation();
            this.closeByEscape();
        }
    }

    /** Escape с фокусом вне шторки. Клавишу, уже взятую слоем над шторкой, она не трогает. */
    protected onEscape(event: Event): void {
        if (!event.defaultPrevented && this.#ownsEscape()) {
            this.closeByEscape();
        }
    }

    protected onFocusIn(event: FocusEvent): void {
        if (isTypingTarget(event.target)) {
            this.typing.set(true);
        }
    }

    protected onConfirmApply(): void {
        this.confirming.set(false);
        this.applyRequest.emit();
        if (this.closeOnApply()) {
            this.openChange.emit(false);
        }
    }

    protected onConfirmDiscard(): void {
        this.confirming.set(false);
        this.discardRequest.emit();
        this.openChange.emit(false);
    }

    protected onConfirmCancel(): void {
        this.confirming.set(false);
        // Панель под вопросом `inert` до следующей отрисовки, и фокус в неё не встаёт: он падал на
        // страницу. Запрет снимается здесь же, до фокуса; отрисовка снимет его второй раз.
        this.#host.querySelectorAll<HTMLElement>(':scope > [inert]').forEach((node: HTMLElement): void => node.removeAttribute('inert'));
        // Закрыть просили подложкой или свайпом — узла с фокусом не было: фокус берёт панель шторки,
        // иначе он упал бы на страницу под открытой шторкой.
        (this.#askedFrom ?? this.#host.querySelector<HTMLElement>('[role="dialog"]'))?.focus({ preventScroll: true });
        this.#askedFrom = null;
        this.stayRequest.emit();
    }

    protected onDragStart(event: PointerEvent): void {
        this.#dragStartY = event.clientY;
        this.dragging.set(true);
        this.dragDeltaY.set(0);
        this.#doc.addEventListener('pointermove', this.#onDragMove);
        this.#doc.addEventListener('pointerup', this.#onDragEnd);
    }

    /** Просьба закрыть: с неприменённым выбором сначала вопрос, без него — сразу наружу с жестом. */
    protected dismiss(reason: TRtSheetCloseReason): void {
        if (!this.unsaved()) {
            this.closeRequest.emit(reason);
            this.openChange.emit(false);
            return;
        }
        // Вопрос уже показан — вторая просьба закрыть его не переспрашивает.
        this.ask();
    }

    /** Значение, к которому сигнал возвращается с каждой сменой открытости шторки. */
    #closedWith<T>(value: T): T {
        this.open();

        return value;
    }

    /** Значение, к которому сигнал возвращается, когда в шторке начали или перестали печатать. */
    #typedWith<T>(value: T): T {
        this.typing();

        return value;
    }

    /** Шторка панели выбора: прокрутку и Escape за неё держит её собственный оверлей. */
    #inPopoverSheet(): boolean {
        return this.#host.closest('rt-popover-sheet') !== null;
    }

    #ownsEscape(): boolean {
        return this.open() && !this.covered() && !this.#inPopoverSheet();
    }

    /** Открытие поверх другой шторки делает эту её вторым экраном той же высоты. */
    #nestOver(below: object | null): void {
        const under: RtBottomSheetComponent | null = below instanceof RtBottomSheetComponent && below !== this ? below : null;
        this.#under = under;
        this.nested.set(under !== null);
        this.#followUnder();
    }

    /** Высота второго экрана — нынешняя высота панели нижней шторки. */
    #followUnder(): void {
        this.nestedHeight.set(this.#under === null ? null : this.#under.panelHeight());
    }

    /** Фокус, оставшийся в закрытой шторке или упавший с неё на страницу, уходит на открывший её узел. */
    #returnFocus(): void {
        const target: HTMLElement | null = this.#openedFrom;
        this.#openedFrom = null;
        if (target?.isConnected === true && focusLeftBehind(this.#doc, this.#host)) {
            target.focus();
        }
    }

    #setScrollLock(locked: boolean): void {
        if (locked === this.#locked) {
            return;
        }
        this.#locked = locked;
        if (locked) {
            // Правило блокировки лежит в стилях оверлея CDK, а они грузятся с первым оверлеем
            // страницы. Шторка в шаблоне страницы может открыться раньше любого оверлея.
            this.#overlayContainer.getContainerElement();
            this.#scrollLock.enable();
        } else {
            this.#scrollLock.disable();
        }
    }

    #handleDragMove(event: PointerEvent): void {
        this.dragDeltaY.set(clampDragDelta(event.clientY - this.#dragStartY));
    }

    #handleDragEnd(): void {
        this.dragging.set(false);
        this.#doc.removeEventListener('pointermove', this.#onDragMove);
        this.#doc.removeEventListener('pointerup', this.#onDragEnd);
        if (shouldDismissDrag(this.dragDeltaY())) {
            this.dismiss('swipe');
        }
        this.dragDeltaY.set(0);
    }
}
