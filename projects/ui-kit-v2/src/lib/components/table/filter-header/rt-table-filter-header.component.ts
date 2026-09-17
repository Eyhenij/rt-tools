import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    InputSignal,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
    computed,
    effect,
    inject,
    input,
    output,
    untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';
import { EFilterOperatorType, IFilterModel, TFilterOperatorType } from '@rt-tools/utils';

import { TRtKitLabelKey } from '../../../i18n/rt-kit-labels.model';
import { rtKitLabel } from '../../../i18n/rt-kit-labels.providers';

import { RtDatePickerComponent } from '../../date-picker/rt-date-picker.component';
import { RtIconButtonComponent } from '../../icon-button/rt-icon-button.component';
import { RtInputNumberComponent } from '../../input-number/rt-input-number.component';
import { RtInputComponent } from '../../input/rt-input.component';
import { RtMenuItemComponent } from '../../menu/rt-menu-item.component';
import { RtPopoverDirective } from '../../popover/rt-popover.directive';
import { IRtSelect } from '../../select/rt-select.model';
import { RtSelectComponent } from '../../select/rt-select.component';
import {
    TRtTableFilterInput,
    TRtTableFilterValue,
    filterOf,
    filterValueOf,
    filtersWithOperator,
    filtersWithValue,
    startOperatorOf,
} from '../rt-table-filter.logic';
import { IRtTable } from '../rt-table.model';

const BEM_BLOCK: string = 'rt-table-filter-header';

/** Ключ подписи для каждого вида сравнения: имена операторов даёт словарь кита, а не шаблон. */
const OPERATOR_LABELS: Readonly<Record<TFilterOperatorType, TRtKitLabelKey>> = Object.freeze({
    [EFilterOperatorType.EQUALS]: 'uiFilterEquals',
    [EFilterOperatorType.NOT_EQUALS]: 'uiFilterNotEquals',
    [EFilterOperatorType.CONTAINS]: 'uiFilterContains',
    [EFilterOperatorType.STARTS_WITH]: 'uiFilterStartsWith',
    [EFilterOperatorType.ENDS_WITH]: 'uiFilterEndsWith',
    [EFilterOperatorType.GREATER_THAN]: 'uiFilterGreaterThan',
    [EFilterOperatorType.LESS_THAN]: 'uiFilterLessThan',
});

/** Один вид сравнения в списке: сам вид и его подпись из словаря. */
interface IOperatorView {
    readonly type: TFilterOperatorType;
    readonly label: string;
}

/** Виды сравнения по порядку: колонка разрешает своё подмножество, порядок берётся отсюда. */
const ALL_OPERATORS: readonly TFilterOperatorType[] = Object.freeze([
    EFilterOperatorType.EQUALS,
    EFilterOperatorType.NOT_EQUALS,
    EFilterOperatorType.CONTAINS,
    EFilterOperatorType.STARTS_WITH,
    EFilterOperatorType.ENDS_WITH,
    EFilterOperatorType.GREATER_THAN,
    EFilterOperatorType.LESS_THAN,
]);

/**
 * Отбор в шапке столбца таблицы.
 *
 * Стоит рядом с именем колонки: сужение, живущее в стороне от того, что сужает, не даёт увидеть,
 * какая колонка сузила список — человек читает короткий список и не узнаёт, почему он короткий.
 *
 * Своих полей не рисует ни одного: вид отбора решает, какую готовую часть кита позвать. Поля кита
 * ведутся формой, поэтому значение идёт через `FormControl`, а не входом со своим выходом.
 *
 * Наружу уходит весь набор условий, а не одно изменившееся: потребитель спрашивает сервер набором,
 * и, получив одно условие, держал бы вторую копию набора — две копии расходятся молча. Строк
 * семейство не отбирает: строки принадлежат тому, кто держит список.
 */
