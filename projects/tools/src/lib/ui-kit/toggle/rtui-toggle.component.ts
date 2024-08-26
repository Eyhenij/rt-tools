import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    Injector,
    InputSignal,
    InputSignalWithTransform,
    OnInit,
    Signal,
    booleanAttribute,
    effect,
    forwardRef,
    inject,
    input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatTooltip, TooltipPosition } from '@angular/material/tooltip';

import { filter } from 'rxjs/operators';

import { BlockDirective, ElemDirective } from '../../bem';
import { BreakpointService, Nullable } from '../../util';
import { ToggleSizeType } from './toggle-size.type.enum';

@Component({
    standalone: true,
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
    public size: InputSignal<Nullable<ToggleSizeType>> = input<Nullable<ToggleSizeType>>();
    public tooltipPosition: InputSignal<TooltipPosition> = input<TooltipPosition>('above');
    public disabled: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public tooltipDisabled: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });

    public readonly isMobile: Signal<Nullable<boolean>> = this.#breakpointService.isMobile;

    // eslint-disable-next-line
    #onTouched: () => void = () => {};
    #onChanged: (value: boolean) => void = () => {};

    public ngOnInit(): void {
        this.formControl.valueChanges
            .pipe(
                filter(() => typeof this.#onChanged === 'function'),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((value: boolean) => {
                this.#onChanged(value);
            });

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
