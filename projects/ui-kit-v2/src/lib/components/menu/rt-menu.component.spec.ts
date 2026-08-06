import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, el, hostClasses } from '../../../testing/rt-kit-testing';
import { IRtMenu } from './rt-menu.model';
import { RtMenuItemComponent } from './rt-menu-item.component';
import { RtMenuComponent } from './rt-menu.component';

/** Панель меню живёт в оверлее CDK — ищем её в документе. */
function panel(): HTMLElement | null {
    return document.querySelector('[qa-dataid="menu-panel"]');
}

function items(): HTMLElement[] {
    return Array.from(document.querySelectorAll('rt-menu-item'));
}

@Component({
    selector: 'rt-menu-host',
    template: `
        <rt-menu [ariaLabel]="ariaLabel()" [align]="align()" [disabled]="disabled()">
            <rt-menu-item label="Открыть" icon="ico-eye" (selected)="picked = picked + 1" />
            <rt-menu-item label="Удалить" icon="ico-trash" [danger]="true" [disabled]="itemDisabled()" (selected)="removed = removed + 1" />
        </rt-menu>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtMenuComponent, RtMenuItemComponent],
})
class MenuHostComponent {
    public readonly ariaLabel: WritableSignal<string> = signal<string>('');
    public readonly align: WritableSignal<IRtMenu.Align> = signal<IRtMenu.Align>('end');
    public readonly disabled: WritableSignal<boolean> = signal<boolean>(false);
    public readonly itemDisabled: WritableSignal<boolean> = signal<boolean>(false);
    public picked: number = 0;
    public removed: number = 0;
}

function setup(): ComponentFixture<MenuHostComponent> {
    return createRtFixture(MenuHostComponent);
}

function openMenu(fixture: ComponentFixture<MenuHostComponent>): void {
    el(fixture, '[qa-dataid="menu-trigger"] [qa-dataid="icon-button-control"]')?.nativeElement.click();
    fixture.detectChanges();
}

describe('RtMenuComponent', (): void => {
    it('до клика панели нет', (): void => {
        setup();

        expect(panel()).toBeNull();
    });

    it('клик по кнопке открывает панель с пунктами', (): void => {
        const fixture: ComponentFixture<MenuHostComponent> = setup();

        openMenu(fixture);

        expect(panel()).not.toBeNull();
        expect(items().length).toBe(2);
    });

    it('повторный клик закрывает', (): void => {
        const fixture: ComponentFixture<MenuHostComponent> = setup();

        openMenu(fixture);
        openMenu(fixture);

        expect(panel()).toBeNull();
    });

    it('открытое меню помечает host модификатором', (): void => {
        const fixture: ComponentFixture<MenuHostComponent> = setup();

        openMenu(fixture);

        expect(hostClasses(fixture).length >= 0).toBe(true);
        expect(Array.from((el(fixture, 'rt-menu')?.nativeElement as HTMLElement).classList)).toContain('rt-menu--open');
    });

    it('панель объявлена меню для скринридера', (): void => {
        const fixture: ComponentFixture<MenuHostComponent> = setup();

        openMenu(fixture);

        expect(panel()?.getAttribute('role')).toBe('menu');
    });

    describe('подпись кнопки', (): void => {
        it('без входа берётся из словаря кита', (): void => {
            const fixture: ComponentFixture<MenuHostComponent> = setup();

            expect(el(fixture, '[qa-dataid="menu-trigger"] [qa-dataid="icon-button-control"]')?.attributes['aria-label']).toBe('Actions');
        });

        it('своя подпись перебивает умолчание', (): void => {
            const fixture: ComponentFixture<MenuHostComponent> = setup();

            fixture.componentInstance.ariaLabel.set('Действия со строкой');
            fixture.detectChanges();

            expect(el(fixture, '[qa-dataid="menu-trigger"] [qa-dataid="icon-button-control"]')?.attributes['aria-label']).toBe(
                'Действия со строкой'
            );
        });
    });

    describe('отключение', (): void => {
        it('отключённое меню не открывается', (): void => {
            const fixture: ComponentFixture<MenuHostComponent> = createRtFixture(MenuHostComponent, {}, { skipInitialDetect: true });
            fixture.componentInstance.disabled.set(true);
            fixture.detectChanges();

            openMenu(fixture);

            expect(panel()).toBeNull();
        });
    });

    describe('выбор пункта', (): void => {
        it('поднимает событие пункта', (): void => {
            const fixture: ComponentFixture<MenuHostComponent> = setup();
            openMenu(fixture);

            items()[0].click();
            fixture.detectChanges();

            expect(fixture.componentInstance.picked).toBe(1);
        });

        it('закрывает меню — событие всплывает от пункта к панели', (): void => {
            // Пункт не знает о меню: он бросает всплывающее событие, а панель
            // закрывается, поймав его. Так пункт остаётся самостоятельным.
            const fixture: ComponentFixture<MenuHostComponent> = setup();
            openMenu(fixture);

            items()[0].click();
            fixture.detectChanges();

            expect(panel()).toBeNull();
        });

        it('Enter на пункте работает как клик', (): void => {
            const fixture: ComponentFixture<MenuHostComponent> = setup();
            openMenu(fixture);

            items()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            fixture.detectChanges();

            expect(fixture.componentInstance.picked).toBe(1);
        });

        it('отключённый пункт не выбирается и меню не закрывает', (): void => {
            const fixture: ComponentFixture<MenuHostComponent> = createRtFixture(MenuHostComponent, {}, { skipInitialDetect: true });
            fixture.componentInstance.itemDisabled.set(true);
            fixture.detectChanges();
            openMenu(fixture);

            items()[1].click();
            fixture.detectChanges();

            expect(fixture.componentInstance.removed).toBe(0);
            expect(panel()).not.toBeNull();
        });
    });

    describe('закрытие', (): void => {
        it('Escape закрывает меню', (): void => {
            const fixture: ComponentFixture<MenuHostComponent> = setup();
            openMenu(fixture);

            panel()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            fixture.detectChanges();

            expect(panel()).toBeNull();
        });
    });
});

describe('RtMenuItemComponent', (): void => {
    function setupItem(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtMenuItemComponent> {
        return createRtFixture(RtMenuItemComponent, inputs);
    }

    it('объявлен пунктом меню и доступен с клавиатуры', (): void => {
        const host: HTMLElement = setupItem({ label: 'Открыть' }).nativeElement as HTMLElement;

        expect(host.getAttribute('role')).toBe('menuitem');
        expect(host.getAttribute('tabindex')).toBe('0');
    });

    it('отключённый пункт выпадает из таб-порядка и помечается для скринридера', (): void => {
        const host: HTMLElement = setupItem({ label: 'Удалить', disabled: true }).nativeElement as HTMLElement;

        expect(host.getAttribute('tabindex')).toBeNull();
        expect(host.getAttribute('aria-disabled')).toBe('true');
    });

    it('опасное действие помечается модификатором', (): void => {
        expect(hostClasses(setupItem({ label: 'Удалить', danger: true }))).toContain('rt-menu-item--danger');
    });

    it('иконка рисуется слева от подписи, когда задана', (): void => {
        const fixture: ComponentFixture<RtMenuItemComponent> = setupItem({ label: 'Открыть', icon: 'ico-eye' });

        expect(el(fixture, '.rt-menu-item__icon use')?.attributes['href']).toBe('#rt-icon-ico-eye');
    });

    it('без иконки рисуется одна подпись', (): void => {
        const fixture: ComponentFixture<RtMenuItemComponent> = setupItem({ label: 'Открыть' });

        expect(el(fixture, '.rt-menu-item__icon')).toBeNull();
    });

    it('пункт с вопросом подтверждения открывает диалог, а не выбирается сразу', (): void => {
        const fixture: ComponentFixture<RtMenuItemComponent> = setupItem({
            label: 'Удалить',
            confirmMessage: 'Удалить запись?',
        });
        const picks: jest.Mock = jest.fn();
        fixture.componentInstance.selected.subscribe(picks);

        (fixture.nativeElement as HTMLElement).click();
        fixture.detectChanges();

        expect(picks).not.toHaveBeenCalled();
        expect(document.querySelector('rt-menu-confirm-dialog')).not.toBeNull();
    });
});
