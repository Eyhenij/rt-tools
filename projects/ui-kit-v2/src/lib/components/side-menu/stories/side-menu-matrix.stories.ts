import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../showcase/story-states';
import {
    SIDE_MENU_MATRIX_FAVORITES,
    SIDE_MENU_MATRIX_FAVORITES_COLLAPSED,
    SIDE_MENU_MATRIX_FAVORITES_OPEN,
    sideMenuFavoritesStoryProviders,
} from './component/side-menu-favorites-story-data';
import { TestRtSideMenuMatrixComponent } from './component/test-side-menu-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу. Контролов нет
 * намеренно: состояние, до которого надо доехать переключателем, при беглом просмотре неотличимо
 * от отсутствующего.
 */
export default {
    title: 'Organisms/Navigation/SideMenu',
    component: TestRtSideMenuMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtSideMenuMatrixComponent>;

type TStory = StoryObj<TestRtSideMenuMatrixComponent>;

const RAIL_STATES: Readonly<Record<string, string>> = storyPseudoParameters('.rt-side-menu__rail-item');
const ROW_STATES: Readonly<Record<string, string>> = storyPseudoParameters('.rt-side-menu-sub-item__row');

export const Modes: TStory = { args: { part: 'modes' } };

export const Search: TStory = { args: { part: 'search' } };

export const Folders: TStory = { args: { part: 'folders' } };

/**
 * Избранное в обоих наборах — пара к живым историям избранного, которые повторяют страницы первого
 * кита во весь экран. Список ячеек живёт под своим ключом хранилища витрины.
 */
export const Favorites: TStory = {
    args: { part: 'favorites' },
    decorators: [
        applicationConfig({
            providers: sideMenuFavoritesStoryProviders({ storageKey: 'rt-showcase-side-menu-matrix-favorites' }, [
                { id: SIDE_MENU_MATRIX_FAVORITES_OPEN, favorites: SIDE_MENU_MATRIX_FAVORITES },
                { id: SIDE_MENU_MATRIX_FAVORITES_COLLAPSED, collapsed: true, favorites: SIDE_MENU_MATRIX_FAVORITES },
            ]),
        }),
    ],
};

/**
 * Наведение и фокус стилизованы у пункта полосы и у строки подменю, а не у хоста меню: аддон
 * псевдосостояний получает спуск до обоих, и признак ячейки встаёт на все её пункты и строки.
 */
export const States: TStory = {
    args: { part: 'states' },
    parameters: {
        pseudo: Object.fromEntries(
            Object.keys(RAIL_STATES).map((state: string): [string, string[]] => [state, [RAIL_STATES[state], ROW_STATES[state]]])
        ),
    },
};

export const Narrow: TStory = { args: { part: 'narrow' } };

export const Edges: TStory = { args: { part: 'edges' } };

export const Presets: TStory = { args: { part: 'presets' } };

/**
 * Меню под схемой цвета — бирюзовой схемой витрины на `<html>`, в обоих наборах: активный пункт,
 * подложка строки и звезда берут цвет схемы. Схема отвечает только на корне страницы, поэтому меню
 * без схемы стоит рядом в истории `Presets`, а не в этом же кадре.
 */
export const Scheme: TStory = { args: { part: 'presets' }, globals: { scheme: 'teal' } };

export const Themes: TStory = { args: { part: 'themes' } };
