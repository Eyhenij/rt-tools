import {
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    effect,
    forwardRef,
    inject,
    Injector,
    input,
    InputSignal,
    InputSignalWithTransform,
    OnInit,
    Signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatTooltip, TooltipPosition } from '@angular/material/tooltip';
import { noop } from 'rxjs';
import { filter } from 'rxjs/operators';

import { BlockDirective, ElemDirective } from '../../bem';
import { BreakpointService, Nullable } from '../../util';
import { TOGGLE_SIZE_TYPE_ENUM, ToggleSizeType } from './toggle-size.type.enum';

@Component({
    selector: 'rtui-toggle',
    templateUrl: './rtui-toggle.component.html',
    styleUrls: ['./rtui-toggle.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RtuiToggleComponent),
            multi: true,
        },
        BreakpointService,
    ],
    imports: [
        ReactiveFormsModule,
        MatTooltip,

        // directives
        BlockDirective,
        ElemDirective,
    ],
})
export class RtuiToggleComponent implements OnInit, ControlValueAccessor {
    readonly #injector: Injector = inject(Injector);
    readonly #cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #breakpointService: BreakpointService = inject(BreakpointService);

    public formControl: FormControl<boolean> = new FormControl<boolean>(false, { nonNullable: true });

    public label: InputSignal<Nullable<string>> = input();
    public tooltip: InputSignal<string> = input('');
    public size: InputSignal<ToggleSizeType> = input<ToggleSizeType>(TOGGLE_SIZE_TYPE_ENUM.MD);
    public tooltipPosition: InputSignal<TooltipPosition> = input<TooltipPosition>('above');
    public disabled: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public tooltipDisabled: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });

    public readonly isMobile: Signal<Nullable<boolean>> = this.#breakpointService.isMobile;

    #onTouched: () => void = noop;
    #onChanged: (value: boolean) => void = noop;

    public ngOnInit(): void {
        this.formControl.valueChanges
            .pipe(
                filter(() => typeof this.#onChanged === 'function'),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((value: boolean) => {
                this.#onChanged(value);
            });

        this.formControl.statusChanges
            .pipe(
                filter(() => typeof this.#onTouched === 'function'),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe(() => this.#onTouched());

        effect(
            () => {
                if (this.formControl.disabled !== this.disabled()) {
                    this.setDisabledState();
                }
            },
            { injector: this.#injector }
        );
    }

    // ––––––––––––– Value Accessor –––––––––––––––
    public writeValue(value: boolean): void {
        this.formControl.patchValue(value, { emitEvent: false });
        this.#cdr.markForCheck();
    }

    public registerOnChange(fn: () => void): void {
        this.#onChanged = fn;
    }

    public registerOnTouched(fn: () => void): void {
        this.#onTouched = fn;
    }

    public setDisabledState(): void {
        if (this.disabled()) {
            this.formControl.disable();
        } else {
            this.formControl.enable();
        }

        this.#cdr.markForCheck();
    }
}
