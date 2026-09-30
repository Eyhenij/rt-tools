import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { IRtSideMenu } from '../../rt-side-menu.model';
import { SIDE_MENU_STORY_DEEP_ACTIVE, SIDE_MENU_STORY_ITEMS } from './side-menu-story-data';
import { TestRtSideMenuCellComponent } from './test-side-menu-cell.component';
import { TestRtSideMenuNarrowCellComponent } from './test-side-menu-narrow-cell.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TSideMenuMatrixPart = 'modes' | 'search' | 'folders' | 'states' | 'narrow' | 'edges' | 'presets' | 'themes';

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
