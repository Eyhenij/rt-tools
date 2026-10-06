import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRtStorage, provideRtUtils } from '@rt-tools/core';
import { provideRtKit, provideRtKitLabels } from '@rt-tools/ui-kit-v2';
import { createGetKcContextMock } from 'keycloakify/login/KcContext';

import { KC_CONTEXT, KC_PAGE, TKcContext, TKcPageContext, TKcPageId } from '../login/kc-context';
import { getI18n, KC_MESSAGES, plainMessages, TKcMessages } from '../login/kc-i18n';
import { kitTranslatorFor } from '../login/kc-kit-labels';

const { getKcContextMock } = createGetKcContextMock({
    kcContextExtension: { themeName: 'rt', properties: {} },
    kcContextExtensionPerPage: {},
});

/** The overrides a scenario puts on the mock context of one page. */
export type TKcPageOverrides<PAGE extends TKcPageId> = Parameters<typeof getKcContextMock<PAGE>>[0]['overrides'];

/** The mock context Keycloakify ships for a page, with the scenario overrides on top. */
export function kcContextOf<PAGE extends TKcPageId>(pageId: PAGE, overrides?: TKcPageOverrides<PAGE>): TKcPageContext<PAGE> {
    return getKcContextMock({ pageId, overrides });
}

/** The messages of the context locale, loaded the same way the page loads them. */
export async function kcMessagesOf(context: TKcContext): Promise<TKcMessages> {
    const loaded: ReturnType<typeof getI18n> = getI18n({ kcContext: context });

    return (await loaded.prI18n_currentLanguage) ?? loaded.i18n;
}

/**
 * Draws a theme component on a page context, with the providers the theme application has. The
 * frame of the pages takes the page it draws inside as `page`.
 */
export async function renderKcPage<COMPONENT>(
    component: Type<COMPONENT>,
    context: TKcContext,
    page: Type<unknown> = component
): Promise<ComponentFixture<COMPONENT>> {
    const messages: TKcMessages = await kcMessagesOf(context);
    const languageTag: string = messages.currentLanguage.languageTag;
    TestBed.configureTestingModule({
        imports: [component],
        providers: [
            provideHttpClient(),
            provideHttpClientTesting(),
            provideRtUtils(),
            provideRtStorage(),
            provideRtKit({ global: { theme: 'auto' } }),
            provideRtKitLabels({ translator: signal(kitTranslatorFor(languageTag)), locale: signal(languageTag) }),
            { provide: KC_CONTEXT, useValue: context },
            { provide: KC_MESSAGES, useValue: plainMessages(messages) },
            { provide: KC_PAGE, useValue: page },
        ],
    });
    const fixture: ComponentFixture<COMPONENT> = TestBed.createComponent(component);
    await fixture.whenStable();

    return fixture;
}

/** The node under an anchor of the theme. */
export function kcNode<ELEMENT extends Element = HTMLElement>(fixture: ComponentFixture<unknown>, anchor: string): ELEMENT | null {
    return (fixture.nativeElement as HTMLElement).querySelector<ELEMENT>(`[qa-dataid="${anchor}"]`);
}

/** Types into a kit input the way a person does: the native field fires `input`. */
export async function typeInto(fixture: ComponentFixture<unknown>, anchor: string, value: string): Promise<void> {
    const field: HTMLInputElement | null = kcNode<HTMLElement>(fixture, anchor)?.querySelector('input') ?? null;
    if (field === null) {
        throw new Error(`no kit input under ${anchor}`);
    }
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
}

/** What a native submit of the form would post, and whether the page let it go. */
export interface IKcSubmitted {
    readonly sent: boolean;
    readonly action: string;
    readonly fields: Readonly<Record<string, string>>;
}

/** Sends a page form the way a browser does and reads what it would post. */
export async function submitForm(fixture: ComponentFixture<unknown>, anchor: string, submitter?: HTMLElement): Promise<IKcSubmitted> {
    const form: HTMLFormElement | null = kcNode<HTMLFormElement>(fixture, anchor);
    if (form === null) {
        throw new Error(`no form under ${anchor}`);
    }
    const event: SubmitEvent = new SubmitEvent('submit', { bubbles: true, cancelable: true, submitter: submitter ?? null });
    form.dispatchEvent(event);
    await fixture.whenStable();
    const fields: Record<string, string> = {};
    new FormData(form).forEach((value: FormDataEntryValue, name: string): void => {
        fields[name] = String(value);
    });

    return { sent: !event.defaultPrevented, action: form.action, fields };
}
