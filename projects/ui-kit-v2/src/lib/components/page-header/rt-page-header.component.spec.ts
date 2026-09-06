import { ChangeDetectionStrategy, Component, DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { createRtFixture, el, hostClasses, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { IRtPageHeader } from './rt-page-header.model';
import { RtPageHeaderComponent } from './rt-page-header.component';

const ITEMS: ReadonlyArray<IRtPageHeader.Item> = [
    { id: 'tours', label: 'Туры', route: '/tours', icon: 'book' },
    { id: 'clients', label: 'Клиенты', route: '/clients', unread: true, icon: 'bars' },
    {
        id: 'more',
        label: 'Ещё',
        columns: [
            {
                id: 'col-1',
                groups: [{ id: 'group-1', label: 'Отчёты', items: [{ id: 'sales', label: 'Продажи', route: '/sales' }] }],
            },
        ],
    },
];

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtPageHeaderComponent> {
    return createRtFixture(RtPageHeaderComponent, { items: ITEMS, ...inputs }, { providers: [provideRouter([])] });
}

function navItems(fixture: ComponentFixture<RtPageHeaderComponent>): HTMLElement[] {
    return qaAll(fixture, 'header-nav-item').map((node: DebugElement): HTMLElement => node.nativeElement as HTMLElement);
}

/** Слоты сжатой полосы приходят проекцией — нужна host-обёртка. */
@Component({
    selector: 'rt-page-header-host',
    template: `
        <rt-page-header stickyCompact [items]="items">
            <span rtCompactLeft qa-dataid="host-crumbs">Туры / Лето</span>
            <span rtCompactCenter qa-dataid="host-filter">Все</span>
            <span rtCompactRight qa-dataid="host-actions">Действия</span>
        </rt-page-header>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtPageHeaderComponent],
})
class PageHeaderHostComponent {
    public readonly items: ReadonlyArray<IRtPageHeader.Item> = ITEMS;
}

/**
 * Прокрутка страницы в jsdom: положение хоста подменяется прямоугольниками — родитель ушёл
 * вверх, а сам хост остался у верхнего края, — и документ получает событие прокрутки.
 */
function scrollPastHeader(fixture: ComponentFixture<RtPageHeaderComponent>): void {
    const host: HTMLElement = fixture.nativeElement as HTMLElement;
    const parent: HTMLElement = document.createElement('div');
    parent.getBoundingClientRect = (): DOMRect => ({ top: -400 }) as DOMRect;
    Object.defineProperty(host, 'offsetParent', { configurable: true, get: (): HTMLElement => parent });
    Object.defineProperty(host, 'offsetTop', { configurable: true, get: (): number => 100 });
    host.getBoundingClientRect = (): DOMRect => ({ top: 0 }) as DOMRect;

    document.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
}

describe('RtPageHeaderComponent', (): void => {
    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(setup())).toContain('rt-page-header');
    });

    it('рисует по пункту на каждый раздел', (): void => {
        expect(navItems(setup()).length).toBe(ITEMS.length);
    });

    it('простой пункт — ссылка на маршрут', (): void => {
        const fixture: ComponentFixture<RtPageHeaderComponent> = setup();

        expect(navItems(fixture)[0].querySelector('a')?.getAttribute('href')).toBe('/tours');
    });

    it('пункт со вложенными разделами рисуется кнопкой, а не ссылкой', (): void => {
        // Ему некуда вести: он раскрывает панель, а переходят уже её пункты.
        const fixture: ComponentFixture<RtPageHeaderComponent> = setup();

        expect(qa(fixture, 'header-nav-trigger')).not.toBeNull();
    });

    it('непрочитанное помечается отдельной точкой', (): void => {
        const fixture: ComponentFixture<RtPageHeaderComponent> = setup();

        expect(qaAll(fixture, 'header-nav-marker').length).toBe(1);
    });

    describe('панель вложенных разделов', (): void => {
        it('до наведения не отрисована', (): void => {
            // Шапку надо поднять: без неё утверждение говорило бы о пустом
            // документе и держалось бы на чём угодно.
            const fixture: ComponentFixture<RtPageHeaderComponent> = setup();

            expect(qa(fixture, 'header-nav-trigger')).not.toBeNull();
            expect(document.querySelector('[qa-dataid="header-nav-column"]')).toBeNull();
        });

        it('раскрывается по наведению на пункт', (): void => {
            const fixture: ComponentFixture<RtPageHeaderComponent> = setup();

            qa(fixture, 'header-nav-trigger')?.nativeElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
            fixture.detectChanges();

            expect(document.querySelector('[qa-dataid="header-nav-column"]')).not.toBeNull();
            expect(document.querySelector('[qa-dataid="header-nav-subitem"]')?.textContent?.trim()).toContain('Продажи');
        });
    });

    describe('пользователь', (): void => {
        it('без данных блока пользователя нет', (): void => {
            expect(el(setup(), '.rt-page-header__user')).toBeNull();
        });

        it('с данными рисуется имя', (): void => {
            const fixture: ComponentFixture<RtPageHeaderComponent> = setup({ user: { name: 'Иванов И.' } });

            expect(textOf(el(fixture, '.rt-page-header__user'))).toContain('Иванов И.');
        });

        it('блок пользователя — кнопка, и нажатие поднимает событие ровно один раз', (): void => {
            // Без выпадающего меню блок сам и есть кнопка. Считаем именно один
            // вызов: «не больше одного» проходило бы и на нуле, то есть и при
            // снятом обработчике.
            const fixture: ComponentFixture<RtPageHeaderComponent> = setup({ user: { name: 'Иванов И.' } });
            const clicks: jest.Mock = jest.fn();
            fixture.componentInstance.userClick.subscribe(clicks);
            const userButton: HTMLElement = el(fixture, '.rt-page-header__user')?.nativeElement as HTMLElement;

            expect(userButton.tagName).toBe('BUTTON');

            userButton.click();
            fixture.detectChanges();

            expect(clicks).toHaveBeenCalledTimes(1);
        });
    });

    describe('подпись навигации', (): void => {
        it('без входа берётся из словаря кита', (): void => {
            expect(setup().componentInstance.navAriaLabel()).toBe('Main navigation');
        });

        it('своя подпись перебивает переведённую', (): void => {
            expect(setup({ ariaLabel: 'Разделы' }).componentInstance.navAriaLabel()).toBe('Разделы');
        });
    });

    it('на узком экране те же разделы доступны через кнопку-бургер', (): void => {
        // Навигация не сворачивается стилями: узкая разметка отдельная,
        // и живёт она в той же шапке.
        expect(qa(setup(), 'header-nav-burger')).not.toBeNull();
    });

    it('пустой набор разделов рисует шапку без пунктов', (): void => {
        expect(navItems(setup({ items: [] })).length).toBe(0);
    });

    describe('сжатая полоса', (): void => {
        it('без входа шапка не липкая и не сжата', (): void => {
            const classes: string[] = hostClasses(setup());

            expect(classes).not.toContain('rt-page-header--sticky');
            expect(classes).not.toContain('rt-page-header--is-compact');
        });

        it('с входом до прокрутки шапка липкая, но не сжата', (): void => {
            const classes: string[] = hostClasses(setup({ stickyCompact: true }));

            expect(classes).toContain('rt-page-header--sticky');
            expect(classes).not.toContain('rt-page-header--is-compact');
        });

        it('после прокрутки за верх шапка сжата', (): void => {
            const fixture: ComponentFixture<RtPageHeaderComponent> = setup({ stickyCompact: true });

            scrollPastHeader(fixture);

            expect(hostClasses(fixture)).toContain('rt-page-header--is-compact');
        });

        it('без входа прокрутка шапку не сжимает', (): void => {
            const fixture: ComponentFixture<RtPageHeaderComponent> = setup();

            scrollPastHeader(fixture);

            expect(hostClasses(fixture)).not.toContain('rt-page-header--is-compact');
        });

        it('в кругах первые разделы с иконкой, число — по входу', (): void => {
            // Иконки у двух разделов из трёх: просьба о пяти кругах даёт два.
            expect(qaAll(setup({ stickyCompact: true }), 'header-compact-section').length).toBe(2);
            expect(qaAll(setup({ stickyCompact: true, compactVisibleCount: 1 }), 'header-compact-section').length).toBe(1);
            expect(qaAll(setup({ stickyCompact: true, compactVisibleCount: 5 }), 'header-compact-section').length).toBe(2);
        });

        it('круг раздела с адресом — ссылка на его маршрут', (): void => {
            const circle: HTMLElement = qaAll(setup({ stickyCompact: true }), 'header-compact-section')[0].nativeElement as HTMLElement;

            expect(circle.tagName).toBe('A');
            expect(circle.getAttribute('href')).toBe('/tours');
        });

        it('кнопка «ещё» открывает панель со всеми разделами', (): void => {
            const fixture: ComponentFixture<RtPageHeaderComponent> = setup({ stickyCompact: true });

            qa(fixture, 'header-compact-more')?.nativeElement.click();
            fixture.detectChanges();

            expect(document.querySelectorAll('[qa-dataid="header-nav-mobile-item"]').length).toBe(2);
            expect(document.querySelector('[qa-dataid="header-nav-mobile-trigger"]')).not.toBeNull();
        });

        it('слоты потребителя проецируются в полосу', (): void => {
            const fixture: ComponentFixture<PageHeaderHostComponent> = createRtFixture(
                PageHeaderHostComponent,
                {},
                { providers: [provideRouter([])] }
            );

            expect(
                qa(fixture, 'header-compact')?.query((node: DebugElement): boolean => node.attributes['qa-dataid'] === 'host-crumbs')
            ).not.toBeNull();
            expect(textOf(qa(fixture, 'host-filter'))).toBe('Все');
            expect(textOf(qa(fixture, 'host-actions'))).toBe('Действия');
        });
    });
});
