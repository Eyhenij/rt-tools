import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IRtIcon } from '../../../icon/rt-icon.model';
import { RtAutocompleteComponent } from '../../rt-autocomplete.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 *
 * Компонент обобщён по элементу списка; витрине довольно строки, поэтому
 * `displayWith` здесь возвращает само значение.
 */
@Component({
    selector: 'app-autocomplete',
    template: `
        <rt-autocomplete
            [suggestions]="suggestions"
            [displayWith]="displayWith"
            [placeholder]="placeholder"
            [minLength]="minLength"
            [iconLeft]="iconLeft"
            [openOnFocus]="openOnFocus" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtAutocompleteComponent,
    ],
})
export class TestRtAutocompleteComponent {
    public suggestions: ReadonlyArray<string> = ['Минск', 'Могилёв', 'Мозырь', 'Молодечно'];
    public placeholder: string = 'Начните вводить город';
    public minLength: number = 1;
    public iconLeft: IRtIcon.Name | null = null;
    public openOnFocus: boolean = false;

    // Поле-стрелка линтер считает методом, поэтому оно стоит после остальных.
    public displayWith: (item: string | null) => string = (item: string | null): string => String(item ?? '');
}
