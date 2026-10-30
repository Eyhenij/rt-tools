import { ChangeDetectionStrategy, Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BlockDirective, ConcatClassesPipe, ElemDirective, ModDirective } from '@rt-tools/core';
import { IRtField, RtButtonDirective, RtFieldComponent, RtIconComponent, RtInputComponent } from '@rt-tools/ui-kit-v2';
import { map } from 'rxjs';

import { KC_CONTEXT, TKcContext, TKcPageContext } from '../../kc-context';
import { holdInvalidSubmit, loginPlaceholder, MISMATCH_ERROR, refusedValue, sameValueAs, SERVER_ERROR } from '../../kc-form';
import { backLinkText, KC_MESSAGES, plainMessage, TKcMessages } from '../../kc-i18n';
import { EKcPolicyRule, IKcPolicyRule, passwordRuleMet, registrationRulesOf, RULE_MESSAGE } from '../../kc-password-rules';
import { IKcProviderButton, providerButtonsOf } from '../../kc-providers';
import { RtKcMessageComponent } from '../../message/rt-kc-message.component';

const BEM_BLOCK: string = 'rt-kc-page';

type TRegisterContext = TKcPageContext<'register.ftl'>;

/** A requirement of the realm policy as the list under the confirmation shows it. */
interface IRuleView {
    readonly key: EKcPolicyRule;
    readonly text: string;
    readonly met: boolean;
}

interface IRegisterValue {
    readonly email: string;
    readonly password: string;
    readonly passwordConfirm: string;
}

/**
 * `register.ftl` — a new account by address and password or through a provider of the realm. The
 * page asks for nothing beyond the address: the realm uses the address as the login.
 */
@Component({
    selector: 'rt-kc-register',
    imports: [
        ReactiveFormsModule,
        BlockDirective,
        ConcatClassesPipe,
        ElemDirective,
        ModDirective,
        RtButtonDirective,
        RtFieldComponent,
        RtIconComponent,
        RtInputComponent,
        RtKcMessageComponent,
    ],
    templateUrl: './rt-kc-register.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: BEM_BLOCK },
})
export class RtKcRegisterComponent {
    readonly #i18n: TKcMessages = inject(KC_MESSAGES);
    readonly #page: TKcContext = inject(KC_CONTEXT);
    readonly #rules: readonly IKcPolicyRule[] = registrationRulesOf(this.#page);

    protected readonly context: TRegisterContext = this.#page as TRegisterContext;
    protected readonly form: FormGroup<{
        email: FormControl<string>;
        password: FormControl<string>;
        passwordConfirm: FormControl<string>;
    }> = new FormGroup({
        email: new FormControl<string>(this.#typed('email'), {
            nonNullable: true,
            validators: [refusedValue(this.#serverError('email'), this.#typed('email')), Validators.required, Validators.email],
        }),
        password: new FormControl<string>('', {
            nonNullable: true,
            validators: [refusedValue(this.#serverError('password'), ''), Validators.required],
        }),
        passwordConfirm: new FormControl<string>('', {
            nonNullable: true,
            validators: [refusedValue(this.#serverError('password-confirm'), ''), Validators.required, sameValueAs('password')],
        }),
    });

    /** The hidden named fields read the form through this: a native submit posts them, not the kit fields. */
    protected readonly value: Signal<IRegisterValue> = toSignal(
        this.form.valueChanges.pipe(map((): IRegisterValue => this.form.getRawValue())),
        { initialValue: this.form.getRawValue() }
    );
    protected readonly sending: WritableSignal<boolean> = signal<boolean>(false);
    /** The requirements of the realm policy, each marked as met by the password typed so far. */
    protected readonly rules: Signal<readonly IRuleView[]> = computed((): readonly IRuleView[] => {
        const { email, password }: IRegisterValue = this.value();

        return this.#rules.map((rule: IKcPolicyRule): IRuleView => ({
            key: rule.rule,
            text:
                rule.count === null
                    ? this.#i18n.msgStr(RULE_MESSAGE[rule.rule])
                    : this.#i18n.msgStr(RULE_MESSAGE[rule.rule], String(rule.count)),
            met: passwordRuleMet(rule, password, email === '' ? null : email),
        }));
    });

    protected readonly title: string = this.#i18n.msgStr('registerTitle');
    protected readonly emailLabel: string = this.#i18n.msgStr('email');
    protected readonly emailPlaceholder: string = loginPlaceholder(true);
    protected readonly passwordLabel: string = this.#i18n.msgStr('password');
    protected readonly passwordPlaceholder: string = this.#i18n.msgStr('rtPasswordPlaceholder');
    protected readonly passwordConfirmLabel: string = this.#i18n.msgStr('passwordConfirm');
    protected readonly passwordConfirmPlaceholder: string = this.#i18n.msgStr('rtPasswordConfirmPlaceholder');
    protected readonly ruleListLabel: string = this.#i18n.msgStr('rtRuleList');
    protected readonly submitLabel: string = this.#i18n.msgStr('doRegister');
    protected readonly providersLabel: string = this.#i18n.msgStr('rtRegisterProviders');
    protected readonly backLabel: string = backLinkText(this.#i18n.msgStr('backToLogin'));
    protected readonly emailErrors: IRtField.ErrorMessages = {
        required: this.#i18n.msgStr('missingEmailMessage'),
        email: this.#i18n.msgStr('invalidEmailMessage'),
        [SERVER_ERROR]: this.#serverError('email'),
    };
    protected readonly passwordErrors: IRtField.ErrorMessages = {
        required: this.#i18n.msgStr('missingPasswordMessage'),
        [SERVER_ERROR]: this.#serverError('password'),
    };
    protected readonly passwordConfirmErrors: IRtField.ErrorMessages = {
        required: this.#i18n.msgStr('missingPasswordMessage'),
        [MISMATCH_ERROR]: this.#i18n.msgStr('invalidPasswordConfirmMessage'),
        [SERVER_ERROR]: this.#serverError('password-confirm'),
    };

    protected readonly providers: readonly IKcProviderButton[] = providerButtonsOf(this.#page);
    /**
     * The site key of the reCAPTCHA widget, or `null` when the realm asks for no visible widget. The
     * script Keycloak lists for the page renders the widget and puts its answer into the form.
     */
    protected readonly recaptchaSiteKey: string | null =
        this.context.recaptchaRequired && this.context.recaptchaVisible ? (this.context.recaptchaSiteKey ?? null) : null;
    protected readonly recaptchaAction: string | null = this.context.recaptchaAction ?? null;

    constructor() {
        // The confirmation is compared with the password, so a change of the password checks it again.
        this.form.controls.password.valueChanges.pipe(takeUntilDestroyed()).subscribe((): void => {
            this.form.controls.passwordConfirm.updateValueAndValidity();
        });
        // A refused field shows its refusal on arrival, before the person touches it.
        for (const control of Object.values(this.form.controls)) {
            if (control.hasError(SERVER_ERROR)) {
                control.markAsTouched();
            }
        }
    }

    protected send(event: Event): void {
        this.sending.set(holdInvalidSubmit(event, this.form));
    }

    /** What the person typed before Keycloak returned the page: it keeps the address, never a password. */
    #typed(attribute: string): string {
        return this.context.profile.attributesByName[attribute]?.value ?? '';
    }

    /** The error Keycloak put on a field, as plain text; empty when there is none. */
    #serverError(field: string): string {
        return this.context.messagesPerField.existsError(field) ? plainMessage(this.context.messagesPerField.get(field)) : '';
    }
}
