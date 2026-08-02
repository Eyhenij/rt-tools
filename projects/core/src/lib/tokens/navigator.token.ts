import { DOCUMENT } from '@angular/common';
import { InjectionToken, inject } from '@angular/core';

export const NAVIGATOR: InjectionToken<Navigator> = new InjectionToken<Navigator>('An injection token for global navigator object', {
    factory: (): Navigator => {
        const { defaultView }: Document = inject(DOCUMENT);

        if (!defaultView || !defaultView?.navigator) {
            throw new Error('Navigator is not available');
        }

        return defaultView.navigator;
    },
});
