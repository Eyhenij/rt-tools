import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, el, hostClasses, qa, renderedText, textOf } from '../../../testing/rt-kit-testing';
import { RtCounterRowComponent } from './rt-counter-row.component';

/** Контрол приходит проекцией — нужна host-обёртка. */
@Component({
    selector: 'rt-counter-row-host',
    template: `
        <rt-counter-row label="Гостей" hint="Не больше четырёх">
            <button type="button" qa-dataid="host-control">+</button>
        </rt-counter-row>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtCounterRowComponent],
})
class CounterRowHostComponent {}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtCounterRowComponent> {
    return createRtFixture(RtCounterRowComponent, { label: 'Гостей', ...inputs });
}

describe('RtCounterRowComponent', (): void => {
    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(setup())).toContain('rt-counter-row');
    });

    it('рисует подпись', (): void => {
        expect(textOf(qa(setup({ label: 'Мест' }), 'counter-row-label'))).toBe('Мест');
    });

    describe('пояснение', (): void => {
        it('без входа не рисуется', (): void => {
            expect(qa(setup(), 'counter-row-hint')).toBeNull();
        });

        it('рисуется под подписью, когда задано', (): void => {
            expect(textOf(qa(setup({ hint: 'Не больше четырёх' }), 'counter-row-hint'))).toBe('Не больше четырёх');
        });

        it('пустая строка равна отсутствию входа', (): void => {
            expect(qa(setup({ hint: '' }), 'counter-row-hint')).toBeNull();
        });
    });

    it('контрол приходит проекцией — строка не знает, что именно считают', (): void => {
        // Так одна и та же строка обслуживает и счётчик, и тумблер, и селект.
        const fixture: ComponentFixture<CounterRowHostComponent> = createRtFixture(CounterRowHostComponent);

        expect(el(fixture, '[qa-dataid="host-control"]')).not.toBeNull();
        expect(renderedText(fixture)).toContain('Гостей');
    });
});
