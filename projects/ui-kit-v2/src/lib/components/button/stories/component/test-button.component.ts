import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtButtonDirective } from '../../rt-button.directive';
import { IButton } from '../../rt-button.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-button',
    template: `
        <!-- Подпись рисует директива через Renderer2, поэтому разметка пуста;
             статическая метка нужна проверке содержимого элемента. -->
        <button
            rtButton
            aria-label="Кнопка витрины"
            [label]="label"
            [icon]="icon"
            [iconPos]="iconPos"
            [theme]="theme"
            [appearance]="appearance"
            [size]="size"
            [rounded]="rounded"
            [loading]="loading"
            [loadingIcon]="loadingIcon"></button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtButtonDirective,
    ],
})
export class TestRtButtonComponent {
    public label: string | null = 'Сохранить';
    public icon: string | null = null;
    public iconPos: IButton.IconPos = 'left';
    public theme: IButton.Theme = 'primary';
    public appearance: IButton.Appearance = 'filled';
    public size: IButton.Size = 'md';
    public rounded: boolean = false;
    public loading: boolean = false;
    public loadingIcon: string | null = null;
}
