import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtRadioButtonComponent } from '../../rt-radio-button.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое Storybook вешает
 * контролы. Входы кита сигнальные и извне не пишутся — поэтому история целится сюда, а не в сам
 * компонент. Выбор держит сама обёртка: вход `checked` и выход `checkedChange`. В пакет не уезжает.
 */
@Component({
    selector: 'app-radio-button',
    templateUrl: './test-radio-button.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtRadioButtonComponent,
    ],
})
export class TestRtRadioButtonComponent {
    public checked: boolean = false;
    public disabled: boolean = false;
    public card: boolean = false;
    public label: string = 'Москва';
    public description: string = '';
    public ariaLabel: string | null = null;
}
