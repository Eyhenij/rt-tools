export enum RT_THEME_ENUM {
    LIGHT = 'light',
    DARK = 'dark',
    AUTO = 'auto',
}

export type RtThemeType = `${RT_THEME_ENUM}`;

export const RT_THEME_STORAGE_KEY: string = 'rt-theme';
export const RT_DARK_CLASS: string = 'rt-dark';
export const RT_THEME_AUTO_CLASS: string = 'rt-theme-auto';
export const RT_THEME_ATTRIBUTE: string = 'data-rt-theme';

/**
 * Accent roles whose `--rt-color-{role}-{0..100}` indirection rows a custom
 * color scheme may override. The semantic accent tier
 * (`--rt-bg/text/icon/border-accent-*`) derives entirely from these rows.
 */
export enum RT_ACCENT_ROLE_ENUM {
    PRIMARY = 'primary',
    INFO = 'info',
    SUCCESS = 'success',
    WARNING = 'warning',
    DANGER = 'danger',
    BRAND = 'brand',
}

export type RtAccentRole = `${RT_ACCENT_ROLE_ENUM}`;

/**
 * A brand palette: per accent role, a tonal ramp mapping tone step (0–100)
 * to a CSS color. One ramp serves both light and dark (the mode picks the tone).
 * Partial ramps are allowed — unset tones keep the rt-tools defaults.
 *
 * @example
 * const teal: RtColorSchemeRamp = {
 *     primary: { 20: '#b3e3e1', 40: '#5cb8b5', 60: '#1a9d99', 100: '#008582' },
 *     brand:   { 20: '#e8e8e8', 100: '#008582' },
 * };
 */
export type RtColorSchemeRamp = Partial<Record<RtAccentRole, Record<number, string>>>;

/** `'default'`/`null` clears the active scheme (back to the rt-tools palette). */
export const RT_DEFAULT_SCHEME: string = 'default';
export const RT_COLOR_SCHEME_STORAGE_KEY: string = 'rt-color-scheme';
export const RT_SCHEME_ATTRIBUTE: string = 'data-rt-scheme';
