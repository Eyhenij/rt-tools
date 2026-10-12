import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders, Provider, Signal } from '@angular/core';

import { Transport } from '@connectrpc/connect';

import { provideCmsLabels } from './i18n/cms-labels.providers';
import { TCmsTranslator } from './i18n/cms-labels.model';
import { ISiteAddress } from './item/item-form.function';

/** The Connect transport the CMS clients call the server by. Only the application knows the server address. */
export const CMS_TRANSPORT: InjectionToken<Transport> = new InjectionToken<Transport>('CMS_TRANSPORT');

/**
 * Where the site opens a page preview and under which root it shows pages without an own link.
 * The development and the production sites differ, so the application names it.
 */
export const CMS_SITE_ADDRESS: InjectionToken<ISiteAddress> = new InjectionToken<ISiteAddress>('CMS_SITE_ADDRESS');

/** The languages a page is written in. The first one is the language of a new page. */
export const CMS_LOCALES: InjectionToken<readonly string[]> = new InjectionToken<readonly string[]>('CMS_LOCALES');

/** What the application tells the CMS client. The labels are optional: without them the client speaks English. */
export interface ICmsOptions {
    readonly transport: Transport;
    readonly siteAddress: ISiteAddress;
    readonly locales: readonly string[];
    readonly translator?: Signal<TCmsTranslator>;
}

/** Gives the CMS client the application's facts in one call. */
export function provideCms(options: ICmsOptions): EnvironmentProviders {
    const providers: (Provider | EnvironmentProviders)[] = [
        { provide: CMS_TRANSPORT, useValue: options.transport },
        { provide: CMS_SITE_ADDRESS, useValue: options.siteAddress },
        { provide: CMS_LOCALES, useValue: options.locales },
    ];
    if (options.translator !== undefined) {
        providers.push(provideCmsLabels(options.translator));
    }
    return makeEnvironmentProviders(providers);
}
