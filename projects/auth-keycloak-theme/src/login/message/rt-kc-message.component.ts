import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IRtTag, RtMessageComponent } from '@rt-tools/ui-kit-v2';

import { KC_CONTEXT, TKcContext } from '../kc-context';

const BEM_BLOCK: string = 'rt-kc-message';

type TKcMessage = NonNullable<TKcContext['message']>;

/** The colour of a Keycloak message by its kind. */
const SEVERITY: Readonly<Record<TKcMessage['type'], IRtTag.Severity>> = Object.freeze({
    error: 'danger',
    warning: 'warning',
    success: 'success',
    info: 'info',
});

/**
 * The message Keycloak put on the page, above the form. The summary is drawn as text: it may
 * repeat what a person typed, and markup in it is not markup of the theme.
 */
@Component({
    selector: 'rt-kc-message',
    imports: [RtMessageComponent],
    templateUrl: './rt-kc-message.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: BEM_BLOCK },
})
export class RtKcMessageComponent {
    protected readonly message: TKcMessage | null = inject(KC_CONTEXT).message ?? null;
    protected readonly severity: IRtTag.Severity = this.message === null ? 'info' : SEVERITY[this.message.type];
}
