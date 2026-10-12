import { ChangeDetectionStrategy, Component, DebugElement, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { IRtIcon } from '../icon/rt-icon.model';

import { RtIconComponent } from '../icon/rt-icon.component';
import { classesOf, createRtFixture, el, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { RtThreadListRowActionsDirective, RtThreadListRowDirective } from './rt-thread-list.directives';
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
            [emptyPreviewIcons]="previewIcons()"
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
    public readonly activeId: WritableSignal<IRtThreadList.TRowId | null> = signal<IRtThreadList.TRowId | null>(null);
    public readonly loading: WritableSignal<boolean> = signal<boolean>(false);
    public readonly fetching: WritableSignal<boolean> = signal<boolean>(false);
    public readonly hasMore: WritableSignal<boolean> = signal<boolean>(false);
    public readonly previewIcons: WritableSignal<readonly IRtIcon.Name[]> = signal<readonly IRtIcon.Name[]>(['user', 'users', 'user']);
    public selected: IRtThreadList.TRowId | null = null;
    public openedInTab: IRtThreadList.TRowId | null = null;
    public loadMoreCount: number = 0;
}

@Component({
    selector: 'rt-thread-list-actions-host',
    template: `
        <rt-thread-list [rows]="rows" (selectRow)="selected = $event">
            <ng-template rtThreadListRow let-row>
                <span>{{ row.title }}</span>
            </ng-template>
            <ng-template let-row [rtThreadListRowActions]="rows">
                <button qa-dataid="row-delete" type="button" (click)="deleted = row.id">x</button>
            </ng-template>
        </rt-thread-list>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtThreadListComponent, RtThreadListRowDirective, RtThreadListRowActionsDirective],
})
class RowActionsHostComponent {
    public readonly rows: ReadonlyArray<IThread> = ROWS;
    public selected: IRtThreadList.TRowId | null = null;
    public deleted: IRtThreadList.TRowId | null = null;
}

@Component({
    selector: 'rt-thread-list-default-preview-host',
    template: `
        <rt-thread-list [rows]="[]" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtThreadListComponent],
})
class DefaultPreviewHostComponent {}

function setup(): ComponentFixture<ThreadListHostComponent> {
    return createRtFixture(ThreadListHostComponent, {}, { skipInitialDetect: true });
}

function render(fixture: ComponentFixture<ThreadListHostComponent>): ComponentFixture<ThreadListHostComponent> {
    fixture.detectChanges();
    return fixture;
}

function previewCards<T>(fixture: ComponentFixture<T>): { icon: IRtIcon.Name | null; offset: boolean }[] {
    return fixture.debugElement
        .queryAll(By.css('.rt-thread-list__empty-card'))
        .map((card: DebugElement): { icon: IRtIcon.Name | null; offset: boolean } => ({
            icon: (card.query(By.directive(RtIconComponent)).componentInstance as RtIconComponent).name(),
            offset: classesOf(card.nativeElement as HTMLElement).includes('rt-thread-list__empty-card--offset'),
        }));
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

        it('строковый номер строки доходит наружу как есть', (): void => {
            // Записи домена не всегда нумеруются числом: у переписки чата ключ строковый,
            // и приведение его к числу потеряло бы саму строку.
            const fixture: ComponentFixture<ThreadListHostComponent> = setup();

            fixture.componentInstance.rows.set([{ id: 'talk-1', hasUnread: false, title: 'Переписка' }]);
            render(fixture);
            rows(fixture)[0].click();
            fixture.detectChanges();

            expect(fixture.componentInstance.selected).toBe('talk-1');
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

    describe('строки-превью пустого состояния', (): void => {
        it('SC-UKV-775 — по умолчанию строки с людьми, средняя сдвинута', (): void => {
            const fixture: ComponentFixture<DefaultPreviewHostComponent> = createRtFixture(DefaultPreviewHostComponent);

            expect(qaAll(fixture, 'thread-list-empty').length).toBe(1);
            expect(previewCards(fixture)).toEqual([
                { icon: 'user', offset: false },
                { icon: 'users', offset: true },
                { icon: 'user', offset: false },
            ]);
        });

        it('SC-UKV-775 — заданные значки рисуют по строке на значок, каждая вторая сдвинута', (): void => {
            const fixture: ComponentFixture<ThreadListHostComponent> = setup();
            fixture.componentInstance.rows.set([]);
            fixture.componentInstance.previewIcons.set(['sparkle', 'bot', 'sparkle', 'bot']);
            render(fixture);

            expect(previewCards(fixture)).toEqual([
                { icon: 'sparkle', offset: false },
                { icon: 'bot', offset: true },
                { icon: 'sparkle', offset: false },
                { icon: 'bot', offset: true },
            ]);
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

    describe('действия строки', (): void => {
        it('без шаблона действий строка стоит без обёртки', (): void => {
            const fixture: ComponentFixture<ThreadListHostComponent> = render(setup());

            expect(qa(fixture, 'thread-list-row-wrap')).toBeNull();
        });

        it('действия стоят рядом с кнопкой строки, не внутри неё, и их нажатие строку не выбирает', (): void => {
            const fixture: ComponentFixture<RowActionsHostComponent> = createRtFixture(RowActionsHostComponent);
            const actions: DebugElement[] = qaAll(fixture, 'row-delete');

            expect(actions).toHaveLength(2);
            expect((actions[0].nativeElement as HTMLElement).closest('button.rt-thread-list__row')).toBeNull();

            (actions[1].nativeElement as HTMLButtonElement).click();

            expect(fixture.componentInstance.deleted).toBe(2);
            expect(fixture.componentInstance.selected).toBeNull();
        });
    });
});
