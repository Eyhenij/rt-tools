export * from './side-menu.types';
export {
    clampSubMenuWidth,
    readSubMenuMode,
    readSubMenuWidth,
    splitSubMenuTitle,
    SUB_MENU_MODE_KEY,
    SUB_MENU_WIDTH_KEY,
    SUB_MENU_WIDTH_MAX,
    SUB_MENU_WIDTH_MIN,
    writeSubMenuMode,
    writeSubMenuWidth,
} from './side-menu.logic';
export type { ISubMenuTitlePart } from './side-menu.logic';
export { RtuiSideMenuComponent, RtuiSideMenuFooterDirective, RtuiSideMenuHeaderDirective } from './menu/rtui-side-menu.component';
export { DEFAULT_MENU_ID, SIDE_MENU_SETTINGS_KEY } from './settings/side-menu-settings.logic';
export type { TSideMenuSettingsRecord } from './settings/side-menu-settings.logic';
export {
    provideRtuiSideMenuSettings,
    RTUI_SIDE_MENU_SETTINGS_CONFIG,
    RtuiSideMenuSettingsService,
} from './settings/rtui-side-menu-settings.service';
export type { IRtuiSideMenuSettingsConfig, IRtuiSideMenuFavoritesLabels } from './settings/rtui-side-menu-settings.service';
