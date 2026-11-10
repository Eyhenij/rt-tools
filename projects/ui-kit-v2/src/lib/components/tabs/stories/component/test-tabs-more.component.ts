import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';

import { RtMenuItemComponent } from '../../../menu/rt-menu-item.component';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtTabDirective } from '../../rt-tab.directive';
import { RtTabsComponent } from '../../rt-tabs.component';
import { IRtTabs } from '../../rt-tabs.model';

/** Какую матрицу режима «Ещё» рисовать: у каждой оси своя история. */
export type TTabsMorePart = 'widths' | 'limit' | 'dense' | 'states' | 'closable' | 'long' | 'themes';

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
    templateUrl: './test-tabs-more.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtMenuItemComponent, RtTabsComponent, RtTabDirective, StoryPresetsComponent, StoryThemesComponent],
})
export class TestRtTabsMoreComponent {
    protected readonly sections: readonly string[] = SECTIONS;

    protected readonly longSections: readonly string[] = LONG_SECTIONS;

    protected readonly widths: readonly number[] = [880, 640];

    protected readonly open: WritableSignal<readonly string[]> = signal<readonly string[]>(SECTIONS);

    protected readonly active: WritableSignal<IRtTabs.Id> = signal<IRtTabs.Id>('pin');

    /** Выбор полосы с лимитом: выбранная из меню встаёт на место последней в ряду. */
    protected readonly limitActive: WritableSignal<IRtTabs.Id> = signal<IRtTabs.Id>('Склад');

    public part: TTabsMorePart = 'widths';

    protected closeTab(id: IRtTabs.Id): void {
        this.open.update((list: readonly string[]): readonly string[] => list.filter((section: string): boolean => section !== id));
    }
}
