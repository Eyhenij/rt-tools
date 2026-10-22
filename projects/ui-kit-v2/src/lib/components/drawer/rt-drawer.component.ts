import { CdkTrapFocus, FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';
import { DOCUMENT } from '@angular/common';
import {
    afterNextRender,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    effect,
    ElementRef,
    inject,
    Injector,
    input,
    InputSignal,
    InputSignalWithTransform,
    model,
    ModelSignal,
    numberAttribute,
    output,
    OutputEmitterRef,
    signal,
    Signal,
    untracked,
    viewChild,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { listenTransitionEnd } from './rt-drawer.transition';
import { autoFocusTarget, clampWidth, FOCUS_PANEL, IRtDrawer } from './rt-drawer.model';
import { RtResizeHandleComponent } from './rt-resize-handle.component';

const BEM_BLOCK: string = 'rt-drawer';

/** Ширина панели по умолчанию, в пикселях. */
const DEFAULT_WIDTH: number = 320;

const DEFAULT_MIN_WIDTH: number = 200;

const DEFAULT_MAX_WIDTH: number = 640;

/**
 * Встраиваемая боковая панель внутри `rt-drawer-container`: рядом с содержимым страницы (`side`)
 * или поверх него (`over`).
 *
 * Панель живёт в странице, а не в оверлее: она занимает место внутри контейнера и не выходит за
 * его края. Этим она отличается от `rt-aside`, которая открывается над всем окном, и от правой
 * панели `rt-container`, которая принадлежит каркасу приложения.
 *
 * - `opened` — двусторонний вход: панель открывают владелец и сама панель, закрывают её
 *   подложка и Escape в режиме `over`. С `disableClose` закрыть её может только владелец.
 * - `width` — двусторонний вход в пикселях. С `resizable` у внутреннего края стоит ручка, которой
 *   ширину меняют указателем и стрелками в пределах `[minWidth, maxWidth]`.
 * - Закрытая панель остаётся в разметке и не принимает фокус: содержимое не создаётся заново на
 *   каждом открытии.
 * - `openedStart` и `closedStart` приходят в момент смены `opened`, `afterOpened` и `afterClosed` —
 *   после перехода ширины или сдвига; без движения — сразу.
 */
@Component({
    selector: 'rt-drawer',
    templateUrl: './rt-drawer.component.html',
    styleUrl: './rt-drawer.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [CdkTrapFocus, BlockDirective, ElemDirective, ModDirective, RtResizeHandleComponent],
    host: {
        class: BEM_BLOCK,
        'qa-dataid': 'drawer',
    },
})
export class RtDrawerComponent {
    readonly #document: Document = inject(DOCUMENT);
    readonly #injector: Injector = inject(Injector);
    readonly #focusTrapFactory: FocusTrapFactory = inject(FocusTrapFactory);

    /** Первое чтение `opened` — исходное состояние, а не смена: о нём панель не сообщает. */
    #announced: boolean = false;

    /** Номер последней смены: ожидание конца перехода, обогнанное новой сменой, молчит. */
    #turn: number = 0;

    #destroyed: boolean = false;

    /** Узел, который держал фокус до открытия поверх: ему фокус и возвращается. */
    #focusBefore: HTMLElement | null = null;

    protected readonly panel: Signal<ElementRef<HTMLElement>> = viewChild.required<ElementRef<HTMLElement>>('panel');

    protected readonly resizing: WritableSignal<boolean> = signal(false);

    /** Ширина, которую панель рисует: вход, удержанный в пределах. */
    protected readonly shownWidth: Signal<number | null> = computed((): number | null => {
        const width: number | null = this.width();

        return width === null ? null : clampWidth(width, this.minWidth(), this.maxWidth());
    });

    /** Ширина по содержимому: у панели нет своей ширины, и тянуть ручкой нечего. */
    protected readonly autoWidth: Signal<boolean> = computed((): boolean => this.width() === null);

    protected readonly handleShown: Signal<boolean> = computed((): boolean => this.resizable() && !this.autoWidth());

    protected readonly backdropShown: Signal<boolean> = computed((): boolean => this.mode() === 'over' && this.hasBackdrop());

    /** Открытая панель поверх содержимого держит фокус в себе: Tab не уходит под подложку. */
    protected readonly trapFocus: Signal<boolean> = computed((): boolean => this.backdropShown() && this.opened());

    /** Ручка стоит у внутреннего края: у панели слева — справа от неё, и наоборот. */
    protected readonly handleEdge: Signal<IRtDrawer.Edge> = computed((): IRtDrawer.Edge => (this.position() === 'start' ? 'end' : 'start'));

    public readonly opened: ModelSignal<boolean> = model<boolean>(false);

    public readonly mode: InputSignal<IRtDrawer.Mode> = input<IRtDrawer.Mode>('side');

    public readonly position: InputSignal<IRtDrawer.Position> = input<IRtDrawer.Position>('start');

    /** Подложка под панелью в режиме `over`. В режиме `side` подложки нет никогда. */
    public readonly hasBackdrop: InputSignalWithTransform<boolean, unknown> = input(true, { transform: booleanAttribute });

    /** Подложка и Escape панель не закрывают: закрыть её может только владелец. */
    public readonly disableClose: InputSignalWithTransform<boolean, unknown> = input(false, { transform: booleanAttribute });

    /** Ширина в пикселях; `null` — панель шириной по содержимому, ручки ширины у неё нет. */
    public readonly width: ModelSignal<number | null> = model<number | null>(DEFAULT_WIDTH);

    public readonly minWidth: InputSignalWithTransform<number, unknown> = input(DEFAULT_MIN_WIDTH, { transform: numberAttribute });

    public readonly maxWidth: InputSignalWithTransform<number, unknown> = input(DEFAULT_MAX_WIDTH, { transform: numberAttribute });

    /** У внутреннего края панели стоит ручка ширины. */
    public readonly resizable: InputSignalWithTransform<boolean, unknown> = input(false, { transform: booleanAttribute });

    public readonly ariaLabel: InputSignal<string | null> = input<string | null>(null);

    /** `visible` — содержимое выходит за край панели: выезжающая вбок подпанель, ручка на краю. */
    public readonly overflow: InputSignal<IRtDrawer.Overflow> = input<IRtDrawer.Overflow>('clip');

    /** Куда встаёт фокус на открытии; по умолчанию — на панель, и только поверх содержимого. */
    public readonly autoFocus: InputSignal<IRtDrawer.AutoFocus> = input<IRtDrawer.AutoFocus>(true);

    public readonly openedStart: OutputEmitterRef<void> = output<void>();

    public readonly closedStart: OutputEmitterRef<void> = output<void>();

    public readonly afterOpened: OutputEmitterRef<void> = output<void>();

    public readonly afterClosed: OutputEmitterRef<void> = output<void>();

    /** Нажатие на подложку; приходит и с `disableClose`, до закрытия. */
    public readonly backdropClick: OutputEmitterRef<MouseEvent> = output<MouseEvent>();

    constructor() {
        // Поверх содержимого панель забирает фокус на открытии и отдаёт его на закрытии; рядом с
        // содержимым она часть страницы, и фокус остаётся там, где его поставил человек. Панель,
        // открытая с первой отрисовки, фокус не берёт: страница только загрузилась, и человек
        // ничего не открывал.
        effect((): void => {
            const opened: boolean = this.opened();

            untracked((): void => {
                if (!this.#announced) {
                    this.#announce(opened);
                    return;
                }
                if (opened) {
                    this.#takeFocus();
                } else {
                    this.#returnFocus();
                }
                this.#announce(opened);
            });
        });
        inject(DestroyRef).onDestroy((): void => {
            this.#destroyed = true;
        });
    }

    public open(): void {
        this.opened.set(true);
    }

    public close(): void {
        this.opened.set(false);
    }

    public toggle(): void {
        this.opened.update((opened: boolean): boolean => !opened);
    }

    protected onBackdrop(event: MouseEvent): void {
        this.backdropClick.emit(event);
        if (!this.disableClose()) {
            this.close();
        }
    }

    protected onEscape(event: Event): void {
        if (this.mode() !== 'over' || this.disableClose() || !this.opened()) {
            return;
        }
        event.stopPropagation();
        this.close();
    }

    protected onWidth(width: number): void {
        this.width.set(width);
    }

    #takeFocus(): void {
        const target: string | null = autoFocusTarget(this.autoFocus(), this.mode() === 'over');

        if (target === null) {
            return;
        }
        const active: Element | null = this.#document.activeElement;

        this.#focusBefore = active instanceof HTMLElement ? active : null;
        afterNextRender((): void => this.#focusInside(target), { injector: this.#injector });
    }

    /** Узел не нашёлся — фокус встаёт на саму панель: открытая панель его не теряет. */
    #focusInside(target: string): void {
        const panel: HTMLElement = this.panel().nativeElement;

        if (target === 'first-tabbable') {
            const lookup: FocusTrap = this.#focusTrapFactory.create(panel);
            const found: boolean = lookup.focusFirstTabbableElement({ preventScroll: true });

            lookup.destroy();
            if (!found) {
                panel.focus({ preventScroll: true });
            }
            return;
        }
        const node: HTMLElement | null = target === FOCUS_PANEL ? null : panel.querySelector<HTMLElement>(target);

        (node ?? panel).focus({ preventScroll: true });
    }

    /** Начало смены сообщается сразу, её конец — когда панель доехала. */
    #announce(opened: boolean): void {
        if (!this.#announced) {
            this.#announced = true;
            return;
        }
        this.#turn += 1;
        const turn: number = this.#turn;

        (opened ? this.openedStart : this.closedStart).emit();
        afterNextRender(
            (): void => {
                const panel: HTMLElement = this.panel().nativeElement;
                const property: string = this.mode() === 'over' ? 'transform' : 'inline-size';

                listenTransitionEnd(this.#document.defaultView, panel, property, (): void => {
                    if (turn === this.#turn && !this.#destroyed) {
                        (opened ? this.afterOpened : this.afterClosed).emit();
                    }
                });
            },
            { injector: this.#injector }
        );
    }

    #returnFocus(): void {
        const before: HTMLElement | null = this.#focusBefore;
        const panel: HTMLElement = this.panel().nativeElement;

        this.#focusBefore = null;
        if (before !== null && panel.contains(this.#document.activeElement)) {
            before.focus({ preventScroll: true });
        }
    }
}
