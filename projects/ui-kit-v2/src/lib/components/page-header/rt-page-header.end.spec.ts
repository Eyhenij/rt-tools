import { ChangeDetectionStrategy, Component, DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { WINDOW } from '@rt-tools/core';

import { createRtFixture, el, IRtFixtureOptions, qa } from '../../../testing/rt-kit-testing';
import { IRtPageHeader } from './rt-page-header.model';
import { RtPageHeaderBellDirective } from './rt-page-header.component';
import { RtPageHeaderComponent } from './rt-page-header.component';

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

/** Кнопки шапки приходят шаблонами `rtHeaderBell` — нужна host-обёртка. */
@Component({
    selector: 'rt-page-header-end-host',
    template: `
        <rt-page-header [items]="items" [user]="user">
            <ng-template rtHeaderBell><button type="button" qa-dataid="host-assistant">Помощник</button></ng-template>
            <ng-template rtHeaderBell><button type="button" qa-dataid="host-bell">Уведомления</button></ng-template>
        </rt-page-header>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtPageHeaderComponent, RtPageHeaderBellDirective],
})
class PageHeaderEndHostComponent {
    public readonly items: ReadonlyArray<IRtPageHeader.Item> = ITEMS;
    public readonly user: IRtPageHeader.User = { name: 'Иванов И.' };
}

function setup(): ComponentFixture<RtPageHeaderComponent> {
    return createRtFixture(RtPageHeaderComponent, { items: ITEMS, user: { name: 'Иванов И.' } }, PROVIDERS);
}

describe('RtPageHeaderComponent — правая группа', (): void => {
    it('SC-UKV-1304 — кнопки слота и профиль стоят в одной группе в порядке разметки, профиль последним', (): void => {
        const fixture: ComponentFixture<PageHeaderEndHostComponent> = createRtFixture(PageHeaderEndHostComponent, {}, PROVIDERS);
        const end: HTMLElement = qa(fixture, 'header-end')?.nativeElement as HTMLElement;

        expect(end).toBeTruthy();
        expect(Array.from(end.children).map((node: Element): string => node.getAttribute('qa-dataid') ?? node.tagName)).toEqual([
            'host-assistant',
            'host-bell',
            'RT-PAGE-HEADER-USER',
        ]);
    });

    it('SC-UKV-1305 — кнопка профиля подписана именем: на узком экране имя скрыто, и подпись её называет', (): void => {
        const fixture: ComponentFixture<RtPageHeaderComponent> = setup();

        expect(el(fixture, '.rt-page-header__user')?.attributes['aria-label']).toBe('Иванов И.');
    });

    it('SC-UKV-1305 — в кнопке профиля есть значок user для узкой шапки, скрытый от скринридера', (): void => {
        const fixture: ComponentFixture<RtPageHeaderComponent> = setup();
        const icon: DebugElement | null = el(fixture, '.rt-page-header__user .rt-page-header__user-icon');

        expect(icon).not.toBeNull();
        expect(icon?.attributes['aria-hidden']).toBe('true');
        expect(el(fixture, '.rt-page-header__user-icon use')?.attributes['href']).toBe('#rt-icon-user');
    });
});
