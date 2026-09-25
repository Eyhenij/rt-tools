import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { EListSortOrder, ISortModel, TNullable } from '@rt-tools/utils';

import { createRtFixture, qa, qaAll, textOf } from '../../../../testing/rt-kit-testing';
import { RtIconComponent } from '../../icon/rt-icon.component';
import { RtDataTableIconDirective } from '../rt-data-table-icon.directive';
import { ERtDataTableColumnType, IRtDataTable } from '../rt-data-table.model';
import { RtDataTableHeaderCellComponent } from './rt-data-table-header-cell.component';

interface IEntity extends Record<string, unknown> {
    id: number;
    title: string;
}

function columnOf(header: Partial<IRtDataTable.Header>): IRtDataTable.Column<IEntity> {
    return {
        align: 'left',
        propName: 'title',
        type: ERtDataTableColumnType.TEXT,
        copyable: false,
        header: { align: 'left', label: 'Название', ...header },
        sorting: { propertyName: 'title', sortDirection: EListSortOrder.ASC },
    };
}

@Component({
    selector: 'rt-data-table-header-cell-host',
    template: `
        <rt-data-table-header-cell
            [headerModel]="column().header"
            [sortModel]="column().sorting"
            [currentSortModel]="current()"
            [column]="column()"
            [iconTemplate]="withTemplate() ? iconTpl.template : null"
            (sortChange)="onSort($event)" />

        <ng-template #iconTpl="rtDataTableIcon" rtDataTableIcon let-name let-column="column">
            <b qa-dataid="own-icon">{{ name }}:{{ column.propName }}</b>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDataTableHeaderCellComponent, RtDataTableIconDirective],
})
class HeaderHostComponent {
    public readonly column: WritableSignal<IRtDataTable.Column<IEntity>> = signal(columnOf({}));
    public readonly current: WritableSignal<TNullable<ISortModel<string>>> = signal<TNullable<ISortModel<string>>>(null);
    public readonly withTemplate: WritableSignal<boolean> = signal(false);
    public readonly asked: ISortModel<string>[] = [];

    /** Приложение отвечает на просьбу порядка тем, что ставит его таблице. */
    public onSort(sort: ISortModel<string>): void {
        this.asked.push(sort);
        this.current.set(sort);
    }
}

function setup(header: Partial<IRtDataTable.Header> = {}, withTemplate: boolean = false): ComponentFixture<HeaderHostComponent> {
    const fixture: ComponentFixture<HeaderHostComponent> = createRtFixture(HeaderHostComponent, {}, { skipInitialDetect: true });

    fixture.componentInstance.column.set(columnOf(header));
    fixture.componentInstance.withTemplate.set(withTemplate);
    fixture.detectChanges();

    return fixture;
}

function press(fixture: ComponentFixture<HeaderHostComponent>): void {
    fixture.debugElement.query(By.directive(RtDataTableHeaderCellComponent)).nativeElement.click();
    fixture.detectChanges();
}

describe('RtDataTableHeaderCellComponent', () => {
    it('SC-UKV-302 — сортируемая шапка просит по возрастанию, затем по убыванию', () => {
        const fixture: ComponentFixture<HeaderHostComponent> = setup();

        press(fixture);
        press(fixture);

        expect(fixture.componentInstance.asked).toEqual([
            { propertyName: 'title', sortDirection: 'asc' },
            { propertyName: 'title', sortDirection: 'desc' },
        ]);
    });

    it('после убывания снова просит возрастание: снятия порядка нет', () => {
        const fixture: ComponentFixture<HeaderHostComponent> = setup();

        press(fixture);
        press(fixture);
        press(fixture);

        expect(fixture.componentInstance.asked.map((sort: ISortModel<string>) => sort.sortDirection)).toEqual(['asc', 'desc', 'asc']);
    });

    it('SC-UKV-318 — имя значка шапки первого кита рисует набор кита', () => {
        const fixture: ComponentFixture<HeaderHostComponent> = setup({ icon: { glyph: 'info', placement: 'left' } });

        expect(fixture.debugElement.query(By.directive(RtIconComponent)).componentInstance.name()).toBe('info-circle');
        expect(qa(fixture, 'data-table-header-prefix')).not.toBeNull();
    });

    it('SC-UKV-363 — значок колонки залит, пока объявление не скажет «контурный»', () => {
        const fillOf: (fixture: ComponentFixture<HeaderHostComponent>) => boolean = (
            fixture: ComponentFixture<HeaderHostComponent>
        ): boolean => fixture.debugElement.query(By.directive(RtIconComponent)).componentInstance.fill();

        expect(fillOf(setup({ icon: { glyph: 'info', placement: 'left' } }))).toBe(true);
        expect(fillOf(setup({ icon: { glyph: 'info', placement: 'left', outlined: true } }))).toBe(false);
    });

    it('SC-UKV-321 — шаблон значка рисует значок шапки и получает имя и колонку', () => {
        const fixture: ComponentFixture<HeaderHostComponent> = setup({ icon: { glyph: 'info', placement: 'right' } }, true);

        expect(qaAll(fixture, 'own-icon').map(textOf)).toEqual(['info:title']);
        expect(fixture.debugElement.query(By.directive(RtIconComponent))).toBeNull();
    });

    it('класс шапки из описания колонки стоит на блоке подписи, как в первом ките', () => {
        const fixture: ComponentFixture<HeaderHostComponent> = setup({ className: 'user-column' });
        const text: HTMLElement = qa(fixture, 'data-table-header-text').nativeElement;

        expect(text.classList).toContain('user-column');
        expect(text.classList).toContain('rt-data-table-header-cell__text');
    });
});
