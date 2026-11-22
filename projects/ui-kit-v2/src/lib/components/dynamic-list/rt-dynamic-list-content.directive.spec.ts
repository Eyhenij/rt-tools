import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { RtDynamicListContentDirective } from './rt-dynamic-list-content.directive';
import { RtDynamicListComponent } from './rt-dynamic-list.component';

@Component({
    selector: 'rt-content-slot-host',
    template: `
        <rt-dynamic-list [loading]="on()">
            <ng-template rtDynamicListContent><span qa-dataid="slot-probe">содержимое</span></ng-template>
        </rt-dynamic-list>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDynamicListComponent, RtDynamicListContentDirective],
})
class ContentSlotHostComponent {
    public readonly on: WritableSignal<boolean> = signal<boolean>(true);
}

/** Сколько узлов содержимого построено: шаблон, который не создан, узла не даёт. */
function probes(): number {
    return document.querySelectorAll('[qa-dataid="slot-probe"]').length;
}

describe('RtDynamicListComponent — записи шаблоном', (): void => {
    it('SC-UKV-1742: первая загрузка показывает загрузку и не строит записи', (): void => {
        createRtFixture(ContentSlotHostComponent);
        const shown: boolean = document.querySelector('[qa-dataid="dynamic-list-loader"]') !== null;

        expect([shown, probes()]).toEqual([true, 0]);
    });

    it('SC-UKV-1742: без этого состояния содержимое строится один раз', (): void => {
        const fixture: ComponentFixture<ContentSlotHostComponent> = createRtFixture(ContentSlotHostComponent);

        fixture.componentInstance.on.set(false);
        fixture.detectChanges();

        expect(probes()).toBe(1);
    });
});
