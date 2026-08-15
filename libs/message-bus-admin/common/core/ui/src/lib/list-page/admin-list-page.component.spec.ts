import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { EReadFault, IReadFault } from '@rt/message-bus-admin/common/core/util';
import { provideRtIDBStorage, provideRtStorage, provideRtUtils } from '@rt-tools/core';
import { IPageModel } from '@rt-tools/utils';

import { AdminListPageComponent } from './admin-list-page.component';

const PAGE: IPageModel = { pageNumber: 1, pageSize: 20, totalCount: 137 };

/** Хозяин страницы: таблицу раздел кладёт проекцией, и здесь её место занимает метка. */
@Component({
    selector: 'admin-list-page-host',
    imports: [AdminListPageComponent],
    template: `
        <admin-list-page [title]="'Разборы происшествий'" [pageModel]="page" [fault]="fault">
            <p qa-dataid="list-rows">строки раздела</p>
        </admin-list-page>
    `,
})
class HostComponent {
    public page: IPageModel = PAGE;
    public fault: IReadFault | null = null;
}

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

    it('прочитанный список занимает место под таблицу', () => {
        expect(textOf(fixture, 'list-rows')).toBe('строки раздела');
        expect(fixture.debugElement.query(By.css('[qa-dataid="list-fault"]'))).toBeNull();
    });

    it('отказ занимает место списка и называет причину', () => {
        fixture.componentInstance.fault = { kind: EReadFault.Service, incident: '' };
        fixture.detectChanges();

        expect(textOf(fixture, 'list-fault')).toContain('Прочитать не удалось');
        expect(fixture.debugElement.query(By.css('[qa-dataid="list-rows"]'))).toBeNull();
    });

    it('названный приёмником номер обращения стоит рядом с причиной', () => {
        fixture.componentInstance.fault = { kind: EReadFault.Service, incident: 'ab12cd' };
        fixture.detectChanges();

        expect(textOf(fixture, 'list-fault')).toContain('Обращение ab12cd');
    });

    it('кончившийся вход не выдаётся за поломку чтения', () => {
        fixture.componentInstance.fault = { kind: EReadFault.Session, incident: '' };
        fixture.detectChanges();

        expect(textOf(fixture, 'list-fault')).toContain('Вход кончился');
    });

    it('повтор чтения делается одним действием прямо у причины', () => {
        fixture.componentInstance.fault = { kind: EReadFault.Timeout, incident: '' };
        fixture.detectChanges();

        const page: AdminListPageComponent = fixture.debugElement.query(By.directive(AdminListPageComponent)).componentInstance;
        const repeats: number[] = [];

        page.retried.subscribe((): void => {
            repeats.push(1);
        });
        fixture.debugElement.query(By.css('[qa-dataid="list-retry"]')).nativeElement.click();

        expect(repeats.length).toBe(1);
    });

    it('переключатель страниц отдаёт наверх выбранную страницу', () => {
        const page: AdminListPageComponent = fixture.debugElement.query(By.directive(AdminListPageComponent)).componentInstance;
        const asked: number[] = [];

        page.pageChange.subscribe((number: number): void => {
            asked.push(number);
        });
        fixture.debugElement.queryAll(By.css('[qa-dataid="pagination-page"]'))[1]?.nativeElement.click();

        expect(asked).toEqual([2]);
    });
});
