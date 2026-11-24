import { BooleanInput } from '@angular/cdk/coercion';
import {
    afterRenderEffect,
    booleanAttribute,
    Directive,
    ElementRef,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
} from '@angular/core';

/** Дольше плавная прокрутка ряда не идёт: без события её конца перенос возвращается по этому сроку. */
const STEER_LIMIT_MS: number = 1000;

/**
 * Ряд чипов в шторке — карусель: чипы стоят в одну строку, ряд прокручивается вбок по кругу, выбранный
 * чип встаёт по центру. Ряд в разметке повторён трижды; прокрутка, ушедшая в крайний повтор, тихо
 * переносится на тот же чип среднего. Вид — затенение краёв и строку без переноса — дают стили панели.
 * Выключенная, директива ряд не трогает: у поля на широком экране чипы стоят столбцом.
 */
@Directive({
    selector: '[rtChipCarousel]',
    host: {
        '(scroll)': 'onScroll()',
    },
})
export class RtChipCarouselDirective {
    readonly #row: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    /** Ряд уже вставал на место: первый раз он встаёт сразу, дальше подъезжает плавно. */
    #placed: boolean = false;

    /**
     * Ряд подъезжает к выбранному чипу плавно: перенос на ширину повтора оборвал бы движение на
     * полпути, поэтому до конца прокрутки ряд не переносится.
     */
    #steering: boolean = false;

    public readonly enabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        alias: 'rtChipCarousel',
        transform: booleanAttribute,
    });

    /** Сколько чипов в одном повторе ряда. */
    public readonly loop: InputSignal<number> = input<number>(0, { alias: 'rtChipCarouselLoop' });

    /** Номер выбранного чипа в повторе; выбранного нет — `-1`, и средний повтор встаёт от начала. */
    public readonly index: InputSignal<number> = input<number>(-1, { alias: 'rtChipCarouselIndex' });

    constructor() {
        afterRenderEffect((): void => {
            if (this.enabled() && this.loop() > 0) {
                this.#center(this.index(), this.#placed ? 'smooth' : 'auto');
                this.#placed = true;
            }
        });
    }

    /** Прокрутка ушла в крайний повтор — ряд переносится на ширину повтора, вид не меняется. */
    protected onScroll(): void {
        const span: number = this.#span();
        if (!this.enabled() || span <= 0 || this.#steering) {
            return;
        }
        const start: number = this.#chip(this.loop())?.offsetLeft ?? 0;
        const first: number = this.#chip(0)?.offsetLeft ?? 0;
        const left: number = this.#row.scrollLeft;
        const home: number = start - first;
        // Расстояние от среднего повтора в целых повторах: ушли дальше половины — ряд переносится назад.
        const turns: number = Math.round((left - home) / span);
        if (turns !== 0) {
            this.#row.scrollLeft = left - turns * span;
        }
    }

    #center(at: number, asked: ScrollBehavior): void {
        const left: number | null = this.#target(at, asked === 'smooth');
        if (left === null || Math.abs(this.#row.scrollLeft - left) < 1) {
            return;
        }
        const behavior: ScrollBehavior = this.#calm(asked);
        if (typeof this.#row.scrollTo !== 'function') {
            this.#row.scrollLeft = left;
            return;
        }
        if (behavior === 'smooth') {
            this.#steer();
        }
        this.#row.scrollTo({ left, behavior });
    }

    /**
     * Куда встать ряду. Первый раз — в средний повтор; дальше выбранный чип берётся из того повтора,
     * что ближе к нынешней прокрутке, и ряд едет кратчайшим путём по кругу.
     */
    #target(at: number, nearest: boolean): number | null {
        const first: number = this.#chip(0)?.offsetLeft ?? 0;
        const place: (copy: number) => number | null = (copy: number): number | null => {
            const chip: HTMLElement | null = this.#chip(copy * this.loop() + Math.max(at, 0));
            if (chip === null) {
                return null;
            }
            // Без выбранного повтор встаёт так, как первый стоит до прокрутки; выбранный — по центру.
            return at < 0 ? chip.offsetLeft - first : chip.offsetLeft + chip.offsetWidth / 2 - this.#row.clientWidth / 2;
        };
        if (!nearest || at < 0) {
            return place(1);
        }
        const now: number = this.#row.scrollLeft;

        return [0, 2]
            .map(place)
            .filter((left: number | null): left is number => left !== null)
            .reduce(
                (best: number | null, left: number): number | null =>
                    best === null || Math.abs(left - now) < Math.abs(best - now) ? left : best,
                place(1)
            );
    }

    /** Плавная прокрутка идёт: перенос ждёт её конца, а за ним ряд тихо встаёт в средний повтор. */
    #steer(): void {
        this.#steering = true;
        const done: () => void = (): void => {
            if (!this.#steering) {
                return;
            }
            this.#steering = false;
            this.#row.removeEventListener('scrollend', done);
            this.onScroll();
        };
        this.#row.addEventListener('scrollend', done);
        // Браузер без события конца прокрутки: перенос возвращается, когда плавное движение заведомо кончилось.
        this.#row.ownerDocument.defaultView?.setTimeout(done, STEER_LIMIT_MS);
    }

    /** Ширина одного повтора: от первого чипа до первого чипа следующего повтора. */
    #span(): number {
        const first: HTMLElement | null = this.#chip(0);
        const next: HTMLElement | null = this.#chip(this.loop());

        return first === null || next === null ? 0 : next.offsetLeft - first.offsetLeft;
    }

    #chip(at: number): HTMLElement | null {
        const node: Element | null = this.#row.children.item(at);

        return node instanceof HTMLElement ? node : null;
    }

    /** Система просит убрать движение — ряд встаёт на место сразу. */
    #calm(behavior: ScrollBehavior): ScrollBehavior {
        const view: Window | null = this.#row.ownerDocument.defaultView;
        const reduced: boolean = typeof view?.matchMedia === 'function' && view.matchMedia('(prefers-reduced-motion: reduce)').matches;

        return reduced ? 'auto' : behavior;
    }
}
