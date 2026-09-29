import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, hostClasses } from '../../../testing/rt-kit-testing';
import { TRtSkeletonShape, TRtSkeletonSize, RtSkeletonComponent } from './rt-skeleton.component';

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtSkeletonComponent> {
    return createRtFixture(RtSkeletonComponent, inputs);
}

function style(fixture: ComponentFixture<RtSkeletonComponent>, property: string): string {
    return (fixture.nativeElement as HTMLElement).style.getPropertyValue(property);
}

describe('RtSkeletonComponent', (): void => {
    it('без входов — прямоугольник во всю ширину', (): void => {
        const fixture: ComponentFixture<RtSkeletonComponent> = setup();

        expect(hostClasses(fixture)).toEqual(expect.arrayContaining(['rt-skeleton', 'rt-skeleton--rectangle']));
        expect(style(fixture, 'width')).toBe('100%');
    });

    it('высота по умолчанию — 10px, а не высота размера md', (): void => {
        // Умолчание высоты берётся из карты размеров по ключу `sm`, тогда как
        // умолчание самого размера — `md`. Расхождение намеренно зафиксировано:
        // полоска текста тоньше, чем шаг размера, и меняется только явным входом.
        const fixture: ComponentFixture<RtSkeletonComponent> = setup();

        expect(hostClasses(fixture)).toContain('rt-skeleton--md');
        expect(style(fixture, 'height')).toBe('10px');
    });

    describe('форма', (): void => {
        it.each<TRtSkeletonShape>(['rectangle', 'circle', 'square'])('форма %s даёт свой модификатор', (shape: TRtSkeletonShape): void => {
            expect(hostClasses(setup({ shape }))).toContain(`rt-skeleton--${shape}`);
        });

        it('круг игнорирует ширину и высоту — сторона берётся от размера', (): void => {
            const fixture: ComponentFixture<RtSkeletonComponent> = setup({
                shape: 'circle',
                size: 'lg',
                width: '300px',
                height: '400px',
            });

            expect(style(fixture, 'width')).toBe('20px');
            expect(style(fixture, 'height')).toBe('20px');
        });

        it('квадрат тоже берёт сторону от размера', (): void => {
            const fixture: ComponentFixture<RtSkeletonComponent> = setup({ shape: 'square', size: 'sm' });

            expect(style(fixture, 'width')).toBe('10px');
            expect(style(fixture, 'height')).toBe('10px');
        });

        it('SC-UKV-393 — круг с названным шагом остаётся кругом', (): void => {
            const fixture: ComponentFixture<RtSkeletonComponent> = setup({ shape: 'circle', radius: 'xs' });

            expect(hostClasses(fixture)).toContain('rt-skeleton--circle');
            expect((fixture.nativeElement as HTMLElement).getAttribute('data-rt-radius')).toBe('xs');
        });

        it('прямоугольник слушается ширины и высоты', (): void => {
            const fixture: ComponentFixture<RtSkeletonComponent> = setup({ width: '240px', height: '16px' });

            expect(style(fixture, 'width')).toBe('240px');
            expect(style(fixture, 'height')).toBe('16px');
        });
    });

    describe('размер', (): void => {
        it.each<[TRtSkeletonSize, string]>([
            ['sm', '10px'],
            ['md', '15px'],
            ['lg', '20px'],
        ])('размер %s задаёт сторону круга %s', (size: TRtSkeletonSize, expected: string): void => {
            expect(style(setup({ shape: 'circle', size }), 'width')).toBe(expected);
        });
    });

    describe('скругление', (): void => {
        it('названный шаг ложится на хост, без входа шага нет', (): void => {
            expect((setup().nativeElement as HTMLElement).hasAttribute('data-rt-radius')).toBe(false);
            expect((setup({ radius: 'lg' }).nativeElement as HTMLElement).getAttribute('data-rt-radius')).toBe('lg');
        });
    });

    describe('мерцание', (): void => {
        it('включено без входов', (): void => {
            expect(hostClasses(setup())).toContain('rt-skeleton--animated');
        });

        it('гасится входом', (): void => {
            expect(hostClasses(setup({ animation: false }))).not.toContain('rt-skeleton--animated');
        });

        it('принимает пустую строку как истину — так пишется голый атрибут разметки', (): void => {
            expect(hostClasses(setup({ animation: '' }))).toContain('rt-skeleton--animated');
        });
    });

    it('своей разметки не рисует', (): void => {
        expect((setup().nativeElement as HTMLElement).children.length).toBe(0);
    });
});
