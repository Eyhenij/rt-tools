import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { RtButtonDirective } from '@rt-tools/ui-kit-v2';

import { KC_CONTEXT, TKcPageContext } from '../../kc-context';
import { backLinkText, KC_MESSAGES, TKcMessages } from '../../kc-i18n';
import { RtKcMessageComponent } from '../../message/rt-kc-message.component';

const BEM_BLOCK: string = 'rt-kc-page';

type TLogoutContext = TKcPageContext<'logout-confirm.ftl'>;

/** `logout-confirm.ftl` — leaving is confirmed by a button, so a stray link does not end a session. */
@Component({
    selector: 'rt-kc-logout-confirm',
    imports: [BlockDirective, ElemDirective, RtButtonDirective, RtKcMessageComponent],
    templateUrl: './rt-kc-logout-confirm.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: BEM_BLOCK },
})
export class RtKcLogoutConfirmComponent {
    readonly #i18n: TKcMessages = inject(KC_MESSAGES);

    protected readonly context: TLogoutContext = inject(KC_CONTEXT) as TLogoutContext;
    protected readonly title: string = this.#i18n.msgStr('logoutConfirmTitle');
    protected readonly question: string = this.#i18n.msgStr('logoutConfirmHeader');
    protected readonly submitLabel: string = this.#i18n.msgStr('doLogout');
    protected readonly backLabel: string = backLinkText(this.#i18n.msgStr('backToApplication'));
    protected readonly backHref: string | null =
        !this.context.logoutConfirm.skipLink && this.context.client.baseUrl ? this.context.client.baseUrl : null;
}
