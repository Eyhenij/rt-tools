import { NgTemplateOutlet } from '@angular/common';
import {
    afterRenderEffect,
    ChangeDetectionStrategy,
    Component,
    contentChild,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
    input,
    InputSignal,
    signal,
    Signal,
    TemplateRef,
    Type,
    viewChild,
    WritableSignal,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { TNullable } from '@rt-tools/utils';

@Directive({
    selector: '[rtuiScrollableHeader]',
})
export class RtuiScrollableContainerHeaderDirective {}

@Directive({
    selector: '[rtuiScrollableContent]',
})
export class RtuiScrollableContainerContentDirective {}

@Directive({
    selector: '[rtuiScrollableFooter]',
})
export class RtuiScrollableContainerFooterDirective {}

const BEM_BLOCK: string = 'rtui-scrollable';

@Component({
    selector: 'rtui-scrollable',
    host: { class: BEM_BLOCK },
    templateUrl: './scrollable-container.component.html',
    styleUrls: ['./scrollable-container.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BlockDirective, ElemDirective, NgTemplateOutlet, MatIcon, MatTooltip],
})
export class RtuiScrollableContainerComponent {
    /** Подпись значка. Словаря у кита нет, и подпись зашита по-английски, как соседние. */
    protected readonly scrollHintLabel: string = 'Scroll down';

    protected readonly bodyRef: Signal<TNullable<ElementRef<HTMLElement>>> = viewChild<ElementRef<HTMLElement>>('body');

    /**
     * Ниже окна области ещё есть содержимое. Считается по трём числам самого узла, а не по числу
     * пунктов: область не знает, что ей подали, и высота строки у каждого потребителя своя.
     */
    protected readonly hasMoreBelow: WritableSignal<boolean> = signal(false);

    public readonly headerTpl: Signal<TNullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiScrollableContainerHeaderDirective, {
        read: TemplateRef,
    });
    public readonly contentTpl: Signal<TNullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiScrollableContainerContentDirective, {
        read: TemplateRef,
    });
    public readonly footerTpl: Signal<TNullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiScrollableContainerFooterDirective, {
        read: TemplateRef,
    });

    /**
     * Признак того, что снизу осталось непоказанное. Выключен по умолчанию: область рисуют
     * десятки экранов, и признак, поставленный безусловно, сдвинул бы вид каждому из них.
     */
    public readonly isScrollHintShown: InputSignal<boolean> = input<boolean>(false);

    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    /**
     * Наблюдатель за размером тела. Событие прокрутки приходит только после движения руки, а
     * список не влезает уже в первую минуту показа: без наблюдателя признак появлялся бы у того,
     * кто и так догадался прокрутить, и молчал у того, кому он нужен.
     */
    #sizeWatch: TNullable<ResizeObserver> = null;

    constructor() {
        afterRenderEffect((): void => {
            const body: TNullable<ElementRef<HTMLElement>> = this.bodyRef();

            this.onBodyScroll();

            if (!body || this.#sizeWatch) {
                return;
            }

            if (typeof ResizeObserver === 'undefined') {
                return;
            }

            this.#sizeWatch = new ResizeObserver((): void => this.onBodyScroll());
            this.#sizeWatch.observe(body.nativeElement);
        });

        this.#destroyRef.onDestroy((): void => {
            this.#sizeWatch?.disconnect();
            this.#sizeWatch = null;
        });
    }

    public onBodyScroll(): void {
        const body: TNullable<ElementRef<HTMLElement>> = this.bodyRef();

        if (!body) {
            this.hasMoreBelow.set(false);

            return;
        }

        const node: HTMLElement = body.nativeElement;

        // Целый пиксель запаса: дробная высота строки оставляет остаток, при котором прокрутка
        // уже в самом низу, а разность всё ещё больше нуля — признак висел бы навсегда.
        this.hasMoreBelow.set(node.scrollHeight - node.scrollTop - node.clientHeight > 1);
    }
}
