import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtTabDirective } from '../../rt-tab.directive';
import { RtTabsComponent } from '../../rt-tabs.component';
import { IRtTabs } from '../../rt-tabs.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 *
 * Вкладки объявлены здесь, а не значением истории: они приходят разметкой на `<ng-template>`,
 * и полоса без них рисует пустое место — такой показ покрытием не считается.
 */
@Component({
    selector: 'app-tabs',
    template: `
        <rt-tabs [activeId]="activeId" [direction]="direction" [stretch]="stretch" [contentScrollable]="contentScrollable">
            <ng-template rtTab="overview" label="Обзор">Сводка по договору</ng-template>
            <ng-template rtTab="members" label="Участники" [badge]="3">Список участников</ng-template>
            <ng-template rtTab="history" label="История" icon="ico-listing">Журнал изменений</ng-template>
        </rt-tabs>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTabsComponent,
        RtTabDirective,
    ],
})
export class TestRtTabsComponent {
    public activeId: IRtTabs.Id | null = null;
    public direction: IRtTabs.Direction = 'horizontal';
    public stretch: boolean = false;
    public contentScrollable: boolean = true;
}
