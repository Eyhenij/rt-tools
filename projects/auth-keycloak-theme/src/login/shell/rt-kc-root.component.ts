import { DOCUMENT, NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Type } from '@angular/core';
import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { RtButtonDirective, RtThemeToggleComponent } from '@rt-tools/ui-kit-v2';

import { KC_CONTEXT, KC_PAGE, TKcContext } from '../kc-context';
import { KC_MESSAGES, TKcMessages } from '../kc-i18n';

const BEM_BLOCK: string = 'rt-kc-root';

/** A locale link of the page, marked when it is the current one. */
interface IKcLocaleLink {
    readonly languageTag: string;
    readonly label: string;
    readonly href: string;
    readonly current: boolean;
}

/**
 * The frame of every theme page: the locale and theme switches above the card, the realm name
 * and the page inside it. The page itself is the component the theme maps to the page id.
 */
@Component({
    selector: 'rt-kc-root',
    imports: [NgComponentOutlet, BlockDirective, ElemDirective, RtButtonDirective, RtThemeToggleComponent],
    templateUrl: './rt-kc-root.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: BEM_BLOCK },
})
export class RtKcRootComponent {
    readonly #context: TKcContext = inject(KC_CONTEXT);
    readonly #i18n: TKcMessages = inject(KC_MESSAGES);

    protected readonly page: Type<unknown> = inject(KC_PAGE);
    protected readonly realmName: string = this.#context.realm.displayName || this.#context.realm.name;

    /** A switch of one language is not a choice, so the row shows only with two languages. */
    protected readonly locales: readonly IKcLocaleLink[] =
        this.#i18n.enabledLanguages.length > 1
            ? this.#i18n.enabledLanguages.map((language: { languageTag: string; label: string; href: string }): IKcLocaleLink => ({
                  ...language,
                  current: language.languageTag === this.#i18n.currentLanguage.languageTag,
              }))
            : [];

    constructor() {
        const view: Document = inject(DOCUMENT);
        view.documentElement.lang = this.#i18n.currentLanguage.languageTag;
        view.title = this.realmName;
    }
}
