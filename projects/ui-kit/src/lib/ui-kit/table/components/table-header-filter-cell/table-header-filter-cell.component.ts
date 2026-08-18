import {
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    inject,
    Injector,
    input,
    InputSignal,
    InputSignalWithTransform,
    OnInit,
    output,
    OutputEmitterRef,
    signal,
    Signal,
    WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDatepicker, MatDatepickerInput, MatDatepickerModule, MatDatepickerToggle } from '@angular/material/datepicker';

import {
    EFilterOperatorType,
    FILTER_OPERATORS,
    TFilterOperatorType,
    IFilterModel,
    TNullable,
    isString,
    transformArrayInput,
} from '@rt-tools/utils';
import { BreakpointService, ConcatClassesPipe, RtIconOutlinedDirective } from '@rt-tools/core';
import { ITable, ETableColumnFilterTypes } from '../../util/table-column.interface';
import { MatFormField, MatFormFieldAppearance, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatOption, provideNativeDateAdapter } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { TitleCasePipe } from '@angular/common';
import { isDate } from '@rt-tools/utils';
import { RtuiClearButtonComponent } from '../clear-search-button/rtui-clear-button.component';
import { BlockDirective } from '@rt-tools/core';
import { MatTooltip } from '@angular/material/tooltip';

const BEM_BLOCK: string = 'rtui-table-header-filter-cell';

