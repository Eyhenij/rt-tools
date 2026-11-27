import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtBottomSheetComponent } from './rt-bottom-sheet.component';
import { RtSheetHeaderDirective } from './rt-sheet-header.directive';

/** Шторка со своей шапкой: шаблон объявлен внутри неё — иначе директиве нечего захватывать. */
@Component({
    selector: 'rt-sheet-header-host',
    template: `
        <rt-bottom-sheet ariaLabel="Отборы" [open]="true" (openChange)="closed.set(!$event)">
            @if (own()) {
                <ng-template rtSheetHeader let-close>
                    <button type="button" qa-dataid="own-back" (click)="close()">Назад</button>
                </ng-template>
            }
            <span sheetHeader>Заголовок шторки</span>
        </rt-bottom-sheet>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtBottomSheetComponent, RtSheetHeaderDirective],
})
class SheetHeaderHostComponent {
    public readonly own: WritableSignal<boolean> = signal<boolean>(true);
    public readonly closed: WritableSignal<boolean> = signal<boolean>(false);
}

function setup(own: boolean): ComponentFixture<SheetHeaderHostComponent> {
    const fixture: ComponentFixture<SheetHeaderHostComponent> = createRtFixture(SheetHeaderHostComponent, {}, { skipInitialDetect: true });

    fixture.componentInstance.own.set(own);
    fixture.detectChanges();

    return fixture;
}

describe('RtSheetHeaderDirective', (): void => {
    it('свой шаблон встаёт на место кнопки закрытия и заголовка шторки', (): void => {
        const fixture: ComponentFixture<SheetHeaderHostComponent> = setup(true);

        expect(textOf(qa(fixture, 'own-back'))).toBe('Назад');
        expect(qa(fixture, 'bottom-sheet-close')).toBeNull();
    });

    it('без шаблона шторка рисует свою шапку с кнопкой закрытия', (): void => {
        const fixture: ComponentFixture<SheetHeaderHostComponent> = setup(false);

        expect(qa(fixture, 'own-back')).toBeNull();
        expect(qa(fixture, 'bottom-sheet-close')).not.toBeNull();
    });

    it('просьба закрыть из шаблона доходит до того, кто держит шторку', (): void => {
        const fixture: ComponentFixture<SheetHeaderHostComponent> = setup(true);

        (qa(fixture, 'own-back')?.nativeElement as HTMLButtonElement).click();
        fixture.detectChanges();

        expect(fixture.componentInstance.closed()).toBe(true);
    });
});
