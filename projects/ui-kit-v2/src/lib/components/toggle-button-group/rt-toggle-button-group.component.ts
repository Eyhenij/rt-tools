import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtIconComponent } from '../icon/rt-icon.component';
import { IRtIcon } from '../icon/rt-icon.model';
import { RtTooltipDirective } from '../tooltip/rt-tooltip.directive';
import { IRtToggleButtonGroup } from './rt-toggle-button-group.model';

const BEM_BLOCK: string = 'rt-toggle-button-group';

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
    styleUrls: ['./rt-toggle-button-group.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        RtIconComponent,
        RtTooltipDirective,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-toggle-button-group--full-width]': 'fullWidth()',
    },
})
export class RtToggleButtonGroupComponent<T = string> {
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
            const chosen: ReadonlyArray<T> = this.values();
            const single: T | undefined = this.value();
            const groupDisabled: boolean = this.disabled();

            return this.options().map((option: IRtToggleButtonGroup.Option<T>): IRtToggleButtonGroup.Rendered<T> => ({
                option,
                active: multiple ? chosen.includes(option.value) : single === option.value,
                disabled: groupDisabled || !!option.disabled,
            }));
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

    public readonly valueChange: OutputEmitterRef<T> = output<T>();

    /**
     * Весь набор выбранного после нажатия, а не разница с прежним: разницу вызывающий сводит со
     * своим состоянием сам, и каждый сводит по-своему.
     */
    public readonly valuesChange: OutputEmitterRef<ReadonlyArray<T>> = output<ReadonlyArray<T>>();

    protected onOptionClick(item: IRtToggleButtonGroup.Rendered<T>): void {
        if (item.disabled) {
            return;
        }

        const option: IRtToggleButtonGroup.Option<T> = item.option;

        if (!this.multiple()) {
            this.valueChange.emit(option.value);

            return;
        }

        const chosen: ReadonlyArray<T> = this.values();
        const next: T[] = chosen.includes(option.value)
            ? chosen.filter((one: T): boolean => one !== option.value)
            : [...chosen, option.value];

        this.valuesChange.emit(next);
    }
}
