import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtScrollAreaComponent } from '../../rt-scroll-area.component';
import { RtScrollAreaContentDirective, RtScrollAreaFooterDirective, RtScrollAreaHeaderDirective } from '../../rt-scroll-area.directives';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое витрина вешает
 * контролы. Входы кита сигнальные и извне не пишутся — поэтому показ целится сюда, а не в сам
 * компонент. В пакет обёртка не уезжает.
 *
 * Высоту области задаёт коробка показа: область берёт сто процентов своего хоста и по
 * содержимому вытянулась бы на весь список, а признака непоказанного снизу тогда не увидеть.
 */
@Component({
    selector: 'app-scroll-area',
    template: `
        <div class="app-scroll-area__box">
            <rt-scroll-area [isScrollHintShown]="isScrollHintShown">
                @if (hasHeader) {
                    <ng-template rtScrollAreaHeader>
                        <div class="app-scroll-area__title">Заявки смены</div>
                    </ng-template>
                }
                <ng-template rtScrollAreaContent>
                    @for (row of rows; track row) {
                        <div class="app-scroll-area__row">{{ row }}</div>
                    }
                </ng-template>
                @if (hasFooter) {
                    <ng-template rtScrollAreaFooter>
                        <div class="app-scroll-area__total">Всего: {{ rows.length }}</div>
                    </ng-template>
                }
            </rt-scroll-area>
        </div>
    `,
    styles: `
        /* Коробка показа — это экран потребителя: область берёт её высоту и по ней обрезает. */
        .app-scroll-area__box {
            height: 16rem;
            border: 1px solid var(--rt-color-border-subtle);
            border-radius: var(--rt-radius-sm);
            background: var(--rt-color-bg-surface);
        }

        .app-scroll-area__title {
            color: var(--rt-color-text-primary);
            font-size: var(--rt-text-sm);
        }

        .app-scroll-area__row {
            padding: var(--rt-space-2) 0;
            color: var(--rt-color-text-muted);
            font-size: var(--rt-text-sm);
        }

        /* Разделитель первой строкой подвала: ровно до него доходит полоса растушёвки. */
        .app-scroll-area__total {
            border-top: 1px solid var(--rt-color-border-subtle);
            padding-top: var(--rt-space-2);
            color: var(--rt-color-text-primary);
            font-size: var(--rt-text-sm);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtScrollAreaComponent,
        RtScrollAreaContentDirective,
        RtScrollAreaFooterDirective,
        RtScrollAreaHeaderDirective,
    ],
})
export class TestRtScrollAreaComponent {
    public isScrollHintShown: boolean = true;
    public hasHeader: boolean = true;
    public hasFooter: boolean = true;

    /** Список заведомо выше коробки: иначе признака непоказанного снизу не увидеть. */
    public readonly rows: readonly string[] = [
        'Замена фильтра, цех 2',
        'Поверка манометра, узел 7',
        'Обход трассы, участок 14',
        'Приёмка смены, бригада 3',
        'Проверка уплотнений, насос 1',
        'Ревизия задвижки, линия 9',
        'Осмотр кабельной трассы',
        'Продувка коллектора',
    ];
}
