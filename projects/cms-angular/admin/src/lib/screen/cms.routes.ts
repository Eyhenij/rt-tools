import { Type } from '@angular/core';
import { Routes } from '@angular/router';

import { rtAsideUnsavedGuard } from '@rt-tools/ui-kit-v2';

import { CMS_ASIDE_OUTLET } from './cms-aside-outlet.const';

/**
 * The content section routes, relative to the place the application mounts them at: the content
 * types at the root, then the tags, the redirects, the pages of a type, the type settings and the
 * page edit. The words `tags` and `redirects` go before the type id: a type id would take them
 * otherwise.
 *
 * The routes are flat, and a screen navigates from the section root. The redirect panel lives in the
 * side outlet: the redirects screen stands on an empty path inside its branch, otherwise a relative
 * move into the named outlet is not resolved. Leaving the page edit with unsaved edits asks: the
 * kit guard calls the question of the screen itself.
 */
export const cmsRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        loadComponent: async (): Promise<Type<unknown>> =>
            (await import('./cms-content-types-page/cms-content-types-page.component')).CmsContentTypesPageComponent,
    },
    {
        path: 'tags',
        loadComponent: async (): Promise<Type<unknown>> => (await import('./cms-tags-page/cms-tags-page.component')).CmsTagsPageComponent,
    },
    {
        path: 'redirects',
        children: [
            {
                path: 'add',
                outlet: CMS_ASIDE_OUTLET,
                canDeactivate: [rtAsideUnsavedGuard],
                loadComponent: async (): Promise<Type<unknown>> =>
                    (await import('./cms-redirect-aside/cms-redirect-aside.component')).CmsRedirectAsideComponent,
            },
            {
                path: 'edit/:redirectId',
                outlet: CMS_ASIDE_OUTLET,
                canDeactivate: [rtAsideUnsavedGuard],
                loadComponent: async (): Promise<Type<unknown>> =>
                    (await import('./cms-redirect-aside/cms-redirect-aside.component')).CmsRedirectAsideComponent,
            },
            {
                path: '',
                loadComponent: async (): Promise<Type<unknown>> =>
                    (await import('./cms-redirects-page/cms-redirects-page.component')).CmsRedirectsPageComponent,
            },
        ],
    },
    {
        path: ':typeId',
        loadComponent: async (): Promise<Type<unknown>> =>
            (await import('./cms-content-items-page/cms-content-items-page.component')).CmsContentItemsPageComponent,
    },
    {
        path: ':typeId/settings',
        loadComponent: async (): Promise<Type<unknown>> =>
            (await import('./cms-content-type-settings-page/cms-content-type-settings-page.component')).CmsContentTypeSettingsPageComponent,
    },
    {
        path: ':typeId/items/:itemId',
        canDeactivate: [rtAsideUnsavedGuard],
        loadComponent: async (): Promise<Type<unknown>> =>
            (await import('./cms-item-editor-page/cms-item-editor-page.component')).CmsItemEditorPageComponent,
    },
];

/** The media library routes, relative to the mount place. The section has no panels: uploading and deleting go right from the list. */
export const mediaRoutes: Routes = [
    {
        path: '',
        loadComponent: async (): Promise<Type<unknown>> =>
            (await import('./cms-media-page/cms-media-page.component')).CmsMediaPageComponent,
    },
];
