import { Clipboard } from '@angular/cdk/clipboard';
import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { RT_KIT_LOCALE, RT_KIT_TRANSLATOR } from '../../../../../../lib/i18n/rt-kit-labels.providers';
import { TRtKitTranslator } from '../../../../../../lib/i18n/rt-kit-labels.model';
import { IRtTableData, rtTableData } from '../../../../../../lib/util/table-data';
import { createRtFixture, qa, qaAll, textOf } from '../../../../../../testing/rt-kit-testing';
import { RtAiChatTableComponent } from './rt-ai-chat-table.component';

/** Буфер обмена без браузера: помнит, что в него клали, и отвечает успехом или отказом. */
class ClipboardDouble {
    public readonly copied: string[] = [];
    public refuse: boolean = false;

    public copy(text: string): boolean {
        if (this.refuse) {
            return false;
        }
        this.copied.push(text);

        return true;
    }
}

function table(columns: unknown, rows: unknown, total: unknown = null): IRtTableData {
    const data: IRtTableData | null = rtTableData(columns, rows, total);

    if (data === null) {
        throw new Error('the sample table is not valid');
    }

    return data;
}

const REVENUE: IRtTableData = table(
    [
        { label: 'Объект', type: 'text' },
        { label: 'Ночи', type: 'number' },
        { label: 'Выручка', type: 'currency', currency: 'EUR' },
    ],
    [
        ['Вилла', 20, 4200],
        ['Дом', 3, -150],
    ],
    ['Итого', 23, 4050]
);

interface ISetup {
    readonly fixture: ComponentFixture<RtAiChatTableComponent>;
    readonly clipboard: ClipboardDouble;
    readonly locale: WritableSignal<string>;
}

function setup(data: IRtTableData = REVENUE, translator?: WritableSignal<TRtKitTranslator>): ISetup {
    const clipboard: ClipboardDouble = new ClipboardDouble();
    const locale: WritableSignal<string> = signal<string>('en');
    const fixture: ComponentFixture<RtAiChatTableComponent> = createRtFixture(
        RtAiChatTableComponent,
        { data },
        {
            providers: [
                { provide: Clipboard, useValue: clipboard },
                { provide: RT_KIT_LOCALE, useValue: locale },
                ...(translator ? [{ provide: RT_KIT_TRANSLATOR, useValue: translator }] : []),
            ],
        }
    );

    return { fixture, clipboard, locale };
}

function cells(fixture: ComponentFixture<RtAiChatTableComponent>, id: string): HTMLElement[] {
    return qaAll(fixture, id).map((cell: { nativeElement: unknown }): HTMLElement => cell.nativeElement as HTMLElement);
}

function texts(fixture: ComponentFixture<RtAiChatTableComponent>, id: string): string[] {
    return cells(fixture, id).map((cell: HTMLElement): string => textOf(cell));
}

function copyButton(fixture: ComponentFixture<RtAiChatTableComponent>): HTMLButtonElement {
    return qa(fixture, 'ai-chat-table-copy')?.nativeElement as HTMLButtonElement;
}

