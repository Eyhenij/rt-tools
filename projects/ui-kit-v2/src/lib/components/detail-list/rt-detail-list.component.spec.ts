import { ChangeDetectionStrategy, Component, DebugElement, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, el, hostClasses, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { RtDetailListComponent } from './rt-detail-list.component';
import { RtDetailRowComponent } from './rt-detail-row.component';

/** И список, и строка рисуют только проекцию — без host-обёртки проверять нечего. */
@Component({
    selector: 'rt-detail-list-host',
    template: `
        <rt-detail-list>
            <rt-detail-row label="Тариф">Базовый</rt-detail-row>
            <rt-detail-row label="Владелец" [loading]="loading()">Иванов</rt-detail-row>
        </rt-detail-list>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDetailListComponent, RtDetailRowComponent],
})
class DetailListHostComponent {
    public readonly loading: WritableSignal<boolean> = signal<boolean>(false);
}

function setupHost(): ComponentFixture<DetailListHostComponent> {
    return createRtFixture(DetailListHostComponent);
}

describe('RtDetailListComponent', (): void => {
    it('несёт свой BEM-блок и вокруг проекции обёртки не добавляет', (): void => {
        const fixture: ComponentFixture<RtDetailListComponent> = createRtFixture(RtDetailListComponent);

        expect(hostClasses(fixture)).toContain('rt-detail-list');
        expect((fixture.nativeElement as HTMLElement).querySelector('.rt-detail-list')).toBeNull();
    });

    it('строки рисуются в порядке объявления', (): void => {
        expect(qaAll(setupHost(), 'detail-row-label').map((node: DebugElement): string => textOf(node))).toEqual(['Тариф', 'Владелец']);
    });
});

describe('RtDetailRowComponent', (): void => {
    function setupRow(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtDetailRowComponent> {
        return createRtFixture(RtDetailRowComponent, inputs);
    }

    it('рисует подпись', (): void => {
        expect(textOf(qa(setupRow({ label: 'Тариф' }), 'detail-row-label'))).toBe('Тариф');
    });

    it('значение приходит проекцией — внутрь можно положить что угодно', (): void => {
        expect(textOf(qa(setupHost(), 'detail-row-value'))).toBe('Базовый');
    });

    describe('загрузка', (): void => {
        it('без входа значение рисуется как есть', (): void => {
            expect(qa(setupRow(), 'skeleton-wrapper-placeholder')).toBeNull();
        });

        it('во время загрузки значение подменяется заглушкой, подпись остаётся', (): void => {
            const fixture: ComponentFixture<DetailListHostComponent> = setupHost();

            fixture.componentInstance.loading.set(true);
            fixture.detectChanges();

            expect(qa(fixture, 'skeleton-wrapper-placeholder')).not.toBeNull();
            expect(qaAll(fixture, 'detail-row-label').map((node: DebugElement): string => textOf(node))).toEqual(['Тариф', 'Владелец']);
        });

        it('заглушка узкая — под значение, а не под всю строку', (): void => {
            const fixture: ComponentFixture<RtDetailRowComponent> = setupRow({ loading: true });

            expect(el(fixture, '[qa-dataid="skeleton-wrapper-placeholder"]')?.styles['width']).toBe('180px');
        });
    });

    it('пустая подпись допустима — строка бывает без ключа', (): void => {
        expect(textOf(qa(setupRow(), 'detail-row-label'))).toBe('');
    });
});
