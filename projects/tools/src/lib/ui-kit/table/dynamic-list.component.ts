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
    booleanAttribute,
    contentChild,
    input,
    output,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';

import { BlockDirective, ElemDirective } from '../../bem';
import { Nullable, transformArrayInput } from '../../util';
import { RtuiToolbarCenterDirective, RtuiToolbarComponent, RtuiToolbarLeftDirective, RtuiToolbarRightDirective } from '../toolbar';
import { RtuiTableComponent, RtuiTableRowActionsDirective } from './components';
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

@Directive({
    standalone: true,
    selector: '[rtuiDynamicListRowActionsDirective]',
})
export class RtuiDynamicListRowActionsDirective {}

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
        RtuiTableToolbarActionsDirective,
        RtuiTableRowActionsDirective,

        // Ui-kit
        RtuiToolbarComponent,
        RtuiTableContainerComponent,
        RtuiTableHeaderCellComponent,
        TableBaseCellComponent,
        RtuiTableComponent,
    ],
})
export class RtuiDynamicListComponent<ENTITY_TYPE extends Record<string, unknown>, KEY extends Extract<keyof ENTITY_TYPE, string>> {
    public isMobile: InputSignalWithTransform<Nullable<boolean>, Nullable<boolean>> = input<Nullable<boolean>, Nullable<boolean>>(false, {
        transform: booleanAttribute,
    });
    public loading: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public fetching: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public isSelectorShown: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public isAllEntitiesSelected: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
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

    public pageModel: InputSignal<PageModel> = input.required();
    public searchTerm: InputSignal<Nullable<string>> = input.required();
    public currentSortModel: InputSignal<Nullable<SortModel<NonNullable<KEY>>>> = input.required();

    public appearance: InputSignal<MatFormFieldAppearance> = input.required({
        transform: (value: MatFormFieldAppearance) => (value === 'fill' ? 'fill' : 'outline'),
    });

    public readonly sortChange: OutputEmitterRef<SortModel<NonNullable<KEY>>> = output<SortModel<NonNullable<KEY>>>();
    public readonly pageModelChange: OutputEmitterRef<Partial<PageModel>> = output<Partial<PageModel>>();
    public readonly searchChange: OutputEmitterRef<Nullable<string>> = output<Nullable<string>>();
    public readonly refresh: OutputEmitterRef<void> = output<void>();
    public readonly rowClick: OutputEmitterRef<NonNullable<ENTITY_TYPE>> = output<NonNullable<ENTITY_TYPE>>();
    public readonly toggleEntity: OutputEmitterRef<{ key: ENTITY_TYPE[KEY]; checked: boolean }> = output<{
        key: ENTITY_TYPE[KEY];
        checked: boolean;
    }>();
    public readonly toggleExistingEntities: OutputEmitterRef<boolean> = output<boolean>();
    public readonly toggleAllEntities: OutputEmitterRef<boolean> = output<boolean>();

    public readonly toolbarActionsTpl: Signal<Nullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiDynamicListToolbarActionsDirective, {
        read: TemplateRef,
    });
    public readonly rowActionsTpl: Signal<Nullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiDynamicListRowActionsDirective, {
        read: TemplateRef,
    });

    public onSearchChange(value: Nullable<string>): void {
        this.searchChange.emit(value);
    }

    public onSortChange(sortModel: SortModel<NonNullable<KEY>>): void {
        this.sortChange.emit(sortModel);
    }

    public onPageModelChange(pageModel: Partial<PageModel>): void {
        this.pageModelChange.emit(pageModel);
    }

    public onRefresh(): void {
        this.refresh.emit();
    }

    public onRowClick(row: ENTITY_TYPE): void {
        this.rowClick.emit(row);
    }

    public onToggleEntity(value: { key: ENTITY_TYPE[KEY]; checked: boolean }): void {
        this.toggleEntity.emit(value);
    }

    public onToggleExistingEntities(checked: boolean): void {
        this.toggleExistingEntities.emit(checked);
    }

    public onToggleAllEntities(checked: boolean): void {
        this.toggleAllEntities.emit(checked);
    }
}
