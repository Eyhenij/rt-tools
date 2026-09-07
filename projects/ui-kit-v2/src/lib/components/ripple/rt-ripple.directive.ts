import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, DestroyRef, Directive, ElementRef, inject, input, InputSignalWithTransform, Renderer2 } from '@angular/core';

const BEM_BLOCK: string = 'rt-ripple';

/** Сколько живёт один слой волны. Совпадает с длительностью в стилях блока. */
const RIPPLE_LIFETIME_MS: number = 550;

/**
 * Волна нажатия. Ставится на элемент, который нажимают, и рисует расходящийся
 * от точки касания круг.
 *
 * Волна живёт в своём обрезающем слое внутри элемента, а не прямо в нём:
 * `overflow: hidden` на самой кнопке срезал бы всё, что торчит за её край, —
 * у кнопки-значка так стоит метка, вынесенная на два пикселя наружу.
 *
 * @example
 * ```html
 * <button rtRipple>Сохранить</button>
 * <button rtRipple [rippleDisabled]="loading()">Сохранить</button>
 * ```
 */
@Directive({
    selector: '[rtRipple]',
    host: {
        class: BEM_BLOCK,
        '(pointerdown)': 'launch($event)',
    },
})
export class RtRippleDirective {
    readonly #el: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);
    readonly #renderer: Renderer2 = inject(Renderer2);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    /** Слои, которые ещё гаснут: снимаются, если элемент умрёт раньше их. */
    readonly #live: Set<ReturnType<typeof setTimeout>> = new Set<ReturnType<typeof setTimeout>>();

    /** Обрезающий слой заводится при первом нажатии: у кнопки, которую не нажали, его нет. */
    #area: HTMLElement | null = null;

    /**
     * Отключает волну, не трогая остальное поведение элемента.
     * Отключённая и загружающаяся кнопка волны не даёт.
     */
    public readonly rippleDisabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Гасит незакончившиеся волны: иначе таймер трогает снятый из дерева узел. */
    constructor() {
        this.#destroyRef.onDestroy((): void => {
            for (const timer of this.#live) {
                clearTimeout(timer);
            }
            this.#live.clear();
        });
    }

    /**
     * Ставит один слой волны от точки нажатия и снимает его, когда тот отгорит.
     *
     * Радиус считается по дальнему углу элемента: волна из угла должна накрыть
     * противоположный, иначе на широкой кнопке она обрывается на полпути.
     */
    public launch(event: PointerEvent): void {
        const host: HTMLElement = this.#el.nativeElement;
        if (this.rippleDisabled() || (host as HTMLButtonElement).disabled) {
            return;
        }

        const box: DOMRect = host.getBoundingClientRect();
        const x: number = event.clientX - box.left;
        const y: number = event.clientY - box.top;
        const radius: number = Math.hypot(Math.max(x, box.width - x), Math.max(y, box.height - y));

        const area: HTMLElement = this.#ensureArea(host);
        const layer: HTMLElement = this.#renderer.createElement('span');
        this.#renderer.addClass(layer, `${BEM_BLOCK}__wave`);
        this.#renderer.setStyle(layer, 'left', `${x - radius}px`);
        this.#renderer.setStyle(layer, 'top', `${y - radius}px`);
        this.#renderer.setStyle(layer, 'width', `${radius * 2}px`);
        this.#renderer.setStyle(layer, 'height', `${radius * 2}px`);
        this.#renderer.appendChild(area, layer);

        const timer: ReturnType<typeof setTimeout> = setTimeout((): void => {
            this.#live.delete(timer);
            if (layer.parentNode) {
                this.#renderer.removeChild(area, layer);
            }
        }, RIPPLE_LIFETIME_MS);
        this.#live.add(timer);
    }

    /** Обрезающий слой один на элемент: он повторяет его скругление и не ловит указатель. */
    #ensureArea(host: HTMLElement): HTMLElement {
        if (this.#area?.parentNode) {
            return this.#area;
        }

        const area: HTMLElement = this.#renderer.createElement('span');
        this.#renderer.addClass(area, `${BEM_BLOCK}__area`);
        this.#renderer.setAttribute(area, 'aria-hidden', 'true');
        this.#renderer.appendChild(host, area);
        this.#area = area;

        return area;
    }
}
