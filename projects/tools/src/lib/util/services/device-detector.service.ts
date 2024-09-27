import { Injectable, inject } from '@angular/core';

import { Nullable } from '../interfaces';
import { NAVIGATOR, WINDOW } from '../tokens';
import { PlatformService } from './platform.service';

export namespace OSTypes {
    export const WINDOWS: string = 'Windows';
    export const MAC_OS: string = 'Mac OS';
    export const LINUX: string = 'Linux';
    export const ANDROID: string = 'Android';
    export const IOS: string = 'iOS';
    export const UNKNOWN: string = 'Unknown';
}

@Injectable()
export class DeviceDetectorService {
    readonly #windowRef: Window = inject(WINDOW);
    readonly #navigatorRef: Navigator = inject(NAVIGATOR);
    readonly #platformService: PlatformService = inject(PlatformService);

    public userAgent: Nullable<string> = null;

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
        let os: string;

        if (this.userAgent && /Windows/i.test(this.userAgent)) {
            os = OSTypes.WINDOWS;
        } else if (this.userAgent && /Macintosh|Mac OS/i.test(this.userAgent)) {
            os = OSTypes.MAC_OS;
        } else if (this.userAgent && /Linux/i.test(this.userAgent)) {
            os = OSTypes.LINUX;
        } else if (this.userAgent && /Android/i.test(this.userAgent)) {
            os = OSTypes.ANDROID;
        } else if (this.userAgent && /iOS/i.test(this.userAgent)) {
            os = OSTypes.IOS;
        } else {
            os = OSTypes.UNKNOWN;
        }

        return os;
    }
}
