import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { IRtSideMenu } from '../../rt-side-menu.model';
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
 * Значки пунктов взяты из тех, у которых есть рисунок Material: под материальным набором меню
 * рисует их залитыми, как первый кит. Значок без такого рисунка остаётся своим, контурным, и
 * полоса выходила разнобойной — шестерёнка залитая, соседи тонкие.
 */
export const SIDE_MENU_ITEMS: readonly IRtSideMenu.Item[] = [
    { id: 'home', icon: 'cog', name: 'Настройки', link: '/home' },
    {
        id: 'reports',
        icon: 'table',
        name: 'Отчёты',
        submenu: [
            { id: 'sales', icon: 'tag', name: 'Продажи', link: '/reports/sales' },
            {
                id: 'finance',
                icon: 'bars',
                name: 'Финансы',
                submenu: [
                    { id: 'revenue', name: 'Выручка', link: '/reports/finance/revenue' },
                    { id: 'costs', name: 'Расходы', link: '/reports/finance/costs' },
                ],
            },
            {
                id: 'stock',
                icon: 'info-circle',
                name: 'Остатки на складах',
                link: '/reports/stock',
                iconButton: { icon: 'ico-plus', data: 'new' },
            },
        ],
    },
    { id: 'people', icon: 'user', name: 'Сотрудники', link: '/people' },
];

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

    public readonly items: readonly IRtSideMenu.Item[] = SIDE_MENU_ITEMS;
    public readonly states: readonly IStoryState[] = STORY_STATES;

    public readonly modes: readonly ISideMenuCase[] = [
        { name: 'подменю закрыто', activeIds: ['home'] },
        { name: 'наведение: подменю над страницей', activeIds: ['reports', 'sales'], openId: 'reports' },
        { name: 'закреплено: подменю в потоке', activeIds: ['reports', 'sales'], mode: 'pinned' },
        { name: 'закреплено, ширина 320', activeIds: ['reports', 'sales'], mode: 'pinned', width: 320 },
    ];

    public readonly searches: readonly ISideMenuCase[] = [
        { name: 'совпадение в папке', openId: 'reports', query: 'рас' },
        { name: 'совпадение в двух строках', openId: 'reports', query: 'о' },
        { name: 'ничего не найдено', openId: 'reports', query: 'зарплата' },
    ];

    public readonly folders: readonly ISideMenuCase[] = [
        { name: 'папка свёрнута', openId: 'reports' },
        { name: 'папка раскрыта адресом', activeIds: ['reports', 'finance', 'costs'], mode: 'pinned' },
    ];

    public readonly narrows: readonly ISideMenuCase[] = [
        { name: 'главные пункты', activeIds: ['home'], slots: true },
        { name: 'подменю раздела', activeIds: ['reports', 'sales'], openId: 'reports' },
    ];

    public readonly edges: readonly ISideMenuCase[] = [
        { name: 'пустой набор', items: [] },
        { name: 'шапка и подвал', activeIds: ['home'], slots: true },
        {
            name: 'длинные подписи',
            items: [
                {
                    id: 'long',
                    icon: 'ico-settings',
                    name: 'Настройки уведомлений',
                    submenu: [{ id: 'long-row', name: 'Рассылки клиентам по расписанию и по событиям', link: '/long' }],
                },
            ],
            activeIds: ['long'],
            mode: 'pinned',
        },
    ];

    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;
    public readonly caseLabel: (value: ISideMenuCase) => string = (value: ISideMenuCase): string => value.name;
}
