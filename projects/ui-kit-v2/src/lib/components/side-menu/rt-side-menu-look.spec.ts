import { signal, DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { LOCAL_STORAGE } from '@rt-tools/core';

import { BreakpointsService } from '../../platform';
import { createRtFixture, qa, qaAll } from '../../../testing/rt-kit-testing';
import { RtIconComponent } from '../icon/rt-icon.component';
import { RtInputComponent } from '../input/rt-input.component';
import { RtTooltipDirective } from '../tooltip/rt-tooltip.directive';
import { provideRtSideMenuSettings } from './rt-side-menu-settings.service';
import { RtSideMenuComponent } from './rt-side-menu.component';
import { IRtSideMenu } from './rt-side-menu.model';

const ITEMS: IRtSideMenu.Item[] = [
    { id: 'home', icon: 'users', name: 'Главная', link: '/home' },
    {
        id: 'reports',
        icon: 'chart-bar',
        name: 'Отчёты',
        submenu: [
            { id: 'reports:section-root', name: 'Все отчёты', link: '/reports' },
            { id: 'finance', name: 'Финансы', submenu: [{ id: 'revenue', name: 'Выручка', link: '/reports/revenue' }] },
        ],
    },
];

function menu(inputs: Readonly<Record<string, unknown>> = {}, narrow: boolean = false): ComponentFixture<RtSideMenuComponent> {
    return createRtFixture(
        RtSideMenuComponent,
        { menuItems: ITEMS, activeMenuIds: [], ...inputs },
        {
            providers: [
                provideRouter([{ path: '**', children: [] }]),
                provideRtSideMenuSettings(),
                { provide: LOCAL_STORAGE, useValue: window.localStorage },
                { provide: BreakpointsService, useValue: { narrow: signal(narrow) } },
            ] as never[],
        }
    );
}

function rail<T>(fixture: ComponentFixture<T>): HTMLElement[] {
    return qaAll(fixture, 'side-menu-item').map((node: DebugElement): HTMLElement => node.nativeElement as HTMLElement);
}

function hoverReports<T>(fixture: ComponentFixture<T>): void {
    rail(fixture)[1].dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
}

/** Подсказки пунктов полосы: текст и сторона. */
function railTooltips<T>(fixture: ComponentFixture<T>): Array<{ text: string; placement: string | null }> {
    return fixture.debugElement
        .queryAll(By.directive(RtTooltipDirective))
        .filter((node: DebugElement): boolean => (node.nativeElement as HTMLElement).classList.contains('rt-side-menu__rail-item'))
        .map((node: DebugElement): { text: string; placement: string | null } => {
            const tooltip: RtTooltipDirective = node.injector.get(RtTooltipDirective);
            return { text: tooltip.text(), placement: tooltip.placement() };
        });
}

function searchInput<T>(fixture: ComponentFixture<T>): RtInputComponent {
    return (qa(fixture, 'side-menu-search') as DebugElement).injector.get(RtInputComponent);
}

describe('Вид бокового меню', (): void => {
    afterEach((): void => {
        window.localStorage.clear();
    });

    it('SC-UKV-817 — по умолчанию подписи под значками полосы стоят, а подсказок у пунктов нет', (): void => {
        const fixture: ComponentFixture<RtSideMenuComponent> = menu();

        expect(fixture.nativeElement.querySelectorAll('.rt-side-menu__rail-title').length).toBe(2);
        expect(railTooltips(fixture).map((tip: { text: string }): string => tip.text)).toEqual(['', '']);
        expect(rail(fixture).map((item: HTMLElement): string | null => item.getAttribute('aria-label'))).toEqual([null, null]);
    });

    it('SC-UKV-817 — без подписей имя пункта уходит в подсказку справа и в доступное имя', (): void => {
        const fixture: ComponentFixture<RtSideMenuComponent> = menu({ railTitlesShown: false });

        expect(fixture.nativeElement.querySelector('.rt-side-menu__rail-title')).toBeNull();
        expect(railTooltips(fixture)).toEqual([
            { text: 'Главная', placement: 'right' },
            { text: 'Отчёты', placement: 'right' },
        ]);
        expect(rail(fixture).map((item: HTMLElement): string | null => item.getAttribute('aria-label'))).toEqual(['Главная', 'Отчёты']);
    });

    it('SC-UKV-817 — без подписей и без подсказок подменю подсказки пункта нет, а доступное имя остаётся', (): void => {
        const fixture: ComponentFixture<RtSideMenuComponent> = menu({ railTitlesShown: false, subMenuTooltipsShown: false });

        expect(railTooltips(fixture).map((tip: { text: string }): string => tip.text)).toEqual(['', '']);
        expect(rail(fixture)[0].getAttribute('aria-label')).toBe('Главная');
    });

    it('SC-UKV-818 — значки полосы залиты только по входу', (): void => {
        const fills: (fixture: ComponentFixture<RtSideMenuComponent>) => boolean[] = (
            fixture: ComponentFixture<RtSideMenuComponent>
        ): boolean[] =>
            fixture.debugElement
                .queryAll(By.css('.rt-side-menu__rail-icon rt-icon'))
                .map((node: DebugElement): boolean => node.injector.get(RtIconComponent).fill());

        expect(fills(menu())).toEqual([false, false]);
        expect(fills(menu({ railIconFill: true }))).toEqual([true, true]);
    });

    it('SC-UKV-783 — поле поиска панели берёт размер и вид из входов, по умолчанию sm и outline', (): void => {
        const plain: ComponentFixture<RtSideMenuComponent> = menu();
        hoverReports(plain);
        expect(searchInput(plain).size()).toBe('sm');
        expect(searchInput(plain).appearance()).toBe('outline');

        const tuned: ComponentFixture<RtSideMenuComponent> = menu({ searchSize: 'md', searchAppearance: 'pill' });
        hoverReports(tuned);
        expect(searchInput(tuned).size()).toBe('md');
        expect(searchInput(tuned).appearance()).toBe('pill');
    });

    it('SC-UKV-783 — поле поиска узкого экрана берёт те же входы', (): void => {
        const fixture: ComponentFixture<RtSideMenuComponent> = menu({ searchSize: 'md', searchAppearance: 'fill' }, true);
        rail(fixture)[1].click();
        fixture.detectChanges();

        expect(searchInput(fixture).size()).toBe('md');
        expect(searchInput(fixture).appearance()).toBe('fill');
    });

    it('SC-UKV-784 — строка и папка подменю несут номер пункта', (): void => {
        const fixture: ComponentFixture<RtSideMenuComponent> = menu();
        hoverReports(fixture);

        const row: HTMLElement = (qa(fixture, 'side-menu-sub-item') as DebugElement).nativeElement as HTMLElement;
        const folder: HTMLElement | null = (fixture.nativeElement as HTMLElement).querySelector('.rt-side-menu-sub-item__folder');

        expect(row.getAttribute('data-item-id')).toBe('reports:section-root');
        expect(folder?.getAttribute('data-item-id')).toBe('finance');
        expect((fixture.nativeElement as HTMLElement).querySelector('rt-side-menu-sub-item > [data-item-id$=":section-root"]')).toBe(row);
    });
});
