import { Clipboard } from '@angular/cdk/clipboard';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    inject,
    input,
    InputSignal,
    signal,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import {
    ERtTableColumn,
    IRtIcon,
    IRtTableCell,
    IRtTableColumn,
    IRtTableData,
    RT_KIT_LOCALE,
    RtButtonDirective,
    rtKitLabel,
    rtTableCellWriter,
    rtTableCsv,
    TRtTableCellWriter,
    TRtTableValue,
} from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'rt-ai-chat-table';

/** Сколько держать «Скопировано» после копии — как у кнопки копирования ответа. */
const RESET_DELAY_MS: number = 2000;

/** Ячейка шапки: подпись, край и признак столбца, что забирает остаток ширины. */
interface IHeadCell {
    readonly text: string;
    readonly end: boolean;
    readonly fill: boolean;
}

/**
 * Блок таблицы ответа `rt-ai-chat`. Значения пишутся по роду столбца в языке кита, отрицательные —
 * цветом ошибки; таблица шире блока прокручивается вбок, выше 200 — вниз под закреплённой шапкой.
 * Под таблицей «Copy CSV» кладёт в буфер CSV тех строк, что нарисованы на минуту нажатия.
 */
@Component({
    selector: 'rt-ai-chat-table',
    templateUrl: './rt-ai-chat-table.component.html',
    styleUrl: './rt-ai-chat-table.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtButtonDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtAiChatTableComponent {
    readonly #clipboard: Clipboard = inject(Clipboard);
    readonly #locale: Signal<string> = inject(RT_KIT_LOCALE);

    #resetTimer: ReturnType<typeof setTimeout> | null = null;

    readonly #t_copy: Signal<string> = rtKitLabel('aiTableCopyCsv');
    readonly #t_copied: Signal<string> = rtKitLabel('uiCopied');

    /** Запись значений каждого столбца в языке кита: смена языка пишет таблицу заново. */
    readonly #writers: Signal<readonly TRtTableCellWriter[]> = computed((): readonly TRtTableCellWriter[] =>
        this.data().columns.map((column: IRtTableColumn): TRtTableCellWriter => rtTableCellWriter(column, this.#locale()))
    );

    /** Первый текстовый столбец забирает остаток ширины; без текстовых таблица по своему содержимому. */
    readonly #fillIndex: Signal<number> = computed((): number =>
        this.data().columns.findIndex((column: IRtTableColumn): boolean => column.type === ERtTableColumn.Text)
    );

    protected readonly label: Signal<string> = rtKitLabel('aiTableLabel');

    protected readonly copied: WritableSignal<boolean> = signal(false);

    protected readonly fitsContent: Signal<boolean> = computed((): boolean => this.#fillIndex() < 0);

    protected readonly head: Signal<readonly IHeadCell[]> = computed((): readonly IHeadCell[] =>
        this.data().columns.map((column: IRtTableColumn, index: number): IHeadCell => ({
            text: column.label,
            end: column.type !== ERtTableColumn.Text,
            fill: index === this.#fillIndex(),
        }))
    );

    protected readonly rows: Signal<readonly (readonly IRtTableCell[])[]> = computed((): readonly (readonly IRtTableCell[])[] =>
        this.data().rows.map((row: readonly TRtTableValue[]): IRtTableCell[] => this.#write(row))
    );

    protected readonly total: Signal<readonly IRtTableCell[] | null> = computed((): readonly IRtTableCell[] | null => {
        const total: readonly TRtTableValue[] | null = this.data().total;

        return total === null ? null : this.#write(total);
    });

    protected readonly actionLabel: Signal<string> = computed((): string => (this.copied() ? this.#t_copied() : this.#t_copy()));

    protected readonly actionIcon: Signal<IRtIcon.Name> = computed((): IRtIcon.Name => (this.copied() ? 'check' : 'copy'));

    /** Сообщение для чтения с экрана: «Скопировано» на две секунды после копии, иначе пусто. */
    protected readonly status: Signal<string> = computed((): string => (this.copied() ? this.#t_copied() : ''));

    /** Таблица, приведённая к виду для рисования; новая таблица того же блока не сбрасывает прокрутку и «Скопировано». */
    public readonly data: InputSignal<IRtTableData> = input.required<IRtTableData>();

    constructor() {
        inject(DestroyRef).onDestroy((): void => this.#clearTimer());
    }

    protected onCopy(): void {
        if (!this.#clipboard.copy(rtTableCsv(this.data()))) {
            return;
        }
        this.copied.set(true);

        this.#clearTimer();
        this.#resetTimer = setTimeout((): void => this.copied.set(false), RESET_DELAY_MS);
    }

    #write(row: readonly TRtTableValue[]): IRtTableCell[] {
        const writers: readonly TRtTableCellWriter[] = this.#writers();

        return row.map((value: TRtTableValue, index: number): IRtTableCell => writers[index](value));
    }

    #clearTimer(): void {
        if (this.#resetTimer !== null) {
            clearTimeout(this.#resetTimer);
            this.#resetTimer = null;
        }
    }
}
