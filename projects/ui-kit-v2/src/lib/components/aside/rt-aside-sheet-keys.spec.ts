import { join } from 'node:path';

import { ApplicationRef, ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import * as sass from 'sass';

import { resetMediaQueries, setMediaQueryMatches } from '../../../testing/match-media-stub';
import { provideRtKitTesting } from '../../../testing/rt-kit-testing';
import { RtBottomSheetComponent } from '../bottom-sheet/rt-bottom-sheet.component';
import { RtTabDirective } from '../tabs/rt-tab.directive';
import { RtTabsComponent } from '../tabs/rt-tabs.component';
import { RtAsideHeaderComponent } from './header/rt-aside-header.component';
import { RtAsideContentDirective } from './rt-aside-content.directive';
import { RtAsideRef } from './rt-aside-ref';
import { RtAsideSheetTabs } from './rt-aside-sheet-tabs';
import { RtAsideComponent } from './rt-aside.component';
import { RtAsideService } from './rt-aside.service';
import { RT_ASIDE_DATA } from './rt-aside.tokens';

/** Порог телефона в запросе к окну: его спрашивает служба порогов кита. */
const PHONE_QUERY: string = '(max-width: 480px)';

/**
 * Панель с полем, списком в своей шторке и, по данным, вкладками. Список стоит здесь вместо
 * выпадающего списка и поля даты кита: они открывают свои шторки тем же `rt-bottom-sheet`.
 */
@Component({
    selector: 'rt-aside-sheet-keys-content',
    template: `
        <rt-aside [contentLayout]="tabs ? 'tabs' : 'default'">
            <rt-aside-header title="Запись" />
            <ng-template rtAsideContent>
                @if (tabs) {
                    <rt-tabs activeId="c">
                        @for (id of tabIds; track id) {
                            <ng-template [rtTab]="id" [label]="'Вкладка ' + id">Содержимое {{ id }}</ng-template>
                        }
                    </rt-tabs>
                } @else {
                    <input qa-dataid="record-name" />
                    <button type="button" qa-dataid="city-field" (click)="cityOpen.set(true)">{{ city() }}</button>
                    <rt-bottom-sheet [open]="cityOpen()" (openChange)="cityOpen.set($event)">
                        <span sheetHeader qa-dataid="city-title">Город</span>
                        <button type="button" qa-dataid="city-option" (click)="pick('Казань')">Казань</button>
                    </rt-bottom-sheet>
                }
            </ng-template>
        </rt-aside>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtAsideComponent, RtAsideHeaderComponent, RtAsideContentDirective, RtBottomSheetComponent, RtTabsComponent, RtTabDirective],
})
class KeysContentComponent {
    protected readonly tabs: boolean = inject(RT_ASIDE_DATA) === 'tabs';
    protected readonly tabIds: readonly string[] = ['a', 'b', 'c', 'd', 'e'];
    protected readonly cityOpen: WritableSignal<boolean> = signal(false);
    protected readonly city: WritableSignal<string> = signal('Город не выбран');

    protected pick(city: string): void {
        this.city.set(city);
        this.cityOpen.set(false);
    }
}

/** Страница с кнопкой, открывающей панель, и слушателем Escape на документе. */
@Component({
    selector: 'rt-aside-sheet-keys-page',
    template: `
        <button type="button" qa-dataid="page-open" (click)="open()">Открыть</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class KeysPageComponent {
    readonly #aside: RtAsideService = inject(RtAsideService);

    public layout: string = 'default';
    public ref: RtAsideRef | null = null;

    public open(): void {
        this.ref = this.#aside.open(KeysContentComponent, { data: this.layout });
    }
}

async function settle(): Promise<void> {
    const app: ApplicationRef = TestBed.inject(ApplicationRef);
    app.tick();
    await new Promise<void>((resolve: () => void): void => {
        requestAnimationFrame((): void => resolve());
    });
    app.tick();
    await app.whenStable();
    app.tick();
}

function node(id: string): HTMLElement | null {
    return document.querySelector(`[qa-dataid="${id}"]`);
}

/** Открывает панель кнопкой страницы на телефоне. */
async function openFromPage(layout: string = 'default'): Promise<ComponentFixture<KeysPageComponent>> {
    setMediaQueryMatches(PHONE_QUERY, true);
    TestBed.configureTestingModule({ providers: provideRtKitTesting() });
    const fixture: ComponentFixture<KeysPageComponent> = TestBed.createComponent(KeysPageComponent);
    fixture.componentInstance.layout = layout;
    fixture.detectChanges();
    node('page-open')?.focus();
    node('page-open')?.click();
    await settle();
    await settle();

    return fixture;
}

function escape(target: EventTarget): KeyboardEvent {
    const event: KeyboardEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    target.dispatchEvent(event);

    return event;
}

/** Шторка, найденная по своему полю: панель или список. */
function sheetOf(id: string): HTMLElement | null {
    return node(id)?.closest<HTMLElement>('rt-bottom-sheet') ?? null;
}

describe('Панель-шторка на телефоне — Escape, фокус и шторка из шторки', (): void => {
    let closes: number;

    beforeEach((): void => {
        closes = 0;
    });

    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((overlays: Element): void => overlays.remove());
        resetMediaQueries();
    });

    function track(fixture: ComponentFixture<KeysPageComponent>): void {
        fixture.componentInstance.ref?.afterClosed().subscribe((): void => {
            closes += 1;
        });
    }

    it('SC-UKV-1828 — открытая кнопкой страницы шторка ставит фокус на «×»', async (): Promise<void> => {
        await openFromPage();

        expect(document.activeElement).toBe(node('aside-sheet-close')?.querySelector('button'));
    });

    it('SC-UKV-1829 — закрытая «×» шторка возвращает фокус на кнопку, которая её открыла', async (): Promise<void> => {
        await openFromPage();

        node('aside-sheet-close')?.querySelector('button')?.click();
        await settle();

        expect(document.activeElement).toBe(node('page-open'));
    });

    it('SC-UKV-1826 — Escape с фокусом на странице под шторкой закрывает панель', async (): Promise<void> => {
        const fixture: ComponentFixture<KeysPageComponent> = await openFromPage();
        track(fixture);
        node('page-open')?.focus();

        escape(node('page-open') as HTMLElement);
        await settle();

        expect(closes).toBe(1);
    });

    it('SC-UKV-1859 — Escape в поле шторки закрывает её, а страница клавишу не слышит', async (): Promise<void> => {
        const fixture: ComponentFixture<KeysPageComponent> = await openFromPage();
        track(fixture);
        const heard: string[] = [];
        const listen: (event: KeyboardEvent) => void = (event: KeyboardEvent): number => heard.push(event.key);
        document.addEventListener('keydown', listen);
        node('record-name')?.focus();

        escape(node('record-name') as HTMLElement);
        await settle();
        document.removeEventListener('keydown', listen);

        expect(closes).toBe(1);
        expect(heard).toEqual([]);
    });

    it('SC-UKV-1827 — Escape на втором экране возвращает первый, шторка остаётся открытой', async (): Promise<void> => {
        const fixture: ComponentFixture<KeysPageComponent> = await openFromPage();
        track(fixture);
        node('city-field')?.click();
        await settle();
        node('city-option')?.focus();

        escape(node('city-option') as HTMLElement);
        await settle();

        expect(sheetOf('city-option')?.classList).not.toContain('rt-bottom-sheet--open');
        expect(node('aside-sheet')?.classList).not.toContain('rt-bottom-sheet--covered');
        expect(node('aside-sheet')?.classList).toContain('rt-bottom-sheet--open');
        expect(node('aside-title')?.textContent?.trim()).toBe('Запись');
        expect(closes).toBe(0);
    });

    it('SC-UKV-1830 — список в той же шторке возвращает содержимое панели с набранным текстом и выбором', async (): Promise<void> => {
        await openFromPage();
        (node('record-name') as HTMLInputElement).value = 'Новое имя';
        node('city-field')?.focus();
        node('city-field')?.click();
        await settle();

        expect(sheetOf('city-option')?.classList).toContain('rt-bottom-sheet--nested');

        node('city-option')?.click();
        await settle();

        expect(node('aside-sheet')?.classList).toContain('rt-bottom-sheet--open');
        expect(node('aside-sheet')?.classList).not.toContain('rt-bottom-sheet--covered');
        expect((node('record-name') as HTMLInputElement).value).toBe('Новое имя');
        expect(node('city-field')?.textContent?.trim()).toBe('Казань');
        expect(document.activeElement).toBe(node('city-field'));
    });

    it('SC-UKV-1831 — шторка поля открывается в той же шторке не ниже её, с шевроном «назад»', async (): Promise<void> => {
        await openFromPage();
        const panel: HTMLElement | null = node('aside-sheet')?.querySelector<HTMLElement>(':scope > .rt-bottom-sheet__panel') ?? null;
        jest.spyOn(panel as HTMLElement, 'getBoundingClientRect').mockReturnValue({ height: 800 } as DOMRect);
        node('city-field')?.focus();

        node('city-field')?.click();
        await settle();
        const city: HTMLElement | null = sheetOf('city-option');
        const back: HTMLElement | null = city?.querySelector<HTMLElement>('[qa-dataid="bottom-sheet-back"]') ?? null;

        expect(city?.classList).toContain('rt-bottom-sheet--nested');
        expect(city?.style.getPropertyValue('--rt-bottom-sheet-nested-height')).toBe('800px');
        expect(node('aside-sheet')?.classList).toContain('rt-bottom-sheet--covered');
        expect(node('city-title')?.textContent?.trim()).toBe('Город');
        expect(city?.querySelector('[qa-dataid="bottom-sheet-close"]')).toBeNull();
        expect(back?.querySelector('button')?.getAttribute('aria-label')).toBe('Back');
        expect(back?.querySelector('rt-icon')?.getAttribute('ng-reflect-name') ?? back?.innerHTML).toContain('chevron-left');

        back?.querySelector('button')?.click();
        await settle();

        expect(city?.classList).not.toContain('rt-bottom-sheet--open');
        expect(node('aside-sheet')?.classList).not.toContain('rt-bottom-sheet--covered');
        expect(node('aside-sheet')?.classList).toContain('rt-bottom-sheet--open');
    });

    it('SC-UKV-1832 — вкладки, которые не влазят, идут по кругу: выбранная в середине ряда, края затенены', async (): Promise<void> => {
        // Ряд шире шторки: в jsdom раскладки нет, ширину ряда задаёт подмена.
        const wide: jest.SpyInstance = jest.spyOn(Element.prototype, 'scrollWidth', 'get').mockReturnValue(600);
        await openFromPage('tabs');
        const list: HTMLElement | null = document.querySelector<HTMLElement>('.rt-aside__content .rt-tabs__tab-list');
        const items: HTMLElement[] = Array.from(list?.querySelectorAll<HTMLElement>(':scope > [data-tabitem]') ?? []);
        const orderOf: (id: string) => string | undefined = (id: string): string | undefined =>
            items.find((item: HTMLElement): boolean => item.dataset['tabitem'] === id)?.style.order;
        wide.mockRestore();

        expect(items).toHaveLength(5);
        expect(orderOf('c')).toBe('2');
        expect(orderOf('a')).toBe('0');
        expect(orderOf('e')).toBe('4');
        expect(list?.classList).toContain('rt-aside__tabs--overflow');
    });

    it('SC-UKV-1832 — вкладки, которые влазят, стоят в порядке разметки без затенения краёв', async (): Promise<void> => {
        await openFromPage('tabs');
        const list: HTMLElement | null = document.querySelector<HTMLElement>('.rt-aside__content .rt-tabs__tab-list');
        const items: HTMLElement[] = Array.from(list?.querySelectorAll<HTMLElement>(':scope > [data-tabitem]') ?? []);

        expect(items).toHaveLength(5);
        expect(items.map((item: HTMLElement): string => item.style.order)).toEqual(['', '', '', '', '']);
        expect(list?.classList).not.toContain('rt-aside__tabs--overflow');
    });

    it('SC-UKV-1832 — выбранная вкладка встаёт серединой в середину ряда без округления до пикселя', (): void => {
        const list: HTMLElement = document.createElement('div');
        ['a', 'b', 'c'].forEach((id: string): void => {
            const item: HTMLElement = document.createElement('div');
            item.dataset['tabitem'] = id;
            item.innerHTML = `<button role="tab" aria-selected="${id === 'b'}"></button>`;
            list.appendChild(item);
        });
        document.body.appendChild(list);
        const rect: (left: number, width: number) => DOMRect = (left: number, width: number): DOMRect =>
            ({ left, width, right: left + width, top: 0, bottom: 0, height: 0, x: left, y: 0 }) as DOMRect;
        Object.defineProperty(list, 'clientWidth', { value: 335 });
        Object.defineProperty(list, 'scrollWidth', { value: 600 });
        jest.spyOn(list, 'getBoundingClientRect').mockReturnValue(rect(20, 335));
        // Выбранная после перестановки стоит у 115,3 шириной 145,1: её середина — 187,85, середина ряда — 187,5.
        jest.spyOn(list.children[1] as HTMLElement, 'getBoundingClientRect').mockReturnValue(rect(115.3, 145.1));
        const tabs: RtAsideSheetTabs = new RtAsideSheetTabs();

        tabs.attach(list);

        expect(list.scrollLeft).toBeCloseTo(0.35, 5);
        tabs.detach();
        list.remove();
    });

    it('SC-UKV-1832 — шрифт догрузился и сменил ширину подписей: выбранная вкладка снова встаёт по центру', async (): Promise<void> => {
        const list: HTMLElement = document.createElement('div');
        ['a', 'b', 'c'].forEach((id: string): void => {
            const item: HTMLElement = document.createElement('div');
            item.dataset['tabitem'] = id;
            item.innerHTML = `<button role="tab" aria-selected="${id === 'b'}"></button>`;
            list.appendChild(item);
        });
        document.body.appendChild(list);
        let loaded: () => void = (): void => undefined;
        const ready: Promise<void> = new Promise<void>((resolve: () => void): void => {
            loaded = resolve;
        });
        Object.defineProperty(document, 'fonts', { value: { ready }, configurable: true });
        const rect: (left: number, width: number) => DOMRect = (left: number, width: number): DOMRect =>
            ({ left, width, right: left + width, top: 0, bottom: 0, height: 0, x: left, y: 0 }) as DOMRect;
        Object.defineProperty(list, 'clientWidth', { value: 335 });
        Object.defineProperty(list, 'scrollWidth', { value: 600 });
        jest.spyOn(list, 'getBoundingClientRect').mockReturnValue(rect(20, 335));
        const chosen: jest.SpyInstance = jest
            .spyOn(list.children[1] as HTMLElement, 'getBoundingClientRect')
            .mockReturnValue(rect(142.5, 90));
        const tabs: RtAsideSheetTabs = new RtAsideSheetTabs();

        tabs.attach(list);
        expect(list.scrollLeft).toBe(0);
        // Шрифт загрузился: подписи шире, середина выбранной ушла на 11 вправо.
        chosen.mockReturnValue(rect(153.5, 90));
        loaded();
        await ready;

        expect(list.scrollLeft).toBe(11);
        tabs.detach();
        list.remove();
        delete (document as { fonts?: unknown }).fonts;
    });

    it('SC-UKV-1832 — ряд вкладок шторки — одна строка без полосы прокрутки, края затенены на 32, только когда не влазит', (): void => {
        const css: string = sass.compile(join(__dirname, 'rt-aside.component.scss')).css;
        const ruleOf: (selector: string) => string = (selector: string): string => {
            const at: number = css.indexOf(`${selector} {`);
            expect(at).toBeGreaterThanOrEqual(0);
            return css.slice(css.indexOf('{', at) + 1, css.indexOf('}', at));
        };
        const row: string = ruleOf('rt-aside .rt-aside--sheet.rt-aside--content--tabs .rt-tabs__tab-list');
        const overflow: string = ruleOf('rt-aside .rt-aside--sheet.rt-aside--content--tabs .rt-aside__tabs--overflow');

        expect(row).toContain('flex-wrap: nowrap');
        expect(row).toContain('overflow-x: auto');
        expect(row).toContain('scrollbar-width: none');
        expect(row).not.toContain('mask-image');
        expect(overflow).toContain('mask-image');
        expect(overflow).toContain('var(--rt-space-8)');
    });

    it('SC-UKV-1833 — при просьбе убавить движение шторка панели появляется без выезда', (): void => {
        const css: string = sass.compile(join(__dirname, '../bottom-sheet/rt-bottom-sheet.component.scss')).css;
        const motion: string = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));

        expect(motion).toMatch(/\.rt-bottom-sheet__panel[^{]*\{\s*transition: none/);
    });
});
