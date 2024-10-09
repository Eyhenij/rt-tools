import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    Directive,
    InputSignal,
    InputSignalWithTransform,
    OutputEmitterRef,
    Signal,
    TemplateRef,
    WritableSignal,
    booleanAttribute,
    contentChild,
    input,
    output,
    signal,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatRadioButton } from '@angular/material/radio';

import { BlockDirective, ElemDirective } from '../../../../bem';
import { Nullable, RtIconOutlinedDirective, transformArrayInput } from '../../../../util';
import { ITable, SortModel, TABLE_COLUMN_TYPES_ENUM } from '../../util';
import { TableBaseCellComponent } from '../table-base-cell/table-base-cell.component';
import { RtuiTableHeaderCellComponent } from '../table-header-cell/table-header-cell.component';

/** Directive for custom table cells */
@Directive({
    standalone: true,
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
    standalone: true,
    selector: '[rtuiTabletRowActionsDirective]',
})
export class RtuiTableRowActionsDirective {}

/** Directive for row actions located outside a row menu button */
@Directive({
    standalone: true,
    selector: '[rtuiTableAdditionalRowActionsDirective]',
})
export class RtuiTableAdditionalRowActionsDirective {}

@Component({
    standalone: true,
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
    protected readonly columnTypes: typeof TABLE_COLUMN_TYPES_ENUM = TABLE_COLUMN_TYPES_ENUM;

    public isMobile: InputSignalWithTransform<Nullable<boolean>, Nullable<boolean>> = input<Nullable<boolean>, Nullable<boolean>>(false, {
        transform: booleanAttribute,
    });
    public isSelectorsShown: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public isSelectorsColumnDisabled: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public isMultiSelect: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public isTableRowsClickable: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public keyExp: InputSignal<NonNullable<KEY>> = input('id' as NonNullable<KEY>);
    public selectedEntitiesKeys: InputSignalWithTransform<ENTITY_TYPE[KEY][], ENTITY_TYPE[KEY][]> = input<
        ENTITY_TYPE[KEY][],
        ENTITY_TYPE[KEY][]
    >([], {
        transform: (value: ENTITY_TYPE[KEY][]) => transformArrayInput(value),
    });

    public entities: InputSignalWithTransform<ENTITY_TYPE[], ENTITY_TYPE[]> = input.required<ENTITY_TYPE[], ENTITY_TYPE[]>({
        transform: (value: ENTITY_TYPE[]) => transformArrayInput(value),
    });
    public columns: InputSignalWithTransform<Array<ITable.Column<ENTITY_TYPE>>, Array<ITable.Column<ENTITY_TYPE>>> = input.required<
        Array<ITable.Column<ENTITY_TYPE>>,
        Array<ITable.Column<ENTITY_TYPE>>
    >({
        transform: (value: Array<ITable.Column<ENTITY_TYPE>>) => transformArrayInput(value),
    });
    public currentSortModel: InputSignal<Nullable<SortModel<SORT_PROPERTY>>> = input.required();

    public readonly rowClick: OutputEmitterRef<NonNullable<ENTITY_TYPE>> = output<NonNullable<ENTITY_TYPE>>();
    public readonly rowDoubleClick: OutputEmitterRef<NonNullable<ENTITY_TYPE>> = output<NonNullable<ENTITY_TYPE>>();
    public readonly sortChange: OutputEmitterRef<SortModel<SORT_PROPERTY>> = output<SortModel<SORT_PROPERTY>>();
    public readonly toggleEntity: OutputEmitterRef<{ key: ENTITY_TYPE[KEY]; checked: boolean }> = output<{
        key: ENTITY_TYPE[KEY];
        checked: boolean;
    }>();
    public readonly toggleExistingEntities: OutputEmitterRef<boolean> = output<boolean>();

    public readonly customCellsTpl: Signal<Nullable<RtuiCustomTableCellsDirective<ENTITY_TYPE>>> =
        contentChild(RtuiCustomTableCellsDirective);
    public readonly rowActionsTpl: Signal<
        Nullable<
            TemplateRef<{
                $implicit: ENTITY_TYPE;
            }>
        >
    > = contentChild(RtuiTableRowActionsDirective, {
        read: TemplateRef,
    });
    public readonly additionalRowActionsTpl: Signal<Nullable<TemplateRef<RtuiTableAdditionalRowActionsDirective>>> = contentChild(
        RtuiTableAdditionalRowActionsDirective,
        {
            read: TemplateRef,
        }
    );

    public readonly activeRowIndex: WritableSignal<Nullable<number>> = signal(null);

    public onSortChange(sortModel: SortModel<string>): void {
        // TODO: add type guard
        this.sortChange.emit(sortModel as SortModel<SORT_PROPERTY>);
    }

    public onMenuOpen(index: number): void {
        this.activeRowIndex.set(index);
    }

    public onMenuClose(): void {
        this.activeRowIndex.set(null);
    }

    public onRowClick(row: NonNullable<ENTITY_TYPE>): void {
        this.rowClick.emit(row);
    }

    public onRowDoubleClick(row: NonNullable<ENTITY_TYPE>): void {
        this.rowDoubleClick.emit(row);
    }

    public onToggleEntity(key: ENTITY_TYPE[KEY], checked: boolean): void {
        this.toggleEntity.emit({ key, checked });
    }

    public onToggleExistingEntities(checked: boolean): void {
        this.toggleExistingEntities.emit(checked);
    }
}
