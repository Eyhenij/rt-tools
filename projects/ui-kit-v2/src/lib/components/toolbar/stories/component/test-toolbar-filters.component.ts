import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtFieldComponent } from '../../../field/rt-field.component';
import { RtIconButtonComponent } from '../../../icon-button/rt-icon-button.component';
import { RtSelectComponent } from '../../../select/rt-select.component';
import { IRtSelect } from '../../../select/rt-select.model';
import { RtToolbarComponent, RtToolbarFiltersDirective, RtToolbarRightDirective } from '../../rt-toolbar.component';

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
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-toolbar-filters',
    template: `
        <div data-story-root style="width: 100%; background: var(--rt-color-bg-surface)">
            <!-- Поля — свойствами на теге полосы: она объявляет их на своём блоке, и с обёртки они не
                 доходят. 12 — число кадра «Телефон · Toolbar · фильтры за кнопкой»: шага 12 на шкале нет -->
            <rt-toolbar
                qa-dataid="story-toolbar-filters"
                style="--rt-toolbar-padding-top: 12px; --rt-toolbar-padding-bottom: 12px; --rt-toolbar-padding-inline: 12px"
                [filtersActive]="part !== 'off'">
                <ng-template rtToolbarFilters let-place>
                    @if (place === 'panel') {
                        <rt-field label="Статус">
                            <rt-select placeholder="Все" [options]="statusOptions" />
                        </rt-field>
                        <rt-field label="Оплата">
                            <rt-select placeholder="Любая оплата" [options]="paymentOptions" />
                        </rt-field>
                    } @else {
                        <rt-select placeholder="Все" aria-label="Статус" [options]="statusOptions" />
                        <rt-select placeholder="Любая оплата" aria-label="Оплата" [options]="paymentOptions" />
                    }
                </ng-template>

                <ng-template rtToolbarRight>
                    <rt-icon-button icon="ico-plus" variant="primary" ariaLabel="Добавить" />
                    <rt-icon-button icon="sync" variant="primary" ariaLabel="Обновить" />
                    <rt-icon-button icon="sliders-v" variant="primary" ariaLabel="Настроить колонки" />
                </ng-template>
            </rt-toolbar>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RtToolbarComponent,
        RtToolbarFiltersDirective,
        RtToolbarRightDirective,
        RtIconButtonComponent,
        RtFieldComponent,
        RtSelectComponent,
    ],
})
export class TestRtToolbarFiltersComponent {
    protected readonly statusOptions: ReadonlyArray<IRtSelect.Option<string>> = STATUS_OPTIONS;
    protected readonly paymentOptions: ReadonlyArray<IRtSelect.Option<string>> = PAYMENT_OPTIONS;

    public part: TToolbarFiltersPart = 'off';
}
