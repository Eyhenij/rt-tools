import { DOCUMENT } from '@angular/common';
import { InjectionToken, inject } from '@angular/core';

export const WINDOW: InjectionToken<Window> = new InjectionToken<Window>('An injection token for global window object', {
    factory: (): Window => {
        const { defaultView }: Document = inject(DOCUMENT);

        if (!defaultView) {
            throw new Error('Window is not available');
        }

        return defaultView;
    },
});
