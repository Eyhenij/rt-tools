import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BreakpointsService } from '../../platform';
import { RtSideMenuComponent } from './rt-side-menu.component';
import { RtSideMenuIconDirective } from './rt-side-menu.directives';
import { IRtSideMenu } from './rt-side-menu.model';

class StubBreakpointsService {
    public readonly narrow: WritableSignal<boolean> = signal(false);
}

const ITEMS: IRtSideMenu.Item[] = [
    { id: 'settings', icon: 'settings', name: 'Настройки', link: '/settings' },
    {
        id: 'launches',
        icon: 'rocket_launch',
        name: 'Запуски',
        submenu: [{ id: 'list', icon: 'rocket_launch', name: 'Список', link: '/launches/list' }],
    },
];

@Component({
    selector: 'rt-side-menu-icon-test-host',
    template: `
        <rt-side-menu [menuItems]="items" [activeMenuIds]="[]">
            @if (withOwn()) {
                <ng-template rtSideMenuIcon let-item>
                    <i class="own" [attr.data-icon]="item.icon"></i>
                </ng-template>
            }
        </rt-side-menu>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtSideMenuComponent, RtSideMenuIconDirective],
})
class RtSideMenuIconTestHostComponent {
    public readonly items: IRtSideMenu.Item[] = ITEMS;
    public readonly withOwn: WritableSignal<boolean> = signal(true);
}

function setup(withOwn: boolean): ComponentFixture<RtSideMenuIconTestHostComponent> {
    TestBed.configureTestingModule({
        providers: [provideRouter([{ path: '**', children: [] }]), { provide: BreakpointsService, useClass: StubBreakpointsService }],
    });
    const fixture: ComponentFixture<RtSideMenuIconTestHostComponent> = TestBed.createComponent(RtSideMenuIconTestHostComponent);
    fixture.componentInstance.withOwn.set(withOwn);
    fixture.detectChanges();

    return fixture;
}

function root(fixture: ComponentFixture<RtSideMenuIconTestHostComponent>): HTMLElement {
    return fixture.nativeElement as HTMLElement;
}

describe('RtSideMenuComponent — значки вне набора', (): void => {
    let warn: jest.SpyInstance;

    beforeEach((): void => {
        warn = jest.spyOn(console, 'warn').mockImplementation((): void => undefined);
    });

    afterEach((): void => {
        warn.mockRestore();
    });

    it('SC-UKV-531 — имя Material с парой рисуется значком кита, а не пустым местом', (): void => {
        const fixture: ComponentFixture<RtSideMenuIconTestHostComponent> = setup(true);
        const icons: HTMLElement[] = [...root(fixture).querySelectorAll<HTMLElement>('.rt-side-menu__rail-icon rt-icon')];

        expect(icons).toHaveLength(1);
        expect(root(fixture).querySelector('.rt-side-menu__rail-icon use')?.getAttribute('href')).toContain('cog');
    });

    it('SC-UKV-532 — имя, которого кит не рисует, берёт свой шаблон меню и получает пункт', (): void => {
        const fixture: ComponentFixture<RtSideMenuIconTestHostComponent> = setup(true);
        const own: HTMLElement[] = [...root(fixture).querySelectorAll<HTMLElement>('[qa-dataid="side-menu-own-icon"]')];

        expect(own).toHaveLength(1);
        expect(own[0].querySelector('.own')?.getAttribute('data-icon')).toBe('rocket_launch');
        expect(own[0].getAttribute('aria-hidden')).toBe('true');
    });

    it('SC-UKV-532 — свой шаблон не перебивает значок, который кит рисует сам', (): void => {
        const fixture: ComponentFixture<RtSideMenuIconTestHostComponent> = setup(true);

        expect(root(fixture).querySelectorAll('.own[data-icon="settings"]')).toHaveLength(0);
    });

    it('SC-UKV-533 — без своего шаблона меню предупреждает разработчика об имени без значка', (): void => {
        const fixture: ComponentFixture<RtSideMenuIconTestHostComponent> = setup(false);

        expect(root(fixture).querySelector('[qa-dataid="side-menu-own-icon"]')).toBeNull();
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('«rocket_launch»'));
    });

    it('SC-UKV-533 — со своим шаблоном меню о пунктах не предупреждает', (): void => {
        setup(true);

        expect(warn).not.toHaveBeenCalled();
    });
});
