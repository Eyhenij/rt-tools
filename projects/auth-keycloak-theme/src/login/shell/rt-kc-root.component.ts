import { DOCUMENT, NgComponentOutlet } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, inject, Type } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { IRtSelect, RtDotFieldComponent, RtSelectComponent, RtThemeToggleComponent } from '@rt-tools/ui-kit-v2';

import { KC_CONTEXT, KC_PAGE, TKcContext } from '../kc-context';
import { KC_MESSAGES, TKcMessages } from '../kc-i18n';
import { loadPageScripts } from '../kc-page-scripts';
import { IKcRealmLogo, realmLogoOf } from '../kc-realm-logo';

const BEM_BLOCK: string = 'rt-kc-root';

/** A language of the realm as Keycloak lists it: the tag, the name and the page in that language. */
interface IKcLanguage {
    readonly languageTag: string;
    readonly label: string;
    readonly href: string;
}

/**
 * The frame of every theme page: the locale and theme switches above the card, the realm logo or
 * name and the page inside it. The page itself is the component the theme maps to the page id.
 */
@Component({
    selector: 'rt-kc-root',
    imports: [
        NgComponentOutlet,
        ReactiveFormsModule,
        BlockDirective,
        ElemDirective,
        RtDotFieldComponent,
        RtSelectComponent,
        RtThemeToggleComponent,
    ],
    templateUrl: './rt-kc-root.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: BEM_BLOCK },
})
export class RtKcRootComponent {
    readonly #context: TKcContext = inject(KC_CONTEXT);
    readonly #i18n: TKcMessages = inject(KC_MESSAGES);

    protected readonly page: Type<unknown> = inject(KC_PAGE);
    protected readonly realmName: string = this.#context.realm.displayName || this.#context.realm.name;
    protected readonly logo: IKcRealmLogo | null = realmLogoOf(this.#context.realm.displayNameHtml ?? '', this.realmName);

    readonly #document: Document = inject(DOCUMENT);
    readonly #languages: readonly IKcLanguage[] = this.#i18n.enabledLanguages;

    protected readonly languagesLabel: string = this.#i18n.msgStr('languages');

    /** A choice of one language is not a choice, so the list shows only with two languages. */
    protected readonly localeOptions: ReadonlyArray<IRtSelect.Option<string>> =
        this.#languages.length > 1
            ? this.#languages.map((language: IKcLanguage): IRtSelect.Option<string> => ({
                  label: language.label,
                  value: language.languageTag,
              }))
            : [];

    protected readonly locale: FormControl<string> = new FormControl<string>(this.#i18n.currentLanguage.languageTag, { nonNullable: true });

    constructor() {
        this.#document.documentElement.lang = this.#i18n.currentLanguage.languageTag;
        this.#document.title = this.realmName;
        // The reCAPTCHA script renders only the widgets it finds on load, so the page is drawn first.
        afterNextRender((): void => {
            loadPageScripts(this.#document, this.#context.scripts ?? []);
        });
    }

    /** Keycloak draws a page in a language by its own address, so a choice opens that address. */
    protected switchLocale(languageTag: string | null): void {
        const language: IKcLanguage | undefined = this.#languages.find((item: IKcLanguage): boolean => item.languageTag === languageTag);
        if (language && languageTag !== this.#i18n.currentLanguage.languageTag) {
            this.#document.location.assign(language.href);
        }
    }
}
