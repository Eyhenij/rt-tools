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
    Type,
    WritableSignal,
    booleanAttribute,
    contentChild,
    input,
    output,
    signal,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';

import { BlockDirective, ElemDirective } from '../../../../bem';
import { Nullable, RtIconOutlinedDirective, transformArrayInput } from '../../../../util';
import { ITable, SortModel } from '../../util';
import { TableBaseCellComponent } from '../table-base-cell/table-base-cell.component';
import { RtuiTableHeaderCellComponent } from '../table-header-cell/table-header-cell.component';

@Directive({
    standalone: true,
    selector: '[rtuiTabletRowActionsDirective]',
})
export class RtuiTableRowActionsDirective {}

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
export class RtuiTableComponent<ENTITY_TYPE extends Record<string, unknown>, KEY extends Extract<keyof ENTITY_TYPE, string>> {
    public isMobile: InputSignalWithTransform<Nullable<boolean>, Nullable<boolean>> = input<Nullable<boolean>, Nullable<boolean>>(false, {
        transform: booleanAttribute,
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
    public sortModel: InputSignal<Nullable<SortModel<KEY>>> = input.required();

    public readonly rowClickAction: OutputEmitterRef<ENTITY_TYPE> = output<ENTITY_TYPE>();
    public readonly sortChangeAction: OutputEmitterRef<SortModel<KEY>> = output<SortModel<KEY>>();

    public readonly rowActionsTpl: Signal<Nullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiTableRowActionsDirective, {
        read: TemplateRef,
    });

    public readonly activeRowIndex: WritableSignal<Nullable<number>> = signal(null);

    public sortChange(sortModel: SortModel<KEY>): void {
        this.sortChangeAction.emit(sortModel);
    }

    public onMenuOpen(index: number): void {
        this.activeRowIndex.set(index);
    }

    public onMenuClose(): void {
        this.activeRowIndex.set(null);
    }

    public onRowClick(row: ENTITY_TYPE): void {
        this.rowClickAction.emit(row);
    }
}
