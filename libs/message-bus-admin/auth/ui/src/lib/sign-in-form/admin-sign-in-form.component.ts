import { ChangeDetectionStrategy, Component, computed, inject, input, InputSignal, output, OutputEmitterRef, Signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ESignInFault, ISignInPair } from '@rt/message-bus-admin/auth/util';
import { AdminTextService, TAdminLabelKey } from '@rt/message-bus-admin/common/core/util';
import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { RtButtonDirective, RtFieldComponent, RtInputComponent, RtMessageComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'login';

/**
 * Каким ключом словаря назван отказ каждого рода. Приёмник не говорит, что именно не сошлось, —
 * экран тоже; текст по ключу приходит на выбранном языке.
 */
const FAULT_TEXT: Readonly<Record<ESignInFault, TAdminLabelKey>> = Object.freeze({
    [ESignInFault.Pair]: 'signInFaultPair',
    [ESignInFault.Form]: 'signInFaultForm',
    [ESignInFault.Service]: 'signInFaultService',
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
    readonly #text: AdminTextService = inject(AdminTextService);

    protected readonly form: FormGroup<{ name: FormControl<string>; password: FormControl<string> }> = new FormGroup({
        name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        password: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    });

    // Подписи полей и кнопки — производные: язык переключают над карточкой, на этом же экране.
    protected readonly nameLabel: Signal<string> = computed((): string => this.#text.text('signInName'));

    protected readonly nameHint: Signal<string> = computed((): string => this.#text.text('signInNameHint'));

    protected readonly passwordLabel: Signal<string> = computed((): string => this.#text.text('signInPassword'));

    protected readonly passwordHint: Signal<string> = computed((): string => this.#text.text('signInPasswordHint'));

    protected readonly submitLabel: Signal<string> = computed((): string => this.#text.text('signInSubmit'));

    public readonly pending: InputSignal<boolean> = input<boolean>(false);
    public readonly fault: InputSignal<ESignInFault | null> = input<ESignInFault | null>(null);

    public readonly submitted: OutputEmitterRef<ISignInPair> = output<ISignInPair>();

    public readonly faultText: Signal<string | null> = computed(() => {
        const fault: ESignInFault | null = this.fault();

        return fault === null ? null : this.#text.text(FAULT_TEXT[fault]);
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
