import { ChangeDetectionStrategy, Component, ErrorHandler, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { RtBottomSheetComponent } from './rt-bottom-sheet.component';

/** Код вопроса не загружается: так выглядит оборванная сеть или кусок, которого после выкладки уже нет. */
jest.mock('./rt-bottom-sheet-confirm.component', (): never => {
    throw new Error('the question code did not load');
});

@Component({
    selector: 'rt-bottom-sheet-confirm-failure-host',
    template: `
        <rt-bottom-sheet [open]="open()" [unsaved]="true" (openChange)="changes.push($event)">
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
        (close.querySelector('button') ?? close).click();
        fixture.detectChanges();
        await flushQuestionCode();
        fixture.detectChanges();

        expect(handled.length).toBeGreaterThan(0);
        expect(qa(fixture, 'bottom-sheet-confirm')).toBeNull();
        expect((qa(fixture, 'bottom-sheet-panel')?.nativeElement as HTMLElement).hasAttribute('inert')).toBe(false);
        expect((qa(fixture, 'bottom-sheet-backdrop')?.nativeElement as HTMLElement).hasAttribute('inert')).toBe(false);
        expect(fixture.componentInstance.changes).toEqual([]);
    });
});
