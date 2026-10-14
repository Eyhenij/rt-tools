import { CdkTrapFocus } from '@angular/cdk/a11y';
import { DOCUMENT } from '@angular/common';
import {
    afterNextRender,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
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
    signal,
    Signal,
    untracked,
    viewChild,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { clampWidth, IRtDrawer } from './rt-drawer.model';
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

    /** Узел, который держал фокус до открытия поверх: ему фокус и возвращается. */
    #focusBefore: HTMLElement | null = null;

    protected readonly panel: Signal<ElementRef<HTMLElement>> = viewChild.required<ElementRef<HTMLElement>>('panel');

    protected readonly resizing: WritableSignal<boolean> = signal(false);

    /** Ширина, которую панель рисует: вход, удержанный в пределах. */
    protected readonly shownWidth: Signal<number> = computed((): number => clampWidth(this.width(), this.minWidth(), this.maxWidth()));

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

    public readonly width: ModelSignal<number> = model<number>(DEFAULT_WIDTH);

    public readonly minWidth: InputSignalWithTransform<number, unknown> = input(DEFAULT_MIN_WIDTH, { transform: numberAttribute });

    public readonly maxWidth: InputSignalWithTransform<number, unknown> = input(DEFAULT_MAX_WIDTH, { transform: numberAttribute });

    /** У внутреннего края панели стоит ручка ширины. */
    public readonly resizable: InputSignalWithTransform<boolean, unknown> = input(false, { transform: booleanAttribute });

    public readonly ariaLabel: InputSignal<string | null> = input<string | null>(null);

    constructor() {
        // Поверх содержимого панель забирает фокус на открытии и отдаёт его на закрытии; рядом с
        // содержимым она часть страницы, и фокус остаётся там, где его поставил человек.
        effect((): void => {
            const opened: boolean = this.opened();

            untracked((): void => (opened ? this.#takeFocus() : this.#returnFocus()));
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

    protected onBackdrop(): void {
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
        if (this.mode() !== 'over') {
            return;
        }
        const active: Element | null = this.#document.activeElement;

        this.#focusBefore = active instanceof HTMLElement ? active : null;
        afterNextRender((): void => this.panel().nativeElement.focus({ preventScroll: true }), { injector: this.#injector });
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
