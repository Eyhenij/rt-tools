import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtActionBarComponent } from '../../rt-action-bar.component';
import { IRtActionBar } from '../../rt-action-bar.model';

/** Какой список действий подать: витрина подставляет значение, а не разметку. */
export type TActionBarKind = 'plain' | 'icons' | 'menu';

const ACTIONS: Readonly<Record<TActionBarKind, readonly IRtActionBar.Action[]>> = {
    plain: [{ label: 'Скачать' }, { label: 'Перенести' }],
    icons: [
        { label: 'Скачать', icon: 'ico-download' },
        { label: 'Удалить', icon: 'trash', look: 'danger' },
    ],
    menu: [{ label: 'Отправить', icon: 'send', menu: [{ label: 'Письмом' }, { label: 'В чат' }] }],
};

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое Storybook
 * вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому история целится сюда, а
 * не в сам компонент. В пакет обёртка не уезжает.
 *
 * Полоса берёт настройку одним объектом, и контролами его не собрать: обёртка складывает его
 * из трёх понятных ручек — сколько выбрано, сколько всего и какой список действий подать.
 */
@Component({
    selector: 'app-action-bar',
    // native-ok: обёртка истории витрины — показ живёт рядом с историей, а не отдельным файлом разметки
    template: `
        <rt-action-bar [config]="configOf()" (actionRun)="onRun($event)" (closed)="onClosed()" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtActionBarComponent,
    ],
})
export class TestRtActionBarComponent {
    public selected: number = 3;
    public total: number = 128;
    public kind: TActionBarKind = 'plain';
    public happened: string = '';

    /**
     * Настройка собирается вызовом, а не полем: значения приходят от витрины по одному, и
     * геттера у компонента тут не завести — правило состояния его запрещает. Соседняя матрица
     * тоста собирает свои случаи тем же приёмом.
     */
    public configOf(): IRtActionBar.Config {
        return { selected: this.selected, total: this.total, actions: ACTIONS[this.kind] };
    }

    public onRun(action: IRtActionBar.Action): void {
        this.happened = `Случилось: ${action.label}`;
    }

    public onClosed(): void {
        this.happened = 'Случилось: закрытие';
    }
}
