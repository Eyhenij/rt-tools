import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IRtIcon } from '../../../icon/rt-icon.model';
import {
    PLACEHOLDER_MARK_BARS,
    PLACEHOLDER_MARK_BLOCK,
    PLACEHOLDER_MARK_TRIANGLE,
} from '../../../service-logo/stories/component/story-placeholder-marks';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtToggleButtonGroupComponent } from '../../../toggle-button-group/rt-toggle-button-group.component';
import { IRtToggleButtonGroup } from '../../../toggle-button-group/rt-toggle-button-group.model';
import { RtThreadListComponent } from '../../rt-thread-list.component';
import { RtThreadListFiltersDirective, RtThreadListRowDirective, RtThreadListTabsDirective } from '../../rt-thread-list.directives';
import { IRtThreadList } from '../../rt-thread-list.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TThreadListMatrixPart = 'rowState' | 'sign' | 'tabs' | 'loading' | 'more' | 'empty' | 'presets' | 'themes';

/** Строка списка витрины: к обязательным полям добавлены подпись и приписка. */
interface IThreadRow extends IRtThreadList.Row {
    readonly title: string;
    readonly meta: string;
}

const PEOPLE_ICONS: readonly IRtIcon.Name[] = ['user', 'users', 'user'];

const ROWS: readonly IThreadRow[] = [
    { id: 1, hasUnread: true, title: 'Договор №2024-118', meta: 'Иванов И. И. · 16:02' },
    { id: 2, hasUnread: false, title: 'Договор №2024-119', meta: 'Петрова А. С. · вчера' },
    { id: 3, hasUnread: false, overdue: true, title: 'Договор №2024-120', meta: 'Сидоров П. П. · 12 марта' },
    { id: 4, hasUnread: true, overdue: true, title: 'Договор №2024-121', meta: 'Кузнецова М. В. · 10 марта' },
];

/** Строки со знаком канала: знаки компаний — заглушки витрины, сайт — значок кита. */
const SIGNED_ROWS: readonly IThreadRow[] = [
    { id: 1, hasUnread: true, title: 'Анна Смирнова', meta: 'Можно заехать на час раньше?', sign: PLACEHOLDER_MARK_BLOCK },
    { id: 2, hasUnread: false, title: 'John Carter', meta: 'Is parking available?', sign: PLACEHOLDER_MARK_BARS },
    { id: 3, hasUnread: false, overdue: true, title: 'Somchai P.', meta: 'Thank you, see you tomorrow', sign: PLACEHOLDER_MARK_TRIANGLE },
    { id: 4, hasUnread: false, title: 'Мария Иванова', meta: 'Заявка с сайта', sign: { icon: 'globe', label: 'Сайт' } },
    { id: 5, hasUnread: false, title: 'Олег Петров', meta: 'Строка без знака стоит рядом для сравнения' },
];

