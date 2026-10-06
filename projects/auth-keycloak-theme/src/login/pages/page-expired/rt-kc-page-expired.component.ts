import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { KC_CONTEXT, TKcPageContext } from '../../kc-context';
import { KC_MESSAGES, TKcMessages } from '../../kc-i18n';

const BEM_BLOCK: string = 'rt-kc-page';

type TExpiredContext = TKcPageContext<'login-page-expired.ftl'>;

/** `login-page-expired.ftl` — the page went stale; the entry restarts or continues. */
@Component({
    selector: 'rt-kc-page-expired',
    imports: [BlockDirective, ElemDirective],
    templateUrl: './rt-kc-page-expired.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: BEM_BLOCK },
})
export class RtKcPageExpiredComponent {
    readonly #i18n: TKcMessages = inject(KC_MESSAGES);

    protected readonly context: TExpiredContext = inject(KC_CONTEXT) as TExpiredContext;
    protected readonly title: string = this.#i18n.msgStr('pageExpiredTitle');
    protected readonly restart: string = this.#i18n.msgStr('pageExpiredMsg1');
    protected readonly resume: string = this.#i18n.msgStr('pageExpiredMsg2');
    protected readonly here: string = this.#i18n.msgStr('doClickHere');
}
