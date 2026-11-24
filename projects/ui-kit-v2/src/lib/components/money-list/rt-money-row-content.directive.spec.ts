import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { RtMoneyRowContentDirective } from './rt-money-row-content.directive';
import { RtMoneyRowComponent } from './rt-money-row.component';

@Component({
    selector: 'rt-content-slot-host',
    template: `
        <rt-money-row label="Итого" [loading]="on()">
            <ng-template rtMoneyRowContent><span qa-dataid="slot-probe">содержимое</span></ng-template>
        </rt-money-row>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtMoneyRowComponent, RtMoneyRowContentDirective],
})
class ContentSlotHostComponent {
    public readonly on: WritableSignal<boolean> = signal<boolean>(true);
}

/** Сколько узлов содержимого построено: шаблон, который не создан, узла не даёт. */
function probes(): number {
    return document.querySelectorAll('[qa-dataid="slot-probe"]').length;
}

describe('RtMoneyRowComponent — сумма шаблоном', (): void => {
    it('SC-UKV-1743: загрузка ставит заглушку на место суммы и не строит сумму', (): void => {
        createRtFixture(ContentSlotHostComponent);
        const shown: boolean = document.querySelector('[qa-dataid="money-row-skeleton"]') !== null;

        expect([shown, probes()]).toEqual([true, 0]);
    });

    it('SC-UKV-1743: без этого состояния содержимое строится один раз', (): void => {
        const fixture: ComponentFixture<ContentSlotHostComponent> = createRtFixture(ContentSlotHostComponent);

        fixture.componentInstance.on.set(false);
        fixture.detectChanges();

        expect(probes()).toBe(1);
    });
});