/**
 * Матрицы состояний `rt-thread-list` для витрины.
 *
 * Состояние строки — непрочитанное, просроченное, выбранное — показывается **одним списком, где
 * стоят все виды сразу**: порознь их не сравнить, а выбранная читается только рядом с
 * невыбранными.
 *
 * **`loading` подменяет строки заглушками только при пустом списке**; загрузка поверх уже
 * показанных строк их не трогает — иначе список мигал бы при каждой смене фильтра. Оба случая
 * поэтому стоят рядом.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-thread-list-matrix',
    template: `
        @switch (part) {
            @case ('rowState') {
                <app-story-presets caption="Состояние строки в обоих наборах">
                    <ng-template>
                        <div style="width: 22rem; height: 22rem">
                            <rt-thread-list searchPlaceholder="Поиск" [rows]="rows" [activeId]="2">
                                <ng-template rtThreadListRow let-row>
                                    <div style="display: grid; gap: 0.125rem">
                                        <strong>{{ row.title }}</strong>
                                        <span style="color: var(--rt-color-text-muted); font-size: var(--rt-text-sm)">{{ row.meta }}</span>
                                    </div>
                                </ng-template>
                            </rt-thread-list>
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('sign') {
                <app-story-presets caption="Знак канала в строке в обоих наборах и обеих темах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                <div style="width: 22rem; height: 24rem">
                                    <rt-thread-list searchPlaceholder="Поиск" [rows]="signedRows" [activeId]="2">
                                        <ng-template rtThreadListRow let-row>
                                            <div style="display: grid; gap: 0.125rem; min-inline-size: 0">
                                                <strong>{{ row.title }}</strong>
                                                <span style="color: var(--rt-color-text-muted); font-size: var(--rt-text-sm)">
                                                    {{ row.meta }}
                                                </span>
                                            </div>
                                        </ng-template>
                                    </rt-thread-list>
                                </div>
                            </ng-template>
                        </app-story-themes>
                    </ng-template>
                </app-story-presets>
            }

            @case ('tabs') {
                <app-story-presets caption="Полоса вкладок под поиском в обоих наборах и обеих темах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                <div style="width: 22rem; height: 24rem">
                                    <rt-thread-list searchPlaceholder="Поиск" [rows]="signedRows" [activeId]="1">
                                        <ng-template rtThreadListFilters>
                                            <span>Канал</span>
                                        </ng-template>
                                        <ng-template rtThreadListTabs>
                                            <rt-toggle-button-group
                                                fullWidth
                                                ariaLabel="Вкладки списка"
                                                value="all"
                                                [options]="tabOptions" />
                                        </ng-template>
                                        <ng-template rtThreadListRow let-row>
                                            <div style="display: grid; gap: 0.125rem; min-inline-size: 0">
                                                <strong>{{ row.title }}</strong>
                                                <span style="color: var(--rt-color-text-muted); font-size: var(--rt-text-sm)">
                                                    {{ row.meta }}
                                                </span>
                                            </div>
                                        </ng-template>
                                    </rt-thread-list>
                                </div>
                            </ng-template>
                        </app-story-themes>
                    </ng-template>
                </app-story-presets>
            }

            @case ('loading') {
                <app-story-presets caption="Загрузка и догрузка в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="20rem" [items]="loadingCases" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <div style="height: 20rem">
                                    <rt-thread-list
                                        searchPlaceholder="Поиск"
                                        [rows]="item.empty ? none : rows"
                                        [loading]="item.loading"
                                        [fetching]="item.fetching">
                                        <ng-template rtThreadListRow let-row>
                                            <div style="display: grid; gap: 0.125rem">
                                                <strong>{{ row.title }}</strong>
                                                <span style="color: var(--rt-color-text-muted); font-size: var(--rt-text-sm)">
                                                    {{ row.meta }}
                                                </span>
                                            </div>
                                        </ng-template>
                                    </rt-thread-list>
                                </div>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('more') {
                <app-story-presets caption="Догрузка по требованию в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="20rem" [items]="moreCases" [itemLabel]="moreLabel">
                            <ng-template let-value>
                                <div style="height: 20rem">
                                    <rt-thread-list searchPlaceholder="Поиск" [rows]="rows" [hasMore]="value">
                                        <ng-template rtThreadListRow let-row>
                                            <strong>{{ row.title }}</strong>
                                        </ng-template>
                                    </rt-thread-list>
                                </div>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('empty') {
                <app-story-presets caption="Пустой список в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="20rem" [items]="emptyCases" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <div style="height: 20rem">
                                    <rt-thread-list
                                        searchPlaceholder="Поиск"
                                        [rows]="none"
                                        [emptyText]="item.text"
                                        [emptyPreviewIcons]="item.icons"
                                        [filtersActive]="item.filters">
                                        <ng-template rtThreadListRow let-row>
                                            <strong>{{ row.title }}</strong>
                                        </ng-template>
                                    </rt-thread-list>
                                </div>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Список в обоих наборах">
                    <ng-template>
                        <div style="width: 20rem; height: 20rem">
                            <rt-thread-list searchPlaceholder="Поиск" [rows]="rows" [activeId]="2">
                                <ng-template rtThreadListRow let-row>
                                    <div style="display: grid; gap: 0.125rem">
                                        <strong>{{ row.title }}</strong>
                                        <span style="color: var(--rt-color-text-muted); font-size: var(--rt-text-sm)">
                                            {{ row.meta }}
                                        </span>
                                    </div>
                                </ng-template>
                            </rt-thread-list>
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Список в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                <div style="width: 20rem; height: 20rem">
                                    <rt-thread-list searchPlaceholder="Поиск" [rows]="rows" [activeId]="2">
                                        <ng-template rtThreadListRow let-row>
                                            <div style="display: grid; gap: 0.125rem">
                                                <strong>{{ row.title }}</strong>
                                                <span style="color: var(--rt-color-text-muted); font-size: var(--rt-text-sm)">
                                                    {{ row.meta }}
                                                </span>
                                            </div>
                                        </ng-template>
                                    </rt-thread-list>
                                </div>
                            </ng-template>
                        </app-story-themes>
                    </ng-template>
                </app-story-presets>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtThreadListComponent,

        RtToggleButtonGroupComponent,

        // directives
        RtThreadListFiltersDirective,
        RtThreadListRowDirective,
        RtThreadListTabsDirective,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtThreadListMatrixComponent {
    public part: TThreadListMatrixPart = 'rowState';

    public readonly rows: readonly IThreadRow[] = ROWS;
    public readonly signedRows: readonly IThreadRow[] = SIGNED_ROWS;
    public readonly tabOptions: ReadonlyArray<IRtToggleButtonGroup.Option<string>> = [
        { value: 'all', label: 'Все' },
        { value: 'waiting', label: 'Ждут ответа' },
        { value: 'archive', label: 'Архив' },
    ];
    public readonly none: readonly IThreadRow[] = [];

    public readonly loadingCases: readonly { name: string; loading: boolean; fetching: boolean; empty: boolean }[] = [
        { name: 'строки на месте', loading: false, fetching: false, empty: false },
        { name: 'пустой список грузится — заглушки', loading: true, fetching: false, empty: true },
        { name: 'загрузка поверх строк — не трогает', loading: true, fetching: false, empty: false },
        { name: 'догрузка', loading: false, fetching: true, empty: false },
    ];

    public readonly moreCases: readonly boolean[] = [false, true];

    /** Пустой от фильтров и пустой сам по себе — разные сообщения. */
    public readonly emptyCases: readonly { name: string; text: string; filters: boolean; icons: readonly IRtIcon.Name[] }[] = [
        { name: 'переведённый текст', text: '', filters: false, icons: PEOPLE_ICONS },
        { name: 'свой текст', text: 'Переписок пока нет', filters: false, icons: PEOPLE_ICONS },
        { name: 'ничего не нашлось по фильтрам', text: '', filters: true, icons: PEOPLE_ICONS },
        { name: 'свои значки строк-превью', text: '', filters: false, icons: ['sparkle', 'bot', 'sparkle'] },
    ];

    public readonly caseLabel: (value: { name: string }) => string = (value: { name: string }): string => value.name;

    public readonly moreLabel: (value: boolean) => string = (value: boolean): string =>
        value ? 'есть ещё — кнопка догрузки' : 'список кончился';
}
