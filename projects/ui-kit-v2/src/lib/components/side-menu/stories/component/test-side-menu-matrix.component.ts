import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { IRtInput } from '../../../input/rt-input.model';
import { IRtSideMenu } from '../../rt-side-menu.model';
import {
    FAVORITES_STORY_ACTIVE,
    FAVORITES_STORY_ITEMS,
    FAVORITES_STORY_ITEMS_LONG,
    SIDE_MENU_MATRIX_FAVORITES_COLLAPSED,
    SIDE_MENU_MATRIX_FAVORITES_OPEN,
} from './side-menu-favorites-story-data';
import {
    SIDE_MENU_ICONS_STORY_ACTIVE,
    SIDE_MENU_ICONS_STORY_ITEMS,
    SIDE_MENU_STORY_DEEP_ACTIVE,
    SIDE_MENU_STORY_ITEMS,
} from './side-menu-story-data';
import { TestRtSideMenuCellComponent } from './test-side-menu-cell.component';
import { TestRtSideMenuNarrowCellComponent } from './test-side-menu-narrow-cell.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TSideMenuMatrixPart =
    'modes' | 'search' | 'folders' | 'favorites' | 'states' | 'narrow' | 'edges' | 'icons' | 'switches' | 'look' | 'presets' | 'themes';

/** Случай ячейки: подпись и то, до чего ячейка доводит меню. */
export interface ISideMenuCase {
    readonly name: string;
    readonly items?: readonly IRtSideMenu.Item[];
    readonly activeIds?: ReadonlyArray<string | number>;
    readonly mode?: IRtSideMenu.SubMenuMode;
    readonly width?: number | null;
    readonly openId?: string | number | null;
    readonly query?: string;
    readonly slots?: boolean;
    readonly menuId?: string;
    readonly favoritesCount?: IRtSideMenu.FavoritesCount;
    readonly ownIcon?: boolean;
    readonly pinShown?: boolean;
    readonly railTitlesShown?: boolean;
    readonly railIconFill?: boolean;
    readonly searchSize?: IRtInput.Size;
    readonly subItemIconFill?: boolean;
    readonly panelScrollHintShown?: boolean;
    readonly firstKitProps?: boolean;
}

/**
 * Матрицы состояний `rt-side-menu` для витрины. Каждая ячейка — меню в своей коробке: полоса,
 * а где нужно — открытая панель подменю.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-side-menu-matrix',
    templateUrl: './test-side-menu-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgTemplateOutlet,
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
        TestRtSideMenuCellComponent,
        TestRtSideMenuNarrowCellComponent,
    ],
})
export class TestRtSideMenuMatrixComponent {
    public part: TSideMenuMatrixPart = 'modes';

    public readonly items: readonly IRtSideMenu.Item[] = SIDE_MENU_STORY_ITEMS;
    public readonly states: readonly IStoryState[] = STORY_STATES;

    public readonly modes: readonly ISideMenuCase[] = [
        { name: 'подменю закрыто', activeIds: [12] },
        { name: 'наведение: подменю над страницей', activeIds: [1, 2], openId: 1 },
        { name: 'закреплено: подменю в потоке', activeIds: [1, 2], mode: 'pinned' },
        { name: 'закреплено, ширина 320', activeIds: [1, 2], mode: 'pinned', width: 320 },
    ];

    public readonly searches: readonly ISideMenuCase[] = [
        { name: 'совпадение в папке', openId: 24, query: 'level 2' },
        { name: 'совпадение в нескольких строках', openId: 1, query: 'l' },
        { name: 'ничего не найдено', openId: 1, query: 'no such item' },
    ];

    public readonly folders: readonly ISideMenuCase[] = [
        { name: 'папка свёрнута', openId: 24 },
        { name: 'папка раскрыта адресом', activeIds: SIDE_MENU_STORY_DEEP_ACTIVE, mode: 'pinned' },
    ];

    /** Избранное в закреплённом подменю «Content»: у раскрытого и свёрнутого блока свои номера меню. */
    public readonly favorites: readonly ISideMenuCase[] = [
        {
            name: 'блок раскрыт',
            items: FAVORITES_STORY_ITEMS,
            activeIds: FAVORITES_STORY_ACTIVE,
            mode: 'pinned',
            menuId: SIDE_MENU_MATRIX_FAVORITES_OPEN,
        },
        {
            name: 'блок свёрнут, число строк',
            items: FAVORITES_STORY_ITEMS,
            activeIds: FAVORITES_STORY_ACTIVE,
            mode: 'pinned',
            menuId: SIDE_MENU_MATRIX_FAVORITES_COLLAPSED,
        },
        {
            name: 'длинные подписи, число всегда',
            items: FAVORITES_STORY_ITEMS_LONG,
            activeIds: FAVORITES_STORY_ACTIVE,
            mode: 'pinned',
            menuId: SIDE_MENU_MATRIX_FAVORITES_OPEN,
            favoritesCount: 'always',
        },
    ];

    /** Имена Material первого кита как есть: без своего значка меню и с ним. */
    public readonly icons: readonly ISideMenuCase[] = [
        {
            name: 'имена Material, без своего значка',
            items: SIDE_MENU_ICONS_STORY_ITEMS,
            activeIds: SIDE_MENU_ICONS_STORY_ACTIVE,
            mode: 'pinned',
        },
        {
            name: 'со своим значком меню',
            items: SIDE_MENU_ICONS_STORY_ITEMS,
            activeIds: SIDE_MENU_ICONS_STORY_ACTIVE,
            mode: 'pinned',
            ownIcon: true,
        },
    ];

    /** Меню без кнопки закрепления: подменю над страницей и подменю, закреплённое входом. */
    public readonly switches: readonly ISideMenuCase[] = [
        { name: 'без закрепления: подменю над страницей', activeIds: [1, 2], openId: 1, pinShown: false },
        { name: 'без закрепления, закреплено входом', activeIds: [1, 2], mode: 'pinned', pinShown: false },
    ];

    /** Вид первого кита: без настроек, входами и входами со свойствами меню и строки. */
    public readonly looks: readonly ISideMenuCase[] = [
        { name: 'без настроек', activeIds: [1, 2], mode: 'pinned' },
        {
            name: 'без подписей, залитые значки, поиск md',
            activeIds: [1, 2],
            mode: 'pinned',
            railTitlesShown: false,
            railIconFill: true,
            searchSize: 'md',
        },
        {
            name: 'и свойства первого кита, подсказка прокрутки',
            activeIds: [1, 2],
            mode: 'pinned',
            railTitlesShown: false,
            railIconFill: true,
            searchSize: 'md',
            panelScrollHintShown: true,
            firstKitProps: true,
        },
        {
            name: 'папки, значки строк и подсказка прокрутки',
            activeIds: [24, 25],
            mode: 'pinned',
            railTitlesShown: false,
            railIconFill: true,
            searchSize: 'md',
            subItemIconFill: true,
            panelScrollHintShown: true,
            firstKitProps: true,
        },
    ];

    public readonly narrows: readonly ISideMenuCase[] = [
        { name: 'главные пункты', activeIds: [12], slots: true },
        { name: 'подменю раздела', activeIds: [1, 2], openId: 1 },
    ];

    public readonly edges: readonly ISideMenuCase[] = [
        { name: 'пустой набор', items: [] },
        { name: 'шапка и подвал', activeIds: [12], slots: true },
        { name: 'длинные подписи', activeIds: SIDE_MENU_STORY_DEEP_ACTIVE, mode: 'pinned' },
    ];

    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;
    public readonly caseLabel: (value: ISideMenuCase) => string = (value: ISideMenuCase): string => value.name;
}
