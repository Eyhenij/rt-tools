import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

setupZonelessTestEnv({
    errorOnUnknownElements: true,
    errorOnUnknownProperties: true,
});

// jsdom has no `matchMedia`, and the kit theme service asks the machine about the dark theme.
window.matchMedia = (query: string): MediaQueryList =>
    ({
        media: query,
        matches: false,
        onchange: null,
        addEventListener: (): void => undefined,
        removeEventListener: (): void => undefined,
        addListener: (): void => undefined,
        removeListener: (): void => undefined,
        dispatchEvent: (): boolean => false,
    }) as MediaQueryList;
