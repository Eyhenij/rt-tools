import { ChangeDetectionStrategy, Component, TemplateRef } from '@angular/core';

import { RtTabDirective } from '../../rt-tab.directive';
import { RtTabsComponent } from '../../rt-tabs.component';
import { IRtTabs } from '../../rt-tabs.model';
import { IRtIcon } from '../../../icon/rt-icon.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 *
 * Вкладка показывается внутри `rt-tabs`, а не сама по себе: `rtTab` просит `TemplateRef`, то
 * есть живёт только на `<ng-template>`, а рисует её полоса вкладок. Отдельно стоящая директива
 * не рисовала ничего и роняла историю отказом `NG0201`. Соседняя вкладка в полосе — ради того,
 * чтобы было видно, какая из двух выбрана.
 */
@Component({
    selector: 'app-tab',
    template: `
        <rt-tabs [activeId]="id">
            <ng-template
                [rtTab]="id"
                [label]="label"
                [titleTemplate]="titleTemplate"
                [icon]="icon"
                [iconColor]="iconColor"
                [badge]="badge"
                [disabled]="disabled"
                [hidden]="hidden"
                [invalid]="invalid"
                [invalidMessage]="invalidMessage">
                Содержимое вкладки
            </ng-template>

            <ng-template rtTab="second" label="Соседняя">Содержимое соседней вкладки</ng-template>
        </rt-tabs>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTabsComponent,
        RtTabDirective,
    ],
})
export class TestRtTabComponent {
    public id: IRtTabs.Id = 'first';
    public label: string = 'Сохранить';
    public titleTemplate: TemplateRef<unknown> | null = null;
    public icon: IRtIcon.Name | null = null;
    public iconColor: IRtTabs.TitleColor = 'current';
    public badge: string | number | null = null;
    public disabled: boolean = false;
    public hidden: boolean = false;
    public invalid: boolean = false;
    public invalidMessage: string = '';
}
