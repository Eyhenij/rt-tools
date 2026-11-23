import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';

import { RtFieldComponent } from '../../../field/rt-field.component';
import { RtIconButtonComponent } from '../../../icon-button/rt-icon-button.component';
import { RtSelectComponent } from '../../../select/rt-select.component';
import { IRtSelect } from '../../../select/rt-select.model';
import { RtToolbarFiltersPanelComponent } from '../../filters-panel/rt-toolbar-filters-panel.component';
import { RtToolbarComponent, RtToolbarFiltersDirective, RtToolbarRightDirective } from '../../rt-toolbar.component';
import { IRtToolbar } from '../../rt-toolbar.model';

/** Состояние полосы отборов: отбор выключен, включён, панель открыта (её открывает `play`). */
export type TToolbarFiltersPart = 'off' | 'on' | 'panel';

const STATUS_OPTIONS: ReadonlyArray<IRtSelect.Option<string>> = [
    { value: 'confirmed', label: 'Подтверждено' },
    { value: 'pending', label: 'Ждёт ответа' },
    { value: 'cancelled', label: 'Отменено' },
];

const PAYMENT_OPTIONS: ReadonlyArray<IRtSelect.Option<string>> = [
    { value: 'paid', label: 'Оплачено' },
    { value: 'unpaid', label: 'Не оплачено' },
];

/**
 * Полоса списка с отборами за кнопкой — для витрины.
 *
 * Полоса стоит так, как её ставит список: поля 12 со всех сторон и поверхность под ней. Справа —
 * кнопки списка: добавить, обновить, настроить колонки. Отборы — «Статус» и «Оплата»; в панели у
 * них подпись над полем, в полосе её нет. Сама кнопка фильтров появляется только на узком месте:
 * на широком кадре отборы стоят в полосе.
 *
 * При `panel="app"` кнопка не открывает панель кита: обёртка, как приложение, открывает свой
 * «маршрут» по `filtersOpen` и рисует в нём `rt-toolbar-filters-panel`.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-toolbar-filters',
    templateUrl: './test-toolbar-filters.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RtToolbarComponent,
        RtToolbarFiltersDirective,
        RtToolbarRightDirective,
        RtToolbarFiltersPanelComponent,
        RtIconButtonComponent,
        RtFieldComponent,
        RtSelectComponent,
    ],
})
export class TestRtToolbarFiltersComponent {
    protected readonly statusOptions: ReadonlyArray<IRtSelect.Option<string>> = STATUS_OPTIONS;
    protected readonly paymentOptions: ReadonlyArray<IRtSelect.Option<string>> = PAYMENT_OPTIONS;

    /** Открыт ли «маршрут» панели приложения. */
    protected readonly routeOpen: WritableSignal<boolean> = signal(false);

    public part: TToolbarFiltersPart = 'off';

    /** Кто открывает панель отборов: кит или приложение своим маршрутом. */
    public panel: IRtToolbar.TFiltersPanel = 'kit';
}