@Component({
    selector: 'rtui-table-header-filter-cell',
    host: { class: BEM_BLOCK },
    templateUrl: './table-header-filter-cell.component.html',
    styleUrls: ['./table-header-filter-cell.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [BreakpointService, provideNativeDateAdapter()],
    imports: [
        ConcatClassesPipe,
        FormsModule,

        // Material
        MatIcon,
        MatIconButton,
        MatSuffix,
        MatDatepickerModule,
        MatFormField,
        MatInput,
        MatMenu,
        MatMenuTrigger,
        MatMenuItem,
        MatDatepickerToggle,
        MatDatepicker,
        MatDatepickerInput,
        MatSelect,
        MatOption,
        MatTooltip,

        // Pipes
        TitleCasePipe,

        // Directives
        RtIconOutlinedDirective,
        BlockDirective,

        // Components
        RtuiClearButtonComponent,
    ],
})
export class RtuiTableHeaderFilterCellComponent<
    ENTITY_TYPE extends Record<string, unknown>,
    KEY extends Extract<keyof ENTITY_TYPE, string>,
> implements OnInit {
    readonly #breakpoints: BreakpointService = inject(BreakpointService);
    readonly #injector: Injector = inject(Injector);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    /** Экран узкий: значение входа, если приложение его дало, иначе замер кита. */
    // eslint-disable-next-line sonarjs/deprecation -- вход оставлен ради приложений, которые его уже передают, — кит определяет узкий экран сам и читает вход только как запасной ответ
    protected readonly narrow: Signal<boolean> = computed(() => this.isMobile() ?? !!this.#breakpoints.isMobile());

    protected readonly filterTypes: typeof ETableColumnFilterTypes = ETableColumnFilterTypes;
    protected readonly filterOperatorTypes: typeof EFilterOperatorType = EFilterOperatorType;

    /** Current elements appearance */
    public appearance: InputSignal<MatFormFieldAppearance> = input.required();
    /** Filter property */
    public filterProperty: InputSignalWithTransform<KEY, unknown> = input.required<KEY, unknown>({
        transform: (value: unknown): KEY => (isString(value) ? value : value?.toString) as KEY,
    });
    /** Filter cell type */
    public filterType: InputSignal<ITable.FilterType> = input.required();
    /** Current filter model from store */
    public filterModel: InputSignalWithTransform<IFilterModel<KEY>[], IFilterModel<KEY>[]> = input.required<
        IFilterModel<KEY>[],
        IFilterModel<KEY>[]
    >({
        transform: (value: IFilterModel<KEY>[]) => transformArrayInput(value),
    });
    /** Filter property */
    public defaultFilterOperator: InputSignalWithTransform<TFilterOperatorType, TFilterOperatorType> = input.required<
        TFilterOperatorType,
        TFilterOperatorType
    >({
        transform: (value: TFilterOperatorType): TFilterOperatorType =>
            value && FILTER_OPERATORS.includes(value) ? value : EFilterOperatorType.EQUALS,
    });
    /** Available filter operators */
    public filterOperators: InputSignalWithTransform<TFilterOperatorType[], TFilterOperatorType[]> = input<
        TFilterOperatorType[],
        TFilterOperatorType[]
    >([], {
        transform: (value: TFilterOperatorType[]) => transformArrayInput(value),
    });
    /** List of selected filter models */
    public filterSelectOptions: InputSignalWithTransform<string[], string[]> = input<string[], string[]>([], {
        transform: (value: string[]) => transformArrayInput(value),
    });
    /**
     * Признак узкого экрана.
     *
     * @deprecated Кит определяет его сам — `BreakpointService` из `@rt-tools/core`. Вход
     * оставлен ради приложений, которые уже его передают, и уйдёт в следующем крупном выпуске.
     */
    public isMobile: InputSignal<TNullable<boolean>> = input<TNullable<boolean>>(null);

    /** Filter change output action */
    public readonly filterChange: OutputEmitterRef<IFilterModel<KEY>[]> = output<IFilterModel<KEY>[]>();

    public readonly currentFilter: WritableSignal<IFilterModel<KEY>> = signal({
        propertyName: '' as KEY,
        operatorType: EFilterOperatorType.EQUALS,
        value: '',
    });

    public ngOnInit(): void {
        toObservable(this.filterModel, { injector: this.#injector })
            .pipe(takeUntilDestroyed(this.#destroyRef))
            .subscribe((filterModel: IFilterModel<KEY>[]) => {
                this.currentFilter.set(
                    filterModel?.length && filterModel.find((el: IFilterModel<KEY>) => el.propertyName === this.filterProperty())
                        ? (filterModel.find((el: IFilterModel<KEY>) => el.propertyName === this.filterProperty()) as IFilterModel<KEY>)
                        : {
                              operatorType: this.defaultFilterOperator(),
                              propertyName: this.filterProperty(),
                              value: '',
                          }
                );
            });
    }

    /** Change filter value */
    public onFilterValueChange(value: number | string | Date): void {
        // Дата хранится строкой, и сверять её надо в том же виде: `Date` не равен строке никогда,
        // и без приведения повторный выбор той же даты каждый раз считался бы новым значением.
        const nextValue: string | number | boolean = isDate(value) ? value.toISOString() : value;

        if (nextValue === this.currentFilter().value) {
            return;
        }

        let updatedFilterModel: IFilterModel<KEY>[] = this.filterModel();

        if (updatedFilterModel.find((el: IFilterModel<KEY>) => el.propertyName === this.filterProperty())) {
            if (nextValue) {
                updatedFilterModel = updatedFilterModel.map((el: IFilterModel<KEY>) =>
                    el.propertyName === this.filterProperty() ? { ...el, value: nextValue } : el
                );
            } else {
                updatedFilterModel = updatedFilterModel.filter((el: IFilterModel<KEY>) => el.propertyName !== this.filterProperty());
            }
            this.filterChange.emit(updatedFilterModel);
        } else if (nextValue) {
            updatedFilterModel.push({
                propertyName: this.filterProperty(),
                operatorType: this.currentFilter().operatorType,
                value: nextValue,
            });
            this.filterChange.emit(updatedFilterModel);
        } else {
            // Отбора по этой колонке ещё нет, и значения тоже — списку отбора менять нечего.
        }

        this.currentFilter.update((filter: IFilterModel<KEY>) => ({ ...filter, value: nextValue }));
    }

    /** Change filter operator */
    public onFilterOperatorChange(operatorType: TFilterOperatorType): void {
        if (operatorType === this.currentFilter().operatorType) {
            return;
        }

        let updatedFilterModel: IFilterModel<KEY>[] = this.filterModel();

        if (updatedFilterModel.find((el: IFilterModel<KEY>) => el.propertyName === this.filterProperty())) {
            updatedFilterModel = updatedFilterModel.map((el: IFilterModel<KEY>) =>
                el.propertyName === this.filterProperty()
                    ? {
                          ...el,
                          operatorType,
                      }
                    : el
            );
            this.filterChange.emit(updatedFilterModel);
        } else if (this.currentFilter().value) {
            updatedFilterModel.push({
                propertyName: this.filterProperty(),
                operatorType: operatorType,
                value: this.currentFilter().value,
            });
            this.filterChange.emit(updatedFilterModel);
        } else {
            // Отбора по этой колонке нет и значения тоже — менять вид сравнения не у чего.
        }

        this.currentFilter.update((filter: IFilterModel<KEY>) => ({ ...filter, operatorType }));
    }
}
