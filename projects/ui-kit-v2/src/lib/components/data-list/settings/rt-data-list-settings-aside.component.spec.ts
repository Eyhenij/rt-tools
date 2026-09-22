import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, el, qaAll, textOf } from '../../../../testing/rt-kit-testing';
import { RtAsideRef } from '../../aside/rt-aside-ref';
import { RT_ASIDE_DATA } from '../../aside/rt-aside.tokens';
import { ERtDataTableColumnType, IRtDataTable } from '../../data-table/rt-data-table.model';
import { dataListColumnsFromItems, dataListSettingItems } from '../rt-data-list-settings.logic';
import { RtDataListSettingsAsideComponent } from './rt-data-list-settings-aside.component';

interface IEntity extends Record<string, unknown> {
    id: number;
    title: string;
    email: string;
}

function columnOf(propName: keyof IEntity, displayName: string, hidden: boolean = false): IRtDataTable.Column<IEntity> {
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
        expect(qaAll(fixture, 'table-settings-label').map(textOf)).toEqual(['Название', 'Почта']);
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

        el(fixture, '[qa-dataid="table-settings-toggle"] [qa-dataid="icon-button-control"]')?.nativeElement.click();
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
});
