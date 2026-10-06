import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { KC_CONTEXT, TKcPageContext } from '../../kc-context';
import { KC_MESSAGES, TKcMessages } from '../../kc-i18n';
import { RtKcMessageComponent } from '../../message/rt-kc-message.component';

const BEM_BLOCK: string = 'rt-kc-page';

type TVerifyContext = TKcPageContext<'login-verify-email.ftl'>;

/** `login-verify-email.ftl` — the realm sent a letter and waits for the address to be confirmed. */
@Component({
    selector: 'rt-kc-verify-email',
    imports: [BlockDirective, ElemDirective, RtKcMessageComponent],
    templateUrl: './rt-kc-verify-email.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: BEM_BLOCK },
})
export class RtKcVerifyEmailComponent {
    readonly #i18n: TKcMessages = inject(KC_MESSAGES);

    protected readonly context: TVerifyContext = inject(KC_CONTEXT) as TVerifyContext;
    protected readonly title: string = this.#i18n.msgStr('emailVerifyTitle');
    protected readonly sent: string = this.#i18n.msgStr('emailVerifyInstruction1', this.context.user?.email ?? '');
    protected readonly resend: string = this.#i18n.msgStr('emailVerifyInstruction2');
    protected readonly resendLink: string = this.#i18n.msgStr('doClickHere');
    protected readonly resendTail: string = this.#i18n.msgStr('emailVerifyInstruction3');
}
