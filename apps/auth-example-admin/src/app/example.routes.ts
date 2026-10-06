import { Routes } from '@angular/router';
import { rtAuthGuard } from '@rt-tools/auth-angular';

import { RecordsPage } from './records/records.page';

/** Every route of the example needs an entry: a person who is not signed in goes to Keycloak. */
export const EXAMPLE_ROUTES: Routes = [
    {
        path: '',
        pathMatch: 'full',
        canActivate: [rtAuthGuard],
        component: RecordsPage,
    },
    { path: '**', redirectTo: '' },
];
