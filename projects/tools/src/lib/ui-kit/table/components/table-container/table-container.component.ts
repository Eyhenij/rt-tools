import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    Directive,
    InputSignal,
    InputSignalWithTransform,
    OnInit,
    OutputEmitterRef,
    Signal,
    TemplateRef,
    Type,
    booleanAttribute,
    contentChild,
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

import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import { BlockDirective, ElemDirective, ModDirective } from '../../../../bem';
import { Nullable, RtIconOutlinedDirective, isString } from '../../../../util';
import { RtuiHeaderCenterDirective } from '../../../header';
import {
    RtuiScrollableContainerComponent,
    RtuiScrollableContainerContentDirective,
    RtuiScrollableContainerHeaderDirective,
} from '../../../scrollable';
import { RtuiSpinnerComponent } from '../../../spinner';
import { RtuiToolbarComponent, RtuiToolbarLeftDirective, RtuiToolbarRightDirective } from '../../../toolbar';
import { PageModel } from '../../util/lists.interface';
import { RtuiClearButtonComponent } from '../clear-search-button/rtui-clear-button.component';
import { RtuiPaginationComponent } from '../pagination-view/rtui-pagination.component';

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
})
export class RtuiTableContainerComponent implements OnInit {
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    public appearance: InputSignal<MatFormFieldAppearance> = input.required();
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
    public isActionsIconsOutlined: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(true, {
        transform: booleanAttribute,
    });
    public isSelectorShown: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public isAllEntitiesSelected: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public searchTerm: InputSignalWithTransform<Nullable<string>, Nullable<string>> = input<Nullable<string>, Nullable<string>>('', {
        transform: (value: Nullable<string>) => (isString(value) ? value.trim() : ''),
    });

    public placeholderIcon: InputSignal<string> = input<string>('search');
    public placeholderTitle: InputSignal<string> = input<string>('No Data Found');

    public readonly pageModelChange: OutputEmitterRef<Partial<PageModel>> = output<Partial<PageModel>>();
    public readonly searchChange: OutputEmitterRef<Nullable<string>> = output<Nullable<string>>();
    public readonly refreshAction: OutputEmitterRef<void> = output<void>();
    public readonly toggleAllEntities: OutputEmitterRef<boolean> = output<boolean>();

    public readonly toolbarActionsTpl: Signal<Nullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiTableToolbarActionsDirective, {
        read: TemplateRef,
    });

    public readonly searchControl: FormControl<Nullable<string>> = new FormControl(null);

    public ngOnInit(): void {
        this.searchControl.patchValue(this.searchTerm(), { emitEvent: false });

        this.searchControl.valueChanges
            .pipe(
                debounceTime(500),
                distinctUntilChanged(),
                map((value: Nullable<string>) => (!!value ? value.trim() : value)),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((value: Nullable<string>) => {
                if (value !== null) {
                    this.searchChange.emit(value);
                }
            });
    }

    public onPageModelChange(pageModel: Partial<PageModel>): void {
        this.pageModelChange.emit(pageModel);
    }

    public onClearSearch(): void {
        this.searchControl.patchValue(null);
        this.searchChange.emit('');
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
}
