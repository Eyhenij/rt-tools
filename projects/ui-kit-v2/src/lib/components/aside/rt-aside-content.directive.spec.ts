import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { RtAsideContentDirective } from './rt-aside-content.directive';
import { RtAsideComponent } from './rt-aside.component';

@Component({
    selector: 'rt-content-slot-host',
    template: `
        <rt-aside [empty]="on()">
            <ng-template rtAsideContent><span qa-dataid="slot-probe">содержимое</span></ng-template>
        </rt-aside>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtAsideComponent, RtAsideContentDirective],
})
class ContentSlotHostComponent {
    public readonly on: WritableSignal<boolean> = signal<boolean>(true);
}

/** Сколько узлов содержимого построено: шаблон, который не создан, узла не даёт. */
function probes(): number {
    return document.querySelectorAll('[qa-dataid="slot-probe"]').length;
}

describe('RtAsideComponent — тело шаблоном', (): void => {
    it('SC-UKV-1739: пустая панель показывает заглушку и не строит тело', (): void => {
        createRtFixture(ContentSlotHostComponent);
        const shown: boolean = document.querySelector('[qa-dataid="aside-empty"]') !== null;

        expect([shown, probes()]).toEqual([true, 0]);
    });

    it('SC-UKV-1739: без этого состояния содержимое строится один раз', (): void => {
        const fixture: ComponentFixture<ContentSlotHostComponent> = createRtFixture(ContentSlotHostComponent);

        fixture.componentInstance.on.set(false);
        fixture.detectChanges();

        expect(probes()).toBe(1);
    });
});
