import { InjectionToken } from '@angular/core';

import type { IRtuiButton } from '../buttons/unified-button/rtui-button.component';
import type { RtThemeType } from '../theme/rtui-theme.types';

/**
 * Design system a control renders with:
 * - `'custom'` — the rt-tools look (design tokens, pill shapes). The default.
 * - `'material'` — the control renders a NATIVE Angular Material component
 *   (e.g. the button pill becomes a real `matButton`), for apps that have not
 *   migrated their visual language yet or need to match surrounding Material controls.
 */
export type RtUiDesign = 'material' | 'custom';

export namespace IRtUiConfig {
    /** Global defaults applied app-wide unless a component-level setting or an input overrides them. */
    export interface Global {
        /** Initial theme used when the user has no persisted preference. */
        theme?: RtThemeType;
        /** Initial brand color scheme (see `RtThemeService.registerColorScheme`) when none is persisted. */
        colorScheme?: string;
        /** Default design for every design-aware control. */
        design?: RtUiDesign;
    }

    /** Per-instance-overridable defaults for `rtui-button`. */
    export interface Button {
        design?: RtUiDesign;
        size?: IRtuiButton.Size;
        radius?: IRtuiButton.Radius;
        appearance?: IRtuiButton.Appearance;
    }

    /** Component-level settings. Each entry overrides `global` for that component only. */
    export interface Components {
        button?: Button;
    }

    export interface Config {
        global?: Global;
        components?: Components;
    }
}

/**
 * Application-wide UI configuration for rt-tools components.
 *
 * Resolution order (most specific wins):
 * 1. the component input on a concrete instance,
 * 2. `components.<name>` in this config,
 * 3. `global` in this config,
 * 4. the library default.
 *
 * Provide it via {@link provideRtUi}:
 * ```typescript
 * bootstrapApplication(RootComponent, {
 *     providers: [
 *         provideRtUi({
 *             global: { theme: 'auto', design: 'custom' },
 *             components: { button: { design: 'material' } },
 *         }),
 *     ],
 * });
 * ```
 *
 * @publicApi
 */
export const RT_UI_CONFIG: InjectionToken<IRtUiConfig.Config> = new InjectionToken<IRtUiConfig.Config>('RT_UI_CONFIG', {
    providedIn: 'root',
    factory: (): IRtUiConfig.Config => ({}),
});
