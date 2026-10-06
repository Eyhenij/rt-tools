import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { RtButtonDirective } from '@rt-tools/ui-kit-v2';

import { KC_CONTEXT, TKcPageContext } from '../../kc-context';
import { KC_MESSAGES, TKcMessages } from '../../kc-i18n';

const BEM_BLOCK: string = 'rt-kc-page';

type TInfoContext = TKcPageContext<'info.ftl'>;

/** Where the page leads on: the next step, the address the realm named, or the admin. */
interface IKcNextStep {
    readonly href: string;
    readonly label: string;
}

/**
 * `info.ftl` — a message of the realm. A person who opens an invitation letter lands here first:
 * the page names the actions ahead and leads to the first of them.
 */
@Component({
    selector: 'rt-kc-info',
    imports: [BlockDirective, ElemDirective, RtButtonDirective],
    templateUrl: './rt-kc-info.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: BEM_BLOCK },
})
export class RtKcInfoComponent {
    readonly #i18n: TKcMessages = inject(KC_MESSAGES);
    readonly #context: TInfoContext = inject(KC_CONTEXT) as TInfoContext;

    protected readonly title: string = this.#context.messageHeader || this.#context.message.summary;
    protected readonly summary: string | null = this.#context.messageHeader ? this.#context.message.summary : null;
    protected readonly actions: string = (this.#context.requiredActions ?? [])
        .map((action: string): string => this.#i18n.advancedMsgStr(`requiredAction.${action}`))
        .join(', ');
    protected readonly next: IKcNextStep | null = this.#nextStep();

    #nextStep(): IKcNextStep | null {
        if (this.#context.skipLink) {
            return null;
        }
        if (this.#context.pageRedirectUri) {
            return { href: this.#context.pageRedirectUri, label: this.#i18n.msgStr('backToApplication') };
        }
        if (this.#context.actionUri) {
            return { href: this.#context.actionUri, label: this.#i18n.msgStr('proceedWithAction') };
        }
        if (this.#context.client.baseUrl) {
            return { href: this.#context.client.baseUrl, label: this.#i18n.msgStr('backToApplication') };
        }

        return null;
    }
}
