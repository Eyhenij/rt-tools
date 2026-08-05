import { ChangeDetectionStrategy, Component, TemplateRef } from '@angular/core';

import { RtTabDirective } from '../../rt-tab.directive';
import { IRtTabs } from '../../rt-tabs.model';
import { IRtIcon } from '../../../icon/rt-icon.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-tab',
    template: `
        <div
            rtTab
            [id]="id"
            [label]="label"
            [titleTemplate]="titleTemplate"
            [icon]="icon"
            [iconColor]="iconColor"
            [badge]="badge"
            [disabled]="disabled"
            [hidden]="hidden"
            [invalid]="invalid"
            [invalidMessage]="invalidMessage"></div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTabDirective,
    ],
})
export class TestRtTabComponent {
    public id: IRtTabs.Id = '';
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
