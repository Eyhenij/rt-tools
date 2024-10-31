import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    Directive,
    Injector,
    InputSignal,
    InputSignalWithTransform,
    ModelSignal,
    OnInit,
    OutputEmitterRef,
    Signal,
    TemplateRef,
    WritableSignal,
    booleanAttribute,
    computed,
    contentChild,
    effect,
    forwardRef,
    inject,
    input,
    model,
    output,
    signal,
    untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    ControlValueAccessor,
    FormBuilder,
    FormControl,
    FormGroup,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    ReactiveFormsModule,
    ValidationErrors,
    Validator,
} from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

import { noop } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';

import { BlockDirective, ElemDirective } from '../../../../bem';
import {
    BreakStringPipe,
    EntityToStringPipe,
    Nullable,
    OVERLAY_POSITIONS,
    RtEscapeKeyDirective,
    RtHideTooltipDirective,
    RtIconOutlinedDirective,
    areArraysEqual,
    checkIsEntityInArrayByKey,
    sortByAlphabet,
    transformArrayInput,
} from '../../../../util';
import { RtuiDynamicSelectorListActionsComponent } from '../actions/rtui-dynamic-selector-list-actions.component';
import { RtuiDynamicSelectorsDirective } from '../dynamic-selectors-directive';
import { RtuiMultiSelectorPopupComponent } from '../multi-selector-popup/rtui-multi-selector-popup.component';
import { RtuiDynamicSelectorPlaceholderComponent } from '../placeholder/rtui-dynamic-selector-placeholder.component';
import {
    RtuiDynamicSelectorItemAdditionalControlDirective,
    RtuiDynamicSelectorSelectedListComponent,
} from '../selected-list/rtui-dynamic-selector-selected-list.component';

interface FormModel {
    autocompleteControl: FormControl<Nullable<string>>;
}

/** Directive for row actions located outside a row menu button */
@Directive({
    standalone: true,
    selector: '[rtuiDynamicSelectorAdditionalControlDirective]',
})
export class RtuiDynamicSelectorAdditionalControlDirective {}

