import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { RtSelectEmptyDirective } from './rt-select-empty.directive';
import { RtSelectComponent } from './rt-select.component';

@Component({
    selector: 'rt-test-select-states-host',
    template: `
        <rt-select [options]="[]">
            @if (withSlot()) {
                <ng-template rtSelectEmpty>
                    <span qa-dataid="own-empty">своё пустое</span>
                </ng-template>
            }
        </rt-select>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtSelectComponent, RtSelectEmptyDirective],
})
class StatesHostComponent {
    public readonly withSlot: WritableSignal<boolean> = signal<boolean>(false);
}

function openWith(withSlot: boolean): ComponentFixture<StatesHostComponent> {
    const fixture: ComponentFixture<StatesHostComponent> = createRtFixture(StatesHostComponent, {}, { skipInitialDetect: true });

    fixture.componentInstance.withSlot.set(withSlot);
    fixture.detectChanges();
    (qa(fixture, 'select-trigger')?.nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();

    return fixture;
}

describe('RtSelectComponent — свой вид пустого', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1291 — свой шаблон встаёт вместо строки «Нет вариантов»', (): void => {
        openWith(true);

        expect(document.querySelector('[qa-dataid="own-empty"]')).not.toBeNull();
        expect(document.querySelector('[qa-dataid="select-own-empty"]')).not.toBeNull();
        expect(document.querySelector('[qa-dataid="select-empty"]')).toBeNull();
    });

    it('SC-UKV-1296 — без шаблона строка «Нет вариантов» стоит как раньше', (): void => {
        openWith(false);

        expect(document.querySelector('[qa-dataid="select-empty"]')?.textContent?.trim()).toBe('No options');
    });
});
