import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    contentChild,
    DestroyRef,
    Directive,
    effect,
    inject,
    Injector,
    input,
    InputSignal,
    InputSignalWithTransform,
    OnInit,
    output,
    OutputEmitterRef,
    Signal,
    signal,
    TemplateRef,
    Type,
    WritableSignal,
} from '@angular/core';
import { BooleanInput } from '@angular/cdk/coercion';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatMiniFabButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatFormField, MatFormFieldAppearance, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { DomSanitizer } from '@angular/platform-browser';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';

import { BlockDirective, ElemDirective, ModDirective, PlatformService, WINDOW } from '@rt-tools/core';
import { INullable } from '@rt-tools/utils';
import { isString, IPageModel, transformStringInput } from '@rt-tools/utils';
import { BreakpointService, RtIconOutlinedDirective } from '@rt-tools/core';
import { RtAsideService } from '../../../aside';
import { RtuiHeaderCenterDirective } from '../../../header';
import {
    RtuiScrollableContainerComponent,
    RtuiScrollableContainerContentDirective,
    RtuiScrollableContainerHeaderDirective,
} from '../../../scrollable';
import { RtuiSpinnerComponent } from '../../../spinner';
import { RtuiToolbarComponent, RtuiToolbarLeftDirective, RtuiToolbarRightDirective } from '../../../toolbar';
import { ITable, RtTableConfigService } from '../../util';
import { RtuiClearButtonComponent } from '../clear-search-button/rtui-clear-button.component';
import { RtuiPaginationComponent } from '../pagination-view/rtui-pagination.component';
import { RtTableConfigAsideComponent } from '../table-config-aside/rt-table-config-aside.component';

@Directive({
    selector: '[rtuiTableToolbarSelectorsDirective]',
})
export class RtuiTableToolbarSelectorsDirective {}

@Directive({
    selector: '[rtuiTableToolbarActionsDirective]',
})
export class RtuiTableToolbarActionsDirective {}

const BEM_BLOCK: string = 'rtui-table-container';

@Component({
    selector: 'rtui-table-container',
    host: { class: BEM_BLOCK },
    templateUrl: './table-container.component.html',
    styleUrls: ['./table-container.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ReactiveFormsModule,
        NgTemplateOutlet,

        // Material
        MatIcon,
        MatFormField,
        MatInput,
        MatPrefix,
        MatSuffix,
        MatMiniFabButton,
        MatTooltip,
        MatCheckbox,

        // Standalone components
        RtuiPaginationComponent,
        RtuiClearButtonComponent,
        RtuiToolbarComponent,
        RtuiScrollableContainerComponent,
        RtuiSpinnerComponent,

        // Bem
        BlockDirective,
        ElemDirective,
        ModDirective,

        // Directives
        RtuiToolbarRightDirective,
        RtuiHeaderCenterDirective,
        RtuiScrollableContainerContentDirective,
        RtuiScrollableContainerHeaderDirective,
        RtIconOutlinedDirective,
        RtuiToolbarLeftDirective,
    ],
    providers: [BreakpointService, RtAsideService, PlatformService],
})
export class RtuiTableContainerComponent<ENTITY_TYPE> implements OnInit {
    readonly #documentRef: Document = inject(DOCUMENT);
    readonly #windowRef: Window = inject(WINDOW);
    readonly #platformService: PlatformService = inject(PlatformService);
    readonly #sanitizer: DomSanitizer = inject(DomSanitizer);
    readonly #injector: Injector = inject(Injector);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #breakpointService: BreakpointService = inject(BreakpointService);
    readonly #asideService: RtAsideService = inject(RtAsideService);
    readonly #tableConfigService: RtTableConfigService<ENTITY_TYPE> = inject(RtTableConfigService);

    readonly #style: INullable<CSSStyleDeclaration> = this.#documentRef?.documentElement?.style;

