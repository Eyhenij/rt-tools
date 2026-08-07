import {
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    InputSignal,
    InputSignalWithTransform,
    numberAttribute,
    Signal,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { IRtLogo } from './rt-logo.model';

/**
 * Высота в px, с которой рисуется вариант, если её не задали явно. `0`
 * означает «брать умолчание варианта».
 */
const DEFAULT_HEIGHT: Readonly<Record<IRtLogo.Variant, number>> = Object.freeze({
    wordmark: 51,
    lockup: 75,
});

/** Отношение ширины к высоте, с которым рисуется вариант без явного `aspect`. */
const DEFAULT_ASPECT: Readonly<Record<IRtLogo.Variant, number>> = Object.freeze({
    wordmark: 5.4,
    lockup: 3.6,
});

const BEM_BLOCK: string = 'rt-logo';

/**
 * Логотип приложения: начертание названия и, в варианте `lockup`, слоган под ним.
 *
 * Сами начертания кит не везёт — их даёт приложение, задав на любом предке
 * четыре свойства оформления: `--rt-logo-wordmark`, `--rt-logo-tagline` и их
 * пару `--rt-logo-wordmark-dark`, `--rt-logo-tagline-dark` для тёмной темы.
 * Пока свойства не заданы, компонент занимает место, но ничего не рисует.
 *
 * ```css
 * :root {
 *     --rt-logo-wordmark: url('/logo/wordmark.svg');
 *     --rt-logo-wordmark-dark: url('/logo/wordmark-inverse.svg');
 * }
 * ```
 *
 * Начертания лежат фоном, а не в `<img>`: у тёмной темы своя пара файлов, и
 * подмена `background-image` — единственный способ переключить их одним правилом.
 */
@Component({
    selector: 'rt-logo',
    templateUrl: './rt-logo.component.html',
    styleUrls: ['./rt-logo.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        BlockDirective,
        ElemDirective,
    ],
    host: {
        class: BEM_BLOCK,
        '[style.height.px]': 'effectiveHeight()',
        '[style.width.px]': 'effectiveWidth()',
        '[attr.role]': "'img'",
        '[attr.aria-label]': 'ariaLabel()',
    },
})
export class RtLogoComponent {
    /** Реальная высота: явно заданная или умолчание варианта. */
    protected readonly effectiveHeight: Signal<number> = computed((): number => {
        const explicit: number = this.height();
        return explicit > 0 ? explicit : DEFAULT_HEIGHT[this.variant()];
    });

    /** Ширина host'а: высота, растянутая по отношению сторон начертания. */
    protected readonly effectiveWidth: Signal<number> = computed((): number => {
        const explicit: number = this.aspect();
        const ratio: number = explicit > 0 ? explicit : DEFAULT_ASPECT[this.variant()];
        return Math.round(this.effectiveHeight() * ratio);
    });

    /** Показывать ли слоган под начертанием. */
    protected readonly showTagline: Signal<boolean> = computed((): boolean => this.variant() === 'lockup');

    public readonly variant: InputSignal<IRtLogo.Variant> = input<IRtLogo.Variant>('lockup');

    /**
     * Высота логотипа в пикселях. `0` означает «использовать умолчание варианта».
     * Принимает строку или число (чтобы писалось как `height="75"`).
     */
    public readonly height: InputSignalWithTransform<number, number | string> = input<number, number | string>(0, {
        transform: numberAttribute,
    });

    /**
     * Отношение ширины к высоте своего начертания. `0` — умолчание варианта.
     * Без него узкий или широкий логотип обрежется или обрастёт пустотой:
     * ширину host'а кит считает сам, а пропорций чужого файла он не знает.
     */
    public readonly aspect: InputSignalWithTransform<number, number | string> = input<number, number | string>(0, {
        transform: numberAttribute,
    });

    /** Подпись для скринридера: обычно название продукта. */
    public readonly ariaLabel: InputSignal<string> = input<string>('');
}