describe('RtAiChatTableComponent', (): void => {
    afterEach((): void => {
        jest.useRealTimers();
    });

    it('SC-UKV-1398 — значения записаны по роду столбца в языке кита', (): void => {
        const { fixture } = setup();

        expect(texts(fixture, 'ai-chat-table-cell')).toEqual(['Вилла', '20', '€4,200.00', 'Дом', '3', '-€150.00']);
    });

    it('SC-UKV-1397 — числовые столбцы и их шапка стоят к концу, текстовые к началу', (): void => {
        const { fixture } = setup();
        const head: HTMLElement[] = cells(fixture, 'ai-chat-table-head-cell');
        const body: HTMLElement[] = cells(fixture, 'ai-chat-table-cell');

        expect(head.map((cell: HTMLElement): boolean => cell.classList.contains('rt-ai-chat-table__cell--end'))).toEqual([
            false,
            true,
            true,
        ]);
        expect(body.slice(0, 3).map((cell: HTMLElement): boolean => cell.classList.contains('rt-ai-chat-table__cell--end'))).toEqual([
            false,
            true,
            true,
        ]);
    });

    it('SC-UKV-1400 — значение ниже нуля и в строке итога помечено цветом ошибки, прочие нет', (): void => {
        const { fixture } = setup(table([{ label: 'N', type: 'number' }], [[-10], [0], [15]], [-5]));
        const negative: boolean[] = cells(fixture, 'ai-chat-table-cell').map((cell: HTMLElement): boolean =>
            cell.classList.contains('rt-ai-chat-table__cell--negative')
        );
        const total: HTMLElement = qa(fixture, 'ai-chat-table-total')?.nativeElement as HTMLElement;

        expect(negative).toEqual([true, false, false]);
        expect(total.querySelector('.rt-ai-chat-table__cell--negative')).not.toBeNull();
    });

    it('SC-UKV-1401 — строка в числовом столбце стоит как пришла, без цвета', (): void => {
        const { fixture } = setup(table([{ label: 'N', type: 'number' }], [['n/a'], ['-12']]));
        const body: HTMLElement[] = cells(fixture, 'ai-chat-table-cell');

        expect(body.map((cell: HTMLElement): string => textOf(cell))).toEqual(['n/a', '-12']);
        expect(body.some((cell: HTMLElement): boolean => cell.classList.contains('rt-ai-chat-table__cell--negative'))).toBe(false);
    });

    it('SC-UKV-1406 — итог стоит после строк в tfoot, полужирной строкой', (): void => {
        const { fixture } = setup();
        const total: HTMLElement = qa(fixture, 'ai-chat-table-total')?.nativeElement as HTMLElement;

        expect(total.parentElement?.tagName).toBe('TFOOT');
        expect(total.classList).toContain('rt-ai-chat-table__row--total');
        expect(Array.from(total.children).map((cell: Element): string => textOf(cell as HTMLElement))).toEqual([
            'Итого',
            '23',
            '€4,050.00',
        ]);
    });

    it('SC-UKV-1404 / SC-UKV-1424 — без строк и без итога рисуется одна шапка, «Copy CSV» на месте', (): void => {
        const { fixture } = setup(table([{ label: 'A', type: 'text' }], [], [null]));
        const host: HTMLElement = fixture.nativeElement as HTMLElement;

        expect(texts(fixture, 'ai-chat-table-head-cell')).toEqual(['A']);
        expect(qaAll(fixture, 'ai-chat-table-cell')).toHaveLength(0);
        expect(host.querySelector('tfoot')).toBeNull();
        expect(copyButton(fixture)).not.toBeNull();
    });

    it('SC-UKV-1410 / SC-UKV-1411 — «Copy CSV» кладёт в буфер CSV с сырыми числами и итогом последней строкой', (): void => {
        const { fixture, clipboard } = setup();

        copyButton(fixture).click();

        expect(clipboard.copied).toEqual(['Объект,Ночи,Выручка\r\nВилла,20,4200\r\nДом,3,-150\r\nИтого,23,4050']);
    });

    it('SC-UKV-1412 — после копии «Copied» стоит две секунды и объявляется спокойно', (): void => {
        jest.useFakeTimers();
        const { fixture } = setup();
        const status: HTMLElement = (fixture.nativeElement as HTMLElement).querySelector('[role="status"]') as HTMLElement;

        copyButton(fixture).click();
        fixture.detectChanges();

        expect(copyButton(fixture).getAttribute('aria-label')).toBe('Copied');
        expect(status.getAttribute('aria-live')).toBe('polite');
        expect(textOf(status)).toBe('Copied');

        jest.advanceTimersByTime(2000);
        fixture.detectChanges();

        expect(copyButton(fixture).getAttribute('aria-label')).toBe('Copy CSV');
        expect(textOf(status)).toBe('');
    });

    it('SC-UKV-1413 — отказ буфера оставляет кнопку как была', (): void => {
        const { fixture, clipboard } = setup();
        clipboard.refuse = true;

        copyButton(fixture).click();
        fixture.detectChanges();

        expect(copyButton(fixture).getAttribute('aria-label')).toBe('Copy CSV');
    });

    it('SC-UKV-1415 — нарисованная таблица следует смене языка кита', (): void => {
        const { fixture, locale } = setup(table([{ label: 'N', type: 'number' }], [[1234.5]]));

        locale.set('de');
        fixture.detectChanges();

        expect(texts(fixture, 'ai-chat-table-cell')).toEqual(['1.234,5']);
    });

    it('SC-UKV-1419 — таблица читается таблицей, окно прокрутки доступно с клавиатуры и названо', (): void => {
        const { fixture } = setup();
        const scroll: HTMLElement = qa(fixture, 'ai-chat-table-scroll')?.nativeElement as HTMLElement;
        const head: HTMLElement[] = cells(fixture, 'ai-chat-table-head-cell');

        expect(scroll.getAttribute('tabindex')).toBe('0');
        expect(scroll.getAttribute('aria-label')).toBe('Table');
        expect(head.every((cell: HTMLElement): boolean => cell.tagName === 'TH' && cell.getAttribute('scope') === 'col')).toBe(true);
        expect(scroll.querySelector('thead')).not.toBeNull();
        expect(scroll.querySelector('tbody')).not.toBeNull();
    });

    it('SC-UKV-1429 — новая таблица того же блока не сбрасывает «Copied» и окно прокрутки', (): void => {
        const { fixture } = setup();
        const scroll: HTMLElement = qa(fixture, 'ai-chat-table-scroll')?.nativeElement as HTMLElement;

        copyButton(fixture).click();
        fixture.componentRef.setInput('data', table([{ label: 'A', type: 'text' }], [['одна'], ['две']]));
        fixture.detectChanges();

        expect(qa(fixture, 'ai-chat-table-scroll')?.nativeElement).toBe(scroll);
        expect(copyButton(fixture).getAttribute('aria-label')).toBe('Copied');
        expect(texts(fixture, 'ai-chat-table-cell')).toEqual(['одна', 'две']);
    });

    it('SC-UKV-1430 — «Copy CSV» копирует строки, нарисованные на минуту нажатия', (): void => {
        const { fixture, clipboard } = setup(table([{ label: 'A', type: 'text' }], [['одна']]));

        copyButton(fixture).click();
        fixture.componentRef.setInput('data', table([{ label: 'A', type: 'text' }], [['одна'], ['две']]));
        fixture.detectChanges();
        copyButton(fixture).click();

        expect(clipboard.copied).toEqual(['A\r\nодна', 'A\r\nодна\r\nдве']);
    });

    it('SC-UKV-1431 — повторное нажатие копирует снова и начинает две секунды заново', (): void => {
        jest.useFakeTimers();
        const { fixture, clipboard } = setup();

        copyButton(fixture).click();
        jest.advanceTimersByTime(1500);
        copyButton(fixture).click();
        jest.advanceTimersByTime(1500);
        fixture.detectChanges();

        expect(clipboard.copied).toHaveLength(2);
        expect(copyButton(fixture).getAttribute('aria-label')).toBe('Copied');

        jest.advanceTimersByTime(500);
        fixture.detectChanges();

        expect(copyButton(fixture).getAttribute('aria-label')).toBe('Copy CSV');
    });

    it('SC-UKV-1431 — смена языка во время «Copied» меняет подпись, не начиная две секунды заново', (): void => {
        jest.useFakeTimers();
        const translator: WritableSignal<TRtKitTranslator> = signal<TRtKitTranslator>((): string => '');
        const { fixture } = setup(REVENUE, translator);

        copyButton(fixture).click();
        jest.advanceTimersByTime(1500);
        translator.set((key: string): string => (key === 'uiCopied' ? 'Скопировано' : ''));
        fixture.detectChanges();

        expect(copyButton(fixture).getAttribute('aria-label')).toBe('Скопировано');

        jest.advanceTimersByTime(500);
        fixture.detectChanges();

        expect(copyButton(fixture).getAttribute('aria-label')).toBe('Copy CSV');
    });

    it('SC-UKV-1432 — рисуется каждая строка, без предела', (): void => {
        const rows: number[][] = Array.from({ length: 500 }, (_: unknown, index: number): number[] => [index]);
        const { fixture } = setup(table([{ label: 'N', type: 'number' }], rows));

        expect(qaAll(fixture, 'ai-chat-table-cell')).toHaveLength(500);
    });
});
