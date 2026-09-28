import { ChangeDetectionStrategy, Component, signal, Signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { IPageModel } from '@rt-tools/utils';

import { provideRtKitLabels, TRtKitLabelKey, TRtKitTranslator } from '../../i18n';
import { createRtFixture, el, qa, setInputs, textOf } from '../../../testing/rt-kit-testing';
import { RtDynamicListComponent } from './rt-dynamic-list.component';
import { RtDynamicListToolbarActionsDirective, RtDynamicListToolbarSelectorsDirective } from './rt-dynamic-list.directives';

/** Одна страница из трёх записей: ряда номеров под таким списком не рисуют. */
const ONE_PAGE: IPageModel = { pageNumber: 1, pageSize: 20, totalCount: 3 };

/** Три страницы: ряд номеров нужен. */
const THREE_PAGES: IPageModel = { pageNumber: 1, pageSize: 20, totalCount: 55 };

/** Всё легло на одну страницу крупного размера, но записей больше наименьшего размера страницы. */
const ONE_LARGE_PAGE: IPageModel = { pageNumber: 1, pageSize: 50, totalCount: 30 };

/** Стили семьи: ярусы вертушки и области записей jsdom не считает, их читают из источника. */
const STYLES: string = readFileSync(join(__dirname, 'rt-dynamic-list.component.scss'), 'utf8');

/** Объявления одного элемента блока — от его открывающей скобки до первой закрывающей. */
function rulesOf(element: string): string {
    const start: number = STYLES.indexOf(`&__${element} {`);

    return start < 0 ? '' : STYLES.slice(start, STYLES.indexOf('}', start));
}

/** Ожидание поиска кита с запасом: оператор один на кит, и его задержка тут не переписывается. */
const SEARCH_SETTLE_MS: number = 1000;

/** Хозяин с проекцией и обеими сторонами панели: части включаются сигналами, как у потребителя. */
@Component({
    selector: 'rt-dynamic-list-host',
    template: `
        <rt-dynamic-list>
            @if (hasSelectors()) {
                <ng-container *rtDynamicListSelectors><span>свой отбор</span></ng-container>
            }
            @if (hasActions()) {
                <ng-container *rtDynamicListActions><span>своё действие</span></ng-container>
            }
            <span qa-dataid="host-table">таблица потребителя</span>
        </rt-dynamic-list>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDynamicListComponent, RtDynamicListToolbarSelectorsDirective, RtDynamicListToolbarActionsDirective],
})
class DynamicListHostComponent {
    public readonly hasSelectors: WritableSignal<boolean> = signal(true);
    public readonly hasActions: WritableSignal<boolean> = signal(true);
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtDynamicListComponent> {
    return createRtFixture(RtDynamicListComponent, inputs);
}

function searchInput(fixture: ComponentFixture<unknown>): HTMLInputElement {
    return el(fixture, 'input')?.nativeElement as HTMLInputElement;
}

function buttonOf(fixture: ComponentFixture<unknown>, id: string): HTMLButtonElement | null {
    return (qa(fixture, id)?.nativeElement as HTMLElement | undefined)?.querySelector('button') ?? null;
}

describe('RtDynamicListComponent', (): void => {
    describe('панель инструментов', (): void => {
        it('SC-UKV-165 — в панели стоят только заказанные действия', (): void => {
            const fixture: ComponentFixture<RtDynamicListComponent> = setup({
                showRefresh: false,
                showColumnSettings: false,
                showClearFilters: true,
            });

            expect(qa(fixture, 'dynamic-list-refresh')).toBeNull();
            expect(qa(fixture, 'dynamic-list-column-settings')).toBeNull();
            expect(qa(fixture, 'dynamic-list-clear-filters')).not.toBeNull();
        });

        it('SC-UKV-166 — сброс отбора выключен, пока сбрасывать нечего', (): void => {
            const fixture: ComponentFixture<RtDynamicListComponent> = setup({ showClearFilters: true, filtered: false });

            expect(buttonOf(fixture, 'dynamic-list-clear-filters')?.disabled).toBe(true);

            setInputs(fixture, { filtered: true });
            fixture.detectChanges();

            expect(buttonOf(fixture, 'dynamic-list-clear-filters')?.disabled).toBe(false);
        });

        it('SC-UKV-167 — поиск говорит о смене один раз, когда значение устоялось', (): void => {
            jest.useFakeTimers();

            const fixture: ComponentFixture<RtDynamicListComponent> = setup({});
            const heard: string[] = [];

            fixture.componentInstance.searchChange.subscribe((value: string): void => {
                heard.push(value);
            });

            const input: HTMLInputElement = el(fixture, 'input')?.nativeElement as HTMLInputElement;

            ['с', 'ст', 'сте'].forEach((value: string): void => {
                input.value = value;
                input.dispatchEvent(new Event('input'));
            });

            jest.advanceTimersByTime(SEARCH_SETTLE_MS);
            fixture.detectChanges();
            jest.useRealTimers();

            expect(heard).toEqual(['сте']);
        });

        it('поиск потребителя ставится в поле при каждой смене и эхом ему не возвращается', (): void => {
            jest.useFakeTimers();

            const fixture: ComponentFixture<RtDynamicListComponent> = setup({ searchTerm: 'стенд' });
            const heard: string[] = [];

            fixture.componentInstance.searchChange.subscribe((value: string): void => {
                heard.push(value);
            });

            expect(searchInput(fixture).value).toBe('стенд');

            setInputs(fixture, { searchTerm: 'заказ' });
            fixture.detectChanges();

            expect(searchInput(fixture).value).toBe('заказ');

            setInputs(fixture, { searchTerm: '' });
            fixture.detectChanges();
            jest.advanceTimersByTime(SEARCH_SETTLE_MS);
            jest.useRealTimers();

            expect(searchInput(fixture).value).toBe('');
            expect(heard).toEqual([]);
        });

        it('сброс отбора очищает поле поиска и сообщает потребителю пустой поиск', (): void => {
            jest.useFakeTimers();

            const fixture: ComponentFixture<RtDynamicListComponent> = setup({ showClearFilters: true, filtered: true });
            const heard: string[] = [];
            let cleared: number = 0;

            fixture.componentInstance.searchChange.subscribe((value: string): void => {
                heard.push(value);
            });
            fixture.componentInstance.filtersCleared.subscribe((): void => {
                cleared += 1;
            });

            searchInput(fixture).value = 'стенд';
            searchInput(fixture).dispatchEvent(new Event('input'));
            jest.advanceTimersByTime(SEARCH_SETTLE_MS);

            buttonOf(fixture, 'dynamic-list-clear-filters')?.click();
            fixture.detectChanges();
            jest.advanceTimersByTime(SEARCH_SETTLE_MS);
            jest.useRealTimers();

            expect(searchInput(fixture).value).toBe('');
            expect(heard).toEqual(['стенд', '']);
            expect(cleared).toBe(1);
        });
    });

    describe('пустое место', (): void => {
        it('SC-UKV-168 — пустой раздел показан без дороги назад', (): void => {
            const fixture: ComponentFixture<RtDynamicListComponent> = setup({ empty: true, filtered: false });

            expect(qa(fixture, 'dynamic-list-empty')).not.toBeNull();
            expect(qa(fixture, 'dynamic-list-empty-clear')).toBeNull();
        });

        it('SC-UKV-169 — пустой ответ под отбором показывает дорогу назад', (): void => {
            const fixture: ComponentFixture<RtDynamicListComponent> = setup({ empty: true, filtered: true });

            expect(qa(fixture, 'dynamic-list-empty-clear')).not.toBeNull();
        });
    });

    describe('страницы', (): void => {
        it('SC-UKV-170 — под списком не длиннее наименьшего размера страницы ряда номеров нет', (): void => {
            const fixture: ComponentFixture<RtDynamicListComponent> = setup({ pageModel: ONE_PAGE });

            expect(qa(fixture, 'dynamic-list-pagination')).toBeNull();

            setInputs(fixture, { pageModel: THREE_PAGES });
            fixture.detectChanges();

            expect(qa(fixture, 'dynamic-list-pagination')).not.toBeNull();
        });

        it('выбравший крупный размер страницы, при котором всё легло на одну, видит полосу и может вернуть размер поменьше', (): void => {
            const fixture: ComponentFixture<RtDynamicListComponent> = setup({ pageModel: ONE_LARGE_PAGE });

            expect(qa(fixture, 'dynamic-list-pagination')).not.toBeNull();
            expect((qa(fixture, 'dynamic-list-pagination')?.nativeElement as HTMLElement).style.display).not.toBe('none');
        });
    });

    describe('выбор', (): void => {
        it('флажок «выбрать все» остаётся на месте, когда выбрано что-то, и рядом с ним стоит счётчик', (): void => {
            const fixture: ComponentFixture<RtDynamicListComponent> = setup({ selectable: true, selectedCount: 0 });

            expect(qa(fixture, 'dynamic-list-select-all')).not.toBeNull();
            expect(qa(fixture, 'dynamic-list-selected-count')).toBeNull();

            setInputs(fixture, { selectedCount: 2, someSelected: true });
            fixture.detectChanges();

            expect(qa(fixture, 'dynamic-list-select-all')).not.toBeNull();
            expect(textOf(qa(fixture, 'dynamic-list-selected-count'))).toContain('2');
        });
    });

    describe('подгрузка', (): void => {
        it('вертушка подгрузки стоит над областью записей: та замкнута в свой ярус и шапку таблицы над вертушкой не поднимает', (): void => {
            expect(rulesOf('veil')).toContain('z-index: 1;');
            expect(rulesOf('content')).toContain('isolation: isolate;');
        });
    });

    describe('разметка потребителя', (): void => {
        it('SC-UKV-171 — обе стороны панели заняты, поле поиска остаётся на месте', (): void => {
            const fixture: ComponentFixture<DynamicListHostComponent> = createRtFixture(DynamicListHostComponent);
            const left: HTMLElement = qa(fixture, 'dynamic-list-selectors')?.nativeElement as HTMLElement;
            const right: HTMLElement = qa(fixture, 'dynamic-list-right')?.nativeElement as HTMLElement;

            expect(left.textContent).toContain('свой отбор');
            expect(right.textContent).toContain('своё действие');
            expect(qa(fixture, 'dynamic-list-search')).not.toBeNull();
        });

        it('SC-UKV-172 — таблица потребителя проецируется как есть', (): void => {
            const fixture: ComponentFixture<DynamicListHostComponent> = createRtFixture(DynamicListHostComponent);
            const content: HTMLElement = qa(fixture, 'dynamic-list-content')?.nativeElement as HTMLElement;

            expect(textOf(qa(fixture, 'host-table'))).toBe('таблица потребителя');
            expect(content.contains(qa(fixture, 'host-table')?.nativeElement as HTMLElement)).toBe(true);
        });
    });

    describe('подписи', (): void => {
        it('SC-UKV-173 — подписи берутся из словаря кита', (): void => {
            const translator: Signal<TRtKitTranslator> = signal<TRtKitTranslator>((key: TRtKitLabelKey): string => {
                if (key === 'uiRefresh') {
                    return 'Освежить';
                }

                return key === 'uiSearch' ? 'Найти' : '';
            });
            const fixture: ComponentFixture<RtDynamicListComponent> = createRtFixture(
                RtDynamicListComponent,
                { showRefresh: true },
                { providers: [provideRtKitLabels({ translator })] }
            );
            const input: HTMLInputElement = el(fixture, 'input')?.nativeElement as HTMLInputElement;

            expect(buttonOf(fixture, 'dynamic-list-refresh')?.getAttribute('aria-label')).toBe('Освежить');
            expect(input.placeholder).toBe('Найти');
        });
    });
});
