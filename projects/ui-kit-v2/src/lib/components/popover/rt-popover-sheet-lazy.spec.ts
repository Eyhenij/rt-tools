import { ApplicationRef, ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { BreakpointsService } from '../../platform';
import { RtPopoverDirective } from './rt-popover.directive';

/** Подмена наблюдателя ширины: сам он в тестовой среде ничего не измеряет. */
class BreakpointsStub {
    public readonly viewportNarrow: WritableSignal<boolean> = signal<boolean>(true);
    public readonly phone: WritableSignal<boolean> = this.viewportNarrow;
    public readonly narrow: WritableSignal<boolean> = signal<boolean>(true);
}

@Component({
    selector: 'rt-popover-sheet-lazy-host',
    template: `
        <button type="button" qa-dataid="lazy-trigger" rtPopoverSheet rtPopoverSheetTitle="Выбор" [rtPopover]="tpl">Открыть</button>
        <ng-template #tpl><button type="button" qa-dataid="lazy-inner">Внутри</button></ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtPopoverDirective],
})
class SheetLazyHostComponent {}

function setup(): { fixture: ComponentFixture<SheetLazyHostComponent>; popover: RtPopoverDirective } {
    const fixture: ComponentFixture<SheetLazyHostComponent> = createRtFixture(
        SheetLazyHostComponent,
        {},
        { providers: [{ provide: BreakpointsService, useValue: new BreakpointsStub() }] }
    );
    fixture.detectChanges();
    const popover: RtPopoverDirective = fixture.debugElement.query(By.directive(RtPopoverDirective)).injector.get(RtPopoverDirective);

    return { fixture, popover };
}

/** Код листа приходит отдельным куском: ждём, пока обещание его загрузки отработает. */
async function flushSheetCode(): Promise<void> {
    for (let pass: number = 0; pass < 10; pass += 1) {
        await Promise.resolve();
    }
}

function settle(fixture: ComponentFixture<SheetLazyHostComponent>): void {
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
    fixture.detectChanges();
}

function sheets(): NodeListOf<Element> {
    return document.querySelectorAll('.rt-popover-sheet');
}

describe('Нижняя шторка поповера — код листа приходит позже ручки', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1782 — закрытие до прихода кода листа не оставляет шторки, а пришедший код её не создаёт', async (): Promise<void> => {
        const { fixture, popover } = setup();

        popover.open();
        expect(popover.isOpen()).toBe(true);
        popover.close();
        await flushSheetCode();
        settle(fixture);

        expect(popover.isOpen()).toBe(false);
        expect(sheets()).toHaveLength(0);
    });

    it('SC-UKV-1782 — снос директивы до прихода кода листа не оставляет шторки', async (): Promise<void> => {
        const { fixture, popover } = setup();

        popover.open();
        fixture.destroy();
        await flushSheetCode();

        expect(sheets()).toHaveLength(0);
    });

    it('SC-UKV-1783 — открыть, закрыть и снова открыть до прихода кода даёт одну шторку', async (): Promise<void> => {
        const { fixture, popover } = setup();

        popover.open();
        popover.close();
        popover.open();
        await flushSheetCode();
        settle(fixture);

        expect(popover.isOpen()).toBe(true);
        expect(sheets()).toHaveLength(1);
    });

    it('SC-UKV-1783 — после прихода кода лист открывается и закрывается как прежде, повторное открытие берёт готовый код сразу', async (): Promise<void> => {
        const { fixture, popover } = setup();
        popover.open();
        await flushSheetCode();
        settle(fixture);
        expect(sheets()).toHaveLength(1);
        popover.close();
        await flushSheetCode();

        popover.open();
        settle(fixture);

        expect(sheets().length).toBeGreaterThanOrEqual(1);
        expect(popover.isOpen()).toBe(true);
    });
});
