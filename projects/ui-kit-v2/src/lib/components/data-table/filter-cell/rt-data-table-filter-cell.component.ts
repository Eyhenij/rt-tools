import {
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    linkedSignal,
    output,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IRtInput } from '@rt-tools/ui-kit-v2/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { EFilterOperatorType, IFilterModel, TFilterOperatorType, transformArrayInput } from '@rt-tools/utils';

import { RT_KIT_TRANSLATOR, rtKitLabel, TRtKitLabelKey, TRtKitTranslator } from '@rt-tools/ui-kit-v2/core';
import { RtDatePickerComponent } from '@rt-tools/ui-kit-v2/date-picker';
import { RtIconButtonComponent } from '@rt-tools/ui-kit-v2/icon-button';
import { IRtIcon } from '@rt-tools/ui-kit-v2/core';
import { RtInputNumberComponent } from '@rt-tools/ui-kit-v2/input-number';
import { RtInputComponent } from '@rt-tools/ui-kit-v2/input';
import { RtMenuItemComponent } from '@rt-tools/ui-kit-v2/menu';
import { RtMenuComponent } from '@rt-tools/ui-kit-v2/menu';
import { RtSelectComponent } from '@rt-tools/ui-kit-v2/select';
import { IRtSelect } from '@rt-tools/ui-kit-v2/select';
import { dataTableIconName } from '../rt-data-table-cell.logic';
import {
    DATA_TABLE_FILTER_MENU_OPERATORS,
    DATA_TABLE_FILTER_OPERATOR_GLYPHS,
    dataTableColumnFilter,
    dataTableDayToIso,
    dataTableDefaultOperator,
    dataTableFiltersWithOperator,
    dataTableFiltersWithValue,
    dataTableIsoToDay,
    TRtDataTableFilterValue,
} from '../rt-data-table-filter.logic';
import { ERtDataTableFilterType, IRtDataTable } from '@rt-tools/ui-kit-v2/core';

const BEM_BLOCK: string = 'rt-data-table-filter-cell';

/** Значок кнопки вида сравнения, которому первый кит значка не дал. */
const FALLBACK_OPERATOR_ICON: IRtIcon.Name = 'ellipsis-h';

const OPERATOR_LABELS: Readonly<Partial<Record<TFilterOperatorType, TRtKitLabelKey>>> = {
    [EFilterOperatorType.EQUALS]: 'dataTableFilterOperatorEquals',
    [EFilterOperatorType.NOT_EQUALS]: 'dataTableFilterOperatorNotEquals',
    [EFilterOperatorType.CONTAINS]: 'dataTableFilterOperatorContains',
    [EFilterOperatorType.GREATER_THAN]: 'dataTableFilterOperatorGreaterThan',
    [EFilterOperatorType.LESS_THAN]: 'dataTableFilterOperatorLessThan',
};

/** Одно и то же условие: колонка, вид сравнения и значение совпадают. */
function sameFilter<KEY extends string>(a: IFilterModel<KEY>, b: IFilterModel<KEY>): boolean {
    return a.propertyName === b.propertyName && a.operatorType === b.operatorType && a.value === b.value;
}

interface IOperatorItem {
    operator: TFilterOperatorType;
    icon: IRtIcon.Name;
    label: string;
}

/**
 * Ячейка строки отбора `rt-data-table` — ячейка отбора первого кита на полях кита.
 *
 * Своих условий у ячейки нет: она читает набор приложения и отдаёт ему новый при каждой смене.
 * Текст и число фиксируются по Enter и уходу с поля, дата — выбором дня, список — выбором пункта;
 * пустое значение снимает условие колонки. Кнопка вида сравнения предлагает остальные виды.
 */
