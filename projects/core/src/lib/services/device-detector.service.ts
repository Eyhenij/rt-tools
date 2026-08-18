import { Injectable, inject } from '@angular/core';

import { TNullable } from '@rt-tools/utils';

import { NAVIGATOR } from '../tokens/navigator.token';
import { WINDOW } from '../tokens/window.token';
import { PlatformService } from './platform.service';

export namespace OSTypes {
    export const WINDOWS: string = 'Windows';
    export const MAC_OS: string = 'Mac OS';
    export const LINUX: string = 'Linux';
    export const ANDROID: string = 'Android';
    export const IOS: string = 'iOS';
    export const UNKNOWN: string = 'Unknown';
}

/**
 * Признаки операционной системы в строке обозревателя, в порядке проверки.
 *
 * Порядок значим и оставлен прежним: строка обозревателя на Android несёт и `Android`, и
 * `Linux`, и до правки первым срабатывал `Linux` — таблица это поведение сохраняет.
 */
const OS_SIGNATURES: ReadonlyArray<[RegExp, string]> = [
    [/Windows/i, OSTypes.WINDOWS],
    [/Macintosh|Mac OS/i, OSTypes.MAC_OS],
    [/Linux/i, OSTypes.LINUX],
    [/Android/i, OSTypes.ANDROID],
    [/iOS/i, OSTypes.IOS],
];

@Injectable()
export class DeviceDetectorService {
    readonly #windowRef: Window = inject(WINDOW);
    readonly #navigatorRef: Navigator = inject(NAVIGATOR);
    readonly #platformService: PlatformService = inject(PlatformService);

    public userAgent: TNullable<string> = null;

    constructor() {
        if (
            this.#platformService.isPlatformBrowser &&
            typeof this.#windowRef !== 'undefined' &&
            typeof this.#navigatorRef !== 'undefined' &&
            this.#navigatorRef?.userAgent
        ) {
            this.userAgent = this.#navigatorRef.userAgent;
        }
    }

    public isMobile(): boolean {
        return this.userAgent ? /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(this.userAgent) : false;
    }

    public isTablet(): boolean {
        return this.userAgent ? /iPad|Android|Tablet/i.test(this.userAgent) : false;
    }

    public isDesktop(): boolean {
        return !this.isMobile() && !this.isTablet();
    }

    public getOS(): string {
        const agent: string = this.userAgent ?? '';
        const known: TNullable<[RegExp, string]> = OS_SIGNATURES.find(([pattern]: [RegExp, string]) => pattern.test(agent));

        return known ? known[1] : OSTypes.UNKNOWN;
    }
}
