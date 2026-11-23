import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { CMS_LIST_PAGE_HOST } from '../list-page.tokens';
import { IListPage, IListQuery } from '../list-query.model';
import { CmsListPageComponent, CmsListToolbarLeftDirective, CmsListToolbarRightDirective } from './cms-list-page.component';

/** A screen without a section: the frame needs only the contract, and the state is read and empty. */
const HOST: IListPage.Host = {
    store: {
        rows: signal<readonly unknown[]>([]),
        total: signal<number>(0),
        query: signal<IListQuery>({ pageNumber: 1, pageSize: 20, search: '' }),
        loading: signal<boolean>(false),
        loaded: signal<boolean>(true),
        setQuery: (): void => undefined,
        load: (): void => undefined,
    },
    reload: (): void => undefined,
    onPageChange: (): void => undefined,
    onPageSizeChange: (): void => undefined,
    onSearchChange: (): void => undefined,
};

@Component({
    selector: 'rt-cms-list-page-host',
    template: `
        <rt-cms-list-page title="Записи" qaPrefix="items" searchPlaceholder="Поиск">
            <ng-template rtCmsListToolbarLeft><span qa-dataid="probe-status">статус</span></ng-template>
            <ng-template rtCmsListToolbarLeft><span qa-dataid="probe-locale">язык</span></ng-template>
            <ng-template rtCmsListToolbarRight><span qa-dataid="probe-create">создать</span></ng-template>
        </rt-cms-list-page>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CmsListPageComponent, CmsListToolbarLeftDirective, CmsListToolbarRightDirective],
    providers: [{ provide: CMS_LIST_PAGE_HOST, useValue: HOST }],
})
class ListPageHostComponent {}

/** The anchors of a bar side in document order. */
function order(side: string, anchors: string[]): (string | null)[] {
    const bar: Element | null = document.querySelector(`[qa-dataid="toolbar-bar"][data-slot="${side}"]`);
    const nodes: Element[] = Array.from(
        bar?.querySelectorAll(anchors.map((anchor: string): string => `[qa-dataid="${anchor}"]`).join(', ')) ?? []
    );

    return nodes.map((node: Element): string | null => node.getAttribute('qa-dataid'));
}

describe('CmsListPageComponent — the bar takes templates', (): void => {
    it('SC-CMS-81 — both filters stand before the search in the order written, the action before the reload', (): void => {
        TestBed.configureTestingModule({
            imports: [ListPageHostComponent],
            providers: [provideHttpClient(), provideHttpClientTesting()],
        });
        const fixture: ComponentFixture<ListPageHostComponent> = TestBed.createComponent(ListPageHostComponent);
        fixture.detectChanges();

        expect([order('left', ['probe-status', 'probe-locale', 'items-search']), order('right', ['probe-create', 'items-reload'])]).toEqual(
            [
                ['probe-status', 'probe-locale', 'items-search'],
                ['probe-create', 'items-reload'],
            ]
        );
    });
});
