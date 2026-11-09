import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { createRtFixture, qa, qaAll } from '../../../../testing/rt-kit-testing';
import { toSections, IRtPageHeaderView } from '../rt-page-header.logic';
import { RtPagePhoneMenuComponent } from './rt-page-phone-menu.component';

const SECTIONS: ReadonlyArray<IRtPageHeaderView.Section> = toSections([
    { id: 'home', label: 'Главная', icon: 'home', route: '/home' },
    { id: 'alarms', label: 'Заявки', icon: 'bell', unread: true },
    { id: 'reports', label: 'Отчёты', icon: 'chart-bar', disabled: true },
    {
        id: 'money',
        label: 'Финансы',
        icon: 'folder',
        columns: [
            {
                id: 'c',
                groups: [
                    { id: 'g1', label: 'Счета', items: [{ id: 'all', label: 'Все счета', route: '/all' }] },
                    { id: 'g2', items: [{ id: 'pay', label: 'Оплаты' }] },
                ],
            },
        ],
    },
]);

function setup(activeIds: ReadonlySet<string> = new Set<string>()): ComponentFixture<RtPagePhoneMenuComponent> {
    return createRtFixture(RtPagePhoneMenuComponent, { sections: SECTIONS, activeIds }, { providers: [provideRouter([])] });
}

function rows(fixture: ComponentFixture<RtPagePhoneMenuComponent>): HTMLElement[] {
    return qaAll(fixture, 'phone-menu-row').map((node: DebugElement): HTMLElement => node.nativeElement as HTMLElement);
}

function rowOf(fixture: ComponentFixture<RtPagePhoneMenuComponent>, id: string): HTMLElement {
    return rows(fixture).find((row: HTMLElement): boolean => row.dataset['id'] === id) as HTMLElement;
}

function press(fixture: ComponentFixture<RtPagePhoneMenuComponent>, row: HTMLElement): void {
    row.click();
    fixture.detectChanges();
}

describe('RtPagePhoneMenuComponent', (): void => {
    it('SC-UKV-1202 — the column lists every section in order and holds no logo', (): void => {
        const fixture: ComponentFixture<RtPagePhoneMenuComponent> = setup();

        expect(rows(fixture).map((row: HTMLElement): string | undefined => row.dataset['id'])).toEqual([
            'home',
            'alarms',
            'reports',
            'money',
        ]);
        expect((fixture.nativeElement as HTMLElement).querySelector('[rtRailLogo], img')).toBeNull();
    });

    it('SC-UKV-1203 — a section with a panel opens its items in place, and «Back» returns to the sections', (): void => {
        const fixture: ComponentFixture<RtPagePhoneMenuComponent> = setup();

        press(fixture, rowOf(fixture, 'money'));

        expect(rows(fixture).map((row: HTMLElement): string | undefined => row.dataset['id'])).toEqual(['all', 'pay']);
        expect(qaAll(fixture, 'phone-menu-group')).toHaveLength(1);

        press(fixture, (qa(fixture, 'phone-menu-back') as DebugElement).nativeElement as HTMLElement);

        expect(rows(fixture)).toHaveLength(4);
    });

    it('SC-UKV-1204 — choosing an item closes the column', (): void => {
        const fixture: ComponentFixture<RtPagePhoneMenuComponent> = setup();
        const closed: jest.Mock = jest.fn();
        const clicked: jest.Mock = jest.fn();
        fixture.componentInstance.closed.subscribe(closed);
        fixture.componentInstance.itemClick.subscribe(clicked);

        press(fixture, rowOf(fixture, 'alarms'));

        expect(clicked).toHaveBeenCalledWith('alarms');
        expect(closed).toHaveBeenCalledTimes(1);
    });

    it('SC-UKV-1204 — a disabled item neither reports nor closes', (): void => {
        const fixture: ComponentFixture<RtPagePhoneMenuComponent> = setup();
        const closed: jest.Mock = jest.fn();
        fixture.componentInstance.closed.subscribe(closed);

        press(fixture, rowOf(fixture, 'reports'));

        expect(closed).not.toHaveBeenCalled();
    });

    it('SC-UKV-1202 — a section with an active item is marked, and an unread one carries the dot', (): void => {
        const fixture: ComponentFixture<RtPagePhoneMenuComponent> = setup(new Set<string>(['money']));

        expect(rowOf(fixture, 'money').classList).toContain('rt-page-phone-menu__row--active');
        expect(qaAll(fixture, 'phone-menu-marker')).toHaveLength(1);
    });
});
