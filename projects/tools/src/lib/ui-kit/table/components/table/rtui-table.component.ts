import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    Directive,
    Injector,
    InputSignal,
    InputSignalWithTransform,
    OnInit,
    OutputEmitterRef,
    Signal,
    TemplateRef,
    WritableSignal,
    booleanAttribute,
    computed,
    contentChild,
    inject,
    input,
    output,
    signal,
    untracked,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatRadioButton } from '@angular/material/radio';

import { BlockDirective, ElemDirective } from '../../../../bem';
import { Nullable, RtIconOutlinedDirective, transformArrayInput } from '../../../../util';
import { ITable, RtTableStoreService, SortModel, TABLE_COLUMN_TYPES_ENUM } from '../../util';
import { RtTableConfigService } from '../../util/table-config.service';
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
> implements OnInit
{
    readonly #injector: Injector = inject(Injector);
    readonly #tableConfigService: RtTableConfigService<ENTITY_TYPE> = inject(RtTableConfigService);
    readonly #tableStoreService: RtTableStoreService<ENTITY_TYPE, KEY> = inject(RtTableStoreService);

    protected readonly columnTypes: typeof TABLE_COLUMN_TYPES_ENUM = TABLE_COLUMN_TYPES_ENUM;

    public entities: InputSignalWithTransform<ENTITY_TYPE[], ENTITY_TYPE[]> = input.required<ENTITY_TYPE[], ENTITY_TYPE[]>({
        transform: (value: ENTITY_TYPE[]) => transformArrayInput(value),
    });
    public currentSortModel: InputSignal<Nullable<SortModel<SORT_PROPERTY>>> = input.required();
    public isMobile: InputSignalWithTransform<Nullable<boolean>, Nullable<boolean>> = input.required<Nullable<boolean>, Nullable<boolean>>({
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

    public readonly sortChange: OutputEmitterRef<SortModel<SORT_PROPERTY>> = output<SortModel<SORT_PROPERTY>>();
    public readonly rowClick: OutputEmitterRef<NonNullable<ENTITY_TYPE>> = output<NonNullable<ENTITY_TYPE>>();
    public readonly rowDoubleClick: OutputEmitterRef<NonNullable<ENTITY_TYPE>> = output<NonNullable<ENTITY_TYPE>>();

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

    public columns: Signal<Array<ITable.Column<ENTITY_TYPE>>> = computed(() => {
        return this.#tableConfigService.tableConfig().columns;
    });
    public readonly selectedEntitiesIds: Signal<ENTITY_TYPE[KEY][]> = this.#tableStoreService.selectedEntitiesIds;
    public readonly isExistingEntitiesSelected: Signal<boolean> = this.#tableStoreService.isExistingEntitiesSelected;
    public readonly isExistingEntitiesIndeterminate: Signal<boolean> = this.#tableStoreService.isExistingEntitiesIndeterminate;
    public readonly activeRowIndex: WritableSignal<Nullable<number>> = signal(null);

    public ngOnInit(): void {
        /** Update selectors state when after list of entities change */
        toObservable(this.entities, { injector: this.#injector })
            .pipe()
            .subscribe((list: ENTITY_TYPE[]) => {
                this.#tableStoreService.setAllEntitiesState(list);
                this.#tableStoreService.setExistingEntitiesState(list);
            });
    }

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

    public onToggleEntity(entity: ENTITY_TYPE, checked: boolean): void {
        this.#tableStoreService.toggleEntity(
            untracked(() => this.entities()),
            entity,
            checked
        );
    }

    public onToggleExistingEntities(checked: boolean): void {
        this.#tableStoreService.toggleExistingEntities(
            untracked(() => this.entities()),
            checked
        );
    }
}
