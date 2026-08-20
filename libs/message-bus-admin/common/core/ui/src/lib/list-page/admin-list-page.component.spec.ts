import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component, forwardRef, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ADMIN_LIST_HOST, EReadFault, IAdminListHost, IReadFault } from '@rt/message-bus-admin/common/core/util';
import { provideRtIDBStorage, provideRtStorage, provideRtUtils } from '@rt-tools/core';
import { IPageModel } from '@rt-tools/utils';

import {
    AdminListAboveTableDirective,
    AdminListPageComponent,
    AdminListToolbarLeftDirective,
    AdminListToolbarRightDirective,
} from './admin-list-page.component';

const PAGE: IPageModel = { pageNumber: 1, pageSize: 20, totalCount: 137 };

/**
 * Раздел, показывающий страницу: он же её хост.
 *
 * Просьбы страницы копятся строками — спека спрашивает не «что нарисовалось», а «дошло ли до
 * раздела то, о чём его попросили».
 */
@Component({
    selector: 'admin-list-page-host',
    template: `
        <admin-list-page qaPrefix="postmortems" hint="Что и почему сломалось" title="Разборы происшествий">
            <ng-template adminListToolbarLeft>
                <span qa-dataid="postmortems-filter">отбор раздела</span>
            </ng-template>

            <ng-template adminListToolbarRight>
                <button qa-dataid="postmortems-own" type="button">кнопка раздела</button>
            </ng-template>

            <ng-template adminListAboveTable>
                <p qa-dataid="postmortems-notice">сказанное обо всём списке</p>
            </ng-template>

            <p qa-dataid="postmortems-rows">строки раздела</p>
        </admin-list-page>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AdminListPageComponent, AdminListToolbarLeftDirective, AdminListToolbarRightDirective, AdminListAboveTableDirective],
    providers: [{ provide: ADMIN_LIST_HOST, useExisting: forwardRef((): typeof HostComponent => HostComponent) }],
})
class HostComponent implements IAdminListHost {
    public readonly loading: WritableSignal<boolean> = signal(false);
    public readonly fault: WritableSignal<IReadFault | null> = signal(null);
    public readonly pageModel: WritableSignal<IPageModel> = signal(PAGE);

    /** Что страница попросила сделать — по строке на просьбу, в порядке их прихода. */
    public readonly asked: string[] = [];

    public retry(): void {
        this.asked.push('retry');
    }

    public goToPage(page: number): void {
        this.asked.push(`page:${page}`);
    }

    public changeSize(size: number): void {
        this.asked.push(`size:${size}`);
    }

    public openColumns(): void {
        this.asked.push('columns');
    }
}

/** Тот же раздел, но слотов он не занимает и подсказки не называет. */
@Component({
    selector: 'admin-list-page-bare-host',
    template: `
        <admin-list-page qaPrefix="summaries" title="Сводки проектов">
            <p qa-dataid="summaries-rows">строки раздела</p>
        </admin-list-page>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AdminListPageComponent],
    providers: [{ provide: ADMIN_LIST_HOST, useExisting: forwardRef((): typeof BareHostComponent => BareHostComponent) }],
})
class BareHostComponent extends HostComponent {}

function textOf(fixture: ComponentFixture<HostComponent>, qaId: string): string {
    return fixture.debugElement.query(By.css(`[qa-dataid="${qaId}"]`))?.nativeElement.textContent.trim() ?? '';
}

