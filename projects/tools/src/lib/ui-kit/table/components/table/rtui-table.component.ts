import {
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    InputSignalWithTransform,
    OutputEmitterRef,
    booleanAttribute,
    input,
    output,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '../../../../bem';
import { Nullable, transformArrayInput } from '../../../../util';
import { ITable, SortModel } from '../../util';
import { TableBaseCellComponent } from '../table-base-cell/table-base-cell.component';
import { RtuiTableHeaderCellComponent } from '../table-header-cell/table-header-cell.component';

@Component({
    standalone: true,
    selector: 'rtui-table',
    templateUrl: './rtui-table.component.html',
    styleUrls: ['./rtui-table.component.scss'],
    imports: [
        // directives
        BlockDirective,
        ElemDirective,

        // components
        RtuiTableHeaderCellComponent,
        TableBaseCellComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RtuiTableComponent<ENTITY_TYPE = { [key: string]: unknown }> {
    public isMobile: InputSignalWithTransform<Nullable<boolean>, Nullable<boolean>> = input<Nullable<boolean>, Nullable<boolean>>(false, {
        transform: booleanAttribute,
    });
    public entities: InputSignalWithTransform<ENTITY_TYPE[], ENTITY_TYPE[]> = input<ENTITY_TYPE[], ENTITY_TYPE[]>([], {
        transform: (value: ENTITY_TYPE[]) => transformArrayInput(value),
    });
    public columns: InputSignalWithTransform<Array<ITable.Column<ENTITY_TYPE>>, Array<ITable.Column<ENTITY_TYPE>>> = input<
        Array<ITable.Column<ENTITY_TYPE>>,
        Array<ITable.Column<ENTITY_TYPE>>
    >([], {
        transform: (value: Array<ITable.Column<ENTITY_TYPE>>) => transformArrayInput(value),
    });
    public sortModel: InputSignal<Nullable<SortModel<Extract<keyof ENTITY_TYPE, string>>>> = input.required();

    public readonly sortChangeAction: OutputEmitterRef<SortModel<Extract<keyof ENTITY_TYPE, string>>> =
        output<SortModel<Extract<keyof ENTITY_TYPE, string>>>();

    public sortChange(sortModel: SortModel<Extract<keyof ENTITY_TYPE, string>>): void {
        this.sortChangeAction.emit(sortModel);
    }
}
