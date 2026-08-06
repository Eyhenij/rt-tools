import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { IPageModel } from '@rt-tools/utils';

import { createRtFixture, el, qa, qaAll, setInputs, textOf } from '../../../testing/rt-kit-testing';
import { RtPaginationComponent } from './rt-pagination.component';

function page(patch: Partial<IPageModel> = {}): IPageModel {
    return { pageNumber: 1, pageSize: 20, totalCount: 100, ...patch } as IPageModel;
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtPaginationComponent> {
    return createRtFixture(RtPaginationComponent, { pageModel: page(), ...inputs });
}

function pageButtons(fixture: ComponentFixture<RtPaginationComponent>): string[] {
    return qaAll(fixture, 'pagination-page').map((node: DebugElement): string => textOf(node));
}

function stripText(fixture: ComponentFixture<RtPaginationComponent>): string {
    return textOf(qa(fixture, 'pagination-nav')).replace(/\s+/g, ' ');
}

function arrow(fixture: ComponentFixture<RtPaginationComponent>, id: 'pagination-prev' | 'pagination-next'): HTMLButtonElement {
    return el(fixture, `[qa-dataid="${id}"] [qa-dataid="icon-button-control"]`)?.nativeElement as HTMLButtonElement;
}

describe('RtPaginationComponent', (): void => {
    describe('видимость', (): void => {
        it('прячется целиком, когда записей меньше самой мелкой страницы', (): void => {
            // Листать нечего, а полоса всё равно занимала бы строку под таблицей.
            const fixture: ComponentFixture<RtPaginationComponent> = setup({ pageModel: page({ totalCount: 5 }) });

            expect((fixture.nativeElement as HTMLElement).style.display).toBe('none');
        });

        it('показывается, когда записей больше', (): void => {
            expect((setup().nativeElement as HTMLElement).style.display).toBe('');
        });
    });

    describe('диапазон', (): void => {
        it('на первой странице считается с первой записи', (): void => {
            expect(textOf(qa(setup(), 'pagination-range'))).toBe('1–20 of 100');
        });

        it('на последней странице обрезается по числу записей', (): void => {
            const fixture: ComponentFixture<RtPaginationComponent> = setup({ pageModel: page({ pageNumber: 5, totalCount: 95 }) });

            expect(textOf(qa(fixture, 'pagination-range'))).toBe('81–95 of 95');
        });

        it('пустой набор не показывает бар вовсе — листать нечего', (): void => {
            // Проверять текст диапазона у пустого набора бессмысленно: бар при
            // нём спрятан целиком, и любое утверждение о его содержимом
            // говорило бы о том, чего пользователь не видит.
            const fixture: ComponentFixture<RtPaginationComponent> = setup({
                pageModel: page({ totalCount: 0 }),
                perPageOptions: [0, 20],
            });

            expect(fixture.componentInstance.isVisible()).toBe(false);
            expect((fixture.nativeElement as HTMLElement).style.display).toBe('none');
        });
    });

    describe('полоса номеров', (): void => {
        it('при одной странице номеров нет — листать нечего', (): void => {
            const fixture: ComponentFixture<RtPaginationComponent> = setup({
                pageModel: page({ totalCount: 15, pageSize: 20 }),
                perPageOptions: [10, 20],
            });

            expect(qa(fixture, 'pagination-nav')).toBeNull();
        });

        it('короткий список рисуется целиком', (): void => {
            const fixture: ComponentFixture<RtPaginationComponent> = setup({ pageModel: page({ totalCount: 60 }) });

            expect(pageButtons(fixture)).toEqual(['1', '2', '3']);
        });

        it('в середине длинного списка появляются разрывы с обеих сторон', (): void => {
            const fixture: ComponentFixture<RtPaginationComponent> = setup({
                pageModel: page({ pageNumber: 10, pageSize: 10, totalCount: 200 }),
            });

            expect(stripText(fixture)).toContain('1 … 9 10 11 … 20');
        });

        it('открытая страница помечена для скринридера', (): void => {
            const fixture: ComponentFixture<RtPaginationComponent> = setup({ pageModel: page({ pageNumber: 2, totalCount: 60 }) });
            const current: HTMLElement | undefined = qaAll(fixture, 'pagination-page')
                .map((node: DebugElement): HTMLElement => node.nativeElement as HTMLElement)
                .find((node: HTMLElement): boolean => node.getAttribute('aria-current') === 'page');

            expect(current?.textContent?.trim()).toBe('2');
        });
    });

    describe('переходы', (): void => {
        it('клик по номеру просит открыть страницу', (): void => {
            const fixture: ComponentFixture<RtPaginationComponent> = setup({ pageModel: page({ totalCount: 60 }) });
            const pages: number[] = [];
            fixture.componentInstance.pageChange.subscribe((value: number): void => {
                pages.push(value);
            });

            qaAll(fixture, 'pagination-page')[2].nativeElement.click();
            fixture.detectChanges();

            expect(pages).toEqual([3]);
        });

        it('клик по открытой странице событий не поднимает', (): void => {
            const fixture: ComponentFixture<RtPaginationComponent> = setup({ pageModel: page({ totalCount: 60 }) });
            const pages: jest.Mock = jest.fn();
            fixture.componentInstance.pageChange.subscribe(pages);

            qaAll(fixture, 'pagination-page')[0].nativeElement.click();
            fixture.detectChanges();

            expect(pages).not.toHaveBeenCalled();
        });

        it('на первой странице стрелка назад отключена, на последней — вперёд', (): void => {
            const first: ComponentFixture<RtPaginationComponent> = setup({ pageModel: page({ totalCount: 60 }) });
            expect(arrow(first, 'pagination-prev').disabled).toBe(true);
            expect(arrow(first, 'pagination-next').disabled).toBe(false);

            const last: ComponentFixture<RtPaginationComponent> = setup({ pageModel: page({ pageNumber: 3, totalCount: 60 }) });
            expect(arrow(last, 'pagination-prev').disabled).toBe(false);
            expect(arrow(last, 'pagination-next').disabled).toBe(true);
        });

        it('во время загрузки все переходы заблокированы', (): void => {
            // Иначе второй клик ушёл бы поверх ещё не пришедшего ответа.
            const fixture: ComponentFixture<RtPaginationComponent> = setup({ pageModel: page({ totalCount: 60 }), loading: true });
            const pages: jest.Mock = jest.fn();
            fixture.componentInstance.pageChange.subscribe(pages);

            qaAll(fixture, 'pagination-page')[1].nativeElement.click();
            fixture.detectChanges();

            expect(pages).not.toHaveBeenCalled();
            expect(arrow(fixture, 'pagination-next').disabled).toBe(true);
        });

        it('вызов за границы диапазона игнорируется', (): void => {
            const fixture: ComponentFixture<RtPaginationComponent> = setup({ pageModel: page({ totalCount: 60 }) });
            const pages: jest.Mock = jest.fn();
            fixture.componentInstance.pageChange.subscribe(pages);

            fixture.componentInstance.goTo(0);
            fixture.componentInstance.goTo(99);
            fixture.detectChanges();

            expect(pages).not.toHaveBeenCalled();
        });
    });

    describe('размер страницы', (): void => {
        it('варианты по умолчанию — 20, 50, 100', (): void => {
            const fixture: ComponentFixture<RtPaginationComponent> = setup();

            qa(fixture, 'pagination-per-page')?.nativeElement.querySelector('[qa-dataid="select-trigger"]').click();
            fixture.detectChanges();

            expect(
                Array.from(document.querySelectorAll('[qa-dataid="select-option"]')).map((n: Element): string => n.textContent.trim())
            ).toEqual(['20', '50', '100']);
        });

        it('выбор другого размера просит его сменить', (): void => {
            const fixture: ComponentFixture<RtPaginationComponent> = setup();
            const sizes: number[] = [];
            fixture.componentInstance.perPageChange.subscribe((value: number): void => {
                sizes.push(value);
            });

            qa(fixture, 'pagination-per-page')?.nativeElement.querySelector('[qa-dataid="select-trigger"]').click();
            fixture.detectChanges();
            (document.querySelectorAll('[qa-dataid="select-option"]')[1] as HTMLElement).click();
            fixture.detectChanges();

            expect(sizes).toEqual([50]);
        });

        it('выбор того же размера событий не поднимает', (): void => {
            const fixture: ComponentFixture<RtPaginationComponent> = setup();
            const sizes: jest.Mock = jest.fn();
            fixture.componentInstance.perPageChange.subscribe(sizes);

            qa(fixture, 'pagination-per-page')?.nativeElement.querySelector('[qa-dataid="select-trigger"]').click();
            fixture.detectChanges();
            (document.querySelectorAll('[qa-dataid="select-option"]')[0] as HTMLElement).click();
            fixture.detectChanges();

            expect(sizes).not.toHaveBeenCalled();
        });
    });

    it('узкая полоса рисуется рядом с широкой — какую показать, решают стили', (): void => {
        // Обе разметки живут в DOM одновременно: переключение между ними —
        // дело медиазапроса, а не условной отрисовки.
        const fixture: ComponentFixture<RtPaginationComponent> = setup({ pageModel: page({ totalCount: 60 }) });

        expect(qa(fixture, 'pagination-compact')).not.toBeNull();
        expect(qa(fixture, 'pagination-nav')).not.toBeNull();
        expect(textOf(qa(fixture, 'pagination-compact-label'))).toBe('Page 1 of 3');
    });

    it('смена страницы снаружи перерисовывает и диапазон, и полосу', (): void => {
        const fixture: ComponentFixture<RtPaginationComponent> = setup({ pageModel: page({ totalCount: 60 }) });

        setInputs(fixture, { pageModel: page({ pageNumber: 2, totalCount: 60 }) });
        fixture.detectChanges();

        expect(textOf(qa(fixture, 'pagination-range'))).toBe('21–40 of 60');
    });
});