@Component({
    selector: 'rt-data-table-filter-cell',
    templateUrl: './rt-data-table-filter-cell.component.html',
    styleUrl: './rt-data-table-filter-cell.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // components
        RtDatePickerComponent,
        RtIconButtonComponent,
        RtInputComponent,
        RtInputNumberComponent,
        RtMenuComponent,
        RtMenuItemComponent,
        RtSelectComponent,

        // directives
        BlockDirective,
        ElemDirective,
        FormsModule,
    ],
    host: { class: BEM_BLOCK },
})
export class RtDataTableFilterCellComponent<KEY extends string = string> {
    readonly #translate: Signal<TRtKitTranslator> = inject(RT_KIT_TRANSLATOR);
    readonly #host: ElementRef<HTMLElement> = inject(ElementRef);
    readonly #titleCase: TitleCasePipe = new TitleCasePipe();

    /** Набранное, но ещё не зафиксированное значение текстового и числового поля. */
    #draft: TRtDataTableFilterValue | null = null;

    protected readonly filterTypes: typeof ERtDataTableFilterType = ERtDataTableFilterType;

    protected readonly valuePlaceholder: Signal<string> = rtKitLabel('dataTableFilterValuePlaceholder');
    protected readonly selectPlaceholder: Signal<string> = rtKitLabel('dataTableFilterSelectPlaceholder');
    protected readonly clearLabel: Signal<string> = rtKitLabel('dataTableFilterClear');

