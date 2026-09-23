import {
    afterNextRender,
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

import { iconMaterialDrawn } from './rt-icon-material-map';
import { RT_ICON_MATERIAL_PRESET_SELECTOR } from './rt-icon.const';
import { IRtIcon } from './rt-icon.model';
import { RtIconRegistry } from './rt-icon.registry';

const SIZES: Readonly<Record<IRtIcon.Size, number>> = Object.freeze({
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    '2xl': 40,
});

const COLORS: Readonly<Record<IRtIcon.Color, string>> = Object.freeze({
    current: 'currentColor',
    // Приглушённый тон можно переназначить свойством сверху: поле ввода называет так тон своего
    // значка в наборе оформления. Цвет стоит встроенным стилем, и правилом его не перебить.
    muted: 'var(--rt-icon-color-muted, var(--rt-neutral-600))',
    info: 'var(--rt-color-state-info)',
    success: 'var(--rt-color-state-success)',
    warning: 'var(--rt-color-state-warning)',
    danger: 'var(--rt-color-state-danger)',
    inverse: 'var(--rt-color-text-inverse)',
});

const BEM_BLOCK: string = 'rt-icon';

@Component({
    selector: 'rt-icon',
    templateUrl: './rt-icon.component.html',
    styleUrls: ['./rt-icon.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: BEM_BLOCK,
        '[attr.aria-hidden]': "'true'",
        '[style.width.px]': 'sizePx()',
        '[style.height.px]': 'sizePx()',
        '[style.color]': 'colorValue()',
        '[style.transform]': 'rotateStyle()',
    },
})
export class RtIconComponent {
    readonly #registry: RtIconRegistry = inject(RtIconRegistry);
    readonly #host: ElementRef<HTMLElement> = inject(ElementRef);

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

    protected readonly href: Signal<string> = computed((): string => this.#registry.symbolHref(this.name(), this.preset()));

    /**
     * Набор, которым рисуется этот значок. Материальный закрывает не все имена кита — он слой
     * переопределений, как набор оформления: имя без материального рисунка рисуется своим, и это
     * не пробел.
     */
    protected readonly preset: Signal<IRtIcon.Preset> = computed((): IRtIcon.Preset =>
        this.#preset() === 'material' && iconMaterialDrawn.has(this.name()) ? 'material' : 'base'
    );

    protected readonly sizePx: Signal<number> = computed((): number => SIZES[this.size()]);

    protected readonly colorValue: Signal<string> = computed((): string => COLORS[this.color()]);

    protected readonly rotateStyle: Signal<string | null> = computed((): string | null => {
        const r: number | null = this.rotate();
        return r !== null && r !== 0 ? `rotate(${r}deg)` : null;
    });

    public readonly name: InputSignal<IRtIcon.Name> = input.required<IRtIcon.Name>();

    public readonly size: InputSignal<IRtIcon.Size> = input<IRtIcon.Size>('md');

    public readonly color: InputSignal<IRtIcon.Color> = input<IRtIcon.Color>('current');

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
            this.#registry.request(this.name(), this.preset());
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
