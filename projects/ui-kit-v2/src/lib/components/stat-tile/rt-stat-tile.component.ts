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

import { RT_KIT_LABELS, RT_KIT_LOCALE, TRtKitLabelMap, rtKitLabel } from '@rt-tools/ui-kit-v2/core';
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

/** Язык, которым пишется дельта, когда язык кита `Intl` не принимает. */
const FALLBACK_LOCALE: string = 'en';

/** Плюс на росте, минус языка на падении, без знака у записанного нуля; не больше одного дробного знака. */
const DELTA_OPTIONS: Intl.NumberFormatOptions = { maximumFractionDigits: 1, signDisplay: 'exceptZero' };

function deltaFormat(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
    try {
        return new Intl.NumberFormat(locale, options);
    } catch {
        return new Intl.NumberFormat(FALLBACK_LOCALE, options);
    }
}

/** Записанное число дельты: проценты — как язык пишет процент, пункты — числом для подписи пунктов. */
interface IDeltaNumber {
    readonly text: string;
    readonly direction: IRtStatTile.Direction;
}

/**
 * Дельта по языку кита. Направление берётся из записанного числа, а не из присланного:
 * 0.04 и -0.04 записаны «0 %», и стрелка, знак и цвет у них ровные.
 */
function deltaNumber(value: number, unit: IRtStatTile.Unit, locale: string): IDeltaNumber {
    const parts: Intl.NumberFormatPart[] =
        unit === 'points'
            ? deltaFormat(locale, DELTA_OPTIONS).formatToParts(value)
            : deltaFormat(locale, { ...DELTA_OPTIONS, style: 'percent' }).formatToParts(value / 100);
    const text: string = parts.map((part: Intl.NumberFormatPart): string => part.value).join('');

    if (parts.some((part: Intl.NumberFormatPart): boolean => part.type === 'plusSign')) {
        return { text, direction: 'up' };
    }

    return { text, direction: parts.some((part: Intl.NumberFormatPart): boolean => part.type === 'minusSign') ? 'down' : 'flat' };
}

/**
 * Строка изменения с известной базой. Пункты пишутся переведённой подписью
 * («+10 п.п.», «+10 pp»), в которую уходит записанное число.
 */
function deltaRow(key: string, delta: IRtStatTile.Delta, written: IDeltaNumber, pointsText: string): IDeltaRow {
    return {
        key,
        direction: written.direction,
        label: delta.label,
        text: delta.unit === 'points' ? pointsText : written.text,
        baseline: delta.baseline ?? '',
        icon: DIRECTION_ICONS[written.direction],
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

    /** Язык подписей кита: им пишутся обе строки дельты. */
    readonly #locale: Signal<string> = inject(RT_KIT_LOCALE);

    readonly #primaryWritten: Signal<IDeltaNumber | null> = computed((): IDeltaNumber | null => this.#written(this.deltaPrimary()));

    readonly #yearWritten: Signal<IDeltaNumber | null> = computed((): IDeltaNumber | null => this.#written(this.deltaSecondary()));

    /** Пункты — тоже параметром подписи: порядок числа и единицы знает язык, а не кит. */
    readonly #primaryPoints: Signal<string> = rtKitLabel(
        'uiPercentagePoints',
        computed((): Record<string, string> => ({ value: this.#primaryWritten()?.text ?? '' }))
    );

    readonly #yearPoints: Signal<string> = rtKitLabel(
        'uiPercentagePoints',
        computed((): Record<string, string> => ({ value: this.#yearWritten()?.text ?? '' }))
    );

    /** Подписи кита для шаблона — приставка годового чипа. */
    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    /**
     * Дельта к предыдущему периоду — рядом со значением. Пустая база (`percent`
     * = null) не рисуется вовсе: «—» рядом с цифрой читается как поломка, а не
     * как «сравнивать не с чем».
     */
    protected readonly primaryDelta: Signal<IDeltaRow | null> = computed((): IDeltaRow | null =>
        this.#visibleDelta('primary', this.deltaPrimary(), this.#primaryWritten(), this.#primaryPoints())
    );

    /** Годовое сравнение — отдельным компактным чипом, без слов в строке. */
    protected readonly yearDelta: Signal<IDeltaRow | null> = computed((): IDeltaRow | null =>
        this.#visibleDelta('year', this.deltaSecondary(), this.#yearWritten(), this.#yearPoints())
    );

    /** Подпись основной дельты видимым текстом после числа — тогда `title` с ней не дублируется. */
    protected readonly primaryCaption: Signal<string> = computed((): string =>
        this.deltaLabelVisible() ? (this.primaryDelta()?.label ?? '') : ''
    );

    /** Всплывающая подпись основной дельты, когда она не видна текстом. */
    protected readonly primaryTitle: Signal<string | null> = computed((): string | null =>
        this.deltaLabelVisible() ? null : (this.primaryDelta()?.label ?? null)
    );

    protected readonly compact: Signal<boolean> = computed((): boolean => this.size() === 'compact');

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

    /**
     * Размер значения: компактный пишет его 24/24, дельту 14 отдельной строкой под значением,
     * сужает промежутки до 6 и переносит нижние строки между словами.
     */
    public readonly size: InputSignal<IRtStatTile.Size> = input<IRtStatTile.Size>('default');

    /** Показать подпись основной дельты видимым текстом после числа: «+12,5 % vs LY». */
    public readonly deltaLabelVisible: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    #written(delta: IRtStatTile.Delta | null): IDeltaNumber | null {
        return delta && delta.percent !== null ? deltaNumber(delta.percent, delta.unit ?? 'percent', this.#locale()) : null;
    }

    #visibleDelta(key: string, delta: IRtStatTile.Delta | null, written: IDeltaNumber | null, pointsText: string): IDeltaRow | null {
        return delta && written ? deltaRow(key, delta, written, pointsText) : null;
    }
}
