import { ChangeDetectionStrategy, Component, DebugElement, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture, el, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { RtThreadListRowDirective } from './rt-thread-list.directives';
import { IRtThreadList } from './rt-thread-list.model';
import { RtThreadListComponent } from './rt-thread-list.component';

interface IThread extends IRtThreadList.Row {
    readonly title: string;
}

const ROWS: ReadonlyArray<IThread> = [
    { id: 1, hasUnread: true, title: 'Заявка №1' },
    { id: 2, hasUnread: false, overdue: true, title: 'Заявка №2' },
];

/** Строку рисует шаблон потребителя — без host-обёртки списка не бывает. */
@Component({
    selector: 'rt-thread-list-host',
    template: `
        <rt-thread-list
            [rows]="rows()"
            [activeId]="activeId()"
            [loading]="loading()"
            [fetching]="fetching()"
            [hasMore]="hasMore()"
            (selectRow)="selected = $event"
            (openInNewTab)="openedInTab = $event"
            (loadMore)="loadMoreCount = loadMoreCount + 1">
            <ng-template rtThreadListRow let-row>
                <span qa-dataid="row-title">{{ row.title }}</span>
            </ng-template>
        </rt-thread-list>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtThreadListComponent, RtThreadListRowDirective],
})
class ThreadListHostComponent {
    public readonly rows: WritableSignal<ReadonlyArray<IThread>> = signal<ReadonlyArray<IThread>>(ROWS);
    public readonly activeId: WritableSignal<number | null> = signal<number | null>(null);
    public readonly loading: WritableSignal<boolean> = signal<boolean>(false);
    public readonly fetching: WritableSignal<boolean> = signal<boolean>(false);
    public readonly hasMore: WritableSignal<boolean> = signal<boolean>(false);
    public selected: number | null = null;
    public openedInTab: number | null = null;
    public loadMoreCount: number = 0;
}

function setup(): ComponentFixture<ThreadListHostComponent> {
    return createRtFixture(ThreadListHostComponent, {}, { skipInitialDetect: true });
}

function render(fixture: ComponentFixture<ThreadListHostComponent>): ComponentFixture<ThreadListHostComponent> {
    fixture.detectChanges();
    return fixture;
}

function rows(fixture: ComponentFixture<ThreadListHostComponent>): HTMLButtonElement[] {
    return qaAll(fixture, 'thread-list-row').map((node: DebugElement): HTMLButtonElement => node.nativeElement as HTMLButtonElement);
}

describe('RtThreadListComponent', (): void => {
    it('строку рисует шаблон потребителя — список знает только идентификатор и признаки', (): void => {
        const fixture: ComponentFixture<ThreadListHostComponent> = render(setup());

        expect(qaAll(fixture, 'row-title').map((node: DebugElement): string => textOf(node))).toEqual(['Заявка №1', 'Заявка №2']);
    });

    it('строка — настоящая кнопка с идентификатором в атрибуте данных', (): void => {
        const fixture: ComponentFixture<ThreadListHostComponent> = render(setup());

        expect(rows(fixture)[0].tagName).toBe('BUTTON');
        expect(rows(fixture)[0].getAttribute('data-id')).toBe('1');
    });

    describe('состояния строки', (): void => {
        it('непрочитанная и просроченная помечаются модификаторами', (): void => {
            const fixture: ComponentFixture<ThreadListHostComponent> = render(setup());

            expect(classesOf(rows(fixture)[0])).toContain('rt-thread-list__row--unread');
            expect(classesOf(rows(fixture)[1])).toContain('rt-thread-list__row--overdue');
        });

        it('открытая строка помечается и для стилей, и для скринридера', (): void => {
            const fixture: ComponentFixture<ThreadListHostComponent> = setup();
            fixture.componentInstance.activeId.set(2);
            render(fixture);

            expect(classesOf(rows(fixture)[1])).toContain('rt-thread-list__row--active');
            expect(rows(fixture)[1].getAttribute('aria-current')).toBe('true');
        });
    });

    describe('выбор строки', (): void => {
        it('обычный клик открывает строку', (): void => {
            const fixture: ComponentFixture<ThreadListHostComponent> = render(setup());

            rows(fixture)[1].click();
            fixture.detectChanges();

            expect(fixture.componentInstance.selected).toBe(2);
        });

        it('клик с Ctrl просит открыть в новой вкладке, а не выбрать', (): void => {
            // Список — это навигация: привычка «Ctrl+клик открывает рядом»
            // должна работать и здесь.
            const fixture: ComponentFixture<ThreadListHostComponent> = render(setup());

            rows(fixture)[0].dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
            fixture.detectChanges();

            expect(fixture.componentInstance.openedInTab).toBe(1);
            expect(fixture.componentInstance.selected).toBeNull();
        });
    });

    describe('пустые состояния', (): void => {
        it('первая загрузка рисует заглушки строк', (): void => {
            const fixture: ComponentFixture<ThreadListHostComponent> = setup();
            fixture.componentInstance.rows.set([]);
            fixture.componentInstance.loading.set(true);
            render(fixture);

            expect(qaAll(fixture, 'thread-list-row-skeleton').length).toBe(6);
        });

        it('загрузка поверх уже показанных строк заглушками их не подменяет', (): void => {
            // Иначе список мигал бы при каждом обновлении фильтра.
            const fixture: ComponentFixture<ThreadListHostComponent> = setup();
            fixture.componentInstance.loading.set(true);
            render(fixture);

            expect(qaAll(fixture, 'thread-list-row-skeleton').length).toBe(0);
            expect(rows(fixture).length).toBe(2);
        });

        it('пустой ответ рисует заглушку с переведённым заголовком', (): void => {
            const fixture: ComponentFixture<ThreadListHostComponent> = setup();
            fixture.componentInstance.rows.set([]);
            render(fixture);

            expect(qa(fixture, 'thread-list-empty')).not.toBeNull();
            expect(textOf(qa(fixture, 'empty-state-title'))).toBe('Nothing found');
        });
    });

    describe('догрузка', (): void => {
        it('якорь появляется, только когда есть что грузить', (): void => {
            const fixture: ComponentFixture<ThreadListHostComponent> = render(setup());
            expect(qa(fixture, 'thread-list-load-more')).toBeNull();

            fixture.componentInstance.hasMore.set(true);
            fixture.detectChanges();
            expect(qa(fixture, 'thread-list-load-more')).not.toBeNull();
        });

        it('догрузка рисует полосу-заглушку под списком', (): void => {
            const fixture: ComponentFixture<ThreadListHostComponent> = setup();
            fixture.componentInstance.fetching.set(true);
            render(fixture);

            expect(qa(fixture, 'thread-list-row-loader')).not.toBeNull();
        });
    });

    it('поиск рисуется полем с иконкой и переведённой подсказкой', (): void => {
        const fixture: ComponentFixture<ThreadListHostComponent> = render(setup());

        expect((qa(fixture, 'input-control')?.nativeElement as HTMLInputElement).placeholder).toBe('Search');
        expect(el(fixture, '.rt-input__icon-left')).not.toBeNull();
    });

    it('без шаблона фильтров кнопки фильтров нет', (): void => {
        expect(qa(render(setup()), 'thread-list-filter')).toBeNull();
    });
});
