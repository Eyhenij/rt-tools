import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
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
    WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { BooleanInput } from '@angular/cdk/coercion';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDatepicker, MatDatepickerInput, MatDatepickerModule, MatDatepickerToggle } from '@angular/material/datepicker';

import { RtIconOutlinedDirective, transformArrayInput, isString } from '../../../../util';
import { FILTER_OPERATOR_TYPE_ENUM, FILTER_OPERATORS, FilterModel, FilterOperatorType } from '../../util/lists.interface';
import { ITable, TABLE_COLUMN_FILTER_TYPES_ENUM } from '../../util/table-column.interface';
import { MatFormField, MatFormFieldAppearance, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatOption, provideNativeDateAdapter } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { TitleCasePipe } from '@angular/common';
import { isDate } from 'date-fns';
import { RtuiClearButtonComponent } from '../clear-search-button/rtui-clear-button.component';
import { BlockDirective } from '../../../../bem';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
    selector: 'rtui-table-header-filter-cell',
    templateUrl: './table-header-filter-cell.component.html',
    styleUrls: ['./table-header-filter-cell.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [provideNativeDateAdapter()],
    imports: [
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
export class RtuiTableHeaderFilterCellComponent<ENTITY_TYPE extends Record<string, unknown>, KEY extends Extract<keyof ENTITY_TYPE, string>>
    implements OnInit
{
    readonly #injector: Injector = inject(Injector);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    protected readonly filterTypes: typeof TABLE_COLUMN_FILTER_TYPES_ENUM = TABLE_COLUMN_FILTER_TYPES_ENUM;
    protected readonly filterOperatorTypes: typeof FILTER_OPERATOR_TYPE_ENUM = FILTER_OPERATOR_TYPE_ENUM;

    /** Current elements appearance */
    public appearance: InputSignal<MatFormFieldAppearance> = input.required();
    /** Filter property */
    public filterProperty: InputSignalWithTransform<KEY, unknown> = input.required<KEY, unknown>({
        transform: (value: unknown): KEY => (isString(value) ? value : value?.toString) as KEY,
    });
    /** Filter cell type */
    public filterType: InputSignal<ITable.FilterType> = input.required();
    /** Current filter model from store */
    public filterModel: InputSignalWithTransform<FilterModel<KEY>[], FilterModel<KEY>[]> = input.required<
        FilterModel<KEY>[],
        FilterModel<KEY>[]
    >({
        transform: (value: FilterModel<KEY>[]) => transformArrayInput(value),
    });
    /** Filter property */
    public defaultFilterOperator: InputSignalWithTransform<FilterOperatorType, FilterOperatorType> = input.required<
        FilterOperatorType,
        FilterOperatorType
    >({
        transform: (value: FilterOperatorType): FilterOperatorType =>
            value && FILTER_OPERATORS.includes(value) ? value : FILTER_OPERATOR_TYPE_ENUM.EQUALS,
    });
    /** Available filter operators */
    public filterOperators: InputSignalWithTransform<FilterOperatorType[], FilterOperatorType[]> = input<
        FilterOperatorType[],
        FilterOperatorType[]
    >([], {
        transform: (value: FilterOperatorType[]) => transformArrayInput(value),
    });
    /** List of selected filter models */
    public filterSelectOptions: InputSignalWithTransform<string[], string[]> = input<string[], string[]>([], {
        transform: (value: string[]) => transformArrayInput(value),
    });
    /** Indicates is mobile view */
    public isMobile: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Filter change output action */
    public readonly filterChange: OutputEmitterRef<FilterModel<KEY>[]> = output<FilterModel<KEY>[]>();

    public readonly currentFilter: WritableSignal<FilterModel<KEY>> = signal({
        propertyName: '' as KEY,
        operatorType: FILTER_OPERATOR_TYPE_ENUM.EQUALS,
        value: '',
    });

    public ngOnInit(): void {
        toObservable(this.filterModel, { injector: this.#injector })
            .pipe(takeUntilDestroyed(this.#destroyRef))
            .subscribe((filterModel: FilterModel<KEY>[]) => {
                this.currentFilter.set(
                    filterModel?.length && filterModel.find((el: FilterModel<KEY>) => el.propertyName === this.filterProperty())
                        ? (filterModel.find((el: FilterModel<KEY>) => el.propertyName === this.filterProperty()) as FilterModel<KEY>)
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
        if (value === this.currentFilter().value) {
            return;
        }

        let updatedFilterModel: FilterModel<KEY>[] = this.filterModel();

        if (updatedFilterModel.find((el: FilterModel<KEY>) => el.propertyName === this.filterProperty())) {
            if (value) {
                updatedFilterModel = updatedFilterModel.map((el: FilterModel<KEY>) =>
                    el.propertyName === this.filterProperty()
                        ? {
                              ...el,
                              value: isDate(value) ? value.toISOString() : value,
                          }
                        : el
                );
            } else {
                updatedFilterModel = updatedFilterModel.filter((el: FilterModel<KEY>) => el.propertyName !== this.filterProperty());
            }
            this.filterChange.emit(updatedFilterModel);
        } else if (value) {
            updatedFilterModel.push({
                propertyName: this.filterProperty(),
                operatorType: this.currentFilter().operatorType,
                value: isDate(value) ? value.toISOString() : value,
            });
            this.filterChange.emit(updatedFilterModel);
        }

        this.currentFilter.update((filter: FilterModel<KEY>) => ({
            ...filter,
            value: isDate(value) ? value.toISOString() : value,
        }));
    }

    /** Change filter operator */
    public onFilterOperatorChange(operatorType: FilterOperatorType): void {
        if (operatorType === this.currentFilter().operatorType) {
            return;
        }

        let updatedFilterModel: FilterModel<KEY>[] = this.filterModel();

        if (updatedFilterModel.find((el: FilterModel<KEY>) => el.propertyName === this.filterProperty())) {
            updatedFilterModel = updatedFilterModel.map((el: FilterModel<KEY>) =>
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
        }

        this.currentFilter.update((filter: FilterModel<KEY>) => ({ ...filter, operatorType }));
    }
}
