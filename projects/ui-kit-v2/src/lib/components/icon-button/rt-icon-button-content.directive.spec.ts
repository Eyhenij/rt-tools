import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { RtIconButtonContentDirective } from './rt-icon-button-content.directive';
import { RtIconButtonComponent } from './rt-icon-button.component';

@Component({
    selector: 'rt-content-slot-host',
    template: `
        <rt-icon-button ariaLabel="Отправить" [loading]="on()">
            <ng-template rtIconButtonContent><span qa-dataid="slot-probe">содержимое</span></ng-template>
        </rt-icon-button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtIconButtonComponent, RtIconButtonContentDirective],
})
class ContentSlotHostComponent {
    public readonly on: WritableSignal<boolean> = signal<boolean>(true);
}

/** Сколько узлов содержимого построено: шаблон, который не создан, узла не даёт. */
function probes(): number {
    return document.querySelectorAll('[qa-dataid="slot-probe"]').length;
}

describe('RtIconButtonComponent — своё содержимое шаблоном', (): void => {
    it('SC-UKV-1728: загрузка без значка рисует вращение и не строит своё содержимое', (): void => {
        createRtFixture(ContentSlotHostComponent);
        const shown: boolean = document.querySelector('.rt-icon-button__spinner') !== null;

        expect([shown, probes()]).toEqual([true, 0]);
    });

    it('SC-UKV-1728: без этого состояния содержимое строится один раз', (): void => {
        const fixture: ComponentFixture<ContentSlotHostComponent> = createRtFixture(ContentSlotHostComponent);

        fixture.componentInstance.on.set(false);
        fixture.detectChanges();

        expect(probes()).toBe(1);
    });
});
