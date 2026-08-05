import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtAsideHeaderComponent } from '../../rt-aside-header.component';
import { IRtAsideHeader } from '../../rt-aside-header.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-aside-header',
    template: `
        <rt-aside-header [title]="title" [overline]="overline" [badges]="badges" [closable]="closable" [loading]="loading" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtAsideHeaderComponent,
    ],
})
export class TestRtAsideHeaderComponent {
    public title: string | null = 'Заголовок';
    public overline: string | null = null;
    public badges: readonly IRtAsideHeader.Badge[] = [];
    public closable: boolean = true;
    public loading: boolean = false;
}
