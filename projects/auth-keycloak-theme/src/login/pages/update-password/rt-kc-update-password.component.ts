import { ChangeDetectionStrategy, Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';
import { IRtField, RtButtonDirective, RtCheckboxComponent, RtFieldComponent, RtIconComponent, RtInputComponent } from '@rt-tools/ui-kit-v2';
import { map } from 'rxjs';

import { KC_CONTEXT, TKcContext, TKcPageContext } from '../../kc-context';
import { holdInvalidSubmit } from '../../kc-form';
import { KC_MESSAGES, TKcMessages } from '../../kc-i18n';
import { EKcPolicyRule, IKcPolicyRule, passwordRuleMet, passwordRulesOf, RULE_MESSAGE } from '../../kc-password-rules';
import { RtKcMessageComponent } from '../../message/rt-kc-message.component';

const BEM_BLOCK: string = 'rt-kc-page';

type TUpdateContext = TKcPageContext<'login-update-password.ftl'>;

/** The button that leaves the action unfinished; Keycloak tells it by this name. */
const CANCEL_NAME: string = 'cancel-aia';

/** A requirement of the realm policy as the list under the new password field shows it. */
interface IRuleView {
    readonly key: EKcPolicyRule;
    readonly text: string;
    readonly met: boolean;
}

interface IUpdateValue {
    readonly passwordNew: string;
    readonly passwordConfirm: string;
    readonly logoutSessions: boolean;
}

/**
 * `login-update-password.ftl` — a new password. A person lands here after a reset letter, after an
 * invitation letter and when the admin asks for a new password from the account.
 */
@Component({
    selector: 'rt-kc-update-password',
    imports: [
        ReactiveFormsModule,
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtButtonDirective,
        RtCheckboxComponent,
        RtFieldComponent,
        RtIconComponent,
        RtInputComponent,
        RtKcMessageComponent,
    ],
    templateUrl: './rt-kc-update-password.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: BEM_BLOCK },
})
export class RtKcUpdatePasswordComponent {
    readonly #i18n: TKcMessages = inject(KC_MESSAGES);
    readonly #page: TKcContext = inject(KC_CONTEXT);
    readonly #rules: readonly IKcPolicyRule[] = passwordRulesOf(this.#page);
    readonly #login: string | null = this.#page.auth?.attemptedUsername ?? null;

    protected readonly context: TUpdateContext = this.#page as TUpdateContext;
    protected readonly cancelName: string = CANCEL_NAME;
    protected readonly form: FormGroup<{
        passwordNew: FormControl<string>;
        passwordConfirm: FormControl<string>;
        logoutSessions: FormControl<boolean>;
    }> = new FormGroup({
        passwordNew: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        passwordConfirm: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        logoutSessions: new FormControl<boolean>(true, { nonNullable: true }),
    });
    protected readonly value: Signal<IUpdateValue> = toSignal(
        this.form.valueChanges.pipe(map((): IUpdateValue => this.form.getRawValue())),
        {
            initialValue: this.form.getRawValue(),
        }
    );
    protected readonly sending: WritableSignal<boolean> = signal<boolean>(false);
    /** The requirements of the realm policy, each marked as met by the password typed so far. */
    protected readonly rules: Signal<readonly IRuleView[]> = computed((): readonly IRuleView[] => {
        const password: string = this.value().passwordNew;

        return this.#rules.map((rule: IKcPolicyRule): IRuleView => ({
            key: rule.rule,
            text:
                rule.count === null
                    ? this.#i18n.msgStr(RULE_MESSAGE[rule.rule])
                    : this.#i18n.msgStr(RULE_MESSAGE[rule.rule], String(rule.count)),
            met: passwordRuleMet(rule, password, this.#login),
        }));
    });

    protected readonly title: string = this.#i18n.msgStr('updatePasswordTitle');
    protected readonly passwordNewLabel: string = this.#i18n.msgStr('passwordNew');
    protected readonly ruleListLabel: string = this.#i18n.msgStr('rtRuleList');
    protected readonly passwordConfirmLabel: string = this.#i18n.msgStr('passwordConfirm');
    protected readonly logoutSessionsLabel: string = this.#i18n.msgStr('logoutOtherSessions');
    protected readonly submitLabel: string = this.#i18n.msgStr('doSubmit');
    protected readonly cancelLabel: string = this.#i18n.msgStr('doCancel');
    protected readonly passwordErrors: IRtField.ErrorMessages = { required: this.#i18n.msgStr('missingPasswordMessage') };

    protected send(event: SubmitEvent): void {
        // Leaving the action posts nothing typed, so the empty fields do not hold it.
        const submitter: HTMLElement | null = event.submitter;
        if (submitter instanceof HTMLButtonElement && submitter.name === CANCEL_NAME) {
            return;
        }
        this.sending.set(holdInvalidSubmit(event, this.form));
    }
}
