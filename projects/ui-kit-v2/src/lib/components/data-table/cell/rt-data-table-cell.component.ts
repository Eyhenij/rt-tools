import { Clipboard } from '@angular/cdk/clipboard';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    ElementRef,
    inject,
    input,
    InputSignal,
    Signal,
    signal,
    TemplateRef,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

import { BlockDirective, ElemDirective, EmptyToDashPipe, ModDirective } from '@rt-tools/core';
import { isEmpty, TNullable } from '@rt-tools/utils';

import { rtKitLabel } from '../../../i18n';
import { BreakpointsService } from '../../../platform';
import { RtIconButtonComponent } from '../../icon-button/rt-icon-button.component';
import { RtIconComponent } from '../../icon/rt-icon.component';
import { IRtIcon } from '../../icon/rt-icon.model';
import { RtTooltipDirective } from '../../tooltip/rt-tooltip.directive';
import { dataTableCellText, dataTableCellValue, dataTableCopyButtonSide, dataTableIconName } from '../rt-data-table-cell.logic';
import { IRtDataTableIconContext } from '../rt-data-table-icon.directive';
import { RtDataTableStopRowClickDirective } from '../rt-data-table-row-click.directive';
import { IRtDataTable } from '../rt-data-table.model';

const BEM_BLOCK: string = 'rt-data-table-cell';

/** Сколько держать «скопировано» перед возвратом кнопки — как в первом ките. */
const COPIED_DELAY_MS: number = 2000;

/**
 * Готовая ячейка `rt-data-table` — ячейка первого кита без Material.
 *
 * Значение рисуется как пришло или как его переделала колонка; пустое — прочерком. Длинное
 * обрезается в строку, и подсказка со значением целиком бывает только у обрезанного. Значок —
 * набором кита по имени первого кита либо шаблоном значка приложения. Кнопка копирования
 * проявляется при наведении и стоит на стороне, противоположной выравниванию значения.
 */
@Component({
    selector: 'rt-data-table-cell',
    templateUrl: './rt-data-table-cell.component.html',
    styleUrl: './rt-data-table-cell.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // components
        RtIconButtonComponent,
        RtIconComponent,

        // directives
        BlockDirective,
        ElemDirective,
        ModDirective,
        NgTemplateOutlet,
        RtDataTableStopRowClickDirective,
        RtTooltipDirective,

        // pipes
        EmptyToDashPipe,
    ],
    host: {
        class: BEM_BLOCK,
        '[style.width]': 'column().width',
        '[style.min-width]': 'column().minWidth',
        '(mouseenter)': 'onMouseEnter()',
        '(mouseleave)': 'hovered.set(false)',
    },
})
export class RtDataTableCellComponent<T = Record<string, unknown>> {
    readonly #breakpoints: BreakpointsService = inject(BreakpointsService);
    readonly #clipboard: Clipboard = inject(Clipboard);
    readonly #sanitizer: DomSanitizer = inject(DomSanitizer);
    readonly #host: ElementRef<HTMLElement> = inject(ElementRef);

    #copiedTimer: ReturnType<typeof setTimeout> | null = null;

    readonly #copyLabel: Signal<string> = rtKitLabel('dataTableCopy');
    readonly #copiedLabel: Signal<string> = rtKitLabel('dataTableCopied');

    /** Экран узкий: подсказки гаснут. Что кнопка копирования там видна всегда, решают стили. */
    protected readonly narrow: Signal<boolean> = this.#breakpoints.narrow;

    protected readonly value: Signal<T[keyof T] | string | number> = computed(() => dataTableCellValue(this.row(), this.column()));

    /**
     * Копировать нечего: значение пусто. Считается той же утилитой, что рисует прочерк вместо
     * значения, — второй ответ на этот вопрос разошёлся бы с прочерком молча.
     */
    protected readonly empty: Signal<boolean> = computed(() => isEmpty(this.value()));

    protected readonly copyable: Signal<boolean> = computed(() => this.column().copyable && !this.empty());

