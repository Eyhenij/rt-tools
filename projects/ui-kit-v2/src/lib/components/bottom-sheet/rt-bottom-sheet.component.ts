import { BooleanInput } from '@angular/cdk/coercion';
import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    DestroyRef,
    effect,
    ElementRef,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    signal,
    Signal,
    TemplateRef,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

// rt-tools
import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, TRtKitLabelMap } from '@rt-tools/ui-kit-v2/core';
import { RtButtonDirective } from '@rt-tools/ui-kit-v2/button';
import { RtIconButtonComponent } from '@rt-tools/ui-kit-v2/icon-button';
import { RtRadiusDirective } from '@rt-tools/ui-kit-v2/radius';
import { RtBottomSheetStackService } from './rt-bottom-sheet-stack.service';
import { clampDragDelta, isTypingTarget, shouldDismissDrag } from './rt-bottom-sheet.logic';
import { IRtSheetTemplateContext } from './rt-bottom-sheet.model';
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
        RtButtonDirective,
        RtIconButtonComponent,
    ],
    hostDirectives: [{ directive: RtRadiusDirective, inputs: ['radius'] }],
    host: {
        class: BEM_BLOCK,
        '[class.rt-bottom-sheet--open]': 'open()',
        '[class.rt-bottom-sheet--covered]': 'covered()',
        // Закрытый лист остаётся в разметке ради анимации, и спрятан он только
        // стилями — а `opacity`/`pointer-events` не убирают узел ни из порядка
        // табуляции, ни из дерева доступности. Без `inert` страница с закрытым
        // листом держала бы в табуляции невидимую кнопку «Закрыть», а
        // скринридер объявлял бы модальный диалог, которого не видно.
        // Шторка, подменённая открытой из неё, `inert` не получает: в ней стоит указатель поля,
        // открывшего верхнюю, и его клавиши ведут список верхней. С `inert` фокус падал на страницу.
        '[attr.inert]': 'open() ? null : ""',
        '(document:keydown.escape)': 'onEscape()',
    },
})
export class RtBottomSheetComponent {
    readonly #document: Document = inject(DOCUMENT);
    readonly #stack: RtBottomSheetStackService = inject(RtBottomSheetStackService);
    readonly #host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    /** Блокировка прокрутки страницы — та же, что держит оверлей у шторки панели выбора. */
    readonly #scrollLock: ScrollStrategy = inject(ScrollStrategyOptions).block();
    readonly #onDragMove: (event: PointerEvent) => void = (event: PointerEvent): void => this.#handleDragMove(event);
    readonly #onDragEnd: () => void = (): void => this.#handleDragEnd();
    readonly #requestClose: () => void = (): void => this.dismiss();

    #dragStartY: number = 0;
    #locked: boolean = false;

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly dragDeltaY: WritableSignal<number> = signal<number>(0);
    protected readonly dragging: WritableSignal<boolean> = signal<boolean>(false);

    /**
     * Фокус стоит в поле, в которое печатают. На сенсорном экране это открытая клавиатура: шторка
     * на это время встаёт во всю высоту, и содержимое остаётся видно над клавиатурой. Там, где
     * указатель точный, клавиатуры нет, и стили высоту не меняют.
     */
    protected readonly typing: WritableSignal<boolean> = signal<boolean>(false);

    /** Вопрос перед закрытием показан: шторку просили закрыть при неприменённом выборе. */
    protected readonly confirming: WritableSignal<boolean> = signal<boolean>(false);
    protected readonly confirmTitleId: string = takeConfirmId();

    /** Открыта, но поверх неё открыта шторка из неё самой: эта спрятана до закрытия верхней. */
    protected readonly covered: Signal<boolean> = computed((): boolean => this.open() && this.#stack.top() !== this);

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

    /** Своему шаблону шторка отдаёт просьбу закрыть — ту же, что зовёт её кнопка «×». */
    protected readonly templateContext: IRtSheetTemplateContext = { $implicit: this.#requestClose, close: this.#requestClose };

    public readonly open: InputSignalWithTransform<boolean, BooleanInput> = input.required<boolean, BooleanInput>({
        transform: booleanAttribute,
    });

    /** Идентификатор узла с названием диалога: без него `role="dialog"` читается без имени. */
    public readonly ariaLabelledby: InputSignal<string | null> = input<string | null>(null);

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

    public readonly openChange: OutputEmitterRef<boolean> = output<boolean>();

    /** Человек ответил на вопрос «Применить»: выбор нужно применить, следом придёт просьба закрыть. */
    public readonly applyRequest: OutputEmitterRef<void> = output<void>();

    constructor() {
        // Порядок открытия — общий для всех шторок страницы; шторка встаёт в него с открытием.
        effect((): void => {
            if (this.open()) {
                this.#stack.push(this);
            } else {
                this.#stack.remove(this);
            }
        });
        // Прокрутку страницы шторка держит сама, пока открыта. Шторке внутри оверлея это не нужно:
        // её оверлей уже держит прокрутку и слушает Escape, и второй раз они сработать не должны.
        effect((): void => {
            this.#setScrollLock(this.open() && !this.#inOverlay());
        });
        // Закрытая шторка вопроса за собой не оставляет: следующее открытие начинается без него.
        effect((): void => {
            if (!this.open()) {
                this.confirming.set(false);
            }
        });
        inject(DestroyRef).onDestroy((): void => {
            this.#stack.remove(this);
            this.#setScrollLock(false);
        });
    }

    /**
     * Escape: открытый вопрос он снимает, иначе просит закрыть шторку — с неприменённым выбором через
     * вопрос. Шторке в оверлее клавишу отдаёт её оверлей, остальным — слушатель документа.
     */
    public closeByEscape(): void {
        if (this.confirming()) {
            this.confirming.set(false);
        } else {
            this.dismiss();
        }
    }

    protected onEscape(): void {
        if (this.open() && !this.covered() && !this.#inOverlay()) {
            this.closeByEscape();
        }
    }

    protected onFocusIn(event: FocusEvent): void {
        this.typing.set(isTypingTarget(event.target));
    }

    protected onConfirmApply(): void {
        this.confirming.set(false);
        this.applyRequest.emit();
        this.openChange.emit(false);
    }

    protected onConfirmDiscard(): void {
        this.confirming.set(false);
        this.openChange.emit(false);
    }

    protected onConfirmCancel(): void {
        this.confirming.set(false);
    }

    protected onDragStart(event: PointerEvent): void {
        this.#dragStartY = event.clientY;
        this.dragging.set(true);
        this.dragDeltaY.set(0);
        this.#document.addEventListener('pointermove', this.#onDragMove);
        this.#document.addEventListener('pointerup', this.#onDragEnd);
    }

    /** Просьба закрыть: с неприменённым выбором сначала вопрос, без него — сразу наружу. */
    protected dismiss(): void {
        if (this.unsaved()) {
            this.confirming.set(true);
        } else {
            this.openChange.emit(false);
        }
    }

    #inOverlay(): boolean {
        return this.#host.closest('.cdk-overlay-container') !== null;
    }

    #setScrollLock(locked: boolean): void {
        if (locked === this.#locked) {
            return;
        }
        this.#locked = locked;
        if (locked) {
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
        this.#document.removeEventListener('pointermove', this.#onDragMove);
        this.#document.removeEventListener('pointerup', this.#onDragEnd);
        if (shouldDismissDrag(this.dragDeltaY())) {
            this.dismiss();
        }
        this.dragDeltaY.set(0);
    }
}
