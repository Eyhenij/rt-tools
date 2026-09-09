import { InjectionToken } from '@angular/core';
import type { MatFormFieldAppearance } from '@angular/material/form-field';

import type { IRtuiButton } from '../buttons/unified-button/rtui-button.types';
import type { TRtThemeType } from '../theme/rtui-theme.types';

/**
 * Design system a control renders with:
 * - `'custom'` — the rt-tools look (design tokens, pill shapes). The default.
 * - `'material'` — the control renders a NATIVE Angular Material component
 *   (e.g. the button pill becomes a real `matButton`), for apps that have not
 *   migrated their visual language yet or need to match surrounding Material controls.
 */
export type TRtUiDesign = 'material' | 'custom';

export namespace IRtUiConfig {
    /** Global defaults applied app-wide unless a component-level setting or an input overrides them. */
    export interface Global {
        /** Initial theme used when the user has no persisted preference. */
        theme?: TRtThemeType;
        /** Initial brand color scheme (see `RtThemeService.registerColorScheme`) when none is persisted. */
        colorScheme?: string;
        /** Default design for every design-aware control. */
        design?: TRtUiDesign;
    }

    /** Per-instance-overridable defaults for `rtui-button`. */
    export interface Button {
        design?: TRtUiDesign;
        size?: IRtuiButton.Size;
        radius?: IRtuiButton.Radius;
        appearance?: IRtuiButton.Appearance;
    }

    /** Per-instance-overridable defaults for the dynamic selectors family. */
    export interface DynamicSelectors {
        /**
         * Appearance every form field of the family renders with.
         *
         * The family nests: a selector holds an input, an input opens a popup, a popup holds a
         * list. Set once here, the look reaches all of them; passed as an input, it has to be
         * repeated at every use, and the one that was missed differs from the rest.
         */
        appearance?: MatFormFieldAppearance;
    }

    /** Per-instance-overridable defaults for the aside curtain. */
    export interface Aside {
        /**
         * Whether Esc closes an open curtain.
         *
         * The kit default is `false`: the key is pressed to lift a hint or to leave a field, and
         * the whole panel closed together with what was entered. An application that needs the
         * former behaviour names it here once instead of naming it at every call.
         */
        closeOnEscape?: boolean;
    }

    /** Component-level settings. Each entry overrides `global` for that component only. */
    export interface Components {
        button?: Button;
        dynamicSelectors?: DynamicSelectors;
        aside?: Aside;
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
