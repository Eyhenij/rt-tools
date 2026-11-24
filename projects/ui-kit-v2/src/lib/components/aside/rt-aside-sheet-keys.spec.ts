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
                    <rt-bottom-sheet title="Город" [open]="cityOpen()" (openChange)="cityOpen.set($event)">
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

    it('SC-UKV-1827 — Escape закрывает сперва шторку над панелью, панель видна снова', async (): Promise<void> => {
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
        expect(closes).toBe(0);
    });

    it('SC-UKV-1830 — список в своей шторке возвращает панель с набранным текстом и выбранным значением', async (): Promise<void> => {
        await openFromPage();
        (node('record-name') as HTMLInputElement).value = 'Новое имя';
        node('city-field')?.click();
        await settle();

        node('city-option')?.click();
        await settle();

        expect(node('aside-sheet')?.classList).toContain('rt-bottom-sheet--open');
        expect(node('aside-sheet')?.classList).not.toContain('rt-bottom-sheet--covered');
        expect((node('record-name') as HTMLInputElement).value).toBe('Новое имя');
        expect(node('city-field')?.textContent?.trim()).toBe('Казань');
    });

    it('SC-UKV-1831 — шторка поля над панелью подменяет её: панель под ней нажатий не берёт', async (): Promise<void> => {
        await openFromPage();

        node('city-field')?.click();
        await settle();

        expect(sheetOf('city-option')?.classList).toContain('rt-bottom-sheet--open');
        expect(node('aside-sheet')?.classList).toContain('rt-bottom-sheet--covered');
    });

    it('SC-UKV-1832 — вкладки шторки в одну строку по кругу: выбранная в середине ряда', async (): Promise<void> => {
        await openFromPage('tabs');
        const list: HTMLElement | null = document.querySelector<HTMLElement>('.rt-aside__content .rt-tabs__tab-list');
        const items: HTMLElement[] = Array.from(list?.querySelectorAll<HTMLElement>(':scope > [data-tabitem]') ?? []);
        const orderOf: (id: string) => string | undefined = (id: string): string | undefined =>
            items.find((item: HTMLElement): boolean => item.dataset['tabitem'] === id)?.style.order;

        expect(items).toHaveLength(5);
        expect(orderOf('c')).toBe('2');
        expect(orderOf('a')).toBe('0');
        expect(orderOf('e')).toBe('4');
    });

    it('SC-UKV-1832 — ряд вкладок шторки — одна строка с затенёнными на 32 краями и без полосы прокрутки', (): void => {
        const css: string = sass.compile(join(__dirname, 'rt-aside.component.scss')).css;
        const selector: string = 'rt-aside .rt-aside--sheet.rt-aside--content--tabs .rt-tabs__tab-list';
        const at: number = css.indexOf(`${selector} {`);
        const body: string = css.slice(css.indexOf('{', at) + 1, css.indexOf('}', at));

        expect(at).toBeGreaterThanOrEqual(0);
        expect(body).toContain('flex-wrap: nowrap');
        expect(body).toContain('overflow-x: auto');
        expect(body).toContain('scrollbar-width: none');
        expect(body).toContain('var(--rt-space-8)');
    });

    it('SC-UKV-1833 — при просьбе убавить движение шторка панели появляется без выезда', (): void => {
        const css: string = sass.compile(join(__dirname, '../bottom-sheet/rt-bottom-sheet.component.scss')).css;
        const motion: string = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));

        expect(motion).toMatch(/\.rt-bottom-sheet__panel[^{]*\{\s*transition: none/);
    });
});
