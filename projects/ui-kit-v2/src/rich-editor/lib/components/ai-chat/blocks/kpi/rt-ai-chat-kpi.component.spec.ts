import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { RT_KIT_LOCALE } from '../../../../../../lib/i18n/rt-kit-labels.providers';
import { IRtKpiItem, rtKpiItems } from '../../../../../../lib/util/kpi-data';
import { classesOf, createRtFixture, qa, qaAll, setInputs, textOf } from '../../../../../../testing/rt-kit-testing';
import { RtAiChatKpiComponent } from './rt-ai-chat-kpi.component';

/** Неразрывный пробел, которым `Intl` в `ru` отделяет знак процента и знак валюты. */
const NBSP: string = String.fromCharCode(0xa0);

function items(raw: readonly object[]): IRtKpiItem[] {
    const read: IRtKpiItem[] | null = rtKpiItems(raw);

    if (read === null) {
        throw new Error('the sample items are not valid');
    }

    return read;
}

interface ISetup {
    readonly fixture: ComponentFixture<RtAiChatKpiComponent>;
    readonly locale: WritableSignal<string>;
}

function setup(raw: readonly object[], code: string = 'ru'): ISetup {
    const locale: WritableSignal<string> = signal(code);
    const fixture: ComponentFixture<RtAiChatKpiComponent> = createRtFixture(
        RtAiChatKpiComponent,
        { items: items(raw) },
        { providers: [{ provide: RT_KIT_LOCALE, useValue: locale }] }
    );

    return { fixture, locale };
}

function texts(fixture: ComponentFixture<RtAiChatKpiComponent>, id: string): string[] {
    return qaAll(fixture, id).map(textOf);
}

function plain(value: string): string {
    return value.replace(new RegExp(`[${NBSP}${String.fromCharCode(0x202f)}]`, 'g'), ' ');
}

