import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { RtTreeComponent } from './rt-tree.component';
import { RtTreeEmptyDirective } from './rt-tree.directives';

@Component({
    selector: 'rt-test-tree-states-host',
    template: `
        <rt-tree [nodes]="[]">
            @if (withSlot()) {
                <ng-template rtTreeEmpty>
                    <span qa-dataid="own-empty">своё пустое</span>
                </ng-template>
            }
        </rt-tree>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTreeComponent, RtTreeEmptyDirective],
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

describe('RtTreeComponent — свой вид пустого', (): void => {
    it('SC-UKV-1291 — свой шаблон встаёт вместо строки «Нет вариантов»', (): void => {
        const fixture: ComponentFixture<StatesHostComponent> = drawWith(true);

        expect(qa(fixture, 'own-empty')).not.toBeNull();
        expect(qa(fixture, 'tree-empty')).toBeNull();
    });

    it('SC-UKV-1296 — без шаблона строка «Нет вариантов» стоит как раньше', (): void => {
        const fixture: ComponentFixture<StatesHostComponent> = drawWith(false);

        expect(qa(fixture, 'tree-empty')?.nativeElement.textContent.trim()).toBe('No options');
    });
});
