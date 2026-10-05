import { ChangeDetectionStrategy, Component, inject, Signal, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { IRtField, RtButtonDirective, RtCheckboxComponent, RtFieldComponent, RtInputComponent } from '@rt-tools/ui-kit-v2';
import { map } from 'rxjs';

import { KC_CONTEXT, TKcPageContext } from '../../kc-context';
import { holdInvalidSubmit } from '../../kc-form';
import { KC_MESSAGES, TKcMessages } from '../../kc-i18n';
import { RtKcMessageComponent } from '../../message/rt-kc-message.component';

const BEM_BLOCK: string = 'rt-kc-page';

type TLoginContext = TKcPageContext<'login.ftl'>;
type TProvider = NonNullable<NonNullable<TLoginContext['social']>['providers']>[number];

/** The providers with an icon of their own; the rest get a button with their name only. */
const PROVIDER_ICONS: Readonly<Record<string, string>> = Object.freeze({ google: 'google', apple: 'apple' });

/** A provider button: where it leads, what it says and the icon when the theme has one. */
interface IKcProviderButton {
    readonly alias: string;
    readonly label: string;
    readonly href: string;
    readonly icon: string | null;
}

interface ILoginValue {
    readonly username: string;
    readonly password: string;
    readonly rememberMe: boolean;
}

/** `login.ftl` — the entry by address and password or through a provider of the realm. */
@Component({
    selector: 'rt-kc-login',
    imports: [
        ReactiveFormsModule,
        BlockDirective,
        ElemDirective,
        RtButtonDirective,
        RtCheckboxComponent,
        RtFieldComponent,
        RtInputComponent,
        RtKcMessageComponent,
    ],
    templateUrl: './rt-kc-login.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: BEM_BLOCK },
})
export class RtKcLoginComponent {
    readonly #i18n: TKcMessages = inject(KC_MESSAGES);

    protected readonly context: TLoginContext = inject(KC_CONTEXT) as TLoginContext;
    protected readonly form: FormGroup<{
        username: FormControl<string>;
        password: FormControl<string>;
        rememberMe: FormControl<boolean>;
    }> = new FormGroup({
        username: new FormControl<string>(this.context.login.username ?? '', { nonNullable: true, validators: [Validators.required] }),
        password: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        rememberMe: new FormControl<boolean>(this.context.login.rememberMe === 'on', { nonNullable: true }),
    });

    /** The hidden named fields read the form through this: a native submit posts them, not the kit fields. */
    protected readonly value: Signal<ILoginValue> = toSignal(this.form.valueChanges.pipe(map((): ILoginValue => this.form.getRawValue())), {
        initialValue: this.form.getRawValue(),
    });
    protected readonly sending: WritableSignal<boolean> = signal<boolean>(false);

    protected readonly title: string = this.#i18n.msgStr('loginAccountTitle');
    protected readonly usernameLabel: string = this.#i18n.msgStr(this.#usernameKey());
    protected readonly passwordLabel: string = this.#i18n.msgStr('password');
    protected readonly rememberMeLabel: string = this.#i18n.msgStr('rememberMe');
    protected readonly submitLabel: string = this.#i18n.msgStr('doLogIn');
    protected readonly forgotLabel: string = this.#i18n.msgStr('doForgotPassword');
    protected readonly registerLabel: string = this.#i18n.msgStr('doRegister');
    protected readonly providersLabel: string = this.#i18n.msgStr('identity-provider-login-label');
    protected readonly usernameErrors: IRtField.ErrorMessages = { required: this.#i18n.msgStr('missingUsernameMessage') };
    protected readonly passwordErrors: IRtField.ErrorMessages = { required: this.#i18n.msgStr('missingPasswordMessage') };

    protected readonly providers: readonly IKcProviderButton[] = (this.context.social?.providers ?? []).map(
        (provider: TProvider): IKcProviderButton => ({
            alias: provider.alias,
            label: provider.displayName,
            href: provider.loginUrl,
            icon: PROVIDER_ICONS[provider.providerId] ?? null,
        })
    );

    constructor() {
        if (this.context.usernameHidden) {
            this.form.controls.username.clearValidators();
            this.form.controls.username.updateValueAndValidity();
        }
    }

    protected send(event: Event): void {
        this.sending.set(holdInvalidSubmit(event, this.form));
    }

    #usernameKey(): 'username' | 'email' | 'usernameOrEmail' {
        if (!this.context.realm.loginWithEmailAllowed) {
            return 'username';
        }

        return this.context.realm.registrationEmailAsUsername ? 'email' : 'usernameOrEmail';
    }
}
