import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, Routes, provideRouter } from '@angular/router';

import { BreakpointsService } from '../../platform';
import { createRtFixture, el, hostClasses, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { IRtPageHeader } from './rt-page-header.model';
import { RtPageHeaderComponent } from './rt-page-header.component';

const ITEMS: ReadonlyArray<IRtPageHeader.Item> = [
    { id: 'tours', label: 'Туры', route: '/tours' },
    { id: 'clients', label: 'Клиенты', route: '/clients', unread: true },
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

/** Адреса под навигацию: один лежит в панели раздела, второй — нигде. */
const ROUTES: Routes = [
    { path: 'sales', children: [] },
    { path: 'nowhere', children: [] },
];

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtPageHeaderComponent> {
    return createRtFixture(RtPageHeaderComponent, { items: ITEMS, ...inputs }, { providers: [provideRouter([])] });
}

function navItems(fixture: ComponentFixture<RtPageHeaderComponent>): HTMLElement[] {
    return qaAll(fixture, 'header-nav-item').map((node: DebugElement): HTMLElement => node.nativeElement as HTMLElement);
}

/** Подмена наблюдателя ширины: в тестовой среде он ничего не измеряет. */
class NarrowBreakpointsService {
    public readonly narrow: () => boolean = (): boolean => true;
}

/**
 * Шапка на заданном адресе. Закреплённая панель показывает раздел открытого
 * адреса, поэтому без настоящей навигации ей нечего показывать.
 */
async function setupAt(
    url: string,
    inputs: Readonly<Record<string, unknown>> = {},
    narrow: boolean = false
): Promise<ComponentFixture<RtPageHeaderComponent>> {
    const fixture: ComponentFixture<RtPageHeaderComponent> = createRtFixture(
        RtPageHeaderComponent,
        { items: ITEMS, ...inputs },
        {
            providers: narrow
                ? [provideRouter(ROUTES), { provide: BreakpointsService, useClass: NarrowBreakpointsService }]
                : [provideRouter(ROUTES)],
        }
    );
    await TestBed.inject(Router).navigateByUrl(url);
    fixture.detectChanges();

    return fixture;
}

/** Панель, стоящая в потоке разметки: всплывающая живёт в оверлее, вне хоста. */
function panelInFlow(fixture: ComponentFixture<RtPageHeaderComponent>): DebugElement | null {
    return el(fixture, '.rt-page-header-submenu');
}

/** Набор запроса в поле панели: значение уходит в контрол через событие ввода. */
function typeInPanelSearch(fixture: ComponentFixture<RtPageHeaderComponent>, query: string): void {
    const field: HTMLInputElement = qa(fixture, 'input-control')?.nativeElement as HTMLInputElement;
    expect(field).toBeDefined();
    field.value = query;
    field.dispatchEvent(new Event('input', { bubbles: true }));
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

    describe('мода панели второго уровня', (): void => {
        it('SC-UKV-96 — потребитель, не назвавший моду, получает всплывающую панель', (): void => {
            // Уход указателя закрывает панель не сразу: у попапа своя отсрочка,
            // и время в спеке двигается вручную — среда прогона zoneless.
            jest.useFakeTimers();
            try {
                const fixture: ComponentFixture<RtPageHeaderComponent> = setup();

                expect(panelInFlow(fixture)).toBeNull();

                qa(fixture, 'header-nav-trigger')?.nativeElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
                fixture.detectChanges();

                expect(document.querySelector('[qa-dataid="header-nav-column"]')).not.toBeNull();

                qa(fixture, 'header-nav-trigger')?.nativeElement.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
                jest.advanceTimersByTime(200);
                fixture.detectChanges();

                expect(document.querySelector('[qa-dataid="header-nav-column"]')).toBeNull();
            } finally {
                jest.useRealTimers();
            }
        });

        it('SC-UKV-97 — закреплённая панель не закрывается уходом указателя', async (): Promise<void> => {
            const fixture: ComponentFixture<RtPageHeaderComponent> = await setupAt('/sales', { panelMode: 'pinned' });

            expect(panelInFlow(fixture)).not.toBeNull();

            panelInFlow(fixture)?.nativeElement.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
            fixture.detectChanges();

            expect(panelInFlow(fixture)).not.toBeNull();
        });

        it('SC-UKV-98 — нажатие переключателя моду не меняет, а просит её', async (): Promise<void> => {
            // Предпочтение хранит потребитель: кит только сообщает о нажатии.
            const fixture: ComponentFixture<RtPageHeaderComponent> = await setupAt('/sales', { panelMode: 'pinned' });
            const asked: jest.Mock = jest.fn();
            fixture.componentInstance.panelModeChange.subscribe(asked);

            (qa(fixture, 'header-nav-pin')?.nativeElement as HTMLElement).click();
            fixture.detectChanges();

            expect(asked).toHaveBeenCalledTimes(1);
            expect(asked).toHaveBeenCalledWith('hover');
            expect(fixture.componentInstance.panelMode()).toBe('pinned');
        });

        it('SC-UKV-99 — закреплённая панель показывает раздел открытого адреса', async (): Promise<void> => {
            const fixture: ComponentFixture<RtPageHeaderComponent> = await setupAt('/sales', { panelMode: 'pinned' });

            expect(textOf(panelInFlow(fixture))).toContain('Продажи');
        });

        it('SC-UKV-100 — активного раздела нет — закреплённой панели нет', async (): Promise<void> => {
            const fixture: ComponentFixture<RtPageHeaderComponent> = await setupAt('/nowhere', { panelMode: 'pinned' });

            expect(panelInFlow(fixture)).toBeNull();
        });

        it('SC-UKV-104 — совпадений нет — панель говорит об этом строкой', async (): Promise<void> => {
            const fixture: ComponentFixture<RtPageHeaderComponent> = await setupAt('/sales', { panelMode: 'pinned' });

            typeInPanelSearch(fixture, 'такого пункта нет');

            expect(qa(fixture, 'header-nav-column')).toBeNull();
            expect(textOf(qa(fixture, 'header-nav-empty'))).toBe('Nothing found');
        });

        it('SC-UKV-106 — на узком экране переключателя нет', async (): Promise<void> => {
            const fixture: ComponentFixture<RtPageHeaderComponent> = await setupAt('/sales', { panelMode: 'pinned' }, true);

            expect(qa(fixture, 'header-nav-pin')).toBeNull();
        });
    });
});
