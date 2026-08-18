import { ChangeDetectionStrategy, Component, computed, input, InputSignal, output, OutputEmitterRef, Signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ESignInFault, ISignInPair } from '@rt/message-bus-admin/auth/util';
import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { RtButtonDirective, RtFieldComponent, RtInputComponent, RtMessageComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'login';

/** Что показать человеку по роду отказа. Приёмник не говорит, что не сошлось, — экран тоже. */
const FAULT_TEXT: Readonly<Record<ESignInFault, string>> = Object.freeze({
    [ESignInFault.Pair]: 'Имя или пароль не подошли',
    [ESignInFault.Form]: 'Заполните имя и пароль',
    [ESignInFault.Service]: 'Приёмник не ответил. Попробуйте ещё раз',
});

/** Форма входа. Своего состояния входа не знает: пару она отдаёт наверх и ждёт ответа входом. */
@Component({
    selector: 'admin-sign-in-form',
    imports: [
        ReactiveFormsModule,
        BlockDirective,
        ElemDirective,
        RtButtonDirective,
        RtFieldComponent,
        RtInputComponent,
        RtMessageComponent,
    ],
    templateUrl: './admin-sign-in-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: BEM_BLOCK },
})
export class AdminSignInFormComponent {
    protected readonly form: FormGroup<{ name: FormControl<string>; password: FormControl<string> }> = new FormGroup({
        name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        password: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    });

    public readonly pending: InputSignal<boolean> = input<boolean>(false);
    public readonly fault: InputSignal<ESignInFault | null> = input<ESignInFault | null>(null);

    public readonly submitted: OutputEmitterRef<ISignInPair> = output<ISignInPair>();

    public readonly faultText: Signal<string | null> = computed(() => {
        const fault: ESignInFault | null = this.fault();

        return fault === null ? null : FAULT_TEXT[fault];
    });

    /**
     * Незаполненная форма наверх не уходит: отказ по форме приёмник отдаёт кодом, отличным от
     * отказа по паре, и гонять его по сети ради подписи, которую видно на месте, незачем.
     */
    protected submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();

            return;
        }

        this.submitted.emit(this.form.getRawValue());
    }
}
