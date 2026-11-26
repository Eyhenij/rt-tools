import { ChangeDetectionStrategy, Component, ErrorHandler, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { RtBottomSheetComponent } from './rt-bottom-sheet.component';

/** Код вопроса не загружается: так выглядит оборванная сеть или кусок, которого после выкладки уже нет. */
jest.mock('./confirm/rt-bottom-sheet-confirm.component', (): never => {
    throw new Error('the question code did not load');
});

@Component({
    selector: 'rt-bottom-sheet-confirm-failure-host',
    template: `
        <rt-bottom-sheet [open]="open()" [unsaved]="true" (openChange)="changes.push($event)" (stayRequest)="stays = stays + 1">
            <h2 sheetHeader>Фильтры</h2>
            <p>Содержимое листа</p>
        </rt-bottom-sheet>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtBottomSheetComponent],
})
class BottomSheetConfirmFailureHostComponent {
    public readonly open: WritableSignal<boolean> = signal<boolean>(true);
    public readonly changes: boolean[] = [];
    public stays: number = 0;
}

async function flushQuestionCode(): Promise<void> {
    for (let pass: number = 0; pass < 10; pass += 1) {
        await Promise.resolve();
    }
}

describe('RtBottomSheetComponent — код вопроса не загрузился', (): void => {
    it('SC-UKV-1920 — сбой загрузки снимает вопрос: шторка открыта, отвечает касаниям, ошибка у обработчика', async (): Promise<void> => {
        const handled: unknown[] = [];
        const fixture: ComponentFixture<BottomSheetConfirmFailureHostComponent> = createRtFixture(
            BottomSheetConfirmFailureHostComponent,
            {},
            { providers: [{ provide: ErrorHandler, useValue: { handleError: (error: unknown): number => handled.push(error) } }] }
        );
        fixture.detectChanges();
        await flushQuestionCode();

        const close: HTMLElement = qa(fixture, 'bottom-sheet-close')?.nativeElement as HTMLElement;
        const button: HTMLElement = close.querySelector('button') ?? close;
        // Вопрос, отказ Escape и вопрос снова — всё до прихода кода: на один сбой приходит один ответ.
        button.click();
        fixture.detectChanges();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        fixture.detectChanges();
        button.click();
        fixture.detectChanges();
        const staysBeforeFailure: number = fixture.componentInstance.stays;
        await flushQuestionCode();
        fixture.detectChanges();

        expect(handled).toHaveLength(1);
        expect(fixture.componentInstance.stays - staysBeforeFailure).toBe(1);
        expect(qa(fixture, 'bottom-sheet-confirm')).toBeNull();
        expect((qa(fixture, 'bottom-sheet-panel')?.nativeElement as HTMLElement).hasAttribute('inert')).toBe(false);
        expect((qa(fixture, 'bottom-sheet-backdrop')?.nativeElement as HTMLElement).hasAttribute('inert')).toBe(false);
        expect(fixture.componentInstance.changes).toEqual([]);
    });
});
