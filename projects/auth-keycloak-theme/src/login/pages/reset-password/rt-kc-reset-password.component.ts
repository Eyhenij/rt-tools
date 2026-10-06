import { ChangeDetectionStrategy, Component, inject, Signal, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { IRtField, RtButtonDirective, RtFieldComponent, RtInputComponent } from '@rt-tools/ui-kit-v2';

import { KC_CONTEXT, TKcPageContext } from '../../kc-context';
import { holdInvalidSubmit, loginPlaceholder } from '../../kc-form';
import { KC_MESSAGES, TKcMessages } from '../../kc-i18n';
import { RtKcMessageComponent } from '../../message/rt-kc-message.component';

const BEM_BLOCK: string = 'rt-kc-page';

type TResetContext = TKcPageContext<'login-reset-password.ftl'>;

/** `login-reset-password.ftl` — a person asks for a letter with a link to a new password. */
@Component({
    selector: 'rt-kc-reset-password',
    imports: [
        ReactiveFormsModule,
        BlockDirective,
        ElemDirective,
        RtButtonDirective,
        RtFieldComponent,
        RtInputComponent,
        RtKcMessageComponent,
    ],
    templateUrl: './rt-kc-reset-password.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: BEM_BLOCK },
})
export class RtKcResetPasswordComponent {
    readonly #i18n: TKcMessages = inject(KC_MESSAGES);

    protected readonly context: TResetContext = inject(KC_CONTEXT) as TResetContext;
    protected readonly username: FormControl<string> = new FormControl<string>(this.context.auth.attemptedUsername ?? '', {
        nonNullable: true,
        validators: [Validators.required],
    });
    protected readonly value: Signal<string> = toSignal(this.username.valueChanges, { initialValue: this.username.value });
    protected readonly sending: WritableSignal<boolean> = signal<boolean>(false);

    protected readonly title: string = this.#i18n.msgStr('emailForgotTitle');
    protected readonly instruction: string = this.#i18n.msgStr('emailInstruction');
    protected readonly usernameLabel: string = this.#i18n.msgStr(this.context.realm.loginWithEmailAllowed ? 'usernameOrEmail' : 'username');
    protected readonly usernamePlaceholder: string = loginPlaceholder(this.context.realm.loginWithEmailAllowed);
    protected readonly submitLabel: string = this.#i18n.msgStr('doSubmit');
    protected readonly backLabel: string = this.#i18n.msgStr('backToLogin');
    protected readonly usernameErrors: IRtField.ErrorMessages = { required: this.#i18n.msgStr('missingUsernameMessage') };

    protected send(event: Event): void {
        this.sending.set(holdInvalidSubmit(event, this.username));
    }
}
