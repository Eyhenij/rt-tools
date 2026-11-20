import { DebugElement, Provider, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { RT_KIT_LABELS_EN } from '../../../../../../lib/i18n/rt-kit-labels.en';
import { RT_KIT_LABELS } from '../../../../../../lib/i18n/rt-kit-labels.providers';
import { IRtLinkData, rtLinkData } from '../../../../../../lib/util/link-data';
import { createRtFixture, qa, qaAll, setInputs, textOf } from '../../../../../../testing/rt-kit-testing';
import { IRtAiChat } from '../../rt-ai-chat.model';
import { RtAiChatLinkComponent } from './rt-ai-chat-link.component';

const BUTTONS: string[] = ['ai-chat-link-open', 'ai-chat-link-open-new-tab'];

function data(raw: object): IRtLinkData {
    const read: IRtLinkData | null = rtLinkData({ title: 'Продажи за ноябрь', url: '/reports/sales', ...raw });

    if (read === null) {
        throw new Error('the sample block is not valid');
    }

    return read;
}

function setup(raw: object, providers: Provider[] = []): ComponentFixture<RtAiChatLinkComponent> {
    return createRtFixture(RtAiChatLinkComponent, { data: data(raw) }, { providers });
}

function element(fixture: ComponentFixture<RtAiChatLinkComponent>, id: string): HTMLElement {
    const found: DebugElement | null = qa(fixture, id);

    if (found === null) {
        throw new Error(`no element ${id}`);
    }

    return found.nativeElement as HTMLElement;
}

/** Какой рисунок набора показывает значок внутри узла. */
function iconOf(within: Element | null): string | null {
    return within?.querySelector('use')?.getAttribute('href') ?? null;
}

function disabled(fixture: ComponentFixture<RtAiChatLinkComponent>): (string | null)[] {
    return BUTTONS.map((id: string): string | null => element(fixture, id).getAttribute('aria-disabled'));
}

function presses(fixture: ComponentFixture<RtAiChatLinkComponent>): IRtAiChat.LinkPress[] {
    const seen: IRtAiChat.LinkPress[] = [];
    fixture.componentInstance.opened.subscribe((press: IRtAiChat.LinkPress): void => {
        seen.push(press);
    });

    return seen;
}

describe('RtAiChatLinkComponent', (): void => {
    it('SC-UKV-1490 — в ожидании метка нейтральная со спиннером, кнопки aria-disabled и нажатий не отдают', (): void => {
        const fixture: ComponentFixture<RtAiChatLinkComponent> = setup({ state: 'pending' });
        const seen: IRtAiChat.LinkPress[] = presses(fixture);
        const status: HTMLElement = element(fixture, 'ai-chat-link-status');

        expect(textOf(qa(fixture, 'ai-chat-link-status'))).toBe('Opening');
        expect(status.querySelector('.rt-tag')?.className).toContain('rt-tag--severity--neutral');
        expect(status.querySelector('.rt-tag')?.className).toContain('rt-tag--size--sm');
        expect(status.querySelector('rt-icon')?.className).toContain('rt-icon--spin');
        expect(disabled(fixture)).toEqual(['true', 'true']);
        expect(BUTTONS.map((id: string): boolean => (element(fixture, id) as HTMLButtonElement).disabled)).toEqual([false, false]);

        BUTTONS.forEach((id: string): void => element(fixture, id).click());

        expect(seen).toEqual([]);
    });

    it('SC-UKV-1491 — открытая карточка: метка успеха с галочкой, кнопки доступны', (): void => {
        const fixture: ComponentFixture<RtAiChatLinkComponent> = setup({ state: 'opened' });
        const status: HTMLElement = element(fixture, 'ai-chat-link-status');

        expect(textOf(qa(fixture, 'ai-chat-link-status'))).toBe('Opened');
        expect(status.querySelector('.rt-tag')?.className).toContain('rt-tag--severity--success');
        expect(status.querySelector('rt-icon')?.className).not.toContain('rt-icon--spin');
        expect(disabled(fixture)).toEqual([null, null]);
    });

    it('SC-UKV-1492 — отказ: метка ошибки, причина под ней, кнопки доступны; без причины строки нет', (): void => {
        const fixture: ComponentFixture<RtAiChatLinkComponent> = setup({ state: 'failed', reason: 'Нет доступа к разделу «Отчёты»' });
        const status: HTMLElement = element(fixture, 'ai-chat-link-status');

        expect(textOf(qa(fixture, 'ai-chat-link-status'))).toBe('Failed to open');
        expect(status.querySelector('.rt-tag')?.className).toContain('rt-tag--severity--danger');
        expect(textOf(qa(fixture, 'ai-chat-link-reason'))).toBe('Нет доступа к разделу «Отчёты»');
        expect(status.nextElementSibling).toBe(element(fixture, 'ai-chat-link-reason'));
        expect(disabled(fixture)).toEqual([null, null]);
        expect(qa(setup({ state: 'failed' }), 'ai-chat-link-reason')).toBeNull();
    });

    it('SC-UKV-1489 — без исхода нет ни метки, ни причины, кнопки доступны, раздела без текста нет', (): void => {
        const fixture: ComponentFixture<RtAiChatLinkComponent> = setup({ section: 7, state: 'done', reason: 'Нет доступа' });

        expect(qa(fixture, 'ai-chat-link-status')).toBeNull();
        expect(qa(fixture, 'ai-chat-link-reason')).toBeNull();
        expect(qa(fixture, 'ai-chat-link-section')).toBeNull();
        expect(disabled(fixture)).toEqual([null, null]);
    });

    it('SC-UKV-1493, SC-UKV-1494 — «Открыть» отдаёт адрес без новой вкладки, вторая кнопка — с новой, каждое нажатие отдельно', (): void => {
        const fixture: ComponentFixture<RtAiChatLinkComponent> = setup({ url: ' /reports/sales?month=11 ', state: 'failed' });
        const seen: IRtAiChat.LinkPress[] = presses(fixture);

        element(fixture, 'ai-chat-link-open').click();
        element(fixture, 'ai-chat-link-open-new-tab').click();
        element(fixture, 'ai-chat-link-open-new-tab').click();

        expect(seen).toEqual([
            { url: '/reports/sales?month=11', newTab: false },
            { url: '/reports/sales?month=11', newTab: true },
            { url: '/reports/sales?month=11', newTab: true },
        ]);
        expect(textOf(qa(fixture, 'ai-chat-link-status'))).toBe('Failed to open');
    });

    it('SC-UKV-1495 — смена исхода той же карточки меняет метку, держит фокус и объявляет «название: исход»', (): void => {
        const fixture: ComponentFixture<RtAiChatLinkComponent> = setup({ state: 'pending' });
        const open: HTMLElement = element(fixture, 'ai-chat-link-open');
        document.body.appendChild(fixture.nativeElement as HTMLElement);
        open.focus();

        expect(qa(fixture, 'ai-chat-link-announcement')).toBeNull();

        setInputs(fixture, { data: data({ state: 'opened' }) });
        fixture.detectChanges();

        expect(textOf(qa(fixture, 'ai-chat-link-status'))).toBe('Opened');
        expect(element(fixture, 'ai-chat-link-open')).toBe(open);
        expect(document.activeElement).toBe(open);
        expect(disabled(fixture)).toEqual([null, null]);
        expect(textOf(qa(fixture, 'ai-chat-link-announcement'))).toBe('Продажи за ноябрь: Opened');

        setInputs(fixture, { data: data({ state: 'failed', reason: 'Нет доступа' }) });
        fixture.detectChanges();

        expect(textOf(qa(fixture, 'ai-chat-link-announcement'))).toBe('Продажи за ноябрь: Failed to open. Нет доступа');
        (fixture.nativeElement as HTMLElement).remove();
    });

    it('SC-UKV-1495 — карточка, пришедшая сразу с отказом, ничего не объявляет', (): void => {
        const fixture: ComponentFixture<RtAiChatLinkComponent> = setup({ state: 'failed', reason: 'Нет доступа' });

        expect(qa(fixture, 'ai-chat-link-announcement')).toBeNull();

        setInputs(fixture, { data: data({ state: 'failed', reason: 'Нет доступа', section: 'Отчёты' }) });
        fixture.detectChanges();

        expect(qa(fixture, 'ai-chat-link-announcement')).toBeNull();
    });

    it('SC-UKV-1495 — другая страница на месте карточки не объявляется, даже с новым исходом', (): void => {
        const fixture: ComponentFixture<RtAiChatLinkComponent> = setup({ state: 'pending' });

        setInputs(fixture, { data: data({ url: '/reports/finance', title: 'Финансы', state: 'failed', reason: 'Нет доступа' }) });
        fixture.detectChanges();

        expect(textOf(qa(fixture, 'ai-chat-link-status'))).toBe('Failed to open');
        expect(qa(fixture, 'ai-chat-link-announcement')).toBeNull();

        setInputs(fixture, { data: data({ url: '/reports/finance', title: 'Финансы', state: 'opened' }) });
        fixture.detectChanges();

        expect(textOf(qa(fixture, 'ai-chat-link-announcement'))).toBe('Финансы: Opened');
    });

    it('SC-UKV-1495 — новая причина того же отказа объявляется заново', (): void => {
        const fixture: ComponentFixture<RtAiChatLinkComponent> = setup({ state: 'pending' });

        setInputs(fixture, { data: data({ state: 'failed', reason: 'Нет доступа' }) });
        fixture.detectChanges();
        setInputs(fixture, { data: data({ state: 'failed', reason: 'Сервер не ответил' }) });
        fixture.detectChanges();

        expect(textOf(qa(fixture, 'ai-chat-link-reason'))).toBe('Сервер не ответил');
        expect(textOf(qa(fixture, 'ai-chat-link-announcement'))).toBe('Продажи за ноябрь: Failed to open. Сервер не ответил');
    });

    it('SC-UKV-1492 — причина рисуется и объявляется только при отказе, что бы ни пришло во входе', (): void => {
        const fixture: ComponentFixture<RtAiChatLinkComponent> = setup({ state: 'pending' });

        setInputs(fixture, { data: { ...data({ state: 'opened' }), reason: 'Нет доступа' } });
        fixture.detectChanges();

        expect(qa(fixture, 'ai-chat-link-reason')).toBeNull();
        expect(textOf(qa(fixture, 'ai-chat-link-announcement'))).toBe('Продажи за ноябрь: Opened');
    });

    it('SC-UKV-1490, SC-UKV-1491, SC-UKV-1492 — у каждого исхода свой значок метки', (): void => {
        const icons: (string | null)[] = ['pending', 'opened', 'failed'].map((state: string): string | null =>
            iconOf(element(setup({ state }), 'ai-chat-link-status'))
        );

        expect(icons).toEqual(['#rt-icon-spinner', '#rt-icon-check', '#rt-icon-exclamation-circle']);
    });

    it('SC-UKV-1489 — значок карточки берётся по имени из набора кита, имя вне набора рисуется значком link', (): void => {
        const names: object[] = [{ icon: 'chart-bar' }, {}, { icon: '../../secret' }, { icon: 'no-such-icon' }];
        const drawn: (string | null)[] = names.map((raw: object): string | null =>
            iconOf((setup(raw).nativeElement as HTMLElement).querySelector('.rt-ai-chat-link__icon-box'))
        );

        expect(drawn).toEqual(['#rt-icon-chart-bar', '#rt-icon-link', '#rt-icon-link', '#rt-icon-link']);
    });

    it('SC-UKV-1499 — карточка — группа с именем по названию, значок скрыт от читалки', (): void => {
        const fixture: ComponentFixture<RtAiChatLinkComponent> = setup({ icon: 'chart-bar' });
        const host: HTMLElement = fixture.nativeElement as HTMLElement;

        expect(host.getAttribute('role')).toBe('group');
        expect(host.getAttribute('aria-label')).toBe('Продажи за ноябрь');
        expect(host.querySelector('.rt-ai-chat-link__icon-box')?.getAttribute('aria-hidden')).toBe('true');
    });

    it('SC-UKV-1501 — метки и кнопки пишутся подписями переводчика кита', (): void => {
        const labels: Provider = {
            provide: RT_KIT_LABELS,
            useValue: signal({
                ...RT_KIT_LABELS_EN,
                aiLinkOpening: 'Открывается',
                aiLinkOpened: 'Открыта',
                aiLinkFailed: 'Не открылась',
                aiLinkOpen: 'Открыть',
                aiLinkOpenNewTab: 'В новой вкладке',
            }),
        };
        const statuses: string[] = ['pending', 'opened', 'failed'].map((state: string): string =>
            textOf(qa(setup({ state }, [labels]), 'ai-chat-link-status'))
        );
        const fixture: ComponentFixture<RtAiChatLinkComponent> = setup({ state: 'opened' }, [labels]);

        expect(statuses).toEqual(['Открывается', 'Открыта', 'Не открылась']);
        expect(qaAll(fixture, 'ai-chat-link-open').map(textOf)).toEqual(['Открыть']);
        expect(qaAll(fixture, 'ai-chat-link-open-new-tab').map(textOf)).toEqual(['В новой вкладке']);
    });
});
