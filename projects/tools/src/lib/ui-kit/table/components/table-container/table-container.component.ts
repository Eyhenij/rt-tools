import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    Directive,
    Injector,
    InputSignal,
    InputSignalWithTransform,
    OnInit,
    OutputEmitterRef,
    Signal,
    TemplateRef,
    Type,
    booleanAttribute,
    contentChild,
    effect,
    inject,
    input,
    output,
} from '@angular/core';
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

import { BlockDirective, ElemDirective, ModDirective } from '../../../../bem';
import {
    BreakpointService,
    Nullable,
    PlatformService,
    RtIconOutlinedDirective,
    WINDOW,
    isString,
    transformStringInput,
} from '../../../../util';
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
import { PageModel } from '../../util/lists.interface';
import { RtuiClearButtonComponent } from '../clear-search-button/rtui-clear-button.component';
import { RtuiPaginationComponent } from '../pagination-view/rtui-pagination.component';
import { RtTableConfigAsideComponent } from '../table-config-aside/rt-table-config-aside.component';

@Directive({
    standalone: true,
    selector: '[rtuiTableToolbarSelectorsDirective]',
})
export class RtuiTableToolbarSelectorsDirective {}

@Directive({
    standalone: true,
    selector: '[rtuiTableToolbarActionsDirective]',
})
export class RtuiTableToolbarActionsDirective {}

@Component({
    standalone: true,
    selector: 'rtui-table-container',
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

    readonly #style: Nullable<CSSStyleDeclaration> = this.#documentRef?.documentElement?.style;

    public appearance: InputSignal<MatFormFieldAppearance> = input.required();
    /** Table config storage key */
    public tableConfigStorageKey: InputSignalWithTransform<string, string> = input.required<string, string>({
        transform: transformStringInput,
    });
    public pageModel: InputSignal<PageModel> = input.required();
    public isMobile: InputSignalWithTransform<Nullable<boolean>, Nullable<boolean>> = input.required<Nullable<boolean>, Nullable<boolean>>({
        transform: booleanAttribute,
    });
    public loading: InputSignalWithTransform<boolean, boolean> = input.required<boolean, boolean>({
        transform: booleanAttribute,
    });
    public fetching: InputSignalWithTransform<boolean, boolean> = input.required<boolean, boolean>({
        transform: booleanAttribute,
    });
    public isPlaceholderShown: InputSignalWithTransform<boolean, boolean> = input.required<boolean, boolean>({
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
    public isMultiSelect: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public isAllEntitiesSelected: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public isAllEntitiesIndeterminate: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public searchTerm: InputSignalWithTransform<Nullable<string>, Nullable<string>> = input<Nullable<string>, Nullable<string>>('', {
        transform: (value: Nullable<string>) => (isString(value) ? value.trim() : ''),
    });

    public placeholderIcon: InputSignal<string> = input<string>('search');
    public placeholderTitle: InputSignal<string> = input<string>('No Data Found');

    public readonly isSmallTablet: Signal<Nullable<boolean>> = this.#breakpointService.isSmallTablet;
    public readonly tableConfig: Signal<ITable.Config.Data<ENTITY_TYPE>> = this.#tableConfigService.tableConfig;

    public readonly pageModelChange: OutputEmitterRef<Partial<PageModel>> = output<Partial<PageModel>>();
    public readonly searchChange: OutputEmitterRef<Nullable<string>> = output<Nullable<string>>();
    public readonly refreshAction: OutputEmitterRef<void> = output<void>();
    public readonly toggleAllEntities: OutputEmitterRef<boolean> = output<boolean>();

    public readonly toolbarSelectorsTpl: Signal<Nullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiTableToolbarSelectorsDirective, {
        read: TemplateRef,
    });
    public readonly toolbarActionsTpl: Signal<Nullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiTableToolbarActionsDirective, {
        read: TemplateRef,
    });

    public readonly searchControl: FormControl<Nullable<string>> = new FormControl(null);

    public ngOnInit(): void {
        /** Set scrollbar initial styles by config */
        effect(
            () => {
                if (this.tableConfig().columns.length) {
                    this.#setScrollbarsVisibility();
                }
            },
            { injector: this.#injector, allowSignalWrites: true }
        );

        this.searchControl.patchValue(this.searchTerm(), { emitEvent: false });

        this.searchControl.valueChanges
            .pipe(
                debounceTime(500),
                distinctUntilChanged(),
                map((value: Nullable<string>) => (isString(value) ? value.trim() : null)),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((value: Nullable<string>) => {
                this.searchChange.emit(value);
            });
    }

    public onPageModelChange(pageModel: Partial<PageModel>): void {
        this.pageModelChange.emit(pageModel);
    }

    public onClearSearch(): void {
        this.searchControl.patchValue(null);
    }

    public onRefresh(): void {
        if (!this.isPaginationShown()) {
            this.onClearSearch();
        }

        this.refreshAction.emit();
    }

    public onToggleAllEntities(checked: boolean): void {
        this.toggleAllEntities.emit(checked);
    }

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

    /** Set scrollbar styles by config */
    #setScrollbarsVisibility(): void {
        const vertical: string = this.tableConfig().isVerticalScrollbarShown ? '12px' : '0';
        const horizontal: string = this.tableConfig().isHorizontalScrollbarShown ? '12px' : '0';

        if (this.#platformService?.isPlatformBrowser && this.#windowRef && this.#style) {
            const safeVerticalValue: Nullable<string> = this.#sanitizer.sanitize(0, vertical);
            const safeHorizontalValue: Nullable<string> = this.#sanitizer.sanitize(0, horizontal);
            this.#style.setProperty('--rt-table-container-content-scrollbar-vertical-width', safeVerticalValue);
            this.#style.setProperty('--rt-table-container-content-scrollbar-horizontal-height', safeHorizontalValue);
        }
    }
}
