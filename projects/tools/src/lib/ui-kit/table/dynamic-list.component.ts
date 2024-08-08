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
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';

import { BlockDirective, ElemDirective } from '../../bem';
import { Nullable, transformArrayInput } from '../../util';
import { RtuiToolbarCenterDirective, RtuiToolbarComponent, RtuiToolbarLeftDirective, RtuiToolbarRightDirective } from '../toolbar';
import { RtuiTableComponent } from './components';
import { TableBaseCellComponent } from './components/table-base-cell/table-base-cell.component';
import { RtuiTableContainerComponent, RtuiTableToolbarActionsDirective } from './components/table-container/table-container.component';
import { RtuiTableHeaderCellComponent } from './components/table-header-cell/table-header-cell.component';
import { PageModel, SortModel } from './util/lists.interface';
import { ITable } from './util/table-column.interface';

@Directive({
    standalone: true,
    selector: '[rtuiDynamicListToolbarActionsDirective]',
})
export class RtuiDynamicListToolbarActionsDirective {}

@Component({
    standalone: true,
    selector: 'rtui-dynamic-list',
    templateUrl: './dynamic-list.component.html',
    styleUrls: ['./dynamic-list.component.scss'],
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

        // Directives
        RtuiToolbarLeftDirective,
        RtuiToolbarCenterDirective,
        RtuiToolbarRightDirective,

        // Ui-kit
        RtuiToolbarComponent,
        RtuiTableContainerComponent,
        RtuiTableHeaderCellComponent,
        TableBaseCellComponent,
        RtuiTableComponent,
        RtuiTableToolbarActionsDirective,
    ],
})
export class RtuiDynamicListComponent<ENTITY_TYPE = { [key: string]: unknown }> {
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
    public sortModel: InputSignal<Nullable<SortModel<Extract<keyof ENTITY_TYPE, string>>>> = input.required();
    public searchTerm: InputSignal<Nullable<string>> = input.required();

    public readonly sortChangeAction: OutputEmitterRef<SortModel<Extract<keyof ENTITY_TYPE, string>>> =
        output<SortModel<Extract<keyof ENTITY_TYPE, string>>>();
    public readonly pageModelChangeAction: OutputEmitterRef<Partial<PageModel>> = output<Partial<PageModel>>();
    public readonly searchChangeAction: OutputEmitterRef<Nullable<string>> = output<Nullable<string>>();
    public readonly refreshAction: OutputEmitterRef<void> = output<void>();

    public readonly toolbarActionsTpl: Signal<Nullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiDynamicListToolbarActionsDirective, {
        read: TemplateRef,
    });

    public readonly activeRowIndex: WritableSignal<Nullable<number>> = signal(null);

    public searchChange(value: Nullable<string>): void {
        this.searchChangeAction.emit(value);
    }

    public sortChange(sortModel: SortModel<Extract<keyof ENTITY_TYPE, string>>): void {
        this.sortChangeAction.emit(sortModel);
    }

    public pageModelChange(pageModel: Partial<PageModel>): void {
        this.pageModelChangeAction.emit(pageModel);
    }

    public refresh(): void {
        this.refreshAction.emit();
    }
}
