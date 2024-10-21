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
    viewChild,
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
export class RtuiDynamicListComponent<
    ENTITY_TYPE extends Record<string, unknown>,
    SORT_PROPERTY extends Extract<keyof ENTITY_TYPE, string>,
    KEY extends Extract<keyof ENTITY_TYPE, string>,
> {
    /** Table config storage key */
    public tableConfigStorageKey: InputSignalWithTransform<string, string> = input.required<string, string>({
        transform: transformStringInput,
    });
    /** Indicates is mobile view */
    public isMobile: InputSignalWithTransform<Nullable<boolean>, Nullable<boolean>> = input<Nullable<boolean>, Nullable<boolean>>(false, {
        transform: booleanAttribute,
    });
    /** Indicates is loading in progress */
    public loading: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    /** Indicates is fetching in progress */
    public fetching: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    /** Indicates is table rows clickable */
    public isTableRowsClickable: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    /** Indicates is pagination shown */
    public isPaginationShown: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(true, {
        transform: booleanAttribute,
    });
    /** Indicates is refresh button shown */
    public isRefreshButtonShown: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(true, {
        transform: booleanAttribute,
    });
    /** Indicates is table config button shown */
    public isTableConfigButtonShown: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(true, {
        transform: booleanAttribute,
    });
    /** Indicates is toolbar buttons outlined */
    public isToolbarActionsIconsOutlined: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(true, {
        transform: booleanAttribute,
    });
    /** Key of ENTITY_TYPE for compare entities */
    public keyExp: InputSignal<NonNullable<KEY>> = input('id' as NonNullable<KEY>);
    /** List of entities */
    public entities: InputSignalWithTransform<ENTITY_TYPE[], ENTITY_TYPE[]> = input.required<ENTITY_TYPE[], ENTITY_TYPE[]>({
        transform: (value: ENTITY_TYPE[]) => transformArrayInput(value),
    });

    /** Current page model from store */
    public pageModel: InputSignal<PageModel> = input.required();
    /** Current search term from store */
    public searchTerm: InputSignal<Nullable<string>> = input.required();
    /** Current sort model from store */
    public currentSortModel: InputSignal<Nullable<SortModel<NonNullable<KEY>>>> = input.required();

    public appearance: InputSignal<MatFormFieldAppearance> = input.required({
        transform: (value: MatFormFieldAppearance) => (value === 'fill' ? 'fill' : 'outline'),
    });

    /** Sort model change output action */
    public readonly sortChange: OutputEmitterRef<SortModel<NonNullable<KEY>>> = output<SortModel<NonNullable<KEY>>>();
    /** Page model change output action */
    public readonly pageModelChange: OutputEmitterRef<Partial<PageModel>> = output<Partial<PageModel>>();
    /** Search change output action */
    public readonly searchChange: OutputEmitterRef<Nullable<string>> = output<Nullable<string>>();
    /** Refresh output action */
    public readonly refresh: OutputEmitterRef<void> = output<void>();
    /** Row click output action */
    public readonly rowClick: OutputEmitterRef<NonNullable<ENTITY_TYPE>> = output<NonNullable<ENTITY_TYPE>>();
    /** Row doubleClick output action */
    public readonly rowDoubleClick: OutputEmitterRef<NonNullable<ENTITY_TYPE>> = output<NonNullable<ENTITY_TYPE>>();

    /** Toolbar selectors template */
    public readonly toolbarSelectorsTpl: Signal<Nullable<TemplateRef<Type<unknown>>>> = contentChild(
        RtuiDynamicListToolbarSelectorsDirective,
        {
            read: TemplateRef,
        }
    );
    /** Toolbar actions template */
    public readonly toolbarActionsTpl: Signal<Nullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiDynamicListToolbarActionsDirective, {
        read: TemplateRef,
    });
    /** Custom cells template */
    public readonly customCellsTpl: Signal<Nullable<RtuiDynamicListCustomTableCellsDirective<{ $implicit: ENTITY_TYPE }>>> = contentChild(
        RtuiDynamicListCustomTableCellsDirective
    );
    /** Row actions template */
    public readonly rowActionsTpl: Signal<Nullable<TemplateRef<{ $implicit: ENTITY_TYPE }>>> = contentChild(
        RtuiDynamicListRowActionsDirective,
        {
            read: TemplateRef,
        }
    );
    /** Additional row actions template */
    public readonly additionalRowActionsTpl: Signal<Nullable<TemplateRef<{ $implicit: ENTITY_TYPE }>>> = contentChild(
        RtuiDynamicListRowAdditionalActionsDirective,
        {
            read: TemplateRef,
        }
    );

    /** Table container for selectors directive */
    public readonly tableContainerTpl: Signal<Nullable<RtuiTableContainerComponent<ENTITY_TYPE>>> =
        viewChild<RtuiTableContainerComponent<ENTITY_TYPE>>(RtuiTableContainerComponent);
    /** Table selector for selectors directive */
    public readonly tableTpl: Signal<Nullable<RtuiTableComponent<ENTITY_TYPE, SORT_PROPERTY, KEY>>> =
        viewChild<RtuiTableComponent<ENTITY_TYPE, SORT_PROPERTY, KEY>>(RtuiTableComponent);

    /** Search change output action */
    public onSearchChange(value: Nullable<string>): void {
        this.searchChange.emit(value);
    }

    /** Sort change output action */
    public onSortChange(sortModel: SortModel<NonNullable<KEY>>): void {
        this.sortChange.emit(sortModel);
    }

    /** Page model change output action */
    public onPageModelChange(pageModel: Partial<PageModel>): void {
        this.pageModelChange.emit(pageModel);
    }

    /** Refresh output action */
    public onRefresh(): void {
        this.refresh.emit();
    }

    /** Row click output action */
    public onRowClick(row: ENTITY_TYPE): void {
        this.rowClick.emit(row);
    }

    /** Row doubleClick output action */
    public onRowDoubleClick(row: ENTITY_TYPE): void {
        this.rowDoubleClick.emit(row);
    }
}
