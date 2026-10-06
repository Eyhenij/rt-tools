import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { RtButtonDirective } from '@rt-tools/ui-kit-v2';

import { KC_CONTEXT, TKcPageContext } from '../../kc-context';
import { KC_MESSAGES, TKcMessages } from '../../kc-i18n';
import { RtKcMessageComponent } from '../../message/rt-kc-message.component';

const BEM_BLOCK: string = 'rt-kc-page';

type TErrorContext = TKcPageContext<'error.ftl'>;

/** `error.ftl` — the entry stopped, and the page leads back to the admin when the realm knows it. */
@Component({
    selector: 'rt-kc-error',
    imports: [BlockDirective, ElemDirective, RtButtonDirective, RtKcMessageComponent],
    templateUrl: './rt-kc-error.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: BEM_BLOCK },
})
export class RtKcErrorComponent {
    readonly #i18n: TKcMessages = inject(KC_MESSAGES);
    readonly #context: TErrorContext = inject(KC_CONTEXT) as TErrorContext;

    protected readonly title: string = this.#i18n.msgStr('errorTitle');
    protected readonly backHref: string | null =
        !this.#context.skipLink && this.#context.client?.baseUrl ? this.#context.client.baseUrl : null;
    protected readonly backLabel: string = this.#i18n.msgStr('backToApplication');
}
