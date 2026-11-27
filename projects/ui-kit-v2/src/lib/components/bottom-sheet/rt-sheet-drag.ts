import { signal, WritableSignal } from '@angular/core';

import { clampDragDelta, shouldDismissDrag } from './rt-bottom-sheet.logic';

/**
 * Перетаскивание шторки за ручку: сдвиг панели за пальцем и решение, закрывать ли её. Жест,
 * прерванный системой (звонок, жест от края экрана), не закрывает шторку и снимает слушатели: иначе
 * сдвиг оставался, и следующее касание где угодно закрывало её старым сдвигом.
 */
export class RtSheetDrag {
    /** Сдвиг панели вниз в точках, пока идёт перетаскивание. */
    public readonly deltaY: WritableSignal<number> = signal<number>(0);
    /** Идёт ли перетаскивание. */
    public readonly dragging: WritableSignal<boolean> = signal<boolean>(false);

    readonly #doc: Document;
    readonly #dismiss: () => void;
    #startY: number = 0;
    readonly #onMove: (event: PointerEvent) => void = (event: PointerEvent): void =>
        this.deltaY.set(clampDragDelta(event.clientY - this.#startY));
    readonly #onEnd: () => void = (): void => this.#end();
    readonly #onCancel: () => void = (): void => this.stop();

    constructor(doc: Document, dismiss: () => void) {
        this.#doc = doc;
        this.#dismiss = dismiss;
    }

    public start(event: PointerEvent): void {
        this.stop();
        this.#startY = event.clientY;
        this.dragging.set(true);
        this.#doc.addEventListener('pointermove', this.#onMove);
        this.#doc.addEventListener('pointerup', this.#onEnd);
        this.#doc.addEventListener('pointercancel', this.#onCancel);
    }

    /** Конец перетаскивания без решения: слушатели сняты, панель вернулась на место. */
    public stop(): void {
        this.dragging.set(false);
        this.#doc.removeEventListener('pointermove', this.#onMove);
        this.#doc.removeEventListener('pointerup', this.#onEnd);
        this.#doc.removeEventListener('pointercancel', this.#onCancel);
        this.deltaY.set(0);
    }

    #end(): void {
        const dismissed: boolean = shouldDismissDrag(this.deltaY());
        this.stop();
        if (dismissed) {
            this.#dismiss();
        }
    }
}
