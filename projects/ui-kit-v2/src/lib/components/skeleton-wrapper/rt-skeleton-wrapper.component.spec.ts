import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, hostClasses, qa, renderedText } from '../../../testing/rt-kit-testing';
import { RtSkeletonWrapperComponent } from './rt-skeleton-wrapper.component';

/** Содержимое приходит проекцией — нужна host-обёртка. */
@Component({
    selector: 'rt-skeleton-wrapper-host',
    template: '<rt-skeleton-wrapper width="240px" height="16px" [isLoading]="isLoading()">{{ value() }}</rt-skeleton-wrapper>',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtSkeletonWrapperComponent],
})
class SkeletonWrapperHostComponent {
    public readonly isLoading: WritableSignal<boolean> = signal<boolean>(true);
    public readonly value: WritableSignal<string> = signal<string>('Базовый тариф');
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtSkeletonWrapperComponent> {
    return createRtFixture(RtSkeletonWrapperComponent, inputs);
}

function placeholderStyle(fixture: ComponentFixture<RtSkeletonWrapperComponent>, property: string): string {
    return (qa(fixture, 'skeleton-wrapper-placeholder')?.nativeElement as HTMLElement).style.getPropertyValue(property);
}

describe('RtSkeletonWrapperComponent', (): void => {
    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(setup())).toContain('rt-skeleton-wrapper');
    });

    it('без входа показывает содержимое, а не заглушку', (): void => {
        // Умолчание — «загрузка закончилась»: обёртку часто ставят на путь,
        // где данные уже есть.
        const fixture: ComponentFixture<SkeletonWrapperHostComponent> = createRtFixture(SkeletonWrapperHostComponent);
        fixture.componentInstance.isLoading.set(false);
        fixture.detectChanges();

        expect(qa(fixture, 'skeleton-wrapper-placeholder')).toBeNull();
        expect(renderedText(fixture)).toBe('Базовый тариф');
    });

    it('на время загрузки содержимое подменяется заглушкой целиком', (): void => {
        const fixture: ComponentFixture<SkeletonWrapperHostComponent> = createRtFixture(SkeletonWrapperHostComponent);

        expect(qa(fixture, 'skeleton-wrapper-placeholder')).not.toBeNull();
        expect(renderedText(fixture)).toBe('');
    });

    it('после загрузки содержимое появляется', (): void => {
        const fixture: ComponentFixture<SkeletonWrapperHostComponent> = createRtFixture(SkeletonWrapperHostComponent);

        fixture.componentInstance.isLoading.set(false);
        fixture.detectChanges();

        expect(renderedText(fixture)).toBe('Базовый тариф');
    });

    describe('размеры заглушки', (): void => {
        it('без входов — полоска во всю ширину высотой 15px', (): void => {
            const fixture: ComponentFixture<RtSkeletonWrapperComponent> = setup({ isLoading: true });

            expect(placeholderStyle(fixture, 'width')).toBe('100%');
            expect(placeholderStyle(fixture, 'height')).toBe('15px');
        });

        it('прокидываются в заглушку как есть', (): void => {
            const fixture: ComponentFixture<RtSkeletonWrapperComponent> = setup({ isLoading: true, width: '240px', height: '16px' });

            expect(placeholderStyle(fixture, 'width')).toBe('240px');
            expect(placeholderStyle(fixture, 'height')).toBe('16px');
        });

        it('форма и скругление тоже прокидываются', (): void => {
            const fixture: ComponentFixture<RtSkeletonWrapperComponent> = setup({ isLoading: true, shape: 'circle', size: 'lg' });

            expect(placeholderStyle(fixture, 'border-radius')).toBe('50%');
            expect(placeholderStyle(fixture, 'width')).toBe('20px');
        });

        it('мерцание можно погасить', (): void => {
            const fixture: ComponentFixture<RtSkeletonWrapperComponent> = setup({ isLoading: true, animation: false });

            expect(Array.from((qa(fixture, 'skeleton-wrapper-placeholder')?.nativeElement as HTMLElement).classList)).not.toContain(
                'rt-skeleton--animated'
            );
        });
    });
});
