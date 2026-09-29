import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

import { installMatchMediaStub } from './testing/match-media-stub';

setupZonelessTestEnv({
    errorOnUnknownElements: true,
    errorOnUnknownProperties: true,
});

// jsdom не умеет `matchMedia`: без заглушки любая служба, спрашивающая машину о
// настройках оформления, падает на старте.
installMatchMediaStub();
