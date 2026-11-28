import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FieldTree, form, FormField } from '@angular/forms/signals';

import { RtButtonDirective } from '../../../button/rt-button.directive';
import { RtIconButtonComponent } from '../../../icon-button/rt-icon-button.component';
import { RtToggleSwitchComponent } from '../../../toggle-switch/rt-toggle-switch.component';
import { RtBottomSheetComponent } from '../../rt-bottom-sheet.component';
import { RtSheetMoreDirective } from '../../rt-sheet-more.directive';

/**
 * Раскладка шторки в истории: пустая шторка, главное действие в подвале со справкой и значком сброса
 * в шапке (кадр макета «Фильтры», 8736:1906), два значка в шапке (кадр «Асайд записи», 8736:1990) или
 * дополнительное за «⋮» левее сброса (кадры 8762:2095 и 8762:2124).
 */
export type TBottomSheetLayout = 'plain' | 'footer-action' | 'header-icons' | 'more';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-bottom-sheet',
    template: `
        @switch (layout) {
            @case ('footer-action') {
                <rt-bottom-sheet fullHeight [open]="open">
                    <span sheetHeader>Фильтры</span>
                    <rt-icon-button sheetAction variant="secondary" radius="full" icon="reset" ariaLabel="Сбросить" />
                    <p style="margin: 0; padding: 0 var(--rt-space-5)">Статус, оплата и другие отборы страницы.</p>
                    <span sheetInfo>7 дней</span>
                    <button sheetPrimary rtButton type="button" size="md" appearance="filled" label="Применить"></button>
                </rt-bottom-sheet>
            }
            @case ('header-icons') {
                <rt-bottom-sheet fullHeight [open]="open">
                    <span sheetHeader>Анна Смирнова</span>
                    <!-- «Удалить» всегда крайняя справа в шапке. -->
                    <rt-icon-button sheetAction variant="secondary" radius="full" icon="copy" ariaLabel="Дублировать" />
                    <rt-icon-button sheetAction variant="secondary" radius="full" icon="trash" ariaLabel="Удалить" />
                    <p style="margin: 0; padding: 0 var(--rt-space-5)">Бронь №1042, гость, телефон и статус.</p>
                    <button sheetPrimary rtButton type="button" size="md" appearance="filled" label="Сохранить"></button>
                </rt-bottom-sheet>
            }
            @case ('more') {
                <rt-bottom-sheet fullHeight [open]="open">
                    <span sheetHeader>Фильтры</span>
                    <rt-icon-button sheetAction variant="secondary" radius="full" icon="reset" ariaLabel="Сбросить" />
                    <p style="margin: 0; padding: 0 var(--rt-space-5)">Статус, оплата и другие отборы страницы.</p>
                    <!-- Дополнительное — за «⋮»: второй экран той же шторки, раскладку задаёт приложение. -->
                    <ng-template rtSheetMore>
                        <div style="padding: var(--rt-space-5) var(--rt-space-5) var(--rt-space-2)">
                            <rt-toggle-switch label="Свободные" size="md" [formField]="filters.onlyFree" />
                        </div>
                    </ng-template>
                    <span sheetInfo>Найдено: 12</span>
                    <button sheetPrimary rtButton type="button" size="md" appearance="filled" label="Применить"></button>
                </rt-bottom-sheet>
            }
            @default {
                <rt-bottom-sheet [open]="open" />
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtBottomSheetComponent,
        RtIconButtonComponent,
        RtSheetMoreDirective,
        RtButtonDirective,

        // forms
        FormField,
        RtToggleSwitchComponent,
    ],
})
export class TestRtBottomSheetComponent {
    public open: boolean = false;
    public layout: TBottomSheetLayout = 'plain';

    /** Отборы второго экрана «Ещё»: переключатель «Свободные» включён, как на кадре 8762:2124. */
    public readonly filters: FieldTree<{ onlyFree: boolean }> = form(signal<{ onlyFree: boolean }>({ onlyFree: true }));
}
