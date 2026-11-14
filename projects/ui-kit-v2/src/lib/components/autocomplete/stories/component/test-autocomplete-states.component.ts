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
    template: `
        <div class="app-autocomplete-states__panel-slot">
            <rt-autocomplete
                ariaLabel="Город"
                placeholder="Начните вводить город"
                [attr.data-story-trigger]="triggerAttribute"
                [suggestions]="[]"
                [error]="state() === 'own-empty' ? null : 'Нет сети'"
                [displayWith]="displayWith">
                @if (state() === 'own-error') {
                    <ng-template rtAutocompleteError let-text>
                        <div [style]="slotStyle">
                            <strong>Свой вид ошибки</strong>
                            <span [style]="slotHintStyle">Текст: «{{ text }}», в контексте retry()</span>
                        </div>
                    </ng-template>
                }
                @if (state() === 'own-empty') {
                    <ng-template rtAutocompleteEmpty let-query>
                        <div [style]="slotStyle">
                            <strong>Свой вид пустого</strong>
                            <span [style]="slotHintStyle">Строка поиска: «{{ query }}»</span>
                        </div>
                    </ng-template>
                }
            </rt-autocomplete>
        </div>
    `,
    styles: `
        /* Панель уезжает в контейнер оверлеев и ложится поверх страницы: без запаса снизу
           она вышла бы за нижний край окна. Ширина — как у поля на кадре. */
        .app-autocomplete-states__panel-slot {
            width: 17.5rem;
            padding-bottom: 12rem;
        }
    `,
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

    /** Рамка своего шаблона: пунктир показывает, где кончается разметка приложения. */
    public readonly slotStyle: string =
        'display: grid; gap: var(--rt-space-1); margin: var(--rt-space-2); padding: var(--rt-space-4); border: 1px dashed var(--rt-color-border-strong); border-radius: var(--rt-radius-md); text-align: center';

    public readonly slotHintStyle: string = 'color: var(--rt-color-text-muted); font-size: var(--rt-text-sm)';

    public readonly displayWith: (item: string | null) => string = (item: string | null): string => item ?? '';
}
