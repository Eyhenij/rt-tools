import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    contentChild,
    DestroyRef,
    Directive,
    forwardRef,
    inject,
    input,
    InputSignalWithTransform,
    model,
    ModelSignal,
    OnInit,
    Signal,
    signal,
    TemplateRef,
    untracked,
    WritableSignal,
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
import { MatFormField } from '@angular/material/form-field';
import { MatInput, MatLabel } from '@angular/material/input';
import { noop } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';

import { BlockDirective, ElemDirective } from '../../../../bem';
import { areArraysEqual, Nullable, transformArrayInput, transformStringInput } from '../../../../util';
import {
    RtuiDynamicSelectorItemAdditionalControlDirective,
    RtuiDynamicSelectorListActionsComponent,
    RtuiDynamicSelectorPlaceholderComponent,
    RtuiDynamicSelectorSelectedListComponent,
} from '../.';
import { RtuiDynamicSelectorsDirective } from '../dynamic-selectors-directive';
import { BooleanInput } from '@angular/cdk/coercion';

interface FormModel {
    control: FormControl<string[]>;
    controlForUi: FormControl<Nullable<string>>;
}

/** Directive for row actions located outside a row menu button */
@Directive({
    selector: '[rtuiDynamicInputAdditionalControlDirective]',
})
export class RtuiDynamicInputAdditionalControlDirective {}

@Component({
    selector: 'rtui-dynamic-input',
    templateUrl: './rtui-dynamic-input.component.html',
    styleUrls: ['./rtui-dynamic-input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgTemplateOutlet,
        ReactiveFormsModule,

        // material
        MatFormField,
        MatLabel,
        MatInput,

        // directives
        BlockDirective,
        ElemDirective,
        RtuiDynamicSelectorItemAdditionalControlDirective,

        // components
        RtuiDynamicSelectorPlaceholderComponent,
        RtuiDynamicSelectorListActionsComponent,
        RtuiDynamicSelectorSelectedListComponent,
    ],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RtuiDynamicInputComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: RtuiDynamicInputComponent,
            multi: true,
        },
    ],
})
export class RtuiDynamicInputComponent extends RtuiDynamicSelectorsDirective implements ControlValueAccessor, Validator, OnInit {
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #fb: FormBuilder = inject(FormBuilder);

    public form: FormGroup<FormModel> = this.#fb.group<FormModel>({
        control: this.#fb.nonNullable.control<string[]>([]),
        controlForUi: this.#fb.control<Nullable<string>>(null), // used only for UI
    });

    /** Indicates is placeholder shown */
    public isPlaceholderShown: ModelSignal<Nullable<boolean>> = model<Nullable<boolean>>(true);
    /** Indicates is inputs-editable */
    public isInputsEditable: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    /** Input label */
    public inputLabel: InputSignalWithTransform<string, unknown> = input<string, unknown>('', {
        transform: transformStringInput,
    });
    /** Input placeholder */
    public inputPlaceholder: InputSignalWithTransform<string, unknown> = input<string, unknown>('', {
        transform: transformStringInput,
    });
    /** Entity keys that can't be changed */
    public readonlyEntitiesKeys: InputSignalWithTransform<string[], string[]> = input<string[], string[]>([], {
        transform: (value: string[]) => transformArrayInput(value),
    });

    /** Array of selected entities */
    public readonly selectedEntities: WritableSignal<Array<{ id: string }>> = signal([]);
    /** Indicates is input control shown */
    public readonly isInputControlShown: WritableSignal<boolean> = signal(false);
    /** Indicates the reset changes button is disabled */
    public readonly isResetButtonDisabled: WritableSignal<boolean> = signal(false);

    /** Initial entities */
    readonly #initialEntities: WritableSignal<string[]> = signal([]);

    /** Additional control for entity */
    public readonly additionalControlTpl: Signal<Nullable<TemplateRef<{ $implicit: string }>>> = contentChild(
        RtuiDynamicInputAdditionalControlDirective,
        {
            read: TemplateRef,
        }
    );

    #onTouched: () => void = noop;
    #onChanged: (value: string[]) => void = noop;

    public ngOnInit(): void {
        this.form.controls.control.valueChanges
            .pipe(
                filter((value: string[]) => Array.isArray(value) && typeof this.#onChanged === 'function'),
                distinctUntilChanged(),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((value: string[]): void => {
                this.#onChanged(value);
                this.#setResetListButtonState(value);
                this.selectedEntities.set(value.map((el: string) => ({ id: el })));
            });

        this.form.controls.control.statusChanges
            .pipe(
                filter(() => typeof this.#onTouched === 'function'),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((): void => {
                this.#onTouched();
            });
    }

    // ––––––––––––– Value Accessor –––––––––––––––

    public writeValue(value: string[]): void {
        if (Array.isArray(value)) {
            if (value.length) {
                this.hideSelectionControl();
                this.form.controls.control.setValue(value, { emitEvent: false });
                this.#initialEntities.set(value);
                this.selectedEntities.set(value.map((el: string) => ({ id: el })));
                this.#setResetListButtonState(value);
            } else {
                this.showSelectionControl();
            }
        }
    }

    public registerOnChange(fn: (value: string[]) => void): void {
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

    /** Hide placeholder */
    public hidePlaceholder(): void {
        this.showSelectionControl();
        this.isPlaceholderShown.set(false);
    }

    /** Show control */
    public showSelectionControl(): void {
        this.isInputControlShown.set(true);
    }

    /** Hide control */
    public hideSelectionControl(): void {
        this.isInputControlShown.set(false);
    }

    /** Clear list of selected entities ids */
    public clearList(): void {
        this.form.controls.control.setValue([]);
    }

    /** Reset a list of selected entities ids to init value */
    public resetList(): void {
        this.form.controls.control.setValue(this.#initialEntities());
        this.hideSelectionControl();
    }

    /** Add or delete entity */
    public toggleEntity(keyValue: string): void {
        if (keyValue) {
            const selectedEntityIds: string[] = this.form.value.control || [];

            if (selectedEntityIds.includes(keyValue)) {
                this.form.controls.control.setValue(selectedEntityIds.filter((id: string) => id !== keyValue));
            } else {
                this.form.controls.control.setValue([...selectedEntityIds, keyValue]);
            }
        }
    }

    /** Change entity value */
    public changeEntity(data: { prev: string; new: string }): void {
        this.form.controls.control.setValue(this.form.controls.control.value.map((el: string) => (el === data.prev ? data.new : el)));
    }

    /** Add new item */
    public onAddEntity(): void {
        if (this.form.controls.controlForUi.value && this.form.controls.control.value.includes(this.form.controls.controlForUi.value)) {
            this.form.controls.controlForUi.setValue(null);
            this.hideSelectionControl();
        } else if (this.form.controls.controlForUi.value) {
            this.toggleEntity(this.form.controls.controlForUi.value);
            this.form.controls.controlForUi.setValue(null);
            this.hideSelectionControl();
        }
    }

    /** Process move items in a list */
    public onDrop(event: CdkDragDrop<Array<{ id: string }>>): void {
        const updatedList: Array<{ id: string }> = untracked(() => this.selectedEntities());
        moveItemInArray(updatedList, event.previousIndex, event.currentIndex);
        this.form.controls.control.patchValue(updatedList.map((el: { id: string }) => el.id));
    }

    /** Set the reset list button state */
    #setResetListButtonState(value: string[]): void {
        this.isResetButtonDisabled.set(areArraysEqual(this.#initialEntities(), value));
    }
}
