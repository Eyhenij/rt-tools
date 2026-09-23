import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { IPageModel } from '@rt-tools/utils';

import { createRtFixture, el, qa, qaAll, textOf } from '../../../../testing/rt-kit-testing';
import { dataListPageAfterSizeChange, dataListPageNumbers } from '../rt-data-list-pagination.logic';
import { RtDataListPaginationComponent } from './rt-data-list-pagination.component';

function pageOf(patch: Partial<IPageModel> = {}): IPageModel {
    return { pageNumber: 1, pageSize: 10, totalCount: 100, hasPrev: false, hasNext: true, ...patch };
}

@Component({
    selector: 'rt-test-pagination-host',
    template: `
        <rt-data-list-pagination [currentPageModel]="page()" (pageModelChange)="asked.push($event)" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDataListPaginationComponent],
})
class PaginationHostComponent {
    public readonly page: WritableSignal<IPageModel> = signal<IPageModel>(pageOf());
    public readonly asked: Partial<IPageModel>[] = [];
}

function setup(page: IPageModel = pageOf()): ComponentFixture<PaginationHostComponent> {
    const fixture: ComponentFixture<PaginationHostComponent> = createRtFixture(PaginationHostComponent, {}, { skipInitialDetect: true });

    fixture.componentInstance.page.set(page);
    fixture.detectChanges();

    return fixture;
}

describe('RtDataListPaginationComponent', () => {
    it('SC-UKV-311 — полосы страниц нет, пока все записи помещаются на самую маленькую страницу', () => {
        const fixture: ComponentFixture<PaginationHostComponent> = setup(pageOf({ totalCount: 10, hasNext: false }));

        expect(qa(fixture, 'data-list-pages')).toBeNull();

        fixture.componentInstance.page.set(pageOf({ totalCount: 11 }));
        fixture.detectChanges();

        expect(qa(fixture, 'data-list-pages')).not.toBeNull();
    });

    it('до шести страниц показаны все, дальше — первые, последние и соседи нынешней', () => {
        const fixture: ComponentFixture<PaginationHostComponent> = setup(pageOf({ totalCount: 60 }));

        expect(qaAll(fixture, 'data-list-page').map(textOf)).toEqual(['1', '2', '3', '4', '5', '6']);

        fixture.componentInstance.page.set(pageOf({ totalCount: 100, pageNumber: 6, hasPrev: true }));
        fixture.detectChanges();

        expect(qaAll(fixture, 'data-list-page').map(textOf)).toEqual(['1', '...', '5', '6', '7', '...', '10']);
    });

    it('стрелки просят страницу, только когда на неё есть куда идти', () => {
        const fixture: ComponentFixture<PaginationHostComponent> = setup();

        el(fixture, '[qa-dataid="data-list-page-prev"] [qa-dataid="icon-button-control"]')?.nativeElement.click();
        el(fixture, '[qa-dataid="data-list-page-next"] [qa-dataid="icon-button-control"]')?.nativeElement.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.asked).toEqual([{ pageNumber: 2 }]);
    });

    it('номер страницы просят нажатием и любой клавишей на нём, а разрыв не просит ничего', () => {
        const fixture: ComponentFixture<PaginationHostComponent> = setup(pageOf({ totalCount: 100, pageNumber: 6, hasPrev: true }));
        const items: HTMLElement[] = qaAll(fixture, 'data-list-page').map((node: { nativeElement: HTMLElement }) => node.nativeElement);

        items[0].click();
        items[1].click();
        items[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
        items[6].dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
        fixture.detectChanges();

        expect(fixture.componentInstance.asked).toEqual([{ pageNumber: 1 }, { pageNumber: 10 }]);
    });

    it('SC-UKV-312 — смена размера страницы держит человека на том же расстоянии от конца', () => {
        const page: IPageModel = pageOf({ totalCount: 100, pageNumber: 8, hasPrev: true });

        expect(dataListPageAfterSizeChange(page, 20)).toEqual({ pageNumber: 4, pageSize: 20 });
        expect(dataListPageAfterSizeChange(page, 50)).toEqual({ pageNumber: 2, pageSize: 50 });
    });

    it('размер страницы предлагают, пока его половина не больше числа записей', () => {
        const fixture: ComponentFixture<PaginationHostComponent> = setup(pageOf({ totalCount: 24, hasNext: true }));

        el(fixture, '[qa-dataid="data-list-page-size"] [qa-dataid="select-trigger"]')?.nativeElement.click();
        fixture.detectChanges();

        const options: HTMLElement[] = Array.from(document.querySelectorAll<HTMLElement>('[qa-dataid="select-option"]'));

        expect(options.map((option: HTMLElement) => option.textContent?.trim())).toEqual(['10', '20', '40']);
    });

    it('ряд номеров считается без рисования', () => {
        expect(dataListPageNumbers(pageOf({ totalCount: 100, pageNumber: 3, hasPrev: true }))).toEqual([1, 2, 3, 4, '...', 9, 10]);
        expect(dataListPageNumbers(pageOf({ totalCount: 100, pageNumber: 9, hasPrev: true }))).toEqual([1, 2, 3, '...', 8, 9, 10]);
        expect(dataListPageNumbers(pageOf({ totalCount: 100, pageNumber: 7, hasPrev: true }))).toEqual([1, '...', 6, 7, 8, 9, 10]);
    });
});
