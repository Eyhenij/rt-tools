import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    InputSignalWithTransform,
    ModelSignal,
    OnInit,
    WritableSignal,
    forwardRef,
    inject,
    input,
    model,
    signal,
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
import { MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput, MatLabel } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';

import { noop } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';

import { RtuiDynamicSelectorListActionsComponent, RtuiDynamicSelectorPlaceholderComponent } from '../.';
import { BlockDirective, ElemDirective } from '../../../../bem';
import { BreakStringPipe, Nullable, RtIconOutlinedDirective, areArraysEqual, transformStringInput } from '../../../../util';
import { RtuiDynamicSelectorsDirective } from '../dynamic-selectors-directive';

interface FormModel {
    control: FormControl<string[]>;
    controlForUi: FormControl<Nullable<string>>;
}

@Component({
    standalone: true,
    selector: 'rtui-dynamic-input',
    templateUrl: './rtui-dynamic-input.component.html',
    styleUrls: ['./rtui-dynamic-input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ReactiveFormsModule,
        MatIconButton,
        MatTooltip,
        MatIcon,
        MatFormField,
        MatLabel,
        MatInput,

        // pipes
        BreakStringPipe,

        // directives
        BlockDirective,
        ElemDirective,
        RtIconOutlinedDirective,

        // components
        RtuiDynamicSelectorPlaceholderComponent,
        RtuiDynamicSelectorListActionsComponent,
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
    /** Input label */
    public inputLabel: InputSignalWithTransform<string, string> = input<string, string>('', {
        transform: transformStringInput,
    });
    /** Input placeholder */
    public inputPlaceholder: InputSignalWithTransform<string, string> = input<string, string>('', {
        transform: transformStringInput,
    });

    /** Indicates is input control shown */
    public readonly isInputControlShown: WritableSignal<boolean> = signal(false);
    /** Indicates reset changes button is disabled */
    public readonly isResetButtonDisabled: WritableSignal<boolean> = signal(false);

    /** Initial entities */
    readonly #initialEntities: WritableSignal<string[]> = signal([]);

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

    /** Reset list of selected entities ids to init value */
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

    /** Add new item */
    public onAddEntity(): void {
        if (this.form.controls.controlForUi.value) {
            this.toggleEntity(this.form.controls.controlForUi.value);
            this.form.controls.controlForUi.setValue(null);
            this.hideSelectionControl();
        }
    }

    /** Set reset list button state */
    #setResetListButtonState(value: string[]): void {
        this.isResetButtonDisabled.set(areArraysEqual(this.#initialEntities().sort(), value));
    }
}
