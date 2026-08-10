import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture, qa, qaAll, textOf } from '../../../../testing/rt-kit-testing';
import { IRtTable } from '../rt-table.model';
import { RtTableSettingsPanelComponent } from './rt-table-settings-panel.component';

const ITEMS: ReadonlyArray<IRtTable.ColumnSettingItem> = [
    { key: 'title', label: 'Договор', locked: true, hidden: false },
    { key: 'city', label: 'Город', hidden: false },
    { key: 'manager', label: 'Менеджер', hidden: true },
];

function setup(): ComponentFixture<RtTableSettingsPanelComponent> {
    return createRtFixture(RtTableSettingsPanelComponent, { items: ITEMS });
}

function rows(fixture: ComponentFixture<RtTableSettingsPanelComponent>): HTMLElement[] {
    return qaAll(fixture, 'table-settings-row').map((node: DebugElement): HTMLElement => node.nativeElement as HTMLElement);
}

function rowOf(fixture: ComponentFixture<RtTableSettingsPanelComponent>, key: string): HTMLElement {
    return rows(fixture).find((node: HTMLElement): boolean => node.getAttribute('data-key') === key) as HTMLElement;
}

describe('RtTableSettingsPanelComponent', (): void => {
    it('строкой показана каждая колонка, включая скрытую', (): void => {
        const fixture: ComponentFixture<RtTableSettingsPanelComponent> = setup();

        expect(qaAll(fixture, 'table-settings-label').map((node: DebugElement): string => textOf(node))).toEqual([
            'Договор',
            'Город',
            'Менеджер',
        ]);
    });

    it('скрытая колонка помечена — иначе от показанной она неотличима', (): void => {
        const fixture: ComponentFixture<RtTableSettingsPanelComponent> = setup();

        expect(classesOf(rowOf(fixture, 'manager'))).toContain('rt-table-settings-panel__row--hidden');
        expect(classesOf(rowOf(fixture, 'city'))).not.toContain('rt-table-settings-panel__row--hidden');
    });

    it('закреплённую колонку не перетащить и не спрятать', (): void => {
        const fixture: ComponentFixture<RtTableSettingsPanelComponent> = setup();
        const locked: HTMLElement = rowOf(fixture, 'title');

        expect(locked.querySelector('[qa-dataid="table-settings-drag"]')).toBeNull();
        expect((locked.querySelector('[qa-dataid="table-settings-toggle"] button') as HTMLButtonElement).disabled).toBe(true);
    });

    it('переключатель прячет колонку и возвращает её обратно', (): void => {
        const fixture: ComponentFixture<RtTableSettingsPanelComponent> = setup();
        const toggle: HTMLElement = rowOf(fixture, 'city').querySelector('[qa-dataid="table-settings-toggle"] button') as HTMLElement;

        toggle.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.items().find((item: IRtTable.ColumnSettingItem): boolean => item.key === 'city')?.hidden).toBe(
            true
        );

        (rowOf(fixture, 'city').querySelector('[qa-dataid="table-settings-toggle"] button') as HTMLElement).click();
        fixture.detectChanges();

        expect(fixture.componentInstance.items().find((item: IRtTable.ColumnSettingItem): boolean => item.key === 'city')?.hidden).toBe(
            false
        );
    });

    it('набор колонок наружу отдаётся новым списком, а не правкой прежнего', (): void => {
        // Иначе таблица не заметила бы правки: список у неё тот же самый.
        const fixture: ComponentFixture<RtTableSettingsPanelComponent> = setup();

        (rowOf(fixture, 'city').querySelector('[qa-dataid="table-settings-toggle"] button') as HTMLElement).click();
        fixture.detectChanges();

        expect(fixture.componentInstance.items()).not.toBe(ITEMS);
        expect(ITEMS[1].hidden).toBe(false);
    });

    it('переключатель показанной и скрытой колонки различается значком', (): void => {
        const fixture: ComponentFixture<RtTableSettingsPanelComponent> = setup();
        const shown: Element | null = rowOf(fixture, 'city').querySelector('rt-icon');
        const hidden: Element | null = rowOf(fixture, 'manager').querySelector('rt-icon');

        expect(shown).not.toBeNull();
        expect(hidden).not.toBeNull();
        expect(qa(fixture, 'table-settings-list')).not.toBeNull();
    });
});