@Component({
    selector: 'rt-table-filter-header',
    templateUrl: './rt-table-filter-header.component.html',
    styleUrl: './rt-table-filter-header.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // angular
        ReactiveFormsModule,

        // rt-tools
        BlockDirective,
        ElemDirective,
        ModDirective,

        // components
        RtDatePickerComponent,
        RtIconButtonComponent,
        RtInputComponent,
        RtInputNumberComponent,
        RtMenuItemComponent,
        RtPopoverDirective,
        RtSelectComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtTableFilterHeaderComponent {
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    /**
     * Подпись каждого вида сравнения — своим сигналом словаря. Семь сигналов, а не один по
     * текущему виду: список показывает их все сразу, и подпись невыбранного вида нужна так же.
     */
    readonly #operatorLabels: Readonly<Record<TFilterOperatorType, Signal<string>>> = Object.freeze({
        [EFilterOperatorType.EQUALS]: rtKitLabel(OPERATOR_LABELS[EFilterOperatorType.EQUALS]),
        [EFilterOperatorType.NOT_EQUALS]: rtKitLabel(OPERATOR_LABELS[EFilterOperatorType.NOT_EQUALS]),
        [EFilterOperatorType.CONTAINS]: rtKitLabel(OPERATOR_LABELS[EFilterOperatorType.CONTAINS]),
        [EFilterOperatorType.STARTS_WITH]: rtKitLabel(OPERATOR_LABELS[EFilterOperatorType.STARTS_WITH]),
        [EFilterOperatorType.ENDS_WITH]: rtKitLabel(OPERATOR_LABELS[EFilterOperatorType.ENDS_WITH]),
        [EFilterOperatorType.GREATER_THAN]: rtKitLabel(OPERATOR_LABELS[EFilterOperatorType.GREATER_THAN]),
        [EFilterOperatorType.LESS_THAN]: rtKitLabel(OPERATOR_LABELS[EFilterOperatorType.LESS_THAN]),
    });

    /** Значение ведёт форма: поля кита берут его только так. */
    protected readonly control: FormControl<TRtTableFilterInput> = new FormControl<TRtTableFilterInput>('');

    /** Условие по этой колонке либо `null`: по нему видно и значение, и вид сравнения. */
    protected readonly own: Signal<IFilterModel<string> | null> = computed((): IFilterModel<string> | null =>
        filterOf(this.filters(), this.propertyName())
    );

    protected readonly value: Signal<TRtTableFilterValue> = computed((): TRtTableFilterValue => this.own()?.value ?? '');

    /** Очистка видна только там, где есть что очищать. */
    protected readonly clearable: Signal<boolean> = computed((): boolean => this.value() !== '');

    protected readonly operator: Signal<TFilterOperatorType> = computed((): TFilterOperatorType => {
        const own: IFilterModel<string> | null = this.own();

        return own !== null ? own.operatorType : startOperatorOf(this.filter().operators, this.filter().startOperator);
    });

    /** Виды сравнения, которые разрешила колонка; молчит колонка — разрешены все. */
    protected readonly operators: Signal<readonly TFilterOperatorType[]> = computed((): readonly TFilterOperatorType[] => {
        const allowed: readonly TFilterOperatorType[] | undefined = this.filter().operators;

        return allowed !== undefined && allowed.length > 0 ? allowed : ALL_OPERATORS;
    });

    protected readonly clearLabel: Signal<string> = rtKitLabel('uiClear');
    protected readonly filtersLabel: Signal<string> = rtKitLabel('uiFilters');

    /** Список видов сравнения с подписями: шаблон читает готовое, а не зовёт словарь сам. */
    protected readonly operatorViews: Signal<readonly IOperatorView[]> = computed((): readonly IOperatorView[] =>
        this.operators().map((type: TFilterOperatorType): IOperatorView => ({ type, label: this.#operatorLabels[type]() }))
    );

    /** Подпись текущего вида сравнения — её несёт кнопка, открывающая список. */
    protected readonly operatorLabel: Signal<string> = computed((): string => this.#operatorLabels[this.operator()]());

    protected readonly options: Signal<ReadonlyArray<IRtSelect.Option<string | number>>> = computed(
        (): ReadonlyArray<IRtSelect.Option<string | number>> =>
            (this.filter().options ?? []).map((option: IRtTable.FilterOption): IRtSelect.Option<string | number> => ({
                value: option.value,
                label: option.label,
            }))
    );

    /** Ключ колонки — тот же, что в `cdkColumnDef` и в `[columnsConfig]`. */
    public readonly propertyName: InputSignal<string> = input.required<string>();

    /** Чем колонка отбирает. Объявляет колонка, а не угадывает значение. */
    public readonly filter: InputSignal<IRtTable.ColumnFilter> = input.required<IRtTable.ColumnFilter>();

    /** Текущий набор условий — весь, по всем колонкам сразу. */
    public readonly filters: InputSignal<readonly IFilterModel<string>[]> = input<readonly IFilterModel<string>[]>([]);

    public readonly filtersChange: OutputEmitterRef<readonly IFilterModel<string>[]> = output<readonly IFilterModel<string>[]>();

    constructor() {
        this.control.valueChanges
            .pipe(takeUntilDestroyed(this.#destroyRef))
            .subscribe((value: TRtTableFilterInput): void => this.#onValue(value));

        // Набор условий меняется и снаружи — соседняя колонка, очистка всех сразу. Поле идёт
        // следом, и запись в него молчит: иначе она вернулась бы сюда же переменой значения.
        effect((): void => {
            const value: TRtTableFilterValue = this.value();

            untracked((): void => {
                if (filterValueOf(this.control.value) !== value) {
                    this.control.setValue(value, { emitEvent: false });
                }
            });
        });
    }

    protected onOperator(operatorType: TFilterOperatorType): void {
        this.#report(filtersWithOperator(this.filters(), this.propertyName(), operatorType));
    }

    protected onClear(): void {
        this.control.setValue('');
    }

    #onValue(value: TRtTableFilterInput): void {
        this.#report(filtersWithValue(this.filters(), this.propertyName(), this.operator(), filterValueOf(value)));
    }

    /**
     * Наружу уходит только изменившийся набор. Прежний приходит тем же объектом, и по этому
     * признаку видно, что менять было нечего: повтор того же значения и смена вида сравнения
     * без значения не сообщают ничего.
     */
    #report(next: readonly IFilterModel<string>[]): void {
        if (next !== this.filters()) {
            this.filtersChange.emit(next);
        }
    }
}
