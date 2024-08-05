import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    InputSignalWithTransform,
    OnInit,
    OutputEmitterRef,
    WritableSignal,
    booleanAttribute,
    input,
    output,
    signal,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';

import { BlockDirective, ElemDirective } from '../../bem';
import { Nullable, transformArrayInput } from '../../util';
import { RtuiToolbarCenterDirective, RtuiToolbarComponent, RtuiToolbarLeftDirective, RtuiToolbarRightDirective } from '../toolbar';
import { TableBaseCellComponent } from './components/table-base-cell/table-base-cell.component';
import { RtuiTableContainerComponent } from './components/table-container/table-container.component';
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
        TableBaseCellComponent,
    ],
})
export class RtuiTableComponent<ENTITY_TYPE> implements OnInit {
    public isMobile: InputSignalWithTransform<Nullable<boolean>, Nullable<boolean>> = input<Nullable<boolean>, Nullable<boolean>>(false, {
        transform: booleanAttribute,
    });
    public loading: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public fetching: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
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
    public appearance: InputSignal<MatFormFieldAppearance> = input.required();
    public pageModel: InputSignal<PageModel> = input.required();
    public sortModel: InputSignal<SortModel<keyof ENTITY_TYPE>> = input.required();

    public readonly sortChangeAction: OutputEmitterRef<SortModel<ENTITY_TYPE>> = output<SortModel<ENTITY_TYPE>>();
    public readonly pageModelChangeAction: OutputEmitterRef<Partial<PageModel>> = output<Partial<PageModel>>();
    public readonly searchChangeAction: OutputEmitterRef<Nullable<string>> = output<Nullable<string>>();
    public readonly refreshAction: OutputEmitterRef<void> = output<void>();

    public readonly searchTerm: WritableSignal<Nullable<string>> = signal(null);
    public readonly activeRowIndex: WritableSignal<Nullable<number>> = signal(null);

    public ngOnInit(): void {
        return;
    }

    public searchChange(value: Nullable<string>): void {
        this.searchChangeAction.emit(value);
    }

    public sortChange(sortModel: SortModel<ENTITY_TYPE>): void {
        this.sortChangeAction.emit(sortModel);
    }

    public pageModelChange(pageModel: Partial<PageModel>): void {
        this.pageModelChangeAction.emit(pageModel);
    }

    public refresh(): void {
        this.refreshAction.emit();
    }
}