describe('AdminListPageComponent', () => {
    let fixture: ComponentFixture<HostComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HostComponent],
            providers: [provideHttpClient(), provideHttpClientTesting(), provideRtUtils(), provideRtStorage(), provideRtIDBStorage()],
        });

        fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('заголовок раздела стоит своим блоком над тулбаром', () => {
        expect(fixture.debugElement.query(By.css('.admin-page__title')).nativeElement.textContent.trim()).toBe('Разборы происшествий');
    });

    it('SC-MB-166 — подсказка стоит под названием, а не рядом с ним', () => {
        const main: HTMLElement = fixture.debugElement.query(By.css('.admin-page__header-main')).nativeElement;
        const title: HTMLElement | null = main.querySelector('.admin-page__title');
        const hint: HTMLElement | null = main.querySelector('.admin-page__hint');

        // Обе части лежат в обёртке шапки, и подсказка идёт за названием: свою строку ей даёт
        // правило раскладки, а порядок в разметке — то, что от компонента и зависит.
        expect(title).not.toBeNull();
        expect(hint).not.toBeNull();

        const order: Element[] = [...main.children];

        expect(order.indexOf(hint as Element)).toBeGreaterThan(order.indexOf(title as Element));
    });

    it('SC-MB-110 — отбор на списочной странице стоит тот, который положил раздел', () => {
        const left: HTMLElement = fixture.debugElement.query(By.css('[data-slot="left"]')).nativeElement;

        expect(left.querySelector('[qa-dataid="postmortems-filter"]')?.textContent?.trim()).toBe('отбор раздела');
        expect(fixture.debugElement.query(By.css('admin-tree-filter'))).toBeNull();
    });

    it('SC-MB-112 — обновление и настройка столбцов остаются на своём месте у края тулбара', () => {
        const right: HTMLElement = fixture.debugElement.query(By.css('[data-slot="right"]')).nativeElement;
        const order: string[] = [...right.querySelectorAll(':scope > [qa-dataid]')].map(
            (node: Element): string => node.getAttribute('qa-dataid') ?? ''
        );

        expect(order).toEqual(['postmortems-own', 'postmortems-refresh', 'postmortems-columns']);
    });

    it('SC-MB-114 — заголовок раздела показывает подсказку, когда раздел её назвал', () => {
        expect(textOf(fixture, 'postmortems-hint')).toBe('Что и почему сломалось');
    });

    it('SC-MB-115 — якоря общей страницы называют раздел, на котором она открыта', () => {
        expect(fixture.debugElement.query(By.css('[qa-dataid="postmortems-refresh"]'))).not.toBeNull();
        expect(fixture.debugElement.query(By.css('[qa-dataid="list-refresh"]'))).toBeNull();
    });

    it('прочитанный список занимает место под таблицу', () => {
        expect(textOf(fixture, 'postmortems-rows')).toBe('строки раздела');
        expect(fixture.debugElement.query(By.css('[qa-dataid="postmortems-fault"]'))).toBeNull();
    });

    it('над таблицей стоит сказанное обо всём списке сразу', () => {
        expect(textOf(fixture, 'postmortems-notice')).toBe('сказанное обо всём списке');
    });

    it('отказ занимает место списка и называет причину', () => {
        fixture.componentInstance.fault.set({ kind: EReadFault.Service, incident: '' });
        fixture.detectChanges();

        expect(textOf(fixture, 'postmortems-fault')).toContain('Прочитать не удалось');
        expect(fixture.debugElement.query(By.css('[qa-dataid="postmortems-rows"]'))).toBeNull();
    });

    it('названный приёмником номер обращения стоит рядом с причиной', () => {
        fixture.componentInstance.fault.set({ kind: EReadFault.Service, incident: 'ab12cd' });
        fixture.detectChanges();

        expect(textOf(fixture, 'postmortems-fault')).toContain('Обращение ab12cd');
    });

    it('кончившийся вход не выдаётся за поломку чтения', () => {
        fixture.componentInstance.fault.set({ kind: EReadFault.Session, incident: '' });
        fixture.detectChanges();

        expect(textOf(fixture, 'postmortems-fault')).toContain('Вход кончился');
    });

    it('повтор чтения делается одним действием прямо у причины', () => {
        fixture.componentInstance.fault.set({ kind: EReadFault.Timeout, incident: '' });
        fixture.detectChanges();

        fixture.debugElement.query(By.css('[qa-dataid="postmortems-retry"]')).nativeElement.click();

        expect(fixture.componentInstance.asked).toEqual(['retry']);
    });

    it('переключатель страниц просит страницу у хоста', () => {
        fixture.debugElement.queryAll(By.css('[qa-dataid="pagination-page"]'))[1]?.nativeElement.click();

        expect(fixture.componentInstance.asked).toEqual(['page:2']);
    });

    it('настройку столбцов страница просит открыть у хоста', () => {
        // Нажимается кнопка внутри компонента кита: якорь раздела стоит на его хосте, а слушает
        // нажатие сам `button` — по хосту клик до него не доходит
        fixture.debugElement.query(By.css('[qa-dataid="postmortems-columns"] [qa-dataid="icon-button-control"]')).nativeElement.click();

        expect(fixture.componentInstance.asked).toEqual(['columns']);
    });

    describe('раздел, который слотов не занял', () => {
        let bare: ComponentFixture<BareHostComponent>;

        beforeEach(() => {
            bare = TestBed.createComponent(BareHostComponent);
            bare.detectChanges();
        });

        it('SC-MB-113 — незанятое место над таблицей высоты не занимает', () => {
            expect(bare.debugElement.query(By.css('[qa-dataid="summaries-rows"]'))).not.toBeNull();
            expect(bare.debugElement.query(By.css('.admin-page__above'))).toBeNull();
        });

        it('незанятая половина тулбара на экране не появляется', () => {
            expect(bare.debugElement.query(By.css('[data-slot="right"]'))).not.toBeNull();
            expect(bare.debugElement.query(By.css('[data-slot="left"]'))).toBeNull();
        });

        it('раздел без подсказки показывает один заголовок', () => {
            expect(bare.debugElement.query(By.css('.admin-page__title'))).not.toBeNull();
            expect(bare.debugElement.query(By.css('.admin-page__hint'))).toBeNull();
        });

        it('SC-MB-165 — раздел без подсказки места под неё не оставляет', () => {
            // Сначала — что шапку вообще нашли: утверждение об отсутствии зелено и тогда, когда
            // ищут не то.
            expect(bare.debugElement.query(By.css('.admin-page__header-main'))).not.toBeNull();
            expect(bare.debugElement.query(By.css('.admin-page__hint'))).toBeNull();
        });
    });
});
