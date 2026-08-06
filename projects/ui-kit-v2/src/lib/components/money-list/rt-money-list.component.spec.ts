import { ChangeDetectionStrategy, Component, DebugElement, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, hostClasses, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { RtMoneyListComponent } from './rt-money-list.component';
import { RtMoneyRowComponent } from './rt-money-row.component';

/** Суммы приходят проекцией — нужна host-обёртка. */
@Component({
    selector: 'rt-money-list-host',
    template: `
        <rt-money-list>
            <rt-money-row label="Тариф">12 000 ₽</rt-money-row>
            <rt-money-row label="Скидка" [loading]="loading()">−1 200 ₽</rt-money-row>
            <rt-money-row label="Итого" [total]="true">10 800 ₽</rt-money-row>
        </rt-money-list>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtMoneyListComponent, RtMoneyRowComponent],
})
class MoneyListHostComponent {
    public readonly loading: WritableSignal<boolean> = signal<boolean>(false);
}

function setupHost(): ComponentFixture<MoneyListHostComponent> {
    return createRtFixture(MoneyListHostComponent);
}

function setupRow(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtMoneyRowComponent> {
    return createRtFixture(RtMoneyRowComponent, inputs);
}

describe('RtMoneyListComponent', (): void => {
    it('несёт свой BEM-блок и рисует только проекцию', (): void => {
        expect(hostClasses(createRtFixture(RtMoneyListComponent))).toContain('rt-money-list');
    });

    it('строки рисуются в порядке объявления', (): void => {
        expect(qaAll(setupHost(), 'money-row-label').map((node: DebugElement): string => textOf(node))).toEqual([
            'Тариф',
            'Скидка',
            'Итого',
        ]);
    });
});

describe('RtMoneyRowComponent', (): void => {
    it('рисует подпись, а сумму берёт проекцией', (): void => {
        const fixture: ComponentFixture<MoneyListHostComponent> = setupHost();

        expect(textOf(qaAll(fixture, 'money-row-label')[0])).toBe('Тариф');
        expect(textOf(qaAll(fixture, 'money-row-value')[0])).toBe('12 000 ₽');
    });

    it('итоговая строка помечается модификатором — её выделяют начертанием', (): void => {
        expect(hostClasses(setupRow({ total: true }))).toContain('rt-money-row--total');
    });

    it('обычная строка модификатора не несёт', (): void => {
        expect(hostClasses(setupRow())).not.toContain('rt-money-row--total');
    });

    describe('загрузка', (): void => {
        it('подменяет сумму заглушкой, оставляя подпись', (): void => {
            const fixture: ComponentFixture<MoneyListHostComponent> = setupHost();

            fixture.componentInstance.loading.set(true);
            fixture.detectChanges();

            expect(qa(fixture, 'money-row-skeleton')).not.toBeNull();
            expect(textOf(qaAll(fixture, 'money-row-value')[1])).toBe('');
            expect(textOf(qaAll(fixture, 'money-row-label')[1])).toBe('Скидка');
        });

        it('без загрузки заглушки нет', (): void => {
            expect(qa(setupRow(), 'money-row-skeleton')).toBeNull();
        });
    });
});
