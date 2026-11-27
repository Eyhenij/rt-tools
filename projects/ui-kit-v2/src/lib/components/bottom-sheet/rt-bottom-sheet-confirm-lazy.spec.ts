import { ChangeDetectionStrategy, Component, ViewContainerRef, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { RtBottomSheetComponent } from './rt-bottom-sheet.component';

/** Шторка без подгрузки заранее: код вопроса приходит после того, как вопрос задан. */
@Component({
    selector: 'rt-bottom-sheet-confirm-lazy-host',
    template: `
        @if (shown()) {
            <rt-bottom-sheet [open]="true" [unsaved]="true">
                <h2 sheetHeader>Фильтры</h2>
                <p>Содержимое листа</p>
            </rt-bottom-sheet>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtBottomSheetComponent],
})
class BottomSheetConfirmLazyHostComponent {
    public readonly shown: WritableSignal<boolean> = signal<boolean>(true);
}

type TFixture = ComponentFixture<BottomSheetConfirmLazyHostComponent>;

async function flushQuestionCode(): Promise<void> {
    for (let pass: number = 0; pass < 10; pass += 1) {
        await Promise.resolve();
    }
}

function pressClose(fixture: TFixture): void {
    const close: HTMLElement = qa(fixture, 'bottom-sheet-close')?.nativeElement as HTMLElement;
    (close.querySelector('button') ?? close).click();
    fixture.detectChanges();
}

// Порядок тестов важен: код вопроса приходит один раз на файл, и только первый тест застаёт его в пути.
describe('RtBottomSheetComponent — код вопроса приходит после вопроса', (): void => {
    it('SC-UKV-1920 — шторка ушла, пока код в пути: экран вопроса не ставится', async (): Promise<void> => {
        const fixture: TFixture = createRtFixture(BottomSheetConfirmLazyHostComponent);
        const sheet: RtBottomSheetComponent = fixture.debugElement.query(By.directive(RtBottomSheetComponent)).componentInstance;
        const slot: ViewContainerRef = (Reflect.get(sheet, 'confirmSlot') as () => ViewContainerRef)();
        const create: jest.SpyInstance = jest.spyOn(slot, 'createComponent');
        pressClose(fixture);

        fixture.componentInstance.shown.set(false);
        fixture.detectChanges();
        await flushQuestionCode();

        expect(create).not.toHaveBeenCalled();
    });

    it('SC-UKV-1920 — заданный до прихода кода вопрос встаёт один раз, фокус на «Применить»', async (): Promise<void> => {
        const fixture: TFixture = createRtFixture(BottomSheetConfirmLazyHostComponent);
        pressClose(fixture);
        await flushQuestionCode();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('[qa-dataid="bottom-sheet-confirm"]')).toHaveLength(1);
        expect(document.activeElement?.closest('[qa-dataid="bottom-sheet-confirm-apply"]')).not.toBeNull();
    });
});
