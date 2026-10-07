import { BooleanInput } from '@angular/cdk/coercion';
import {
    afterNextRender,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    ElementRef,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    numberAttribute,
    signal,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_ICON_GLYPH_STRATEGY, RtIconFontService } from './rt-icon-font.service';
import { resolveIconGlyph } from './rt-icon-glyph.logic';
import { iconMaterialDrawn } from './rt-icon-material-map';
import { RT_ICON_MATERIAL_PRESET_SELECTOR } from './rt-icon.const';
import { IRtIcon } from '@rt-tools/ui-kit-v2/core';
import { RtIconRegistry } from './rt-icon.registry';

const SIZES: Readonly<Record<IRtIcon.Size, number>> = Object.freeze({
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    '2xl': 40,
});

/* Без переданного цвета значок цвета не пишет: `currentColor` строкой стиля перебивал правило
   стилей, которое красит значок снаружи, — значок опасного пункта меню оставался цвета текста. */
const COLORS: Readonly<Record<IRtIcon.Color, string | null>> = Object.freeze({
    current: null,
    // Приглушённый тон можно переназначить свойством сверху: поле ввода называет так тон своего
    // значка в наборе оформления. Цвет стоит встроенным стилем, и правилом его не перебить.
    muted: 'var(--rt-icon-color-muted, var(--rt-neutral-600))',
    info: 'var(--rt-color-state-info)',
    success: 'var(--rt-color-state-success)',
    warning: 'var(--rt-color-state-warning)',
    danger: 'var(--rt-color-state-danger)',
    inverse: 'var(--rt-color-text-inverse)',
});

function isSizeStep(value: string): value is IRtIcon.Size {
    return Object.hasOwn(SIZES, value);
}

/** Ступень или число пикселей — в пиксели. Числовая строка читается числом, прочее — ступенью `md`. */
function toSizePx(value: IRtIcon.SizeInput | string): number {
    if (typeof value === 'number') {
        return value > 0 ? value : SIZES.md;
    }
    if (isSizeStep(value)) {
        return SIZES[value];
    }
    const px: number = numberAttribute(value, 0);
    return px > 0 ? px : SIZES.md;
}

const BEM_BLOCK: string = 'rt-icon';

@Component({
    selector: 'rt-icon',
    templateUrl: './rt-icon.component.html',
    styleUrls: ['./rt-icon.component.scss'],
    imports: [BlockDirective, ElemDirective, ModDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: BEM_BLOCK,
        '[attr.aria-hidden]': "'true'",
        '[style.width.px]': 'sizePx()',
        '[style.height.px]': 'sizePx()',
        '[style.color]': 'colorValue()',
        '[style.transform]': 'rotateStyle()',
        '[class.rt-icon--spin]': 'spin()',
    },
})
export class RtIconComponent {
    readonly #registry: RtIconRegistry = inject(RtIconRegistry);
    readonly #host: ElementRef<HTMLElement> = inject(ElementRef);
    readonly #strategy: IRtIcon.GlyphStrategy = inject(RT_ICON_GLYPH_STRATEGY);
    readonly #fontReady: Signal<boolean> = inject(RtIconFontService).ready;

    /**
     * Набор, объявленный разметкой над этим значком.
     *
     * Читается у разметки, а не выбирается стилями: ссылку на символ спрайта CSS подменить нечем,
     * и второй `<use>` рядом с первым тоже не годится — он вечно указывает на символ, за которым
     * никто не ходил, а обвязка снимков ждёт, пока нарисуется каждый.
     *
     * Спрашивается ближайший предок, а не корень страницы: признак набора стоит и на контейнере,
     * и на одной странице законно живут оба набора рядом.
     *
     * Один раз после первой отрисовки: на сервере разметки нет вовсе, а признак набора страница
     * по ходу жизни не переставляет — его ставит приложение своей разметкой.
     */
    readonly #preset: WritableSignal<IRtIcon.Preset> = signal<IRtIcon.Preset>('base');

