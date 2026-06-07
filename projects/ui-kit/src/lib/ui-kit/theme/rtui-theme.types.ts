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
