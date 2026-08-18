import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtThreadListComponent } from '../../rt-thread-list.component';
import { RtThreadListRowDirective } from '../../rt-thread-list.directives';
import { IRtThreadList } from '../../rt-thread-list.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TThreadListMatrixPart = 'rowState' | 'loading' | 'more' | 'empty' | 'themes';

/** Строка списка витрины: к обязательным полям добавлены подпись и приписка. */
interface IThreadRow extends IRtThreadList.Row {
    readonly title: string;
    readonly meta: string;
}

const ROWS: readonly IThreadRow[] = [
    { id: 1, hasUnread: true, title: 'Договор №2024-118', meta: 'Иванов И. И. · 16:02' },
    { id: 2, hasUnread: false, title: 'Договор №2024-119', meta: 'Петрова А. С. · вчера' },
    { id: 3, hasUnread: false, overdue: true, title: 'Договор №2024-120', meta: 'Сидоров П. П. · 12 марта' },
    { id: 4, hasUnread: true, overdue: true, title: 'Договор №2024-121', meta: 'Кузнецова М. В. · 10 марта' },
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
            }

            @case ('loading') {
                <app-story-row caption="Загрузка и догрузка" slotWidth="20rem" [items]="loadingCases" [itemLabel]="caseLabel">
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
            }

            @case ('more') {
                <app-story-row caption="Догрузка по требованию" slotWidth="20rem" [items]="moreCases" [itemLabel]="moreLabel">
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
            }

            @case ('empty') {
                <app-story-row caption="Пустой список" slotWidth="20rem" [items]="emptyCases" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <div style="height: 20rem">
                            <rt-thread-list searchPlaceholder="Поиск" [rows]="none" [emptyText]="item.text" [filtersActive]="item.filters">
                                <ng-template rtThreadListRow let-row>
                                    <strong>{{ row.title }}</strong>
                                </ng-template>
                            </rt-thread-list>
                        </div>
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Список в обеих темах">
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
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtThreadListComponent,

        // directives
        RtThreadListRowDirective,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtThreadListMatrixComponent {
    public part: TThreadListMatrixPart = 'rowState';

    public readonly rows: readonly IThreadRow[] = ROWS;
    public readonly none: readonly IThreadRow[] = [];

    public readonly loadingCases: readonly { name: string; loading: boolean; fetching: boolean; empty: boolean }[] = [
        { name: 'строки на месте', loading: false, fetching: false, empty: false },
        { name: 'пустой список грузится — заглушки', loading: true, fetching: false, empty: true },
        { name: 'загрузка поверх строк — не трогает', loading: true, fetching: false, empty: false },
        { name: 'догрузка', loading: false, fetching: true, empty: false },
    ];

    public readonly moreCases: readonly boolean[] = [false, true];

    /** Пустой от фильтров и пустой сам по себе — разные сообщения. */
    public readonly emptyCases: readonly { name: string; text: string; filters: boolean }[] = [
        { name: 'переведённый текст', text: '', filters: false },
        { name: 'свой текст', text: 'Переписок пока нет', filters: false },
        { name: 'ничего не нашлось по фильтрам', text: '', filters: true },
    ];

    public readonly caseLabel: (value: { name: string }) => string = (value: { name: string }): string => value.name;

    public readonly moreLabel: (value: boolean) => string = (value: boolean): string =>
        value ? 'есть ещё — кнопка догрузки' : 'список кончился';
}