    public appearance: InputSignal<MatFormFieldAppearance> = input.required();
    /** Table config storage key */
    public tableConfigStorageKey: InputSignalWithTransform<string, string> = input.required<string, string>({
        transform: transformStringInput,
    });
    /** Current page model from store */
    public pageModel: InputSignal<IPageModel> = input.required();
    /** Indicates is mobile view */
    public isMobile: InputSignalWithTransform<boolean, BooleanInput> = input.required<boolean, BooleanInput>({
        transform: booleanAttribute,
    });
    /** Indicates is loading in progress */
    public loading: InputSignalWithTransform<boolean, BooleanInput> = input.required<boolean, BooleanInput>({
        transform: booleanAttribute,
    });
    /** Indicates is fetching in progress */
    public fetching: InputSignalWithTransform<boolean, BooleanInput> = input.required<boolean, BooleanInput>({
        transform: booleanAttribute,
    });
    /** Indicates is placeholder shown */
    public isPlaceholderShown: InputSignalWithTransform<boolean, BooleanInput> = input.required<boolean, BooleanInput>({
        transform: booleanAttribute,
    });
    /** Indicates is pagination shown */
    public isPaginationShown: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });
    /** Indicates is the refresh button shown */
    public isRefreshButtonShown: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });
    /** Indicates is a table config button shown */
    public isTableConfigButtonShown: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });
    /** Indicates is toolbar buttons outlined */
    public isToolbarActionsIconsOutlined: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });
    /** Indicates is filters shown */
    public isFiltersShown: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    /** Indicates is filters empty */
    public isFiltersEmpty: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    /** Current search term from store */
    public searchTerm: InputSignalWithTransform<INullable<string>, INullable<string>> = input<INullable<string>, INullable<string>>('', {
        transform: (value: INullable<string>) => (isString(value) ? value.trim() : ''),
    });

    /** Current placeholder icon */
    public placeholderIcon: InputSignal<string> = input<string>('search');
    /** Current placeholder title */
    public placeholderTitle: InputSignal<string> = input<string>('No Data Found');

    /** Indicates is a small tablet view */
    public readonly isSmallTablet: Signal<INullable<boolean>> = this.#breakpointService.isSmallTablet;
    /** Config for table */
    public readonly tableConfig: Signal<ITable.Config.Data<ENTITY_TYPE>> = this.#tableConfigService.tableConfig;

    /** Page model change output action */
    public readonly pageModelChange: OutputEmitterRef<Partial<IPageModel>> = output<Partial<IPageModel>>();
    /** Search change output action */
    public readonly searchChange: OutputEmitterRef<INullable<string>> = output<INullable<string>>();
    /** Refresh output action */
    public readonly refreshAction: OutputEmitterRef<void> = output<void>();
    /** Clear filters output action */
    public readonly clearFiltersAction: OutputEmitterRef<void> = output<void>();

    /** Toolbar selectors template */
    public readonly toolbarSelectorsTpl: Signal<INullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiTableToolbarSelectorsDirective, {
        read: TemplateRef,
    });
    /** Toolbar actions template */
    public readonly toolbarActionsTpl: Signal<INullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiTableToolbarActionsDirective, {
        read: TemplateRef,
    });

    /** Fields specified by the directive */
    /** Indicates is multiselect mod enabled */
    public readonly isMultiSelect: WritableSignal<boolean> = signal(false);
    /** Indicates is 'Select All' selector shown */
    public readonly isSelectAllSelectorShown: WritableSignal<boolean> = signal(true);
    /** Indicates is 'Select All' selector disabled */
    public readonly isSelectAllSelectorDisabled: WritableSignal<boolean> = signal(false);
    /** Indicates is all entities selected */
    public readonly isAllEntitiesSelected: WritableSignal<boolean> = signal(false);
    /** Indicates is all entities indeterminate */
    public readonly isAllEntitiesIndeterminate: WritableSignal<boolean> = signal(false);
    /** Current selected entities count */
    public readonly selectedEntitiesCount: WritableSignal<number> = signal(0);

    /** Control for search */
    public readonly searchControl: FormControl<INullable<string>> = new FormControl(null);

    public ngOnInit(): void {
        /** Set scrollbar initial styles by config */
        effect(
            () => {
                if (this.tableConfig().columns.length) {
                    this.#setScrollbarsVisibility();
                }
            },
            { injector: this.#injector }
        );

        this.searchControl.patchValue(this.searchTerm(), { emitEvent: false });

        this.searchControl.valueChanges
            .pipe(
                debounceTime(500),
                distinctUntilChanged(),
                map((value: INullable<string>) => (!!value ? value.trim() : value)),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((value: INullable<string>) => {
                if (value !== null) {
                    this.searchChange.emit(value);
                }
            });
    }

    /** Page model change output action */
    public onPageModelChange(pageModel: Partial<IPageModel>): void {
        this.pageModelChange.emit(pageModel);
    }

    /** Clear search control and search change output action */
    public onClearSearch(): void {
        this.searchControl.patchValue(null);
        this.searchChange.emit('');
    }

    /** Refresh output action */
    public onRefresh(): void {
        if (!this.isPaginationShown()) {
            this.onClearSearch();
        }

        this.refreshAction.emit();
    }

    /** Clear filters output action */
    public onClearFilters(): void {
        this.clearFiltersAction.emit();
    }

    /** Open table config aside */
    public onOpenConfigAside(): void {
        this.#asideService
            .Open<RtTableConfigAsideComponent<ENTITY_TYPE>, ITable.Config.Data<ENTITY_TYPE>, ITable.Config.Data<ENTITY_TYPE>>(
                RtTableConfigAsideComponent,
                'right',
                this.tableConfig()
            )
            .pipe(filter(Boolean), takeUntilDestroyed(this.#destroyRef))
            .subscribe((value: ITable.Config.Data<ENTITY_TYPE>) => {
                /** Save updated table config */
                this.#tableConfigService.updateConfig(this.tableConfigStorageKey(), value);
                this.#setScrollbarsVisibility();
            });
    }

    /** Empty method, set in selectors directive */
    public onToggleAllEntities: (checked: boolean) => void = (): void => {
        return;
    };

    /** Set scrollbar styles by config */
    #setScrollbarsVisibility(): void {
        const vertical: string = this.tableConfig().isVerticalScrollbarShown ? '12px' : '0';
        const horizontal: string = this.tableConfig().isHorizontalScrollbarShown ? '12px' : '0';

        if (this.#platformService?.isPlatformBrowser && this.#windowRef && this.#style) {
            const safeVerticalValue: INullable<string> = this.#sanitizer.sanitize(0, vertical);
            const safeHorizontalValue: INullable<string> = this.#sanitizer.sanitize(0, horizontal);
            this.#style.setProperty('--rt-table-container-content-scrollbar-vertical-width', safeVerticalValue);
            this.#style.setProperty('--rt-table-container-content-scrollbar-horizontal-height', safeHorizontalValue);
        }
    }
}
