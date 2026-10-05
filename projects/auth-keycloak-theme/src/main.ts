import { ApplicationRef, ComponentRef, provideZonelessChangeDetection, Type } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { getDefaultPageComponent } from '@keycloakify/angular/login';
import { UserProfileFormFieldsComponent } from '@keycloakify/angular/login/components/user-profile-form-fields';
import { provideKeycloakifyAngular } from '@keycloakify/angular/login/providers/keycloakify-angular';
import { TemplateComponent } from '@keycloakify/angular/login/template';

import { themeAppConfig } from './login/kc-app.config';
import { TKcContext } from './login/kc-context';
import { getI18n, TKcMessages } from './login/kc-i18n';
import { themePageOf } from './login/kc-pages';
import { RtKcRootComponent } from './login/shell/rt-kc-root.component';

/** A page the theme does not draw itself keeps the standard Keycloakify layout and its styles. */
async function startStandard(context: TKcContext): Promise<void> {
    const page: Type<unknown> = await getDefaultPageComponent(context.pageId);
    const application: ApplicationRef = await bootstrapApplication(TemplateComponent, {
        providers: [
            provideZonelessChangeDetection(),
            provideKeycloakifyAngular({ getI18n, kcContext: context, doUseDefaultCss: true, doMakeUserConfirmPassword: true, classes: {} }),
        ],
    });
    application.components.forEach((component: ComponentRef<unknown>): void => {
        component.setInput('page', page);
        component.setInput('userProfileFormFields', UserProfileFormFieldsComponent);
    });
}

/** The page draws in the locale Keycloak chose, so the messages of that locale are loaded first. */
async function startTheme(context: TKcContext, page: Type<unknown>): Promise<void> {
    const loaded: ReturnType<typeof getI18n> = getI18n({ kcContext: context });
    const current: TKcMessages = (await loaded.prI18n_currentLanguage) ?? loaded.i18n;
    await bootstrapApplication(RtKcRootComponent, themeAppConfig(context, current, page));
}

// Outside Keycloak there is no context and nothing to draw.
const context: TKcContext | undefined = window.kcContext;
if (context !== undefined) {
    const page: Type<unknown> | null = themePageOf(context.pageId);
    void (page === null ? startStandard(context) : startTheme(context, page));
}
