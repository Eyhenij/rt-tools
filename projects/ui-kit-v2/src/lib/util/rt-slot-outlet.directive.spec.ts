import { ChangeDetectionStrategy, Component, Signal, TemplateRef, viewChildren, WritableSignal, computed, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture } from '../../testing/rt-kit-testing';
import { IRtSlot, RtSlotOutletDirective } from './rt-slot-outlet.directive';

/** Хост с тремя шаблонами: какие из них отдаются выходу, решает тест. */
@Component({
    selector: 'rt-slot-outlet-host',
    template: `
        <ng-template #slot><span qa-dataid="slot">первый</span></ng-template>
        <ng-template #slot><span qa-dataid="slot">второй</span></ng-template>
        <ng-template #slot><span qa-dataid="slot">третий</span></ng-template>
        <div qa-dataid="outlet"><ng-container [rtSlotOutlet]="slots()" /></div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtSlotOutletDirective],
})
class SlotOutletHostComponent {
    protected readonly templates: Signal<readonly TemplateRef<unknown>[]> = viewChildren<TemplateRef<unknown>>('slot');

    protected readonly slots: Signal<IRtSlot[]> = computed((): IRtSlot[] =>
        this.picked().map((index: number | null): IRtSlot => ({ template: index === null ? null : (this.templates()[index] ?? null) }))
    );

    /** Номера шаблонов по порядку; `null` — элемент прежней формы без шаблона. */
    public readonly picked: WritableSignal<(number | null)[]> = signal<(number | null)[]>([0, 1, 2]);
}

function drawn(): string[] {
    return Array.from(document.querySelectorAll('[qa-dataid="outlet"] [qa-dataid="slot"]')).map(
        (node: Element): string => node.textContent ?? ''
    );
}

describe('RtSlotOutletDirective', (): void => {
    it('рисует все шаблоны слота в порядке записи', (): void => {
        createRtFixture(SlotOutletHostComponent);

        expect(drawn()).toEqual(['первый', 'второй', 'третий']);
    });

    it('пропускает элемент прежней формы и рисует остальные', (): void => {
        const fixture: ComponentFixture<SlotOutletHostComponent> = createRtFixture(SlotOutletHostComponent);

        fixture.componentInstance.picked.set([2, null, 0]);
        fixture.detectChanges();

        expect(drawn()).toEqual(['третий', 'первый']);
    });

    it('пустой список слота не рисует ничего и убирает нарисованное', (): void => {
        const fixture: ComponentFixture<SlotOutletHostComponent> = createRtFixture(SlotOutletHostComponent);
        const before: number = drawn().length;

        fixture.componentInstance.picked.set([]);
        fixture.detectChanges();

        expect([before, drawn().length]).toEqual([3, 0]);
    });
});
