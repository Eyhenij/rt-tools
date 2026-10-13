import { ConnectedPosition, FlexibleConnectedPositionStrategy } from '@angular/cdk/overlay';
import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { RtTooltipDirective } from '../tooltip/rt-tooltip.directive';
import { createRtFixture, qa, setInputs } from '../../../testing/rt-kit-testing';
import { RtSpeedMenuComponent } from './rt-speed-menu.component';
import { IRtSpeedMenu } from './rt-speed-menu.model';

const ACTIONS: readonly IRtSpeedMenu.Action[] = [
    { value: 'zoom-in', icon: 'add', label: 'Приблизить' },
    { value: 'zoom-out', icon: 'remove', label: 'Отдалить' },
    { value: 'reset', icon: 'undo', label: 'Сбросить' },
];

const WITH_UNAVAILABLE: readonly IRtSpeedMenu.Action[] = [
    { value: 'zoom-in', icon: 'add', label: 'Приблизить' },
    { value: 'zoom-out', icon: 'remove', label: 'Отдалить', disabled: true },
    { value: 'reset', icon: 'undo', label: 'Сбросить' },
];

const ACTION: string = '[qa-dataid="speed-menu-action"]';

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtSpeedMenuComponent> {
    return createRtFixture(RtSpeedMenuComponent, { actions: ACTIONS, ...inputs });
}

/** Панель живёт в оверлее CDK — ищем её в документе. */
function panel(): HTMLElement | null {
    return document.querySelector('[qa-dataid="speed-menu-panel"]');
}

function actionButtons(): HTMLButtonElement[] {
    return Array.from(document.querySelectorAll('[qa-dataid="speed-menu-action"] button'));
}

function trigger(fixture: ComponentFixture<RtSpeedMenuComponent>): HTMLButtonElement {
    return qa(fixture, 'speed-menu-trigger')?.nativeElement.querySelector('button') as HTMLButtonElement;
}

/** Нажатие мышью несёт счёт щелчков, нажатие клавиатурой — ноль. */
function press(fixture: ComponentFixture<RtSpeedMenuComponent>, detail: number = 1): void {
    trigger(fixture).dispatchEvent(new MouseEvent('click', { bubbles: true, detail }));
    fixture.detectChanges();
}

function keydown(target: HTMLElement, key: string): KeyboardEvent {
    const event: KeyboardEvent = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event;
}

function triggerIcon(fixture: ComponentFixture<RtSpeedMenuComponent>): string | null {
    return qa(fixture, 'speed-menu-trigger')?.componentInstance.glyph() ?? null;
}