    /**
     * Значок колонки. Его видимость, цвет и подсказку ячейка не читает — как первый кит: поля
     * приняты ради переезда без правок и ничего не меняют.
     */
    protected readonly icon: Signal<IRtDataTable.Icon | null> = computed(() => this.column().icon ?? null);

    /** Значок набора кита для имени первого кита; без пары — ничего. */
    protected readonly kitIcon: Signal<IRtIcon.Name | null> = computed(() => {
        const icon: IRtDataTable.Icon | null = this.icon();

        return icon ? dataTableIconName(icon.glyph) : null;
    });

    protected readonly iconContext: Signal<IRtDataTableIconContext<T> | null> = computed(() => {
        const icon: IRtDataTable.Icon | null = this.icon();

        return icon ? { $implicit: icon.glyph, column: this.column(), row: this.row() } : null;
    });

    /**
     * Стиль значка, посчитанный колонкой по значению строки, — строкой, как в первом ките.
     * Это одна из странностей первого кита, перенесённых как есть: такую строку не перекрашивает
     * ни набор, ни тёмная тема.
     */
    protected readonly iconStyle: Signal<SafeStyle | null> = computed(() => {
        const transform: TNullable<(value: T[keyof T]) => string> = this.column().iconTransform;

        // eslint-disable-next-line sonarjs/no-angular-bypass-sanitization -- строка стиля собрана описанием колонок приложения, а не значением, введённым человеком
        return transform ? this.#sanitizer.bypassSecurityTrustStyle(transform(this.row()[this.column().propName])) : null;
    });

    protected readonly hovered: WritableSignal<boolean> = signal(false);
    protected readonly copied: WritableSignal<boolean> = signal(false);

    /** Подсказка: заданная колонкой, иначе значение целиком — и только у обрезанного. */
    protected readonly hint: WritableSignal<string> = signal('');

    protected readonly copyLabel: Signal<string> = computed(() => (this.copied() ? this.#copiedLabel() : this.#copyLabel()));

    protected readonly copyIcon: Signal<IRtIcon.Name> = computed(() => (this.copied() ? 'check' : 'copy'));

    protected readonly titleMods: Signal<Record<string, string>> = computed(() => ({ align: this.column().align }));

    protected readonly copyMods: Signal<Record<string, string | boolean>> = computed(() => ({
        position: dataTableCopyButtonSide(this.column() as IRtDataTable.Column<unknown>),
        complete: this.copied(),
        visible: this.hovered(),
    }));

    public readonly row: InputSignal<T> = input.required<T>();
    public readonly column: InputSignal<IRtDataTable.Column<T>> = input.required<IRtDataTable.Column<T>>();

    /** Шаблон значка приложения; когда он дан, перечень кита не спрашивается. */
    public readonly iconTemplate: InputSignal<TemplateRef<IRtDataTableIconContext<T>> | null> = input<TemplateRef<
        IRtDataTableIconContext<T>
    > | null>(null);

    constructor() {
        inject(DestroyRef).onDestroy((): void => this.#clearTimer());
    }

    /**
     * Наведение: проявить кнопку копирования и замерить обрезку.
     *
     * Ширина известна только отрисованному узлу, а меняется она и от переезда столбца, и от
     * ширины окна: посчитанная один раз, она соврала бы при первом же изменении.
     */
    protected onMouseEnter(): void {
        this.hovered.set(true);

        const text: HTMLElement | null = this.#host.nativeElement.querySelector(`.${BEM_BLOCK}__text`);
        const cut: boolean = text !== null && text.scrollWidth > text.clientWidth;

        this.hint.set(!this.narrow() && cut ? (this.column().tooltip ?? dataTableCellText(this.value())) : '');
    }

    protected onCopy(): void {
        this.#clipboard.copy(dataTableCellText(this.value()));
        this.copied.set(true);

        this.#clearTimer();
        this.#copiedTimer = setTimeout((): void => this.copied.set(false), COPIED_DELAY_MS);
    }

    #clearTimer(): void {
        if (this.#copiedTimer !== null) {
            clearTimeout(this.#copiedTimer);
            this.#copiedTimer = null;
        }
    }
}
