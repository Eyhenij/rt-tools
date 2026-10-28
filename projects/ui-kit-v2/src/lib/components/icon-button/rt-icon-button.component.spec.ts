import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { provideRtKit } from '../../config/rt-kit-config.providers';
import { classesOf, createRtFixture, el, hostClasses, qa } from '../../../testing/rt-kit-testing';
import { RtTooltipDirective } from '../tooltip/rt-tooltip.directive';
import { RtIconButtonComponent } from './rt-icon-button.component';
import { IRtIconButton } from './rt-icon-button.model';

/** Страница, куда ведёт кнопка-ссылка: самой разметки у неё нет. */
@Component({ selector: 'rt-settings-page', template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class SettingsPageComponent {}

const LINK_ROUTES: { path: string; component: typeof SettingsPageComponent }[] = [
    { path: 'personal-settings', component: SettingsPageComponent },
];

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtIconButtonComponent> {
    return createRtFixture(RtIconButtonComponent, { icon: 'ico-trash', ariaLabel: 'Удалить', ...inputs });
}

function control(fixture: ComponentFixture<RtIconButtonComponent>): DebugElement | null {
    return qa(fixture, 'icon-button-control');
}

function controlClasses(fixture: ComponentFixture<RtIconButtonComponent>): string[] {
    return classesOf(control(fixture));
}

function tooltipOf(fixture: ComponentFixture<RtIconButtonComponent>): RtTooltipDirective {
    return control(fixture)?.injector.get(RtTooltipDirective) as RtTooltipDirective;
}

describe('RtIconButtonComponent', (): void => {
    it('SC-UKV-1007 — умолчание hideOnClick подсказки кнопки берётся из настроек кита, вход его перебивает', (): void => {
        const kept: ComponentFixture<RtIconButtonComponent> = createRtFixture(
            RtIconButtonComponent,
            { icon: 'ico-trash', ariaLabel: 'Удалить', tooltip: 'Удалить' },
            { providers: [provideRtKit({ components: { tooltip: { hideOnClick: false } } })] }
        );

        expect(tooltipOf(kept).hideOnClick()).toBe(false);

        const own: ComponentFixture<RtIconButtonComponent> = createRtFixture(
            RtIconButtonComponent,
            { icon: 'ico-trash', ariaLabel: 'Удалить', tooltip: 'Удалить', tooltipHideOnClick: true },
            { providers: [provideRtKit({ components: { tooltip: { hideOnClick: false } } })] }
        );

        expect(tooltipOf(own).hideOnClick()).toBe(true);
    });

    it('рисует свою кнопку внутри, а не превращает host в кнопку', (): void => {
        const fixture: ComponentFixture<RtIconButtonComponent> = setup();

        expect(hostClasses(fixture)).toContain('rt-icon-button');
        expect((control(fixture)?.nativeElement as HTMLElement).tagName).toBe('BUTTON');
    });

    it('рисует заданную иконку', (): void => {
        expect(el(setup(), 'use')?.attributes['href']).toBe('#rt-icon-ico-trash');
    });

    it('SC-UKV-855 — tooltipHideOnClick=false оставляет подсказку по клику и меняет её текст на месте', (): void => {
        jest.useFakeTimers();
        const fixture: ComponentFixture<RtIconButtonComponent> = setup({ tooltip: 'Закрепить', tooltipHideOnClick: false });
        const button: HTMLElement = control(fixture)?.nativeElement as HTMLElement;

        button.dispatchEvent(new Event('mouseenter'));
        jest.advanceTimersByTime(300);
        fixture.detectChanges();
        expect(document.querySelector('rt-tooltip')?.textContent?.trim()).toBe('Закрепить');

        button.click();
        fixture.componentRef.setInput('tooltip', 'Открепить');
        fixture.detectChanges();

        expect(document.querySelector('rt-tooltip')?.textContent?.trim()).toBe('Открепить');
        jest.useRealTimers();
    });

    it.each<[FocusOrigin, string]>([
        ['keyboard', 'cdk-keyboard-focused'],
        ['mouse', 'cdk-mouse-focused'],
    ])('SC-UKV-947 — фокус от %s помечается на кнопке классом %s', (origin: FocusOrigin, mark: string): void => {
        const fixture: ComponentFixture<RtIconButtonComponent> = setup();

        TestBed.inject(FocusMonitor).focusVia(control(fixture)?.nativeElement as HTMLElement, origin);
        fixture.detectChanges();

        expect(controlClasses(fixture)).toContain(mark);
    });

    describe('оформление', (): void => {
        it('без входов — призрачная кнопка среднего размера без шага скругления', (): void => {
            const fixture: ComponentFixture<RtIconButtonComponent> = setup();

            expect(controlClasses(fixture)).toEqual(expect.arrayContaining(['rt-icon-button--ghost', 'rt-icon-button--md']));
            expect((fixture.nativeElement as HTMLElement).hasAttribute('data-rt-radius')).toBe(false);
        });

        it.each<IRtIconButton.Variant>(['primary', 'secondary', 'ghost', 'danger', 'success', 'warning'])(
            'палитра %s выводит свой модификатор',
            (variant: IRtIconButton.Variant): void => {
                expect(controlClasses(setup({ variant }))).toContain(`rt-icon-button--${variant}`);
            }
        );

        it.each<IRtIconButton.Size>(['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'])(
            'размер %s выводит свой модификатор',
            (size: IRtIconButton.Size): void => {
                expect(controlClasses(setup({ size }))).toContain(`rt-icon-button--${size}`);
            }
        );

        it('названный шаг скругления ложится на хост', (): void => {
            expect((setup({ radius: 'full' }).nativeElement as HTMLElement).getAttribute('data-rt-radius')).toBe('full');
        });

        it('камелкейс модификатора превращается в дефис', (): void => {
            expect(controlClasses(setup({ indicator: true }))).toContain('rt-icon-button--has-indicator');
        });
    });

    describe('размер иконки', (): void => {
        it.each<[IRtIconButton.Size, string]>([
            ['2xs', 'var(--rt-icon-step-sm, var(--rt-size-4))'],
            ['xs', 'var(--rt-icon-step-sm, var(--rt-size-4))'],
            ['sm', 'var(--rt-icon-step-sm, var(--rt-size-4))'],
            ['md', 'var(--rt-icon-step-md, var(--rt-size-5))'],
            ['lg', 'var(--rt-icon-step-lg, var(--rt-size-6))'],
        ])('размер кнопки %s даёт иконку %s', (size: IRtIconButton.Size, expected: string): void => {
            expect((el(setup({ size }), 'rt-icon')?.nativeElement as HTMLElement).style.width).toBe(expected);
        });

        it.each<IRtIconButton.Size>(['2xs', 'xs'])(
            'SC-UKV-592 — шаг %s рисует кнопку со значком 16px',
            (size: IRtIconButton.Size): void => {
                const fixture: ComponentFixture<RtIconButtonComponent> = setup({ size });

                expect(controlClasses(fixture)).toContain(`rt-icon-button--${size}`);
                expect((el(fixture, 'rt-icon')?.nativeElement as HTMLElement).style.width).toBe('var(--rt-icon-step-sm, var(--rt-size-4))');
            }
        );

        it('заданный размер иконки перебивает размер кнопки', (): void => {
            // Крупная кнопка-действие: в неё целятся пальцем, а иконка во весь
            // диаметр выглядела бы тяжеловесно.
            const fixture: ComponentFixture<RtIconButtonComponent> = setup({ size: 'lg', iconSize: 'sm' });

            expect((el(fixture, 'rt-icon')?.nativeElement as HTMLElement).style.width).toBe('var(--rt-icon-step-sm, var(--rt-size-4))');
        });
    });

    describe('загрузка', (): void => {
        it('подменяет иконку кольцом и блокирует кнопку', (): void => {
            const fixture: ComponentFixture<RtIconButtonComponent> = setup({ loading: true });

            expect(el(fixture, '.rt-icon-button__spinner use')?.attributes['href']).toBe('#rt-icon-spinner');
            expect(el(fixture, '.rt-icon-button__icon')).toBeNull();
            expect((control(fixture)?.nativeElement as HTMLButtonElement).disabled).toBe(true);
        });

        it('во время загрузки клик наружу не уходит', (): void => {
            const fixture: ComponentFixture<RtIconButtonComponent> = setup({ loading: true });
            const clicks: jest.Mock = jest.fn();
            fixture.componentInstance.clicked.subscribe(clicks);

            control(fixture)?.nativeElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            fixture.detectChanges();

            expect(clicks).not.toHaveBeenCalled();
        });
    });

    describe('отключение', (): void => {
        it('отключённая кнопка не поднимает событие даже при вручную посланном клике', (): void => {
            const fixture: ComponentFixture<RtIconButtonComponent> = setup({ disabled: true });
            const clicks: jest.Mock = jest.fn();
            fixture.componentInstance.clicked.subscribe(clicks);

            control(fixture)?.nativeElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            fixture.detectChanges();

            expect(clicks).not.toHaveBeenCalled();
        });
    });

    it('клик поднимает исходный MouseEvent', (): void => {
        const fixture: ComponentFixture<RtIconButtonComponent> = setup();
        const seen: MouseEvent[] = [];
        fixture.componentInstance.clicked.subscribe((event: MouseEvent): void => {
            seen.push(event);
        });

        control(fixture)?.nativeElement.click();
        fixture.detectChanges();

        expect(seen.length).toBe(1);
        expect(seen[0]).toBeInstanceOf(MouseEvent);
    });

    describe('доступность', (): void => {
        it('подпись обязательна и уезжает в aria-label — текста у кнопки нет', (): void => {
            expect(control(setup({ ariaLabel: 'Закрыть' }))?.attributes['aria-label']).toBe('Закрыть');
        });

        it('нажатое состояние объявляется только когда оно есть', (): void => {
            expect(control(setup())?.attributes['aria-pressed']).toBeUndefined();
            expect(control(setup({ active: true }))?.attributes['aria-pressed']).toBe('true');
        });

        it('SC-UKV-805: раскрытие объявляется только у кнопки, которой его задали', (): void => {
            expect(control(setup())?.attributes['aria-expanded']).toBeUndefined();
            expect(control(setup({ expanded: false }))?.attributes['aria-expanded']).toBe('false');
            expect(control(setup({ expanded: true }))?.attributes['aria-expanded']).toBe('true');
        });

        it('вспомогательная кнопка убирается из таб-порядка отрицательным индексом', (): void => {
            expect(control(setup({ tabIndex: -1 }))?.attributes['tabindex']).toBe('-1');
        });

        it('тип кнопки задаётся входом — внутри формы нужен submit', (): void => {
            expect((control(setup({ type: 'submit' }))?.nativeElement as HTMLButtonElement).type).toBe('submit');
        });
    });

    describe('индикатор', (): void => {
        it('без входа точки нет', (): void => {
            expect(el(setup(), '.rt-icon-button__indicator')).toBeNull();
        });

        it('точка спрятана от скринридера — она дублирует то, что уже сказано словами', (): void => {
            const fixture: ComponentFixture<RtIconButtonComponent> = setup({ indicator: true });

            expect(el(fixture, '.rt-icon-button__indicator')?.attributes['aria-hidden']).toBe('true');
        });
    });

    it('SC-UKV-556 — глиф без имени кита рисуется значком по имени Material', (): void => {
        const fixture: ComponentFixture<RtIconButtonComponent> = setup({ icon: null, glyph: 'arrow_back' });
        const host: HTMLElement = fixture.nativeElement as HTMLElement;

        expect(host.querySelector('use')?.getAttribute('href')).toBe('#rt-icon-arrow-left');
    });

    describe('ссылка', (): void => {
        function setupLink(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtIconButtonComponent> {
            return createRtFixture(
                RtIconButtonComponent,
                { icon: 'ico-user', ariaLabel: 'Личные настройки', link: '/personal-settings', tooltip: 'Личные настройки', ...inputs },
                { providers: [provideRouter(LINK_ROUTES)] }
            );
        }

        it('SC-UKV-1035 — с входом link рисует ссылку с адресом маршрута и тем же блоком, что у кнопки', (): void => {
            const fixture: ComponentFixture<RtIconButtonComponent> = setupLink({ variant: 'primary', size: 'lg' });
            const link: HTMLElement = control(fixture)?.nativeElement as HTMLElement;

            expect(link.tagName).toBe('A');
            expect(link.getAttribute('href')).toBe('/personal-settings');
            expect(link.getAttribute('aria-label')).toBe('Личные настройки');
            expect(link.hasAttribute('type')).toBe(false);
            expect(controlClasses(fixture)).toEqual(
                expect.arrayContaining(['rt-icon-button', 'rt-icon-button--primary', 'rt-icon-button--lg'])
            );
            expect(tooltipOf(fixture).text()).toBe('Личные настройки');
            expect(el(fixture, 'use')?.attributes['href']).toBe('#rt-icon-ico-user');
        });

        it('SC-UKV-1035 — у ссылки кнопка спрятана и пуста, вложенное приходит в ссылку', (): void => {
            const fixture: ComponentFixture<RtIconButtonComponent> = setupLink({ icon: null });
            const host: HTMLElement = fixture.nativeElement as HTMLElement;
            const button: HTMLButtonElement | null = host.querySelector('button');

            expect(button?.hidden).toBe(true);
            expect(button?.childElementCount).toBe(0);
            expect(host.querySelector('a [qa-dataid="icon-button-content"]')).not.toBeNull();
        });

        it('SC-UKV-1035 — без входа link разметка остаётся кнопкой', (): void => {
            const button: HTMLElement = control(setup())?.nativeElement as HTMLElement;

            expect(button.tagName).toBe('BUTTON');
            expect(button.hasAttribute('href')).toBe(false);
        });

        it('SC-UKV-1035 — клик по ссылке отдаёт clicked', (): void => {
            const fixture: ComponentFixture<RtIconButtonComponent> = setupLink();
            const emitted: MouseEvent[] = [];
            fixture.componentInstance.clicked.subscribe((event: MouseEvent): number => emitted.push(event));

            (control(fixture)?.nativeElement as HTMLElement).click();

            expect(emitted).toHaveLength(1);
        });

        it('SC-UKV-1036 — у недоступной и загружающейся ссылки нет адреса, и клик не уходит наружу', (): void => {
            for (const state of [{ disabled: true }, { loading: true }]) {
                const fixture: ComponentFixture<RtIconButtonComponent> = setupLink(state);
                const link: HTMLElement = control(fixture)?.nativeElement as HTMLElement;
                const emitted: MouseEvent[] = [];
                fixture.componentInstance.clicked.subscribe((event: MouseEvent): number => emitted.push(event));
                const click: MouseEvent = new MouseEvent('click', { bubbles: true, cancelable: true });

                link.dispatchEvent(click);

                expect(link.tagName).toBe('A');
                expect(link.hasAttribute('href')).toBe(false);
                expect(link.getAttribute('aria-disabled')).toBe('true');
                expect(link.getAttribute('tabindex')).toBe('-1');
                expect(click.defaultPrevented).toBe(true);
                expect(emitted).toHaveLength(0);
            }
        });
    });

    describe('aria-haspopup', (): void => {
        it('SC-UKV-1037 — вход ariaHaspopup пишется в aria-haspopup кнопки', (): void => {
            const fixture: ComponentFixture<RtIconButtonComponent> = setup({ ariaHaspopup: 'menu', expanded: false });

            expect(control(fixture)?.attributes['aria-haspopup']).toBe('menu');
            expect(control(fixture)?.attributes['aria-expanded']).toBe('false');
        });

        it('SC-UKV-1037 — без входа атрибута нет', (): void => {
            expect(control(setup())?.attributes['aria-haspopup']).toBeFalsy();
        });
    });

    describe('focus()', (): void => {
        it('SC-UKV-1038 — фокусирует кнопку внутри', (): void => {
            const fixture: ComponentFixture<RtIconButtonComponent> = setup();

            fixture.componentInstance.focus();

            expect(document.activeElement).toBe(control(fixture)?.nativeElement);
        });

        it('SC-UKV-1038 — фокусирует ссылку внутри', (): void => {
            const fixture: ComponentFixture<RtIconButtonComponent> = createRtFixture(
                RtIconButtonComponent,
                { icon: 'ico-user', ariaLabel: 'Личные настройки', link: '/personal-settings' },
                { providers: [provideRouter(LINK_ROUTES)] }
            );

            fixture.componentInstance.focus();

            expect(document.activeElement).toBe(control(fixture)?.nativeElement);
        });
    });
});
