import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';


@Injectable()
export class PlatformService {
    public readonly isPlatformBrowser: boolean;

    constructor(@Inject(PLATFORM_ID) public readonly platformId: string) {
        this.isPlatformBrowser = isPlatformBrowser(platformId);
    }
}
