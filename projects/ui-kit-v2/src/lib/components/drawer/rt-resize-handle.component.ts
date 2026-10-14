import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    numberAttribute,
    output,
    OutputEmitterRef,
    signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { clampWidth, IRtDrawer } from './rt-drawer.model';

const BEM_BLOCK: string = 'rt-resize-handle';

/** Шаг стрелки по умолчанию, в пикселях. */
const DEFAULT_STEP: number = 16;

interface IDragStart {
    readonly pointerId: number;
    readonly x: number;
    readonly width: number;
}

/**
 * Ручка ширины панели: узкая полоса на краю, которую тянут указателем или двигают стрелками.
 *
 * Ширину ручка не хранит. Она сообщает новую через `widthChange`, а владелец панели решает, принять
 * ли её. Значение всегда лежит в пределах `[min, max]`. `Home` и `End` ставят границы.
 *
 * Без `width` ручка берёт ширину панели, в которой стоит, в момент первого движения. Так панель
 * шириной по содержимому начинает тянуться с той ширины, которую видит человек.
 */
@Component({
    selector: 'rt-resize-handle',
    template: '',
    styleUrl: './rt-resize-handle.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: BEM_BLOCK,
        role: 'separator',
        tabindex: '0',
        'qa-dataid': 'resize-handle',
        'aria-orientation': 'vertical',
        '[attr.aria-valuenow]': 'width()',
        '[attr.aria-valuemin]': 'min()',
        '[attr.aria-valuemax]': 'max()',
        '[attr.aria-label]': 'ariaLabel()',
        '[class.rt-resize-handle--edge--start]': "edge() === 'start'",
        '[class.rt-resize-handle--edge--end]': "edge() === 'end'",
        '[class.rt-resize-handle--dragging]': 'dragging()',
        '(pointerdown)': 'startDrag($event)',
        '(pointermove)': 'drag($event)',
        '(pointerup)': 'endDrag($event)',
        '(pointercancel)': 'endDrag($event)',
        // Захват указателя теряется и без отпускания — окно ушло из фокуса, жест системы. Без этого
        // ручка осталась бы в перетаскивании, а панель — без движения ширины.
        '(lostpointercapture)': 'onLostCapture($event)',
        '(keydown)': 'onKeydown($event)',
    },
})
export class RtResizeHandleComponent {
    readonly #host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    #start: IDragStart | null = null;

    protected readonly dragging: WritableSignal<boolean> = signal(false);

    /** Текущая ширина панели; `null` — ручка измерит панель сама. */
    public readonly width: InputSignal<number | null> = input<number | null>(null);

    public readonly min: InputSignalWithTransform<number, unknown> = input(0, { transform: numberAttribute });

    public readonly max: InputSignalWithTransform<number, unknown> = input(Number.MAX_SAFE_INTEGER, { transform: numberAttribute });

    /** Сколько пикселей добавляет одно нажатие стрелки. */
    public readonly step: InputSignalWithTransform<number, unknown> = input(DEFAULT_STEP, { transform: numberAttribute });

    /** На каком краю панели стоит ручка: `start` у панели справа, `end` у панели слева. */
    public readonly edge: InputSignal<IRtDrawer.Edge> = input<IRtDrawer.Edge>('end');

    public readonly ariaLabel: InputSignal<string | null> = input<string | null>(null);

    public readonly widthChange: OutputEmitterRef<number> = output<number>();

    /** Тянуть начали: true, отпустили — false. Пока тянут, панель гасит свой переход ширины. */
    public readonly resizing: OutputEmitterRef<boolean> = output<boolean>();

    protected startDrag(event: PointerEvent): void {
        if (event.button !== 0) {
            return;
        }
        event.preventDefault();
        this.#host.setPointerCapture?.(event.pointerId);
        this.#start = { pointerId: event.pointerId, x: event.clientX, width: this.#currentWidth() };
        this.dragging.set(true);
        this.resizing.emit(true);
    }

    protected drag(event: PointerEvent): void {
        const start: IDragStart | null = this.#start;

        if (start === null || start.pointerId !== event.pointerId) {
            return;
        }
        const shift: number = event.clientX - start.x;

        this.#report(start.width + (this.edge() === 'start' ? -shift : shift));
    }

    protected endDrag(event: PointerEvent): void {
        if (this.#start === null || this.#start.pointerId !== event.pointerId) {
            return;
        }
        this.#host.releasePointerCapture?.(event.pointerId);
        this.#start = null;
        this.dragging.set(false);
        this.resizing.emit(false);
    }

    /** Захват потерян без отпускания: перетаскивание кончается так же, как отпусканием. */
    protected onLostCapture(event: PointerEvent): void {
        this.endDrag(event);
    }

    protected onKeydown(event: KeyboardEvent): void {
        const target: number | null = this.#keyTarget(event.key);

        if (target === null) {
            return;
        }
        event.preventDefault();
        this.#report(target);
    }

    #keyTarget(key: string): number | null {
        const grow: string = this.edge() === 'start' ? 'ArrowLeft' : 'ArrowRight';
        const shrink: string = this.edge() === 'start' ? 'ArrowRight' : 'ArrowLeft';

        switch (key) {
            case grow:
                return this.#currentWidth() + this.step();
            case shrink:
                return this.#currentWidth() - this.step();
            case 'Home':
                return this.min();
            case 'End':
                return this.max();
            default:
                return null;
        }
    }

    #report(width: number): void {
        const next: number = Math.round(clampWidth(width, this.min(), this.max()));

        if (next !== this.width()) {
            this.widthChange.emit(next);
        }
    }

    #currentWidth(): number {
        return this.width() ?? this.#host.parentElement?.getBoundingClientRect().width ?? this.min();
    }
}
