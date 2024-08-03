import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    InputSignalWithTransform,
    OnInit,
    WritableSignal,
    booleanAttribute,
    input,
    signal,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';

import { BlockDirective, ElemDirective } from '../../bem';
import { Nullable, transformArrayInput } from '../../util';
import { RtuiToolbarCenterDirective, RtuiToolbarComponent, RtuiToolbarLeftDirective, RtuiToolbarRightDirective } from '../toolbar';
import { RtuiTableContainerComponent } from './components/table-container/table-container.component';
import { TableCellComponent } from './components/table-copy-box/table-cell.component';
import { RtuiTableHeaderCellComponent } from './components/table-header-cell/table-header-cell.component';
import { PageModel, SortModel } from './util/lists.interface';
import { ITable } from './util/table-column.interface';

@Component({
    standalone: true,
    selector: 'rtui-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgTemplateOutlet,

        // Material
        MatToolbar,
        MatIconButton,
        MatIcon,

        // BEM
        BlockDirective,
        ElemDirective,

        // Ui-kit
        RtuiToolbarComponent,
        RtuiToolbarLeftDirective,
        RtuiToolbarCenterDirective,
        RtuiToolbarRightDirective,
        RtuiTableContainerComponent,
        RtuiTableHeaderCellComponent,
        TableCellComponent,
    ],
})
export class RtuiTableComponent<ENTITY_TYPE> implements OnInit {
    public isMobile: InputSignalWithTransform<Nullable<boolean>, boolean> = input<Nullable<boolean>, boolean>(false, {
        transform: booleanAttribute,
    });
    public loading: InputSignalWithTransform<Nullable<boolean>, boolean> = input<Nullable<boolean>, boolean>(false, {
        transform: booleanAttribute,
    });
    public fetching: InputSignalWithTransform<Nullable<boolean>, boolean> = input<Nullable<boolean>, boolean>(false, {
        transform: booleanAttribute,
    });

    public readonly entities: InputSignalWithTransform<ENTITY_TYPE[], ENTITY_TYPE[]> = input<ENTITY_TYPE[], ENTITY_TYPE[]>([], {
        transform: (value: ENTITY_TYPE[]) => transformArrayInput(value),
    });
    public readonly columns: InputSignalWithTransform<Array<ITable.Column<ENTITY_TYPE>>, Array<ITable.Column<ENTITY_TYPE>>> = input<
        Array<ITable.Column<ENTITY_TYPE>>,
        Array<ITable.Column<ENTITY_TYPE>>
    >([], {
        transform: (value: Array<ITable.Column<ENTITY_TYPE>>) => transformArrayInput(value),
    });

    public readonly appearance: InputSignal<MatFormFieldAppearance> = input.required();
    public readonly pageModel: InputSignal<PageModel> = input.required();
    public readonly sortModel: InputSignal<SortModel<keyof ENTITY_TYPE>> = input.required();
    public readonly searchTerm: WritableSignal<Nullable<string>> = signal(null);
    public readonly activeRowIndex: WritableSignal<Nullable<number>> = signal(null);

    public ngOnInit(): void {
        //
    }

    public searchChange(value: Nullable<string>): void {
        //
    }

    public sortChange(sortModel: SortModel<ENTITY_TYPE>): void {
        //
    }

    public pageModelChange(pageModel: Partial<PageModel>): void {
        //
    }

    public refresh(): void {
        //
    }
}