describe('RtSpeedMenuComponent', (): void => {
    afterEach((): void => {
        jest.restoreAllMocks();
    });

    it('SC-UKV-798: кнопка открывает действия крестом и закрывает вторым нажатием', (): void => {
        const fixture: ComponentFixture<RtSpeedMenuComponent> = setup({ icon: 'zoom_in' });
        const changes: boolean[] = [];
        fixture.componentInstance.openChange.subscribe((open: boolean): number => changes.push(open));

        expect(panel()).toBeNull();
        expect(trigger(fixture).getAttribute('aria-expanded')).toBe('false');
        expect(triggerIcon(fixture)).toBe('zoom_in');

        press(fixture);

        expect(actionButtons()).toHaveLength(3);
        expect(trigger(fixture).getAttribute('aria-expanded')).toBe('true');
        expect(triggerIcon(fixture)).toBe('close');

        press(fixture);

        expect(panel()).toBeNull();
        expect(trigger(fixture).getAttribute('aria-expanded')).toBe('false');
        expect(triggerIcon(fixture)).toBe('zoom_in');
        expect(changes).toEqual([true, false]);
    });

    describe('SC-UKV-799: действия стоят на стороне направления', (): void => {
        const cases: ReadonlyArray<[IRtSpeedMenu.Direction, Partial<ConnectedPosition>, Partial<ConnectedPosition>]> = [
            ['up', { originY: 'top', overlayY: 'bottom' }, { originY: 'bottom', overlayY: 'top' }],
            ['down', { originY: 'bottom', overlayY: 'top' }, { originY: 'top', overlayY: 'bottom' }],
            ['start', { originX: 'start', overlayX: 'end' }, { originX: 'end', overlayX: 'start' }],
            ['end', { originX: 'end', overlayX: 'start' }, { originX: 'start', overlayX: 'end' }],
        ];

        it.each(cases)('%s — своё место первым, противоположное запасным', (direction, main, fallback): void => {
            const spy: jest.SpyInstance = jest.spyOn(FlexibleConnectedPositionStrategy.prototype, 'withPositions');
            const fixture: ComponentFixture<RtSpeedMenuComponent> = setup({ direction });

            press(fixture);

            const positions: ConnectedPosition[] = spy.mock.calls.at(-1)?.[0] ?? [];
            expect(positions[0]).toEqual(expect.objectContaining(main));
            expect(positions[1]).toEqual(expect.objectContaining(fallback));
            expect(panel()?.classList).toContain(`rt-speed-menu__panel--${direction}`);
            expect(actionButtons().map((button: HTMLButtonElement): string | null => button.getAttribute('aria-label'))).toEqual([
                'Приблизить',
                'Отдалить',
                'Сбросить',
            ]);
        });
    });

    describe('SC-UKV-800: действия названы, недоступное не нажимается', (): void => {
        it('имя действия — доступное имя и подсказка; столбец ставит подсказку сбоку', (): void => {
            const fixture: ComponentFixture<RtSpeedMenuComponent> = setup();
            press(fixture);

            const tooltips: RtTooltipDirective[] = fixture.debugElement
                .queryAll(By.css(ACTION))
                .map((node: DebugElement): RtTooltipDirective => node.injector.get(RtTooltipDirective));

            expect(tooltips.map((tooltip: RtTooltipDirective): string => tooltip.text())).toEqual(['Приблизить', 'Отдалить', 'Сбросить']);
            expect(tooltips[0]?.placement()).toBe('left');
        });

        it('ряд ставит подсказку сверху', (): void => {
            const fixture: ComponentFixture<RtSpeedMenuComponent> = setup({ direction: 'end' });
            press(fixture);

            const tooltip: RtTooltipDirective | undefined = fixture.debugElement.query(By.css(ACTION))?.injector.get(RtTooltipDirective);

            expect(tooltip?.placement()).toBe('top');
        });

        it('кнопка меню берёт имя приложения, а без него — подпись кита', (): void => {
            const fixture: ComponentFixture<RtSpeedMenuComponent> = setup({ label: 'Масштаб' });
            expect(trigger(fixture).getAttribute('aria-label')).toBe('Масштаб');

            setInputs(fixture, { label: '' });
            fixture.detectChanges();

            expect(trigger(fixture).getAttribute('aria-label')).toBe('Actions');
        });

        it('недоступное действие ничего не отдаёт', (): void => {
            const fixture: ComponentFixture<RtSpeedMenuComponent> = setup({ actions: WITH_UNAVAILABLE });
            const chosen: jest.Mock = jest.fn();
            fixture.componentInstance.actionSelect.subscribe(chosen);
            press(fixture);

            const unavailable: HTMLButtonElement | undefined = actionButtons()[1];
            expect(unavailable?.disabled).toBe(true);
            unavailable?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

            expect(chosen).not.toHaveBeenCalled();
        });
    });

    describe('SC-UKV-801: выбор уходит выходом, меню следует входу', (): void => {
        it('по умолчанию меню остаётся открытым', (): void => {
            const fixture: ComponentFixture<RtSpeedMenuComponent> = setup();
            const chosen: jest.Mock = jest.fn();
            fixture.componentInstance.actionSelect.subscribe(chosen);
            press(fixture);

            actionButtons()[0]?.click();
            fixture.detectChanges();

            expect(chosen).toHaveBeenCalledTimes(1);
            expect(chosen).toHaveBeenCalledWith('zoom-in');
            expect(panel()).not.toBeNull();
        });

        it('с закрытием на выборе меню закрывается и отдаёт фокус кнопке', (): void => {
            const fixture: ComponentFixture<RtSpeedMenuComponent> = setup({ closeOnSelect: true });
            const chosen: jest.Mock = jest.fn();
            fixture.componentInstance.actionSelect.subscribe(chosen);
            press(fixture);

            actionButtons()[2]?.focus();
            actionButtons()[2]?.click();
            fixture.detectChanges();

            expect(chosen).toHaveBeenCalledWith('reset');
            expect(panel()).toBeNull();
            expect(document.activeElement).toBe(trigger(fixture));
        });
    });

    describe('SC-UKV-802: Escape и нажатие снаружи закрывают меню', (): void => {
        it('Escape закрывает и возвращает фокус на кнопку', (): void => {
            const fixture: ComponentFixture<RtSpeedMenuComponent> = setup();
            press(fixture);
            actionButtons()[1]?.focus();

            keydown(actionButtons()[1], 'Escape');
            fixture.detectChanges();

            expect(panel()).toBeNull();
            expect(document.activeElement).toBe(trigger(fixture));
        });

        it('нажатие снаружи закрывает и фокус не трогает', (): void => {
            const fixture: ComponentFixture<RtSpeedMenuComponent> = setup();
            const outside: HTMLButtonElement = document.createElement('button');
            document.body.appendChild(outside);
            press(fixture);
            outside.focus();

            outside.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            fixture.detectChanges();

            expect(panel()).toBeNull();
            expect(document.activeElement).toBe(outside);
            outside.remove();
        });
    });

    describe('SC-UKV-803: клавиатура открывает в первое действие и ходит по действиям', (): void => {
        it('нажатие клавиатурой ставит фокус на первое действие', async (): Promise<void> => {
            const fixture: ComponentFixture<RtSpeedMenuComponent> = setup({ actions: WITH_UNAVAILABLE });

            press(fixture, 0);
            await fixture.whenStable();

            expect(document.activeElement).toBe(actionButtons()[0]);
        });

        it('нажатие мышью оставляет фокус на кнопке меню', async (): Promise<void> => {
            const fixture: ComponentFixture<RtSpeedMenuComponent> = setup();
            trigger(fixture).focus();

            press(fixture);
            await fixture.whenStable();

            expect(document.activeElement).toBe(trigger(fixture));
        });

        it('стрелки обходят недоступное и идут по кругу, Home и End берут крайние', (): void => {
            const fixture: ComponentFixture<RtSpeedMenuComponent> = setup({ actions: WITH_UNAVAILABLE });
            press(fixture);
            const buttons: HTMLButtonElement[] = actionButtons();
            const first: HTMLButtonElement | undefined = buttons[0];
            const last: HTMLButtonElement | undefined = buttons[2];
            first?.focus();

            keydown(first, 'ArrowDown');
            expect(document.activeElement).toBe(last);

            keydown(last, 'ArrowRight');
            expect(document.activeElement).toBe(first);

            keydown(first, 'ArrowUp');
            expect(document.activeElement).toBe(last);

            keydown(last, 'Home');
            expect(document.activeElement).toBe(first);

            keydown(first, 'End');
            expect(document.activeElement).toBe(last);
        });

        it('Tab закрывает меню и возвращает фокус на кнопку', (): void => {
            const fixture: ComponentFixture<RtSpeedMenuComponent> = setup();
            press(fixture);
            actionButtons()[0]?.focus();

            const event: KeyboardEvent = keydown(actionButtons()[0], 'Tab');
            fixture.detectChanges();

            expect(event.defaultPrevented).toBe(true);
            expect(panel()).toBeNull();
            expect(document.activeElement).toBe(trigger(fixture));
        });
    });

    describe('SC-UKV-804: недоступное и пустое меню не открывается', (): void => {
        it('недоступное меню не открывается', (): void => {
            const fixture: ComponentFixture<RtSpeedMenuComponent> = setup({ disabled: true });

            press(fixture);

            expect(panel()).toBeNull();
        });

        it('меню без действий не открывается', (): void => {
            const fixture: ComponentFixture<RtSpeedMenuComponent> = setup({ actions: [] });

            press(fixture);

            expect(panel()).toBeNull();
            expect(trigger(fixture).getAttribute('aria-expanded')).toBe('false');
        });

        it('открытое меню закрывается, когда становится недоступным', (): void => {
            const fixture: ComponentFixture<RtSpeedMenuComponent> = setup();
            press(fixture);

            setInputs(fixture, { disabled: true });
            fixture.detectChanges();

            expect(panel()).toBeNull();
        });
    });
});
