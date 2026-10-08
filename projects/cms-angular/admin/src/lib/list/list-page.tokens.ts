import { InjectionToken, Provider, Type, forwardRef } from '@angular/core';

import { IListPage } from './list-query.model';

/**
 * The screen the list frame draws. A token, not the base class: the frame knows no section, and
 * through the token it gets exactly the {@link IListPage.Host} contract.
 */
export const CMS_LIST_PAGE_HOST: InjectionToken<IListPage.Host> = new InjectionToken<IListPage.Host>('CMS_LIST_PAGE_HOST');

/**
 * Declares the screen to the frame: `providers: [provideCmsListPage(() => RedirectsPageComponent)]`.
 *
 * The class comes by a function: the decorator argument is computed before the class is declared,
 * and a direct reference to it would fail when the chunk loads.
 */
export function provideCmsListPage(component: () => Type<IListPage.Host>): Provider {
    const provider: Provider = { provide: CMS_LIST_PAGE_HOST, useExisting: forwardRef(component) };

    return provider;
}
