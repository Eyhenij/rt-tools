import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtButtonDirective } from '../../../button/rt-button.directive';
import { RtIconButtonComponent } from '../../../icon-button/rt-icon-button.component';
import { RtBottomSheetComponent } from '../../rt-bottom-sheet.component';

/**
 * Раскладка шторки в истории: пустая шторка, главное действие в подвале со справкой и значком сброса
 * в шапке (кадр макета «Фильтры», 8736:1906) или два значка в шапке (кадр «Асайд записи», 8736:1990).
 */
export type TBottomSheetLayout = 'plain' | 'footer-action' | 'header-icons';

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
        RtButtonDirective,
    ],
})
export class TestRtBottomSheetComponent {
    public open: boolean = false;
    public layout: TBottomSheetLayout = 'plain';
}
