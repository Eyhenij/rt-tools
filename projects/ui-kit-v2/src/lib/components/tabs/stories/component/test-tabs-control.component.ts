import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { RtButtonDirective } from '../../../button/rt-button.directive';
import { RtTabDirective } from '../../rt-tab.directive';
import { RtTabsControlDirective } from '../../rt-tabs-control.directive';
import { RtTabsComponent } from '../../rt-tabs.component';
import { IRtTabs } from '../../rt-tabs.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 *
 * Дополнение полосы показывается внутри `rt-tabs`, а не само по себе: `rtTabsControl` просит
 * `TemplateRef`, то есть живёт только на `<ng-template>`, а рисует его полоса вкладок. Отдельно
 * стоящая директива не рисовала ничего и роняла историю отказом `NG0201`. Вкладка рядом нужна
 * затем, чтобы было видно, с какой стороны от полосы встало дополнение.
 */
@Component({
    selector: 'app-tabs-control',
    template: `
        <app-story-presets fill caption="Полоса вкладок в обоих наборах">
            <ng-template>
                <rt-tabs activeId="first">
                    <ng-template rtTab="first" label="Первая">Содержимое первой вкладки</ng-template>
                    <ng-template rtTab="second" label="Вторая">Содержимое второй вкладки</ng-template>

                    <ng-template [rtTabsControl]="side">
                        <button rtButton type="button" theme="secondary" size="sm">Добавить</button>
                    </ng-template>
                </rt-tabs>
            </ng-template>
        </app-story-presets>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTabsComponent,
        RtTabDirective,
        RtTabsControlDirective,
        RtButtonDirective,

        // showcase
        StoryPresetsComponent,
    ],
})
export class TestRtTabsControlComponent {
    public side: IRtTabs.ControlSide = 'right';
}
