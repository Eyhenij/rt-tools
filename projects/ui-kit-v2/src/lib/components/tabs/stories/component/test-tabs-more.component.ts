import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';

import { RtMenuItemComponent } from '../../../menu/rt-menu-item.component';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtTabDirective } from '../../rt-tab.directive';
import { RtTabsComponent } from '../../rt-tabs.component';
import { IRtTabs } from '../../rt-tabs.model';

/** Какую матрицу режима «Ещё» рисовать: у каждой оси своя история. */
export type TTabsMorePart = 'widths' | 'dense' | 'states' | 'closable' | 'long' | 'themes';

const SECTIONS: readonly string[] = ['Главная', 'Все заявки', 'Календарь', 'Контакты', 'Отзывы', 'Смены', 'Все счета', 'Транзакции'];

const LONG_SECTIONS: readonly string[] = [
    ...SECTIONS,
    'Акты сверки',
    'Отчёт по загрузке',
    'Сверка кассы',
    'Склад',
    'Поставщики',
    'Номера',
    'Журнал',
    'Шаблоны',
    'Настройки',
];

/**
 * Режим вкладок «Ещё»: ширины, плотная полоса, все виды строки меню, крестик и закреплённая вкладка,
 * длинное меню, темы. Вкладку закрывает и выбирает сам показ: набор держит потребитель.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-tabs-more',
    template: `
        @switch (part) {
            @case ('widths') {
                <app-story-presets caption="Ширины: всё встаёт, часть в меню, только выбранная и «Ещё»">
                    <ng-template>
                        <div style="display: flex; flex-direction: column; gap: 24px">
                            @for (width of widths; track width) {
                                <div [style.width.px]="width">
                                    <rt-tabs overflow="more" headerOnly activeId="Главная">
                                        @for (section of sections; track section) {
                                            <ng-template [rtTab]="section" [label]="section" />
                                        }
                                    </rt-tabs>
                                </div>
                            }
                            <div style="width: 320px">
                                <rt-tabs overflow="more" headerOnly activeId="Транзакции">
                                    @for (section of sections; track section) {
                                        <ng-template [rtTab]="section" [label]="section" />
                                    }
                                </rt-tabs>
                            </div>
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('dense') {
                <app-story-presets caption="Плотная полоса">
                    <ng-template>
                        <div style="width: 480px">
                            <rt-tabs overflow="more" headerOnly dense activeId="Главная">
                                @for (section of sections; track section) {
                                    <ng-template [rtTab]="section" [label]="section" />
                                }
                            </rt-tabs>
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('states') {
                <app-story-presets caption="Строки меню: значок, метка, ошибка, отключённая; на «Ещё» точка">
                    <ng-template>
                        <div style="width: 320px">
                            <rt-tabs overflow="more" headerOnly activeId="a">
                                <ng-template rtTab="a" label="Главная" />
                                <ng-template rtTab="b" label="Обычная" />
                                <ng-template rtTab="c" label="Со значком" icon="file" />
                                <ng-template rtTab="d" label="С меткой" [badge]="3" />
                                <ng-template rtTab="e" label="С ошибкой" invalid />
                                <ng-template rtTab="f" label="Отключённая" disabled />
                            </rt-tabs>
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('closable') {
                <app-story-presets caption="Крестик в ряду и в меню, закреплённая стоит первой">
                    <ng-template>
                        <div style="width: 420px">
                            <rt-tabs
                                overflow="more"
                                headerOnly
                                [activeId]="active()"
                                (activeIdChange)="active.set($event)"
                                (tabClose)="closeTab($event)">
                                <ng-template rtTab="pin" label="Закреплённая" pinned />
                                @for (section of open(); track section) {
                                    <ng-template closable [rtTab]="section" [label]="section" [contextMenu]="tabMenu" />
                                }
                            </rt-tabs>
                            <ng-template #tabMenu let-id>
                                <rt-menu-item label="Закрепить" icon="pin" />
                                <rt-menu-item label="Закрыть" icon="close" (selected)="closeTab(id)" />
                            </ng-template>
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('long') {
                <app-story-presets caption="Больше восьми строк: меню прокручивается внутри">
                    <ng-template>
                        <div style="width: 480px">
                            <rt-tabs overflow="more" headerOnly activeId="Главная">
                                @for (section of longSections; track section) {
                                    <ng-template [rtTab]="section" [label]="section" />
                                }
                            </rt-tabs>
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Режим «Ещё» в обеих темах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                <div style="width: 320px">
                                    <rt-tabs overflow="more" headerOnly activeId="a">
                                        <ng-template rtTab="a" label="Главная" />
                                        <ng-template rtTab="b" label="Обычная" />
                                        <ng-template rtTab="c" label="С ошибкой" invalid />
                                        <ng-template rtTab="d" label="Отключённая" disabled />
                                    </rt-tabs>
                                </div>
                            </ng-template>
                        </app-story-themes>
                    </ng-template>
                </app-story-presets>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtMenuItemComponent, RtTabsComponent, RtTabDirective, StoryPresetsComponent, StoryThemesComponent],
})
export class TestRtTabsMoreComponent {
    protected readonly sections: readonly string[] = SECTIONS;

    protected readonly longSections: readonly string[] = LONG_SECTIONS;

    protected readonly widths: readonly number[] = [880, 640];

    protected readonly open: WritableSignal<readonly string[]> = signal<readonly string[]>(SECTIONS);

    protected readonly active: WritableSignal<IRtTabs.Id> = signal<IRtTabs.Id>('pin');

    public part: TTabsMorePart = 'widths';

    protected closeTab(id: IRtTabs.Id): void {
        this.open.update((list: readonly string[]): readonly string[] => list.filter((section: string): boolean => section !== id));
    }
}
