import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, ChangeDetectionStrategy, Component, forwardRef, input, InputSignalWithTransform } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { noop } from 'rxjs';

import { BlockDirective, ElemDirective } from '../../bem';
import { transformStringInput } from '../../util';

@Component({
    selector: 'rtui-checkbox',
    templateUrl: 'rtui-checkbox.component.html',
    styleUrls: ['rtui-checkbox.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RtuiCheckboxComponent),
            multi: true,
        },
    ],
    imports: [
        FormsModule,
        // rt-tools
        BlockDirective,
        ElemDirective,
    ],
})
export class RtuiCheckboxComponent implements ControlValueAccessor {
    private onChangeCallback: (_: boolean) => void = noop;
    private onTouchedCallback: () => void = noop;
    private value: boolean = false;

    public disabled: boolean = false;

    public isIndeterminate: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public label: InputSignalWithTransform<string, string> = input<string, string>('', {
        transform: transformStringInput,
    });
    public description: InputSignalWithTransform<string, string> = input<string, string>('', {
        transform: transformStringInput,
    });

    public get Value(): boolean {
        return this.value;
    }

    public set Value(v: boolean) {
        if (this.disabled) {
            return;
        }

        if (v !== this.value) {
            this.value = v;
            this.onTouchedCallback();
            this.onChangeCallback(v);
        }
    }

    public writeValue(value: boolean): void {
        this.value = !!value;
    }

    public registerOnChange(fn: (value: boolean) => void): void {
        this.onChangeCallback = fn;
    }

    public registerOnTouched(fn: () => void): void {
        this.onTouchedCallback = fn;
    }

    public setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    public onChangeValue(event: Event): void {
        if (!this.disabled) {
            this.Value = !this.Value;
        }
        event.stopPropagation();
        event.preventDefault();
    }
}
