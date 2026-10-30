import { ConnectedPosition, FlexibleConnectedPositionStrategy, Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, Signal, WritableSignal, signal, viewChild } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, el } from '../../../testing/rt-kit-testing';
import { RtPopoverDirective } from './rt-popover.directive';
import { IRtPopover } from './rt-popover.model';

const END: ConnectedPosition = { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center' };
const START: ConnectedPosition = { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center' };

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
            [rtPopoverWidth]="width()"
            [rtPopoverDisabled]="disabled()"
            [rtPopoverPanelClass]="panelClass()"
            [rtPopoverPositions]="positions()"
            [rtPopoverFitViewport]="fitViewport()"
            [rtPopoverBackdropClass]="backdropClass()"
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
    public readonly width: WritableSignal<IRtPopover.Width> = signal<IRtPopover.Width>('auto');
    public readonly disabled: WritableSignal<boolean> = signal<boolean>(false);
    public readonly panelClass: WritableSignal<string> = signal<string>('');
    public readonly positions: WritableSignal<readonly ConnectedPosition[] | null> = signal<readonly ConnectedPosition[] | null>(null);
    public readonly fitViewport: WritableSignal<boolean> = signal<boolean>(false);
    public readonly backdropClass: WritableSignal<string> = signal<string>('');
    public openedCount: number = 0;
    public closedCount: number = 0;
}

interface IHostPatch {
    trigger?: IRtPopover.Trigger;
    width?: IRtPopover.Width;
    disabled?: boolean;
    panelClass?: string;
}

function setup(patch: IHostPatch = {}): ComponentFixture<PopoverHostComponent> {
    const fixture: ComponentFixture<PopoverHostComponent> = createRtFixture(PopoverHostComponent, {}, { skipInitialDetect: true });
    if (patch.trigger !== undefined) {
        fixture.componentInstance.trigger.set(patch.trigger);
    }
    if (patch.width !== undefined) {
        fixture.componentInstance.width.set(patch.width);
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

/** Приход указателя: в jsdom нет PointerEvent, и его тип добавляется к событию мыши. */
function pointerEnter(pointerType: string): MouseEvent {
    const event: MouseEvent = new MouseEvent('pointerenter');

    Object.defineProperty(event, 'pointerType', { value: pointerType });
    return event;
}

function clickTrigger(fixture: ComponentFixture<PopoverHostComponent>): void {
    el(fixture, '[qa-dataid="popover-trigger"]')?.nativeElement.click();
    fixture.detectChanges();
}

describe('RtPopoverDirective', (): void => {
    // Возврат к настоящим таймерам — в afterEach, а не в конце теста: падение
    // утверждения посреди теста иначе оставило бы поддельные таймеры всем
    // следующим тестам файла, и одна поломка размножилась бы в каскад.
    afterEach((): void => {
        jest.useRealTimers();
    });

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
        });

        it('SC-UKV-1082: наведение, порождённое касанием, панель не открывает и уход её не закрывает', (): void => {
            jest.useFakeTimers();
            const fixture: ComponentFixture<PopoverHostComponent> = setup({ trigger: 'hover' });
            const trigger: HTMLElement = el(fixture, '[qa-dataid="popover-trigger"]')?.nativeElement;

            trigger.dispatchEvent(pointerEnter('touch'));
            trigger.dispatchEvent(new MouseEvent('mouseenter'));
            fixture.detectChanges();
            expect(panel()).toBeNull();

            clickTrigger(fixture);
            trigger.dispatchEvent(new MouseEvent('mouseleave'));
            jest.advanceTimersByTime(200);
            fixture.detectChanges();

            expect(panel()).not.toBeNull();
        });

        it('мышь после касания снова открывает панель наведением', (): void => {
            const fixture: ComponentFixture<PopoverHostComponent> = setup({ trigger: 'hover' });
            const trigger: HTMLElement = el(fixture, '[qa-dataid="popover-trigger"]')?.nativeElement;
            trigger.dispatchEvent(pointerEnter('touch'));

            trigger.dispatchEvent(pointerEnter('mouse'));
            trigger.dispatchEvent(new MouseEvent('mouseenter'));
            fixture.detectChanges();

            expect(panel()).not.toBeNull();
        });

        it('SC-UKV-1083: нажатие на host в режиме наведения открывает панель, и второе нажатие её не закрывает', (): void => {
            const fixture: ComponentFixture<PopoverHostComponent> = setup({ trigger: 'hover' });

            clickTrigger(fixture);
            clickTrigger(fixture);

            expect(panel()).not.toBeNull();
            expect(fixture.componentInstance.openedCount).toBe(1);
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

        it('панель из куска `rtTheme` несёт тему куска и снимает её, когда куска больше нет', (): void => {
            const fixture: ComponentFixture<PopoverHostComponent> = setup();
            const host: HTMLElement = fixture.nativeElement as HTMLElement;
            host.setAttribute('data-theme', 'dark');

            clickTrigger(fixture);
            expect(panel()?.getAttribute('data-theme')).toBe('dark');

            clickTrigger(fixture);
            host.removeAttribute('data-theme');
            clickTrigger(fixture);
            expect(panel()?.hasAttribute('data-theme')).toBe(false);
        });

        it('тема корня страницы на панель не переносится — панель наследует её и так', (): void => {
            document.documentElement.setAttribute('data-theme', 'dark');
            const fixture: ComponentFixture<PopoverHostComponent> = setup();

            clickTrigger(fixture);

            expect(panel()?.hasAttribute('data-theme')).toBe(false);
            document.documentElement.removeAttribute('data-theme');
        });
    });
    describe('ширина панели', (): void => {
        /** Коробка панели живёт в оверлее CDK: у неё свой элемент, и размер ставится на него. */
        function pane(): HTMLElement | null {
            return document.querySelector('.cdk-overlay-pane');
        }

        it('SC-UKV-178: панель не мерится указателем — его ширина идёт нижней границей', (): void => {
            const fixture: ComponentFixture<PopoverHostComponent> = setup({ width: 'trigger-min' });

            clickTrigger(fixture);

            expect(pane()?.style.minWidth).not.toBe('');
            expect(pane()?.style.width).toBe('');
        });

        it('по указателю ширина ставится ровно, без нижней границы', (): void => {
            const fixture: ComponentFixture<PopoverHostComponent> = setup({ width: 'trigger' });

            clickTrigger(fixture);

            expect(pane()?.style.width).not.toBe('');
            expect(pane()?.style.minWidth).toBe('');
        });

        it('по содержимому размер не ставится вовсе', (): void => {
            const fixture: ComponentFixture<PopoverHostComponent> = setup({ width: 'auto' });

            clickTrigger(fixture);

            expect(pane()?.style.width).toBe('');
            expect(pane()?.style.minWidth).toBe('');
        });
    });

    describe('места панели', (): void => {
        afterEach((): void => {
            jest.restoreAllMocks();
        });

        function lastPositions(spy: jest.SpyInstance): ConnectedPosition[] {
            return spy.mock.calls.at(-1)?.[0] ?? [];
        }

        it('SC-UKV-805: без своих мест панель встаёт под host, а над ним — запасным', (): void => {
            const spy: jest.SpyInstance = jest.spyOn(FlexibleConnectedPositionStrategy.prototype, 'withPositions');
            const fixture: ComponentFixture<PopoverHostComponent> = setup();

            clickTrigger(fixture);

            expect(spy).toHaveBeenCalledTimes(1);
            expect(lastPositions(spy)[0]).toEqual(expect.objectContaining({ originY: 'bottom', overlayY: 'top' }));
            expect(lastPositions(spy)[1]).toEqual(expect.objectContaining({ originY: 'top', overlayY: 'bottom' }));
        });

        it('свои места читаются при каждом открытии', (): void => {
            const spy: jest.SpyInstance = jest.spyOn(FlexibleConnectedPositionStrategy.prototype, 'withPositions');
            const fixture: ComponentFixture<PopoverHostComponent> = setup();
            fixture.componentInstance.positions.set([END]);
            fixture.detectChanges();

            clickTrigger(fixture);

            expect(lastPositions(spy)).toEqual([END]);

            clickTrigger(fixture);
            fixture.componentInstance.positions.set([START]);
            fixture.detectChanges();
            clickTrigger(fixture);

            expect(lastPositions(spy)).toEqual([START]);
        });
    });

    describe('подгонка под окно', (): void => {
        afterEach((): void => {
            jest.restoreAllMocks();
        });

        it('SC-UKV-883 — короткая панель высотой со своё содержимое, порог подгонки остаётся', (): void => {
            // Порог 120 нужен оверлею, чтобы решить, сдвинуть панель или ужать. Стоя в стиле
            // коробки, он же растягивал панель из двух пунктов, и под ними стояла пустая полоса.
            const create: jest.SpyInstance = jest.spyOn(Overlay.prototype, 'create');
            const fixture: ComponentFixture<PopoverHostComponent> = setup();
            fixture.componentInstance.fitViewport.set(true);
            fixture.detectChanges();

            clickTrigger(fixture);

            const config: OverlayConfig | undefined = create.mock.calls.at(-1)?.[0];
            const box: HTMLElement | null = document.querySelector('.cdk-overlay-pane');
            expect(config?.minHeight).toBe(120);
            expect(box).not.toBeNull();
            expect(box?.style.minHeight).toBe('');
        });
    });

    describe('подложка', (): void => {
        it('SC-UKV-1070: без класса подложки страница рядом с панелью открыта', (): void => {
            const fixture: ComponentFixture<PopoverHostComponent> = setup();

            clickTrigger(fixture);

            expect(panel()).not.toBeNull();
            expect(document.querySelector('.cdk-overlay-backdrop')).toBeNull();
        });

        it('SC-UKV-1071: класс подложки ставит её под панель, и нажатие по ней закрывает панель', (): void => {
            const fixture: ComponentFixture<PopoverHostComponent> = setup();
            fixture.componentInstance.backdropClass.set('spec-backdrop');
            fixture.detectChanges();

            clickTrigger(fixture);
            const backdrop: HTMLElement | null = document.querySelector('.cdk-overlay-backdrop.spec-backdrop');
            expect(backdrop).not.toBeNull();

            backdrop?.click();
            fixture.detectChanges();

            expect(panel()).toBeNull();
            expect(fixture.componentInstance.popover()?.isOpen()).toBe(false);
        });
    });
});
