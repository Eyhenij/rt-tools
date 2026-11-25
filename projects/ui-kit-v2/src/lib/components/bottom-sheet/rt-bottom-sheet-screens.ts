/**
 * Смена экранов одной шторки: второй экран, открытый из первого, и возврат к первому шевроном,
 * свайпом или Escape. Высота панели переходит от экрана к экрану, а не скачет, и содержимое въезжает
 * коротким сдвигом с проявлением: вперёд — справа, назад — слева. Длительность — та же, что у выезда
 * шторки (`--rt-bottom-sheet-transition-duration`); человек, попросивший систему убавить движение,
 * получает смену без движения.
 *
 * Сама высота экранов задана стилями: второй экран не ниже первого (`--rt-bottom-sheet-nested-height`
 * как наименьшая высота), растёт по содержимому до предела шторки во всю высоту — полосы 12 сверху.
 * Здесь только переход между двумя высотами, уже нарисованными стилями.
 */

import { afterNextRender, ApplicationRef, DestroyRef, Injector, signal, WritableSignal } from '@angular/core';

/** Сдвиг содержимого при смене экрана, в точках. */
const SCREEN_SHIFT_PX: number = 16;

/** Части панели, которые въезжают с новым экраном; ручка стоит на месте. */
const SCREEN_PARTS: string = ':scope > .rt-bottom-sheet__header, :scope > .rt-bottom-sheet__body, :scope > .rt-bottom-sheet__footer';

/** Длительность выезда шторки, если свойство не прочиталось. */
const FALLBACK_DURATION_MS: number = 200;

/** Направление смены: `1` — вперёд, ко второму экрану; `-1` — назад, к первому. */
export type TRtSheetScreenStep = 1 | -1;

/** Длительность из значения свойства: `200ms` или `0.2s`. */
export function rtMotionDurationMs(value: string): number {
    const text: string = value.trim();
    const amount: number = Number.parseFloat(text);
    if (!Number.isFinite(amount)) {
        return FALLBACK_DURATION_MS;
    }

    return text.endsWith('ms') ? amount : amount * 1000;
}

/** Ключевые кадры высоты панели: от высоты прежнего экрана к высоте нового. */
function rtScreenHeightFrames(from: number, to: number): Keyframe[] {
    return [{ height: `${from}px` }, { height: `${to}px` }];
}

/** Ключевые кадры содержимого: вперёд въезжает справа, назад — слева. */
function rtScreenContentFrames(step: TRtSheetScreenStep): Keyframe[] {
    return [
        { opacity: 0, transform: `translateX(${step * SCREEN_SHIFT_PX}px)` },
        { opacity: 1, transform: 'none' },
    ];
}

/**
 * Переход панели к новому экрану: высота — от `from` к нынешней высоте панели, содержимое въезжает
 * с той стороны, куда идёт смена. Без движения — если человек попросил его убавить или браузер не
 * умеет анимаций.
 */
export function rtSwitchSheetScreen(host: HTMLElement, from: number, step: TRtSheetScreenStep): number {
    const panel: HTMLElement | null = host.querySelector<HTMLElement>(':scope > .rt-bottom-sheet__panel');
    const view: Window | null = host.ownerDocument.defaultView;
    const to: number = panel?.getBoundingClientRect().height ?? 0;
    if (panel === null || view === null || typeof panel.animate !== 'function') {
        return to;
    }
    if (view.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true) {
        return to;
    }
    const options: KeyframeAnimationOptions = {
        duration: rtMotionDurationMs(view.getComputedStyle(host).getPropertyValue('--rt-bottom-sheet-transition-duration')),
        easing: 'ease',
    };
    if (from > 0 && Math.abs(to - from) >= 1) {
        panel.animate(rtScreenHeightFrames(from, to), options);
    }
    panel.querySelectorAll<HTMLElement>(SCREEN_PARTS).forEach((part: HTMLElement): void => {
        part.animate(rtScreenContentFrames(step), options);
    });

    return to;
}

/** Шторка, вторым экраном которой открыта эта: её высота и её смена экранов. */
export interface IRtSheetUnder {
    readonly height: () => number;
    readonly screens: RtBottomSheetScreens;
}

/**
 * Экраны одной шторки. Шторка, открытая из другой, — её второй экран: встаёт на её место, не ниже
 * её, без выезда, слева в шапке у неё шеврон «назад». Признак держится и на закрытии: второй экран
 * уходит так же без выезда, и первый виден сразу — переходом к своей высоте.
 */
export class RtBottomSheetScreens {
    readonly #host: HTMLElement;
    readonly #injector: Injector;
    /**
     * Снятие самой шторки и снятие приложения. Оба взяты при создании, пока инжекторы живы: снятый
     * инжектор на любой запрос отвечает исключением NG0205. Когда уходит вся страница, приложение
     * снимается раньше представлений: второй экран уходит, когда первый ещё стоит, а его инжектор
     * приложения уже снят, — и смена экранов, начатая в этот миг, обрывала снятие страницы.
     */
    readonly #destroyRefs: readonly DestroyRef[];
    #under: IRtSheetUnder | null = null;
    /** Высота, которой второй экран встал после смены; `null` — он уже ушёл или не вставал. */
    #shown: number | null = null;

    /** Шторка открыта из другой шторки: она — второй экран той же шторки. */
    public readonly nested: WritableSignal<boolean> = signal<boolean>(false);

    /**
     * Высота панели нижней шторки — наименьшая высота второго экрана; второй экран идёт за ней, когда
     * окно меняет размер. `null` — шторка не вложена.
     */
    public readonly nestedHeight: WritableSignal<number | null> = signal<number | null>(null);

    constructor(host: HTMLElement, injector: Injector) {
        this.#host = host;
        this.#injector = injector;
        // Приложение — его корневой инжектор: инжектор окружения шторки бывает дочерним (оверлей,
        // маршрут) и стоит, когда корень уже снят.
        this.#destroyRefs = [injector.get(DestroyRef), injector.get(ApplicationRef).injector.get(DestroyRef)];
    }

    /** Открытие поверх другой шторки делает эту её вторым экраном: высота переходит от первого. */
    public nestOver(under: IRtSheetUnder | null): void {
        this.#under = under;
        this.#shown = null;
        this.nested.set(under !== null);
        this.followUnder();
        if (under !== null) {
            this.switchFrom(under.height(), 1);
        }
    }

    /** Наименьшая высота второго экрана — нынешняя высота панели нижней шторки. */
    public followUnder(): void {
        this.nestedHeight.set(this.#under === null ? null : this.#under.height());
    }

    /**
     * Второй экран ушёл — закрылся или снят вместе со своим оверлеем: первый возвращается к своей
     * высоте от высоты второго, содержимое — слева. Уход считается один раз.
     */
    public leave(): void {
        const shown: number | null = this.#shown;
        this.#shown = null;
        if (shown !== null) {
            this.#under?.screens.switchFrom(shown, -1);
        }
    }

    /** Смена экрана после отрисовки: высота от прежнего экрана к своей, содержимое въезжает. */
    public switchFrom(from: number, step: TRtSheetScreenStep): void {
        // Шторка, снятая вместе со своей страницей, экранов не меняет.
        if (this.#destroyRefs.some((ref: DestroyRef): boolean => ref.destroyed)) {
            return;
        }
        afterNextRender(
            (): void => {
                const to: number = rtSwitchSheetScreen(this.#host, from, step);
                if (step > 0) {
                    this.#shown = to;
                }
            },
            { injector: this.#injector }
        );
    }
}
