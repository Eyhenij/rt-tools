import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { WINDOW } from '@rt-tools/core';

import { createRtFixture, IRtFixtureOptions, qa } from '../../../testing/rt-kit-testing';
import {
    RtCompactCenterDirective,
    RtCompactLeftDirective,
    RtCompactRightDirective,
    RtPageHeaderBellDirective,
    RtRailLogoDirective,
    RtRailPageDirective,
} from './rt-page-header.component';
import { RtPageHeaderComponent } from './rt-page-header.component';
import { IRtPageHeader } from './rt-page-header.model';

const ITEMS: ReadonlyArray<IRtPageHeader.Item> = [{ id: 'tours', label: 'Туры', route: '/tours', icon: 'book' }];

/** Наблюдатели пересечения и размера: в jsdom их нет, шапке хватает пустых. */
class ObserverDouble {
    public observe(): void {}

    public disconnect(): void {}
}

function windowDouble(): Window & typeof globalThis {
    return {
        IntersectionObserver: ObserverDouble,
        ResizeObserver: ObserverDouble,
        getComputedStyle: (): Partial<CSSStyleDeclaration> => ({ columnGap: '4px' }),
    } as unknown as Window & typeof globalThis;
}

const PROVIDERS: IRtFixtureOptions = { providers: [provideRouter([]), { provide: WINDOW, useFactory: windowDouble }] };

/** Шапка со всеми слотами-шаблонами; вид переключается владельцем на живой странице. */
@Component({
    selector: 'rt-page-header-slots-host',
    template: `
        <rt-page-header [items]="items" [user]="user" [layout]="layout()">
            <ng-template rtRailLogo><span qa-dataid="slot-rail-logo">Лого</span></ng-template>
            <ng-template rtRailPage><span qa-dataid="slot-rail-page">Страница</span></ng-template>
            <ng-template rtCompactLeft><span qa-dataid="slot-compact-left">Слева</span></ng-template>
            <ng-template rtCompactCenter><span qa-dataid="slot-compact-center">Середина</span></ng-template>
            <ng-template rtCompactRight><span qa-dataid="slot-compact-right">Справа</span></ng-template>
            <ng-template rtHeaderBell><button type="button" qa-dataid="slot-assistant">Помощник</button></ng-template>
            <ng-template rtHeaderBell><button type="button" qa-dataid="slot-bell">Уведомления</button></ng-template>
        </rt-page-header>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RtPageHeaderComponent,
        RtRailLogoDirective,
        RtRailPageDirective,
        RtCompactLeftDirective,
        RtCompactCenterDirective,
        RtCompactRightDirective,
        RtPageHeaderBellDirective,
    ],
})
class SlotsHostComponent {
    public readonly items: ReadonlyArray<IRtPageHeader.Item> = ITEMS;
    public readonly user: IRtPageHeader.User = { name: 'Иванов И.' };
    public readonly layout: WritableSignal<IRtPageHeader.Layout> = signal<IRtPageHeader.Layout>('horizontal');
}

function setup(layout: IRtPageHeader.Layout): ComponentFixture<SlotsHostComponent> {
    const fixture: ComponentFixture<SlotsHostComponent> = createRtFixture(SlotsHostComponent, {}, PROVIDERS);
    fixture.componentInstance.layout.set(layout);
    fixture.detectChanges();
    return fixture;
}

describe('RtPageHeaderComponent — слоты-шаблоны', (): void => {
    it('SC-UKV-1714 — горизонтальная шапка не строит шаблонов рейла', (): void => {
        const fixture: ComponentFixture<SlotsHostComponent> = setup('horizontal');

        expect(qa(fixture, 'slot-rail-logo')).toBeNull();
        expect(qa(fixture, 'slot-rail-page')).toBeNull();
        expect(qa(fixture, 'slot-compact-left')).not.toBeNull();
    });

    it('SC-UKV-1715 — вертикальная шапка рисует логотип наверху рейла и страницу на месте страницы', (): void => {
        const fixture: ComponentFixture<SlotsHostComponent> = setup('vertical');
        const logo: HTMLElement = qa(fixture, 'slot-rail-logo')?.nativeElement as HTMLElement;
        const page: HTMLElement = qa(fixture, 'slot-rail-page')?.nativeElement as HTMLElement;

        expect(logo.closest('.rt-page-rail__logo')).not.toBeNull();
        expect(page.closest('.rt-page-rail__page')).not.toBeNull();
    });

    it('SC-UKV-1716 — вертикальная шапка не строит компактных шаблонов и кнопок у края', (): void => {
        const fixture: ComponentFixture<SlotsHostComponent> = setup('vertical');

        for (const id of ['slot-compact-left', 'slot-compact-center', 'slot-compact-right', 'slot-assistant', 'slot-bell']) {
            expect(qa(fixture, id)).toBeNull();
        }
    });

    it('SC-UKV-1717 — два шаблона кнопок встают у края в порядке записи, профиль последним', (): void => {
        const fixture: ComponentFixture<SlotsHostComponent> = setup('horizontal');
        const end: HTMLElement = qa(fixture, 'header-end')?.nativeElement as HTMLElement;

        expect(Array.from(end.children).map((node: Element): string => node.getAttribute('qa-dataid') ?? node.tagName)).toEqual([
            'slot-assistant',
            'slot-bell',
            'RT-PAGE-HEADER-USER',
        ]);
    });

    it('SC-UKV-1736 — переход в вертикальный вид на живой странице убирает кнопки у края', (): void => {
        const fixture: ComponentFixture<SlotsHostComponent> = setup('horizontal');
        const bell: HTMLElement = qa(fixture, 'slot-bell')?.nativeElement as HTMLElement;
        expect(bell.isConnected).toBe(true);

        fixture.componentInstance.layout.set('vertical');
        fixture.detectChanges();

        expect(bell.isConnected).toBe(false);
        expect(qa(fixture, 'slot-bell')).toBeNull();
        expect(qa(fixture, 'slot-rail-logo')).not.toBeNull();
    });
});
