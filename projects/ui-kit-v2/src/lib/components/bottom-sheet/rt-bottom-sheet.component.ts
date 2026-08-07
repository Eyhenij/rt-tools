import { DOCUMENT } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    input,
    InputSignal,
    output,
    OutputEmitterRef,
    signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

// rt-tools
import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

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
        TranslocoPipe,
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-bottom-sheet--open]': 'open()',
        // Закрытый лист остаётся в разметке ради анимации, и спрятан он только
        // стилями — а `opacity`/`pointer-events` не убирают узел ни из порядка
        // табуляции, ни из дерева доступности. Без `inert` страница с закрытым
        // листом держала бы в табуляции невидимую кнопку «Закрыть», а
        // скринридер объявлял бы модальный диалог, которого не видно.
        '[attr.inert]': 'open() ? null : ""',
    },
})
export class RtBottomSheetComponent {
    readonly #document: Document = inject(DOCUMENT);
    readonly #onDragMove: (event: PointerEvent) => void = (event: PointerEvent): void => this.#handleDragMove(event);
    readonly #onDragEnd: () => void = (): void => this.#handleDragEnd();

    #dragStartY: number = 0;

    protected readonly dragDeltaY: WritableSignal<number> = signal<number>(0);
    protected readonly dragging: WritableSignal<boolean> = signal<boolean>(false);

    public readonly open: InputSignal<boolean> = input.required<boolean>();
    public readonly openChange: OutputEmitterRef<boolean> = output<boolean>();

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
