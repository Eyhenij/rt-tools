import { DebugElement, Provider, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { RT_KIT_LABELS_EN } from '../../../../../../lib/i18n/rt-kit-labels.en';
import { RT_KIT_LABELS } from '../../../../../../lib/i18n/rt-kit-labels.providers';
import { IRtSourcesData, rtSourcesData } from '../../../../../../lib/util/sources-data';
import { createRtFixture, qa, qaAll, setInputs, textOf } from '../../../../../../testing/rt-kit-testing';
import { IRtAiChat } from '../../rt-ai-chat.model';
import { RtAiChatSourcesComponent } from './rt-ai-chat-sources.component';

const FIVE: object[] = [
    { title: 'Отчёт «Продажи»', detail: 'Ноябрь 2026', icon: 'chart-bar', url: '/reports/sales' },
    { title: 'Таблица броней', detail: 'Страница 3', icon: 'table', url: '/bookings' },
    { title: 'Договор аренды', icon: 'file-pdf', url: '/files/contract' },
    { title: 'Склад', detail: 'Обновлено вчера', icon: 'database' },
    { title: 'Прочее', icon: 'no-such-icon-name' },
];

function data(items: object[]): IRtSourcesData {
    const read: IRtSourcesData | null = rtSourcesData({ items });

    if (read === null) {
        throw new Error('the sample block is not valid');
    }

    return read;
}

function setup(items: object[], providers: Provider[] = []): ComponentFixture<RtAiChatSourcesComponent> {
    return createRtFixture(RtAiChatSourcesComponent, { data: data(items) }, { providers });
}

function header(fixture: ComponentFixture<RtAiChatSourcesComponent>): HTMLButtonElement {
    const found: DebugElement | null = qa(fixture, 'expansion-panel-header');

    if (found === null) {
        throw new Error('no header');
    }

    return found.nativeElement as HTMLButtonElement;
}

async function toggle(fixture: ComponentFixture<RtAiChatSourcesComponent>): Promise<void> {
    header(fixture).click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
}

function rows(fixture: ComponentFixture<RtAiChatSourcesComponent>): HTMLElement[] {
    return qaAll(fixture, 'ai-chat-sources-item').map((item: DebugElement): HTMLElement => item.nativeElement as HTMLElement);
}

/** Какой рисунок набора показывает значок внутри узла. */
function iconOf(within: Element | null): string | null {
    return within?.querySelector('use')?.getAttribute('href') ?? null;
}

function presses(fixture: ComponentFixture<RtAiChatSourcesComponent>): IRtAiChat.SourcePress[] {
    const seen: IRtAiChat.SourcePress[] = [];
    fixture.componentInstance.opened.subscribe((press: IRtAiChat.SourcePress): void => {
        seen.push(press);
    });

    return seen;
}

describe('RtAiChatSourcesComponent', (): void => {
    it('SC-UKV-1542 — один источник даёт число 1 и свёрнутый список без строк', (): void => {
        const fixture: ComponentFixture<RtAiChatSourcesComponent> = setup([{ title: 'Отчёт «Продажи»', detail: 'Страница 3' }]);

        expect(textOf(qa(fixture, 'ai-chat-sources-label'))).toBe('Sources');
        expect(textOf(qa(fixture, 'ai-chat-sources-count'))).toBe('1');
        expect(header(fixture).getAttribute('aria-expanded')).toBe('false');
        expect(rows(fixture)).toHaveLength(0);
    });

    it('SC-UKV-1543 — пять источников дают число 5, а раскрытый список держит строки в заданном порядке', async (): Promise<void> => {
        const fixture: ComponentFixture<RtAiChatSourcesComponent> = setup(FIVE);

        expect(textOf(qa(fixture, 'ai-chat-sources-count'))).toBe('5');
        expect(rows(fixture)).toHaveLength(0);

        await toggle(fixture);

        expect(qaAll(fixture, 'ai-chat-sources-title').map((title: DebugElement): string => textOf(title))).toEqual([
            'Отчёт «Продажи»',
            'Таблица броней',
            'Договор аренды',
            'Склад',
            'Прочее',
        ]);
    });

    it('SC-UKV-1544 — нажатие заголовка раскрывает и сворачивает список, состояние читает кнопка', async (): Promise<void> => {
        const fixture: ComponentFixture<RtAiChatSourcesComponent> = setup(FIVE);
        const states: (string | null)[] = [];

        for (let step: number = 0; step < 4; step++) {
            await toggle(fixture);
            states.push(header(fixture).getAttribute('aria-expanded'));
        }

        expect(states).toEqual(['true', 'false', 'true', 'false']);
        expect(header(fixture).tagName).toBe('BUTTON');
    });

    it('SC-UKV-1546 — нажатие источника с адресом отдаёт адрес и название, повторное нажатие даёт второе событие', async (): Promise<void> => {
        const fixture: ComponentFixture<RtAiChatSourcesComponent> = setup(FIVE);
        const seen: IRtAiChat.SourcePress[] = presses(fixture);

        await toggle(fixture);
        const button: HTMLElement = qaAll(fixture, 'ai-chat-sources-open')[0].nativeElement as HTMLElement;
        button.click();
        button.click();

        expect(seen).toEqual([
            { url: '/reports/sales', title: 'Отчёт «Продажи»' },
            { url: '/reports/sales', title: 'Отчёт «Продажи»' },
        ]);
    });

    it('SC-UKV-1547 — источник без адреса рисуется текстом, а не кнопкой, и ничего не отдаёт', async (): Promise<void> => {
        const fixture: ComponentFixture<RtAiChatSourcesComponent> = setup([{ title: 'Склад', detail: 'Обновлено вчера' }]);
        const seen: IRtAiChat.SourcePress[] = presses(fixture);

        await toggle(fixture);
        const plain: HTMLElement = qa(fixture, 'ai-chat-sources-plain')?.nativeElement as HTMLElement;

        expect(qaAll(fixture, 'ai-chat-sources-open')).toHaveLength(0);
        expect(plain.tagName).not.toBe('BUTTON');
        plain.click();
        expect(seen).toEqual([]);
    });

    it('SC-UKV-1551 — имя значка вне набора кита заменяется значком file', async (): Promise<void> => {
        const foreign: ComponentFixture<RtAiChatSourcesComponent> = setup([{ title: 'Прочее', icon: 'no-such-icon-name' }]);

        await toggle(foreign);
        const fallback: string | null = iconOf(rows(foreign)[0]);
        const plain: ComponentFixture<RtAiChatSourcesComponent> = setup([{ title: 'Прочее', icon: 'file' }]);

        await toggle(plain);

        const own: ComponentFixture<RtAiChatSourcesComponent> = setup([{ title: 'Отчёт', icon: 'chart-bar' }]);

        await toggle(own);

        expect(fallback).not.toBeNull();
        expect(fallback).toBe(iconOf(rows(plain)[0]));
        expect(iconOf(rows(own)[0])).not.toBe(fallback);
    });

    it('SC-UKV-1554 — тело списка — область с именем заголовка, строки — пункты списка, значок скрыт, уточнение описывает кнопку', async (): Promise<void> => {
        const fixture: ComponentFixture<RtAiChatSourcesComponent> = setup(FIVE);

        await toggle(fixture);
        const region: HTMLElement = (fixture.nativeElement as HTMLElement).querySelector('[role="region"]') as HTMLElement;
        const list: HTMLElement = qa(fixture, 'ai-chat-sources-list')?.nativeElement as HTMLElement;
        const button: HTMLElement = qaAll(fixture, 'ai-chat-sources-open')[0].nativeElement as HTMLElement;
        const detail: HTMLElement = qaAll(fixture, 'ai-chat-sources-detail')[0].nativeElement as HTMLElement;
        const icons: Element[] = Array.from(list.querySelectorAll('.rt-ai-chat-sources__icon'));

        expect(region.getAttribute('aria-labelledby')).toBe(header(fixture).id);
        expect(list.tagName).toBe('UL');
        expect(rows(fixture).every((item: HTMLElement): boolean => item.tagName === 'LI')).toBe(true);
        expect(icons).toHaveLength(5);
        expect(icons.every((icon: Element): boolean => icon.getAttribute('aria-hidden') === 'true')).toBe(true);
        const title: HTMLElement = qaAll(fixture, 'ai-chat-sources-title')[0].nativeElement as HTMLElement;

        expect(button.getAttribute('aria-describedby')).toBe(detail.id);
        expect(detail.id).not.toBe('');
        expect(title.id).not.toBe('');
        expect(button.getAttribute('aria-labelledby')).toBe(title.id);
        expect(header(fixture).tagName).toBe('BUTTON');
    });

    it('SC-UKV-1555 — подпись заголовка идёт из переводчика кита', (): void => {
        const fixture: ComponentFixture<RtAiChatSourcesComponent> = setup(FIVE, [
            { provide: RT_KIT_LABELS, useValue: signal({ ...RT_KIT_LABELS_EN, aiSources: 'Источники' }) },
        ]);

        expect(textOf(qa(fixture, 'ai-chat-sources-label'))).toBe('Источники');
    });

    it('SC-UKV-1561 — равные источники не склеиваются: две строки и число 2', async (): Promise<void> => {
        const fixture: ComponentFixture<RtAiChatSourcesComponent> = setup([{ title: 'Склад' }, { title: 'Склад' }]);

        await toggle(fixture);

        expect(textOf(qa(fixture, 'ai-chat-sources-count'))).toBe('2');
        expect(rows(fixture)).toHaveLength(2);
    });

    it('SC-UKV-1560 — рост списка при стриме держит список раскрытым и меняет число', async (): Promise<void> => {
        const fixture: ComponentFixture<RtAiChatSourcesComponent> = setup(FIVE.slice(0, 2));

        await toggle(fixture);
        setInputs(fixture, { data: data(FIVE) });
        fixture.detectChanges();

        expect(header(fixture).getAttribute('aria-expanded')).toBe('true');
        expect(textOf(qa(fixture, 'ai-chat-sources-count'))).toBe('5');
        expect(rows(fixture)).toHaveLength(5);
    });
});
