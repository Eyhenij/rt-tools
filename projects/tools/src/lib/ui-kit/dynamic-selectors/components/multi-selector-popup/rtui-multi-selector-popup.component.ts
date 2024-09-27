import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    Injector,
    InputSignal,
    InputSignalWithTransform,
    OnInit,
    OutputEmitterRef,
    Signal,
    WritableSignal,
    booleanAttribute,
    effect,
    inject,
    input,
    output,
    signal,
    untracked,
    viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatFormField, MatFormFieldAppearance, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatRadioButton } from '@angular/material/radio';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';

import { debounceTime } from 'rxjs/operators';

import { BlockDirective, ElemDirective } from '../../../../bem';
import {
    BreakStringPipe,
    DeviceDetectorService,
    EntityToStringPipe,
    Nullable,
    OSTypes,
    RtIconOutlinedDirective,
    RtScrollDirective,
    transformArrayInput,
} from '../../../../util';
import { RtuiSpinnerComponent } from '../../../spinner';
import { RtuiClearButtonComponent } from '../../../table';
import { RtuiToggleComponent } from '../../../toggle';

@Component({
    standalone: true,
    selector: 'rtui-multi-selector-popup',
    templateUrl: './rtui-multi-selector-popup.component.html',
    styleUrls: ['./rtui-multi-selector-popup.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // Material
        MatButton,
        MatTooltip,
        MatFormField,
        MatIcon,
        MatInput,
        MatPrefix,
        MatSuffix,
        MatCheckbox,
        MatIconButton,
        MatRadioButton,
        MatProgressSpinner,
        BreakStringPipe,
        ReactiveFormsModule,
        RouterLink,
        FormsModule,

        // directives
        BlockDirective,
        ElemDirective,
        RtScrollDirective,
        RtIconOutlinedDirective,

        // components
        RtuiClearButtonComponent,
        RtuiToggleComponent,
        RtuiSpinnerComponent,
        EntityToStringPipe,
    ],
    providers: [DeviceDetectorService],
})
export class RtuiMultiSelectorPopupComponent<ENTITY extends Record<string, unknown>, KEY extends Extract<keyof ENTITY, string>>
    implements OnInit, AfterViewInit
{
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #injector: Injector = inject(Injector);
    readonly #deviceService: DeviceDetectorService = inject(DeviceDetectorService);

    protected readonly oSTypes: typeof OSTypes = OSTypes;

    /** Indicates is mobile view */
    public isMobile: InputSignalWithTransform<Nullable<boolean>, Nullable<boolean>> = input.required<Nullable<boolean>, Nullable<boolean>>({
        transform: booleanAttribute,
    });
    public entitiesToSelect: InputSignalWithTransform<ENTITY[], ENTITY[]> = input.required<ENTITY[], ENTITY[]>({
        transform: (value: unknown) => transformArrayInput(value),
    });
    /** Material elements appearance */
    public appearance: InputSignal<MatFormFieldAppearance> = input.required();
    /** A model's field which should be used for http-requests */
    public keyExp: InputSignal<KEY> = input.required();
    /** A model's field which should be shown in ui */
    public displayExp: InputSignal<KEY> = input.required();
    /** Init search term value */
    public searchTerm: InputSignal<string> = input<string>('');
    /** Navigation button title */
    public navigateButtonTitle: InputSignal<string> = input<string>('');
    /** Navigation button link */
    public navigateLink: InputSignal<string> = input<string>('');
    /** Indicates if only one option can be chosen */
    public isSingleSelection: InputSignalWithTransform<Nullable<boolean>, boolean> = input<Nullable<boolean>, boolean>(null, {
        transform: booleanAttribute,
    });
    /** Indicates is change multi select mode toggle shown */
    public isMultiToggleShown: InputSignalWithTransform<Nullable<boolean>, boolean> = input<Nullable<boolean>, boolean>(null, {
        transform: booleanAttribute,
    });
    /** Indicates that a list of entities is being loading */
    public loading: InputSignalWithTransform<Nullable<boolean>, boolean> = input<Nullable<boolean>, boolean>(null, {
        transform: booleanAttribute,
    });
    /** Indicates that a list of entities is being fetching */
    public fetching: InputSignalWithTransform<Nullable<boolean>, boolean> = input<Nullable<boolean>, boolean>(null, {
        transform: booleanAttribute,
    });
    /** Indicates is BreakStringPipe used */
    public useNameBreaking: InputSignalWithTransform<Nullable<boolean>, boolean> = input<Nullable<boolean>, boolean>(null, {
        transform: booleanAttribute,
    });
    /** Indicates lazy loading is used */
    public isLazyLoad: InputSignalWithTransform<Nullable<boolean>, boolean> = input<Nullable<boolean>, boolean>(null, {
        transform: booleanAttribute,
    });
    /** Indicates local search is used */
    public isLocalSearch: InputSignalWithTransform<Nullable<boolean>, boolean> = input<Nullable<boolean>, boolean>(true, {
        transform: booleanAttribute,
    });

    /** Send output selected entities ids */
    public readonly submitAction: OutputEmitterRef<ENTITY[KEY][]> = output<ENTITY[KEY][]>();
    /** Close popup action */
    public readonly closeAction: OutputEmitterRef<void> = output<void>();
    /** Output search action */
    public readonly searchAction: OutputEmitterRef<string> = output<string>();
    /** Output scroll action, needed for lazy loading */
    public readonly scrollAction: OutputEmitterRef<void> = output<void>();
    /** Output temporary selection action, needed for store values */
    public readonly temporarySelectAction: OutputEmitterRef<ENTITY[]> = output<ENTITY[]>();

    /** Search input Ref for set focus on init */
    public readonly searchInputRef: Signal<Nullable<ElementRef<HTMLInputElement>>> =
        viewChild<ElementRef<HTMLInputElement>>('searchInputTpl');

    /** Form control for search */
    public readonly searchControl: FormControl<Nullable<string>> = new FormControl('');
    /** Form control for select */
    public readonly selectionControl: FormControl<ENTITY[KEY][]> = new FormControl<ENTITY[KEY][]>([], { nonNullable: true });
    /** Entities filtered by local search */
    public readonly filteredEntities: WritableSignal<ENTITY[]> = signal([]);
    /** Selected entities */
    public readonly selectedEntities: WritableSignal<ENTITY[]> = signal([]);
    /** Indicates is all available entities has been selected */
    public readonly isAllSelected: WritableSignal<boolean> = signal(false);
    /** Indicates is multi selection mode enabled */
    public readonly isMultiSelection: WritableSignal<boolean> = signal(true);
    /** Indicates is macOS used */
    public readonly isMacOS: Signal<boolean> = signal(this.#deviceService.getOS() === this.oSTypes.MAC_OS);

    public ngOnInit(): void {
        /** Clear previous temp selection  */
        this.temporarySelectAction.emit([]);

        if (this.searchTerm()) {
            this.onClearSearch();
        }

        /** Filter list of entities by search  */
        this.searchControl.valueChanges
            .pipe(debounceTime(this.isLocalSearch() ? 0 : 500), takeUntilDestroyed(this.#destroyRef))
            .subscribe((value: Nullable<string>): void => {
                const selectedEntities: ENTITY[] = this.entitiesToSelect().filter((el: ENTITY) => {
                    return this.selectionControl.value.includes(el[this.keyExp()]);
                });
                this.selectedEntities.set(selectedEntities);
                this.temporarySelectAction.emit(selectedEntities);

                if (value && this.isLocalSearch()) {
                    const searchTerms: string[] = value.toLowerCase().trim().split(' ');

                    this.filteredEntities.set(
                        this.entitiesToSelect().filter((el: ENTITY) => {
                            return (
                                (typeof el[this.displayExp()] === 'string' || typeof el[this.displayExp()] === 'number') &&
                                searchTerms.every(
                                    (term: string) =>
                                        el[this.displayExp()]?.toString().toLowerCase().includes(term) &&
                                        !this.selectedEntities().includes(el)
                                )
                            );
                        })
                    );
                } else if (this.isLocalSearch()) {
                    this.filteredEntities.set(this.entitiesToSelect());
                } else if (value !== null && typeof value === 'string') {
                    this.searchAction.emit(value);
                }
            });

        /** Set entitiesToSelect list and isAllSelected checkbox state  */
        effect(
            () => {
                if (this.entitiesToSelect() && Array.isArray(this.entitiesToSelect())) {
                    if (this.searchControl?.value) {
                        const filteredEntities: ENTITY[] = this.entitiesToSelect().filter((el: ENTITY) => {
                            return !this.selectionControl.value.includes(el[this.keyExp()]);
                        });
                        this.filteredEntities.set(filteredEntities);
                    } else {
                        this.filteredEntities.set(this.entitiesToSelect());
                    }

                    this.isAllSelected.set(
                        this.searchControl?.value
                            ? this.selectionControl.value?.length - untracked(() => this.selectedEntities()?.length) ===
                                  untracked(() => this.filteredEntities()?.length)
                            : this.selectionControl.value?.length === untracked(() => this.filteredEntities()?.length)
                    );
                }
            },
            { injector: this.#injector, allowSignalWrites: true }
        );
    }

    /** Set focus on search input  */
    public ngAfterViewInit(): void {
        if (this.searchInputRef) {
            this.searchInputRef()?.nativeElement.focus();
        }
    }

    /** Change Multi election mode  */
    public toggleMultiSelection(): void {
        this.isMultiSelection.update((value: boolean) => !value);
    }

    /** Toggle select all */
    public toggleSelectAll(value: boolean): void {
        this.isAllSelected.set(value);

        if (this.isAllSelected() && this.searchControl.value) {
            this.selectionControl.patchValue([
                ...this.selectedEntities().map((el: ENTITY) => el[this.keyExp()]),
                ...this.filteredEntities().map((el: ENTITY) => el[this.keyExp()]),
            ]);
        } else if (this.isAllSelected()) {
            this.selectionControl.patchValue(this.filteredEntities().map((el: ENTITY) => el[this.keyExp()]));
        } else {
            this.selectionControl.patchValue([]);
        }
    }

    /** Update selectionControl and isAllSelected checkbox state */
    public itemToggle(entity: ENTITY, checked: boolean): void {
        if (checked) {
            this.selectionControl.patchValue([...this.selectionControl.value, entity[this.keyExp()]]);
        } else {
            this.selectionControl.patchValue(
                this.selectionControl.value.filter((el: ENTITY[KEY]): boolean => {
                    return el !== entity[this.keyExp()];
                })
            );
        }

        this.isAllSelected.set(
            this.searchControl.value
                ? this.selectionControl.value?.length - this.selectedEntities()?.length === this.filteredEntities()?.length
                : this.selectionControl.value?.length === this.filteredEntities()?.length
        );
    }

    /** Proceed select action in multi selection mode  */
    public onToggleItem(event: MouseEvent, entity: ENTITY, checked: boolean): void {
        const multipleSelectionEnabled: boolean = this.isMacOS() ? event.metaKey : event.ctrlKey;

        if ((!this.isMultiSelection() && !multipleSelectionEnabled) || this.isSingleSelection()) {
            this.toggleSelectAll(false);
        }

        this.itemToggle(entity, checked);
    }

    /** Proceed select action in single selection mode  */
    public onToggleSingleItem(entity: ENTITY, checked: boolean): void {
        this.toggleSelectAll(false);
        this.itemToggle(entity, checked);
    }

    /** Output action, selected entities ids */
    public onSubmit(): void {
        if (this.selectionControl.value?.length) {
            this.submitAction.emit(this.selectionControl.value);
        }
    }

    /** Close popup */
    public onClose(): void {
        this.closeAction.emit();
    }

    /** Clear search */
    public onClearSearch(): void {
        if (!this.isLocalSearch()) {
            this.searchAction.emit('');
        }
        this.searchControl.patchValue(null);
    }

    /** Scroll action, needed for lazy loading mode */
    public scroll(): void {
        this.scrollAction.emit();
    }
}
