import { ChangeDetectionStrategy, Component, Signal, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreakpointService } from '@rt-tools/core';

import { IRtActionBar } from '../../action-bar-config.interface';
import { RtuiActionBarComponent } from './rtui-action-bar.component';

/** Двойник службы точек перелома: сценарий сам решает, планшет это или широкий экран. */
class BreakpointServiceStub {
    public readonly tablet: WritableSignal<boolean> = signal(false);

    public get isTablet(): Signal<boolean> {
        return this.tablet.asReadonly();
    }
}

@Component({
    template: '<rtui-action-bar [config]="config" (closeAction)="closed = closed + 1" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtuiActionBarComponent],
})
class HostComponent {
    public config: IRtActionBar.Config = { selected: 0, total: 0, buttons: [] };
    public closed: number = 0;
}

describe('RtuiActionBarComponent — счётчик, действия и закрытие', () => {
    function setup(config: IRtActionBar.Config): {
        fixture: ComponentFixture<HostComponent>;
        breakpoints: BreakpointServiceStub;
    } {
        const breakpoints: BreakpointServiceStub = new BreakpointServiceStub();

        TestBed.configureTestingModule({ imports: [HostComponent] });
        TestBed.overrideComponent(RtuiActionBarComponent, {
            set: { providers: [{ provide: BreakpointService, useValue: breakpoints }] },
        });

        const fixture: ComponentFixture<HostComponent> = TestBed.createComponent(HostComponent);

        fixture.componentInstance.config = config;
        fixture.detectChanges();

        return { fixture, breakpoints };
    }

    function text(fixture: ComponentFixture<HostComponent>, selector: string): string {
        return ((fixture.nativeElement as HTMLElement).querySelector(selector)?.textContent ?? '').trim();
    }

    function actions(fixture: ComponentFixture<HostComponent>): HTMLElement[] {
        return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.rtui-action-bar__action'));
    }

    it('счётчик называет выбранное и общее', () => {
        const { fixture } = setup({ selected: 3, total: 128, buttons: [] });

        expect(text(fixture, '.rtui-action-bar__counter')).toBe('Selected: 3 out of 128');
    });

    it('ноль выбранного показывается числом, а не прячется', () => {
        const { fixture } = setup({ selected: 0, total: 128, buttons: [] });

        expect(text(fixture, '.rtui-action-bar__counter')).toBe('Selected: 0 out of 128');
    });

    it('пустой набор кнопок не рисует зоны действий вовсе', () => {
        const { fixture } = setup({ selected: 1, total: 2, buttons: [] });

        expect((fixture.nativeElement as HTMLElement).querySelector('.rtui-action-bar__actions')).toBeNull();
        expect((fixture.nativeElement as HTMLElement).querySelector('.rtui-action-bar__close-button')).not.toBeNull();
    });

    it('нажатие действия зовёт его функцию и закрывает панель', () => {
        const calls: string[] = [];
        const { fixture } = setup({
            selected: 1,
            total: 2,
            buttons: [{ title: 'Скачать', action: (): void => void calls.push('Скачать') }],
        });

        actions(fixture)[0].click();
        fixture.detectChanges();

        expect(calls).toEqual(['Скачать']);
        expect(fixture.componentInstance.closed).toBe(1);
    });

    it('действие с меню кнопкой не рисуется: слой открывает узел с директивой', () => {
        const { fixture } = setup({
            selected: 1,
            total: 2,
            buttons: [{ title: 'Переместить', menu: [{ title: 'В архив' }] }],
        });

        expect(actions(fixture)[0].tagName).toBe('DIV');
    });

    it('закрытие поднимает событие', () => {
        const { fixture } = setup({ selected: 1, total: 2, buttons: [] });

        ((fixture.nativeElement as HTMLElement).querySelector('.rtui-action-bar__close-button') as HTMLElement).click();
        fixture.detectChanges();

        expect(fixture.componentInstance.closed).toBe(1);
    });

    it('на планшете у кнопки со значком остаётся один значок', () => {
        const { fixture, breakpoints } = setup({
            selected: 1,
            total: 2,
            buttons: [{ title: 'Скачать', icon: 'download' }],
        });

        expect(actions(fixture)[0].textContent).toContain('Скачать');

        breakpoints.tablet.set(true);
        fixture.detectChanges();
        expect(actions(fixture)[0].textContent).not.toContain('Скачать');
    });
});