describe('RtAiChatKpiComponent', (): void => {
    it('SC-UKV-1462 — блок — список, карточки — его пункты по порядку', (): void => {
        const { fixture } = setup([
            { label: 'Выручка', value: 1240000, format: 'currency', currency: 'RUB' },
            { label: 'Ночи', value: 312 },
            { label: 'Загрузка', value: 0.78, format: 'percent' },
        ]);

        expect((qa(fixture, 'ai-chat-kpi')?.nativeElement as HTMLElement).tagName).toBe('UL');
        expect(qaAll(fixture, 'ai-chat-kpi-card').map((card) => (card.nativeElement as HTMLElement).tagName)).toEqual(['LI', 'LI', 'LI']);
        expect(texts(fixture, 'stat-tile-label')).toEqual(['Выручка', 'Ночи', 'Загрузка']);
    });

    it('SC-UKV-1440, SC-UKV-1441 — значение пишется по роду в языке кита, от миллиона коротко', (): void => {
        const { fixture } = setup([
            { label: 'Выручка', value: 1240000, format: 'currency', currency: 'RUB' },
            { label: 'Средний чек', value: 8400, format: 'currency', currency: 'RUB' },
        ]);

        expect(texts(fixture, 'stat-tile-value').map(plain)).toEqual(['1,24 млн ₽', '8 400 ₽']);
    });

    it('SC-UKV-1449 — дельта несёт знак, стрелку и направление; ноль ровный', (): void => {
        const { fixture } = setup([12.5, -4, 0, 0.04, -0.04].map((delta: number): object => ({ label: 'A', value: 1, delta })));

        expect(texts(fixture, 'stat-tile-delta-percent')).toEqual([`+12,5${NBSP}%`, `-4${NBSP}%`, `0${NBSP}%`, `0${NBSP}%`, `0${NBSP}%`]);
        expect(qaAll(fixture, 'stat-tile-delta').map((node) => node.attributes['data-direction'])).toEqual([
            'up',
            'down',
            'flat',
            'flat',
            'flat',
        ]);
    });

    it('SC-UKV-1448 — «рост — плохо» переворачивает цвет, стрелка остаётся по знаку', (): void => {
        const { fixture } = setup([
            { label: 'Отмены', value: 14, delta: 8, growthIsGood: false },
            { label: 'Отмены', value: 10, delta: -8, growthIsGood: false },
            { label: 'Выручка', value: 10, delta: 8 },
        ]);
        const tiles: string[][] = qaAll(fixture, 'stat-tile').map((node) => classesOf(node));

        expect(tiles[0]).toContain('rt-stat-tile--growth-worse');
        expect(tiles[1]).toContain('rt-stat-tile--growth-worse');
        expect(tiles[2]).not.toContain('rt-stat-tile--growth-worse');
        expect(qaAll(fixture, 'stat-tile-delta').map((node) => node.attributes['data-direction'])).toEqual(['up', 'down', 'up']);
    });

    it('SC-UKV-1450 — карточка без дельты держит название, значение и период', (): void => {
        const { fixture } = setup([{ label: 'Выручка', value: 1200, base: 'vs LY', period: 'ноябрь 2026' }]);

        expect(texts(fixture, 'stat-tile-label')).toEqual(['Выручка']);
        expect(texts(fixture, 'stat-tile-secondary')).toEqual(['ноябрь 2026']);
        expect(qa(fixture, 'stat-tile-delta')).toBeNull();
        expect(qa(fixture, 'stat-tile-delta-caption')).toBeNull();
    });

    it('SC-UKV-1451 — подпись базы видна после дельты, title её не дублирует', (): void => {
        const { fixture } = setup([{ label: 'Выручка', value: 1200, delta: 12.5, base: 'vs LY' }]);

        expect(textOf(qa(fixture, 'stat-tile-delta-caption'))).toBe('vs LY');
        expect(qa(fixture, 'stat-tile-delta')?.attributes['title']).toBeUndefined();
    });

    it('SC-UKV-1452 — нарисованный блок идёт за сменой языка кита', (): void => {
        const { fixture, locale } = setup([{ label: 'Выручка', value: 1240000, format: 'currency', currency: 'RUB', delta: 12.5 }]);

        locale.set('en');
        fixture.detectChanges();

        expect(plain(textOf(qa(fixture, 'stat-tile-value')))).toBe('RUB 1.24M');
        expect(textOf(qa(fixture, 'stat-tile-delta-percent'))).toBe('+12.5%');
    });

    it('SC-UKV-1463 — новый вход того же блока перерисовывает карточки', (): void => {
        const { fixture } = setup([{ label: 'A', value: 1 }]);

        setInputs(fixture, {
            items: items([
                { label: 'B', value: 2 },
                { label: 'C', value: 3 },
            ]),
        });
        fixture.detectChanges();

        expect(texts(fixture, 'stat-tile-label')).toEqual(['B', 'C']);
    });

    it('SC-UKV-1477 — язык, который Intl не принимает, пишет блок как en', (): void => {
        const { fixture } = setup([{ label: 'Выручка', value: 8400, format: 'currency', currency: 'EUR', delta: 12.5 }], '!!');

        expect(textOf(qa(fixture, 'stat-tile-value'))).toBe('€8,400');
        expect(textOf(qa(fixture, 'stat-tile-delta-percent'))).toBe('+12.5%');
    });

    it('SC-UKV-1478 — у карточки KPI нет годового чипа и строки «было»', (): void => {
        const { fixture } = setup([{ label: 'Выручка', value: 1200, delta: 12.5, base: 'vs LY', period: 'ноябрь 2026' }]);

        expect(qaAll(fixture, 'stat-tile-delta').length).toBe(1);
        expect(qa(fixture, 'stat-tile-year')).toBeNull();
        expect(qa(fixture, 'stat-tile-baseline')).toBeNull();
    });

    it('плитка карточки компактная', (): void => {
        expect(classesOf(qa(setup([{ label: 'A', value: 1 }]).fixture, 'stat-tile'))).toContain('rt-stat-tile--compact');
    });
});
