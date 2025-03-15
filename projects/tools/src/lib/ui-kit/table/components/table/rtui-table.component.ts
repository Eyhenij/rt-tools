import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    Directive,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    Signal,
    signal,
    TemplateRef,
    WritableSignal,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatRadioButton } from '@angular/material/radio';

import { BlockDirective, ElemDirective } from '../../../../bem';
import { Nullable, RtIconOutlinedDirective, transformArrayInput } from '../../../../util';
import { ITable, SortModel, TABLE_COLUMN_TYPES_ENUM } from '../../util';
import { RtTableConfigService } from '../../util/table-config.service';
import { TableBaseCellComponent } from '../table-base-cell/table-base-cell.component';
import { RtuiTableHeaderCellComponent } from '../table-header-cell/table-header-cell.component';

/** Directive for custom table cells */
@Directive({
    selector: '[rtuiCustomTableCellsDirective]',
})
export class RtuiCustomTableCellsDirective<ENTITY_TYPE> {
    public cellsTemplates: InputSignal<{
        [K in keyof ENTITY_TYPE]: TemplateRef<{ $implicit: ENTITY_TYPE }>;
    }> = input.required({
        alias: 'rtuiCustomTableCellsDirective',
    });

    public getTemplateByPropName(propName: keyof ENTITY_TYPE): TemplateRef<{ $implicit: ENTITY_TYPE }> {
        return this.cellsTemplates()[propName];
    }
}

/** Directive for row actions located inside a row menu button */
@Directive({
    selector: '[rtuiTabletRowActionsDirective]',
})
export class RtuiTableRowActionsDirective {}

/** Directive for row actions located outside a row menu button */
@Directive({
    selector: '[rtuiTableAdditionalRowActionsDirective]',
})
export class RtuiTableAdditionalRowActionsDirective {}

@Component({
    selector: 'rtui-table',
    templateUrl: './rtui-table.component.html',
    styleUrls: ['./rtui-table.component.scss'],
    imports: [
        NgTemplateOutlet,

        // material
        MatIconButton,
        MatMenuTrigger,
        MatIcon,
        MatMenu,
        MatMenuItem,
        MatCheckbox,
        MatRadioButton,

        // directives
        BlockDirective,
        ElemDirective,
        RtIconOutlinedDirective,

        // components
        RtuiTableHeaderCellComponent,
        TableBaseCellComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RtuiTableComponent<
    ENTITY_TYPE extends Record<string, unknown>,
    SORT_PROPERTY extends Extract<keyof ENTITY_TYPE, string>,
    KEY extends Extract<keyof ENTITY_TYPE, string>,
> {
    readonly #tableConfigService: RtTableConfigService<ENTITY_TYPE> = inject(RtTableConfigService);

    protected readonly columnTypes: typeof TABLE_COLUMN_TYPES_ENUM = TABLE_COLUMN_TYPES_ENUM;

    /** Indicates is mobile view */
    public isMobile: InputSignalWithTransform<Nullable<boolean>, Nullable<boolean>> = input<Nullable<boolean>, Nullable<boolean>>(false, {
        transform: booleanAttribute,
    });
    /** Indicates is table rows clickable */
    public isTableRowsClickable: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    /** Key of ENTITY_TYPE for compare entities */
    public keyExp: InputSignal<NonNullable<KEY>> = input('id' as NonNullable<KEY>);

    /** List of entities */
    public entities: InputSignalWithTransform<ENTITY_TYPE[], ENTITY_TYPE[]> = input.required<ENTITY_TYPE[], ENTITY_TYPE[]>({
        transform: (value: ENTITY_TYPE[]) => transformArrayInput(value),
    });
    /** Current page model from store */
    public currentSortModel: InputSignal<Nullable<SortModel<SORT_PROPERTY>>> = input.required();

    /** Row click output action */
    public readonly rowClick: OutputEmitterRef<NonNullable<ENTITY_TYPE>> = output<NonNullable<ENTITY_TYPE>>();
    /** Row doubleClick output action */
    public readonly rowDoubleClick: OutputEmitterRef<NonNullable<ENTITY_TYPE>> = output<NonNullable<ENTITY_TYPE>>();
    /** Sort change output action */
    public readonly sortChange: OutputEmitterRef<SortModel<SORT_PROPERTY>> = output<SortModel<SORT_PROPERTY>>();

    /** Columns config for table */
    public columns: Signal<Array<ITable.Column<ENTITY_TYPE>>> = computed(() => {
        return this.#tableConfigService.tableConfig().columns;
    });

    /** Custom cells template */
    public readonly customCellsTpl: Signal<Nullable<RtuiCustomTableCellsDirective<ENTITY_TYPE>>> =
        contentChild(RtuiCustomTableCellsDirective);
    /** Row actions template */
    public readonly rowActionsTpl: Signal<
        Nullable<
            TemplateRef<{
                $implicit: ENTITY_TYPE;
            }>
        >
    > = contentChild(RtuiTableRowActionsDirective, {
        read: TemplateRef,
    });
    /** Additional row actions template */
    public readonly additionalRowActionsTpl: Signal<Nullable<TemplateRef<RtuiTableAdditionalRowActionsDirective>>> = contentChild(
        RtuiTableAdditionalRowActionsDirective,
        {
            read: TemplateRef,
        }
    );

    /** Fields specified by the directive */
    /** List of selected entities ids */
    public readonly selectedEntitiesIds: WritableSignal<ENTITY_TYPE[KEY][]> = signal([]);
    /** Indicates is all page entities selected */
    public readonly isPageEntitiesSelected: WritableSignal<boolean> = signal(false);
    /** Indicates is some page entities selected */
    public readonly isPageEntitiesIndeterminate: WritableSignal<boolean> = signal(false);
    /** Indicates is multiselect mod enabled */
    public readonly isMultiSelect: WritableSignal<boolean> = signal(true);
    /** Indicates is selectors column shown */
    public readonly isSelectorsColumnShown: WritableSignal<boolean> = signal(false);
    /** Indicates is selectors column disabled */
    public readonly isSelectorsColumnDisabled: WritableSignal<boolean> = signal(false);
    /** Current row index */
    public readonly activeRowIndex: WritableSignal<Nullable<number>> = signal(null);

    /** Sort change output action */
    public onSortChange(sortModel: SortModel<string>): void {
        // TODO: add type guard
        this.sortChange.emit(sortModel as SortModel<SORT_PROPERTY>);
    }

    /** Open row actions menu */
    public onMenuOpen(index: number): void {
        this.activeRowIndex.set(index);
    }

    /** Close row actions menu */
    public onMenuClose(): void {
        this.activeRowIndex.set(null);
    }

    /** Row click output action */
    public onRowClick(row: NonNullable<ENTITY_TYPE>): void {
        this.rowClick.emit(row);
    }

    /** Row doubleClick output action */
    public onRowDoubleClick(row: NonNullable<ENTITY_TYPE>): void {
        this.rowDoubleClick.emit(row);
    }

    /** Empty methods set in selectors directive */
    public onToggleEntity: (entity: ENTITY_TYPE, checked: boolean) => void = (): void => {
        return;
    };
    public onTogglePageEntities: (checked: boolean) => void = (): void => {
        return;
    };
}
