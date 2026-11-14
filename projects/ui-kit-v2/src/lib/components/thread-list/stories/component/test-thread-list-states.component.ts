import { ChangeDetectionStrategy, Component } from '@angular/core';

import {
    PLACEHOLDER_MARK_BARS,
    PLACEHOLDER_MARK_BLOCK,
    PLACEHOLDER_MARK_TRIANGLE,
} from '../../../service-logo/stories/component/story-placeholder-marks';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { RtToggleButtonGroupComponent } from '../../../toggle-button-group/rt-toggle-button-group.component';
import { IRtToggleButtonGroup } from '../../../toggle-button-group/rt-toggle-button-group.model';
import { RtThreadListComponent } from '../../rt-thread-list.component';
import {
    RtThreadListEmptyDirective,
    RtThreadListErrorDirective,
    RtThreadListFiltersDirective,
    RtThreadListRowDirective,
    RtThreadListTabsDirective,
} from '../../rt-thread-list.directives';
import { IRtThreadList } from '../../rt-thread-list.model';

/** Строка списка витрины: подпись, последняя реплика и время. */
interface IStateRow extends IRtThreadList.Row {
    readonly title: string;
    readonly meta: string;
    readonly time: string;
}

/** Случай заглушки: какие входы и какой свой шаблон получает список. */
interface IStateCase {
    readonly name: string;
    readonly rows: readonly IStateRow[];
    readonly loading: boolean;
    readonly error: string | null;
    readonly search: string;
    readonly ownEmpty: boolean;
    readonly ownError: boolean;
}

const ROWS: readonly IStateRow[] = [
    { id: 12, hasUnread: false, title: '№12 Анна Смирнова', meta: 'Спасибо, отлично!', time: '13:05', sign: PLACEHOLDER_MARK_BLOCK },
    { id: 11, hasUnread: true, title: '№11 Kim Minjun', meta: 'Подогревается ли бассейн?', time: '12:52', sign: PLACEHOLDER_MARK_BARS },
    {
        id: 10,
        hasUnread: false,
        title: '№10 Thomas Weber',
        meta: 'Спасибо, приедем в пятницу',
        time: '12:40',
        sign: PLACEHOLDER_MARK_TRIANGLE,
    },
    {
        id: 9,
        hasUnread: false,
        title: '№9 Ольга Петрова',
        meta: 'Трансфер из аэропорта',
        time: 'Вчера',
        sign: { icon: 'globe', label: 'Сайт' },
    },
];

const CASES: readonly IStateCase[] = [
    { name: 'Загрузка, строк нет: скелет', rows: [], loading: true, error: null, search: '', ownEmpty: false, ownError: false },
    { name: 'Пусто, поиска и фильтров нет', rows: [], loading: false, error: null, search: '', ownEmpty: false, ownError: false },
    { name: 'Ничего не найдено по поиску', rows: [], loading: false, error: null, search: 'Петров', ownEmpty: false, ownError: false },
    { name: 'Ошибка загрузки', rows: [], loading: true, error: '', search: '', ownEmpty: false, ownError: false },
    { name: 'Ошибка догрузки: строки на месте', rows: ROWS, loading: false, error: '', search: '', ownEmpty: false, ownError: false },
    { name: 'Свой шаблон пустого', rows: [], loading: false, error: null, search: '', ownEmpty: true, ownError: false },
    { name: 'Свой шаблон ошибки', rows: [], loading: false, error: 'Нет сети', search: '', ownEmpty: false, ownError: true },
];

/**
 * Ошибка загрузки и заглушки `rt-thread-list` в виде мессенджера — по одобренному кадру, в его
 * порядке: загрузка, пусто, ничего не найдено, ошибка, ошибка догрузки, свои шаблоны.
 *
 * Поиск третьей ячейки вводит шаг `play` истории: список узнаёт о поиске только из своего поля,
 * а заранее подставить строку в него нечем.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-thread-list-states',
    template: `
        <app-story-presets caption="Ошибка и заглушки в обоих наборах">
            <ng-template>
                <app-story-row slotWidth="339px" [items]="cases" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <div
                            style="box-sizing: border-box; display: flex; flex-direction: column; inline-size: 100%; height: 480px; border: 1px solid var(--rt-color-border-default); border-radius: var(--rt-radius-lg); background: var(--rt-color-bg-surface)"
                            [attr.data-story-search]="item.search || null">
                            <rt-thread-list
                                messenger
                                searchPlaceholder="Поиск"
                                [rows]="item.rows"
                                [loading]="item.loading"
                                [error]="item.error">
                                <ng-template rtThreadListFilters>
                                    <span>Канал</span>
                                </ng-template>
                                <ng-template rtThreadListTabs>
                                    <rt-toggle-button-group
                                        fullWidth
                                        size="md"
                                        ariaLabel="Вкладки списка"
                                        value="all"
                                        [options]="tabOptions" />
                                </ng-template>
                                <ng-template rtThreadListRow let-row>
                                    <div style="display: grid; gap: 0.125rem; min-inline-size: 0">
                                        <strong>{{ row.title }}</strong>
                                        <span style="color: var(--rt-color-text-muted); font-size: var(--rt-text-sm)">{{ row.meta }}</span>
                                    </div>
                                </ng-template>
                                @if (item.ownEmpty) {
                                    <ng-template rtThreadListEmpty>
                                        <div [style]="slotStyle">
                                            <strong>Свой вид пустого списка</strong>
                                            <span [style]="slotHintStyle">Разметка приложения вместо rt-empty-state</span>
                                        </div>
                                    </ng-template>
                                }
                                @if (item.ownError) {
                                    <ng-template rtThreadListError>
                                        <div [style]="slotStyle">
                                            <strong>Свой вид ошибки</strong>
                                            <span [style]="slotHintStyle">В контексте шаблона: текст ошибки ($implicit) и retry()</span>
                                        </div>
                                    </ng-template>
                                }
                            </rt-thread-list>
                        </div>
                    </ng-template>
                </app-story-row>
            </ng-template>
        </app-story-presets>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtThreadListComponent,
        RtToggleButtonGroupComponent,

        // directives
        RtThreadListEmptyDirective,
        RtThreadListErrorDirective,
        RtThreadListFiltersDirective,
        RtThreadListRowDirective,
        RtThreadListTabsDirective,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
    ],
})
export class TestRtThreadListStatesComponent {
    public readonly cases: readonly IStateCase[] = CASES;

    public readonly tabOptions: ReadonlyArray<IRtToggleButtonGroup.Option<string>> = [
        { value: 'all', label: 'Все' },
        { value: 'waiting', label: 'Ждут ответа' },
        { value: 'archive', label: 'Архив' },
    ];

    /** Рамка своего шаблона: пунктир показывает, где кончается разметка приложения. */
    public readonly slotStyle: string =
        'display: grid; gap: var(--rt-space-2); margin: var(--rt-space-4) var(--rt-space-2); padding: var(--rt-space-4); border: 1px dashed var(--rt-color-border-strong); border-radius: var(--rt-radius-md); text-align: center';

    public readonly slotHintStyle: string = 'color: var(--rt-color-text-muted); font-size: var(--rt-text-sm)';

    public readonly caseLabel: (value: IStateCase) => string = (value: IStateCase): string => value.name;
}
