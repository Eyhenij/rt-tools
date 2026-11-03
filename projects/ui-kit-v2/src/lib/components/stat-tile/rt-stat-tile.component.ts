import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    inject,
    input,
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    InputSignalWithTransform,
    Signal,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, TRtKitLabelMap, rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { IRtIcon } from '@rt-tools/ui-kit-v2/core';
import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
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
 * Число со знаком роста. Дробная часть — через запятую, как и остальные
 * проценты в интерфейсе: кит форматирует сам, потому что не может зависеть от
 * логики приложений.
 */
function signedNumber(value: number): string {
    const sign: string = value > 0 ? '+' : '';
    return `${sign}${String(value).replace('.', ',')}`;
}

/**
 * Строка изменения с известной базой. Пункты пишутся переведённой подписью
 * («+10 п.п.», «+10 pp») — её текст приходит готовым, проценты кит дописывает сам.
 */
function deltaRow(key: string, delta: IRtStatTile.Delta, percent: number, pointsText: string): IDeltaRow {
    const direction: IRtStatTile.Direction = directionOf(percent);
    return {
        key,
        direction,
        label: delta.label,
        text: delta.unit === 'points' ? pointsText : `${signedNumber(percent)} %`,
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
 * Строка с неизвестной базой не рисуется: «+100 %» от нуля вводит в
 * заблуждение, а «—» рядом с цифрой читается как поломка.
 *
 * Цвет строки говорит, хорошо изменение или плохо, а стрелка — только знак
 * числа: у метрики, где рост хуже (отмены, потерянная выручка), рост красный и
 * со стрелкой вверх.
 */
@Component({
    selector: 'rt-stat-tile',
    templateUrl: './rt-stat-tile.component.html',
    styleUrl: './rt-stat-tile.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        RtIconComponent,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtStatTileComponent {
    /**
     * Значение базы уходит параметром перевода, а не подставляется в готовую
     * строку: Transloco интерполирует `{{value}}` в момент перевода, и к
     * возвращённой строке подставлять уже нечего — от подписи оставалась одна
     * приставка («было», «was»), а само число пропадало.
     */
    readonly #baselineParams: Signal<Record<string, string>> = computed((): Record<string, string> => ({
        value: this.deltaPrimary()?.baseline ?? '',
    }));

    readonly #baselineLine: Signal<string> = rtKitLabel('uiBaseline', this.#baselineParams);

    /** Пункты — тоже параметром подписи: порядок числа и единицы знает язык, а не кит. */
    readonly #primaryPoints: Signal<string> = rtKitLabel(
        'uiPercentagePoints',
        computed((): Record<string, string> => ({ value: signedNumber(this.deltaPrimary()?.percent ?? 0) }))
    );

    readonly #yearPoints: Signal<string> = rtKitLabel(
        'uiPercentagePoints',
        computed((): Record<string, string> => ({ value: signedNumber(this.deltaSecondary()?.percent ?? 0) }))
    );

    /**
     * Дельта к предыдущему периоду — рядом со значением. Пустая база (`percent`
     * = null) не рисуется вовсе: «—» рядом с цифрой читается как поломка, а не
     * как «сравнивать не с чем».
     */
    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly primaryDelta: Signal<IDeltaRow | null> = computed((): IDeltaRow | null =>
        this.#visibleDelta('primary', this.deltaPrimary(), this.#primaryPoints())
    );

    /** Годовое сравнение — отдельным компактным чипом, без слов в строке. */
    protected readonly yearDelta: Signal<IDeltaRow | null> = computed((): IDeltaRow | null =>
        this.#visibleDelta('year', this.deltaSecondary(), this.#yearPoints())
    );

    /**
     * База сравнения — короткой строкой «было X» и ничем больше: всё остальное
     * (занятость, состав воронки) живёт во вторичной строке, иначе одна плитка
     * растягивает ряд под самую длинную подпись.
     */
    protected readonly baselineText: Signal<string> = computed((): string => (this.deltaPrimary()?.baseline ? this.#baselineLine() : ''));

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

    /**
     * Рост метрики плох для владельца (отмены, потерянная выручка): рост обеих
     * строк красный, падение зелёное. Стрелка по-прежнему показывает знак числа.
     */
    public readonly growthIsWorse: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    #visibleDelta(key: string, delta: IRtStatTile.Delta | null, pointsText: string): IDeltaRow | null {
        if (!delta || delta.percent === null) {
            return null;
        }
        return deltaRow(key, delta, delta.percent, pointsText);
    }
}
