import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { RtDraggableTreeComponent } from './rt-draggable-tree.component';
import { RtDraggableTreeEmptyDirective } from './rt-draggable-tree.directives';

@Component({
    selector: 'rt-test-draggable-tree-states-host',
    template: `
        <rt-draggable-tree [nodes]="[]">
            @if (withSlot()) {
                <ng-template rtDraggableTreeEmpty>
                    <span qa-dataid="own-empty">своё пустое</span>
                </ng-template>
            }
        </rt-draggable-tree>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDraggableTreeComponent, RtDraggableTreeEmptyDirective],
})
class StatesHostComponent {
    public readonly withSlot: WritableSignal<boolean> = signal<boolean>(false);
}

function drawWith(withSlot: boolean): ComponentFixture<StatesHostComponent> {
    const fixture: ComponentFixture<StatesHostComponent> = createRtFixture(StatesHostComponent, {}, { skipInitialDetect: true });

    fixture.componentInstance.withSlot.set(withSlot);
    fixture.detectChanges();

    return fixture;
}

describe('RtDraggableTreeComponent — свой вид пустого', (): void => {
    it('SC-UKV-1291 — свой шаблон встаёт вместо строки «Нет вариантов»', (): void => {
        const fixture: ComponentFixture<StatesHostComponent> = drawWith(true);

        expect(qa(fixture, 'own-empty')).not.toBeNull();
        expect(qa(fixture, 'draggable-tree-empty')).toBeNull();
    });

    it('SC-UKV-1296 — без шаблона строка «Нет вариантов» стоит как раньше', (): void => {
        const fixture: ComponentFixture<StatesHostComponent> = drawWith(false);

        expect(qa(fixture, 'draggable-tree-empty')?.nativeElement.textContent.trim()).toBe('No options');
    });
});
