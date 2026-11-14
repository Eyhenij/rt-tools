import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { RtMultiselectEmptyDirective } from './rt-multiselect-empty.directive';
import { RtMultiselectComponent } from './rt-multiselect.component';

@Component({
    selector: 'rt-test-multiselect-states-host',
    template: `
        <rt-multiselect [options]="[]">
            @if (withSlot()) {
                <ng-template rtMultiselectEmpty>
                    <span qa-dataid="own-empty">своё пустое</span>
                </ng-template>
            }
        </rt-multiselect>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtMultiselectComponent, RtMultiselectEmptyDirective],
})
class StatesHostComponent {
    public readonly withSlot: WritableSignal<boolean> = signal<boolean>(false);
}

function openWith(withSlot: boolean): ComponentFixture<StatesHostComponent> {
    const fixture: ComponentFixture<StatesHostComponent> = createRtFixture(StatesHostComponent, {}, { skipInitialDetect: true });

    fixture.componentInstance.withSlot.set(withSlot);
    fixture.detectChanges();
    (qa(fixture, 'multiselect-trigger')?.nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();

    return fixture;
}

describe('RtMultiselectComponent — свой вид пустого', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1291 — свой шаблон встаёт вместо строки «Нет вариантов»', (): void => {
        openWith(true);

        expect(document.querySelector('[qa-dataid="own-empty"]')).not.toBeNull();
        expect(document.querySelector('[qa-dataid="multiselect-empty"]')?.textContent).not.toContain('No options');
    });

    it('SC-UKV-1296 — без шаблона строка «Нет вариантов» стоит как раньше', (): void => {
        openWith(false);

        expect(document.querySelector('[qa-dataid="multiselect-empty"]')?.textContent?.trim()).toBe('No options');
    });
});
