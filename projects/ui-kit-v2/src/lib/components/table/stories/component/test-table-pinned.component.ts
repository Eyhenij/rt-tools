import {
    CdkCell,
    CdkCellDef,
    CdkColumnDef,
    CdkFooterCell,
    CdkFooterCellDef,
    CdkFooterRow,
    CdkFooterRowDef,
    CdkHeaderCell,
    CdkHeaderCellDef,
    CdkHeaderRow,
    CdkHeaderRowDef,
    CdkRow,
    CdkRowDef,
} from '@angular/cdk/table';
import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, inject, ViewEncapsulation } from '@angular/core';

import { RtTagComponent } from '../../../tag/rt-tag.component';
import { IRtTag } from '../../../tag/rt-tag.model';
import { RtTableComponent } from '../../rt-table.component';

/** Строка витрины: гость, даты, статус брони и сумма. */
interface IPinnedRow {
    readonly id: number;
    readonly guest: string;
    readonly dates: string;
    readonly status: string;
    readonly severity: IRtTag.Severity;
    readonly sum: string;
    readonly problem: boolean;
}

/** Кадр макета: сторона закрепления, где стоит прокрутка и в какой теме. */
interface IPinnedFrame {
    readonly id: string;
    readonly caption: string;
    readonly pin: 'start' | 'end';
    readonly scroll: number | 'end';
    readonly dark: boolean;
}

const ROWS: readonly IPinnedRow[] = [
    { id: 1, guest: 'Анна Смирнова', dates: '12–15 окт', status: 'Оплачено', severity: 'success', sum: '48 000 ₽', problem: false },
    { id: 2, guest: 'Иван Петров', dates: '20–22 окт', status: 'Ожидает', severity: 'warning', sum: '21 500 ₽', problem: false },
    { id: 3, guest: 'Мария Козлова', dates: '1–7 ноя', status: 'Отменено', severity: 'danger', sum: '—', problem: true },
];

const COLUMNS: readonly string[] = ['guest', 'dates', 'status', 'sum'];

/** Те же шесть кадров, что в макете Figma: ширина 375, сторона закрепления, положение прокрутки, тема. */
const FRAMES: readonly IPinnedFrame[] = [
    { id: 'start-0', caption: 'Слева · начало прокрутки', pin: 'start', scroll: 0, dark: false },
    { id: 'start-120', caption: 'Слева · прокрутка на 120', pin: 'start', scroll: 120, dark: false },
    { id: 'end-0', caption: 'Справа · начало прокрутки', pin: 'end', scroll: 0, dark: false },
    { id: 'end-end', caption: 'Справа · конец прокрутки', pin: 'end', scroll: 'end', dark: false },
    { id: 'dark-start-120', caption: 'Тёмная тема · слева, прокрутка на 120', pin: 'start', scroll: 120, dark: true },
    { id: 'dark-end-0', caption: 'Тёмная тема · справа, начало прокрутки', pin: 'end', scroll: 0, dark: true },
];

/**
 * Закреплённая колонка `rt-table`: кадры макета в витрине. Таблица шире своего контейнера,
 * контейнер прокручивается вбок, и прокрутка ставится после первой отрисовки — так, как её
 * поставил бы человек. Карточки выключены: закрепление живёт только в табличном виде.
 */
@Component({
    selector: 'app-table-pinned',
    templateUrl: './test-table-pinned.component.html',
    styleUrl: './test-table-pinned.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'app-table-pinned', 'data-story-root': '' },
    imports: [
        // @angular/cdk
        CdkCell,
        CdkCellDef,
        CdkColumnDef,
        CdkFooterCell,
        CdkFooterCellDef,
        CdkFooterRow,
        CdkFooterRowDef,
        CdkHeaderCell,
        CdkHeaderCellDef,
        CdkHeaderRow,
        CdkHeaderRowDef,
        CdkRow,
        CdkRowDef,

        // standalone components
        RtTableComponent,
        RtTagComponent,
    ],
})
export class TestRtTablePinnedComponent {
    readonly #host: HTMLElement = inject(ElementRef).nativeElement as HTMLElement;

    protected readonly rows: readonly IPinnedRow[] = ROWS;

    protected readonly columns: readonly string[] = COLUMNS;

    protected readonly frames: readonly IPinnedFrame[] = FRAMES;

    constructor() {
        afterNextRender((): void => {
            FRAMES.forEach((frame: IPinnedFrame): void => {
                const scroller: HTMLElement | null = this.#host.querySelector<HTMLElement>(`[data-pinned-frame="${frame.id}"]`);
                if (scroller) {
                    scroller.scrollLeft = frame.scroll === 'end' ? scroller.scrollWidth : frame.scroll;
                }
            });
        });
    }
}