    /**
     * Условие своей колонки из набора приложения. Сверяется по содержимому: набор меняется целиком
     * и по чужой колонке, а своё условие при этом остаётся тем же — и выбранный здесь вид
     * сравнения пустой колонки сбрасывать нечем.
     */
    readonly #ownFilter: Signal<IFilterModel<KEY>> = computed(
        (): IFilterModel<KEY> =>
            dataTableColumnFilter(this.filterModel(), this.filterProperty(), dataTableDefaultOperator(this.defaultFilterOperator())),
        { equal: sameFilter }
    );

    /** Условие колонки: из набора приложения, а вид сравнения без условия помнит сама ячейка. */
    protected readonly currentFilter: WritableSignal<IFilterModel<KEY>> = linkedSignal((): IFilterModel<KEY> => this.#ownFilter());

    protected readonly hasValue: Signal<boolean> = computed(() => !!this.currentFilter().value);

    protected readonly day: Signal<string> = computed(() => dataTableIsoToDay(this.currentFilter().value));

    protected readonly number: Signal<number | null> = computed(() => {
        const value: number = Number(this.currentFilter().value);

        return this.currentFilter().value === '' || Number.isNaN(value) ? null : value;
    });

    protected readonly operatorIcon: Signal<IRtIcon.Name> = computed(() => this.#operatorIcon(this.currentFilter().operatorType));

    protected readonly operatorLabel: Signal<string> = computed(() =>
        this.#operatorLabel(this.#translate(), this.currentFilter().operatorType)
    );

    /**
     * Пункты меню — предложенные колонкой виды в порядке первого кита, кроме нынешнего: его первый кит
     * в меню не выводит, нынешний вид показывает кнопка.
     */
    protected readonly operatorItems: Signal<IOperatorItem[]> = computed(() => {
        const translate: TRtKitTranslator = this.#translate();
        const current: TFilterOperatorType = this.currentFilter().operatorType;

        return DATA_TABLE_FILTER_MENU_OPERATORS.filter(
            (operator: TFilterOperatorType) => operator !== current && this.filterOperators().includes(operator)
        ).map((operator: TFilterOperatorType) => ({
            operator,
            icon: this.#operatorIcon(operator),
            label: this.#operatorLabel(translate, operator),
        }));
    });

    protected readonly selectOptions: Signal<IRtSelect.Option<string>[]> = computed(() =>
        this.filterSelectOptions().map((option: string) => ({ label: this.#titleCase.transform(option), value: option }))
    );

    /** Колонка, по которой отбирает ячейка. */
    /** Вид полей отбора: `outline` — рамка со всех сторон, `fill` — залитое поле с чертой снизу. */
    public readonly appearance: InputSignal<IRtInput.Appearance> = input<IRtInput.Appearance>('outline');

    public readonly filterProperty: InputSignal<KEY> = input.required<KEY>();
    public readonly filterType: InputSignal<IRtDataTable.FilterType> = input.required<IRtDataTable.FilterType>();

    /** Весь набор условий приложения. */
    public readonly filterModel: InputSignalWithTransform<IFilterModel<KEY>[], IFilterModel<KEY>[] | null | undefined> = input<
        IFilterModel<KEY>[],
        IFilterModel<KEY>[] | null | undefined
    >([], { transform: transformArrayInput });

    public readonly defaultFilterOperator: InputSignal<TFilterOperatorType | null | undefined> = input<
        TFilterOperatorType | null | undefined
    >(null);

    public readonly filterOperators: InputSignalWithTransform<TFilterOperatorType[], TFilterOperatorType[] | null | undefined> = input<
        TFilterOperatorType[],
        TFilterOperatorType[] | null | undefined
    >([], { transform: transformArrayInput });

    public readonly filterSelectOptions: InputSignalWithTransform<string[], string[] | null | undefined> = input<
        string[],
        string[] | null | undefined
    >([], { transform: transformArrayInput });

    public readonly filterChange: OutputEmitterRef<IFilterModel<KEY>[]> = output<IFilterModel<KEY>[]>();

    /** Набор в поле: пустое поле — это очистка, она фиксируется сразу, как у первого кита. */
    protected onDraft(value: TRtDataTableFilterValue | null): void {
        this.#draft = value ?? '';

        if (this.#draft === '') {
            this.onCommit();
        }
    }

    /** Enter и уход с поля фиксируют набранное. */
    protected onCommit(): void {
        if (this.#draft !== null) {
            this.onValueChange(this.#draft);
            this.#draft = null;
        }
    }

    protected onNumberDraft(value: number | null): void {
        this.onDraft(value === null ? '' : String(value));
    }

    protected onDayChange(day: string | null): void {
        this.onValueChange(dataTableDayToIso(day ?? ''));
    }

    protected onValueChange(value: TRtDataTableFilterValue | null): void {
        const next: TRtDataTableFilterValue = value ?? '';
        const current: IFilterModel<KEY> = this.currentFilter();

        if (next === current.value) {
            return;
        }

        const filters: IFilterModel<KEY>[] | null = dataTableFiltersWithValue(this.filterModel(), current, next);

        if (filters) {
            this.filterChange.emit(filters);
        }

        this.currentFilter.set({ ...current, value: next });
    }

    /**
     * Сброс крестиком переводит фокус в поле рядом.
     *
     * Без значения крестик выключается, и выключенная кнопка роняет фокус на `body`: человек с
     * клавиатуры оказывается в начале страницы.
     */
    protected onClear(): void {
        this.onValueChange('');
        this.#host.nativeElement.querySelector<HTMLElement>(`.${BEM_BLOCK}__field button, .${BEM_BLOCK}__field input`)?.focus();
    }

    protected onOperatorChange(operatorType: TFilterOperatorType): void {
        const current: IFilterModel<KEY> = this.currentFilter();
        const filters: IFilterModel<KEY>[] | null = dataTableFiltersWithOperator(this.filterModel(), current, operatorType);

        if (filters) {
            this.filterChange.emit(filters);
        }

        this.currentFilter.set({ ...current, operatorType });
    }

    #operatorIcon(operator: TFilterOperatorType): IRtIcon.Name {
        const glyph: string | null = DATA_TABLE_FILTER_OPERATOR_GLYPHS[operator];

        return (glyph && dataTableIconName(glyph)) || FALLBACK_OPERATOR_ICON;
    }

    #operatorLabel(translate: TRtKitTranslator, operator: TFilterOperatorType): string {
        const key: TRtKitLabelKey | undefined = OPERATOR_LABELS[operator];

        return key ? translate(key) : this.#titleCase.transform(operator);
    }
}
