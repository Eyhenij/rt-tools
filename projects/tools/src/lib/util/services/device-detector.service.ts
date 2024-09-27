import { Injectable } from '@angular/core';

export namespace OSTypes {
    export const WINDOWS: string = 'Windows';
    export const MAC_OS: string = 'Mac OS';
    export const LINUX: string = 'Linux';
    export const ANDROID: string = 'Android';
    export const IOS: string = 'iOS';
    export const UNKNOWN: string = 'Unknown';
}

const userAgent: string = navigator?.userAgent;

@Injectable()
export class DeviceDetectorService {
    public isMobile(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    }

    public isTablet(): boolean {
        return /iPad|Android|Tablet/i.test(userAgent);
    }

    public isDesktop(): boolean {
        return !this.isMobile() && !this.isTablet();
    }

    public getOS(): string {
        let os: string;

        if (/Windows/i.test(userAgent)) {
            os = OSTypes.WINDOWS;
        } else if (/Macintosh|Mac OS/i.test(userAgent)) {
            os = OSTypes.MAC_OS;
        } else if (/Linux/i.test(userAgent)) {
            os = OSTypes.LINUX;
        } else if (/Android/i.test(userAgent)) {
            os = OSTypes.ANDROID;
        } else if (/iOS/i.test(userAgent)) {
            os = OSTypes.IOS;
        } else {
            os = OSTypes.UNKNOWN;
        }

        return os;
    }
}
