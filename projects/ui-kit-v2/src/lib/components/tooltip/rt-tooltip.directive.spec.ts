import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { FocusMonitor } from '@angular/cdk/a11y';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideRtKit } from '../../config/rt-kit-config.providers';
import { createRtFixture, el } from '../../../testing/rt-kit-testing';
import { RtTooltipDirective } from './rt-tooltip.directive';
import { IRtTooltip } from './rt-tooltip.model';

/** Подсказка живёт в оверлее CDK — ищем её в документе. */
function tip(): HTMLElement | null {
    return document.querySelector('rt-tooltip');
}

@Component({
    selector: 'rt-tooltip-host',
    template: `
        <button
            type="button"
            qa-dataid="tooltip-host"
            [rtTooltip]="text()"
            [rtTooltipPlacement]="placement()"
            [rtTooltipHideOnClick]="hideOnClick()">
            Кнопка
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTooltipDirective],
})
class TooltipHostComponent {
    public readonly text: WritableSignal<string | null | undefined> = signal<string | null | undefined>('Удалить строку');
    public readonly placement: WritableSignal<IRtTooltip.Placement> = signal<IRtTooltip.Placement>('top');
    public readonly hideOnClick: WritableSignal<boolean> = signal<boolean>(true);
}

@Component({
    selector: 'rt-tooltip-preset-host',
    template:
        '<div class="rt-preset-material"><button type="button" qa-dataid="tooltip-host" rtTooltip="Удалить строку">Кнопка</button></div>',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTooltipDirective],
})
class TooltipPresetHostComponent {}

/** Подсказки без своих входов и одна со своим: умолчания приходят из настроек кита. */
@Component({
    selector: 'rt-tooltip-config-host',
    template: `
        <button type="button" qa-dataid="plain" rtTooltip="Удалить строку">Кнопка</button>
        <button type="button" qa-dataid="own" rtTooltip="Сохранить" [rtTooltipHideOnClick]="true">Кнопка</button>
        <button type="button" qa-dataid="delayed" rtTooltip="Вид" rtTooltipShowDelay="500">Кнопка</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTooltipDirective],
})
class TooltipConfigHostComponent {}

function setup(text: string | null | undefined = 'Удалить строку'): ComponentFixture<TooltipHostComponent> {
    const fixture: ComponentFixture<TooltipHostComponent> = createRtFixture(TooltipHostComponent, {}, { skipInitialDetect: true });
    fixture.componentInstance.text.set(text);
    fixture.detectChanges();
    return fixture;
}

/** Фокус тем путём, каким его ставит человек или код: FocusMonitor различает их по источнику */
function focusVia(fixture: ComponentFixture<TooltipHostComponent>, origin: 'keyboard' | 'mouse' | 'program'): void {
    TestBed.inject(FocusMonitor).focusVia(el(fixture, '[qa-dataid="tooltip-host"]')?.nativeElement as HTMLElement, origin);
    fixture.detectChanges();
}

function hover(fixture: ComponentFixture<TooltipHostComponent>, event: 'mouseenter' | 'mouseleave' | 'focusin' | 'focusout'): void {
    el(fixture, '[qa-dataid="tooltip-host"]')?.nativeElement.dispatchEvent(new Event(event));
    fixture.detectChanges();
}

