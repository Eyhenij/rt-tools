import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { RtInfoItemContentDirective } from './rt-info-item-content.directive';
import { RtInfoItemComponent } from './rt-info-item.component';

@Component({
    selector: 'rt-content-slot-host',
    template: `
        <rt-info-item label="Гость" [loading]="on()">
            <ng-template rtInfoItemContent><span qa-dataid="slot-probe">содержимое</span></ng-template>
        </rt-info-item>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtInfoItemComponent, RtInfoItemContentDirective],
})
class ContentSlotHostComponent {
    public readonly on: WritableSignal<boolean> = signal<boolean>(true);
}

/** Сколько узлов содержимого построено: шаблон, который не создан, узла не даёт. */
function probes(): number {
    return document.querySelectorAll('[qa-dataid="slot-probe"]').length;
}

describe('RtInfoItemComponent — значение шаблоном', (): void => {
    it('SC-UKV-1744: загрузка ставит заглушку на место значения и не строит значение', (): void => {
        createRtFixture(ContentSlotHostComponent);
        const shown: boolean = document.querySelector('[qa-dataid="info-item-skeleton"]') !== null;

        expect([shown, probes()]).toEqual([true, 0]);
    });

    it('SC-UKV-1744: без этого состояния содержимое строится один раз', (): void => {
        const fixture: ComponentFixture<ContentSlotHostComponent> = createRtFixture(ContentSlotHostComponent);

        fixture.componentInstance.on.set(false);
        fixture.detectChanges();

        expect(probes()).toBe(1);
    });
});
