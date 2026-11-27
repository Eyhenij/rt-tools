import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtBottomSheetComponent } from './rt-bottom-sheet.component';
import { RtSheetFooterDirective } from './rt-sheet-footer.directive';

/** Шторка со своим подвалом: шаблон объявлен внутри неё — иначе директиве нечего захватывать. */
@Component({
    selector: 'rt-sheet-footer-host',
    template: `
        <rt-bottom-sheet ariaLabel="Отборы" [open]="true" (openChange)="closed.set(!$event)">
            <p>Содержимое шторки</p>
            @if (own()) {
                <ng-template rtSheetFooter let-close>
                    <button type="button" qa-dataid="own-show" (click)="close()">Показать 12</button>
                </ng-template>
            }
        </rt-bottom-sheet>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtBottomSheetComponent, RtSheetFooterDirective],
})
class SheetFooterHostComponent {
    public readonly own: WritableSignal<boolean> = signal<boolean>(true);
    public readonly closed: WritableSignal<boolean> = signal<boolean>(false);
}

function setup(own: boolean): ComponentFixture<SheetFooterHostComponent> {
    const fixture: ComponentFixture<SheetFooterHostComponent> = createRtFixture(SheetFooterHostComponent, {}, { skipInitialDetect: true });

    fixture.componentInstance.own.set(own);
    fixture.detectChanges();

    return fixture;
}

describe('RtSheetFooterDirective', (): void => {
    it('свой шаблон рисуется в подвале шторки', (): void => {
        const fixture: ComponentFixture<SheetFooterHostComponent> = setup(true);

        expect(textOf(qa(fixture, 'own-show'))).toBe('Показать 12');
    });

    it('без шаблона своего подвала в шторке нет', (): void => {
        const fixture: ComponentFixture<SheetFooterHostComponent> = setup(false);

        expect(qa(fixture, 'own-show')).toBeNull();
    });

    it('просьба закрыть из подвала доходит до того, кто держит шторку', (): void => {
        const fixture: ComponentFixture<SheetFooterHostComponent> = setup(true);

        (qa(fixture, 'own-show')?.nativeElement as HTMLButtonElement).click();
        fixture.detectChanges();

        expect(fixture.componentInstance.closed()).toBe(true);
    });
});
