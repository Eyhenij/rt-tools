import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, el, qaAll, textOf } from '../../../../testing/rt-kit-testing';
import { RtAsideRef } from '../../aside/rt-aside-ref';
import { RT_ASIDE_DATA } from '../../aside/rt-aside.tokens';
import { ERtDataTableColumnType, IRtDataTable } from '../../data-table/rt-data-table.model';
import { IRtTable } from '../../table/rt-table.model';
import { dataListColumnsFromItems, dataListMoveItem, dataListSettingItems, dataListToggleHidden } from '../rt-data-list-settings.logic';
import { RtDataListSettingsAsideComponent } from './rt-data-list-settings-aside.component';

interface IEntity extends Record<string, unknown> {
    id: number;
    title: string;
    email: string;
}

function columnOf(propName: Extract<keyof IEntity, string>, displayName: string, hidden: boolean = false): IRtDataTable.Column<IEntity> {
    return {
        align: 'left',
        propName,
        type: ERtDataTableColumnType.TEXT,
        copyable: false,
        header: { align: 'left', label: displayName },
        displayName,
        hidden,
    };
}

function configOf(): IRtDataTable.Config.Data<IEntity> {
    return {
        isVerticalScrollbarShown: false,
        isHorizontalScrollbarShown: true,
        columns: [columnOf('title', 'Название'), columnOf('email', 'Почта')],
    };
}

/** Двойник ручки панели: спека читает, с чем её закрыли. */
class AsideRefStub {
    public readonly closed: Array<IRtDataTable.Config.Data<IEntity> | undefined> = [];

    public close(result?: IRtDataTable.Config.Data<IEntity>): void {
        this.closed.push(result);
    }
}

let asideRef: AsideRefStub;

function setup(config: IRtDataTable.Config.Data<IEntity> = configOf()): ComponentFixture<RtDataListSettingsAsideComponent<IEntity>> {
    asideRef = new AsideRefStub();

    return createRtFixture<RtDataListSettingsAsideComponent<IEntity>>(
        RtDataListSettingsAsideComponent,
        {},
        {
            providers: [
                { provide: RtAsideRef, useValue: asideRef },
                { provide: RT_ASIDE_DATA, useValue: config },
            ],
        }
    );
}

function saveButton(fixture: ComponentFixture<RtDataListSettingsAsideComponent<IEntity>>): HTMLButtonElement {
    return el(fixture, '[qa-dataid="data-list-settings-save"]')?.nativeElement;
}

describe('RtDataListSettingsAsideComponent', () => {
    it('SC-UKV-268 — в панели стоят два признака полос прокрутки и список колонок', () => {
        const fixture: ComponentFixture<RtDataListSettingsAsideComponent<IEntity>> = setup();

        expect(el(fixture, '[qa-dataid="data-list-settings-vertical"]')).not.toBeNull();
        expect(el(fixture, '[qa-dataid="data-list-settings-horizontal"]')).not.toBeNull();
        expect(qaAll(fixture, 'data-list-settings-column-label').map(textOf)).toEqual(['Название', 'Почта']);
    });

    it('SC-UKV-306 — сохранение недоступно, пока в панели ничего не изменилось', () => {
        const fixture: ComponentFixture<RtDataListSettingsAsideComponent<IEntity>> = setup();

        expect(saveButton(fixture).disabled).toBe(true);

        el(fixture, '[qa-dataid="data-list-settings-vertical"] [qa-dataid="toggle-switch-control"]')?.nativeElement.click();
        fixture.detectChanges();

        expect(saveButton(fixture).disabled).toBe(false);
    });

    it('сохранение отдаёт настройку, а отмена не отдаёт ничего', () => {
        const fixture: ComponentFixture<RtDataListSettingsAsideComponent<IEntity>> = setup();

        el(fixture, '[qa-dataid="data-list-settings-toggle"] [qa-dataid="icon-button-control"]')?.nativeElement.click();
        fixture.detectChanges();
        saveButton(fixture).click();
        el(fixture, '[qa-dataid="data-list-settings-cancel"]')?.nativeElement.click();
        fixture.detectChanges();

        expect(asideRef.closed[0]?.columns.map((column: IRtDataTable.Column<IEntity>) => [column.propName, column.hidden])).toEqual([
            ['title', true],
            ['email', false],
        ]);
        expect(asideRef.closed[1]).toBeUndefined();
    });

    it('SC-UKV-307 — перестановка колонки в панели меняет порядок колонок таблицы', () => {
        const config: IRtDataTable.Config.Data<IEntity> = configOf();
        const moved: Array<IRtDataTable.Column<IEntity>> = dataListColumnsFromItems(
            config.columns,
            dataListSettingItems(config.columns).toReversed()
        );

        expect(moved.map((column: IRtDataTable.Column<IEntity>) => [column.propName, column.orderIndex])).toEqual([
            ['email', 0],
            ['title', 1],
        ]);
    });

    it('SC-UKV-352 — подпись стоит под заголовком, переключатель — слева от своей подписи', () => {
        const fixture: ComponentFixture<RtDataListSettingsAsideComponent<IEntity>> = setup();
        const host: HTMLElement = fixture.nativeElement;
        const header: Element | null = host.querySelector('rt-aside-header');
        const hint: Element | null = host.querySelector('[qa-dataid="data-list-settings-hint"]');
        const row: Element | null = host.querySelector('.rt-data-list-settings-aside__switch-row');

        const order: Array<Element | null> = Array.from(host.querySelectorAll('rt-aside-header, [qa-dataid="data-list-settings-hint"]'));

        expect(order).toEqual([header, hint]);
        expect(row?.firstElementChild?.getAttribute('qa-dataid')).toBe('data-list-settings-vertical');
    });

    it('SC-UKV-352 — у каждой колонки ручка, имя и глаз, скрытая помечена модификатором', () => {
        const fixture: ComponentFixture<RtDataListSettingsAsideComponent<IEntity>> = setup({
            ...configOf(),
            columns: [columnOf('title', 'Название'), columnOf('email', 'Почта', true)],
        });
        const rows: Array<HTMLElement> = Array.from(
            (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('[qa-dataid="data-list-settings-column"]')
        );

        expect(rows.map((row: HTMLElement) => row.querySelector('[qa-dataid="data-list-settings-drag"]') !== null)).toEqual([true, true]);
        expect(rows.map((row: HTMLElement) => row.classList.contains('rt-data-list-settings-aside__column--hidden'))).toEqual([
            false,
            true,
        ]);
    });

    it('перестановка и скрытие в панели — чистые функции, запертая колонка не скрывается', () => {
        const items: ReadonlyArray<IRtTable.ColumnSettingItem> = [
            { key: 'a', label: 'A', hidden: false },
            { key: 'b', label: 'B', hidden: false, locked: true },
            { key: 'c', label: 'C', hidden: false },
        ];

        expect(dataListMoveItem(items, 0, 2).map((item: IRtTable.ColumnSettingItem) => item.key)).toEqual(['b', 'c', 'a']);
        expect(dataListMoveItem(items, 1, 1)).toBe(items);
        expect(dataListToggleHidden(items, 'a')[0].hidden).toBe(true);
        expect(dataListToggleHidden(items, 'b')[1].hidden).toBe(false);
    });
});
