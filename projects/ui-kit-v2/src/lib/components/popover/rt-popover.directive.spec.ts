import { ChangeDetectionStrategy, Component, Signal, WritableSignal, signal, viewChild } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, el } from '../../../testing/rt-kit-testing';
import { RtPopoverDirective } from './rt-popover.directive';
import { IRtPopover } from './rt-popover.model';

/** Панель живёт в оверлее CDK — искать её надо в документе, а не в фикстуре. */
function panel(): HTMLElement | null {
    return document.querySelector('.rt-popover-panel');
}

function panelText(): string {
    return (panel()?.textContent ?? '').trim();
}

@Component({
    selector: 'rt-popover-host',
    template: `
        <button
            type="button"
            qa-dataid="popover-trigger"
            [rtPopover]="tpl"
            [rtPopoverTrigger]="trigger()"
            [rtPopoverDisabled]="disabled()"
            [rtPopoverPanelClass]="panelClass()"
            (rtPopoverOpened)="openedCount = openedCount + 1"
            (rtPopoverClosed)="closedCount = closedCount + 1">
            Открыть
        </button>
        <ng-template #tpl>
            <div qa-dataid="popover-content">Содержимое панели</div>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtPopoverDirective],
})
class PopoverHostComponent {
    public readonly popover: Signal<RtPopoverDirective | undefined> = viewChild(RtPopoverDirective);
    public readonly trigger: WritableSignal<IRtPopover.Trigger> = signal<IRtPopover.Trigger>('click');
    public readonly disabled: WritableSignal<boolean> = signal<boolean>(false);
    public readonly panelClass: WritableSignal<string> = signal<string>('');
    public openedCount: number = 0;
    public closedCount: number = 0;
}

interface IHostPatch {
    trigger?: IRtPopover.Trigger;
    disabled?: boolean;
    panelClass?: string;
}

function setup(patch: IHostPatch = {}): ComponentFixture<PopoverHostComponent> {
    const fixture: ComponentFixture<PopoverHostComponent> = createRtFixture(PopoverHostComponent, {}, { skipInitialDetect: true });
    if (patch.trigger !== undefined) {
        fixture.componentInstance.trigger.set(patch.trigger);
    }
    if (patch.disabled !== undefined) {
        fixture.componentInstance.disabled.set(patch.disabled);
    }
    if (patch.panelClass !== undefined) {
        fixture.componentInstance.panelClass.set(patch.panelClass);
    }
    fixture.detectChanges();
    return fixture;
}

function clickTrigger(fixture: ComponentFixture<PopoverHostComponent>): void {
    el(fixture, '[qa-dataid="popover-trigger"]')?.nativeElement.click();
    fixture.detectChanges();
}

describe('RtPopoverDirective', (): void => {
    describe('открытие по клику', (): void => {
        it('первый клик открывает панель', (): void => {
            const fixture: ComponentFixture<PopoverHostComponent> = setup();

            clickTrigger(fixture);

            expect(panelText()).toBe('Содержимое панели');
            expect(fixture.componentInstance.popover()?.isOpen()).toBe(true);
        });

        it('повторный клик закрывает', (): void => {
            const fixture: ComponentFixture<PopoverHostComponent> = setup();

            clickTrigger(fixture);
            clickTrigger(fixture);

            expect(panel()).toBeNull();
            expect(fixture.componentInstance.popover()?.isOpen()).toBe(false);
        });

        it('открытие и закрытие поднимают по событию', (): void => {
            const fixture: ComponentFixture<PopoverHostComponent> = setup();

            clickTrigger(fixture);
            clickTrigger(fixture);

            expect(fixture.componentInstance.openedCount).toBe(1);
            expect(fixture.componentInstance.closedCount).toBe(1);
        });
    });

    describe('ручной режим', (): void => {
        it('клик по host ничего не открывает', (): void => {
            const fixture: ComponentFixture<PopoverHostComponent> = setup({ trigger: 'manual' });

            clickTrigger(fixture);

            expect(panel()).toBeNull();
        });

        it('открывается и закрывается вызовом — им пользуются поля со своим жестом', (): void => {
            const fixture: ComponentFixture<PopoverHostComponent> = setup({ trigger: 'manual' });

            fixture.componentInstance.popover()?.open();
            fixture.detectChanges();
            expect(panel()).not.toBeNull();

            fixture.componentInstance.popover()?.close();
            fixture.detectChanges();
            expect(panel()).toBeNull();
        });
    });

    describe('наведение', (): void => {
        it('открывает панель', (): void => {
            const fixture: ComponentFixture<PopoverHostComponent> = setup({ trigger: 'hover' });

            el(fixture, '[qa-dataid="popover-trigger"]')?.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
            fixture.detectChanges();

            expect(panel()).not.toBeNull();
        });

        it('уход курсора закрывает не сразу, а с отсрочкой — чтобы успеть дойти до панели', (): void => {
            jest.useFakeTimers();
            const fixture: ComponentFixture<PopoverHostComponent> = setup({ trigger: 'hover' });
            el(fixture, '[qa-dataid="popover-trigger"]')?.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
            fixture.detectChanges();

            el(fixture, '[qa-dataid="popover-trigger"]')?.nativeElement.dispatchEvent(new MouseEvent('mouseleave'));
            fixture.detectChanges();
            expect(panel()).not.toBeNull();

            jest.advanceTimersByTime(200);
            fixture.detectChanges();
            expect(panel()).toBeNull();
            jest.useRealTimers();
        });

        it('клик в режиме наведения ничего не переключает', (): void => {
            const fixture: ComponentFixture<PopoverHostComponent> = setup({ trigger: 'hover' });

            clickTrigger(fixture);

            expect(panel()).toBeNull();
        });
    });

    describe('закрытие', (): void => {
        it('Escape закрывает панель', (): void => {
            const fixture: ComponentFixture<PopoverHostComponent> = setup();
            clickTrigger(fixture);

            panel()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            fixture.detectChanges();

            expect(panel()).toBeNull();
        });

        it('клик мимо закрывает панель', (): void => {
            const fixture: ComponentFixture<PopoverHostComponent> = setup();
            clickTrigger(fixture);

            document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            fixture.detectChanges();

            expect(panel()).toBeNull();
        });
    });

    describe('отключение', (): void => {
        it('отключённый поповер не открывается ни кликом, ни вызовом', (): void => {
            const fixture: ComponentFixture<PopoverHostComponent> = setup({ disabled: true });

            clickTrigger(fixture);
            fixture.componentInstance.popover()?.open();
            fixture.detectChanges();

            expect(panel()).toBeNull();
        });
    });

    describe('панель', (): void => {
        it('всегда несёт свой базовый класс', (): void => {
            const fixture: ComponentFixture<PopoverHostComponent> = setup();

            clickTrigger(fixture);

            expect(panel()?.classList.contains('rt-popover-panel')).toBe(true);
        });

        it('дополнительные классы добавляются к базовому, а не вместо него', (): void => {
            const fixture: ComponentFixture<PopoverHostComponent> = setup({ panelClass: 'rt-menu-panel narrow' });

            clickTrigger(fixture);

            expect(panel()?.classList.contains('rt-popover-panel')).toBe(true);
            expect(panel()?.classList.contains('rt-menu-panel')).toBe(true);
            expect(panel()?.classList.contains('narrow')).toBe(true);
        });
    });
});
