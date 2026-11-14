import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';

import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { RtAutocompleteEmptyDirective, RtAutocompleteErrorDirective } from '../../rt-autocomplete-states.directive';
import { RtAutocompleteComponent } from '../../rt-autocomplete.component';

/** Что стоит в панели: ошибка кита, свой шаблон ошибки или свой шаблон пустого. */
export type TAutocompleteStatesCase = 'error' | 'own-error' | 'own-empty';

/**
 * Ошибка загрузки и свои шаблоны `rt-autocomplete` — по одобренному кадру. Панель одна на историю:
 * второй жест закрыл бы первую, поэтому случай выбирает вход.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-autocomplete-states',
    templateUrl: './test-autocomplete-states.component.html',
    styleUrl: './test-autocomplete-states.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtAutocompleteComponent,

        // directives
        RtAutocompleteEmptyDirective,
        RtAutocompleteErrorDirective,
    ],
})
export class TestRtAutocompleteStatesComponent {
    public readonly state: InputSignal<TAutocompleteStatesCase> = input<TAutocompleteStatesCase>('error');

    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;

    public readonly displayWith: (item: string | null) => string = (item: string | null): string => item ?? '';
}
