import { ChangeDetectionStrategy, Component, ErrorHandler, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { BreakpointsService } from '../../platform';
import { RtPopoverDirective } from './rt-popover.directive';

/** Код листа не загружается: так выглядит оборванная сеть или кусок, которого после выкладки уже нет. */
jest.mock('./rt-popover-sheet.component', (): never => {
    throw new Error('the sheet code did not load');
});

/** Подмена наблюдателя ширины: сам он в тестовой среде ничего не измеряет. */
class BreakpointsStub {
    public readonly viewportNarrow: WritableSignal<boolean> = signal<boolean>(true);
    public readonly phone: WritableSignal<boolean> = this.viewportNarrow;
    public readonly narrow: WritableSignal<boolean> = signal<boolean>(true);
}

@Component({
    selector: 'rt-popover-sheet-lazy-failure-host',
    template: `
        <button type="button" rtPopoverSheet rtPopoverSheetTitle="Выбор" [rtPopover]="tpl">Открыть</button>
        <ng-template #tpl><button type="button">Внутри</button></ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtPopoverDirective],
})
class SheetLazyFailureHostComponent {}

async function flushSheetCode(): Promise<void> {
    for (let pass: number = 0; pass < 10; pass += 1) {
        await Promise.resolve();
    }
}

describe('Нижняя шторка поповера — код листа не загрузился', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1784 — сбой загрузки куска снимает состояние «открыто», называется обработчику ошибок и допускает повтор', async (): Promise<void> => {
        const handled: unknown[] = [];
        const fixture: ComponentFixture<SheetLazyFailureHostComponent> = createRtFixture(
            SheetLazyFailureHostComponent,
            {},
            {
                providers: [
                    { provide: BreakpointsService, useValue: new BreakpointsStub() },
                    { provide: ErrorHandler, useValue: { handleError: (error: unknown): number => handled.push(error) } },
                ],
            }
        );
        fixture.detectChanges();
        const popover: RtPopoverDirective = fixture.debugElement.query(By.directive(RtPopoverDirective)).injector.get(RtPopoverDirective);

        popover.open();
        expect(popover.isOpen()).toBe(true);
        await flushSheetCode();

        expect(popover.isOpen()).toBe(false);
        expect(handled).toHaveLength(1);
        expect(document.querySelectorAll('.rt-popover-sheet')).toHaveLength(0);

        popover.open();
        await flushSheetCode();

        expect(popover.isOpen()).toBe(false);
        expect(handled).toHaveLength(2);
    });
});
