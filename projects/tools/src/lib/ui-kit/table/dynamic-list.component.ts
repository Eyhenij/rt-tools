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
    inject,
    input,
    output,
    untracked,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';

import { BlockDirective, ElemDirective } from '../../bem';
import { Nullable, transformArrayInput, transformStringInput } from '../../util';
import { RtuiToolbarCenterDirective, RtuiToolbarComponent, RtuiToolbarLeftDirective, RtuiToolbarRightDirective } from '../toolbar';
import {
    RtuiCustomTableCellsDirective,
    RtuiTableAdditionalRowActionsDirective,
    RtuiTableComponent,
    RtuiTableRowActionsDirective,
} from './components';
import { TableBaseCellComponent } from './components/table-base-cell/table-base-cell.component';
import {
    RtuiTableContainerComponent,
    RtuiTableToolbarActionsDirective,
    RtuiTableToolbarSelectorsDirective,
} from './components/table-container/table-container.component';
import { RtuiTableHeaderCellComponent } from './components/table-header-cell/table-header-cell.component';
import { RtTableStoreService } from './util';
import { PageModel, SortModel } from './util/lists.interface';

/** Directive for selectors of the toolbar located on the left side */
@Directive({
    standalone: true,
    selector: '[rtuiDynamicListToolbarSelectorsDirective]',
})
export class RtuiDynamicListToolbarSelectorsDirective {}

/** Directive for actions of the toolbar located on the right side */
@Directive({
    standalone: true,
    selector: '[rtuiDynamicListToolbarActionsDirective]',
})
export class RtuiDynamicListToolbarActionsDirective {}

/** Directive for custom table cells */
@Directive({
    standalone: true,
    selector: '[rtuiDynamicListCustomTableCellsDirective]',
})
export class RtuiDynamicListCustomTableCellsDirective<ENTITY_TYPE> {
    public cellsTemplates: InputSignal<{ [K in keyof ENTITY_TYPE]: TemplateRef<{ $implicit: ENTITY_TYPE }> }> = input.required({
        alias: 'rtuiDynamicListCustomTableCellsDirective',
    });
}

/** Directive for row actions located inside a row menu button */
@Directive({
    standalone: true,
    selector: '[rtuiDynamicListRowActionsDirective]',
})
export class RtuiDynamicListRowActionsDirective {}

/** Directive for row actions located outside a row menu button */
@Directive({
    standalone: true,
    selector: '[rtuiDynamicListRowAdditionalActionsDirective]',
})
export class RtuiDynamicListRowAdditionalActionsDirective {}

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
        RtuiTableToolbarSelectorsDirective,
        RtuiTableAdditionalRowActionsDirective,

        // Ui-kit
        RtuiToolbarComponent,
        RtuiTableContainerComponent,
        RtuiTableHeaderCellComponent,
        TableBaseCellComponent,
        RtuiTableComponent,
        RtuiCustomTableCellsDirective,
    ],
})
export class RtuiDynamicListComponent<ENTITY_TYPE extends Record<string, unknown>, KEY extends Extract<keyof ENTITY_TYPE, string>> {
    readonly #tableStoreService: RtTableStoreService<ENTITY_TYPE, KEY> = inject(RtTableStoreService);

    public entities: InputSignalWithTransform<ENTITY_TYPE[], ENTITY_TYPE[]> = input.required<ENTITY_TYPE[], ENTITY_TYPE[]>({
        transform: (value: ENTITY_TYPE[]) => transformArrayInput(value),
    });
    /** Table config storage key */
    public tableConfigStorageKey: InputSignalWithTransform<string, string> = input.required<string, string>({
        transform: transformStringInput,
    });
    public isMobile: InputSignalWithTransform<Nullable<boolean>, Nullable<boolean>> = input.required<Nullable<boolean>, Nullable<boolean>>({
        transform: booleanAttribute,
    });
    public loading: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public fetching: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public isTableRowsClickable: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public isPaginationShown: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(true, {
        transform: booleanAttribute,
    });
    public isRefreshButtonShown: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(true, {
        transform: booleanAttribute,
    });
    public isTableConfigButtonShown: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(true, {
        transform: booleanAttribute,
    });
    public isActionsIconsOutlined: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(true, {
        transform: booleanAttribute,
    });
    public isSelectorsShown: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public isSelectAllSelectorShown: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public isSelectorsColumnDisabled: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public isMultiSelect: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(true, {
        transform: booleanAttribute,
    });
    public keyExp: InputSignal<NonNullable<KEY>> = input('id' as NonNullable<KEY>);

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
    public readonly rowDoubleClick: OutputEmitterRef<NonNullable<ENTITY_TYPE>> = output<NonNullable<ENTITY_TYPE>>();

    public readonly toolbarSelectorsTpl: Signal<Nullable<TemplateRef<Type<unknown>>>> = contentChild(
        RtuiDynamicListToolbarSelectorsDirective,
        {
            read: TemplateRef,
        }
    );
    public readonly toolbarActionsTpl: Signal<Nullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiDynamicListToolbarActionsDirective, {
        read: TemplateRef,
    });
    public readonly customCellsTpl: Signal<Nullable<RtuiDynamicListCustomTableCellsDirective<{ $implicit: ENTITY_TYPE }>>> = contentChild(
        RtuiDynamicListCustomTableCellsDirective
    );
    public readonly rowActionsTpl: Signal<Nullable<TemplateRef<{ $implicit: ENTITY_TYPE }>>> = contentChild(
        RtuiDynamicListRowActionsDirective,
        {
            read: TemplateRef,
        }
    );
    public readonly additionalRowActionsTpl: Signal<Nullable<TemplateRef<{ $implicit: ENTITY_TYPE }>>> = contentChild(
        RtuiDynamicListRowAdditionalActionsDirective,
        {
            read: TemplateRef,
        }
    );

    public readonly selectedEntities: Signal<ENTITY_TYPE[]> = this.#tableStoreService.selectedEntities;
    public readonly isAllEntitiesSelected: Signal<boolean> = this.#tableStoreService.isAllEntitiesSelected;

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

    public onRowDoubleClick(row: ENTITY_TYPE): void {
        this.rowDoubleClick.emit(row);
    }

    public onToggleAllEntities(checked: boolean): void {
        this.#tableStoreService.toggleAll(
            untracked(() => this.entities()),
            checked
        );
    }
}
