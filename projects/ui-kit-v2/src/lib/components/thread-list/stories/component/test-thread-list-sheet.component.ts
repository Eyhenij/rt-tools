import { ChangeDetectionStrategy, Component } from '@angular/core';

import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { RtThreadListComponent } from '../../rt-thread-list.component';
import { RtThreadListFiltersDirective, RtThreadListRowDirective } from '../../rt-thread-list.directives';
import { IRtThreadList } from '../../rt-thread-list.model';

/** Строка списка витрины: подпись и последняя реплика. */
interface ISheetRow extends IRtThreadList.Row {
    readonly title: string;
    readonly meta: string;
}

/**
 * Список бесед в рамке телефона. Рамка шириной 375 даёт экран эскиза: панель фильтров, которую
 * открывает кнопка рядом с поиском, встаёт нижней шторкой с заголовком «Фильтры». Узкий ответ даёт
 * история подменой службы точек перехода — с первой отрисовки, а не после смены окна.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-thread-list-sheet',
    template: `
        <div
            style="box-sizing: border-box; display: flex; flex-direction: column; inline-size: 375px; height: 640px"
            [attr.data-story-trigger]="triggerAttribute">
            <rt-thread-list searchPlaceholder="Поиск" [rows]="rows" [activeId]="2" [sheet]="sheet">
                <ng-template rtThreadListFilters>
                    <div style="display: grid; gap: 0.5rem">
                        <strong>Канал</strong>
                        <span>Сайт</span>
                        <span>Телефон</span>
                        <span>Почта</span>
                    </div>
                </ng-template>
                <ng-template rtThreadListRow let-row>
                    <div style="display: grid; gap: 0.125rem; min-inline-size: 0">
                        <strong>{{ row.title }}</strong>
                        <span style="color: var(--rt-color-text-muted); font-size: var(--rt-text-sm)">{{ row.meta }}</span>
                    </div>
                </ng-template>
            </rt-thread-list>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtThreadListComponent,
        RtThreadListFiltersDirective,
        RtThreadListRowDirective,
    ],
})
export class TestRtThreadListSheetComponent {
    public readonly rows: readonly ISheetRow[] = [
        { id: 3, hasUnread: true, title: '№3 Анна Смирнова', meta: 'Подскажите, есть ли свободные номера?' },
        { id: 2, hasUnread: false, title: '№2 Игорь Петров', meta: 'Спасибо, приедем в пятницу' },
        { id: 1, hasUnread: false, title: '№1 Ольга Кузнецова', meta: 'Трансфер из аэропорта' },
    ];

    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;

    public sheet: boolean = true;
}