@Component({
    standalone: true,
    selector: 'rtui-dynamic-selector',
    templateUrl: './rtui-dynamic-selector.component.html',
    styleUrls: ['./rtui-dynamic-selector.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ReactiveFormsModule,
        NgTemplateOutlet,
        CdkOverlayOrigin,
        CdkConnectedOverlay,

        // material
        MatIconButton,
        MatTooltip,
        MatIcon,

        // pipes
        BreakStringPipe,
        EntityToStringPipe,

        // directives
        BlockDirective,
        ElemDirective,
        RtIconOutlinedDirective,
        RtHideTooltipDirective,
        RtEscapeKeyDirective,
        RtuiDynamicSelectorItemAdditionalControlDirective,

        // components
        RtuiMultiSelectorPopupComponent,
        RtuiDynamicSelectorPlaceholderComponent,
        RtuiDynamicSelectorListActionsComponent,
        RtuiDynamicSelectorSelectedListComponent,
    ],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RtuiDynamicSelectorComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: RtuiDynamicSelectorComponent,
            multi: true,
        },
    ],
})
export class RtuiDynamicSelectorComponent<ENTITY extends Record<string, unknown>, KEY extends Extract<keyof ENTITY, string>>
    extends RtuiDynamicSelectorsDirective
    implements ControlValueAccessor, Validator, OnInit
{
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #injector: Injector = inject(Injector);
    readonly #fb: FormBuilder = inject(FormBuilder);

    /** Config for overlay selector */
    protected readonly connectedOverlayPositions: ConnectedPosition[] = [...OVERLAY_POSITIONS];

    public form: FormGroup<FormModel> = this.#fb.group<FormModel>({
        autocompleteControl: this.#fb.control<Nullable<string>>(null), // used only for UI
    });
    /** Target element for overlay selector */
    public selectedOverlayTrigger: Nullable<CdkOverlayOrigin> = null;

    /** A model's field which should be used for http-requests */
    public keyExp: InputSignal<KEY> = input.required();
    /** A model's field which should be shown in ui */
    public displayExp: InputSignal<KEY> = input.required();
    /** All entities available entities */
    public entities: InputSignalWithTransform<ENTITY[], ENTITY[]> = input.required<ENTITY[], ENTITY[]>({
        transform: (value: unknown) => transformArrayInput(value),
    });
    /** Navigation button title for popup actions */
    public navigateButtonTitle: InputSignal<string> = input<string>('');
    /** Navigation button link for popup actions */
    public navigateLink: InputSignal<string> = input<string>('');
    /** Entity keys that can't be changed */
    public readonlyEntitiesKeys: InputSignalWithTransform<ENTITY[KEY][], ENTITY[KEY][]> = input<ENTITY[KEY][], ENTITY[KEY][]>([], {
        transform: (value: ENTITY[KEY][]) => transformArrayInput(value),
    });
    /** Selected entities */
    public chosenEntities: ModelSignal<ENTITY[]> = model<ENTITY[]>([]);
    /** Indicates is selection available */
    public isSelectionAvailable: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(true, {
        transform: booleanAttribute,
    });
    /** Indicates is placeholder shown */
    public isPlaceholderShown: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    /** Indicates that a list of entities is being loading */
    public loading: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    /** Indicates that a list of entities is being pending */
    public pending: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    /** Indicates that a list of entities is being fetching */
    public fetching: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    /** Indicates lazy loading is used */
    public isLazyLoad: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    /** Indicates local search is used */
    public isLocalSearch: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(true, {
        transform: booleanAttribute,
    });
    /** Indicates is change multi select mode toggle shown */
    public isMultiToggleShown: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    /** Init search term value */
    public searchTerm: InputSignal<string> = input('');
    /** Indicates that an additional control has been changed */
    public additionalControlChanged: InputSignal<boolean> = input(false);

    /** Output search action */
    public readonly searchAction: OutputEmitterRef<string> = output<string>();
    /** Output scroll action, needed for lazy loading */
    public readonly scrollAction: OutputEmitterRef<void> = output<void>();
    /** Output temporary selection action, needed for store values */
    public readonly temporarySelectAction: OutputEmitterRef<ENTITY[]> = output<ENTITY[]>();
    /** Output reset list to initial value action */
    public readonly resetAction: OutputEmitterRef<void> = output<void>();
    /** Output selection change action */
    public readonly selectionChangeAction: OutputEmitterRef<ENTITY[]> = output<ENTITY[]>();

    /** List of entities for local processing */
    readonly #entities: WritableSignal<ENTITY[]> = signal([]);
    readonly #autocompleteControlValue: WritableSignal<string> = signal('');
    /** Initial entities ids */
    readonly #initialEntityIds: WritableSignal<Array<ENTITY[KEY]>> = signal([]);
    /** Current selected entities ids */
    readonly #selectedEntityIds: WritableSignal<Array<ENTITY[KEY]>> = signal([]);
    /** Current selected entities */
    public readonly selectedEntities: Signal<ENTITY[]> = computed(() => {
        return this.#selectedEntityIds()
            .map((id: ENTITY[KEY]) => this.entities().find((el: ENTITY) => id === el[this.keyExp()]))
            .filter((el: Nullable<ENTITY>): el is ENTITY => !!el);
    });
    public readonly isSelectionControlShown: WritableSignal<boolean> = signal(false);
    /** Indicates reset selected button is disabled */
    public readonly isResetButtonDisabled: Signal<boolean> = computed(() => {
        return areArraysEqual(this.#selectedEntityIds(), this.#initialEntityIds()) && !this.additionalControlChanged();
    });
    /** Indicates clear selected button is disabled */
    public readonly isClearButtonDisabled: Signal<boolean> = computed(() => {
        return areArraysEqual(this.#selectedEntityIds(), this.readonlyEntitiesKeys()) && !this.additionalControlChanged();
    });
    /** Entities can be chosen, except selected on init */
    public readonly entitiesToSelect: Signal<ENTITY[]> = computed(() => {
        return this.#entities()
            .filter((entity: ENTITY) => !checkIsEntityInArrayByKey<ENTITY, KEY>(this.selectedEntities(), entity, this.keyExp()))
            .filter((entity: ENTITY) => {
                return (
                    (typeof entity[this.displayExp()] === 'string' || typeof entity[this.displayExp()] === 'number') &&
                    entity[this.displayExp()]?.toString().toLowerCase().includes(this.#autocompleteControlValue().toLowerCase())
                );
            })
            .sort((a: ENTITY, b: ENTITY) => {
                return sortByAlphabet(a, b, this.displayExp());
            });
    });

    /** Additional control for entity */
    public readonly additionalControlTpl: Signal<Nullable<TemplateRef<{ $implicit: ENTITY }>>> = contentChild(
        RtuiDynamicSelectorAdditionalControlDirective,
        {
            read: TemplateRef,
        }
    );

    /** Selected entities ids for compare */
    #selectedEntityIdsForCompare: Array<ENTITY[KEY]> = [];
    /** Indicates is selector init */
    #isFormInit: boolean = false;

    /** Value accessor actions */
    #onTouched: () => void = noop;
    #onChanged: (value: Array<ENTITY[KEY]>) => void = noop;

    public ngOnInit(): void {
        this.form.controls.autocompleteControl.valueChanges
            .pipe(distinctUntilChanged(), takeUntilDestroyed(this.#destroyRef))
            .subscribe((value: Nullable<string>): void => {
                this.#autocompleteControlValue.set(value || '');
            });

        this.form.statusChanges
            .pipe(
                filter(() => typeof this.#onTouched === 'function'),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((): void => {
                this.#onTouched();
            });

        /** Set list of selected entities */
        if (this.chosenEntities()?.length) {
            const list: ENTITY[KEY][] = this.chosenEntities().map((entity: ENTITY) => entity[this.keyExp()]);
            this.#selectedEntityIds.set(list);
            this.#initialEntityIds.set(list);
        }

        /** Set list of selected entities ids for compare */
        effect(
            () => {
                const selectedEntityIds: Array<ENTITY[KEY]> = this.selectedEntities().map((entity: ENTITY) => {
                    return entity[this.keyExp()];
                });

                if (!areArraysEqual(this.#selectedEntityIdsForCompare, selectedEntityIds) && this.#isFormInit) {
                    this.#selectedEntityIdsForCompare = selectedEntityIds;
                    this.#changeControlValue(selectedEntityIds);
                    this.chosenEntities.set(untracked(() => this.selectedEntities()));
                    this.selectionChangeAction.emit(this.chosenEntities());
                } else if (!this.#isFormInit && this.#entities().length) {
                    this.#selectedEntityIdsForCompare = selectedEntityIds;
                    this.#isFormInit = true;
                }
            },
            { injector: this.#injector, allowSignalWrites: true }
        );

        /** Set list of values */
        effect(
            () => {
                if (this.entities() && Array.isArray(this.entities())) {
                    if (!areArraysEqual(this.entities(), this.#entities())) {
                        this.#entities.set(this.entities());
                    }
                }
            },
            { injector: this.#injector, allowSignalWrites: true }
        );
    }

    // ––––––––––––– Value Accessor –––––––––––––––

    public writeValue(value: Array<ENTITY[KEY]>): void {
        if (Array.isArray(value)) {
            if (value.length) {
                this.#selectedEntityIds.set(value);
                this.#initialEntityIds.set(value);
            }
        }
    }

    public registerOnChange(fn: (value: Array<ENTITY[KEY]>) => void): void {
        this.#onChanged = fn;
    }

    public registerOnTouched(fn: () => void): void {
        this.#onTouched = fn;
    }

    public validate(): ValidationErrors | null {
        return this.form.valid ? null : { formInvalid: true };
    }

    public registerOnValidatorChange(fn: () => void): void {
        this.#onTouched = fn;
    }

    // ––––––––––––– Actions –––––––––––––––

    /** Show popup selector */
    public showSelectionControl(trigger: CdkOverlayOrigin): void {
        this.selectedOverlayTrigger = trigger;
        this.isSelectionControlShown.set(true);
    }

    /** Hide popup selector */
    public hideSelectionControl(): void {
        this.isSelectionControlShown.set(false);
    }

    /** Add entity to or delete entity from list of selected */
    public toggleEntity(keyValue: ENTITY[KEY]): void {
        const entity: Nullable<ENTITY> = this.entities().find((entity: ENTITY) => {
            return entity[this.keyExp()] === keyValue;
        });

        if (!entity) {
            return;
        }

        const isParentAlreadySelected: boolean = !!this.selectedEntities().find((selectedEntity: ENTITY) => {
            return selectedEntity[this.keyExp()] === keyValue;
        });

        if (isParentAlreadySelected) {
            this.#selectedEntityIds.update((selectedEntityIds: ENTITY[KEY][]) => {
                return selectedEntityIds.filter((id: ENTITY[KEY]) => {
                    return id !== keyValue;
                });
            });
        } else {
            this.#selectedEntityIds.update((selectedEntityIds: ENTITY[KEY][]) => {
                return [...selectedEntityIds, entity[this.keyExp()]];
            });

            this.form.controls.autocompleteControl.setValue(null);
            this.hideSelectionControl();
        }
    }

    /** Clear list of selected entities ids */
    public clearList(): void {
        this.#selectedEntityIds.update((list: ENTITY[KEY][]) => {
            return list.filter((el: ENTITY[KEY]) => this.readonlyEntitiesKeys().includes(el));
        });
    }

    /** Reset list of selected entities ids to init value */
    public resetList(): void {
        this.#selectedEntityIds.set([...this.#initialEntityIds()]);
        this.resetAction.emit();
    }

    /** Proceed selected entities ids */
    public select(values: ENTITY[KEY][]): void {
        if (this.isSingleSelection()) {
            const entity: Nullable<ENTITY> = this.entities().find((entity: ENTITY) => {
                return entity[this.keyExp()] === values[0];
            });

            if (entity) {
                this.#selectedEntityIds.set([entity[this.keyExp()]]);
                this.hideSelectionControl();
            }
        } else {
            values.forEach((value: ENTITY[KEY]) => this.toggleEntity(value));
        }
    }

    /** Scroll action, needed for lazy load mode */
    public scroll(): void {
        this.scrollAction.emit();
    }

    /** Search action */
    public search(searchTerm: string): void {
        this.searchAction.emit(searchTerm);
    }

    /** Set temporary selection, needed for lazy load mode */
    public setTemporarySelection(values: ENTITY[]): void {
        this.temporarySelectAction.emit(values);
    }

    /** Proceed move items in list */
    public onDrop(event: CdkDragDrop<ENTITY[]>): void {
        const updatedList: ENTITY[] = untracked(() => this.selectedEntities());
        moveItemInArray(updatedList, event.previousIndex, event.currentIndex);
        this.#entities.set(updatedList);
        this.#selectedEntityIds.set(updatedList.map((el: ENTITY) => el[this.keyExp()]));
    }

    // ––––––––––––– Private Methods –––––––––––––––

    /** Emit change control action */
    #changeControlValue(selectedEntityIds: Array<ENTITY[KEY]>): void {
        if (Array.isArray(selectedEntityIds) && typeof this.#onChanged === 'function') {
            this.#onChanged(selectedEntityIds);
        }
    }
}
