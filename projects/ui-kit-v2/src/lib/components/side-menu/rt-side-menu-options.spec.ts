import { signal, ChangeDetectionStrategy, Component, DebugElement, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { LOCAL_STORAGE } from '@rt-tools/core';

import { BreakpointsService } from '../../platform';
import { createRtFixture, qa, qaAll } from '../../../testing/rt-kit-testing';
import { RtIconButtonComponent } from '../icon-button/rt-icon-button.component';
import { RtTooltipDirective } from '../tooltip/rt-tooltip.directive';
import { provideRtSideMenuSettings, RtSideMenuSettingsService } from './rt-side-menu-settings.service';
import { RtSideMenuComponent } from './rt-side-menu.component';
import { RtSideMenuIconDirective } from './rt-side-menu.directives';
import { IRtSideMenu } from './rt-side-menu.model';

class StubBreakpointsService {
    public readonly narrow: WritableSignal<boolean> = signal(false);
}

const ITEMS: IRtSideMenu.Item[] = [
    { id: 'home', icon: 'users', name: 'Главная', link: '/home' },
    {
        id: 'reports',
        icon: 'chart-bar',
        name: 'Отчёты',
        submenu: [
            { id: 'sales', name: 'Продажи', link: '/reports/sales' },
            { id: 'finance', name: 'Финансы', submenu: [{ id: 'revenue', name: 'Выручка', link: '/reports/revenue' }] },
            { id: 'scan', name: 'Сканер', link: '/reports/scan', iconButton: { icon: 'qr_code_scanner', data: 'scan' } },
            { id: 'stock', name: 'Склад', link: '/reports/stock', iconButton: { icon: 'ico-plus', data: 'new-stock' } },
        ],
    },
];

const PROVIDERS: unknown[] = [
    provideRouter([{ path: '**', children: [] }]),
    provideRtSideMenuSettings(),
    { provide: LOCAL_STORAGE, useValue: window.localStorage },
    { provide: BreakpointsService, useClass: StubBreakpointsService },
];

function menu(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtSideMenuComponent> {
    return createRtFixture(RtSideMenuComponent, { menuItems: ITEMS, activeMenuIds: [], ...inputs }, { providers: PROVIDERS as never[] });
}

function hoverReports<T>(fixture: ComponentFixture<T>): void {
    (qaAll(fixture, 'side-menu-item')[1].nativeElement as HTMLElement).dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
}

/** Тексты подсказок строк подменю: у подписей и у кнопок строк. */
function rowTooltips<T>(fixture: ComponentFixture<T>): string[] {
    return fixture.debugElement
        .queryAll(By.directive(RtTooltipDirective))
        .filter((node: DebugElement): boolean => (node.nativeElement as HTMLElement).closest('.rt-side-menu-sub-item') !== null)
        .map((node: DebugElement): string => node.injector.get(RtTooltipDirective).text());
}

@Component({
    selector: 'rt-side-menu-own-button-host',
    template: `
        <rt-side-menu menuId="own-button" subMenuMode="pinned" [menuItems]="items" [activeMenuIds]="['reports', 'sales']">
            <ng-template rtSideMenuIcon let-icon="icon" let-slot="slot">
                <i class="own" [attr.data-icon]="icon" [attr.data-slot]="slot"></i>
            </ng-template>
        </rt-side-menu>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtSideMenuComponent, RtSideMenuIconDirective],
})
class OwnButtonHostComponent {
    public readonly items: IRtSideMenu.Item[] = ITEMS;
}

describe('Переключатели бокового меню', (): void => {
    afterEach((): void => {
        window.localStorage.clear();
    });

    it('SC-UKV-620 — без кнопки закрепления шапка подменю её не рисует', (): void => {
        const shown: ComponentFixture<RtSideMenuComponent> = menu();
        hoverReports(shown);
        expect(qa(shown, 'side-menu-pin')).not.toBeNull();

        const hidden: ComponentFixture<RtSideMenuComponent> = menu({ pinShown: false });
        hoverReports(hidden);

        expect(qa(hidden, 'side-menu-panel')).not.toBeNull();
        expect(qa(hidden, 'side-menu-pin')).toBeNull();
    });

    it('SC-UKV-620 — без кнопки закрепления сохранённое закрепление не читается, а режим входа — да', (): void => {
        const stored: ComponentFixture<RtSideMenuComponent> = menu({ menuId: 'main', activeMenuIds: ['reports', 'sales'] });
        stored.debugElement.injector.get(RtSideMenuSettingsService).setSubMenuMode('main', 'pinned');
        stored.detectChanges();
        expect(qa(stored, 'side-menu-panel')).not.toBeNull();

        const unpinnable: ComponentFixture<RtSideMenuComponent> = menu({
            menuId: 'main',
            activeMenuIds: ['reports', 'sales'],
            pinShown: false,
        });
        expect(qa(unpinnable, 'side-menu-panel')).toBeNull();

        const bound: ComponentFixture<RtSideMenuComponent> = menu({
            menuId: 'main',
            activeMenuIds: ['reports', 'sales'],
            pinShown: false,
            subMenuMode: 'pinned',
        });
        expect(qa(bound, 'side-menu-panel')).not.toBeNull();
    });

    it('SC-UKV-621 — без подсказок подменю строки их не показывают, а имена кнопок остаются', (): void => {
        const shown: ComponentFixture<RtSideMenuComponent> = menu();
        hoverReports(shown);
        expect(rowTooltips(shown)).toContain('Продажи');

        const hidden: ComponentFixture<RtSideMenuComponent> = menu({ subMenuTooltipsShown: false });
        hoverReports(hidden);

        expect(qaAll(hidden, 'side-menu-sub-item').length).toBeGreaterThan(0);
        expect(rowTooltips(hidden).every((text: string): boolean => text === '')).toBe(true);
        expect(qa(hidden, 'side-menu-sub-item-action')?.injector.get(RtIconButtonComponent).ariaLabel()).toBe('Сканер');
    });

    it('SC-UKV-622 — кнопка строки без значка кита берёт свой шаблон меню с именем кнопки', (): void => {
        TestBed.configureTestingModule({ providers: PROVIDERS as never[] });
        const fixture: ComponentFixture<OwnButtonHostComponent> = TestBed.createComponent(OwnButtonHostComponent);
        fixture.detectChanges();
        const actions: DebugElement[] = qaAll(fixture, 'side-menu-sub-item-action');
        const own: HTMLElement | null = (actions[0].nativeElement as HTMLElement).querySelector('.own');

        expect(actions).toHaveLength(2);
        expect(own?.getAttribute('data-icon')).toBe('qr_code_scanner');
        expect(own?.getAttribute('data-slot')).toBe('iconButton');
        // Кнопка со значком кита шаблон не берёт.
        expect((actions[1].nativeElement as HTMLElement).querySelector('.own')).toBeNull();
        expect((actions[1].nativeElement as HTMLElement).querySelector('rt-icon')).not.toBeNull();
    });

    it('SC-UKV-622 — без своего шаблона кнопка строки с именем вне кита пуста и значка не просит', (): void => {
        const fixture: ComponentFixture<RtSideMenuComponent> = menu({ subMenuMode: 'pinned', activeMenuIds: ['reports', 'sales'] });
        const scan: HTMLElement = qaAll(fixture, 'side-menu-sub-item-action')[0].nativeElement as HTMLElement;

        expect(scan.querySelector('rt-icon')).toBeNull();
        expect(scan.querySelector('[qa-dataid="side-menu-own-button-icon"]')).toBeNull();
    });
});

@Component({
    selector: 'rt-icon-button-content-host',
    template: `
        <rt-icon-button ariaLabel="Свой рисунок" [icon]="null"><i class="own-picture"></i></rt-icon-button>
        <rt-icon-button ariaLabel="Значок кита" icon="ico-plus"><i class="ignored"></i></rt-icon-button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtIconButtonComponent],
})
class IconButtonContentHostComponent {}

describe('Содержимое кнопки-иконки', (): void => {
    it('SC-UKV-623 — кнопка без имени значка показывает вложенное, со значком — значок', (): void => {
        TestBed.configureTestingModule({ providers: PROVIDERS as never[] });
        const fixture: ComponentFixture<IconButtonContentHostComponent> = TestBed.createComponent(IconButtonContentHostComponent);
        fixture.detectChanges();
        const buttons: HTMLElement[] = qaAll(fixture, 'icon-button-control').map(
            (node: DebugElement): HTMLElement => node.nativeElement as HTMLElement
        );
        const own: HTMLElement = buttons[0];
        const kit: HTMLElement = buttons[1];

        expect(own.querySelector('[qa-dataid="icon-button-content"] .own-picture')).not.toBeNull();
        expect(own.querySelector('rt-icon')).toBeNull();
        expect(kit.querySelector('rt-icon')).not.toBeNull();
        expect(kit.querySelector('.ignored')).toBeNull();
    });
});