    /** Чем рисуется значок: именем кита или лигатурой шрифта. Ни имени, ни глифа — пустое место. */
    protected readonly resolved: Signal<IRtIcon.Resolved | null> = computed((): IRtIcon.Resolved | null =>
        resolveIconGlyph(this.name(), this.glyph(), this.#strategy)
    );

    protected readonly kitName: Signal<IRtIcon.Name | null> = computed((): IRtIcon.Name | null => {
        const resolved: IRtIcon.Resolved | null = this.resolved();
        return resolved?.kind === 'kit' ? resolved.name : null;
    });

    protected readonly fontGlyph: Signal<string | null> = computed((): string | null => {
        const resolved: IRtIcon.Resolved | null = this.resolved();
        return resolved?.kind === 'font' ? resolved.glyph : null;
    });

    /** Лигатура прячется, пока шрифты страницы не готовы: до того она рисуется словом. */
    protected readonly glyphMods: Signal<Record<string, boolean>> = computed((): Record<string, boolean> => ({
        filled: this.fill(),
        pending: !this.#fontReady(),
    }));

    protected readonly href: Signal<string | null> = computed((): string | null => {
        const name: IRtIcon.Name | null = this.kitName();
        return name === null ? null : this.#registry.symbolHref(name, this.drawing());
    });

    /**
     * Набор, которым рисуется этот значок. Материальный закрывает не все имена кита — он слой
     * переопределений, как набор оформления: имя без материального рисунка рисуется своим, и это
     * не пробел.
     */
    protected readonly preset: Signal<IRtIcon.Preset> = computed((): IRtIcon.Preset => {
        const name: IRtIcon.Name | null = this.kitName();
        return this.#preset() === 'material' && name !== null && iconMaterialDrawn.has(name) ? 'material' : 'base';
    });

    /** Рисунок значка: залитый бывает только у материального набора, свой набор заливки не знает. */
    protected readonly drawing: Signal<IRtIcon.Drawing> = computed((): IRtIcon.Drawing => {
        if (this.preset() === 'base') {
            return 'base';
        }
        return this.fill() ? 'material-fill' : 'material';
    });

    protected readonly sizePx: Signal<number> = computed((): number => this.size());

    protected readonly colorValue: Signal<string | null> = computed((): string | null => COLORS[this.color()]);

    protected readonly rotateStyle: Signal<string | null> = computed((): string | null => {
        const r: number | null = this.rotate();
        return r !== null && r !== 0 ? `rotate(${r}deg)` : null;
    });

    /** Имя кита. Стоит рядом с глифом и побеждает его, когда переданы оба. */
    public readonly name: InputSignal<IRtIcon.Name | null> = input<IRtIcon.Name | null>(null);

    /**
     * Имя Material вместо имени кита. Как оно рисуется — парой из перечня кита или лигатурой
     * шрифта Material Symbols — решает настройка `glyphStrategy` у `provideRtIcons()`. Шрифт
     * приложение подключает само; семья берётся из свойства `--rt-icon-glyph-font`.
     */
    public readonly glyph: InputSignal<string | null> = input<string | null>(null);

    /**
     * Ступень размера или число пикселей — для размеров между ступенями и крупнее последней.
     * Числовая строка из статического атрибута читается числом, прочая строка вне ступеней — `md`.
     * Внутри вход хранит пиксели: ступень переводится в них при записи.
     */
    public readonly size: InputSignalWithTransform<number, IRtIcon.SizeInput | string> = input<number, IRtIcon.SizeInput | string>(
        SIZES.md,
        { transform: toSizePx }
    );

    public readonly color: InputSignal<IRtIcon.Color> = input<IRtIcon.Color>('current');

    /**
     * Залитый рисунок вместо контурного — как `FILL 1` у значка первого кита. Действует в
     * материальном наборе; свой набор рисует значок одним рисунком. Дефолт `false`.
     */
    public readonly fill: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /**
     * Значок вращается — как индикатор занятости внутри кнопки или строки. Когда система просит
     * меньше движения, вращение медленнее. Поворот на время вращения уступает ему. Дефолт `false`.
     */
    public readonly spin: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly rotate: InputSignalWithTransform<number | null, TRotateInput> = input<number | null, TRotateInput>(null, {
        transform: (v: TRotateInput): number | null => {
            if (v === null || v === '') {
                return null;
            }
            return numberAttribute(v, 0);
        },
    });

    constructor() {
        // Значок едет по запросу имени, а не вперёд всем набором: страница платит за то, что
        // нарисовала. Смена имени просит новое — прежний символ остаётся в спрайте.
        effect((): void => {
            const name: IRtIcon.Name | null = this.kitName();
            if (name !== null) {
                this.#registry.request(name, this.drawing());
            }
        });

        // Разметка над значком видна только в браузере и только после первой отрисовки:
        // контейнер с признаком набора рисует то же приложение.
        afterNextRender((): void => {
            if (this.#host.nativeElement.closest(RT_ICON_MATERIAL_PRESET_SELECTOR)) {
                this.#preset.set('material');
            }
        });
    }
}

type TRotateInput = number | string | null;
