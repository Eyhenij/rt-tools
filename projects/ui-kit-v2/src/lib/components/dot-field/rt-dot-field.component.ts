import {
    afterNextRender,
    inject,
    viewChild,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    Signal,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective, WINDOW } from '@rt-tools/core';

import { RtDotFieldPainter } from './rt-dot-field.painter';

const BEM_BLOCK: string = 'rt-dot-field';

/**
 * Фон из квадратных точек, которые медленно плывут облаками. Заполняет позиционированного
 * родителя и стоит под его содержимым; в центре точки редеют. Цвет — CSS-свойство `color` хоста.
 */
@Component({
    selector: 'rt-dot-field',
    templateUrl: './rt-dot-field.component.html',
    styleUrl: './rt-dot-field.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        BlockDirective,
        ElemDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtDotFieldComponent {
    readonly #window: Window = inject(WINDOW);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    /** `viewChild` не принимает поле с решёткой. */
    protected readonly canvas: Signal<ElementRef<HTMLCanvasElement>> = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

    constructor() {
        afterNextRender((): void => {
            const painter: RtDotFieldPainter = new RtDotFieldPainter(this.canvas().nativeElement, this.#window);
            painter.start();
            this.#destroyRef.onDestroy((): void => painter.stop());
        });
    }
}
