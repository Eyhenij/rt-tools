import { InjectionToken } from '@angular/core';

import { IDevToolsConfig } from '../interfaces/devtools.interface';

export interface IDevToolsGlobalConfig extends IDevToolsConfig {
    /** Enable DevTools globally (default: false) */
    enabled: boolean;
}

export const STORE_DEVTOOLS_CONFIG: InjectionToken<IDevToolsGlobalConfig> = new InjectionToken<IDevToolsGlobalConfig>(
    'Global configuration for store DevTools integration'
);
