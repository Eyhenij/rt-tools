import { ChangeDetectionStrategy, Component, DebugElement, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { IPageModel } from '@rt-tools/utils';

import { createRtFixture, el, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { RtDataTableConfigService } from '../data-table/rt-data-table-config.service';
import { ERtDataTableColumnType, IRtDataTable } from '../data-table/rt-data-table.model';
import { RtDataListComponent } from './rt-data-list.component';

interface IEntity extends Record<string, unknown> {
    id: number;
    title: string;
}

const COLUMNS: Array<IRtDataTable.Column<IEntity>> = [
    { align: 'left', propName: 'title', type: ERtDataTableColumnType.TEXT, copyable: false, header: { align: 'left', label: 'Название' } },
];

/** Двойник службы настроек: полосе страниц состав колонок не важен. */
const CONFIG_STUB: { tableConfig: WritableSignal<IRtDataTable.Config.Data<IEntity>>; updateConfig: () => void } = {
    tableConfig: signal<IRtDataTable.Config.Data<IEntity>>({
        isVerticalScrollbarShown: false,
        isHorizontalScrollbarShown: true,
        columns: COLUMNS,
    }),
    updateConfig: (): void => undefined,
};

function pageOf(patch: Partial<IPageModel>): IPageModel {
    return { pageNumber: 1, pageSize: 10, totalCount: 100, hasPrev: false, hasNext: true, ...patch };
}

@Component({
    selector: 'rt-test-data-list-pages-host',
    template: `
        <rt-data-list
            tableConfigStorageKey="pages"
            [look]="look()"
            [entities]="rows"
            [pageModel]="page()"
            [currentSortModel]="null"
            (pageModelChange)="asked.push($event)" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDataListComponent],
    providers: [{ provide: RtDataTableConfigService, useValue: CONFIG_STUB }],
})
class PagesHostComponent {
    public readonly rows: IEntity[] = [{ id: 1, title: 'Анна' }];
    public readonly page: WritableSignal<IPageModel> = signal(pageOf({}));
    public readonly look: WritableSignal<IRtDataTable.Look> = signal<IRtDataTable.Look>('material');
    public readonly asked: Array<Partial<IPageModel>> = [];
}

async function setup(page: IPageModel, look: IRtDataTable.Look = 'material'): Promise<ComponentFixture<PagesHostComponent>> {
    const fixture: ComponentFixture<PagesHostComponent> = createRtFixture(PagesHostComponent, {}, { skipInitialDetect: true });

    fixture.componentInstance.page.set(page);
    fixture.componentInstance.look.set(look);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return fixture;
}

/** Полоса кита прячет себя стилем хоста, а не убирает разметку. */
function stripShown(fixture: ComponentFixture<PagesHostComponent>): boolean {
    return (el(fixture, 'rt-pagination')?.nativeElement as HTMLElement).style.display !== 'none';
}

/** Открывает выбор размера страницы и отдаёт подписи предложенных размеров. */
function openPageSizes(fixture: ComponentFixture<PagesHostComponent>): HTMLElement[] {
    el(fixture, '[qa-dataid="pagination-per-page"] [qa-dataid="select-trigger"]')?.nativeElement.click();
    fixture.detectChanges();

    return Array.from(document.querySelectorAll<HTMLElement>('[qa-dataid="select-option"]'));
}

describe('RtDataListComponent — полоса страниц', () => {
    it('SC-UKV-311 — список рисует полосу кита и прячет её, пока все записи помещаются на самую маленькую страницу', async (): Promise<void> => {
        const fixture: ComponentFixture<PagesHostComponent> = await setup(pageOf({ totalCount: 8, hasNext: false }));

        expect(el(fixture, 'rt-pagination')).not.toBeNull();
        expect(stripShown(fixture)).toBe(false);

        fixture.componentInstance.page.set(pageOf({ totalCount: 11 }));
        fixture.detectChanges();

        expect(stripShown(fixture)).toBe(true);
    });

    it('SC-UKV-312 — смена размера страницы держит человека на том же расстоянии от конца', async (): Promise<void> => {
        const fixture: ComponentFixture<PagesHostComponent> = await setup(pageOf({ pageNumber: 8, hasPrev: true }));

        openPageSizes(fixture)
            .find((option: HTMLElement): boolean => option.textContent?.trim() === '20')
            ?.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.asked).toEqual([{ pageNumber: 4, pageSize: 20 }]);
    });

    it('размер страницы предлагают, пока его половина не больше числа записей', async (): Promise<void> => {
        const fixture: ComponentFixture<PagesHostComponent> = await setup(pageOf({ totalCount: 24 }));

        expect(openPageSizes(fixture).map((option: HTMLElement): string => option.textContent?.trim() ?? '')).toEqual(['10', '20', '40']);
    });

    it('номер страницы просит свою страницу, а нынешний не просит ничего', async (): Promise<void> => {
        const fixture: ComponentFixture<PagesHostComponent> = await setup(pageOf({ pageNumber: 5, hasPrev: true }));
        const pages: DebugElement[] = qaAll(fixture, 'pagination-page');

        expect(pages.map((page: DebugElement): string => textOf(page))).toEqual(['1', '4', '5', '6', '10']);

        pages[2].nativeElement.click();
        pages[3].nativeElement.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.asked).toEqual([{ pageNumber: 6 }]);
    });

    it('вид первого кита рисует стрелки, свой вид — шевроны', async (): Promise<void> => {
        const material: ComponentFixture<PagesHostComponent> = await setup(pageOf({ pageNumber: 2, hasPrev: true }));

        expect(qa(material, 'pagination-prev')?.componentInstance.icon()).toBe('arrow-left');
        expect(qa(material, 'pagination-next')?.componentInstance.icon()).toBe('arrow-right');

        const own: ComponentFixture<PagesHostComponent> = await setup(pageOf({ pageNumber: 2, hasPrev: true }), 'own');

        expect(qa(own, 'pagination-prev')?.componentInstance.icon()).toBe('chevron-left');
    });
});
