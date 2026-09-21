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
export { FAVORITES_KEY } from './favorites/favorites.logic';
export {
    provideRtuiSideMenuFavorites,
    RTUI_SIDE_MENU_FAVORITES_CONFIG,
    RtuiSideMenuFavoritesService,
} from './favorites/rtui-side-menu-favorites.service';
export type { IRtuiSideMenuFavoritesConfig, IRtuiSideMenuFavoritesLabels } from './favorites/rtui-side-menu-favorites.service';
