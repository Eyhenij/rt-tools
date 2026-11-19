import { signal, Provider, Signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { provideRtKitLabels, RT_KIT_LOCALE, TRtKitLabelKey, TRtKitLabelParams, TRtKitTranslator } from '../../i18n';
import { classesOf, createRtFixture, el, qa, setInputs, textOf } from '../../../testing/rt-kit-testing';
import { IRtStatTile } from './rt-stat-tile.model';
import { RtStatTileComponent } from './rt-stat-tile.component';

/** Неразрывный пробел, которым `Intl` в `ru` отделяет знак процента. */
const NBSP: string = String.fromCharCode(0xa0);

function locale(code: string): Provider {
    return { provide: RT_KIT_LOCALE, useValue: signal(code) };
}

/** Плитка в языке кита `ru` — так пишутся привычные русские ожидания старых сценариев. */
function setup(inputs: Readonly<Record<string, unknown>> = {}, code: string = 'ru'): ComponentFixture<RtStatTileComponent> {
    return createRtFixture(RtStatTileComponent, { label: 'Визиты', value: '1 240', ...inputs }, { providers: [locale(code)] });
}

/** Плитка без языка кита от приложения: работает язык по умолчанию. */
function setupWithoutLocale(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtStatTileComponent> {
    return createRtFixture(RtStatTileComponent, { label: 'Визиты', value: '1 240', ...inputs });
}

function delta(percent: number | null, patch: Partial<IRtStatTile.Delta> = {}): IRtStatTile.Delta {
    return { percent, label: 'к прошлой неделе', ...patch };
}

function deltaText(fixture: ComponentFixture<RtStatTileComponent>): string {
    return textOf(qa(fixture, 'stat-tile-delta-percent'));
}

function icon(fixture: ComponentFixture<RtStatTileComponent>): unknown {
    return el(fixture, '[qa-dataid="stat-tile-delta-icon"] use')?.attributes['href'];
}

describe('RtStatTileComponent', (): void => {
    it('рисует подпись и значение', (): void => {
        const fixture: ComponentFixture<RtStatTileComponent> = setup();

        expect(textOf(qa(fixture, 'stat-tile-label'))).toBe('Визиты');
        expect(textOf(qa(fixture, 'stat-tile-value'))).toBe('1 240');
    });

    it('рисуется отдельной статьёй — плитка самостоятельна', (): void => {
        expect((qa(setup(), 'stat-tile')?.nativeElement as HTMLElement).tagName).toBe('ARTICLE');
    });

    describe('изменение в языке ru', (): void => {
        it('без входа не рисуется', (): void => {
            expect(qa(setup(), 'stat-tile-delta')).toBeNull();
        });

        it('рост показывается со знаком плюс и стрелкой вверх', (): void => {
            const fixture: ComponentFixture<RtStatTileComponent> = setup({ deltaPrimary: delta(12.5) });

            expect(deltaText(fixture)).toBe(`+12,5${NBSP}%`);
            expect(icon(fixture)).toBe('#rt-icon-arrow-up');
        });

        it('падение показывается со своим знаком и стрелкой вниз', (): void => {
            const fixture: ComponentFixture<RtStatTileComponent> = setup({ deltaPrimary: delta(-4) });

            expect(deltaText(fixture)).toBe(`-4${NBSP}%`);
            expect(icon(fixture)).toBe('#rt-icon-arrow-down');
        });

        it('ноль — это не рост и не падение, а ровная линия', (): void => {
            const fixture: ComponentFixture<RtStatTileComponent> = setup({ deltaPrimary: delta(0) });

            expect(deltaText(fixture)).toBe(`0${NBSP}%`);
            expect(qa(fixture, 'stat-tile-delta')?.attributes['data-direction']).toBe('flat');
        });

        it('неизвестное изменение не рисуется вовсе', (): void => {
            // `percent: null` означает «сравнить не с чем»: пустая плашка на
            // месте изменения читалась бы как ноль.
            expect(qa(setup({ deltaPrimary: delta(null) }), 'stat-tile-delta')).toBeNull();
        });

        it('дробная часть пишется разделителем языка', (): void => {
            expect(deltaText(setup({ deltaPrimary: delta(3.7) }))).toBe(`+3,7${NBSP}%`);
        });

        it('направление помечает элемент модификатором и атрибутом данных', (): void => {
            const fixture: ComponentFixture<RtStatTileComponent> = setup({ deltaPrimary: delta(5) });

            expect(classesOf(qa(fixture, 'stat-tile-delta'))).toContain('rt-stat-tile__delta--direction--up');
            expect(qa(fixture, 'stat-tile-delta')?.attributes['data-direction']).toBe('up');
        });

        it('подпись изменения уезжает во всплывающую подсказку элемента', (): void => {
            const fixture: ComponentFixture<RtStatTileComponent> = setup({ deltaPrimary: delta(5) });

            expect(qa(fixture, 'stat-tile-delta')?.attributes['title']).toBe('к прошлой неделе');
        });
    });

    describe('второе изменение', (): void => {
        it('рисуется отдельной строкой с переведённой приставкой', (): void => {
            const fixture: ComponentFixture<RtStatTileComponent> = setup({ deltaSecondary: delta(8, { label: 'к прошлому году' }) });

            expect(textOf(qa(fixture, 'stat-tile-year'))).toBe(`YoY +8${NBSP}%`);
        });

        it('без входа не рисуется', (): void => {
            expect(qa(setup(), 'stat-tile-year')).toBeNull();
        });

        it('SC-UKV-1470 — годовой чип пишется тем же правилом', (): void => {
            const growing: ComponentFixture<RtStatTileComponent> = setup({ deltaSecondary: delta(3.75, { label: 'г/г' }) }, 'en');

            expect(textOf(qa(growing, 'stat-tile-year'))).toBe('YoY +3.8%');
            expect(qa(growing, 'stat-tile-year')?.attributes['data-direction']).toBe('up');

            const flat: ComponentFixture<RtStatTileComponent> = setup({ deltaSecondary: delta(-0.04, { label: 'г/г' }) }, 'en');

            expect(textOf(qa(flat, 'stat-tile-year'))).toBe('YoY 0%');
            expect(qa(flat, 'stat-tile-year')?.attributes['data-direction']).toBe('flat');
        });
    });

    describe('база сравнения', (): void => {
        it('значение подставляется в переведённую приставку', (): void => {
            // Значение уходит параметром перевода: Transloco интерполирует
            // `{{value}}` в момент перевода, и подставлять что-то в уже готовую
            // строку поздно — от подписи осталась бы одна приставка.
            const fixture: ComponentFixture<RtStatTileComponent> = setup({ deltaPrimary: delta(5, { baseline: '1 100' }) });

            expect(textOf(qa(fixture, 'stat-tile-baseline'))).toBe('was 1 100');
        });

        it('смена базы переписывает строку — параметр перевода реактивен', (): void => {
            const fixture: ComponentFixture<RtStatTileComponent> = setup({ deltaPrimary: delta(5, { baseline: '1 100' }) });

            setInputs(fixture, { deltaPrimary: delta(5, { baseline: '900' }) });
            fixture.detectChanges();

            expect(textOf(qa(fixture, 'stat-tile-baseline'))).toBe('was 900');
        });

        it('без базы строки нет', (): void => {
            expect(qa(setup({ deltaPrimary: delta(5) }), 'stat-tile-baseline')).toBeNull();
        });
    });

    describe('единица изменения', (): void => {
        /** Русская подпись пунктов, как её отдаёт переводчик приложения. */
        const translator: Signal<TRtKitTranslator> = signal<TRtKitTranslator>((key: TRtKitLabelKey, params?: TRtKitLabelParams): string =>
            key === 'uiPercentagePoints' ? `${String(Reflect.get(params ?? {}, 'value'))} п.п.` : ''
        );

        function setupRu(inputs: Readonly<Record<string, unknown>>): ComponentFixture<RtStatTileComponent> {
            return createRtFixture(
                RtStatTileComponent,
                { label: 'Занятость', value: '78 %', ...inputs },
                { providers: [provideRtKitLabels({ translator }), locale('ru')] }
            );
        }

        it('SC-UKV-1125 — строка без единицы пишется в процентах языка кита', (): void => {
            expect(deltaText(setup({ deltaPrimary: delta(12) }))).toBe(`+12${NBSP}%`);
        });

        it('SC-UKV-1126 — строка в пунктах пишется подписью кита', (): void => {
            expect(deltaText(setupRu({ deltaPrimary: delta(10, { unit: 'points' }) }))).toBe('+10 п.п.');
        });

        it('SC-UKV-1126 — дробные, отрицательные и нулевые пункты пишутся так же, как проценты', (): void => {
            expect(deltaText(setupRu({ deltaPrimary: delta(2.5, { unit: 'points' }) }))).toBe('+2,5 п.п.');
            expect(deltaText(setupRu({ deltaPrimary: delta(-7, { unit: 'points' }) }))).toBe('-7 п.п.');
            expect(deltaText(setupRu({ deltaPrimary: delta(0, { unit: 'points' }) }))).toBe('0 п.п.');
        });

        it('SC-UKV-1126 — без переводчика пункты пишутся английским умолчанием', (): void => {
            expect(deltaText(setup({ deltaPrimary: delta(10, { unit: 'points' }) }))).toBe('+10 pp');
        });

        it('SC-UKV-1127 — две строки плитки пишутся каждая в своей единице', (): void => {
            const fixture: ComponentFixture<RtStatTileComponent> = setupRu({
                deltaPrimary: delta(10, { unit: 'points' }),
                deltaSecondary: delta(4, { unit: 'percent', label: 'к прошлому году' }),
            });

            expect(deltaText(fixture)).toBe('+10 п.п.');
            expect(textOf(qa(fixture, 'stat-tile-year'))).toContain(`+4${NBSP}%`);
        });

        it('SC-UKV-1128 — строка с неизвестной базой не рисуется в любой единице', (): void => {
            const fixture: ComponentFixture<RtStatTileComponent> = setupRu({
                deltaPrimary: delta(null, { unit: 'points' }),
                deltaSecondary: delta(null, { unit: 'points', label: 'к прошлому году' }),
            });

            expect(qa(fixture, 'stat-tile-value')).not.toBeNull();
            expect(qa(fixture, 'stat-tile-delta')).toBeNull();
            expect(qa(fixture, 'stat-tile-year')).toBeNull();
        });
    });

    describe('язык кита', (): void => {
        it('SC-UKV-1455 — обе единицы пишутся по языку кита: en, затем ru', (): void => {
            expect(deltaText(setup({ deltaPrimary: delta(12.5) }, 'en'))).toBe('+12.5%');
            expect(deltaText(setup({ deltaPrimary: delta(2.5, { unit: 'points' }) }, 'en'))).toBe('+2.5 pp');
            expect(deltaText(setup({ deltaPrimary: delta(12.5) }, 'ru'))).toBe(`+12,5${NBSP}%`);
        });

        it('SC-UKV-1456 — дельта, записанная нулём, ровная и без знака', (): void => {
            for (const value of [-0.04, 0.04]) {
                const fixture: ComponentFixture<RtStatTileComponent> = setup({ deltaPrimary: delta(value) });

                expect(deltaText(fixture)).toBe(`0${NBSP}%`);
                expect(qa(fixture, 'stat-tile-delta')?.attributes['data-direction']).toBe('flat');
                expect(icon(fixture)).toBe('#rt-icon-minus');
            }
        });

        it('SC-UKV-1466 — без языка от приложения дельта пишется как en', (): void => {
            expect(deltaText(setupWithoutLocale({ deltaPrimary: delta(12.5) }))).toBe('+12.5%');
        });

        it('SC-UKV-1469 — у дельты не больше одного дробного знака', (): void => {
            expect(deltaText(setup({ deltaPrimary: delta(3.75) }))).toBe(`+3,8${NBSP}%`);
            expect(deltaText(setup({ deltaPrimary: delta(-4) }))).toBe(`-4${NBSP}%`);
        });

        it('SC-UKV-1471 — язык, который Intl не принимает, пишет дельту как en', (): void => {
            expect(deltaText(setup({ deltaPrimary: delta(12.5) }, '!!'))).toBe('+12.5%');
        });
    });

    describe('размер и видимая подпись', (): void => {
        it('SC-UKV-1453 — плитка без новых входов сохраняет вид', (): void => {
            const fixture: ComponentFixture<RtStatTileComponent> = setup({ deltaPrimary: delta(12.5) });

            expect(classesOf(qa(fixture, 'stat-tile'))).not.toContain('rt-stat-tile--compact');
            expect(qa(fixture, 'stat-tile-delta')?.attributes['title']).toBe('к прошлой неделе');
            expect(qa(fixture, 'stat-tile-delta-caption')).toBeNull();
        });

        it('SC-UKV-1454, SC-UKV-1467, SC-UKV-1468 — компактный размер помечает плитку модификатором', (): void => {
            // Размеры, промежутки и переносы компактной плитки меряет шаг play её истории.
            expect(classesOf(qa(setup({ size: 'compact' }), 'stat-tile'))).toContain('rt-stat-tile--compact');
        });

        it('SC-UKV-1451 — подпись базы видна после числа, и title её не дублирует', (): void => {
            const fixture: ComponentFixture<RtStatTileComponent> = setup({
                deltaPrimary: delta(12.5, { label: 'vs LY' }),
                deltaLabelVisible: true,
            });

            expect(textOf(qa(fixture, 'stat-tile-delta-caption'))).toBe('vs LY');
            expect(qa(fixture, 'stat-tile-delta')?.attributes['title']).toBeUndefined();
        });
    });

    describe('рост хуже', (): void => {
        const worse: string = 'rt-stat-tile--growth-worse';

        it('SC-UKV-1129 — рост помечен как плохой, стрелка вверх', (): void => {
            const fixture: ComponentFixture<RtStatTileComponent> = setup({ growthIsWorse: true, deltaPrimary: delta(40) });

            expect(classesOf(qa(fixture, 'stat-tile'))).toContain(worse);
            expect(qa(fixture, 'stat-tile-delta')?.attributes['data-direction']).toBe('up');
            expect(icon(fixture)).toBe('#rt-icon-arrow-up');
        });

        it('SC-UKV-1130 — падение помечено как хорошее, стрелка вниз', (): void => {
            const fixture: ComponentFixture<RtStatTileComponent> = setup({ growthIsWorse: true, deltaPrimary: delta(-35) });

            expect(classesOf(qa(fixture, 'stat-tile'))).toContain(worse);
            expect(qa(fixture, 'stat-tile-delta')?.attributes['data-direction']).toBe('down');
            expect(icon(fixture)).toBe('#rt-icon-arrow-down');
        });

        it('SC-UKV-1131 — признак стоит на всей плитке и накрывает обе строки', (): void => {
            const fixture: ComponentFixture<RtStatTileComponent> = setup({
                growthIsWorse: true,
                deltaPrimary: delta(40),
                deltaSecondary: delta(17, { label: 'к прошлому году' }),
            });

            expect(classesOf(qa(fixture, 'stat-tile'))).toContain(worse);
            expect(qa(fixture, 'stat-tile-delta')?.attributes['data-direction']).toBe('up');
            expect(qa(fixture, 'stat-tile-year')?.attributes['data-direction']).toBe('up');
        });

        it('SC-UKV-1132 — плитка без признака красит рост как раньше', (): void => {
            const fixture: ComponentFixture<RtStatTileComponent> = setup({ deltaPrimary: delta(40) });

            expect(classesOf(qa(fixture, 'stat-tile'))).not.toContain(worse);
            expect(classesOf(qa(fixture, 'stat-tile-delta'))).toContain('rt-stat-tile__delta--direction--up');
            expect(icon(fixture)).toBe('#rt-icon-arrow-up');
        });
    });

    describe('дополнения', (): void => {
        it('вторая строка значения рисуется, когда задана', (): void => {
            expect(textOf(qa(setup({ secondary: 'из них 300 новых' }), 'stat-tile-secondary'))).toBe('из них 300 новых');
        });

        it('пояснение рисуется иконкой с подсказкой', (): void => {
            const fixture: ComponentFixture<RtStatTileComponent> = setup({ hint: 'Считается по уникальным' });

            expect(qa(fixture, 'stat-tile-hint')?.attributes['title']).toBe('Считается по уникальным');
        });

        it('без пояснения иконки нет', (): void => {
            expect(qa(setup(), 'stat-tile-hint')).toBeNull();
        });
    });
});
