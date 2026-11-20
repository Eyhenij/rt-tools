import { BooleanInput } from '@angular/cdk/coercion';
import { DOCUMENT } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    effect,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    signal,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

// rt-tools
import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, TRtKitLabelMap } from '@rt-tools/ui-kit-v2/core';
import { RtRadiusDirective } from '@rt-tools/ui-kit-v2/radius';
import { RtBottomSheetStackService } from './rt-bottom-sheet-stack.service';
import { clampDragDelta, shouldDismissDrag } from './rt-bottom-sheet.logic';

const BEM_BLOCK: string = 'rt-bottom-sheet';

@Component({
    selector: 'rt-bottom-sheet',
    templateUrl: './rt-bottom-sheet.component.html',
    styleUrl: './rt-bottom-sheet.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // rt-tools
        BlockDirective,
        ElemDirective,
        ModDirective,

        // transloco
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
    },
})
export class RtBottomSheetComponent {
    readonly #document: Document = inject(DOCUMENT);
    readonly #stack: RtBottomSheetStackService = inject(RtBottomSheetStackService);
    readonly #onDragMove: (event: PointerEvent) => void = (event: PointerEvent): void => this.#handleDragMove(event);
    readonly #onDragEnd: () => void = (): void => this.#handleDragEnd();

    #dragStartY: number = 0;

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly dragDeltaY: WritableSignal<number> = signal<number>(0);
    protected readonly dragging: WritableSignal<boolean> = signal<boolean>(false);

    /** Открыта, но поверх неё открыта шторка из неё самой: эта спрятана до закрытия верхней. */
    protected readonly covered: Signal<boolean> = computed((): boolean => this.open() && this.#stack.top() !== this);

    public readonly open: InputSignalWithTransform<boolean, BooleanInput> = input.required<boolean, BooleanInput>({
        transform: booleanAttribute,
    });

    /** Идентификатор узла с названием диалога: без него `role="dialog"` читается без имени. */
    public readonly ariaLabelledby: InputSignal<string | null> = input<string | null>(null);

    public readonly openChange: OutputEmitterRef<boolean> = output<boolean>();

    constructor() {
        // Порядок открытия — общий для всех шторок страницы; шторка встаёт в него с открытием.
        effect((): void => {
            if (this.open()) {
                this.#stack.push(this);
            } else {
                this.#stack.remove(this);
            }
        });
        inject(DestroyRef).onDestroy((): void => this.#stack.remove(this));
    }

    protected onDragStart(event: PointerEvent): void {
        this.#dragStartY = event.clientY;
        this.dragging.set(true);
        this.dragDeltaY.set(0);
        this.#document.addEventListener('pointermove', this.#onDragMove);
        this.#document.addEventListener('pointerup', this.#onDragEnd);
    }

    protected dismiss(): void {
        this.openChange.emit(false);
    }

    #handleDragMove(event: PointerEvent): void {
        this.dragDeltaY.set(clampDragDelta(event.clientY - this.#dragStartY));
    }

    #handleDragEnd(): void {
        this.dragging.set(false);
        this.#document.removeEventListener('pointermove', this.#onDragMove);
        this.#document.removeEventListener('pointerup', this.#onDragEnd);
        if (shouldDismissDrag(this.dragDeltaY())) {
            this.openChange.emit(false);
        }
        this.dragDeltaY.set(0);
    }
}