describe('RtTooltipDirective', (): void => {
    it('SC-UKV-369 — подсказка под признаком набора несёт класс набора на своей панели', (): void => {
        jest.useFakeTimers();
        const fixture: ComponentFixture<TooltipPresetHostComponent> = createRtFixture(TooltipPresetHostComponent);

        el(fixture, '[qa-dataid="tooltip-host"]')?.nativeElement.dispatchEvent(new Event('mouseenter'));
        jest.advanceTimersByTime(300);
        fixture.detectChanges();

        expect(tip()).not.toBeNull();
        expect(tip()?.closest('.cdk-overlay-pane')?.classList.contains('rt-preset-material')).toBe(true);
        jest.useRealTimers();
    });

    beforeEach((): void => {
        jest.useFakeTimers();
    });

    afterEach((): void => {
        jest.useRealTimers();
    });

    it('наведение показывает подсказку не сразу, а с задержкой', (): void => {
        // Задержка гасит мелькание при быстром проходе курсора по ряду кнопок.
        const fixture: ComponentFixture<TooltipHostComponent> = setup();

        hover(fixture, 'mouseenter');
        expect(tip()).toBeNull();

        jest.advanceTimersByTime(300);
        fixture.detectChanges();

        expect(tip()?.textContent).toBe('Удалить строку');
    });

    it('уход курсора до истечения задержки не показывает ничего', (): void => {
        const fixture: ComponentFixture<TooltipHostComponent> = setup();

        hover(fixture, 'mouseenter');
        hover(fixture, 'mouseleave');
        jest.advanceTimersByTime(500);
        fixture.detectChanges();

        expect(tip()).toBeNull();
    });

    it('уход курсора прячет показанную подсказку', (): void => {
        const fixture: ComponentFixture<TooltipHostComponent> = setup();
        hover(fixture, 'mouseenter');
        jest.advanceTimersByTime(300);
        fixture.detectChanges();

        hover(fixture, 'mouseleave');

        expect(tip()).toBeNull();
    });

    it('фокус с клавиатуры показывает подсказку так же, как наведение', (): void => {
        const fixture: ComponentFixture<TooltipHostComponent> = setup();

        focusVia(fixture, 'keyboard');
        jest.advanceTimersByTime(300);
        fixture.detectChanges();

        expect(tip()).not.toBeNull();
    });

    it('фокус, поставленный мышью или кодом, подсказку не показывает — меню возвращает его кнопке после выбора', (): void => {
        const fixture: ComponentFixture<TooltipHostComponent> = setup();

        focusVia(fixture, 'program');
        jest.advanceTimersByTime(300);
        fixture.detectChanges();
        expect(tip()).toBeNull();

        hover(fixture, 'focusout');
        focusVia(fixture, 'mouse');
        jest.advanceTimersByTime(300);
        fixture.detectChanges();
        expect(tip()).toBeNull();
    });

    it('потеря фокуса прячет подсказку', (): void => {
        const fixture: ComponentFixture<TooltipHostComponent> = setup();
        focusVia(fixture, 'keyboard');
        jest.advanceTimersByTime(300);
        fixture.detectChanges();

        hover(fixture, 'focusout');

        expect(tip()).toBeNull();
    });

    it('клик прячет подсказку — она мешала бы смотреть на результат нажатия', (): void => {
        const fixture: ComponentFixture<TooltipHostComponent> = setup();
        hover(fixture, 'mouseenter');
        jest.advanceTimersByTime(300);
        fixture.detectChanges();

        el(fixture, '[qa-dataid="tooltip-host"]')?.nativeElement.click();
        fixture.detectChanges();

        expect(tip()).toBeNull();
    });

    describe('Escape', (): void => {
        function escape(fixture: ComponentFixture<TooltipHostComponent>): KeyboardEvent {
            const event: KeyboardEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
            el(fixture, '[qa-dataid="tooltip-host"]')?.nativeElement.dispatchEvent(event);
            fixture.detectChanges();
            return event;
        }

        function reachedParent(fixture: ComponentFixture<TooltipHostComponent>): jest.Mock {
            const listener: jest.Mock = jest.fn();
            (fixture.nativeElement as HTMLElement).addEventListener('keydown', listener);
            return listener;
        }

        it('SC-UKV-1032 — Escape закрывает открытую подсказку и не уходит выше хоста', (): void => {
            const fixture: ComponentFixture<TooltipHostComponent> = setup();
            const parent: jest.Mock = reachedParent(fixture);
            focusVia(fixture, 'keyboard');
            jest.advanceTimersByTime(300);
            fixture.detectChanges();
            expect(tip()).not.toBeNull();

            const event: KeyboardEvent = escape(fixture);

            expect(tip()).toBeNull();
            expect(event.defaultPrevented).toBe(true);
            expect(parent).not.toHaveBeenCalled();
            expect(document.activeElement).toBe(el(fixture, '[qa-dataid="tooltip-host"]')?.nativeElement);
        });

        it('SC-UKV-1033 — Escape при закрытой подсказке доходит до родителя', (): void => {
            const fixture: ComponentFixture<TooltipHostComponent> = setup();
            const parent: jest.Mock = reachedParent(fixture);

            const event: KeyboardEvent = escape(fixture);

            expect(event.defaultPrevented).toBe(false);
            expect(parent).toHaveBeenCalledTimes(1);
        });

        it('SC-UKV-1033 — Escape до истечения задержки снимает показ и доходит до родителя', (): void => {
            const fixture: ComponentFixture<TooltipHostComponent> = setup();
            const parent: jest.Mock = reachedParent(fixture);
            focusVia(fixture, 'keyboard');

            escape(fixture);
            jest.advanceTimersByTime(500);
            fixture.detectChanges();

            expect(tip()).toBeNull();
            expect(parent).toHaveBeenCalledTimes(1);
        });

        it('SC-UKV-1034 — после Escape новый фокус с клавиатуры и наведение снова показывают подсказку', (): void => {
            const fixture: ComponentFixture<TooltipHostComponent> = setup();
            focusVia(fixture, 'keyboard');
            jest.advanceTimersByTime(300);
            fixture.detectChanges();
            escape(fixture);

            hover(fixture, 'focusout');
            focusVia(fixture, 'keyboard');
            jest.advanceTimersByTime(300);
            fixture.detectChanges();
            expect(tip()).not.toBeNull();

            escape(fixture);
            hover(fixture, 'mouseenter');
            jest.advanceTimersByTime(300);
            fixture.detectChanges();
            expect(tip()).not.toBeNull();
        });
    });

    describe('клик по переключателю и смена текста', (): void => {
        function open(fixture: ComponentFixture<TooltipHostComponent>): void {
            hover(fixture, 'mouseenter');
            jest.advanceTimersByTime(300);
            fixture.detectChanges();
        }

        function click(fixture: ComponentFixture<TooltipHostComponent>): void {
            el(fixture, '[qa-dataid="tooltip-host"]')?.nativeElement.click();
            fixture.detectChanges();
        }

        function keepOnClick(fixture: ComponentFixture<TooltipHostComponent>): void {
            fixture.componentInstance.hideOnClick.set(false);
            fixture.detectChanges();
        }

        it('SC-UKV-850 — с rtTooltipHideOnClick=false клик оставляет открытую подсказку', (): void => {
            const fixture: ComponentFixture<TooltipHostComponent> = setup();
            keepOnClick(fixture);
            open(fixture);
            expect(tip()).not.toBeNull();

            click(fixture);

            expect(tip()).not.toBeNull();
        });

        it('SC-UKV-851 — по умолчанию клик прячет подсказку', (): void => {
            const fixture: ComponentFixture<TooltipHostComponent> = setup();
            open(fixture);
            expect(tip()).not.toBeNull();

            click(fixture);

            expect(tip()).toBeNull();
        });

        it('SC-UKV-852 — касание (mouseenter и сразу click) не показывает подсказку и при false', (): void => {
            const fixture: ComponentFixture<TooltipHostComponent> = setup();
            keepOnClick(fixture);

            hover(fixture, 'mouseenter');
            click(fixture);
            jest.advanceTimersByTime(500);
            fixture.detectChanges();

            expect(tip()).toBeNull();
        });

        it('SC-UKV-853 — новый текст появляется в открытой подсказке без нового наведения', (): void => {
            const fixture: ComponentFixture<TooltipHostComponent> = setup('Включить');
            keepOnClick(fixture);
            open(fixture);
            expect(tip()?.textContent?.trim()).toBe('Включить');

            click(fixture);
            fixture.componentInstance.text.set('Выключить');
            fixture.detectChanges();

            expect(document.querySelectorAll('rt-tooltip').length).toBe(1);
            expect(tip()?.textContent?.trim()).toBe('Выключить');
        });

        it('SC-UKV-854 — опустевший текст прячет открытую подсказку', (): void => {
            const fixture: ComponentFixture<TooltipHostComponent> = setup();
            open(fixture);
            expect(tip()).not.toBeNull();

            fixture.componentInstance.text.set('');
            fixture.detectChanges();

            expect(tip()).toBeNull();
        });
    });

    describe('пустой текст', (): void => {
        it.each<[string, string | null | undefined]>([
            ['пустая строка', ''],
            ['одни пробелы', '   '],
            ['null', null],
            ['undefined', undefined],
        ])('%s выключает директиву', (_name: string, text: string | null | undefined): void => {
            // Директиву вешают на иконочные кнопки безусловно и включают,
            // выставив строку, — поэтому пустое значение обязано быть no-op,
            // а не пустой панелью под курсором.
            // Значение ставится после подъёма: `undefined` в аргументе setup()
            // подставил бы умолчание параметра вместо проверяемого случая.
            const fixture: ComponentFixture<TooltipHostComponent> = setup();
            fixture.componentInstance.text.set(text);
            fixture.detectChanges();

            hover(fixture, 'mouseenter');
            jest.advanceTimersByTime(500);
            fixture.detectChanges();

            expect(tip()).toBeNull();
        });
    });

    it('панель объявлена подсказкой для скринридера', (): void => {
        const fixture: ComponentFixture<TooltipHostComponent> = setup();

        hover(fixture, 'mouseenter');
        jest.advanceTimersByTime(300);
        fixture.detectChanges();

        expect(tip()?.getAttribute('role')).toBe('tooltip');
    });

    it('повторное наведение при открытой подсказке не плодит вторую панель', (): void => {
        const fixture: ComponentFixture<TooltipHostComponent> = setup();
        hover(fixture, 'mouseenter');
        jest.advanceTimersByTime(300);
        fixture.detectChanges();

        hover(fixture, 'mouseenter');
        jest.advanceTimersByTime(300);
        fixture.detectChanges();

        expect(document.querySelectorAll('rt-tooltip').length).toBe(1);
    });

    describe('тема куска', (): void => {
        function show(fixture: ComponentFixture<TooltipHostComponent>): void {
            hover(fixture, 'mouseenter');
            jest.advanceTimersByTime(300);
            fixture.detectChanges();
        }

        afterEach((): void => {
            document.documentElement.removeAttribute('data-theme');
        });

        it('подсказка из тёмного куска несёт тему куска на коробке и снимает её, когда кусок ушёл', (): void => {
            const fixture: ComponentFixture<TooltipHostComponent> = setup();
            (fixture.nativeElement as HTMLElement).setAttribute('data-theme', 'dark');

            show(fixture);
            expect(tip()?.closest('.cdk-overlay-pane')?.getAttribute('data-theme')).toBe('dark');

            hover(fixture, 'mouseleave');
            (fixture.nativeElement as HTMLElement).removeAttribute('data-theme');
            show(fixture);

            const pane: Element | null | undefined = tip()?.closest('.cdk-overlay-pane');
            expect(pane).not.toBeNull();
            expect(pane?.hasAttribute('data-theme')).toBe(false);
        });

        it('тема корня страницы на коробку не копируется', (): void => {
            document.documentElement.setAttribute('data-theme', 'dark');
            const fixture: ComponentFixture<TooltipHostComponent> = setup();

            show(fixture);

            const pane: Element | null | undefined = tip()?.closest('.cdk-overlay-pane');
            expect(pane).not.toBeNull();
            expect(pane?.hasAttribute('data-theme')).toBe(false);
        });
    });

    describe('SC-UKV-1007 — умолчания подсказки из настроек кита', (): void => {
        beforeEach((): void => {
            jest.useFakeTimers();
        });

        afterEach((): void => {
            jest.useRealTimers();
        });

        function configured(): ComponentFixture<TooltipConfigHostComponent> {
            return createRtFixture(
                TooltipConfigHostComponent,
                {},
                {
                    providers: [provideRtKit({ components: { tooltip: { hideOnClick: false, placement: 'bottom', showDelay: 100 } } })],
                }
            );
        }

        function node(fixture: ComponentFixture<TooltipConfigHostComponent>, id: string): HTMLElement {
            return el(fixture, `[qa-dataid="${id}"]`)?.nativeElement as HTMLElement;
        }

        it('SC-UKV-1007 — подсказка без входов берёт задержку из настроек, клик её не прячет', (): void => {
            const fixture: ComponentFixture<TooltipConfigHostComponent> = configured();
            node(fixture, 'plain').dispatchEvent(new Event('mouseenter'));
            jest.advanceTimersByTime(99);
            expect(tip()).toBeNull();
            jest.advanceTimersByTime(1);
            fixture.detectChanges();
            expect(tip()).not.toBeNull();

            node(fixture, 'plain').click();
            fixture.detectChanges();
            expect(tip()).not.toBeNull();
        });

        it('SC-UKV-1007 — вход на элементе перебивает настройки кита', (): void => {
            const fixture: ComponentFixture<TooltipConfigHostComponent> = configured();

            node(fixture, 'own').dispatchEvent(new Event('mouseenter'));
            jest.advanceTimersByTime(100);
            fixture.detectChanges();
            expect(tip()).not.toBeNull();

            node(fixture, 'own').click();
            fixture.detectChanges();
            expect(tip()).toBeNull();
        });

        it('SC-UKV-1017 — своя задержка на элементе перебивает задержку из настроек кита', (): void => {
            const fixture: ComponentFixture<TooltipConfigHostComponent> = configured();

            node(fixture, 'delayed').dispatchEvent(new Event('mouseenter'));
            jest.advanceTimersByTime(499);
            fixture.detectChanges();
            expect(tip()).toBeNull();

            jest.advanceTimersByTime(1);
            fixture.detectChanges();
            expect(tip()?.textContent).toBe('Вид');
        });

        it('SC-UKV-1018 — без своей задержки подсказка ждёт умолчание кита, соседняя со своей — свою', (): void => {
            const fixture: ComponentFixture<TooltipConfigHostComponent> = createRtFixture(TooltipConfigHostComponent);

            node(fixture, 'plain').dispatchEvent(new Event('mouseenter'));
            jest.advanceTimersByTime(300);
            fixture.detectChanges();
            expect(tip()?.textContent).toBe('Удалить строку');
            node(fixture, 'plain').dispatchEvent(new Event('mouseleave'));
            fixture.detectChanges();

            node(fixture, 'delayed').dispatchEvent(new Event('mouseenter'));
            jest.advanceTimersByTime(300);
            fixture.detectChanges();
            expect(tip()).toBeNull();
            jest.advanceTimersByTime(200);
            fixture.detectChanges();
            expect(tip()?.textContent).toBe('Вид');
        });
    });
});
