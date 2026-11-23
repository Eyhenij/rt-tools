import { BooleanInput } from '@angular/cdk/coercion';
import {
    afterRenderEffect,
    booleanAttribute,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
} from '@angular/core';

import { rtDateWheelHome, rtDateWheelIndex, rtDateWheelNearest, rtDateWheelTop, rtDateWheelValue } from '../rt-date-wheel.logic';

/** Сколько колонка должна простоять без прокрутки, чтобы значение под полосой считалось выбранным. */
const WHEEL_SETTLE_MS: number = 120;
/** Высота строки барабана там, где её нечем измерить: в окружении без раскладки. */
const FALLBACK_ROW_PX: number = 40;

/**
 * Барабан выбора времени в шторке, как в iOS: колонка значений прокручивается под полосой выбора,
 * стоящей по центру, и выбрано то значение, которое остановилось под ней. Значение, выбранное
 * нажатием, колонка сама подкручивает под полосу. Вид барабана дают стили панели; директива ведёт только прокрутку и
 * сообщает номер остановившегося значения. Выключенная, она колонку не трогает: у поля на широком
 * экране колонка остаётся списком, и значение в нём выбирает нажатие.
 */
@Directive({
    selector: '[rtDateWheel]',
    host: {
        '(scroll)': 'onScroll()',
        '(touchstart)': 'onTouch(true)',
        '(touchend)': 'onTouch(false)',
        '(touchcancel)': 'onTouch(false)',
        '(keydown.arrowdown)': 'onStep(1, $event)',
        '(keydown.arrowup)': 'onStep(-1, $event)',
    },
})
export class RtDateWheelDirective {
    readonly #column: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    #timer: ReturnType<typeof setTimeout> | null = null;
    /** Колонка уже вставала под полосу: первый раз она встаёт сразу, дальше подкручивается плавно. */
    #aligned: boolean = false;
    /** Палец лежит на колонке: пока он не отпущен, значение под полосой выбранным не считается. */
    #touching: boolean = false;

    public readonly enabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        alias: 'rtDateWheel',
        transform: booleanAttribute,
    });

    /** Номер выбранного значения в колонке; значения нет — `-1`. */
    public readonly index: InputSignal<number> = input<number>(-1, { alias: 'rtDateWheelIndex' });

    /**
     * Сколько значений в круге. Колонка барабана повторяет круг несколько раз, и барабан крутится без
     * конца: остановившись, он тихо возвращается в домашний круг — к тому же значению посередине колонки.
     */
    public readonly loop: InputSignal<number> = input<number>(0, { alias: 'rtDateWheelLoop' });

    /** Под полосой остановилось другое значение: его номер в круге. */
    public readonly pick: OutputEmitterRef<number> = output<number>({ alias: 'rtDateWheelPick' });

    constructor() {
        // Выбранное значение стоит под полосой: и при открытии, и когда его сменили не прокруткой —
        // кнопкой «Сейчас» или отказом принять значение за границей.
        afterRenderEffect((): void => {
            if (this.enabled() && this.index() >= 0) {
                this.#align(this.index(), this.#aligned ? 'smooth' : 'auto');
                this.#aligned = true;
                this.#followFocus();
            }
        });
        inject(DestroyRef).onDestroy((): void => this.#clearTimer());
    }

    protected onScroll(): void {
        if (!this.enabled()) {
            return;
        }
        this.#clearTimer();
        this.#timer = setTimeout((): void => this.#settle(), WHEEL_SETTLE_MS);
    }

    /** Палец лёг на колонку или отпущен. Отпущенный, он запускает ожидание остановки заново. */
    protected onTouch(down: boolean): void {
        this.#touching = down;
        if (!down) {
            this.onScroll();
        }
    }

    /**
     * Стрелка вверх или вниз сдвигает выбор на одно значение по кругу. Tab в барабане стоит только
     * на выбранном значении: обход всех строк прокручивал бы колонку и менял выбор сам.
     */
    protected onStep(delta: number, event: Event): void {
        const count: number = this.#count();
        if (!this.enabled() || this.index() < 0 || count <= 0) {
            return;
        }
        event.preventDefault();
        this.pick.emit((this.index() + delta + count) % count);
    }

    #settle(): void {
        if (this.#touching) {
            return;
        }
        const under: number = this.#under();
        // Выключенная строка — значение за границей: его не выбрать, и колонка возвращается к выбранному.
        if (this.#column.children.item(under)?.hasAttribute('disabled') ?? true) {
            this.#align(this.index(), 'smooth');
            return;
        }
        const at: number = rtDateWheelValue(under, this.#count());
        this.#report(at);
        // Барабан встаёт в домашний круг — к тому же значению посередине колонки, — и крутить его
        // можно дальше в обе стороны.
        this.#align(at, 'auto');
    }

    #report(at: number): void {
        if (at >= 0 && at !== this.index()) {
            this.pick.emit(at);
        }
    }

    /** Номер строки колонки, стоящей под полосой. */
    #under(): number {
        return rtDateWheelIndex(this.#column.scrollTop, this.#row(), this.#column.children.length);
    }

    /** Сколько значений в круге: без входа `loop` круг — вся колонка. */
    #count(): number {
        return this.loop() > 0 ? this.loop() : this.#column.children.length;
    }

    /** Фокус, стоявший в колонке, идёт за выбранным значением: стрелки меняют его, не теряя места. */
    #followFocus(): void {
        const active: Element | null = this.#column.ownerDocument.activeElement;
        const chosen: HTMLElement | null = this.#column.querySelector<HTMLElement>('[aria-pressed="true"]');
        if (chosen !== null && !chosen.contains(active) && this.#column.contains(active)) {
            chosen.focus({ preventScroll: true });
        }
    }

    /** Система просит убрать движение — колонка встаёт на место сразу, без подкрутки. */
    #calm(behavior: ScrollBehavior): ScrollBehavior {
        const view: Window | null = this.#column.ownerDocument.defaultView;
        const reduced: boolean = typeof view?.matchMedia === 'function' && view.matchMedia('(prefers-reduced-motion: reduce)').matches;

        return reduced ? 'auto' : behavior;
    }

    #align(at: number, asked: ScrollBehavior): void {
        if (at < 0) {
            return;
        }
        const behavior: ScrollBehavior = this.#calm(asked);
        const count: number = this.#count();
        const turns: number = Math.max(1, Math.round(this.#column.children.length / Math.max(1, count)));
        // Сразу колонка встаёт в домашний круг; плавно подъезжает к ближайшей строке со значением.
        const row: number = behavior === 'smooth' ? rtDateWheelNearest(at, count, turns, this.#under()) : rtDateWheelHome(at, count, turns);
        const top: number = rtDateWheelTop(row, this.#row());
        if (Math.abs(this.#column.scrollTop - top) < 1) {
            return;
        }
        if (typeof this.#column.scrollTo === 'function') {
            this.#column.scrollTo({ top, behavior });
        } else {
            this.#column.scrollTop = top;
        }
    }

    #row(): number {
        const first: Element | null = this.#column.firstElementChild;
        const height: number = first === null ? 0 : first.getBoundingClientRect().height;

        return height > 0 ? height : FALLBACK_ROW_PX;
    }

    #clearTimer(): void {
        if (this.#timer !== null) {
            clearTimeout(this.#timer);
            this.#timer = null;
        }
    }
}
