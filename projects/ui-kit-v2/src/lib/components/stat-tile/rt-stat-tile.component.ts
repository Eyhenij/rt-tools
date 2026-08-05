import { ChangeDetectionStrategy, Component, computed, input, InputSignal, Signal } from '@angular/core';

import { translateSignal, TranslocoPipe } from '@jsverse/transloco';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { IRtIcon, RtIconComponent } from '../icon';
import { IRtStatTile } from './rt-stat-tile.model';

const BEM_BLOCK: string = 'rt-stat-tile';

/** Строка дельты в готовом к рендеру виде — вся ветвистость решена здесь. */
interface IDeltaRow {
    key: string;
    label: string;
    text: string;
    baseline: string;
    direction: IRtStatTile.Direction;
    icon: IRtIcon.Name;
}

const DIRECTION_ICONS: Readonly<Record<IRtStatTile.Direction, IRtIcon.Name>> = Object.freeze({
    up: 'arrow-up',
    down: 'arrow-down',
    flat: 'minus',
    unknown: 'minus',
});

function directionOf(percent: number | null): IRtStatTile.Direction {
    if (percent === null) {
        return 'unknown';
    }
    if (percent > 0) {
        return 'up';
    }
    return percent < 0 ? 'down' : 'flat';
}

/**
 * Нулевая база — «—»: «+100 %» от нуля вводит в заблуждение, «∞» нечитаемо.
 * Дробная часть — через запятую, как и остальные проценты в интерфейсе: кит
 * форматирует сам, потому что не может зависеть от логики приложений.
 */
function percentText(percent: number | null): string {
    if (percent === null) {
        return '—';
    }
    const sign: string = percent > 0 ? '+' : '';
    return `${sign}${String(percent).replace('.', ',')} %`;
}

function deltaRow(key: string, delta: IRtStatTile.Delta | null): IDeltaRow | null {
    if (!delta) {
        return null;
    }
    const direction: IRtStatTile.Direction = directionOf(delta.percent);
    return {
        key,
        direction,
        label: delta.label,
        text: percentText(delta.percent),
        baseline: delta.baseline ?? '',
        icon: DIRECTION_ICONS[direction],
    };
}

/**
 * KPI-плитка: крупное значение, необязательная вторичная строка и до двух строк
 * сравнения (к предыдущему периоду и к прошлому году).
 *
 * Компонент ничего не считает и не форматирует: `value` и `baseline` приходят
 * готовыми строками, `percent` — посчитанным числом. Так плитка не знает ни про
 * валюты, ни про методику метрик и остаётся общей для любого домена.
 *
 * Нулевая база показывается как «—»: «+100 %» от нуля вводит в заблуждение, а
 * «∞» нечитаемо.
 */
@Component({
    selector: 'rt-stat-tile',
    templateUrl: './rt-stat-tile.component.html',
    styleUrl: './rt-stat-tile.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // standalone components / directives
        RtIconComponent,
        BlockDirective,
        ElemDirective,
        ModDirective,
        TranslocoPipe,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtStatTileComponent {
    readonly #baselinePrefix: Signal<string> = translateSignal('rtKit.uiBaseline');

    /**
     * Дельта к предыдущему периоду — рядом со значением. Пустая база (`percent`
     * = null) не рисуется вовсе: «—» рядом с цифрой читается как поломка, а не
     * как «сравнивать не с чем».
     */
    protected readonly primaryDelta: Signal<IDeltaRow | null> = computed((): IDeltaRow | null => this.#visibleDelta(this.deltaPrimary()));

    /** Годовое сравнение — отдельным компактным чипом, без слов в строке. */
    protected readonly yearDelta: Signal<IDeltaRow | null> = computed((): IDeltaRow | null => this.#visibleDelta(this.deltaSecondary()));

    /**
     * База сравнения — короткой строкой «было X» и ничем больше: всё остальное
     * (занятость, состав воронки) живёт во вторичной строке, иначе одна плитка
     * растягивает ряд под самую длинную подпись.
     */
    protected readonly baselineText: Signal<string> = computed((): string => {
        const baseline: string | undefined = this.deltaPrimary()?.baseline;
        return baseline ? this.#baselinePrefix().replace('{{value}}', baseline) : '';
    });

    /** Подпись метрики. */
    public readonly label: InputSignal<string> = input.required<string>();

    /** Уже отформатированное значение — плитка его не преобразует. */
    public readonly value: InputSignal<string> = input.required<string>();

    /** Вторичная строка под значением (занятость, доля оценки и т.п.). */
    public readonly secondary: InputSignal<string | null> = input<string | null>(null);

    /** Сравнение с предыдущим равным периодом. */
    public readonly deltaPrimary: InputSignal<IRtStatTile.Delta | null> = input<IRtStatTile.Delta | null>(null);

    /** Сравнение с тем же периодом год назад. */
    public readonly deltaSecondary: InputSignal<IRtStatTile.Delta | null> = input<IRtStatTile.Delta | null>(null);

    /** Пояснение методики — нативный title на иконке подсказки. */
    public readonly hint: InputSignal<string | null> = input<string | null>(null);

    #visibleDelta(delta: IRtStatTile.Delta | null): IDeltaRow | null {
        if (!delta || delta.percent === null) {
            return null;
        }
        return deltaRow('primary', delta);
    }
}
