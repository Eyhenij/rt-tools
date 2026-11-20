import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { RtBottomSheetComponent } from './rt-bottom-sheet.component';

/** Шторка отборов и шторка списка, открытая из неё, — как на телефоне в шапке страницы. */
@Component({
    selector: 'rt-bottom-sheet-stack-host',
    template: `
        <rt-bottom-sheet qa-dataid="sheet-filters" [open]="filters()">
            <p>Отборы</p>
        </rt-bottom-sheet>
        <rt-bottom-sheet qa-dataid="sheet-status" [open]="status()">
            <p>Статус</p>
        </rt-bottom-sheet>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtBottomSheetComponent],
})
class StackHostComponent {
    public readonly filters: WritableSignal<boolean> = signal<boolean>(true);
    public readonly status: WritableSignal<boolean> = signal<boolean>(false);
}

function sheet(fixture: ComponentFixture<StackHostComponent>, anchor: string): HTMLElement {
    return (fixture.nativeElement as HTMLElement).querySelector(`[qa-dataid="${anchor}"]`) as HTMLElement;
}

function shown(element: HTMLElement): boolean {
    return element.classList.contains('rt-bottom-sheet--open') && !element.classList.contains('rt-bottom-sheet--covered');
}

describe('Стопка шторок', (): void => {
    it('SC-UKV-1631 — шторка, открытая из шторки, подменяет её', (): void => {
        const fixture: ComponentFixture<StackHostComponent> = createRtFixture(StackHostComponent);
        expect(shown(sheet(fixture, 'sheet-filters'))).toBe(true);

        fixture.componentInstance.status.set(true);
        fixture.detectChanges();
        fixture.detectChanges();

        expect(shown(sheet(fixture, 'sheet-status'))).toBe(true);
        expect(shown(sheet(fixture, 'sheet-filters'))).toBe(false);
        // Без `inert`: в ней стоит указатель поля, открывшего верхнюю, и фокус с него не падает.
        expect(sheet(fixture, 'sheet-filters').hasAttribute('inert')).toBe(false);
    });

    it('SC-UKV-1632 — закрытие верхней шторки снова показывает предыдущую', (): void => {
        const fixture: ComponentFixture<StackHostComponent> = createRtFixture(StackHostComponent);
        fixture.componentInstance.status.set(true);
        fixture.detectChanges();
        fixture.detectChanges();

        fixture.componentInstance.status.set(false);
        fixture.detectChanges();
        fixture.detectChanges();

        expect(shown(sheet(fixture, 'sheet-filters'))).toBe(true);
        expect(sheet(fixture, 'sheet-filters').hasAttribute('inert')).toBe(false);
        expect(sheet(fixture, 'sheet-status').classList.contains('rt-bottom-sheet--open')).toBe(false);
    });
});
