import { DOCUMENT } from '@angular/common';
import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    Renderer2,
    Signal,
} from '@angular/core';

import { IRtBadge } from './rt-badge.model';

const BEM_BLOCK: string = 'rt-badge';

/** Метка узла пузырька: по ней клиент находит пузырёк из серверной разметки и не ставит второй. */
const BUBBLE_MARK: string = 'data-rt-badge';

/**
 * Пузырёк-счётчик на углу любого элемента: «Отели 12» у подписи вкладки, непрочитанные у пункта
 * меню, отметка на дне календаря. Своей обёртки нет: директива ставится на сам элемент, и пузырёк
 * встаёт в него последним узлом.
 *
 * С `rtBadgeOverlap` (умолчание) пузырёк накрывает угол хоста, как у значка; без него стоит рядом,
 * за краем хоста, — так подпись не перекрывается. Пустое значение и `rtBadgeHidden` убирают его.
 *
 * Стили директивы подключены общим набором кита: своего представления у неё нет.
 */
@Directive({
    selector: '[rtBadge]',
    host: {
        class: 'rt-badge-host',
    },
})
export class RtBadgeDirective {
    readonly #host: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);
    readonly #renderer: Renderer2 = inject(Renderer2);
    readonly #doc: Document = inject(DOCUMENT);
    #bubble: HTMLElement | null = null;

    /** Текст пузырька: число как есть, пустая строка и `null` — пузырька нет. */
    protected readonly text: Signal<string> = computed((): string => {
        const value: IRtBadge.Value = this.rtBadge();
        return value === null ? '' : String(value);
    });

    protected readonly classes: Signal<readonly string[]> = computed((): readonly string[] => [
        BEM_BLOCK,
        `${BEM_BLOCK}--position--${this.rtBadgePosition()}`,
        `${BEM_BLOCK}--size--${this.rtBadgeSize()}`,
        `${BEM_BLOCK}--color--${this.rtBadgeColor()}`,
        ...(this.rtBadgeOverlap() ? [`${BEM_BLOCK}--overlap`] : []),
        ...(this.rtBadgeHidden() || this.text() === '' ? [`${BEM_BLOCK}--hidden`] : []),
    ]);

    public readonly rtBadge: InputSignalWithTransform<IRtBadge.Value, IRtBadge.ValueInput> = input<IRtBadge.Value, IRtBadge.ValueInput>(
        null,
        {
            transform: (value: IRtBadge.ValueInput): IRtBadge.Value => value ?? null,
        }
    );

    /** Пузырёк накрывает угол хоста; без этого стоит рядом, за его краем. */
    public readonly rtBadgeOverlap: InputSignalWithTransform<boolean, unknown> = input(true, { transform: booleanAttribute });

    public readonly rtBadgeHidden: InputSignalWithTransform<boolean, unknown> = input(false, { transform: booleanAttribute });

    public readonly rtBadgePosition: InputSignal<IRtBadge.Position> = input<IRtBadge.Position>('above-after');

    public readonly rtBadgeSize: InputSignal<IRtBadge.Size> = input<IRtBadge.Size>('md');

    public readonly rtBadgeColor: InputSignal<IRtBadge.Color> = input<IRtBadge.Color>('primary');

    constructor() {
        inject(DestroyRef).onDestroy((): void => this.#bubble?.remove());

        effect((): void => {
            // Пузырёк встаёт в хост при первом проходе, а не в конструкторе: в конструкторе детей
            // хоста ещё нет, и пузырёк оказался бы первым узлом — число читалось бы до подписи.
            const bubble: HTMLElement = (this.#bubble ??= this.#takeBubble());
            if (bubble.parentNode !== this.#host.nativeElement) {
                this.#renderer.appendChild(this.#host.nativeElement, bubble);
            }
            bubble.textContent = this.text();
            bubble.className = this.classes().join(' ');
        });
    }

    /**
     * Пузырёк хоста. После серверной отрисовки он уже стоит в хосте: гидратация оставляет узлы, а
     * директива на клиенте создаётся заново, и новый узел встал бы вторым пузырьком рядом.
     */
    #takeBubble(): HTMLElement {
        const rendered: Element | undefined = Array.from(this.#host.nativeElement.children).find((child: Element): boolean =>
            child.hasAttribute(BUBBLE_MARK)
        );
        if (rendered instanceof HTMLElement) {
            return rendered;
        }

        const bubble: HTMLElement = this.#doc.createElement('span');
        bubble.setAttribute('qa-dataid', 'badge');
        bubble.setAttribute(BUBBLE_MARK, '');
        return bubble;
    }
}
