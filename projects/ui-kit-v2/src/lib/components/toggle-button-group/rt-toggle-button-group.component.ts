import { BooleanInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import {
    afterNextRender,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    DestroyRef,
    ElementRef,
    forwardRef,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    signal,
    Signal,
    viewChild,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
import { IRtIcon } from '@rt-tools/ui-kit-v2/core';
import { RtMultiselectComponent } from '@rt-tools/ui-kit-v2/multiselect';
import { RtRadiusDirective } from '@rt-tools/ui-kit-v2/radius';
import { IRtSelect, RtSelectComponent } from '@rt-tools/ui-kit-v2/select';
import { RtTooltipDirective } from '@rt-tools/ui-kit-v2/tooltip';
import { IRtToggleButtonGroup } from './rt-toggle-button-group.model';
import { RT_TOGGLE_GROUP_UNFOLD_MARGIN_PX, rtToggleGroupNextFolded } from './rt-toggle-button-group-fold.logic';
import { RtToggleButtonOptionDirective } from './rt-toggle-button-option.directive';

const BEM_BLOCK: string = 'rt-toggle-button-group';

/** Сколько после сворачивания не замерять размер: на это время приходится ответ наблюдателя, вызванный самим сворачиванием. */
const FOLD_RESIZE_SETTLE_MS: number = 150;

/**
 * Маппинг размера группы на размер вложенной `<rt-icon>`. rt-icon не имеет
 * промежуточных значений (12 / 16 / 20 / 24 / 32), поэтому `lg` тоже едет
 * на `sm` (16px) — ближе к расчётным 18px у rt-button lg, чем md (20px).
 */
const ICON_SIZE_BY_SIZE: Readonly<Record<IRtToggleButtonGroup.Size, IRtIcon.Size>> = Object.freeze({
    sm: 'xs',
    md: 'sm',
    lg: 'sm',
});

/** Форма записала набор, а не одно значение: так пишет множественный выбор. */
function isMany<T>(value: IRtToggleButtonGroup.FormValue<T>): value is ReadonlyArray<T> {
    return Array.isArray(value);
}

/**
 * Generic segmented control кита.
 *
 * API `toggle-button-group` с тремя особенностями:
 *  1. BEM через `rtBlock/rtElem/rtMod` (camelCase mods → kebab-case в CSS).
 *  2. Tooltip — нативный `[attr.title]` вместо `MatTooltip` (Angular Material
 *     запрещён, см. CLAUDE.md).
 *  3. Визуал — текстовые лейблы + опциональная иконка, а не icon-only кнопки.
 *     Иконка остаётся опциональной, чтобы покрыть оба сценария.
 *
 * Компонент "controlled" — рендерит сегмент с `value === option.value` как
 * активный, эмиттит `valueChange` при клике, обновление `value` остаётся за
 * потребителем.
 *
 * Generic `<T = string>` сохраняет типизацию по value (`'list' | 'grid'`,
 * union'ы, enum'ы). Дефолт `string` нужен, чтобы шаблон-инстанцирование
 * без явного параметра компилировалось.
 */
@Component({
    selector: 'rt-toggle-button-group',
    templateUrl: './rt-toggle-button-group.component.html',
    styleUrls: ['./rt-toggle-button-group.component.scss', './rt-toggle-button-group-chips.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // angular
        NgTemplateOutlet,
        FormsModule,

        // standalone components / directives
        RtIconComponent,
        RtMultiselectComponent,
        RtSelectComponent,
        RtTooltipDirective,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef((): typeof RtToggleButtonGroupComponent => RtToggleButtonGroupComponent),
            multi: true,
        },
    ],
    hostDirectives: [{ directive: RtRadiusDirective, inputs: ['radius'] }],
    host: {
        class: BEM_BLOCK,
        '[class.rt-toggle-button-group--full-width]': 'fullWidth()',
        '[class.rt-toggle-button-group--wrap]': "layout() === 'wrap'",
        '[class.rt-toggle-button-group--column]': "layout() === 'column'",
        '[class.rt-toggle-button-group--md]': "size() === 'md'",
        '[class.rt-toggle-button-group--lg]': "size() === 'lg'",
        '[class.rt-toggle-button-group--chips]': "appearance() === 'chips'",
        '[class.rt-toggle-button-group--foldable]': "fold() && layout() === 'row'",
        '[class.rt-toggle-button-group--folded]': 'folded()',
        '[style.--rt-toggle-button-group-folded-width]': 'foldedWidth()',
    },
})
export class RtToggleButtonGroupComponent<T = string> implements ControlValueAccessor {
    #onChange: (value: IRtToggleButtonGroup.FormValue<T>) => void = (): void => undefined;
    #onTouched: () => void = (): void => undefined;

    /** Группа связана с формой: нажатие тогда само переносит подсветку, без ответа хозяина. */
    #bound: boolean = false;

    /** Ширина строки кнопок в минуту сворачивания: от неё считается, когда развернуть группу обратно. */
    readonly #naturalAtFold: WritableSignal<number | null> = signal<number | null>(null);

    /** Сворачивание только что изменило размер: ближайший ответ наблюдателя размера не замеряется. */
    #ignoreFoldResize: boolean = false;

    /** Значение, записанное формой или нажатием; `undefined`, пока форма ничего не писала. */
    readonly #formValue: WritableSignal<{ readonly value: IRtToggleButtonGroup.FormValue<T> } | undefined> = signal<
        { readonly value: IRtToggleButtonGroup.FormValue<T> } | undefined
    >(undefined);

    /** Отключение, назначенное формой через CVA (`setDisabledState`). */
    readonly #disabledByForm: WritableSignal<boolean> = signal<boolean>(false);

    readonly #host: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    /** Выбранное при одиночном выборе: слово формы, если она его сказала, иначе вход. */
    readonly #single: Signal<T | undefined> = computed((): T | undefined => {
        const written: { readonly value: IRtToggleButtonGroup.FormValue<T> } | undefined = this.#formValue();
        if (written === undefined) {
            return this.value();
        }

        return isMany(written.value) ? undefined : (written.value ?? undefined);
    });

    /** Набор выбранного при множественном выборе: слово формы, если она его сказала, иначе вход. */
    readonly #many: Signal<ReadonlyArray<T>> = computed((): ReadonlyArray<T> => {
        const written: { readonly value: IRtToggleButtonGroup.FormValue<T> } | undefined = this.#formValue();
        if (written === undefined) {
            return this.values();
        }

        return isMany(written.value) ? written.value : [];
    });

    protected readonly isDisabled: Signal<boolean> = computed((): boolean => this.disabled() || this.#disabledByForm());

    /** Своя разметка сегмента; без неё кнопка рисует значок и подпись. */
    protected readonly optionTpl: Signal<RtToggleButtonOptionDirective<T> | undefined> = contentChild(RtToggleButtonOptionDirective);

    protected readonly row: Signal<ElementRef<HTMLElement>> = viewChild.required<ElementRef<HTMLElement>>('row');

    /** Кнопки не помещаются по ширине: группа стоит полем выбора, а строка кнопок только меряется. */
    protected readonly folded: WritableSignal<boolean> = signal<boolean>(false);

    /**
     * Наибольшая ширина свёрнутого поля — строка кнопок плюс запас разворота. Во всё место родителя
     * поле не встаёт: родитель по содержимому подстраивался под узкое поле, места для разворота не
     * появлялось никогда, и группа оставалась полем при пустой половине строки.
     */
    protected readonly foldedWidth: Signal<string | null> = computed((): string | null => {
        const natural: number | null = this.#naturalAtFold();
        return natural === null ? null : `${natural + RT_TOGGLE_GROUP_UNFOLD_MARGIN_PX}px`;
    });

    /** Выбранное одним значением — для свёрнутого одиночного выбора. */
    protected readonly chosenOne: Signal<T | null> = computed((): T | null => this.#single() ?? null);

    /** Выбранное набором — для свёрнутого множественного выбора. */
    protected readonly chosenMany: Signal<T[]> = computed((): T[] => [...this.#many()]);

    /** Значения группы как пункты поля выбора: подпись, значение и недоступность. */
    protected readonly foldedOptions: Signal<IRtSelect.Option<T>[]> = computed((): IRtSelect.Option<T>[] =>
        this.options().map((option: IRtToggleButtonGroup.Option<T>): IRtSelect.Option<T> => ({
            label: option.label,
            value: option.value,
            disabled: !!option.disabled,
        }))
    );

    protected readonly iconSize: Signal<IRtIcon.Size> = computed((): IRtIcon.Size => ICON_SIZE_BY_SIZE[this.size()]);

    /**
     * Сегменты, готовые к отрисовке: подсветка и недоступность посчитаны здесь, а не в шаблоне.
     *
     * Подсветка читается по-разному в одиночном и множественном выборе, а недоступность приходит
     * с двух сторон — от группы и от самого сегмента. Признак группы главнее: доступный сегмент
     * внутри отключённой группы читался бы как её единственное живое место.
     */
    protected readonly items: Signal<ReadonlyArray<IRtToggleButtonGroup.Rendered<T>>> = computed(
        (): ReadonlyArray<IRtToggleButtonGroup.Rendered<T>> => {
            const multiple: boolean = this.multiple();
            const chosen: ReadonlyArray<T> = this.#many();
            const single: T | undefined = this.#single();
            const groupDisabled: boolean = this.isDisabled();

            return this.options().map((option: IRtToggleButtonGroup.Option<T>): IRtToggleButtonGroup.Rendered<T> => {
                const active: boolean = multiple ? chosen.includes(option.value) : single === option.value;

                return { option, active, disabled: groupDisabled || !!option.disabled, context: { $implicit: option, active } };
            });
        }
    );

    public readonly options: InputSignal<ReadonlyArray<IRtToggleButtonGroup.Option<T>>> =
        input.required<ReadonlyArray<IRtToggleButtonGroup.Option<T>>>();

    public readonly value: InputSignal<T | undefined> = input<T | undefined>(undefined);

    /**
     * Множественный выбор: нажатие добавляет сегмент или снимает его, а не переносит выбор.
     *
     * Своим входом, а не расширением типа `value`: вход, у которого тип значения меняется от
     * значения другого входа, не проверяет ни сборка, ни линтер — потребитель узнаёт о своей
     * ошибке, когда группа перестаёт подсвечивать выбранное.
     */
    public readonly multiple: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Набор выбранного. Читается только при множественном выборе, одиночный берёт `value`. */
    public readonly values: InputSignal<ReadonlyArray<T>> = input<ReadonlyArray<T>>([]);

    public readonly ariaLabel: InputSignal<string | null> = input<string | null>(null);

    public readonly size: InputSignal<IRtToggleButtonGroup.Size> = input<IRtToggleButtonGroup.Size>('sm');

    public readonly disabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Растягивает группу на всю ширину контейнера; опции делят ширину поровну. */
    public readonly fullWidth: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /**
     * Раскладка сегментов: одна строка, перенос на следующую или столбик. Перенос нужен длинным
     * спискам во всплывающих окнах, столбик — спискам вроде дней недели.
     */
    public readonly layout: InputSignal<IRtToggleButtonGroup.Layout> = input<IRtToggleButtonGroup.Layout>('row');

    /**
     * Вид группы: дорожка с сегментами или отдельные чипы. Вид — входом, а не классом потребителя:
     * у чипов своя коробка пункта, свой просвет и своя подсветка, и класс снаружи до неё не достаёт.
     */
    public readonly appearance: InputSignal<IRtToggleButtonGroup.Appearance> = input<IRtToggleButtonGroup.Appearance>('segmented');

    /**
     * Галочка перед подписью выбранного пункта, как у фильтр-чипа Material. Выключена по умолчанию:
     * в сегментах выбор и так виден подложкой, а место под галочку раздвигает пункт.
     */
    public readonly checkmark: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /**
     * Свернуть группу в поле выбора, когда кнопки не помещаются по ширине: на телефоне поле
     * открывает список в нижней шторке. `false` оставляет кнопки, даже если они вылезают за край.
     */
    public readonly fold: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });

    /** Свёрнутое поле на телефоне открывает список в нижней шторке; `false` оставляет поповер у поля. */
    public readonly sheet: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });

    public readonly valueChange: OutputEmitterRef<T> = output<T>();

    /**
     * Весь набор выбранного после нажатия, а не разница с прежним: разницу вызывающий сводит со
     * своим состоянием сам, и каждый сводит по-своему.
     */
    public readonly valuesChange: OutputEmitterRef<ReadonlyArray<T>> = output<ReadonlyArray<T>>();

    constructor() {
        // Ширина места и строки меняется и без нового рендера: окно, панель, шрифт. Замер — по
        // наблюдателю размера, как у хлебных крошек; без него в среде без браузера группа — кнопки.
        afterNextRender((): void => {
            if (typeof ResizeObserver === 'undefined') {
                return;
            }
            const watch: ResizeObserver = new ResizeObserver((): void => this.#measure());
            watch.observe(this.#host.nativeElement);
            watch.observe(this.row().nativeElement);
            this.#destroyRef.onDestroy((): void => watch.disconnect());
        });
    }

    public writeValue(value: IRtToggleButtonGroup.FormValue<T>): void {
        this.#formValue.set({ value });
    }

    public registerOnChange(fn: (value: IRtToggleButtonGroup.FormValue<T>) => void): void {
        this.#bound = true;
        this.#onChange = fn;
    }

    public registerOnTouched(fn: () => void): void {
        this.#onTouched = fn;
    }

    public setDisabledState(disabled: boolean): void {
        this.#disabledByForm.set(disabled);
    }

    protected onOptionClick(item: IRtToggleButtonGroup.Rendered<T>): void {
        if (item.disabled) {
            return;
        }

        const option: IRtToggleButtonGroup.Option<T> = item.option;

        if (!this.multiple()) {
            this.#commit(option.value);
            this.valueChange.emit(option.value);

            return;
        }

        const chosen: ReadonlyArray<T> = this.#many();
        const next: T[] = chosen.includes(option.value)
            ? chosen.filter((one: T): boolean => one !== option.value)
            : [...chosen, option.value];

        this.#commit(next);
        this.valuesChange.emit(next);
    }

    /** Выбор в свёрнутом поле одного значения — то же, что нажатие на кнопку. */
    protected onFoldedPickOne(value: T | null): void {
        if (value !== null) {
            this.#commit(value);
            this.valueChange.emit(value);
        }
    }

    /** Выбор в свёрнутом поле набора — весь набор, как после нажатия на кнопку. */
    protected onFoldedPickMany(values: ReadonlyArray<T> | null): void {
        const next: T[] = [...(values ?? [])];
        this.#commit(next);
        this.valuesChange.emit(next);
    }

    /** Сколько нужно строке кнопок и сколько есть у группы. */
    #measure(): void {
        // Размер, который изменило само сворачивание, не замеряется: он принадлежит другой базе флекса
        // и тут же развернул бы группу, а развёрнутая сжалась бы и свернулась снова.
        if (this.#ignoreFoldResize) {
            return;
        }
        const natural: number = this.row().nativeElement.scrollWidth;
        const place: number = this.#host.nativeElement.clientWidth;
        const next: boolean = rtToggleGroupNextFolded(natural, place, this.layout(), this.fold(), this.folded(), this.#naturalAtFold());
        if (next === this.folded()) {
            return;
        }
        this.#naturalAtFold.set(next ? natural : null);
        this.folded.set(next);
        this.#ignoreFoldResize = true;
        // Наблюдатель размера отвечает в ближайшие кадры. После паузы группа замеряется заново: смена
        // места, пришедшаяся на паузу, иначе пропала бы до следующего изменения размера.
        const settle: ReturnType<typeof setTimeout> = setTimeout((): void => {
            this.#ignoreFoldResize = false;
            this.#measure();
        }, FOLD_RESIZE_SETTLE_MS);
        this.#destroyRef.onDestroy((): void => clearTimeout(settle));
    }

    /** Нажатие уходит в форму, если группа с ней связана; без формы подсветку ведёт хозяин входами. */
    #commit(value: IRtToggleButtonGroup.FormValue<T>): void {
        if (!this.#bound) {
            return;
        }
        this.#formValue.set({ value });
        this.#onChange(value);
        this.#onTouched();
    }
}
